#!/usr/bin/env python3
"""Check frozen FRI-5 evidence integrity, not editorial truth or model quality.

Install scripts/requirements-friday-validation.txt, then run this file.
Use --self-test for deliberately corrupted in-memory records.
"""
from __future__ import annotations

import argparse
import copy
import hashlib
import json
from datetime import datetime
from pathlib import Path
import subprocess

import jsonschema

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / 'docs/friday-evidence/2026-10-04'
SCHEMA = json.loads((ROOT / 'docs/friday-synthesis-evidence.schema.json').read_text())
VALIDATOR = jsonschema.Draft202012Validator(SCHEMA, format_checker=jsonschema.FormatChecker())
WEIGHTS = [20, 20, 15, 15, 10, 10, 10]


def read(path):
    return json.loads(path.read_text())


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def artifact_errors(artifact):
    path = (ROOT / artifact['path']).resolve()
    if not path.is_relative_to(ROOT) or not path.is_file():
        return ['artifact_missing']
    return [] if digest(path) == artifact['sha256'] else ['artifact_digest']


def record_errors(record):
    errors = ['schema: ' + e.message for e in VALIDATOR.iter_errors(record)]
    if errors:
        return errors
    inputs = record['inputs']
    for artifact in [inputs['weekly_packet'], inputs['history_seed'], inputs['synthesis_prompt'], *inputs['daily_v2_outputs']]:
        errors.extend(artifact_errors(artifact))
    if inputs['reviewer_key']:
        errors.extend(artifact_errors(inputs['reviewer_key']))
    packet = read(ROOT / inputs['weekly_packet']['path'])
    known_sources = {s['source_id']: s for s in packet['sources']}
    published = {i['item_id'] for day in packet['daily_shared_record'] for i in day['items']}
    published.update(i['item_id'] for i in packet['history_seed']['items'])
    sources = {s['source_id']: s for s in record['sources']}
    if len(sources) != len(record['sources']):
        errors.append('duplicate_source')
    claim_ids = {c['claim_id'] for c in record['claims']}
    if len(claim_ids) != len(record['claims']):
        errors.append('duplicate_claim')
    for sid, source in sources.items():
        if sid not in known_sources:
            errors.append('unknown_source')
            continue
        if source['publication_time'] != known_sources[sid]['publication_time']:
            errors.append('source_time_mismatch')
        if datetime.fromisoformat(source['publication_time']) > datetime.fromisoformat(record['week']['cutoff']):
            errors.append('after_cutoff_source')
        path, fragment = source['locator'].rsplit('#', 1)
        if fragment != sid or not (ROOT / path).is_file():
            errors.append('source_locator')
        if not set(source['used_for']) <= claim_ids:
            errors.append('unknown_source_usage')
    for claim in record['claims']:
        if not set(claim['source_ids']) <= sources.keys():
            errors.append('unlogged_source')
        if not set(claim['prior_shared_coverage_refs']) <= published:
            errors.append('unpublished_coverage_ref')
        developments = {known_sources[s]['development_id'] for s in claim['source_ids'] if s in known_sources}
        if not set(claim['development_ids']) <= developments:
            errors.append('unknown_development')
        if claim['context_exception'] != 'none' and not (claim['exception_reason'] and claim['new_context_disclosure']):
            errors.append('context_exception_incomplete')
        for sid in claim['source_ids']:
            if sid in sources and claim['claim_id'] not in sources[sid]['used_for']:
                errors.append('source_backreference')
    for group in record['displayed_source_groups']:
        if not set(group['source_ids']) <= sources.keys():
            errors.append('unlogged_display_source')
        if len(group['source_ids']) != len(group['labels']):
            errors.append('source_label_parity')
    points = []
    for score in record['scorecard'].values():
        expected = None if score['rating'] is None else score['weight'] * score['rating'] / 4
        if score['points'] != expected:
            errors.append('score_arithmetic')
        points.append(expected)
    expected_total = sum(points) if all(p is not None for p in points) else None
    if record['total_score'] != expected_total:
        errors.append('score_total')
    output = record['output']
    if output['section_included']:
        if not output['arcs'] or not output['exact_recap'] or output['omission_reason']:
            errors.append('included_shape')
    elif output['arcs'] or output['exact_recap'] or output['opening'] or not output['omission_reason']:
        errors.append('omitted_shape')
    results = [c['result'] for c in record['hard_fail_checks'].values()]
    if 'fail' in results and record['disposition'] != 'fail':
        errors.append('hard_fail_disposition')
    if record['disposition'] == 'pass_candidate':
        if not record['separation']['key_withheld']:
            errors.append('unblinded_pass')
        if any(c != 'clear' for c in results):
            errors.append('unassessed_pass')
    return errors


def fixture_errors(fid):
    directory = BASE / fid
    packet = read(directory / 'packet.json')
    sources = {s['source_id']: s for s in packet['sources']}
    history = {i['item_id'] for i in packet['history_seed']['items']}
    errors = []
    daily = read(directory / 'daily-v2.json')
    if daily['shared_fingerprint'] != WEIGHTS or len(daily['days']) != 5:
        errors.append('daily_contract')
    for day, published_day in zip(daily['days'], packet['daily_shared_record']):
        selected = [c for c in day['candidates'] if c['disposition'] == 'selected']
        ids = {c['candidate_id'] for c in selected}
        if ids != set(day['selected_ids']) or ids != {i['item_id'] for i in published_day['items']}:
            errors.append('publication_mismatch')
        if day['daily_shared_output'] != published_day['items']:
            errors.append('daily_text_mismatch')
        for c in day['candidates']:
            if not set(c['source_ids']) <= sources.keys():
                errors.append('candidate_source')
            if not set(c['prior_coverage_refs']) <= history:
                errors.append('candidate_history')
            if c['components'] is not None:
                values = list(c['components'].values())
                if len(values) != 7 or any(not isinstance(v, int) or not 0 <= v <= cap for v, cap in zip(values, WEIGHTS)):
                    errors.append('v2_component_bounds')
                if sum(values) != c['base_score']:
                    errors.append('v2_sum')
            if c['disposition'] == 'selected':
                if c['base_score'] < 60 or c['material_update'] is False:
                    errors.append('v2_eligibility')
                for sid in c['source_ids']:
                    if datetime.fromisoformat(sources[sid]['publication_time']) > datetime.fromisoformat(day['selection_cutoff']):
                        errors.append('daily_after_cutoff')
        history.update(ids)
    return errors


def self_test():
    seed = read(BASE / 'W031-exploratory-01.json')
    cases = []
    def check(name, mutate, expected):
        record = copy.deepcopy(seed)
        mutate(record)
        found = record_errors(record)
        assert any(expected in issue for issue in found), (name, found)
        cases.append(name)
    check('Tampered input digest', lambda r: r['inputs']['weekly_packet'].update(sha256='0'*64), 'artifact_digest')
    check('Wrong weighted points', lambda r: r['scorecard']['voice_restraint'].update(points=5), 'score_arithmetic')
    check('Wrong total', lambda r: r.update(total_score=99), 'score_total')
    check('Missing logged source', lambda r: r['sources'].pop(), 'unlogged_source')
    check('Unknown prior publication', lambda r: r['claims'][0]['prior_shared_coverage_refs'].append('UNSENT'), 'unpublished_coverage_ref')
    check('Unknown development', lambda r: r['claims'][0]['development_ids'].append('INVENTED'), 'unknown_development')
    check('Unexplained context exception', lambda r: r['claims'][0].update(context_exception='changes_understanding'), 'context_exception_incomplete')
    check('Unblinded high-score pass', lambda r: r.update(disposition='pass_candidate'), 'unblinded_pass')
    check('Hard fail cannot remain incomplete', lambda r: r['hard_fail_checks']['false_pattern'].update(result='fail'), 'hard_fail_disposition')
    check('Omission with residual narrative', lambda r: r['output'].update(section_included=False,omission_reason='test'), 'omitted_shape')
    check('Consolidated source-label mismatch', lambda r: r['displayed_source_groups'][0]['labels'].pop(), 'source_label_parity')
    check('False source timing', lambda r: r['sources'][0].update(publication_time='2026-10-09T12:00:00-05:00'), 'after_cutoff_source')
    return cases


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--self-test', action='store_true')
    parser.add_argument('--output', type=Path)
    args = parser.parse_args()
    jsonschema.Draft202012Validator.check_schema(SCHEMA)
    errors = []
    manifests = ['manifest.json','manifest-v2.json','omission-variant-manifest.json',
                 'challenge-input-manifest.json','resumed-output-manifest.json']
    for name in manifests:
        manifest = read(BASE / name)
        for artifact in manifest['artifacts']:
            errors.extend(f'{name}: {e}' for e in artifact_errors(artifact))
        for spec in manifest.get('specifications', []):
            blob = subprocess.check_output(['git','rev-parse',f"{manifest['baseline_commit']}:{spec['path']}"],cwd=ROOT,text=True).strip()
            content = subprocess.check_output(['git','show',f"{manifest['baseline_commit']}:{spec['path']}"],cwd=ROOT)
            if blob != spec['git_blob'] or hashlib.sha256(content).hexdigest() != spec['sha256']:
                errors.append('pinned_spec_mismatch')
    for fid in ['W031','W075','W118','W032','W076','W077']:
        errors.extend(f'{fid}: {e}' for e in fixture_errors(fid))
    records = sorted([*BASE.glob('*-exploratory-*.json'), *BASE.glob('*-blind-*-evaluation.json')])
    for path in records:
        errors.extend(f'{path.name}: {e}' for e in record_errors(read(path)))
    # Evidence packaging may normalize classifications, never reader-facing prose.
    for path in BASE.glob('*-blind-*-evaluation.json'):
        producer_path = path.with_name(path.name.replace('-evaluation.json', '-output.json'))
        producer, evaluation = read(producer_path), read(path)
        for key in ['section_included','omission_reason','opening','arcs','exact_recap']:
            if producer[key] != evaluation['output'][key]:
                errors.append(f'{path.name}: producer_output_changed:{key}')
    probe_index = read(BASE / 'review-probes/index.json')
    for probe in probe_index['probes']:
        for prefix in ['baseline','probe']:
            errors.extend(f"{probe['probe_id']}: {e}" for e in artifact_errors(
                {'path': probe[f'{prefix}_path'], 'sha256': probe[f'{prefix}_sha256']}))
    probe_results = read(BASE / 'review-probes/independent-results.json')['results']
    expected_probe_ids = {p['probe_id'] for p in probe_index['probes']}
    if {r['probe_id'] for r in probe_results} != expected_probe_ids or len(probe_results) != 4:
        errors.append('probe_result_set')
    for result in probe_results:
        probe_path = BASE / f"review-probes/{result['probe_id']}.json"
        if result['probe_file_sha256'] != digest(probe_path):
            errors.append('probe_evaluation_digest')
        prose_digest = hashlib.sha256(read(probe_path)['exact_recap'].encode()).hexdigest()
        if result['exact_recap_utf8_sha256'] != prose_digest:
            errors.append('probe_evaluation_prose_digest')
        ratings = result['ratings']
        if len(ratings) != 9 or len({r['dimension'] for r in ratings}) != 9:
            errors.append('probe_rating_set')
        if any(r['weighted_points'] != r['weight'] * r['rating'] / 4 for r in ratings):
            errors.append('probe_score_arithmetic')
        if result['weighted_total'] != sum(r['weighted_points'] for r in ratings):
            errors.append('probe_score_total')
        if len(result['hard_checks']) != 6:
            errors.append('probe_hard_check_set')
        if any(c['status'] == 'fail' for c in result['hard_checks'].values()) and result['provisional_disposition'] != 'fail':
            errors.append('probe_hard_fail_disposition')
    tests = self_test() if args.self_test else []
    report = {'schema':'Draft 2020-12 validated','active_base_fixtures':3,'omission_variant_fixtures':1,'additional_input_variants':2,'base_daily_outputs':15,'evaluation_records_checked':len(records),'controlled_probe_digests_checked':len(probe_index['probes']),'integrity_errors':errors,'negative_integrity_checks':tests,'editorial_promotion_passes':0,'limitations':'These checks validate evidence consistency and unchanged producer prose. They do not assess prose truth, inference or independent role separation. Editorial failures remain preserved; candidate scores are not promotion approval.'}
    if args.output:
        args.output.write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps(report,indent=2))
    return 1 if errors else 0


if __name__ == '__main__':
    raise SystemExit(main())

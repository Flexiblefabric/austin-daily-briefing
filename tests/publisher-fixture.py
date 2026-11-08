"""Generate synthetic publisher vectors; never imports production subscriber data."""
import copy
import json
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from test_selection_notes import candidate, slate, source
from validate_selection_notes import encode_note, validate

root = Path(__file__).resolve().parents[1]
editorial = json.loads((root / 'tests/fixtures/daily-newsletter-example.json').read_text())
editorial.update(date='2026-10-07')
editorial.pop('underTheRadar')
editorial['footer']['manageUrl'] = 'https://example.org/manage'
run = '2026-10-07-publisher-v1'
bindings, rows, top, mfy = [], [], [], []
groups = [('Featured Top Story', [editorial['featured']], 'top'),
          ('Top Story', editorial['topStories'], 'top'),
          ('More for You', editorial['moreForYou'], 'mfy'),
          ('Austin Ahead', editorial['austinAhead'], 'utility')]
for section, items, lane in groups:
    for index, item in enumerate(items):
        key = f'fixture-{len(rows)}'
        c = candidate(key, lane)
        urls = [s['url'] for s in item['sources']] if 'sources' in item else [item['url']]
        c['sources'] = [{**source(), 'url': url} for url in urls]
        if lane == 'utility':
            c.update(scores=None, total=None)
        if lane == 'top':
            top.append(copy.deepcopy(c))
        if lane == 'mfy':
            mfy.append(copy.deepcopy(c))
        note = dict(schema='ADB-SELECTION-NOTE-1', production_spec='ADB-DAILY-PROD-2.0',
                    selection_spec='ADB-V2-SELECT-1.0', run_id=run,
                    cutoff='2026-10-07T08:00:00-05:00', candidate=c)
        bindings.append(dict(section=section, index=index, key=key, category='Synthetic QA'))
        rows.append(dict(profile_id='SYNTHETIC', section=section, key=key,
                         material_update=False, source_url=urls[0], notes=encode_note(note)))
context = dict(volume='Standard', shared_weights=[20,20,15,15,10,10,10],
               mfy_weights=[25,25,20,10,10,10], history_window_start='2026-09-23',
               top=slate(top, len(top)), mfy=slate(mfy, len(mfy)), rejected=[],
               utr_search=dict(independent=True, outcome='none_qualified',
                               reason='Synthetic search found no consequential overlooked development.',
                               checks=[dict(query_or_path='Synthetic agenda review',
                                            finding='Only procedural approvals in this fixture.', source=source())]))
note = json.loads(rows[0]['notes'].split(' ', 1)[1])
note['context'] = context
rows[0]['notes'] = encode_note(note)
bundle = dict(run_id=run, cutoff='2026-10-07T08:00:00-05:00', history_complete=True,
              history_window_start='2026-09-23', published_history=[],
              profiles={'SYNTHETIC': dict(volume='Standard', summary_style='Standard', why_it_matters_length='Standard', preferences={'TEST_INTEREST':'Normal'})}, rows=rows)
validate(bundle)
package = dict(schema='ADB-EDITORIAL-HANDOFF-1', edition_date='2026-10-07',
               source_revision='57f028105dd9450b95c519ee33ef8d3382c98b77', expected_profile_count=1,
               editions=[dict(profile_id='SYNTHETIC', editorial=editorial, bindings=bindings)], selection_bundle=bundle)
if __name__ == '__main__':
    print(json.dumps(package))

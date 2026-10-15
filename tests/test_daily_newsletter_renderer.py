#!/usr/bin/env python3
"""Controlled non-network regression tests for the structured email renderer."""
import copy
import json
import pathlib
import subprocess
import tempfile
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]
BASE = json.loads((ROOT / 'tests/fixtures/daily-newsletter-example.json').read_text())
SCRIPT = ROOT / 'scripts/render_daily_newsletter.py'


def run_case(data):
    with tempfile.TemporaryDirectory() as tmp:
        base = pathlib.Path(tmp)
        inp, out_html, out_text = base / 'data.json', base / 'out.html', base / 'out.txt'
        inp.write_text(json.dumps(data), encoding='utf-8')
        r = subprocess.run(['python3', str(SCRIPT), str(inp), str(out_html), str(out_text)],
                           text=True, capture_output=True)
        html = out_html.read_text(encoding='utf-8') if out_html.exists() else ''
        plain = out_text.read_text(encoding='utf-8') if out_text.exists() else ''
        return r, html, plain


class RendererQA(unittest.TestCase):
    def test_full_reference_shaped_edition(self):
        result, html, plain = run_case(BASE)
        self.assertEqual(result.returncode, 0, result.stderr)
        for section in ('AUSTIN PULSE', 'WEATHER', 'FEATURED TOP STORY',
                        'TOP STORIES', 'UNDER THE RADAR', 'MORE FOR YOU', 'AUSTIN AHEAD'):
            self.assertIn(section, html)
        self.assertEqual(html.count('adb-masthead@2x.png'), 1)
        self.assertEqual(html.count('adb-mark-reversed@2x.png'), 1)
        self.assertIn('ADB-DAILY-HTML-1.0', result.stdout)

    def test_optional_sections_can_be_omitted(self):
        edition = copy.deepcopy(BASE)
        edition.pop('underTheRadar', None)
        edition['moreForYou'] = []
        edition['austinAhead'] = []
        result, html, plain = run_case(edition)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertNotIn('>UNDER THE RADAR<', html)
        self.assertNotIn('>MORE FOR YOU<', html)
        self.assertIn('No major Austin Ahead items to flag today.', plain)

    def test_special_characters_are_escaped(self):
        edition = copy.deepcopy(BASE)
        edition['featured']['headline'] = '<script>alert("x")</script> & a real headline'
        result, html, plain = run_case(edition)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertNotIn('<script>alert', html)
        self.assertIn('&lt;script&gt;', html)
        self.assertIn('<script>alert', plain)

    def test_missing_required_source_stops_before_acceptance(self):
        edition = copy.deepcopy(BASE)
        edition['featured']['sources'] = []
        result, html, plain = run_case(edition)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('cannot have zero sources', result.stderr)

    def test_null_required_field_does_not_render_as_none(self):
        edition = copy.deepcopy(BASE)
        edition['featured']['headline'] = None
        result, html, plain = run_case(edition)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('Required nonempty text field: headline', result.stderr)

    def test_insecure_url_is_rejected(self):
        edition = copy.deepcopy(BASE)
        edition['featured']['sources'][0]['url'] = 'http://example.invalid/story'
        result, html, plain = run_case(edition)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('Expected an HTTPS URL', result.stderr)

    def test_bad_austin_ahead_action_is_rejected(self):
        edition = copy.deepcopy(BASE)
        edition['austinAhead'][0]['action'] = 'ALERT'
        result, html, plain = run_case(edition)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('exactly GO, WATCH or PLAN', result.stderr)

    def test_friday_recap_only_when_friday_with_sources(self):
        edition = copy.deepcopy(BASE)
        edition['fridayRecap'] = [{'text': 'Synthetic Friday recap item.',
                                   'sources': [{'publisher': 'Austin Monitor',
                                                'url': 'https://www.austinmonitor.com/'}]}]
        result, html, plain = run_case(edition)
        self.assertNotEqual(result.returncode, 0, 'Wednesday must reject Friday recap')
        edition['date'] = '2026-10-16'
        result, html, plain = run_case(edition)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn('THIS WEEK IN AUSTIN', html)
        self.assertIn('Source: Austin Monitor', plain)

    def test_correction_follows_pulse_not_austin_ahead(self):
        edition = copy.deepcopy(BASE)
        edition['correction'] = 'A synthetic clarification of a previous item.'
        result, html, plain = run_case(edition)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertLess(html.index('>AUSTIN PULSE<'),
                        html.index('>CORRECTION / CLARIFICATION<'))
        self.assertLess(html.index('>CORRECTION / CLARIFICATION<'), html.index('>WEATHER<'))

    def test_no_stale_example_content_leak(self):
        edition = copy.deepcopy(BASE)
        edition['featured']['headline'] = 'Chosen headline from independently sourced material'
        result, html, plain = run_case(edition)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertNotIn('Sample city budget decision', html)


if __name__ == '__main__':
    unittest.main()

"""Build a review-only standalone source; never include publication entry points."""
from pathlib import Path
import datetime as dt
import json
import re
from zoneinfo import ZoneInfo
root=Path(__file__).resolve().parents[1]
config=json.loads((root/'docs/editorial-publisher-dev-review-config.json').read_text())
edition=dt.date.fromisoformat(config['edition'])
assert edition.isoformat()==config['edition']
files=['scripts/daily_newsletter_renderer.js','apps-script/DailyNewsletterContract.gs',
       'apps-script/SelectionEvidenceContract.gs','apps-script/EditorialPublisher.gs',
       'apps-script/EditorialPublisherDevWorkflow.gs','apps-script/EditorialPublisherDevHandoff.gs',
       'apps-script/EditorialPublisherDevReviewHost.gs','apps-script/EditorialPublisherDevReviewSetup.gs']
parts=['// GENERATED DEV REVIEW ONLY. No configured files, publication or delivery.\n']
for name in files:
    source=(root/name).read_text()
    if name.endswith('/EditorialPublisher.gs'):
        marker='/** Reads immutable SHA-bound package chunks'
        assert source.count(marker)==1
        source=source.split(marker)[0]
        assert 'function publishReadyEditorialPackageDevV1' not in source
    parts.append('// Source: '+name+'\n'+source)
original=(root/'tests/fixtures/editorial-publisher-e2e.json').read_text()
base=json.loads(original)
delta=edition-dt.date.fromisoformat(base['edition_date'])
# Shift all synthetic evidence, including JSON-encoded selection notes. Correct
# local timestamp offsets for the new date (the November fixture crosses DST).
shifted=re.sub(r'2026-\d{2}-\d{2}',lambda m:(dt.date.fromisoformat(m[0])+delta).isoformat(),original)
shifted=re.sub(r'(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})[+-]\d{2}:\d{2}',
    lambda m:dt.datetime.fromisoformat(m[1]).replace(tzinfo=ZoneInfo('America/Chicago')).isoformat(),shifted)
seed=json.loads(shifted)
assert seed['edition_date']==config['edition']
parts.append('const ADB_DEV_REVIEW_SEED_JSON = '+json.dumps(json.dumps(seed,ensure_ascii=False,separators=(',',':')),ensure_ascii=False)+';\n')
(root/'apps-script/EditorialPublisherDevReviewBundle.gs').write_text('\n'.join(parts))

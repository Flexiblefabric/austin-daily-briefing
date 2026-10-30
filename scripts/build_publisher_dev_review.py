"""Build a review-only standalone source; never include publication entry points."""
from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
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
seed=json.loads((root/'tests/fixtures/editorial-publisher-e2e.json').read_text())
parts.append('const ADB_DEV_REVIEW_SEED_JSON = '+json.dumps(json.dumps(seed,ensure_ascii=False,separators=(',',':')),ensure_ascii=False)+';\n')
(root/'apps-script/EditorialPublisherDevReviewBundle.gs').write_text('\n'.join(parts))

"""Build a manual DEV add-on; depend on the existing review bundle, no duplicates."""
from pathlib import Path
import re
root=Path(__file__).resolve().parents[1]
monitor=(root/'apps-script/EditorialPublisherDevMonitor.gs').read_text().split('function adbDevMonitorOpen_')[0]
# Pure monitor helpers do not need the old single-workbook target or config.
monitor=re.sub(r"  DATABASE:'[^']+',\n",'',monitor,count=1)
a=monitor.index('/** Fixed namespaces')
b=monitor.index('/** Validate the persisted checkpoint')
monitor=monitor[:a]+monitor[b:]
integration=(root/'apps-script/EditorialPublisherDevIntegration.gs').read_text()
coordinator=integration[integration.index('/** Coordinator test boundary.'):integration.index('/** Explicit opt-in only.')]
source=(root/'apps-script/EditorialPublisherDevSealedPublication.gs').read_text()
(root/'apps-script/EditorialPublisherDevPublicationBundle.gs').write_text(
    '// GENERATED manual DEV publication add-on. Install alongside the review bundle.\n'+monitor+'\n'+coordinator+'\n'+source)

review=(root/'apps-script/EditorialPublisherDevReviewBundle.gs').read_text()
addon=(root/'apps-script/EditorialPublisherDevPublicationBundle.gs').read_text()
(root/'apps-script/EditorialPublisherDevOperatorBundle.gs').write_text(
    '// GENERATED combined DEV operator source. Replace Code.gs; do not add duplicate modules.\n'+review+'\n'+addon)

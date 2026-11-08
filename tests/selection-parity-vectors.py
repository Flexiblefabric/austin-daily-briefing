"""Capture the established Python regression vectors for JS gate comparison."""
import io
import json
from pathlib import Path
import sys
import unittest
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
import test_selection_notes as cases
from validate_selection_notes import validate as original
vectors = []
def capture(bundle):
    try:
        result = original(bundle)
    except Exception:
        vectors.append({'valid':False,'bundle':json.loads(json.dumps(bundle))})
        raise
    vectors.append({'valid':True,'bundle':json.loads(json.dumps(bundle))})
    return result
cases.validate = capture
suite = unittest.defaultTestLoader.loadTestsFromTestCase(cases.SelectionNotesTests)
result = unittest.TextTestRunner(stream=io.StringIO()).run(suite)
assert result.wasSuccessful()
def has_float(v):
    if isinstance(v, float): return True
    if isinstance(v, dict): return any(has_float(x) for x in v.values())
    if isinstance(v, list): return any(has_float(x) for x in v)
    return False
out = []
for v in vectors:
    b = v['bundle']
    notes = []
    try:
        notes = [json.loads(r['notes'].split(' ',1)[1]) for r in b['rows']]
    except Exception:
        # JSON-only handoff deliberately rejects transport suffixes; compared separately.
        continue
    # JS has one Number type; JSON Schema integer is mathematical integer.
    if has_float(notes): continue
    out.append(v)
print(json.dumps(out))

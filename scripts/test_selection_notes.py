"""Synthetic regression cases; contains no production profile or delivery data."""
import copy
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

from validate_selection_notes import encode_note, decode_note, validate, Invalid

CUTOFF = "2026-10-07T08:00:00-05:00"


def source():
    return {"url": "https://example.org/record", "access": "read",
            "accessed_at": "2026-10-07T07:30:00-05:00",
            "published_at": "2026-10-06T15:00:00-05:00", "locator": "Page 2, decision paragraph"}


def candidate(key="a", lane="mfy", scores=None):
    scores = scores or ([20, 22, 16, 8, 8, 6] if lane == "mfy" else [16, 16, 12, 12, 8, 8, 8])
    c = {"key": key, "topic": key, "lane": lane, "fact": "A newly published decision adds a service.",
         "procedural_status": "adopted", "placement_reason": "A concrete decision readers can act on.",
         "event_timing": "completed", "sources": [source()],
         "gates": {"source": True, "fit": True, "repeat": True, "section": True},
         "history": {"key_checked": True, "topic_checked": True,
                     "search_reason": "Searched aliases and prior service coverage in delivered history.",
                     "material_update": False, "prior": []},
         "scores": scores, "total": sum(scores),
         "score_reasons": ["The source establishes a specific benefit for this component."] * len(scores)}
    if lane == "mfy":
        c["fit"] = {"interest_id": "TEST_INTEREST", "saved_preference": "Normal", "match": "direct_normal",
                    "source_feature": "A usable service guide with concrete instructions.",
                    "reader_payoff": "Readers can use the service immediately.",
                    "catalog_scope": "Synthetic enabled interest scope.", "off_topic_relabel": False}
    return c


def slate(candidates, slots):
    return {"complete_eligible_pool": True, "ranked": candidates, "slots": slots,
            "capacity_reason": "Standard volume; only useful eligible items included.",
            "control_status": "none", "decisions": []}


def fixture():
    c = candidate()
    context = {"volume": "Standard", "shared_weights": [20, 20, 15, 15, 10, 10, 10],
               "mfy_weights": [25, 25, 20, 10, 10, 10], "history_window_start": "2026-09-23",
               "top": slate([], 0), "mfy": slate([copy.deepcopy(c)], 1), "rejected": [],
               "utr_search": {"independent": True, "outcome": "none_qualified",
                              "reason": "Reviewed agenda has no consequential overlooked development.",
                              "checks": [{"query_or_path": "Commission agenda and supporting records",
                                          "finding": "Only procedural approvals; no substantive discovery.",
                                          "source": source()}]}}
    note = {"schema": "ADB-SELECTION-NOTE-1", "production_spec": "ADB-DAILY-PROD-2.0",
            "selection_spec": "ADB-V2-SELECT-1.0", "run_id": "SYNTHETIC-RUN", "cutoff": CUTOFF,
            "candidate": c, "context": context}
    bundle = {"run_id": "SYNTHETIC-RUN", "cutoff": CUTOFF, "history_complete": True,
              "history_window_start": "2026-09-23", "published_history": [],
              "profiles": {"SYNTHETIC": {"volume": "Standard", "preferences": {"TEST_INTEREST": "Normal"}}},
              "rows": [{"profile_id": "SYNTHETIC", "section": "More for You", "key": "a",
                        "material_update": False, "source_url": source()["url"], "notes": encode_note(note)}]}
    return bundle, note


def update(bundle, note):
    bundle["rows"][0]["notes"] = encode_note(note)
    return bundle


def sync_candidate(note):
    note["context"]["mfy"]["ranked"][0] = copy.deepcopy(note["candidate"])


class SelectionNotesTests(unittest.TestCase):
    def reject(self, bundle, note):
        with self.assertRaises((Invalid, ValueError, KeyError, TypeError)):
            validate(update(bundle, note))

    def test_valid_and_transport_suffix(self):
        b, n = fixture()
        self.assertEqual(validate(b), 1)
        b["rows"][0]["notes"] += " Awaiting Resend delivery. | Resend accepted at test timestamp."
        self.assertEqual(validate(b), 1)

    def test_missing_and_duplicate_context(self):
        b, n = fixture()
        del n["context"]
        self.reject(b, n)
        b, n = fixture()
        b["rows"].append(copy.deepcopy(b["rows"][0]))
        self.reject(b, n)

    def test_actual_october_6_drift_pattern(self):
        for relevance in (21, 22, 23):
            with self.subTest(relevance=relevance):
                b, n = fixture()
                n["candidate"]["scores"][0] = relevance
                n["candidate"]["total"] = sum(n["candidate"]["scores"])
                sync_candidate(n)
                self.reject(b, n)

    def test_high_cannot_be_claimed_for_normal(self):
        b, n = fixture()
        n["candidate"]["fit"].update(match="direct_high", saved_preference="High")
        n["candidate"]["scores"][0] = 23
        n["candidate"]["total"] = sum(n["candidate"]["scores"])
        sync_candidate(n)
        self.reject(b, n)

    def test_valid_high_and_adjacency_bands(self):
        for match, pref, score in (("direct_high", "High", 25), ("strong_adjacency", "High", 20),
                                   ("narrow_adjacency", "Normal", 15)):
            b, n = fixture()
            b["profiles"]["SYNTHETIC"]["preferences"]["TEST_INTEREST"] = pref
            n["candidate"]["fit"].update(match=match, saved_preference=pref)
            n["candidate"]["scores"][0] = score
            n["candidate"]["total"] = sum(n["candidate"]["scores"])
            sync_candidate(n)
            self.assertEqual(validate(update(b, n)), 1)

    def test_off_missing_and_false_fit(self):
        for pref in ("Off", None):
            b, n = fixture()
            b["profiles"]["SYNTHETIC"]["preferences"]["TEST_INTEREST"] = pref
            self.reject(b, n)
        b, n = fixture()
        n["candidate"]["fit"]["off_topic_relabel"] = True
        self.reject(b, n)

    def test_score_contract(self):
        for scores in ([20, 14, 20, 10, 10, 10], [20, 25, 20, 10, 4, 10],
                       [20, 15, 10, 4, 5, 5], [20.0, 22, 16, 8, 8, 6],
                       [True, 22, 16, 8, 8, 6], [20, 22, 16, 11, 8, 6], [20, 22]):
            b, n = fixture()
            n["candidate"].update(scores=scores, total=sum(scores))
            sync_candidate(n)
            self.reject(b, n)
        b, n = fixture()
        n["candidate"]["total"] += 1
        self.reject(b, n)

    def test_exact_floor(self):
        b, n = fixture()
        n["candidate"].update(scores=[20, 15, 10, 4, 5, 6], total=60)
        sync_candidate(n)
        self.assertEqual(validate(update(b, n)), 1)

    def repeat(self):
        b, n = fixture()
        prior = {"key": "prior-a", "date": "2026-10-04", "facts": "Council announced a future briefing."}
        b["published_history"] = [{**prior, "topic": "a", "lane": "mfy", "profile_id": "SYNTHETIC",
                                   "delivered": True}]
        change = {"before": prior["facts"], "after": "A new filing commits to a specific independent review.",
                  "incremental_value": "The new review commitment changes accountability safeguards.",
                  "locator": "Page 4, oversight commitment", "basis": "new_document_facts",
                  "calendar_only": False, "source_url": source()["url"],
                  "verified_at": "2026-10-07T07:40:00-05:00"}
        n["candidate"]["history"].update(prior=[prior], material_update=True, change=change)
        b["rows"][0]["material_update"] = True
        sync_candidate(n)
        return b, n

    def test_precise_material_change(self):
        b, n = self.repeat()
        self.assertEqual(validate(update(b, n)), 1)

    def test_vague_repeat_or_calendar_change(self):
        for field, value in (("after", "material update"), ("after", "Council announced a future briefing."),
                             ("calendar_only", True), ("basis", "calendar_advanced"),
                             ("before", "Unrecorded prior fact"), ("locator", "")):
            b, n = self.repeat()
            n["candidate"]["history"]["change"][field] = value
            sync_candidate(n)
            self.reject(b, n)

    def test_repeat_cannot_hide_behind_new_key(self):
        b, n = self.repeat()
        n["candidate"]["history"].update(prior=[], material_update=False)
        b["rows"][0]["material_update"] = False
        sync_candidate(n)
        self.reject(b, n)

    def test_evergreen_unknown_history(self):
        b, n = fixture()
        n["candidate"]["evergreen"] = True
        sync_candidate(n)
        self.reject(b, n)

    def displaced(self, control="variety", drop=5, value_drop=3):
        b, n = fixture()
        old = copy.deepcopy(n["candidate"])
        new = candidate("b", scores=[20, 22-value_drop, 16-(drop-value_drop), 8, 8, 6])
        n["context"]["mfy"] = slate([old, copy.deepcopy(new)], 1)
        n["context"]["mfy"].update(control_status="applied", decisions=[{
            "control": control, "displaced": "a", "replacement": "b", "score_drop": drop,
            "reader_value_drop": value_drop, "reason": "Adds a distinct usable resource to the selection."}])
        n["candidate"] = new
        b["rows"][0]["key"] = "b"
        return b, n

    def test_displacement_boundaries(self):
        for control, drop, value, valid in (("variety", 5, 3, True), ("variety", 6, 3, False),
                                           ("discovery", 10, 3, True), ("discovery", 11, 3, False),
                                           ("discovery", 5, 4, False)):
            b, n = self.displaced(control, drop, value)
            if valid:
                self.assertEqual(validate(update(b, n)), 1)
            else:
                self.reject(b, n)

    def test_preserve_original_scores_and_no_chain_swaps(self):
        b, n = self.displaced()
        n["candidate"]["scores"][5] += 1
        n["candidate"]["total"] += 1
        self.reject(b, n)
        b, n = self.displaced()
        n["context"]["mfy"]["decisions"].append({"control": "variety", "displaced": "b",
            "replacement": "a", "reason": "A second swap must not use an already replaced candidate."})
        self.reject(b, n)

    def test_second_discovery_rejected(self):
        b, n = self.displaced("discovery")
        s = n["context"]["mfy"]
        c = candidate("c")
        d = candidate("d", scores=[20, 19, 14, 8, 8, 6])
        s["ranked"] = [s["ranked"][0], c, s["ranked"][1], d]
        s["slots"] = 2
        s["decisions"].append({"control": "discovery", "displaced": "c", "replacement": "d",
                              "reason": "Another discovery benefit.", "score_drop": 5, "reader_value_drop": 3})
        self.reject(b, n)

    def utr(self):
        b, n = fixture()
        c = candidate("u", "utr")
        c["discovery"] = {"overlooked_fact": "A supporting document contains a previously unreported service limit.",
                          "prominence_evidence": "Checked local coverage and agenda summary; only supporting page 4 names the limit.",
                          "placement_reason": "Consequential for affected residents, with limited broader impact.",
                          "search_check": 0, "narrow_scope_only": False, "rejected_headline_only": False}
        n["context"]["utr_search"].update(outcome="selected", reason="The supporting document reveals a service limit.")
        extra = copy.deepcopy(n)
        extra.pop("context")
        extra["candidate"] = c
        b["rows"].append({"profile_id": "SYNTHETIC", "section": "Under the Radar", "key": "u",
                          "material_update": False, "source_url": source()["url"], "notes": encode_note(extra)})
        return b, n, extra

    def test_utr_evidence_and_absence(self):
        b, n, extra = self.utr()
        self.assertEqual(validate(update(b, n)), 2)
        for field in ("prominence_evidence", "overlooked_fact", "placement_reason"):
            b, n, extra = self.utr()
            del extra["candidate"]["discovery"][field]
            b["rows"][1]["notes"] = encode_note(extra)
            self.reject(b, n)
        b, n = fixture()
        n["context"]["utr_search"]["checks"] = []
        self.reject(b, n)

    def test_cutoff_source_history_and_weight_failures(self):
        for mutate in (
            lambda b,n: n["candidate"]["sources"][0].update(access="unread"),
            lambda b,n: n["candidate"]["sources"][0].update(published_at="2026-10-07T09:00:00-05:00"),
            lambda b,n: b.update(history_complete=False),
            lambda b,n: b.update(history_window_start="2026-10-01"),
            lambda b,n: n["context"].update(mfy_weights=[20, 20, 20, 20, 10, 10]),
            lambda b,n: n["context"]["mfy"].update(control_status="applied"),
        ):
            b, n = fixture()
            mutate(b, n)
            self.reject(b, n)

    def test_cli_does_not_echo_private_malformed_input(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "private.json"
            path.write_text('{"SECRET_TEST_VALUE": invalid}')
            result = subprocess.run([sys.executable, str(Path(__file__).with_name("validate_selection_notes.py")),
                                     str(path)], capture_output=True, text=True)
            self.assertEqual(result.returncode, 1)
            self.assertNotIn("SECRET_TEST_VALUE", result.stderr)

    def test_shared_balance_has_no_mfy_five_point_limit(self):
        b, n = fixture()
        old = candidate("shared-a", "top", [20, 20, 15, 15, 10, 10, 10])
        new = candidate("shared-b", "top")
        n["context"]["top"] = slate([old, copy.deepcopy(new)], 1)
        n["context"]["top"].update(control_status="applied", decisions=[{
            "control": "selection_balance", "displaced": "shared-a", "replacement": "shared-b",
            "reason": "The baseline repeats the same underlying meeting development."}])
        extra = copy.deepcopy(n)
        extra.pop("context")
        extra["candidate"] = new
        b["rows"].append({"profile_id": "SYNTHETIC", "section": "Top Story", "key": "shared-b",
                          "material_update": False, "source_url": source()["url"], "notes": encode_note(extra)})
        self.assertEqual(validate(update(b, n)), 2)

    def test_freshness_veto_preserves_score_and_leaves_slot_empty(self):
        b, n = self.repeat()
        n["context"]["mfy"].update(control_status="applied", decisions=[{
            "control": "freshness_veto", "displaced": "a", "replacement": None,
            "reason": "The verified incremental change offers too little additional reader value."}])
        utility = candidate("upcoming", "utility")
        utility.update(scores=None, total=None)
        n["candidate"] = utility
        b["rows"][0].update(section="Austin Ahead", key="upcoming", material_update=False)
        self.assertEqual(validate(update(b, n)), 1)

    def test_utility_repeat_does_not_claim_material_change(self):
        b, n = self.repeat()
        n["candidate"].update(lane="utility", scores=None, total=None)
        n["candidate"]["history"].update(material_update=False, repeat_utility="Attendance details remain useful before the event.")
        n["context"]["mfy"] = slate([], 0)
        b["rows"][0].update(section="Austin Ahead", material_update=False)
        self.assertEqual(validate(update(b, n)), 1)

    def test_unrecorded_selection_and_rejected_selected_conflict(self):
        b, n = self.displaced()
        n["context"]["mfy"].update(decisions=[], control_status="none")
        self.reject(b, n)
        b, n = fixture()
        n["context"]["rejected"] = [{"key": "a", "topic": "a", "lane": "mfy",
                                     "failed_gate": "fit", "reason": "Unsupported category match."}]
        self.reject(b, n)

    def test_note_size_duplicate_envelope_and_parse_roundtrip(self):
        b, n = fixture()
        self.assertEqual(decode_note(encode_note(n)), n)
        b["rows"][0]["notes"] = encode_note(n) + "x" * 45000
        with self.assertRaises(Invalid):
            validate(b)
        b["rows"][0]["notes"] = encode_note(n) + encode_note(n)
        with self.assertRaises(Invalid):
            validate(b)


if __name__ == "__main__":
    unittest.main()

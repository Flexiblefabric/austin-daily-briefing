"""Read-only pre-queue checks for ADB structured history Notes (stdlib only).

Input contains private, transient production snapshots: never commit a real bundle.
The validator checks recorded evidence, not whether source claims are true.
"""
import argparse
from datetime import date, datetime, timedelta
import json
from pathlib import Path
import sys
from urllib.parse import urlsplit
from zoneinfo import ZoneInfo

PREFIX = "ADB-SELECTION-NOTE-1 "
SHARED = [20, 20, 15, 15, 10, 10, 10]
MFY = [25, 25, 20, 10, 10, 10]
SECTIONS = {"Featured Top Story": "top", "Top Story": "top",
            "Under the Radar": "utr", "More for You": "mfy",
            "Austin Ahead": "utility", "This Week in Austin": "utility",
            "What's New": "utility"}


class Invalid(ValueError):
    pass


def require(condition, message):
    if not condition:
        raise Invalid(message)


def text(value):
    return isinstance(value, str) and bool(value.strip())


def meaningful(value):
    return text(value) and value.strip().lower() not in {
        "pass", "true", "unknown", "n/a", "none", "material update",
        "new information", "material update after prior coverage", "no prior normalized key"}


def url(value):
    if not isinstance(value, str):
        return False
    parsed = urlsplit(value)
    return parsed.scheme in {"https", "http"} and bool(parsed.netloc) and not parsed.username


def stamp(value):
    require(isinstance(value, str), "timestamp must be an ISO string")
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError as exc:
        raise Invalid("invalid timestamp") from exc
    require(parsed.utcoffset() is not None, "timestamp must include UTC offset")
    return parsed


def encode_note(note):
    return PREFIX + json.dumps(note, ensure_ascii=False, separators=(",", ":"))


def decode_note(value):
    require(isinstance(value, str) and value.startswith(PREFIX), "missing structured note prefix")
    require(len(value) < 45000, "Notes exceeds 45,000-character safety bound")
    parsed, end = json.JSONDecoder().raw_decode(value[len(PREFIX):])
    # Existing transport appends delivery prose after the JSON object. Do not
    # parse that prose as editorial evidence or allow another editorial envelope.
    require(PREFIX not in value[len(PREFIX) + end:], "multiple editorial envelopes")
    require(isinstance(parsed, dict), "note must contain an object")
    return parsed


def check_source(source, cutoff):
    require(isinstance(source, dict) and url(source.get("url")), "source URL required")
    require(source.get("access") == "read", "source must have been read")
    require(stamp(source.get("accessed_at")) <= cutoff, "source access is after cutoff")
    require(meaningful(source.get("locator")), "source passage/page locator required")
    if source.get("published_at") is not None:
        require(stamp(source["published_at"]) <= cutoff, "publication is after cutoff")
    else:
        require(meaningful(source.get("timestamp_note")), "unknown publication time needs a note")


def check_candidate(c, lane, preferences, history, profile, cutoff, window_start):
    require(isinstance(c, dict), "candidate must be an object")
    for field in ("key", "topic", "fact", "procedural_status", "placement_reason"):
        require(meaningful(c.get(field)), "candidate missing " + field)
    require(c.get("lane") == lane, "candidate lane mismatch")
    require(c.get("event_timing") in {"upcoming", "today", "completed", "not_applicable"},
            "event timing must be separate and explicit")
    require(c.get("sources"), "candidate has no source evidence")
    for source in c["sources"]:
        check_source(source, cutoff)
    require(isinstance(c.get("gates"), dict) and set(c["gates"]) == {"source", "fit", "repeat", "section"}
            and all(v is True for v in c["gates"].values()),
            "candidate eligibility gate failed or missing")
    h = c.get("history", {})
    require(h.get("key_checked") is True and h.get("topic_checked") is True,
            "both key and topic history checks required")
    require(meaningful(h.get("search_reason")), "history search evidence required")
    require(type(h.get("material_update")) is bool, "material-update boolean required")
    applicable = [r for r in history if r.get("delivered") is True
                  and ((lane == "mfy" and r.get("lane") == "mfy" and r.get("profile_id") == profile)
                       or (lane in {"top", "utr"} and r.get("lane") in {"top", "utr"})
                       or (lane == "utility" and r.get("profile_id") == profile))
                  and (r.get("key") == c["key"] or r.get("topic") == c["topic"])
                  and (r["date"] >= window_start or c.get("evergreen") is True)]
    prior = h.get("prior", [])
    require(isinstance(prior, list), "history prior must be an array")
    for r in applicable:
        require(any(p.get("key") == r["key"] and p.get("date") == r["date"] for p in prior),
                "known published repeat missing from candidate history")
    for p in prior:
        require(any(r.get("delivered") is True and r.get("key") == p.get("key")
                    and r.get("date") == p.get("date") and r.get("facts") == p.get("facts")
                    for r in applicable), "prior fact is not bound to applicable published history")
    if c.get("evergreen") is True:
        require(h.get("resource_history_known") is True,
                "evergreen resource history must be established beyond the default window")
    if prior and lane != "utility":
        require(h["material_update"] is True, "unchanged ranked-news repeat")
        change = h.get("change", {})
        for field in ("before", "after", "incremental_value", "locator"):
            require(meaningful(change.get(field)), "repeat change missing " + field)
        require(change["before"] in [p["facts"] for p in prior], "before fact must match prior coverage")
        require(change["before"].strip().casefold() != change["after"].strip().casefold(),
                "repeat has no changed fact")
        require(change.get("basis") in {"vote", "ruling", "funding", "lawsuit", "construction_phase",
                "cancellation", "opening_closure", "new_data", "hearing_outcome", "changed_deadline",
                "new_document_facts", "new_capability", "other_substantive"}, "invalid material-change basis")
        require(change.get("calendar_only") is False, "calendar-only update cannot qualify")
        require(change.get("source_url") in [s["url"] for s in c["sources"]], "change source missing")
        require(stamp(change.get("verified_at")) <= cutoff, "change verified after cutoff")
    elif prior:
        require(meaningful(h.get("repeat_utility")), "utility repeat needs a distinct utility reason")
        require(h["material_update"] is False, "utility reminder must not claim material news change")
    else:
        require(h["material_update"] is False, "material update requires recorded prior coverage")
    if lane == "utility":
        require(c.get("scores") is None and c.get("total") is None, "utility must not use ranked-news scores")
        return
    maxima = MFY if lane == "mfy" else SHARED
    parts = c.get("scores")
    require(isinstance(parts, list) and len(parts) == len(maxima), "score vector length mismatch")
    require(all(type(v) is int and 0 <= v <= cap for v, cap in zip(parts, maxima)),
            "scores must be whole numbers within component maxima")
    require(type(c.get("total")) is int and c["total"] == sum(parts), "incorrect score sum")
    require(c["total"] >= 60, "total below 60")
    reasons = c.get("score_reasons")
    require(isinstance(reasons, list) and len(reasons) == len(parts) and all(meaningful(r) for r in reasons),
            "each component requires a fact-based reason")
    if lane == "mfy":
        require(parts[1] >= 15 and parts[4] >= 5, "MFY reader-value/substance floor failed")
        fit = c.get("fit", {})
        interest = fit.get("interest_id")
        require(interest in preferences and preferences[interest] in {"Normal", "High"},
                "MFY saved interest missing or Off")
        require(fit.get("saved_preference") == preferences[interest], "MFY preference snapshot mismatch")
        bands = {"direct_high": (21, 25), "direct_normal": (16, 20),
                 "strong_adjacency": (16, 20), "narrow_adjacency": (11, 15)}
        match = fit.get("match")
        require(match in bands and bands[match][0] <= parts[0] <= bands[match][1],
                "MFY interest score outside calibrated match band")
        if match in {"direct_high", "direct_normal"}:
            require(preferences[interest] == ("High" if match == "direct_high" else "Normal"),
                    "direct match band disagrees with saved preference")
        for field in ("source_feature", "reader_payoff", "catalog_scope"):
            require(meaningful(fit.get(field)), "MFY fit missing " + field)
        require(fit.get("off_topic_relabel") is False, "Off-topic relabeling not allowed")


def check_slate(slate, lane, selected, preferences, history, profile, cutoff, window_start):
    require(isinstance(slate, dict), "original slate missing")
    require(slate.get("complete_eligible_pool") is True, "original eligible pool must be retained")
    require(isinstance(slate.get("decisions"), list), "explicit decisions array required")
    candidates = slate.get("ranked")
    require(isinstance(candidates, list), "ranked slate must be an array")
    keys = [c["key"] for c in candidates]
    require(len(keys) == len(set(keys)), "duplicate candidate in original slate")
    require([c["total"] for c in candidates] == sorted([c["total"] for c in candidates], reverse=True),
            "original slate is not score ranked")
    require(meaningful(slate.get("capacity_reason")), "saved volume/capacity rationale required")
    slots = slate.get("slots")
    require(type(slots) is int and 0 <= slots <= len(candidates), "invalid slate capacity")
    for c in candidates:
        check_candidate(c, lane, preferences, history, profile, cutoff, window_start)
    pool = {c["key"]: c for c in candidates}
    expected = set(keys[:slots])
    removed, added = set(), set()
    discovery = 0
    for decision in slate.get("decisions", []):
        control = decision.get("control")
        require(meaningful(decision.get("reason")), "control decision needs a reason")
        old, new = decision.get("displaced"), decision.get("replacement")
        require(old in keys[:slots] and old not in removed, "displacement must use untouched original baseline")
        if control == "freshness_veto":
            require(new is None and pool[old]["history"]["material_update"] is True,
                    "Freshness Veto only removes a scored material repeat")
        else:
            require(new in pool and new not in keys[:slots] and new not in added,
                    "replacement must come from original eligible pool outside baseline")
            if lane == "mfy":
                require(control in {"variety", "discovery"}, "invalid MFY control")
                discovery += control == "discovery"
                require(discovery <= 1, "more than one Discovery Promotion per profile/run")
                delta = pool[old]["total"] - pool[new]["total"]
                value_delta = pool[old]["scores"][1] - pool[new]["scores"][1]
                require(delta <= (5 if control == "variety" else 10) and value_delta <= 3,
                        "MFY displacement exceeds score/value limits")
                require(type(decision.get("score_drop")) is int and type(decision.get("reader_value_drop")) is int
                        and decision["score_drop"] == delta and decision["reader_value_drop"] == value_delta,
                        "recorded displacement deltas do not match original scores")
            else:
                require(control == "selection_balance", "shared controls are independent of MFY limits")
            added.add(new)
            expected.add(new)
        removed.add(old)
        expected.remove(old)
    require(slate.get("control_status") == ("applied" if slate.get("decisions") else "none"),
            "explicit control status inconsistent with decisions")
    require(set(selected) == expected, "final selection differs from original slate plus recorded controls")
    for key, c in selected.items():
        require(c == pool[key], "selected candidate changed original score or evidence")


def validate(bundle):
    require(isinstance(bundle, dict), "input must be an object")
    cutoff = stamp(bundle.get("cutoff"))
    require(cutoff.utcoffset() == cutoff.astimezone(ZoneInfo("America/Chicago")).utcoffset(),
            "cutoff must use America/Chicago local offset")
    edition = cutoff.astimezone(ZoneInfo("America/Chicago")).date()
    window = date.fromisoformat(bundle["history_window_start"])
    require(window <= edition - timedelta(days=14), "published-history lookup is shorter than 14 days")
    require(bundle.get("history_complete") is True, "published-history retrieval incomplete")
    profiles = bundle.get("profiles", {})
    require(isinstance(profiles, dict) and profiles, "profile preference snapshots required")
    history = bundle.get("published_history")
    require(isinstance(history, list), "published history snapshot required")
    for h in history:
        require(date.fromisoformat(h["date"]) < edition, "history must precede edition")
        require(meaningful(h.get("facts")), "prior published facts required")
    rows = bundle.get("rows", [])
    require(isinstance(rows, list) and rows, "proposed published rows required")
    grouped = {p: [] for p in profiles}
    seen = set()
    for row in rows:
        p = row.get("profile_id")
        require(p in profiles, "row has no preference snapshot")
        identity = (p, row.get("section"), row.get("key"))
        require(identity not in seen, "duplicate proposed history row")
        seen.add(identity)
        note = decode_note(row.get("notes"))
        require(note.get("schema") == "ADB-SELECTION-NOTE-1", "note schema mismatch")
        require(note.get("selection_spec") == "ADB-V2-SELECT-1.0" and
                note.get("production_spec") == "ADB-DAILY-PROD-2.0", "specification mismatch")
        require(note.get("run_id") == bundle.get("run_id") and text(note.get("run_id")), "run mismatch")
        require(note.get("cutoff") == bundle["cutoff"], "cutoff mismatch")
        c = note.get("candidate", {})
        lane = SECTIONS.get(row.get("section"))
        require(lane is not None and c.get("key") == row.get("key"), "row section/key mismatch")
        require(type(row.get("material_update")) is bool and
                c.get("history", {}).get("material_update") == row["material_update"], "history row update mismatch")
        require(row.get("source_url") in [s.get("url") for s in c.get("sources", [])], "row source mismatch")
        check_candidate(c, lane, profiles[p]["preferences"], history, p, cutoff, window.isoformat())
        grouped[p].append(note)
    shared_reference = None
    for profile, notes in grouped.items():
        require(profiles[profile].get("volume") in {"Fewer", "Standard", "More"}, "saved volume missing")
        contexts = [n["context"] for n in notes if "context" in n]
        require(len(contexts) == 1, "exactly one context carrier required per profile")
        ctx = contexts[0]
        require(ctx.get("volume") == profiles[profile]["volume"], "volume snapshot mismatch")
        require(ctx.get("shared_weights") == SHARED and ctx.get("mfy_weights") == MFY, "weight mismatch")
        require(ctx.get("history_window_start") == bundle["history_window_start"], "history window mismatch")
        require(isinstance(ctx.get("rejected"), list), "explicit rejected-candidate record required")
        for rejected in ctx["rejected"]:
            require(all(meaningful(rejected.get(f)) for f in ("key", "topic", "reason")),
                    "rejected candidate needs key, topic and specific reason")
            require(rejected.get("lane") in {"top", "utr", "mfy"} and
                    rejected.get("failed_gate") in {"source", "fit", "repeat", "section", "score", "freshness"},
                    "rejected candidate needs lane and failed gate")
            require(rejected["key"] not in [n["candidate"]["key"] for n in notes],
                    "gate-rejected candidate cannot also be published")
        for lane in ("top", "mfy"):
            selected = {n["candidate"]["key"]: n["candidate"] for n in notes if n["candidate"]["lane"] == lane}
            check_slate(ctx.get(lane), lane, selected, profiles[profile]["preferences"], history,
                        profile, cutoff, window.isoformat())
        search = ctx.get("utr_search", {})
        require(search.get("independent") is True and search.get("checks"), "independent UTR search evidence required")
        for check in search["checks"]:
            require(meaningful(check.get("query_or_path")) and meaningful(check.get("finding")),
                    "UTR search needs query/path and actual finding")
            check_source(check["source"], cutoff)
        utr = [n["candidate"] for n in notes if n["candidate"]["lane"] == "utr"]
        require(search.get("outcome") == ("selected" if utr else "none_qualified"), "UTR outcome mismatch")
        require(meaningful(search.get("reason")), "UTR outcome reason required")
        for c in utr:
            d = c.get("discovery", {})
            for field in ("overlooked_fact", "prominence_evidence", "placement_reason"):
                require(meaningful(d.get(field)), "UTR discovery missing " + field)
            require(type(d.get("search_check")) is int and 0 <= d["search_check"] < len(search["checks"]),
                    "UTR selection must link to independent search evidence")
            require(d.get("narrow_scope_only") is False and d.get("rejected_headline_only") is False,
                    "UTR cannot be justified only by narrow scope or rejected headline status")
        shared = {"top": ctx["top"], "utr_search": search, "utr": utr,
                  "rejected": [r for r in ctx["rejected"] if r["lane"] != "mfy"]}
        if shared_reference is None:
            shared_reference = shared
        require(shared == shared_reference, "shared selection/evidence differs between profiles")
        all_keys = [n["candidate"]["key"] for n in notes]
        require(len(all_keys) == len(set(all_keys)), "same candidate published in multiple sections")
        shared_topics = {n["candidate"]["topic"] for n in notes if n["candidate"]["lane"] in {"top", "utr"}}
        for n in notes:
            c = n["candidate"]
            if c["lane"] == "mfy" and c["topic"] in shared_topics:
                require(meaningful(c.get("distinct_shared_angle")), "MFY retelling lacks a distinct substantive angle")
    return len(rows)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("bundle", type=Path)
    args = parser.parse_args()
    try:
        count = validate(json.loads(args.bundle.read_text(encoding="utf-8")))
    except (Invalid, ValueError, KeyError, TypeError, OSError, AttributeError) as exc:
        # Do not echo input, profile IDs or raw JSON on malformed private input.
        detail = str(exc) if isinstance(exc, Invalid) else "malformed or unreadable input"
        print("FAIL: " + detail, file=sys.stderr)
        return 1
    print(f"PASS: {count} proposed history notes validated; no production writes performed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

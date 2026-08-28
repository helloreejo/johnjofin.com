#!/usr/bin/env python3
"""Compare the WordPress REST payload against the content extracted from the
original static index.html.

Every editable string has to survive the round trip through ACF unchanged —
this is the check that catches a dropped field or a value WordPress rewrote
on the way out.

    python3 scripts/verify/payload-parity.py [wp-url]
"""

import json
import sys
import urllib.request

WP = sys.argv[1] if len(sys.argv) > 1 else "http://johnjofin.local"

with urllib.request.urlopen(f"{WP}/wp-json/jj/v1/site") as r:
    live = json.load(r)
src = json.load(open("scripts/seed/content.json"))

fails: list[str] = []
checked = 0


def empty(v) -> bool:
    """ACF stores "no value" as '' or []; the extractor recorded it as None."""
    return v is None or v == "" or v == [] or v == {}


def same_file(got, want) -> bool:
    """An image/file is the same asset if the filename survived the import."""
    if isinstance(got, dict):
        got = got.get("src") or ""
    if not isinstance(got, str) or not isinstance(want, str):
        return False
    return bool(want) and got.rsplit("/", 1)[-1] == want.rsplit("/", 1)[-1]


def cmp(path: str, got, want) -> None:
    """Compare two leaf values, ignoring differences we deliberately allow."""
    global checked
    checked += 1
    if got == want:
        return
    if empty(got) and empty(want):
        return
    # media moved into the library, so paths change but the file must not
    if same_file(got, want):
        return
    fails.append(f"{path}\n    want: {want!r}\n    got : {got!r}")


def walk(path: str, got, want) -> None:
    # an image field: {src,…} in the payload vs a path string in the source
    if isinstance(got, dict) and isinstance(want, str) and same_file(got, want):
        cmp(path, got, want)
        return
    if isinstance(want, dict):
        if not isinstance(got, dict):
            fails.append(f"{path}: expected object, got {type(got).__name__}")
            return
        for k, v in want.items():
            if k not in got:
                if empty(v):
                    continue  # not modelled, and empty in the source anyway
                fails.append(f"{path}.{k}: missing from payload")
                continue
            walk(f"{path}.{k}", got[k], v)
    elif isinstance(want, list):
        if not isinstance(got, list):
            fails.append(f"{path}: expected list, got {type(got).__name__}")
            return
        if len(got) != len(want):
            fails.append(f"{path}: length {len(got)} != {len(want)}")
            return
        for i, v in enumerate(want):
            walk(f"{path}[{i}]", got[i], v)
    else:
        cmp(path, got, want)


# fields that exist only on one side, by design
SKIP = {
    # width/height come from the WP attachment, not the original markup
    "width",
    "height",
    "alt",
    # the extractor read tabs as a sibling list; the model nests them per item
    "tabs",
    # jsonld is rebuilt by the frontend from the other seo fields
    "jsonld",
    # added by the API, absent from the static page
    "endpoint",
    # a layout attribute, not content — the component sets rows itself
    "rows",
}


def prune(o):
    if isinstance(o, dict):
        return {k: prune(v) for k, v in o.items() if k not in SKIP}
    if isinstance(o, list):
        return [prune(v) for v in o]
    return o


want = prune(src)
# references: fold the sibling tab list into each item so shapes line up
for i, t in enumerate(src["references"].get("tabs", [])):
    if i < len(want["references"]["items"]):
        want["references"]["items"][i]["tab"] = t

for section in want:
    if section not in live:
        fails.append(f"{section}: missing from payload")
        continue
    walk(section, prune(live[section]), want[section])

print(f"checked {checked} values across {len(want)} sections")
if fails:
    print(f"\n{len(fails)} MISMATCH(ES):\n")
    for f in fails:
        print("  " + f)
    sys.exit(1)
print("payload matches the original content exactly")

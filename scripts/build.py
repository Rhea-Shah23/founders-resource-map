#!/usr/bin/env python3
"""Build data/resources.json and docs/index.html from data/resources.csv.

Usage:
    python3 scripts/build.py

resources.csv is the source of truth. Edit it (or Airtable, then export to CSV),
then run this script. It uses only the Python standard library.
"""
import csv
import json
from collections import OrderedDict
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CSV_PATH = ROOT / "data" / "resources.csv"
RAW_PATH = ROOT / "data" / "raw_map_entries.csv"
JSON_PATH = ROOT / "data" / "resources.json"
TEMPLATE = ROOT / "scripts" / "site_template.html"
SITE = ROOT / "docs" / "index.html"

FIELDS = [
    "id", "name", "description", "good_for", "category", "subcategory", "parent_org",
    "location", "tags", "ideal_participant", "stage", "url", "contact_email", "status",
    "recurrence", "next_deadline", "deadline_note", "cost_or_funding", "student_eligible",
    "on_university_map", "source_urls", "last_verified", "confidence",
    "needs_confirmation", "notes",
]

# Tab order on the site. Must match notes/taxonomy.md.
CATEGORIES = [
    "Pitch Competitions & Challenges",
    "Accelerators & Incubators",
    "Funding & Grants",
    "Courses & Training",
    "Fellowships & Internships",
    "Maker Spaces & Labs",
    "Student Organizations",
    "Events & Community",
    "Advising & Legal/IP",
    "Campus Hubs",
    "External Partners",
]


def split_list(value):
    return [v.strip() for v in value.split(";") if v.strip()]


def to_bool(value):
    return value.strip().upper() == "TRUE"


def load_resources():
    with CSV_PATH.open(newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    out = []
    for r in rows:
        item = OrderedDict((k, (r.get(k) or "").strip()) for k in FIELDS)
        item["tags"] = split_list(item["tags"])
        item["source_urls"] = split_list(item["source_urls"])
        item["on_university_map"] = to_bool(item["on_university_map"])
        item["needs_confirmation"] = to_bool(item["needs_confirmation"])
        out.append(item)
    return out


def load_map_sections():
    sections, count = {}, 0
    with RAW_PATH.open(newline="", encoding="utf-8") as f:
        for r in csv.DictReader(f):
            count += 1
            if r["canonical_id"]:
                sections.setdefault(r["canonical_id"], []).append(r["section_path"])
    return sections, count


def main():
    resources = load_resources()
    sections, map_count = load_map_sections()
    for r in resources:
        r["map_sections"] = sections.get(r["id"], [])
    verified = [r["last_verified"] for r in resources if r["last_verified"]]
    payload = OrderedDict([
        ("generated", date.today().isoformat()),
        ("data_last_updated", max(verified) if verified else ""),
        ("map_entry_count", map_count),
        ("resource_count", len(resources)),
        ("categories", CATEGORIES),
        ("resources", resources),
    ])
    JSON_PATH.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    # Embed the data inline so the page opens by double-click with no server.
    blob = json.dumps(payload, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    html = TEMPLATE.read_text(encoding="utf-8").replace("__DATA_JSON__", blob)
    SITE.write_text(html, encoding="utf-8")
    print(f"Built {JSON_PATH.relative_to(ROOT)} and {SITE.relative_to(ROOT)} "
          f"({len(resources)} resources, {map_count} map entries)")


if __name__ == "__main__":
    main()

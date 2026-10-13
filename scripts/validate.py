#!/usr/bin/env python3
"""Validate data/resources.csv and check every URL.

Usage:
    python3 scripts/validate.py            # structure checks + live URL checks
    python3 scripts/validate.py --no-urls  # structure checks only (fast, offline)

Writes the results into the AUTO-VALIDATION section of notes/to_confirm.md.
Exits with code 1 if any structural error is found (URL failures are reported
for humans to check but do not fail the run, since some sites block scripts).
"""
import csv
import re
import shutil
import ssl
import subprocess
import sys
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CSV_PATH = ROOT / "data" / "resources.csv"
TO_CONFIRM = ROOT / "notes" / "to_confirm.md"
START, END = "<!-- AUTO-VALIDATION START -->", "<!-- AUTO-VALIDATION END -->"

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build import CATEGORIES, FIELDS  # noqa: E402

ALLOWED = {
    "location": {"UIUC", "CU", "Chicago", "National", "Online"},
    "stage": {"Idea", "Prototype", "Launched", "Any"},
    "status": {"Active", "Inactive", "Unknown"},
    "recurrence": {"Annual", "Rolling", "Per semester", "One-time", "Unknown"},
    "student_eligible": {"Yes", "No", "Varies", "Unknown"},
    "on_university_map": {"TRUE", "FALSE"},
    "confidence": {"High", "Medium", "Low"},
    "needs_confirmation": {"TRUE", "FALSE"},
    "category": set(CATEGORIES),
}
TAGS = set("""funding non-dilutive equity prizes pitching competition accelerator incubator
mentorship workspace maker-space prototyping coursework certificate degree design-thinking
workshops events networking community housing fellowship internships careers consulting
legal-ip licensing research-commercialization sbir customer-discovery deep-tech health agtech
quantum social-impact software hardware women chicago travel faculty-researchers grad-students
undergrads""".split())
REQUIRED = ["id", "name", "description", "good_for", "category", "location", "tags", "stage",
            "status", "recurrence", "student_eligible", "on_university_map", "last_verified",
            "confidence", "needs_confirmation"]
USER_FACING = ["name", "description", "good_for", "subcategory", "parent_org",
               "ideal_participant", "deadline_note", "cost_or_funding", "notes"]
SLUG = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")
EMAIL = re.compile(r"^[^@\s]+@[^@\s]+\.[a-z]{2,}$", re.I)
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0 Safari/537.36")


def parse_iso(value):
    try:
        return date.fromisoformat(value)
    except ValueError:
        return None


def check_rows(rows):
    errors, warnings = [], []
    today = date.today()
    seen_ids, seen_names = {}, {}
    header = list(rows[0].keys()) if rows else []
    if header != FIELDS:
        errors.append(f"CSV columns do not match the schema. Expected {FIELDS}, got {header}")
    for n, r in enumerate(rows, start=2):
        rid = r.get("id", "")
        where = f"`{rid or f'row {n}'}`"
        for f in REQUIRED:
            if not (r.get(f) or "").strip():
                errors.append(f"{where}: required field `{f}` is blank")
        if rid and not SLUG.match(rid):
            errors.append(f"{where}: id is not a lowercase slug")
        if rid in seen_ids:
            errors.append(f"{where}: duplicate id (also row {seen_ids[rid]})")
        seen_ids[rid] = n
        key = re.sub(r"\W+", "", r.get("name", "").lower())
        if key in seen_names:
            errors.append(f"{where}: duplicate name (also row {seen_names[key]})")
        seen_names[key] = n
        for f, allowed in ALLOWED.items():
            v = r.get(f, "")
            if v and v not in allowed:
                errors.append(f"{where}: `{f}` value {v!r} not in allowed set")
        for t in [t.strip() for t in r.get("tags", "").split(";") if t.strip()]:
            if t not in TAGS:
                errors.append(f"{where}: tag {t!r} is not in the vocabulary")
        lv = r.get("last_verified", "")
        if lv and not parse_iso(lv):
            errors.append(f"{where}: last_verified {lv!r} is not an ISO date")
        nd = r.get("next_deadline", "")
        if nd:
            d = parse_iso(nd)
            if not d:
                errors.append(f"{where}: next_deadline {nd!r} is not an ISO date")
            elif d < today:
                warnings.append(f"{where}: next_deadline {nd} has passed. Update or clear it")
        email = r.get("contact_email", "")
        if email and not EMAIL.match(email):
            errors.append(f"{where}: contact_email {email!r} looks malformed")
        for f in USER_FACING:
            if re.search("[—–]", r.get(f, "")):
                errors.append(f"{where}: `{f}` contains an em or en dash")
        desc = r.get("description", "")
        sentences = len(re.findall(r"[.!?](\s|$)", desc))
        if sentences > 2 or len(desc) > 320:
            warnings.append(f"{where}: description is longer than 2 sentences or 320 characters")
        if r.get("confidence") != "High" and r.get("needs_confirmation") != "TRUE":
            errors.append(f"{where}: confidence is not High but needs_confirmation is FALSE")
        if not r.get("url"):
            warnings.append(f"{where}: no official URL")
        if r.get("status") == "Active" and not r.get("source_urls"):
            errors.append(f"{where}: status is Active but no evidence in source_urls")
    return errors, warnings


def ssl_context():
    """Default context, with a CA bundle fallback for Python.org macOS builds."""
    try:
        import certifi  # optional
        return ssl.create_default_context(cafile=certifi.where())
    except ImportError:
        pass
    for bundle in ("/etc/ssl/cert.pem", "/etc/ssl/certs/ca-certificates.crt"):
        if Path(bundle).exists():
            return ssl.create_default_context(cafile=bundle)
    return ssl.create_default_context()


CTX = ssl_context()


PARKED = ("hugedomains.com", "sedo.com", "dan.com", "afternic.com", "godaddy.com/domainsearch")


def curl_fetch(url):
    """Fallback for servers whose certificate chain Python cannot verify but browsers can."""
    if not shutil.which("curl"):
        return None
    try:
        out = subprocess.run(["curl", "-sS", "-o", "/dev/null", "-L", "-A", UA, "--max-time", "25",
                              "-w", "%{http_code} %{url_effective}", url],
                             capture_output=True, text=True, timeout=40).stdout.split(" ", 1)
        return int(out[0]), out[1] if len(out) > 1 else url
    except (ValueError, subprocess.SubprocessError):
        return None


def fetch(url):
    status, final = _fetch(url)
    if isinstance(status, str) and ("CERTIFICATE" in status or "SSL" in status):
        status, final = curl_fetch(url) or (status, final)
    if isinstance(status, int) and any(p in final for p in PARKED):
        return f"redirects to a domain-for-sale page ({final[:60]})", final
    return status, final


def _fetch(url):
    ctx = CTX
    for method in ("HEAD", "GET"):
        req = urllib.request.Request(url, method=method, headers={
            "User-Agent": UA, "Accept": "text/html,application/xhtml+xml,*/*;q=0.8"})
        try:
            with urllib.request.urlopen(req, timeout=25, context=ctx) as resp:
                return resp.status, resp.geturl()
        except urllib.error.HTTPError as e:
            if method == "HEAD" and e.code in (403, 404, 405, 429, 500, 501, 503):
                continue  # many servers mishandle HEAD; retry with GET
            return e.code, url
        except Exception as e:  # DNS, TLS, timeout
            if method == "HEAD":
                continue
            return f"error: {type(e).__name__}: {str(e)[:80]}", url
    return "error: unknown", url


def check_urls(rows):
    targets = {}
    for r in rows:
        for field in ("url", "source_urls"):
            for u in [u.strip() for u in r.get(field, "").split(";") if u.strip()]:
                targets.setdefault(u, []).append((r["id"], field))
    with ThreadPoolExecutor(max_workers=12) as pool:
        results = dict(zip(targets, pool.map(fetch, targets)))
    failures = []
    for u, (status, final) in sorted(results.items()):
        ok = isinstance(status, int) and status < 400
        if not ok:
            owners = ", ".join(sorted({f"`{i}` ({f})" for i, f in targets[u]}))
            note = ""
            if status in (403, 429, 999):
                note = " (likely blocks automated requests; open it in a browser)"
            failures.append(f"{u} returned {status}{note}. Used by {owners}")
    return len(targets), failures


def write_report(errors, warnings, url_total, url_failures, urls_checked):
    lines = [START, "", "## Automated validation results", "",
             f"Last run: {date.today().isoformat()} with `python3 scripts/validate.py`.", ""]
    lines.append(f"**Structural errors ({len(errors)}).** These break the import or the site.")
    lines += [f"- [ ] {e}" for e in errors] or ["- None"]
    lines += ["", f"**Warnings ({len(warnings)}).** Review when you can."]
    lines += [f"- [ ] {w}" for w in warnings] or ["- None"]
    lines.append("")
    if urls_checked:
        lines.append(f"**URL check: {len(url_failures)} of {url_total} URLs did not return a "
                     "success response.** Open each in a browser. If it works, leave it. If it "
                     "is broken, find the new page and update `url` or `source_urls`.")
        lines += [f"- [ ] {f}" for f in url_failures] or ["- None"]
    else:
        lines.append("URL check skipped (`--no-urls`).")
    lines += ["", END]
    block = "\n".join(lines)
    text = TO_CONFIRM.read_text(encoding="utf-8") if TO_CONFIRM.exists() else ""
    if START in text and END in text:
        text = text[:text.index(START)] + block + text[text.index(END) + len(END):]
    else:
        text = text.rstrip() + "\n\n" + block + "\n"
    TO_CONFIRM.write_text(text, encoding="utf-8")


def main():
    with CSV_PATH.open(newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    errors, warnings = check_rows(rows)
    urls_checked = "--no-urls" not in sys.argv
    url_total, url_failures = check_urls(rows) if urls_checked else (0, [])
    write_report(errors, warnings, url_total, url_failures, urls_checked)
    print(f"{len(rows)} rows. {len(errors)} errors, {len(warnings)} warnings.")
    if urls_checked:
        print(f"URLs: {url_total} checked, {len(url_failures)} failed.")
    for e in errors:
        print("ERROR", e)
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()

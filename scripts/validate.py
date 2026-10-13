#!/usr/bin/env python3
"""Validate data/resources.csv and check every URL.

Usage:
    python3 scripts/validate.py            # structure checks + live URL checks
    python3 scripts/validate.py --no-urls  # structure checks only (fast, offline)

A full run writes the results into the AUTO-VALIDATION section of notes/to_confirm.md.
A --no-urls run only prints them.
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
from build import APPLICATION_METHODS, CATEGORIES, DEADLINE_TYPES, FIELDS  # noqa: E402

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
    "application_method": set(APPLICATION_METHODS),
    "deadline_type": set(DEADLINE_TYPES),
}
TAGS = set("""funding non-dilutive equity prizes pitching competition accelerator incubator
mentorship workspace maker-space prototyping coursework certificate degree design-thinking
workshops events networking community housing fellowship internships careers consulting
legal-ip licensing research-commercialization sbir customer-discovery deep-tech health agtech
quantum social-impact software hardware women chicago travel faculty-researchers grad-students
undergrads""".split())
REQUIRED = ["id", "name", "tagline", "description", "what_it_is", "who_should_apply",
            "choose_this_if", "good_for", "category", "location", "tags", "stage",
            "application_method", "status", "recurrence", "deadline_type", "student_eligible",
            "on_university_map", "last_verified", "confidence", "needs_confirmation"]
USER_FACING = ["name", "tagline", "description", "what_it_is", "who_should_apply",
               "choose_this_if", "good_for", "subcategory", "parent_org", "ideal_participant",
               "apply_steps", "deadline_note", "cost_or_funding", "notes"]
URL = re.compile(r"^https?://[^\s;|]+$")
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
        d = parse_iso(nd) if nd else None
        if nd:
            if not d:
                errors.append(f"{where}: next_deadline {nd!r} is not an ISO date")
            elif d < today:
                warnings.append(f"{where}: next_deadline {nd} has passed. Update or clear it")
        od = r.get("opens_date", "")
        if od:
            o = parse_iso(od)
            if not o:
                errors.append(f"{where}: opens_date {od!r} is not an ISO date")
            elif d and o > d:
                errors.append(f"{where}: opens_date {od} is after next_deadline {nd}")
        errors += [f"{where}: {m}" for m in check_round2(r)]
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
        if (r.get("application_method") not in ("", "Unknown", "Not applicable",
                                                 "Walk-in or open access")
                and not r.get("apply_steps")):
            warnings.append(f"{where}: no apply_steps (only add them from an official page)")
        if r.get("confidence") != "High" and r.get("needs_confirmation") != "TRUE":
            errors.append(f"{where}: confidence is not High but needs_confirmation is FALSE")
        if not r.get("url"):
            warnings.append(f"{where}: no official URL")
        if r.get("status") == "Active" and not r.get("source_urls"):
            errors.append(f"{where}: status is Active but no evidence in source_urls")
    return errors, warnings


def check_round2(r):
    """Rules for the round 2 fields (tagline, summary rows, how to apply, deadline type)."""
    out = []
    tagline = r.get("tagline", "")
    if len(tagline) > 90:
        out.append(f"tagline is {len(tagline)} characters (max 90)")
    if tagline.endswith("."):
        out.append("tagline should not end with a period")
    cti = r.get("choose_this_if", "")
    if cti and not (cti.startswith("You want to") or cti.startswith("You are")):
        out.append('choose_this_if must start with "You want to" or "You are"')
    for f in ("what_it_is", "who_should_apply", "choose_this_if"):
        v = r.get(f, "")
        if v and len(re.findall(r"[.!?](\s|$)", v)) > 1:
            out.append(f"`{f}` should be one sentence")
    for f in USER_FACING:
        if "!" in r.get(f, ""):
            out.append(f"`{f}` contains an exclamation point")
    steps = [s for s in r.get("apply_steps", "").split("|")]
    if r.get("apply_steps", ""):
        if len(steps) > 3:
            out.append(f"apply_steps has {len(steps)} steps (max 3)")
        if any(not s.strip() for s in steps) or not re.fullmatch(r"[^|]+( \| [^|]+)*",
                                                                 r["apply_steps"]):
            out.append('apply_steps must be separated by " | " with no empty steps')
        if r.get("application_method") in ("Unknown", "Not applicable"):
            out.append("apply_steps is set but application_method is Unknown or Not applicable")
    au = r.get("apply_url", "")
    if au and not URL.match(au):
        out.append(f"apply_url {au!r} is not a single http(s) URL")
    if au and au == r.get("url"):
        out.append("apply_url repeats url; leave it blank")
    dt, nd = r.get("deadline_type", ""), r.get("next_deadline", "")
    if dt == "Confirmed":
        if not nd:
            out.append("deadline_type is Confirmed but next_deadline is blank")
        if not r.get("source_urls"):
            out.append("deadline_type is Confirmed but source_urls is blank")
    elif dt == "Typical":
        if not r.get("deadline_note"):
            out.append("deadline_type is Typical but deadline_note has no evidence")
    elif nd and dt:
        out.append(f"next_deadline is set but deadline_type is {dt} (use Confirmed or Typical)")
    needs = r.get("needs_confirmation") == "TRUE"
    if not needs:
        if r.get("application_method") == "Unknown":
            out.append("application_method is Unknown but needs_confirmation is FALSE")
        if dt == "Unknown":
            out.append("deadline_type is Unknown but needs_confirmation is FALSE")
        if dt == "Typical":
            out.append("deadline_type is Typical but needs_confirmation is FALSE")
    return out


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
        for field in ("url", "apply_url", "source_urls"):
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
    if urls_checked:  # a quick --no-urls run leaves the last full report in place
        write_report(errors, warnings, url_total, url_failures, urls_checked)
    print(f"{len(rows)} rows. {len(errors)} errors, {len(warnings)} warnings.")
    if urls_checked:
        print(f"URLs: {url_total} checked, {len(url_failures)} failed.")
    for e in errors:
        print("ERROR", e)
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()

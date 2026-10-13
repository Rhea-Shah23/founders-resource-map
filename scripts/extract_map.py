#!/usr/bin/env python3
"""Extract every entry from the Entrepreneurship at Illinois ecosystem map.

Usage:
    python3 scripts/extract_map.py                 # parse the saved snapshot
    python3 scripts/extract_map.py --live          # fetch the live page first

Writes data/raw_map_entries.csv: one row per entry exactly as listed, with the
section path it appeared under and the canonical resource id it maps to.
"""
import csv
import re
import sys
import urllib.request
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MAP_URL = "https://entrepreneurship.illinois.edu/about-our-ecosystem/entrepreneurship-ecosystem-map"
SNAPSHOT = ROOT / "data" / "map_snapshot_2026-10-13.html"
OUT = ROOT / "data" / "raw_map_entries.csv"

# Clean display names for the map's section headings (raw text -> label).
HEADING_LABELS = {
    "INTERNAL PARTNERS": "Overview > Internal Partners",
    "URBANA-CHAMPAIGN": "Urbana-Champaign",
    "NATIONAL & REGIONAL": "National & Regional",
    "Office of the Vice Chancellor for Research & Innovation (OVCRI)": "OVCRI",
    "ENTERPRISEWORKS": "EnterpriseWorks",
    "RESEARCH PARK": "Research Park",
    "Illinois Ventures": "Illinois Ventures",
    "Office of Technology Management": "Office of Technology Management",
    "Carle Illinois College of Medicine": "Carle Illinois College of Medicine",
    "Siebel Center for Design (SCD)": "Siebel Center for Design",
    "Grainger College of Engineering": "Grainger",
    "LANDUYT CENTER FOR ENTREPRENEUR (FORMERY TEC)": "Landuyt Center",
    "Health Care Engineering Systems Center (HCESC)": "Health Care Engineering Systems Center",
    "Other (Grainger & University Partners)": "Other Grainger & University Partners",
    "Gies College of Business": "Gies",
    "ORIGIN VENTURES ACADEMY FOR ENTREPRENEURIAL LEADERSHIP (OVAEL)": "OVAEL",
    "OTHER": "Other",
    "Student Organizations": "Student Organizations",
    "Other Internal Partners & Programs": "Other Internal Partners & Programs",
    "Brand Hub – Hub for Brand Innovation & Advertising Technology (Sandage Dept. of Advertising, SCD, & Technology Services)": "Brand Hub",
    "Cancer Center at Illinois": "Cancer Center at Illinois",
    "Carl R. Woese Institute for Genomic Biology (IGB)": "Carl R. Woese Institute for Genomic Biology",
    "National Center for Supercomputing Applications (NCSA)": "NCSA",
    "University Housing": "University Housing",
    "CU Community Fab Lab": "CU Community Fab Lab",
    "Innovation Expo (Landuyt Center, Founders, Innovation LLC)": "Innovation Expo",
    "External Partners & Programs": "External Partners & Programs",
    "CHICAGO": "Chicago",
}

# Every entry text (normalized) -> canonical resource id.
CANONICAL = {
    # Overview: internal partners
    "Grainger Engineering": "grainger-engineering",
    "City Scholars & Startup City Scholars": "city-scholars",
    "Discovery Partners Institute": "discovery-partners-institute",
    "Chicago Innovation Exchange (CIE) & Illinois Partnership": "chicago-innovation-exchange",
    "Quantum Accelerator": "duality-quantum-accelerator",
    "Siebel Center for Design": "siebel-center-for-design",
    "Landuyt Center for Entrepreneurship (Formerly TEC)": "landuyt-center",
    "Gies Business": "gies-business",
    "Origin Ventures Academy for Entrepreneurial Leadership (OVAEL)": "ovael",
    "Brand Hub": "brand-hub",
    "Office of Technology Management": "office-of-technology-management",
    "IGB – Carl R. Woese Institute for Genomic Biology": "igb",
    "Illinois Ventures": "illinois-ventures",
    "Cancer Center at Illinois": "cancer-center-at-illinois",
    "EnterpriseWorks & EW 2.0": "enterpriseworks",
    "Research Park": "research-park",
    "OVCRI – Office of the Vice Chancellor for Research & Innovation": "ovcri",
    "Student Organizations": "",  # section pointer, not a resource
    "NCSA – National Center for Supercomputing Applications": "ncsa",
    "Innovation Living-Learning Community (Landuyt Center & University Housing)": "innovation-llc",
    "Carle Illinois College of Medicine": "carle-illinois",
    "Translational Research Facility": "translational-research-facility",
    # Overview: Urbana-Champaign and external Urbana-Champaign
    "Pygmalion Tech Festival": "pygmalion",
    "Champaign County Economic Development Corporation": "champaign-county-edc",
    "Illinois Ag Tech Accelerator": "illinois-ag-tech-accelerator",
    "Illinois Ag Tech Accelerator (gener8tor, Serra Ventures, Research Park)": "illinois-ag-tech-accelerator",
    "Innovation Celebration": "innovation-celebration",
    "Innovation Celebration (Champaign County EDC, Landuyt Center, & Parkland College)": "innovation-celebration",
    "Champaign-Urbana CEO Roundtable": "cu-ceo-roundtable",
    "Champaign-Urbana CEO Roundtable (Research Park)": "cu-ceo-roundtable",
    # Overview: national and regional, and external national and regional
    "Kern Entrepreneurial Engineering Network": "keen",
    "Kern Entrepreneurial Engineering Network (KEEN & Grainger)": "keen",
    "Mayo Clinic & Illinois Alliance": "mayo-illinois-alliance",
    "Discovery Accelerator Institute": "discovery-accelerator-institute",
    "Discovery Accelerator Institute (IBM & Grainger)": "discovery-accelerator-institute",
    "Illinois University Incubator Network": "illinois-university-incubator-network",
    "Illinois Innovation Network": "illinois-innovation-network",
    "Midwest Engineering Entrepreneurship Network": "meen",
    "Midwest Engineering Entrepreneurship Network (MEEN & Landuyt Center)": "meen",
    "Entrepreneurship Living-Learning Community Roundtable": "ellc-roundtable",
    "Entrepreneurship Living-Learning Community Roundtable (ELLC & Landuyt Center)": "ellc-roundtable",
    "Engineering Innovation Leadership Council": "eilc",
    "Engineering Innovation Leadership Council (NSF, EILC & Grainger)": "eilc",
    "National & Midwest I-Corps Programs": "nsf-i-corps",
    "NSF I-Corps": "nsf-i-corps",
    "Jump ARCHES & OSF Healthcare": "jump-arches",
    "Jump ARCHES (with OSF Healthcare and University of Illinois College of Medicine - Peoria)": "jump-arches",
    "Jump ARCHES (HCESC & OSF Healthcare, UI College of Medicine - Peoria)": "jump-arches",
    # EnterpriseWorks
    "AWARE seed grants & mentoring": "ew-aware",
    "Designer-in-Residence Program": "ew-designer-in-residence",
    "Entrepreneur-in-Residence Program": "ew-entrepreneur-in-residence",
    "Entrepreneurship Workshops": "research-park-entrepreneurship-workshops",
    "FAST Center SBIR & STTR Assistance": "fast-center-sbir-sttr",
    "Incubator labs, offices, & maker space": "ew-incubator-space",
    "I-Start Accelerator Program": "ew-i-start",
    # Research Park
    "AgTech Innovation Summit": "agtech-innovation-summit",
    "Catalyze: Networking Event": "catalyze",
    "Company Internships": "research-park-internships",
    "Corporate Startup Intros": "research-park-corporate-startup-intros",
    "Corporate Innovation Centers": "research-park-corporate-innovation-centers",
    "CU Women in Tech": "cu-women-in-tech",
    "Illinois Reboot Tech Training": "illinois-reboot",
    "Recruitment Services": "research-park-recruitment-services",
    "Workforce Development": "research-park-workforce-development",
    # Illinois Ventures
    "Venture Capital & Seed Funding for tech startups from the University of Illinois System": "illinois-ventures",
    "Evergreen Fund": "illinois-ventures-evergreen-fund",
    # OTM
    "Disclosure & Licensing Information": "office-of-technology-management",
    "Illinois Proof of Concept Program (IPOC)": "ipoc",
    # Carle Illinois
    "Health Make-A-Thon": "health-make-a-thon",
    "Health Maker Lab": "health-maker-lab",
    # Siebel Center for Design
    "Assessment & Research Lab": "scd-assessment-research-lab",
    "Design Thinking Courses": "scd-design-thinking-courses",
    "SCD Scholars & Fellows": "scd-scholars-fellows",
    "Workshops": "scd-workshops",
    "The Shop: Maker Lab": "scd-the-shop",
    # Landuyt Center
    "Alchemy Technology Foundry": "alchemy-foundry",
    "Cozad New Venture Challenge": "cozad-new-venture-challenge",
    "Entrepreneurship Courses, Certificates, & Advising": "landuyt-courses-certificates",
    "Illinois Innovation Award (IIA)": "illinois-innovation-award",
    "Innovation, Leadership, & Engineering Entrepreneurship (ILEE) BS Dual Degree": "ilee-dual-degree",
    "Intellectual Property Clinic (Landuyt Center & College of Law)": "ip-clinic",
    "Silicon Valley Entrepreneurship Workshop": "silicon-valley-workshop",
    "SocialFuse": "socialfuse",
    "Startup City Scholars (Landuyt Center & Grainger Engineering)": "city-scholars",
    # Other Grainger and university partners
    "Office of the Associate Dean for Innovation & Entrepreneurship": "grainger-associate-dean-ie",
    "City Scholars & Startup City Scholars (Grainger, UIC, DPI, UChicago, Polsky)": "city-scholars",
    "ECE Open Lab (ECE)": "ece-open-lab",
    "IDEA Lab: Innovation, Discovery, Design, & Data Lab (Grainger Engineering Library)": "idea-lab",
    "Mottier Innovation Challenge (ISE)": "mottier-innovation-challenge",
    # OVAEL and Gies
    "iVenture Accelerator": "iventure-accelerator",
    "Illinois Social Innovation": "illinois-social-innovation",
    "EntreCORPS": "entrecorps",
    "Entrepreneurs Without Borders": "entrepreneurs-without-borders",
    "Strategy, Innovation, and Entrepreneurship Major": "gies-sie-major",
    "Entrepreneurship Courses": "gies-entrepreneurship-courses",
    "Illinois Maker Lab": "illinois-maker-lab",
    # Student organizations
    "AXISMED – Healthcare Innovation Pre-incubator": "axismed",
    "CUBE CONSULTING – Business, Engineering, & Design Consulting": "cube-consulting",
    "ENTRECORPS (Gies) – Startup Consulting": "entrecorps",
    "FOUNDERS: Illinois Entrepreneurs – Student Startup Programs": "founders",
    "ILLINOIS ENACTUS – Social Entrepreneurship Projects": "enactus",
    "OTCR CONSULTING – Business Consulting": "otcr-consulting",
    "ZERO2ONE – Student Startup Programs": "zero2one",
    # Other internal partners
    "Professional Online Certificates & Development": "brand-hub-certificates",
    "Workshops & Seminars": "brand-hub-workshops",
    "Kleinmuntz Center": "kleinmuntz-center",
    "Fiddler Innovation Fellowship": "fiddler-innovation-fellowship",
    "Innovation Living-Learning Community": "innovation-llc",
    "CU Community Fab Lab": "cu-community-fab-lab",
    "Innovation Expo (Landuyt Center, Founders, Innovation LLC)": "innovation-expo",
    # Chicago
    "Chicago Quantum Exchange (CQE)": "chicago-quantum-exchange",
    "Discovery Partners Institute (DPI)": "discovery-partners-institute",
    "Duality Quantum Accelerator (CQE, Grainger, UChicago, Polsky)": "duality-quantum-accelerator",
    "ThinkChicago (City of Chicago, World Business Chicago, UI System, Landuyt Center, City Colleges of Chicago)": "thinkchicago",
    "Polsky Center for Entrepreneurship & Innovation at UChicago": "polsky-center",
    "University of Illinois – Chicago (UIC)": "uic",
}

# Headings that are themselves entries when no list follows them.
HEADING_ONLY_OK = {"Cancer Center at Illinois", "CU Community Fab Lab",
                   "Innovation Expo (Landuyt Center, Founders, Innovation LLC)"}


def norm(text):
    return re.sub(r"\s+", " ", text).strip()


class MapParser(HTMLParser):
    """Collects (tag, text) events for h2/h3/h4/li/p inside the partner list."""

    def __init__(self):
        super().__init__()
        self.events = []
        self.stack = []
        self.buf = None

    def handle_starttag(self, tag, attrs):
        if tag in ("h2", "h3", "h4", "li", "p"):
            if self.buf is not None:
                self._flush()
            self.buf = (tag, [])
        elif tag == "br" and self.buf is not None:
            self.buf[1].append(" ")
        if tag in ("ul", "ol"):
            self.events.append((tag, ""))

    def handle_endtag(self, tag):
        if self.buf is not None and tag == self.buf[0]:
            self._flush()
        if tag in ("ul", "ol"):
            self.events.append(("/" + tag, ""))

    def handle_data(self, data):
        if self.buf is not None:
            self.buf[1].append(data)

    def _flush(self):
        tag, parts = self.buf
        text = norm("".join(parts))
        if text:
            self.events.append((tag, text))
        self.buf = None


def extract(html):
    p = MapParser()
    p.feed(html)
    ev = p.events
    start = next(i for i, e in enumerate(ev) if e == ("h2", "List of Partners"))
    end = next(i for i, e in enumerate(ev) if i > start and e[0] == "h2")
    ev = ev[start + 1:end]

    rows, h3, h4 = [], "", ""
    pending_heading = None  # h4 that may be an entry if no list follows

    def emit(text, entry_type):
        path = [HEADING_LABELS.get(h3, h3)]
        if h4:
            path.append(HEADING_LABELS.get(h4, h4))
        # Overview groups sit above the first OVCRI block on the page.
        section = " > ".join(path)
        if not overview_done and h3 != "INTERNAL PARTNERS":
            section = "Overview > " + section
        if h3 == "External Partners & Programs" and not h4:
            section = "External Partners & Programs"
        rows.append({"section_path": section, "entry_as_listed": text,
                     "entry_type": entry_type})

    overview_done = False
    for i, (tag, text) in enumerate(ev):
        if tag == "h3":
            if pending_heading:
                emit(pending_heading, "heading")
                pending_heading = None
            h3, h4 = text, ""
            if text.startswith("Office of the Vice Chancellor"):
                overview_done = True
        elif tag == "h4":
            if pending_heading:
                emit(pending_heading, "heading")
            h4 = text
            pending_heading = text if text in HEADING_ONLY_OK else None
        elif tag == "ul":
            pending_heading = None
        elif tag == "li":
            emit(text, "list item")
        elif tag == "p" and rows and rows[-1]["entry_as_listed"].endswith("-"):
            # The page splits one Jump ARCHES item across an <li> and a <p>.
            rows[-1]["entry_as_listed"] = norm(rows[-1]["entry_as_listed"] + " " + text)
    if pending_heading:
        emit(pending_heading, "heading")

    for n, r in enumerate(rows, 1):
        r["raw_id"] = f"map-{n:03d}"
        key = r["entry_as_listed"]
        if key not in CANONICAL:
            sys.exit(f"Unmapped entry: {key!r} in {r['section_path']}")
        r["canonical_id"] = CANONICAL[key]
        r["note"] = "" if r["canonical_id"] else "Section pointer, not a standalone resource"
    return rows


def main():
    if "--live" in sys.argv:
        req = urllib.request.Request(MAP_URL, headers={"User-Agent": "Mozilla/5.0"})
        html = urllib.request.urlopen(req, timeout=30).read().decode("utf-8")
    else:
        html = SNAPSHOT.read_text(encoding="utf-8")
    rows = extract(html)
    cols = ["raw_id", "section_path", "entry_as_listed", "entry_type", "canonical_id", "note"]
    with OUT.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=cols)
        w.writeheader()
        w.writerows(rows)
    ids = {r["canonical_id"] for r in rows if r["canonical_id"]}
    print(f"{len(rows)} map entries -> {len(ids)} canonical resources. Wrote {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()

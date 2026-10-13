# Taxonomy

How resources are grouped, tagged, and staged. `scripts/validate.py` enforces the
allowed values below, so change both places together.

## Categories (site tabs)

Each resource gets exactly one category: the one a student would look under first.

| Category | Use it for | Examples |
|---|---|---|
| Pitch Competitions & Challenges | Competitions with judging, prizes, or a demo day, including make-a-thons and innovation challenges | Cozad New Venture Challenge, Health Make-A-Thon, Mottier Innovation Challenge |
| Accelerators & Incubators | Structured programs or spaces that move a venture forward over weeks or months | iVenture Accelerator, EnterpriseWorks incubator space |
| Funding & Grants | Money: grants, seed funds, proof-of-concept funding, venture capital | Illinois Ventures, IPOC |
| Courses & Training | Credit courses, majors, certificates, degrees, non-credit training | ILEE dual degree, SIE major, design thinking courses |
| Fellowships & Internships | Selective cohorts, fellowships, scholar programs, immersion trips, internships | City Scholars, Fiddler Innovation Fellowship, Silicon Valley Entrepreneurship Workshop |
| Maker Spaces & Labs | Physical places with tools for building and prototyping | The Shop at SCD, Illinois Maker Lab, IDEA Lab |
| Student Organizations | Registered student orgs | Founders, Zero2One, OTCR Consulting |
| Events & Community | Recurring events, festivals, networking, living-learning communities | Pygmalion, Innovation Expo, Innovation LLC |
| Advising & Legal/IP | One-on-one help: advising, legal and IP help, licensing, SBIR assistance, mentors in residence | IP Clinic, OTM, FAST Center |
| Campus Hubs | Umbrella units (colleges, centers, institutes, offices) whose main value is routing you to programs | Landuyt Center, Research Park, Siebel Center for Design |
| External Partners | Organizations not run by UIUC, such as regional networks, Chicago organizations, and national networks | Polsky Center, KEEN, Illinois Innovation Network |

### Changes from the starting list, and why

- **Pitch Competitions** is now **Pitch Competitions & Challenges**. Several map entries are judged
  challenges or make-a-thons rather than pitch events. They belong together because a student
  looking to compete wants all of them.
- **Courses & Degrees** is now **Courses & Training**. Some entries are certificates or non-credit
  training, not degree programs.
- **Fellowships & Internships** is new. City Scholars, SCD Scholars, the Fiddler Fellowship, the
  Silicon Valley trip, and Research Park internships are selective programs with applications.
  They are not courses, accelerators, or events, and folding them into another tab hid them.
- **Advising & Legal/IP** keeps its scope and also takes SBIR help and mentor-in-residence programs.
- **Campus Hubs** is new. About 20 map entries are parent organizations (Grainger, Gies,
  OVCRI, NCSA, IGB, and others). Putting them under a program tab would inflate that tab
  and confuse students. A separate tab keeps them findable without crowding the actionable tabs.
- **External Partners** keeps its scope. It holds organizations not run by UIUC, including
  networks that mostly serve faculty or staff. Their descriptions say plainly what a student can
  actually get from them.

### Category codes on the site

Round 2 kept the same 11 categories. The site labels each one with a short name and a
two-letter code, so category is never shown by color alone. The codes appear on tabs,
calendar markers, and the agenda. They are display-only and are not stored in the CSV.

| Code | Short name | Category |
|---|---|---|
| CP | Competitions | Pitch Competitions & Challenges |
| AC | Accelerators | Accelerators & Incubators |
| FN | Funding | Funding & Grants |
| CR | Courses | Courses & Training |
| FL | Fellowships | Fellowships & Internships |
| MK | Maker spaces | Maker Spaces & Labs |
| SO | Student orgs | Student Organizations |
| EV | Events | Events & Community |
| AD | Advising | Advising & Legal/IP |
| HB | Campus hubs | Campus Hubs |
| EX | Partners | External Partners |

To add or rename a category, change `CATEGORIES` in `scripts/build.py`, the `CAT` table in
`scripts/site/app.js`, and the `--c-XX` color in `scripts/site/styles.css` together.

## Subcategory

Free text, short, for nuance within a tab (for example "Engineering startup competition").
It does not drive filtering.

## Tag vocabulary

Tags are semicolon-separated in the CSV and must come from this list. Use 2 to 6 tags per
resource. In Airtable, import this field as **Multiple select**.

| Group | Tags |
|---|---|
| Money | funding, non-dilutive, equity, prizes |
| Format | pitching, competition, accelerator, incubator, mentorship, workshops, events, networking, community, housing, fellowship, internships, careers, consulting, coursework, certificate, degree |
| Building | workspace, maker-space, prototyping, design-thinking, customer-discovery |
| Commercialization | legal-ip, licensing, research-commercialization, sbir |
| Industry | deep-tech, health, agtech, quantum, social-impact, software, hardware |
| Audience and place | women, chicago, travel, faculty-researchers, grad-students, undergrads |

Rules:
- Tag what a student gets, not what the organization is. A college is not `coursework`
  unless the entry itself is about its courses.
- Use `faculty-researchers` when a resource mainly serves faculty or research teams, so
  students can tell it may not fit them.
- Use an audience tag (`undergrads`, `grad-students`) only when the official page restricts or
  targets that group.
- To add a tag, add it to this table and to `TAGS` in `scripts/validate.py` in the same commit.

## Stage

The venture stage a resource fits best.

| Value | Meaning |
|---|---|
| Idea | No product yet. Exploring a problem, forming a team, learning. |
| Prototype | Building or testing a first version, early customers or pilots. |
| Launched | Incorporated or selling, raising money, hiring. |
| Any | Useful at every stage, or not stage-specific (hubs, courses, communities). |

On the site, filtering by a stage also shows resources marked `Any`.

## Location

`UIUC` (on campus), `CU` (Champaign-Urbana, off campus), `Chicago`, `National`, `Online`.

## Status, recurrence, eligibility, confidence, application method, deadline type

See `schema.md` for allowed values and the evidence rules for each. On the site, filtering by
stage also includes `Any`. The deadline filter groups entries by `next_deadline` ranges and by
`deadline_type` (Rolling, None published, and Typical or Unknown as "Date to be confirmed").

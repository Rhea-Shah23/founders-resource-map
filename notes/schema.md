# Schema: data/resources.csv

One row per canonical resource. `data/resources.json` holds the same rows, with list fields
as arrays and booleans as true/false, plus a `map_sections` list derived from
`data/raw_map_entries.csv`.

Multi-value fields (`tags`, `source_urls`) are separated by semicolons (`;`) with no spaces
required. `apply_steps` uses ` | ` instead, because steps are sentences that can contain other
punctuation. In the JSON, `apply_steps` is an array.

Round 2 (2026-10-13) added `tagline`, `what_it_is`, `who_should_apply`, `choose_this_if`,
`application_method`, `apply_steps`, `apply_url`, `opens_date`, and `deadline_type`.

| Field | Type | Required | Allowed values / format | Airtable type |
|---|---|---|---|---|
| id | slug | Yes | lowercase letters, digits, hyphens; unique; never change once published | Single line text (primary field: use `name` instead, see README) |
| name | text | Yes | official name, unique | Single line text |
| tagline | text | Yes | plain-English label of what it is, max 90 characters, no final period, does not repeat the name. Shown under the name everywhere | Single line text |
| description | text | Yes | 1 to 2 sentence summary composed from the three fields below. Own words, no em dashes. See "Why description stays" | Long text |
| what_it_is | text | Yes | one concrete sentence, no unexplained jargon | Long text |
| who_should_apply | text | Yes | one sentence naming the student type and stage, or saying plainly that students cannot apply | Long text |
| choose_this_if | text | Yes | one sentence starting with "You want to" or "You are" | Long text |
| good_for | text | Yes | short phrase | Single line text |
| category | enum | Yes | one of the 11 categories in `taxonomy.md` | Single select |
| subcategory | text | No | short phrase | Single line text |
| parent_org | text | No | owning unit or organization | Single line text |
| location | enum | Yes | UIUC, CU, Chicago, National, Online | Single select |
| tags | list | Yes | semicolon-separated, from the vocabulary in `taxonomy.md` | Multiple select |
| ideal_participant | text | No | who should use it | Single line text |
| stage | enum | Yes | Idea, Prototype, Launched, Any | Single select |
| url | URL | No* | official page, final URL after redirects | URL |
| contact_email | email | No | only if shown on an official page | Email |
| application_method | enum | Yes | Online form, Email, Pitch submission, Info session or event, Course registration, Contact staff, Walk-in or open access, Not applicable, Unknown | Single select |
| apply_steps | list | No | up to 3 short imperative steps separated by ` \| ` (space, pipe, space). Only from an official page | Long text |
| apply_url | URL | No | the specific application, registration, booking, or contact page, only if different from `url` | URL |
| status | enum | Yes | Active, Inactive, Unknown | Single select |
| recurrence | enum | Yes | Annual, Rolling, Per semester, One-time, Unknown | Single select |
| opens_date | date | No | ISO `YYYY-MM-DD`, the date applications open, only when an official page states it | Date (ISO) |
| next_deadline | date | No | ISO `YYYY-MM-DD`, the next date a student must act by (application, registration, RSVP, nomination). If it is an event date, start `deadline_note` with `Event:` so the site labels it "Next event" | Date (ISO) |
| deadline_type | enum | Yes | Confirmed, Typical, Rolling, None published, Unknown (definitions below) | Single select |
| deadline_note | text | No | context and evidence: past cycles, usual timing, source page | Long text |
| cost_or_funding | text | No | verified cost, prize, or award facts only | Single line text |
| student_eligible | enum | Yes | Yes, No, Varies, Unknown | Single select |
| on_university_map | boolean | Yes | TRUE, FALSE | Checkbox |
| source_urls | list | No* | semicolon-separated URLs used as evidence | Long text |
| last_verified | date | Yes | ISO date the row was checked by a person or researcher, not a date from the page | Date (ISO) |
| confidence | enum | Yes | High, Medium, Low | Single select |
| needs_confirmation | boolean | Yes | TRUE, FALSE | Checkbox |
| notes | text | No | renames, broken links, merge decisions, caveats | Long text |

\* `url` is blank only when no official page could be found; such rows always have
`needs_confirmation=TRUE`. `source_urls` is required when `status` is Active.

## Round 2 fields in detail

### tagline
A label that says what the thing is, in words a first-year student would use. Fill it for every
row, even when the name looks clear, so the list scans the same way.
Example: `Technology commercialization program for engineering students`.

### what_it_is, who_should_apply, choose_this_if
These three rows make up the summary block on each resource page.
- what_it_is: `A spring clinic where law students draft patent and trademark filings for campus startups.`
- who_should_apply: `UIUC student founders with an invention or brand to protect; a company is not required.`
- choose_this_if: `You want to file a patent or trademark without paying attorney fees.`

### Why description stays
We kept `description` instead of dropping it. Airtable cards, the future Founders website,
and Luma event pages each need one standalone blurb, and they should not have to stitch
three fields together. `description` is a 1 to 2 sentence summary composed from what_it_is and
who_should_apply. The directory list shows `tagline` plus `choose_this_if`. The resource page
shows the three summary rows and does not repeat `description`.

### application_method
| Value | Use when |
|---|---|
| Online form | an application, interest, or booking form on the web |
| Email | the official page says to email a person or address |
| Pitch submission | you apply by submitting a pitch, deck, or video |
| Info session or event | the first step is attending a session, mixer, or event (including RSVP) |
| Course registration | you join by registering for a class or declaring a program through the registrar |
| Contact staff | you reach out to staff (appointment, call, or general contact) and no form is described |
| Walk-in or open access | you just show up: open hours, public spaces, free public events |
| Not applicable | there is nothing for a student to apply to (a college, a staff network) |
| Unknown | we could not find how to apply |

Example `apply_steps`: `Fill out the interest form | Attend the info session | Submit a 2-minute pitch video`.

### deadline_type
| Value | Meaning | next_deadline |
|---|---|---|
| Confirmed | an official page shows this specific date for the upcoming cycle, and that page is in `source_urls` | required |
| Typical | no current date is posted, but an official page or past-cycle record shows when it usually happens. The evidence goes in `deadline_note` | only if a specific date can be justified, usually blank |
| Rolling | applications or requests are accepted continuously | blank |
| None published | the program runs without an application deadline | blank |
| Unknown | not found | blank |

Example `deadline_note` for Typical: `2026 cycle closed March 6, 2026; 2027 date not yet posted (program apply page).`

## Evidence rules

- **status**: `Active` only if an official page shows current activity (a 2026 or upcoming
  date, an open application, or a recent event), with that page in `source_urls`. `Inactive`
  only with clear evidence it ended. Otherwise `Unknown`.
- **confidence**: `High` = official page confirms the core facts. `Medium` = credible secondary
  source. `Low` = inferred.
- **needs_confirmation**: TRUE when confidence is not High, or when a deadline, cost, eligibility,
  or URL that matters for this resource is blank or unverified. Every such row has a matching
  line in `notes/to_confirm.md`.
- **next_deadline**: never guessed. A past date is moved to `deadline_note` and the field is cleared.
- **status** after a deadline: if the last deadline or event passed and no new cycle is posted,
  status is `Unknown`, not `Active`, unless the resource is an ongoing service with current hours
  or staff.
- **apply_steps**: only steps an official page describes. Blank is better than generic filler.

## What `scripts/validate.py` enforces

Errors: required fields; allowed values for every enum (including `application_method` and
`deadline_type`); a tagline of at most 90 characters with no final period; `choose_this_if`
starting with "You want to" or "You are"; one sentence each for the three summary fields; no em
or en dashes and no exclamation points in user-facing text; at most 3 `apply_steps`, joined by
` | `, and none when the method is Unknown or Not applicable; `apply_url` is a single URL that
differs from `url`; Confirmed requires `next_deadline` and `source_urls`; Typical requires a
`deadline_note`; any other `deadline_type` must leave `next_deadline` blank; ISO dates, with
`opens_date` no later than `next_deadline`; `needs_confirmation=TRUE` whenever the application
method or deadline type is Unknown, the deadline is only Typical, or confidence is not High.

Warnings: a passed `next_deadline`, long descriptions, rows with a real application method but
no `apply_steps`, and rows with no official URL.

## Example row

| Field | Value |
|---|---|
| id | cozad-new-venture-challenge |
| name | Cozad New Venture Challenge |
| tagline | Campus-wide startup competition with workshops, mentors, and prize money |
| description | (see resources.csv) |
| choose_this_if | You want to turn an early startup idea into a funded venture with coaching along the way. |
| good_for | Getting startup funding and feedback through a campus-wide competition |
| category | Pitch Competitions & Challenges |
| subcategory | Campus-wide startup competition |
| parent_org | Landuyt Center for Entrepreneurship |
| location | UIUC |
| tags | competition;pitching;prizes;mentorship;funding |
| ideal_participant | UIUC student teams with a startup idea |
| stage | Any |
| url | (see resources.csv) |
| application_method | Online form |
| apply_steps | (only from the official page; see resources.csv) |
| status | Active |
| recurrence | Annual |
| next_deadline | (blank unless verified) |
| deadline_type | Confirmed, Typical, or Unknown, depending on what the official page shows |
| student_eligible | Yes |
| on_university_map | TRUE |
| last_verified | 2026-10-13 |
| confidence | High |
| needs_confirmation | TRUE |

The live row in `data/resources.csv` is the authority. This example shows the format only.

## data/raw_map_entries.csv

| Field | Meaning |
|---|---|
| raw_id | `map-001` and up, in page order |
| section_path | where it appears on the map, for example `Grainger > Landuyt Center` |
| entry_as_listed | exact text from the map |
| entry_type | `list item`, or `heading` for headings with no list under them that name a resource |
| canonical_id | the `id` in resources.csv this entry maps to (blank for section pointers) |
| note | why an entry has no canonical id, or how it was merged |

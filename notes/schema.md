# Schema: data/resources.csv

One row per canonical resource. `data/resources.json` holds the same rows, with list fields
as arrays and booleans as true/false, plus a `map_sections` list derived from
`data/raw_map_entries.csv`.

Multi-value fields are separated by semicolons (`;`) with no spaces required.

| Field | Type | Required | Allowed values / format | Airtable type |
|---|---|---|---|---|
| id | slug | Yes | lowercase letters, digits, hyphens; unique; never change once published | Single line text (primary field: use `name` instead, see README) |
| name | text | Yes | official name, unique | Single line text |
| description | text | Yes | 1 to 2 plain-English sentences: what it is and what a student gets. Own words, no em dashes | Long text |
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
| status | enum | Yes | Active, Inactive, Unknown | Single select |
| recurrence | enum | Yes | Annual, Rolling, Per semester, One-time, Unknown | Single select |
| next_deadline | date | No | ISO `YYYY-MM-DD`, only a verified upcoming date a student can act on: an application, registration, or RSVP deadline, or the date of an open event. If it is an event date, start `deadline_note` with `Event:` so the site labels it "Next event" | Date (ISO) |
| deadline_note | text | No | context, such as past deadlines or "dates usually posted in January" (only if sourced) | Long text |
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

## Example row

| Field | Value |
|---|---|
| id | cozad-new-venture-challenge |
| name | Cozad New Venture Challenge |
| description | (see resources.csv) |
| good_for | Getting startup funding and feedback through a campus-wide competition |
| category | Pitch Competitions & Challenges |
| subcategory | Campus-wide startup competition |
| parent_org | Landuyt Center for Entrepreneurship |
| location | UIUC |
| tags | competition;pitching;prizes;mentorship;funding |
| ideal_participant | UIUC student teams with a startup idea |
| stage | Any |
| url | (see resources.csv) |
| status | Active |
| recurrence | Annual |
| next_deadline | (blank unless verified) |
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

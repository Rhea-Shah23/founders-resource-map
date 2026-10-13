# Founders Resource Map

A student-built directory of entrepreneurship resources for University of Illinois
Urbana-Champaign students, with descriptions, links, deadlines, and filters. Built by the
Founders: Illinois Entrepreneurs team.

> Student-run project, not an official University of Illinois resource.

![Desktop view](docs/screenshots/desktop.png)

## Why this exists

The University's [Entrepreneurship Ecosystem Map](https://entrepreneurship.illinois.edu/about-our-ecosystem/entrepreneurship-ecosystem-map)
lists about 127 partners and programs. It is a useful starting point, but for a student trying to
find help it has real problems:

- **No descriptions.** Entries are bare names, so you cannot tell what a program does or who it is for.
- **No links per resource.** The list has no links. The only links are eight footer links, and one of them still points to the old `tec.illinois.edu` domain.
- **No dates or deadlines.** You cannot tell what is open now or what closes soon.
- **No search or filtering.** It is a long set of bulleted lists organized by org chart.
- **Duplicates and stale entries.** 26 resources appear more than once, and several listed programs look renamed or discontinued.
- **Hard to scan.** It is a plain page with mixed casing and no visual hierarchy.

This directory fixes those problems. It has one card per resource with a plain-English
description, an official link, verified dates, category tabs, search, and filters. It also
adds resources the map is missing, such as Product Space. See `notes/gap_analysis.md` for the
evidence.

**Current numbers (2026-10-13):** 127 map entries, 101 resources in the directory (93 from the
map after deduplication, 8 added by Founders). 88 resources are marked unverified until the team
confirms them.

## Folder layout

```
README.md
data/
  raw_map_entries.csv          every entry exactly as listed on the map, with its section path and canonical id
  resources.csv                source of truth: one row per canonical resource, ready to import into Airtable
  resources.json               same data, generated for the site
  map_snapshot_2026-10-13.html saved copy of the University map page used for extraction
notes/
  schema.md                    every field, its type, allowed values, and an example
  taxonomy.md                  categories (site tabs), tag vocabulary, stage values, usage rules
  gap_analysis.md              what the map has and lacks, what we added, what looks defunct, with evidence
  to_confirm.md                checklist of facts a person must verify, split into batches
scripts/
  extract_map.py               parses the map into raw_map_entries.csv
  build.py                     resources.csv -> resources.json + docs/index.html
  validate.py                  checks the CSV and every URL, writes results into to_confirm.md
  site_template.html           the site's HTML, CSS, and JS (build.py injects the data)
  test_site.cjs                headless browser smoke test and screenshots
docs/
  index.html                   the shareable site: one self-contained file
  screenshots/                 desktop and mobile screenshots
```

## Open the site locally

Double-click `docs/index.html`. It works offline with no server and no build step, because the
data is embedded in the file. (The fonts load from Google Fonts when you are online and fall back
to system fonts when you are not.)

## Publish with GitHub Pages

1. Push the repo to GitHub.
2. Go to **Settings > Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, branch `main`, folder **`/docs`**. Save.
4. After a minute the site is live at `https://<org-or-user>.github.io/founders-resource-map/`.

## Edit the data, then regenerate the site

`data/resources.csv` is the source of truth. Never edit `resources.json` or `docs/index.html` by hand.

```bash
# 1. Edit data/resources.csv (a spreadsheet app or a text editor; keep UTF-8 and the header row)
# 2. Check it
python3 scripts/validate.py            # add --no-urls for a quick offline check
# 3. Rebuild the JSON and the site
python3 scripts/build.py
# 4. Optional: browser test and fresh screenshots (needs Node)
npm i --no-save playwright && npx playwright install chromium
node scripts/test_site.cjs
```

All Python scripts use only the standard library (Python 3.9+). `validate.py` exits with an
error if the CSV breaks the schema, and lists URLs that did not load in `notes/to_confirm.md`.
Some sites block scripts, so check those URLs in a browser before changing anything.

To re-extract the University map (for example, if it changes): `python3 scripts/extract_map.py --live`.
If the script stops on an "Unmapped entry", add that entry to the `CANONICAL` table in the script.

## Import into Airtable

The Airtable free plan allows 1,000 records per base and 5 editors, which is enough for this project.

1. Create a base and choose **Import > CSV file**, then pick `data/resources.csv`.
2. Set field types after import (see `notes/schema.md` for the full list):

| Field type | Fields |
|---|---|
| **Single select** | `category`, `location`, `stage`, `status`, `recurrence`, `student_eligible`, `confidence` |
| **Multiple select** | `tags` (Airtable splits on commas, so first convert semicolons: in the CSV, replace `;` with `,` in the tags column only, or import as text and use a formula/automation to split) |
| **Checkbox** | `on_university_map`, `needs_confirmation` (TRUE becomes checked) |
| **Date (ISO format)** | `next_deadline`, `last_verified` |
| **URL** | `url` |
| **Email** | `contact_email` |
| **Long text** | `description`, `deadline_note`, `notes`, `source_urls` |
| Single line text | everything else |

3. Make `name` the primary field. Keep `id` as a normal field and never change an existing id, because the site and any future integrations (Luma, the larger website) key on it.
4. Create these views:
   - **By category:** Grid view grouped by `category`, sorted by `name`.
   - **Closing soon:** filter `next_deadline` is on or after today, sorted by `next_deadline` ascending.
   - **Active only:** filter `status` = Active.
   - **Needs confirmation:** filter `needs_confirmation` is checked, grouped by `category`. This is the team's work queue.
5. To update the site from Airtable: **Download CSV** from the grid view (all fields, original column order), save it over `data/resources.csv`, convert tags back to semicolons if you changed them, then run `validate.py` and `build.py`.

## Data verification policy

A wrong deadline in front of students is worse than a blank one, so:

- **Never guess.** Deadlines, dates, costs, award amounts, eligibility, and contact info come only from an official page. If you cannot verify it, leave it blank, set `needs_confirmation=TRUE`, and add a line to `notes/to_confirm.md` saying exactly what to check and where.
- **Status** is `Active` only when an official page shows current activity (a 2026 or upcoming date, an open application, or a recent event), with that page in `source_urls`. `Inactive` needs clear evidence that the program ended. Otherwise it is `Unknown`.
- **Confidence:** High = an official page confirms it. Medium = a credible secondary source. Low = inferred.
- **last_verified** is the date a person checked the row, not a date shown on the page.
- **Descriptions** are written in our own words, 1 to 2 sentences, with no copied site text and no em dashes.
- **The site shows uncertainty.** Unverified entries carry an "Unverified" badge and a notice in the detail panel. Unknown status is shown as "Status unknown".

## Suggest or correct a resource

- **Teammates:** pick a batch in `notes/to_confirm.md`, verify the items, edit `data/resources.csv` (or Airtable), run `validate.py` and `build.py`, and open a pull request. Put the evidence URL in `source_urls` and set `last_verified` to the day you checked.
- **New resource:** add a row with a new lowercase slug `id`, `on_university_map=FALSE`, and the evidence in `source_urls`, then add a line to the "Resources added by Founders" table in `notes/gap_analysis.md`.
- **Anyone else:** use the "Suggest a resource" link in the site footer. It is a `mailto:` placeholder (`founders-resources@example.com`), so replace it in `scripts/site_template.html` with the team's real address and rebuild.

## Disclaimer

This is a student-run project by Founders: Illinois Entrepreneurs. It is not an official
University of Illinois resource and is not endorsed by the University. Program details change;
always confirm on the official site before applying.

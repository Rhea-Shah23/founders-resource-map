# Round 2 audit

Snapshot of `data/resources.csv` on 2026-10-13, taken before any round 2 change. These counts
set the research priorities for this round. Base: 101 resources.

## Headline numbers

| Check | Count | Share |
|---|---|---|
| `next_deadline` blank | 94 | 93% |
| ...and `deadline_note` also blank (no date information at all) | 39 | 39% |
| ...but `deadline_note` mentions a past cycle (a pattern we can document as Typical) | 37 | 37% |
| Recurring programs (Annual or Per semester) with no `next_deadline` | 32 of 38 | 84% |
| Descriptions that are vague, describe the map listing, or restate the name | 13 | 13% |
| Further descriptions that lean on unexplained jargon or acronyms | 11 | 11% |
| No structured application method (no field exists yet) | 101 | 100% |
| Never say how to apply anywhere in description or deadline note | 60 | 59% |
| Marked `Active` although the last posted cycle has closed and no new one is posted | 15 | 15% |
| `needs_confirmation=TRUE` | 88 | 87% |

Status mix: 56 Active, 43 Unknown, 2 Inactive. Confidence mix: 71 High, 24 Medium, 6 Low.

## Descriptions that do not say what the thing is

Describes the map listing instead of the resource:
- `brand-hub-certificates`: says it is "listed on the ecosystem map" and that no page could be found.
- `translational-research-facility`: says no facility by that name exists, with no next step for a student.
- `research-park-corporate-startup-intros`: says no official page describes the service.

Generic enough to fit any organization:
- `founders`: "connects aspiring founders with mentors" says nothing about meetings, projects, or how to join.
- `otcr-consulting`: no sense of project type, time commitment, or recruiting.
- `keen`: "promotes an entrepreneurial mindset" is jargon.
- `kleinmuntz-center`: "supports turning genomics research into real-world impact" is abstract.
- `illinois-social-innovation`: lists program types without one concrete thing a student does.
- `illinois-university-incubator-network`: says students "get little directly" and stops there.

Fragment, or restates the name:
- `landuyt-courses-certificates`: a sentence fragment that starts with the program name.
- `research-park-workforce-development`, `research-park-recruitment-services`: open by repeating the name.
- `scd-the-shop`: "The Shop is SCD's makerspace" uses the name and an acronym to explain the name.

Unexplained jargon (the reader has to already know the acronym): `health-make-a-thon` and
`carle-illinois` (CI MED), `enterpriseworks` (EW), `scd-design-thinking-courses` (DTX),
`landuyt-courses-certificates` and `innovation-llc` (TE), `scd-workshops` (SCD, SHIFT),
`ncsa` (SPIN), `cancer-center-at-illinois` (NCI), `fast-center-sbir-sttr` and `nsf-i-corps`
(SBIR, STTR used without a gloss).

## Most opaque titles

Ranked by how little the name tells a first-year student. Each gets a tagline this round.

| Rank | Name | Why it is opaque |
|---|---|---|
| 1 | AxisMED | Brand name. Nothing says "student biomedical startup team". |
| 2 | Catalyze: Professional Networking Event | "Catalyze" is a brand, and the subtitle does not say it is a job fair for tech employers. |
| 3 | Jump ARCHES | A long acronym. Students cannot tell it funds health-care engineering research. |
| 4 | SocialFuse | It sounds like a social media tool. It is a startup mixer and pitch night. |
| 5 | Zero2One | No hint that it is a student startup incubator. |
| 6 | EntreCORPS | Unclear that it is free student consulting for startups. |
| 7 | Pygmalion Festival | Reads as an arts festival only, which it mostly is. |
| 8 | KEEN, MEEN, EILC, ELLC Roundtable | Four acronyms for staff and faculty networks students cannot join. |
| 9 | Duality Quantum Accelerator | "Duality" says nothing, and "accelerator" hides that it is in Chicago and now runs through Alchemist. |
| 10 | IPOC, OTM, OVCRI, NCSA, IGB, DPI | Office and institute acronyms. |
| 11 | Alchemy Technology Foundry | Neither "alchemy" nor "foundry" explains a student product-engineering lab. |
| 12 | CUBE Consulting | The acronym hides "business and engineering". |
| 13 | Orange & Blue Ventures | Could be a VC firm, a club, or a fund. It is a student-run investing program. |
| 14 | Catapult, I-Start, AWARE | Program brand names with no hint of what you get. |
| 15 | Mottier, Cozad, Fiddler, Kleinmuntz | Donor names. Cozad is well known on campus, but the others are not. |
| 16 | ThinkChicago, Polsky Center | It is not clear who can use them or for what. |
| 17 | Product Space UIUC, Enactus, Founders | Club names that do not say what members do. |

## Application method

No row has a structured way to apply. Descriptions mention a form, email, RSVP, nomination,
or appointment for 41 rows, but only in passing. The other 60 give a student no next step.

## Status drift

These 15 rows are `Active` only because a cycle ran recently. In each, the last deadline or
event has passed and no new cycle is posted: `mottier-innovation-challenge`,
`cozad-new-venture-challenge`, `iventure-accelerator`, `ipoc`, `city-scholars`, `cube-consulting`, `enactus`, `illini-vca`,
`agtech-innovation-summit`, `founders-week`, `pygmalion`, `silicon-valley-workshop`,
`carle-illinois`, `discovery-partners-institute`, `duality-quantum-accelerator`. (The last three are
ongoing institutions, so their status should rest on other current evidence, not on one past event.) Under the round 2
rule, status becomes `Unknown` unless a current or upcoming cycle is posted, or the resource
is an ongoing service with current hours.

## Research priorities for round 2

1. **Dates for recurring programs.** Check the 32 recurring programs with no date first. Look at
   the program page, the apply page, the Landuyt calendar, and Research Park events for
   2026 to 2027 dates. Record past cycles in `deadline_note` so a Typical pattern is visible.
2. **Taglines for opaque names.** Start with the table above.
3. **Application steps.** Start with the 60 rows that never say how to apply, beginning with
   competitions, accelerators, fellowships, and student orgs, where a missed step costs a cycle.
4. **Status re-check.** Re-check the 15 rows in Status drift.
5. **Rewrite vague and jargon descriptions.** Rewrite the 24 rows above using the new
   what it is, who should apply, and choose this if fields.

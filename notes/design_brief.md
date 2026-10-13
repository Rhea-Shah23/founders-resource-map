# Design brief: Founders Field Guide

Written 2026-10-13 for round 2. It covers the reference study, the principles we took from
it, the three concepts we weighed, the design system as built, and the critique loop with
before and after screenshots.

The goal is a directory people remember and still understand in five seconds. The surface is
distinctive. Search, filters, the calendar, and apply buttons stay conventional.

## Step A: references

Method: each homepage and one inner page was captured with Playwright at 1280x800 and 390x844.
We viewed the screenshots and read the computed type, color, spacing, and radius values from the
live pages. The notes below are ours. Nothing was copied: no layout, branding, illustration, or
copy.

| Site | What works | What to learn | What not to copy |
|---|---|---|---|
| **YC Startup Directory** | Filter-first. Every facet option shows a count, a big search box sits above the results, and a "Showing 40 of 1,000+" line follows. Each row is name, location, a one-line tagline, and tags. A serif H1 on a warm off-white page gives it credibility without coldness. | Rows beat cards for 100+ items. A count next to every option. Always a one-line "what it is". | 10px uppercase tags (too small for students, and illegible on a projector). |
| **YC /apply** | The deadline, the decision date, and what happens if you are late fit in one plain paragraph above a single button. | Say the date and its consequence in words, near the action. | Prose-only steps. We need structured fields the calendar can use. |
| **Techstars** | Breadcrumbs, a small eyebrow label above the title, and one strong apply band at the end. | An eyebrow (the category) above every detail title. | An 82px hero over photography that pushes content below the fold, and program pages with no steps, only buttons. |
| **Antler** | Big stat numerals with a thin rule between them. Rectangular buttons with a small radius. | A stat row in the masthead. | A floating settings button over content, and carousels that clip cards. |
| **Stripe** | Restrained color, light-weight large headlines, and a two-tone headline trick. | Hierarchy carried by weight and color rather than boxes. | The animated gradient, live counters, and chat popups. |
| **Stripe Atlas** | The clearest application steps in the set: numbered markers, short verb-led text, 1 to 3 lines each. | Numbered steps on every resource page. | The diagonal gradient slab. |
| **Product Hunt** | Ranked rows with fixed-width counters on the right that line up down the list. A countdown card for the thing that closes soon. | A fixed-width deadline column that aligns down the list, and urgency treatment within 7 days. | Inline ads, sign-in overlays, and a crowded mobile header. |
| **Indie Hackers** | Deadlines written as sentences ("voting ends in 8 hours"). A rank gutter on the left. | Relative time next to dates ("In 2 days"). A number gutter. | Dim slate-on-navy body text at 14px. |
| **Luma** | An agenda grouped by day, time first, status chips at 12px with a small radius, and a mini month calendar with dots. On a phone it drops the month and keeps the list. | Agenda beside the month grid. On a phone, agenda only. Students already know this pattern. | Per-event custom themes that hurt legibility. |
| **Linear** | Text-only filter tabs where the active tab is just stronger text. A changelog with a date gutter. Calm density and careful type details. | Text tabs with a single underline. A date gutter in the agenda. | Dark-only theme, and variable-font weight tuning that will not survive fallbacks. |
| **read.cv** | Offline ("deployment paused"), so we skipped it. | | |
| **Are.na** | Radical restraint, and a hairline key/value table for metadata. | Hairline key/value rows for Details and Sources. | A homepage with almost no hierarchy, and a bottom tab bar that covers content. |
| **It's Nice That** (editorial index) | The item count in the title, scoped search, and a "refreshed" freshness stamp. | Show "Last verified" on every entry and the data date in the footer. | Masonry with uneven images. We have no imagery. |
| **a16z speedrun** (extra) | The deadline and program dates in the first sentence of the apply page. Bold-label bullets. | Bold labels on summary rows. | Autoplay video, and -6px tracking. |
| **Neo Scholars** (extra) | Fast routing into the three programs. | A clear "start here" for hubs. | White text on pale blue (it fails contrast). |
| **Contrary Research** (extra) | A horizontal dropdown filter bar between hairlines, and alphabetical sections with counts. | A dropdown filter bar instead of a side rail, and section headers with counts. | A subscribe modal over the empty state. |

Patterns that every site handles badly: empty states. YC shows one sentence. Contrary shows big
type with a popup on top. We name the active filters, suggest what to loosen, and give a
Clear all button. The calendar's empty state also counts the matching entries that still have
dates to be confirmed.

## Principles

1. **Answer three questions in one row.** Each row says what it is, whether it is for you, and
   what to do next. Name, tagline, "choose this if", deadline, how to apply, in that scan order.
2. **Rows, rules, and whitespace, not boxes.** Thin rules and generous spacing hold a long list
   together. Boxes are reserved for the one thing that needs to stand apart: key dates.
3. **Honest about time.** Confirmed and Typical dates look different by shape, not only by
   color. Nothing without a date disappears. It moves to "Rolling and unscheduled".
4. **Orange means act now.** It marks today, the primary apply button, the selected tab, and
   deadlines inside 7 days. Nothing decorative is orange.
5. **Conventional controls, distinctive surface.** Native selects, a normal search box, standard
   tabs, a real month grid. The personality lives in type, numbering, color blocking, and the
   season strip.
6. **Uncertainty stays visible but quiet.** Every unverified entry is marked, but the mark is
   small enough that 77 marked rows do not shout.
7. **One family of parts.** Every component shares a 4px radius, a 1px stroke, a 1.5px icon
   stroke, the same focus ring, and the same 160 to 220ms ease-out.
8. **Works on a projector and a phone.** 16px minimum body text, AA contrast everywhere, tap
   targets of 44px, and no horizontal scroll at 390px.

## Step B: concepts

**1. Field guide.** The directory reads as an editorial catalog. Every resource has a permanent
number (No. 001 to No. 101), sections are numbered with their entry counts, and the detail page
is set like a guide entry, with labeled rows and margin notes. You scan it like a printed guide,
and a single page prints as a clean handout.

**2. Season map.** The home view is a horizontal timeline of the academic year, with programs
sitting on the weeks they open and close, so the calendar is the centerpiece. It is memorable,
but only 12 entries have confirmed upcoming dates and 40 still need dates. A timeline home
would be mostly empty, and it would push the 49 rolling or no-deadline resources (makerspaces,
advising, offices) off the main view. That hurts the student who just wants a 3D printer.

**3. Stage ladder.** Primary navigation is your stage (just an idea, building a prototype,
launched), with categories as a secondary filter. It is appealing in theory, but 58 of 101
resources are honestly "Any stage". The ladder would put most entries on every rung and teach
students nothing. Stage works better as a filter.

**Choice: Field guide, with a season strip as its signature element.** The guide structure
keeps the directory fast to scan and easy to print. It also suits a student-edited publication:
the masthead carries a dateline ("Fall 2026 edition"), and every entry has a permanent number
that teammates can cite ("fix No. 044"). From the season map we kept one element: a thin
strip across the navy masthead showing the academic year from August to July, with an orange
"Today" line and a dot for every dated deadline, colored by category. That is the thing people
will describe to a friend ("the orange line shows where we are in the year, and the dots are
what's coming"). It reacts to every filter, it links to each dated resource, and it never gets in
the way, because the directory sits right below it.

## Step C: design system (implemented as CSS variables in `scripts/site/styles.css`)

**Color.**
- Illinois navy `#13294B` is the ink for all text and the large structural block: the masthead
  and the footer bookend the page in navy.
- The page itself is warm paper `#F5EFE3`, with `#EBE3D2` for the key-dates panel and hover rows.
- Supporting neutrals: secondary text `#4A5873` (6.2:1 on paper) and rules `#CDBFA5`.
- Orange `#FF5F05` is used only as a fill: the today marker, primary buttons (navy text on
  orange, 4.8:1), the selected-tab underline, and the urgency dot. Orange text uses `#B53D00`
  (5.0:1 on paper).
- Category inks are eleven muted printing inks, from brick to slate. All reach at least 5.5:1
  on paper, and white reaches 6.3:1 or better on each.
- Category color is never the only cue. Every category carries a two-letter code (CP, AC, FN,
  CR, FL, MK, SO, EV, AD, HB, EX) on tabs, calendar markers, and agenda rows.

**Deadline types by shape.**

| Type | Mark | Calendar marker |
|---|---|---|
| Confirmed | solid dot | filled |
| Typical | dashed ring | outlined and dashed, labeled "Typical, date not yet posted" |
| Rolling | open loop | not on the calendar |
| None published | bar | not on the calendar |
| Unknown | dotted ring | not on the calendar |

**Typography.**
- Display: Fraunces, an old-style serif with optical sizes, for headlines, section names,
  resource names, and big date numerals. It gives the guide its editorial voice.
- Text: Atkinson Hyperlegible, designed for low-vision readers, which pays off on a projector.
- Labels: IBM Plex Mono for numbers, dates, codes, and letterspaced small labels. It also gives
  tabular figures.
- Fallbacks: Iowan Old Style or Georgia, then system sans, then system mono.
- Avoided: Inter, Roboto, Arial, and Space Grotesk.
- Scale: a 1.25 ratio (12, 14, 16, 18, 20, 25, 31, 39, 49, 61).
- Reading text is capped near 58 to 68 characters.
- Real quotation marks are used in UI copy, and list labels are letterspaced uppercase mono.

**Layout.**
- Spacing scale: 4, 8, 16, 24, 32, 48, 72.
- Content width: 1240px.
- Directory row grid: number, main text, a 160px deadline column, and a 190px how-to-apply
  column, so dates line up down the page.
- Sections open with a 2px navy rule, and rows are divided by 1px rules.
- The resource page uses a main column plus a 340px aside for key dates and related entries.
- On phones the resource page reads in order: summary, how to apply, key dates, details, sources.

**Components.**
- Radius 4px, stroke 1px, icon stroke 1.5px (custom inline SVG: form, mail, pitch, event, course,
  staff, door, calendar, download).
- Focus ring: a 2px navy ring offset by paper.
- Hover: rows and quiet buttons take the `#EBE3D2` panel tone.
- Active chips are filled navy and removable. The deadline menu is a popover with radio options,
  counts, and a date range.
- No drop shadows, except a light one under the open deadline popover. No gradients, no glass,
  no emoji.

**Motion.**
- First load: rows fade up with a 24ms stagger.
- After that, filter results fade in over 220ms, so context is kept without a jump.
- The deadline popover and chips appear in 160ms.
- Arriving at a resource from the calendar briefly tints its header orange.
- `prefers-reduced-motion` removes all of it.

**Voice.**
- Plain and specific, like a student editor. Examples: "Every entrepreneurship resource at
  Illinois, in one guide", "Worth a look next", "Rolling and unscheduled", and "Nothing matches all
  of that."
- No exclamation points, no em dashes, no filler, no lorem ipsum.
- No Block I logo or wordmark. The footer carries "Student-run project, not an official University
  of Illinois resource."

## Step D: details we spent time on

- **Resource page.**
  - An at-a-glance column holds the deadline, the primary apply button, and the step count, so
    acting needs no scrolling.
  - "Choose this if" is the one orange label, and its row is set bold.
  - Empty rows are never rendered.
  - Entries with no steps say so honestly and point to the official page.
- **Empty states.** The directory names what to loosen. The calendar counts the matching entries
  whose dates are still to be confirmed.
- **Footer.**
  - A navy bookend with three short columns: where the data came from, how fresh it is, and how
    to help.
  - Then the disclaimer, and a colophon naming the typefaces.
- **First paint.** The masthead headline and lede rise in 320ms. Stats are in the HTML, so the
  page reads correctly before the script runs.
- **Print handout.**
  - One letter page per resource, verified for all 101 by a test script.
  - Order: summary, key dates, steps, details.
  - Links print as URLs. Buttons, navigation, and related links are dropped.
- **How-to-use line.** It sits near the top and disappears after the first interaction. It
  stays gone, remembered in local storage when the browser allows it.

## Step E: critique loop

Screenshots live in `docs/screenshots/critique/` (pass 0 is the first build, then pass 1 and
pass 2). Final screenshots are in `docs/screenshots/`.

### Pass 0 (first build)

| Check | Finding |
|---|---|
| Squint test | Hierarchy reads: navy block, then section rules, then names. But the masthead takes a full screen and the content starts below the fold at 1280x860. |
| Five-second test | The headline says what it is. On a phone, the stats and strip take the whole first screen and the directory starts two screens down. |
| Generic look? | Rows, type, and numbering feel like ours. The filter row wraps awkwardly (Order alone on a second line). |
| Signature concept | The season strip is visible, but dots stacked downward cover the month labels. |
| Accessibility | Contrast passes. The programmatic focus on the resource title draws a box around the h1. |
| Orange | Used sparingly. Fine. |

### Pass 1 (commit "Design revision pass 1")

- The masthead became two columns (headline left, stats right), and the tabs now show in the
  first desktop screen.
- On phones, the stats became a single row of four and the edition label is hidden.
- Strip dots stack upward from the line, and the Today label moved left of the line.
- Phone filters collapse behind one Filters button with an active-filter count (the YC
  pattern). The Order select moved to the right of the filter row on desktop.
- The resource page uses a slim navy header (no hero), and the h1 focus ring is suppressed
  (focus still moves for screen readers).
- Phone resource page reading order fixed. The phone calendar shows the agenda only (no month
  navigation that would control nothing).

### Pass 1 critique

| Check | Finding |
|---|---|
| Squint test | Good. But 77 dashed "Unverified" boxes make a strong repeated column, louder than the deadlines. |
| Five-second test | Pass. Headline, tabs, and the first section are visible. |
| Generic look? | The resource page's sticky bar shows only the view switch, an empty band that reads as unfinished. |
| Signature | Visible and useful. |
| Accessibility | Tap targets are 44px or more on chips, tabs, selects, and day buttons. |
| Orange | The primary apply button sits below the fold on the resource page, so the most important orange is missing from the first view. |

### Pass 2 (commit "Design revision pass 2")

- The resource header gained an at-a-glance column: deadline, the orange apply button, step
  count, and "How to apply".
- The sticky bar is hidden on resource pages, and the breadcrumb handles navigation.
- "Unverified" became a small dotted-ring mark plus a label in muted mono, with no box. The
  resource page still shows a full "Needs confirmation" notice.
- Phone rows put the deadline and how-to-apply side by side, which cuts each row by about a third.

### Final check against the list

1. **Squint:** navy block, then the strip, then tabs, then sections, then names, then deadlines. It reads blurred.
2. **Five seconds:** the headline says what it is. Tabs and "How to use this guide" say where to start.
3. **Generic?** No component-library defaults remain. Selects are native but styled to the family.
4. **Signature:** the season strip sits in every list view's masthead and reacts to filters.
5. **WCAG AA:**
   - All text pairs are 4.8:1 or better, measured.
   - Focus ring on every control.
   - 44px targets.
   - Body text 16px, resource names 20px and up.
6. **Orange:** it appears in four places (today, the apply button, the selected tab, and
   deadlines inside a week), and each one means "act".

Known trade-offs:
- The strip's dots are small on a phone (13px), so the agenda list is the phone's way into dates.
- Fonts come from Google Fonts. Offline, the page falls back to Georgia and system sans, and it
  stays legible.

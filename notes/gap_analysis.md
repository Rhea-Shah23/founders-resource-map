# Gap analysis

Source checked: https://entrepreneurship.illinois.edu/about-our-ecosystem/entrepreneurship-ecosystem-map
(snapshot saved as `data/map_snapshot_2026-10-13.html`). All checks done 2026-10-13.

## Summary

| | Count |
|---|---|
| Entries listed on the University map | 127 |
| Canonical resources after deduplication and merges | 93 |
| Resources added by Founders (not on the map) | 8 |
| Total resources in our directory | 101 |
| Candidates checked and not added (rejected, merged, or already covered) | 26 |
| Map resources flagged as renamed, defunct, merged, or broken | 34 |

## What the map has

- One long page with three overview groups (Internal Partners, Urbana-Champaign, National &
  Regional), then sub-lists under OVCRI (EnterpriseWorks, Research Park), Illinois Ventures, OTM,
  Carle Illinois, Siebel Center for Design, Grainger (Landuyt Center, HCESC, other), Gies (OVAEL,
  other), Student Organizations, Other Internal Partners, and External Partners (Urbana-Champaign,
  Chicago, National & Regional).
- 127 entries in total. 26 resources appear more than once, accounting for 59 of the 127 lines.
  City Scholars appears 4 times. I-Corps, Jump ARCHES, the Innovation LLC, and Illinois Ventures
  appear 3 times each. Every appearance is recorded in `data/raw_map_entries.csv`.
- One entry ("Student Organizations" in the overview) points to a section rather than naming a resource.

## What the map lacks (evidence: the snapshot)

| Gap | Evidence | How our directory fixes it |
|---|---|---|
| No descriptions | Every entry is a bare name, sometimes with partner names in parentheses | 1 to 2 sentence plain-English description per resource, plus "good for" and "ideal participant" |
| No link per resource | The partner list has no links. The only links are 8 "Looking for...?" footer links, and one of those (Landuyt Center) points to the old domain `tec.illinois.edu`, which redirects to `landuyt.illinois.edu` | Official URL per resource, checked by `scripts/validate.py` |
| No dates or deadlines | No dates anywhere in the list | `next_deadline` and `deadline_note`, filled only from official pages |
| No filtering or search | Static bulleted lists | Category tabs, search, location, stage, status, and deadline filters |
| No status | Defunct programs are listed alongside active ones (see below) | `status` with evidence URLs; unverified entries are marked in the UI |
| Hard to scan | Mixed casing (all-caps sub-headings), a typo in a heading ("LANDUYT CENTER FOR ENTREPRENEUR (FORMERY TEC)"), and repeated entries | One card per resource, consistent names |
| Organized by owner, not by student need | Sections follow the org chart (OVCRI, Grainger, Gies) | Tabs follow what a student wants: compete, fund, build, learn, find a community |

## Resources added by Founders

Each has `on_university_map=FALSE` and shows an "Added by Founders" badge on the site. All are
marked `needs_confirmation=TRUE` until a teammate checks them (see `to_confirm.md`).

| Resource | id | Why it qualifies | Evidence |
|---|---|---|---|
| Product Space UIUC | `product-space-uiuc` | Active student org that trains members in product management and design and builds products with companies; October 2026 events listed | https://productspaceuiuc.org/about ; https://one.illinois.edu/productspace/home/ |
| Founders Week | `founders-week` | Entrepreneurship at Illinois's flagship ecosystem week. Linked in the site navigation but not listed on the map. The 2026 edition ran Sept 30 to Oct 3, 2026 | https://entrepreneurship.illinois.edu/founders-week |
| Illinois SBDC at Champaign County EDC | `illinois-sbdc-champaign` | Free one-on-one small business advising in Champaign. The map lists the host (Champaign County EDC) but not the SBDC itself | https://cusbdc.org/ ; https://www.champaigncountyedc.org/illinois-small-business-development-center |
| EnterpriseWorks Catapult | `enterpriseworks-catapult` | Current EnterpriseWorks award covering early professional services for new university startups; missing from the map's EnterpriseWorks and Research Park lists | https://researchpark.illinois.edu/catapult/ ; https://researchpark.illinois.edu/cozad-startups-receive-awards/ |
| Venture Capital Association (Illini VCA) | `illini-vca` | Student org teaching how investors evaluate startups; Fall 2026 bootcamp running | https://one.illinois.edu/venturecapitalassociation/home/ |
| Orange & Blue Ventures | `orange-and-blue-ventures` | New Gies student venture investing program launching Fall 2026 | https://giesbusiness.illinois.edu/experience/orange-and-blue-ventures |
| Illinois Business Consulting | `illinois-business-consulting` | Student consulting firm serving startups among its clients, parallel to OTCR and CUBE, which are on the map. Status is Unknown because only a secondary source (U.S. News, June 2026) shows 2026 activity | https://giesbusiness.illinois.edu/experience/experiential-learning/illinois-business-consulting |
| Jackson Innovation Studio | `jackson-innovation-studio` | MechSE makerspace with 3D printers and laser cutters open to students for personal projects | https://mechse.illinois.edu/undergraduate/makerworks/jackson-innovation-studio |

## Candidates checked and rejected

Some things assumed to be missing are already on the map: OTCR, Founders, Zero2One,
EntreCORPS, Enactus, CUBE, AxisMed, Cozad, iVenture, I-Corps, IDEA Lab, and Illinois MakerLab.

| Candidate | Decision | Reason | Evidence |
|---|---|---|---|
| HackIllinois | Rejected for now | Real and active (2026 edition held Feb 27 to Mar 1, 2026), but no startup or entrepreneurship track or prize found. The request was for startup-track hackathons. Add it if the team decides general hackathons belong | https://2026.hackillinois.org/ ; https://hackillinois-2026.devpost.com/ |
| Keywords AI Hackathon UIUC | Rejected | One-time sponsor event (Jan 31 to Feb 1, 2026) | https://keywords-ai-hackathon-uiuc.devpost.com/ |
| Research Park Hackathon | Rejected | For interns and employees of Research Park companies, not students generally | https://researchpark.illinois.edu/2026-hackathon-winner-brunswick-boating/ |
| UIUC Product Hackathon | Merged | Run by Product Space; covered in that entry | https://product-hackathon-uiuc.devpost.com/ |
| Parkland CobraVenture | Rejected | Active, but limited to current Parkland College students | https://parkland.edu/Main/Life-at-Parkland/Student-Life/Parkland-Entrepreneurial-Network/CobraVenture |
| Parkland Business Entrepreneurship Certificate | Rejected | Community college certificate; low relevance to enrolled UIUC students | https://www.parkland.edu/Portals/3/Global/Documents/catalog-POS/BusinessEntrepreneurship.pdf |
| Research Park Student Startup Tenancy | Already covered | Covered by the map's "Incubator labs, offices, & maker space" | https://researchpark.illinois.edu/locate-here/becoming-a-tenant/ |
| EnterpriseWorks Shared Services | Rejected | Service for incubator tenants; for students it is a job, not a venture resource | https://researchpark.illinois.edu/tenantservices/ |
| Research Park Career Fair | Rejected | Recruiting event; overlaps the map's Recruitment Services and Company Internships | https://researchpark.illinois.edu/all-events/career-fair/ |
| Research Park Makerspace | Rejected | Tenants only; page dated 2019 | https://researchpark.illinois.edu/makerspace/ |
| Research Park Intern Awards and podcast | Rejected | Recognition and media, not a resource | https://researchpark.illinois.edu/20th-annual-intern-awards/ |
| Gies student consulting projects | Rejected | Curricular client projects, not entrepreneurship | https://giesbusiness.illinois.edu/corporate/student-consulting-projects |
| Hult Prize at UIUC | Rejected | No UIUC campus round found for 2025 or 2026 | https://www.iit.edu/events/hult-prize-regional-competition |
| Illinois Law Innovation and Entrepreneurship Clinic | Rejected for now | Only a 2025 faculty job posting for a planned clinic; no official page shows it operating. Re-check on law.illinois.edu | https://www.cleaweb.org/job-postings/university-of-illinois-college-of-law-innovation-and-entrepreneurship-clinic-clinical-professor |
| Siebel Center IoT Makerspace | Rejected | Small access-controlled room for one lab community | https://iot.cs.illinois.edu/makerspace/ |
| Disruption Lab (Gies) | Rejected | Corporate emerging-tech project lab; latest evidence Spring 2025 | https://giesbusiness.illinois.edu/disruption-lab |
| WIE Connect / Women in Entrepreneurship (OVAEL) | Rejected | Latest dated event January 2022 | https://giesgroups.illinois.edu/ovael/women-in-entrepreneurship/ |
| Women in Entrepreneurship @ Illinois | Rejected | Instagram only, no 2025 or 2026 activity | https://www.instagram.com/uiucwe/ |
| BOLD | Rejected | No dates or recent activity | https://publish.illinois.edu/bold-illinois/ |
| Society of Women in Business | Rejected | Career-focused, not entrepreneurship | https://www.facebook.com/SWBUIUC/ |
| Gies Women in Business event | Rejected | One-time career event (March 12, 2026) | https://giesonline.illinois.edu/event/2026/03/12/default-calendar/women-in-business--connect--empower--succeed |
| Illini Entrepreneurship Network | Rejected | No evidence it exists | none found |
| Illinois Startup Showcase | Rejected | No UIUC event by this name found | none found |
| Illini Startups meetup | Rejected | Only a 2013-era blog mention | https://dormroomfund.medium.com/how-to-start-a-startup-uiuc-40cd679447b0 |
| Third Coast Foundry | Rejected | Startup VC access hub in San Francisco, not student-facing | https://giesbusiness.illinois.edu/origin-ventures-office-of-entrepreneurship |
| IVCA Scholars (Chicago) | Rejected | Trade group's VC careers scholarship, not a UIUC entrepreneurship resource | https://www.illinoisvc.org/initiatives |

## Renamed, defunct, or broken map entries

These stay in the directory because they are on the University map, but each carries an honest
status and a note. Status is `Inactive` only where an official page says the program ended.

| Map entry | Finding | Our status | Evidence |
|---|---|---|---|
| Landuyt Center for Entrepreneurship (Formerly TEC) | Renamed. `tec.illinois.edu` 301-redirects to `landuyt.illinois.edu`. Map footer still links the old domain | Active | https://landuyt.illinois.edu |
| Office of the Associate Dean for I&E (Grainger) | Now an Assistant Dean role held by the Landuyt director; no separate office page. Merged into Landuyt Center | (merged) | https://grainger.illinois.edu/about/directory/administration |
| Origin Ventures Academy for Entrepreneurial Leadership (OVAEL) | Gies now presents it as the Origin Ventures Office of Entrepreneurship (announced April 2025 as an expansion) | Active | https://giesbusiness.illinois.edu/origin-ventures-office-of-entrepreneurship |
| EnterpriseWorks & EW 2.0 | EW 2.0 is a planned building with no opening date as of Aug 2026. The `/enterpriseworks` link redirects to an unrelated news article | Active | https://researchpark.illinois.edu/locate-here/enterpriseworks-incubator-1/ |
| Chicago Innovation Exchange (CIE) & Illinois Partnership | CIE became part of UChicago's Polsky Center in 2016 (now Polsky Exchange). Merged into Polsky Center | (merged) | https://polsky.uchicago.edu/ |
| Evergreen Fund (Illinois Ventures) | No official page mentions it. Merged into Illinois Ventures pending confirmation | (merged) | https://illinoisventures.com/ |
| Illinois Reboot Tech Training | Research Park says it has been retired | Inactive | https://researchpark.illinois.edu/all-events/ilreboot/ |
| Innovation Celebration | Last held 2019; 2020 edition postponed indefinitely | Inactive | https://innovationcelebration.com/ |
| Pygmalion Tech Festival | Festival is active (Sept 24 to 27, 2026) but the tech track appears only in 2016 to 2019 sources | Active (festival) | https://thisispygmalion.com/ |
| Champaign-Urbana CEO Roundtable | Now called the CEO and Founders Roundtable | Unknown | https://researchpark.illinois.edu/all-events/ceo-founders-roundtable/ |
| AWARE seed grants & mentoring | Official page returns 404; not on current Research Park resources | Unknown | https://researchpark.illinois.edu/AWARE (404) |
| I-Start Accelerator Program | Only source is a 2011 pilot announcement | Unknown | https://researchpark.illinois.edu/i-start-program-launching-soon-il-dceo-awards-grant-funding/ |
| FAST Center SBIR & STTR Assistance | Link from the incubator page returns 404; working page is `/resources/illinois-fast-center/` | Unknown | https://researchpark.illinois.edu/resources/illinois-fast-center/ |
| Alchemy Technology Foundry | `alchemyfoundry.com` redirects to a domain-for-sale page; not on current Landuyt pages | Unknown | https://alchemyfoundry.com/ |
| Innovation Expo | No listings after 2020 | Unknown | https://calendars.illinois.edu/detail/7/33389506 |
| Brand Hub (and its certificates and workshops) | `brandhub.illinois.edu` does not resolve; newest items about 2023 to 2024 | Unknown | DNS failure on 2026-10-13 |
| Kleinmuntz Center (IGB) | No news after 2022 | Unknown | https://kleinmuntzcenter.illinois.edu/ |
| SCD Assessment & Research Lab | Now called the Assessment and Research team | Unknown | https://designcenter.illinois.edu/research |
| SCD Scholars & Fellows | No Fellows program found; scholar program now called Research and Practice Scholars | Unknown | https://designcenter.illinois.edu/aboutscd/ExperientiallLearning/researchscholars |
| IDEA Lab | Official expansion is now "Innovation and Design in Engineering and the Arts" | Unknown | https://www.library.illinois.edu/enx/idea-lab/about/ |
| Startup City Scholars | Not on the current City Scholars site; last seen in March 2025 news | Active (City Scholars) | https://cityscholars.grainger.illinois.edu/ |
| Duality Quantum Accelerator | Site says Alchemist Chicago now includes Duality | Active | https://www.dualityaccelerator.com/ |
| Illinois Ag Tech Accelerator | Latest cohort found is 2023; gener8tor's agtech page returns 404 | Unknown | https://researchpark.illinois.edu/illinois-agtech-accelerator-launches-fifth-cohort-with-five-startups-2/ |
| Illinois University Incubator Network | Research Park page returns 404; no activity after 2024 | Unknown | https://illinoisincubators.org/ |
| Translational Research Facility | No UIUC facility by this name found | Unknown | https://medicine.illinois.edu/research/facilities |
| Catalyze, ThinkChicago, ELLC Roundtable, EILC | Newest dated activity is 2022 to 2024 | Unknown | see each row's `source_urls` |
| Zero2One | Site content stops at Fall 2024; one LinkedIn page marked inactive | Unknown | https://www.zero2onevc.com/ |
| OTCR Consulting, Founders | Old domains are broken (`otcr.illinois.edu` does not resolve; `founders.illinois.edu` has a certificate error). Rows point to current RSO or Gies pages | Unknown | https://one.illinois.edu/FoundersIllinoisEntrepreneurs/ |

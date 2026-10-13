# To confirm

Facts a person must verify before we treat them as reliable. Nothing here was guessed: blanks stay blank until someone checks.

**How to use this list.** Take one batch per person. For each item, open the link, check the fact, then edit `data/resources.csv`:
fill or fix the field, add the page to `source_urls`, set `last_verified` to the date you checked, and set `needs_confirmation` to
FALSE only when every item for that resource is resolved and `confidence` is High. Then run `python3 scripts/build.py` and tick the box here.

## Before the GBM: check these first

1. [ ] **Every date shown on the site.** These are the only resources with a `next_deadline`. Re-open each source and confirm the date has not moved:
    - [ ] Illinois Innovation Network (IIN) (`illinois-innovation-network`): 2026-10-15. Registration for the Oct 22 to 23, 2026 conference at SIUE closes Oct 15, 2026; student poster session Oct 23 (per conference page). Presentation proposals closed July 15, 2026. Source: https://iin.uillinois.edu/
    - [ ] Siebel Center for Design Workshops (`scd-workshops`): 2026-10-19. Event: Intro to Lasers student maker workshop, Oct 19, 2026, in The Shop (per SCD homepage). SHIFT Max (for educators) applications run Feb 1 to Mar 8, 2027. Source: https://designcenter.illinois.edu/events/workshops
    - [ ] Jump ARCHES (Applied Research for Community Health through Engineering and Simulation) (`jump-arches`): 2026-10-27. Event: Health Care Engineering Systems Symposium, Oct 27, 2026, Jump Trading Simulation & Education Center, Peoria. Spring 2026 grant proposals closed April 10, 2026. Source: https://healtheng.illinois.edu/jumparches
    - [ ] Innovation, Leadership & Engineering Entrepreneurship (ILEE) B.S. Dual Degree (`ilee-dual-degree`): 2026-11-01. Landuyt calendar lists application deadlines of Nov 1, 2026 and Apr 1, 2027. Must apply no later than the semester before your final year. Source: https://landuyt.illinois.edu/academics/degree
    - [ ] SocialFuse (`socialfuse`): 2026-11-05. Event: next SocialFuse is Nov 5, 2026, 5:00 to 7:00 pm, Campus Instructional Facility. RSVP at https://forms.illinois.edu/sec/510096211. Source: https://landuyt.illinois.edu/programs/socialfuse
    - [ ] Illinois Small Business Development Center at Champaign County EDC (`illinois-sbdc-champaign`): 2026-11-12. Event: 2026 Fall/Winter Open Office Hours, Nov 12, 2026, 12 to 3 pm (per cusbdc.org). Advising is by appointment year round. Source: https://cusbdc.org/
    - [ ] Entrepreneurship Courses, Certificates, & Advising (Landuyt Center) (`landuyt-courses-certificates`): 2027-03-01. Landuyt calendar lists Mar 1, 2027 as the application deadline for the Graduate Concentration in Entrepreneurship and Innovation. Undergraduate certificate page lists submission deadlines of Jan 15, Jun 1, and Sep 1 (no year) and says to apply before the start of your final semester. Source: https://landuyt.illinois.edu/academics
2. [ ] **Our own links.** `founders.illinois.edu` returned a certificate error during research. Confirm the official Founders URL and contact email, then update the `founders` row and the `mailto:` placeholder in `scripts/site_template.html` (footer).
3. [ ] **Resources added by Founders (not on the University map).** Confirm each is real, current, and open to UIUC students: EnterpriseWorks Catapult New Venture Program (`enterpriseworks-catapult`), Orange & Blue Ventures (`orange-and-blue-ventures`), Jackson Innovation Studio (MechSE MakerWorks) (`jackson-innovation-studio`), Illinois Business Consulting (IBC) (`illinois-business-consulting`), Product Space UIUC (`product-space-uiuc`), Venture Capital Association (Illini VCA) (`illini-vca`), Founders Week (`founders-week`), Illinois Small Business Development Center at Champaign County EDC (`illinois-sbdc-champaign`). Evidence is in `notes/gap_analysis.md`.
4. [ ] **Possibly defunct programs still listed on the map.** Confirm status for the entries listed under "Renamed, defunct, or broken" in `notes/gap_analysis.md` before anyone presents them as active.

## Batch 1: Money and competitions

Categories: Pitch Competitions & Challenges, Accelerators & Incubators, Funding & Grants, Advising & Legal/IP. 17 resources, 29 checks.

### Pitch Competitions & Challenges

**Cozad New Venture Challenge** (`cozad-new-venture-challenge`, confidence High, status Active)
- [ ] Check the 2027 registration deadline on https://landuyt.illinois.edu/programs/cozad/schedule once posted (calendar suggests registration runs Dec 1, 2026 to about Feb 2, 2027)
- [ ] Check 2027 prize total on https://landuyt.illinois.edu/programs/cozad

**Health Make-A-Thon** (`health-make-a-thon`, confidence High, status Unknown)
- [ ] Check whether a fall 2026 Health Make-a-Thon is scheduled and its date on https://medicine.illinois.edu/innovation/health-maker-lab/events
- [ ] Check whether non-CI MED students can join teams for 2026

### Accelerators & Incubators

**EnterpriseWorks Incubator (and EW 2.0)** (`enterpriseworks`, confidence High, status Active)
- [ ] Check tenant eligibility and costs (including whether student startups qualify) on the 'Becoming A Tenant' page linked from researchpark.illinois.edu/locate-here/enterpriseworks-incubator-1/
- [ ] Check EW 2.0 construction status and opening date with Research Park

**EnterpriseWorks Incubator (labs, offices, and makerspace)** (`ew-incubator-space`, confidence High, status Active)
- [ ] Ask EnterpriseWorks for tenancy/affiliate pricing and eligibility criteria
- [ ] Confirm makerspace access rules and that it remains free for tenants/affiliates

**I-Start Program** (`ew-i-start`, confidence Medium, status Unknown)
- [ ] Ask EnterpriseWorks (research-park@illinois.edu) whether I-Start still exists

**iVenture Accelerator** (`iventure-accelerator`, confidence High, status Active)
- [ ] Check iventure.illinois.edu/apply for summer 2027 application wave deadlines (likely posted fall 2026)

### Funding & Grants

**AWARE (Accelerating Women and underRepresented Entrepreneurs)** (`ew-aware`, confidence Medium, status Unknown)
- [ ] Ask EnterpriseWorks (research-park@illinois.edu) whether AWARE still runs and whether grants are offered
- [ ] Check whether an AWARE prize is still part of the Cozad New Venture Competition on the Cozad site
- [ ] Note researchpark.illinois.edu/AWARE is a broken link (404)

**Catherine and Don Kleinmuntz Center for Genomics in Business and Society** (`kleinmuntz-center`, confidence Medium, status Unknown)
- [ ] Check whether Mikashi Awards and the Young Innovator Program still run, by emailing kleinmuntz@igb.illinois.edu or checking https://kleinmuntzcenter.illinois.edu/
- [ ] Check whether the IGB Early Innovator Program replaced the Young Innovator Program on https://www.igb.illinois.edu/bioeconomy/igb-early-innovator-program

**EnterpriseWorks Catapult New Venture Program** (`enterpriseworks-catapult`, confidence High, status Active)
- [ ] Confirm current funding terms (80% up to $5,000) on https://researchpark.illinois.edu/catapult/
- [ ] Confirm whether student founders can apply directly or only via Cozad on https://researchpark.illinois.edu/catapult/

**Illinois Innovation Award** (`illinois-innovation-award`, confidence High, status Active)
- [ ] Check the 2026-27 nomination deadline on https://landuyt.illinois.edu/programs/iip or the nomination form

**Illinois Proof-of-Concept Program (IPOC)** (`ipoc`, confidence High, status Active)
- [ ] Check the OTM IPOC page for the 2027 application deadline (likely early 2027)

**Illinois Ventures** (`illinois-ventures`, confidence High, status Unknown)
- [ ] Ask Illinois Ventures (https://illinoisventures.com/) whether an Evergreen Fund exists. If it does, split it back into its own row
- [ ] Check illinoisventures.com for typical check sizes and how students submit (prospective-companies page)

### Advising & Legal/IP

**Designer-in-Residence Program** (`ew-designer-in-residence`, confidence High, status Unknown)
- [ ] Confirm Deana McDonagh is still the Designer-in-Residence and the request form (researchpark.my.salesforce-sites.com/requests/addDir) still works
- [ ] Confirm whether EnterpriseWorks affiliates (not only tenants) qualify

**Entrepreneur-in-Residence (EIR) Program** (`ew-entrepreneur-in-residence`, confidence High, status Unknown)
- [ ] Confirm current EIR roster and that monthly training events still run (calendars.illinois.edu/list/5115)

**Illinois FAST Center (SBIR/STTR Assistance)** (`fast-center-sbir-sttr`, confidence High, status Unknown)
- [ ] Check calendars.illinois.edu/list/5115 for next READY!/SET! SBIR workshop dates
- [ ] Confirm whether students with a startup qualify for 1:1 assistance

**Intellectual Property Clinic** (`ip-clinic`, confidence High, status Unknown)
- [ ] Check the Spring 2027 application deadline and eligibility on https://landuyt.illinois.edu/programs/ipclinic

**Office of Technology Management (OTM)** (`office-of-technology-management`, confidence High, status Unknown)
- [ ] Check whether students with independent (non-university-resource) projects should use OTM, on https://otm.illinois.edu/
- [ ] Check OTM news/events for a 2026 item to confirm Active status, on https://otm.illinois.edu/

## Batch 2: Courses, fellowships, and maker spaces

Categories: Courses & Training, Fellowships & Internships, Maker Spaces & Labs. 23 resources, 41 checks.

### Courses & Training

**Brand Hub Professional Online Certificates and Development** (`brand-hub-certificates`, confidence Low, status Unknown)
- [ ] Check whether Brand Hub still offers online certificates, via brandhub@illinois.edu or https://media.illinois.edu/
- [ ] Check whether the Strategic Brand Communication graduate certificates at https://online.illinois.edu/online-programs/graduate-certificates/ should replace this entry

**Entrepreneurs Without Borders** (`entrepreneurs-without-borders`, confidence Medium, status Unknown)
- [ ] Check with Illinois Social Innovation or the Subsistence Marketplaces Initiative whether EWB is still running and how students apply
- [ ] Confirm trip costs and eligibility

**Entrepreneurship Courses (Gies)** (`gies-entrepreneurship-courses`, confidence Medium, status Active)
- [ ] Check whether Gies has a dedicated entrepreneurship course listing page to use as the url
- [ ] Verify enrollment restrictions for non-Gies students in BADM 346/446 on Course Explorer

**Entrepreneurship Courses, Certificates, & Advising (Landuyt Center)** (`landuyt-courses-certificates`, confidence High, status Active)
- [ ] Check which undergraduate certificate submission deadline pairs with which receipt date on https://landuyt.illinois.edu/academics/certificates-undergrad
- [ ] Check AI & Machine Learning Focus certificate requirements on the same page

**Illinois I-Corps (NSF I-Corps, Great Lakes Hub)** (`nsf-i-corps`, confidence High, status Active)
- [ ] Check upcoming workshop series and Boost cohort dates with mmalm@illinois.edu or on https://icorps.illinois.edu/programs
- [ ] Confirm whether tec@illinois.edu still works or has moved to landuyt@illinois.edu

**Research Park Workforce Development** (`research-park-workforce-development`, confidence Medium, status Unknown)
- [ ] Ask research-park@illinois.edu which workforce development workshops run in 2026 and whether interns can attend

**Strategy, Innovation, and Entrepreneurship Major (BS)** (`gies-sie-major`, confidence High, status Active)
- [ ] Confirm with Gies advising how non-Gies students can add the SIE major (transfer or dual degree)

### Fellowships & Internships

**Assessment and Research Team (Siebel Center for Design)** (`scd-assessment-research-lab`, confidence High, status Unknown)
- [ ] Confirm current research projects and whether Research Scholar roles are paid via designcenter.illinois.edu/research

**City Scholars & Startup City Scholars** (`city-scholars`, confidence Medium, status Active)
- [ ] Confirm whether Startup City Scholars runs in Spring 2027 and how to apply, via cityscholars@illinois.edu or landuyt@illinois.edu
- [ ] Check program cost and housing on https://cityscholars.grainger.illinois.edu/students/city-scholars-internship/housing
- [ ] Check Fall 2027 cohort application dates on the City Scholars application page

**Fiddler Innovation Fellowship** (`fiddler-innovation-fellowship`, confidence High, status Active)
- [ ] Check the next student application cycle and deadline at https://edream.illinois.edu/apply-fiddler-fellowship/
- [ ] Check current award amount and whether undergrads apply directly or only via SPIN, on https://www.ncsa.illinois.edu/resources-and-services/faculty-student-opportunities/fiddler-innovation-endowment/

**Orange & Blue Ventures** (`orange-and-blue-ventures`, confidence High, status Active)
- [ ] Check student eligibility and how to apply on https://giesbusiness.illinois.edu/experience/orange-and-blue-ventures (student link)
- [ ] Confirm whether it is open to non-Gies students

**Research Park Company Internships** (`research-park-internships`, confidence High, status Unknown)
- [ ] Open https://researchpark.illinois.edu/work-here/careers/ in a browser to confirm current internship postings
- [ ] Confirm that uirp-jobs@illinois.edu is the right student contact on https://researchpark.illinois.edu/work-here/

**SCD Research and Practice Scholars** (`scd-scholars-fellows`, confidence High, status Unknown)
- [ ] Confirm whether Scholars are paid and whether a separate Fellows program exists, via designcenter@illinois.edu

### Maker Spaces & Labs

**Alchemy Technology Foundry** (`alchemy-foundry`, confidence Low, status Unknown)
- [ ] Confirm with Prof. Sanjay Patel (ECE) or landuyt@illinois.edu whether Alchemy Foundry still operates and accepts students
- [ ] Find a current official page; alchemyfoundry.com is no longer live

**Champaign-Urbana Community Fab Lab** (`cu-community-fab-lab`, confidence High, status Active)
- [ ] Check open hours cost and appointment rental fees on https://cucfablab.web.illinois.edu/programs-and-services/open-hours-appointments/
- [ ] Confirm parent unit (School of Information Sciences) on https://cucfablab.web.illinois.edu/

**ECE Open Lab** (`ece-open-lab`, confidence High, status Unknown)
- [ ] Check how students get Open Lab access and whether any fee applies by emailing ece-openlab@illinois.edu
- [ ] Check current staffed hours on https://openlab.ece.illinois.edu/

**Health Maker Lab** (`health-maker-lab`, confidence High, status Unknown)
- [ ] Check whether non-Carle Illinois students can use Health Maker Lab resources by emailing medicine@illinois.edu

**IDEA Lab at Grainger Engineering Library** (`idea-lab`, confidence High, status Unknown)
- [ ] Check whether 3D printing has a fee on https://www.library.illinois.edu/enx/idea-lab/
- [ ] Confirm general contact email (idealab@library.illinois.edu) and current hours on the IDEA Lab site

**Illinois MakerLab** (`illinois-maker-lab`, confidence High, status Active)
- [ ] Check makerlab.illinois.edu/pricingservices.html for printing costs
- [ ] Confirm contact email on makerlab.illinois.edu/contact/
- [ ] Check makerlab.illinois.edu/lab-hours for Fall 2026 hours

**Jackson Innovation Studio (MechSE MakerWorks)** (`jackson-innovation-studio`, confidence High, status Active)
- [ ] Confirm current hours on https://mechse.illinois.edu/undergraduate/makerworks/jackson-innovation-studio
- [ ] Confirm non-MechSE students may use it for personal startup prototypes

**Siebel Center for Design** (`siebel-center-for-design`, confidence High, status Active)
- [ ] Check makerspace access requirements and any fees for students on designcenter.illinois.edu (The Shop pages)

**The Shop (Siebel Center for Design)** (`scd-the-shop`, confidence High, status Active)
- [ ] Check designcenter.illinois.edu/labs/theshop or ask designcenter@illinois.edu who may use The Shop and whether materials cost anything

**Translational Research Facility** (`translational-research-facility`, confidence Low, status Unknown)
- [ ] Ask the Landuyt Center which facility 'Translational Research Facility' refers to on https://entrepreneurship.illinois.edu/about-our-ecosystem/entrepreneurship-ecosystem-map
- [ ] Check whether it means the CCIL Biomedical Research Center at https://cancer.illinois.edu/biomedical-research-center/

## Batch 3: Student orgs, events, and community

Categories: Student Organizations, Events & Community. 23 resources, 42 checks.

### Student Organizations

**AxisMED** (`axismed`, confidence High, status Unknown)
- [ ] Check 2026-27 cohort application dates by emailing contact@axismed.org or on https://medicine.illinois.edu/innovation/axismed
- [ ] Check whether micro-grants are still offered and their amounts with contact@axismed.org
- [ ] Check current activity (2026 cohort or demo day) on https://www.linkedin.com/company/axismedill

**CUBE Consulting** (`cube-consulting`, confidence High, status Active)
- [ ] Check Spring 2027 recruitment dates on https://www.cubeconsulting.org/join-us

**EntreCORPS** (`entrecorps`, confidence High, status Unknown)
- [ ] Check giesgroups.illinois.edu/entrecorps/home/ or its Linktree for the current consultant application deadline
- [ ] Check how startups request EntreCORPS consulting (client intake form)

**Founders: Illinois Entrepreneurs** (`founders`, confidence Medium, status Unknown)
- [ ] Check whether founders.illinois.edu is retired and what the club's current website is (Instagram @illinoisfounders)
- [ ] Check 2026 activity and membership signup on https://one.illinois.edu/FoundersIllinoisEntrepreneurs/
- [ ] Find an official contact email for the club

**Illinois Business Consulting (IBC)** (`illinois-business-consulting`, confidence Medium, status Unknown)
- [ ] Check recruitment timing and eligible majors via the 'Students, Join IBC' link on https://giesbusiness.illinois.edu/experience/experiential-learning/illinois-business-consulting
- [ ] Check whether IBC offers reduced-fee work for student startups on https://giesgroups.illinois.edu/ibc/about/

**Illinois Enactus** (`enactus`, confidence High, status Active)
- [ ] Check Spring 2027 recruitment dates on https://www.illinoisenactus.com/

**OTCR Consulting** (`otcr-consulting`, confidence Medium, status Unknown)
- [ ] Check the current official OTCR website (otcr.illinois.edu no longer resolves) and confirm https://giesgroups.illinois.edu/otcr/home/ loads in a browser
- [ ] Check Spring 2027 recruitment dates and contact email on the OTCR site or https://www.linkedin.com/company/otcr-consulting

**Product Space UIUC** (`product-space-uiuc`, confidence High, status Active)
- [ ] Check Spring 2027 recruitment dates on https://productspaceuiuc.org/ or Instagram @productspaceuiuc
- [ ] Check whether membership or the fellowship has a fee on https://productspaceuiuc.org/
- [ ] Confirm the 2026 hackathon date and next hackathon on https://productspaceuiuc.org/

**Venture Capital Association (Illini VCA)** (`illini-vca`, confidence High, status Active)
- [ ] Check Spring 2027 recruitment dates on https://one.illinois.edu/venturecapitalassociation/home/
- [ ] Check a contact email on https://one.illinois.edu/venturecapitalassociation/contact-us/

**Zero2One** (`zero2one`, confidence Medium, status Unknown)
- [ ] Check whether Zero2One is running a Fall 2026 or Spring 2027 incubator cohort on https://www.zero2onevc.com/ or https://one.illinois.edu/zero2one/home/
- [ ] Check whether Launchpad pitch competition still runs and current prize amounts
- [ ] Find an official contact email

### Events & Community

**AgTech Innovation Summit** (`agtech-innovation-summit`, confidence High, status Active)
- [ ] Check the 2027 summit date on https://researchpark.illinois.edu/all-events/agtechsummit/
- [ ] Confirm on the registration page that attendance is free and open to students

**Brand Hub Workshops and Seminars** (`brand-hub-workshops`, confidence Low, status Unknown)
- [ ] Check whether Brand Hub workshops still run, via brandhub@illinois.edu or the College of Media events calendar at https://media.illinois.edu/

**Catalyze: Professional Networking Event** (`catalyze`, confidence Medium, status Unknown)
- [ ] Check https://calendars.illinois.edu/list/5115 for a fall 2026 or spring 2027 Catalyze date
- [ ] Confirm the current contact and whether students are welcome by emailing research-park@illinois.edu

**CEO and Founders Roundtable** (`cu-ceo-roundtable`, confidence High, status Unknown)
- [ ] Confirm the current contact email and 2026 meeting activity with research-park@illinois.edu
- [ ] Confirm whether student founders at EnterpriseWorks can be invited

**CU Women in Tech** (`cu-women-in-tech`, confidence High, status Unknown)
- [ ] Check https://calendars.illinois.edu/list/5115 for upcoming CU Women in Tech dates in fall 2026
- [ ] Confirm with research-park@illinois.edu whether students can attend and whether the event is free

**Founders Week** (`founders-week`, confidence High, status Active)
- [ ] Check 2027 Founders Week dates on https://entrepreneurship.illinois.edu/founders-week
- [ ] Check whether student attendance is free on https://entrepreneurship.illinois.edu/founders-week

**Innovation Celebration** (`innovation-celebration`, confidence High, status Inactive)
- [ ] Confirm with Champaign County EDC (edc@champaigncountyedc.com) that Innovation Celebration is discontinued

**Innovation Expo** (`innovation-expo`, confidence Low, status Unknown)
- [ ] Ask landuyt@illinois.edu or Founders (founders.illinois.edu) whether Innovation Expo still runs and when

**Innovation Living-Learning Community** (`innovation-llc`, confidence High, status Unknown)
- [ ] Check the 2027-28 LLC application priority deadline on https://housing.illinois.edu/living-communities/llc/innovation
- [ ] Check eligibility for non-first-year residents on the same page

**Pygmalion Festival** (`pygmalion`, confidence Medium, status Active)
- [ ] Check whether Pygmalion still runs any tech or startup programming on https://thisispygmalion.com/ (Schedule and History pages)

**Research Park Entrepreneurship Workshops** (`research-park-entrepreneurship-workshops`, confidence Medium, status Active)
- [ ] Check calendars.illinois.edu/list/5115 for upcoming topic workshops (IP, pitching, SBIR) and whether they are open to students
- [ ] Confirm whether workshops are free

**Siebel Center for Design Workshops** (`scd-workshops`, confidence High, status Active)
- [ ] Check designcenter.illinois.edu/events/workshops for Maker Workshop cost and registration process

**Silicon Valley Entrepreneurship Workshop** (`silicon-valley-workshop`, confidence High, status Active)
- [ ] Check the participant fee amount and fall 2027 application window on https://landuyt.illinois.edu/programs/silicon-valley

## Batch 4: Campus hubs and external partners

Categories: Campus Hubs, External Partners. 27 resources, 47 checks.

### Campus Hubs

**Cancer Center at Illinois (CCIL)** (`cancer-center-at-illinois`, confidence High, status Active)
- [ ] Check whether CCIL offers any commercialization or startup support, on https://cancer.illinois.edu/
- [ ] Check seed grant amounts and next deadline on the CCIL funding pages at https://cancer.illinois.edu/

**Carl R. Woese Institute for Genomic Biology (IGB)** (`igb`, confidence High, status Active)
- [ ] Check the 2027 Early Innovator Program application deadline on https://www.igb.illinois.edu/bioeconomy/igb-early-innovator-program
- [ ] Check whether undergraduates can join any IGB entrepreneurship program on https://www.igb.illinois.edu/facilities-services/bioeconomy

**Carle Illinois College of Medicine (CI MED)** (`carle-illinois`, confidence High, status Active)
- [ ] Check whether non-CI MED students can join the Health Make-A-Thon or use advising, on https://medicine.illinois.edu/research-and-innovation

**Corporate Startup Intros** (`research-park-corporate-startup-intros`, confidence Low, status Unknown)
- [ ] Ask research-park@illinois.edu whether a formal corporate startup introduction service exists, who is eligible, and which page describes it
- [ ] Confirm that Bailey Conrady is the right contact on https://researchpark.illinois.edu/our-team/

**Hub for Brand Innovation and Advertising Technology (Brand Hub)** (`brand-hub`, confidence Medium, status Unknown)
- [ ] Check whether brandhub.illinois.edu is back online or the Hub has closed, via the Sandage Department of Advertising at https://media.illinois.edu/
- [ ] Confirm brandhub@illinois.edu is still monitored

**Illinois Social Innovation** (`illinois-social-innovation`, confidence Medium, status Unknown)
- [ ] Check giesgroups.illinois.edu/isi/ Contact Us page for a contact email
- [ ] Check giesgroups.illinois.edu/isi/ events/news for current 2026 activity and mini-grant amounts or deadlines

**Landuyt Center for Entrepreneurship** (`landuyt-center`, confidence High, status Active)
- [ ] Confirm with the Landuyt Center that the Office of the Associate Dean for I&E listed on the University map is the same as the Assistant Dean role, so the merge is correct

**National Center for Supercomputing Applications (NCSA)** (`ncsa`, confidence High, status Active)
- [ ] Check whether student startups can access NCSA computing or the Industry Partner Program, on https://www.ncsa.illinois.edu/resources-and-services/industry/

**Origin Ventures Office of Entrepreneurship** (`ovael`, confidence High, status Active)
- [ ] Confirm whether OVAEL still exists as a separate unit or is fully replaced by the Origin Ventures Office of Entrepreneurship, on giesbusiness.illinois.edu/origin-ventures-office-of-entrepreneurship
- [ ] Find a contact email for the office on giesbusiness.illinois.edu/origin-ventures-office-of-entrepreneurship

**Research Park Recruitment Services** (`research-park-recruitment-services`, confidence Medium, status Unknown)
- [ ] Confirm with research-park@illinois.edu which recruiting services tenants receive and whether they cost anything
- [ ] Confirm that Bryan Goode is still the talent contact on https://researchpark.illinois.edu/our-team/

### External Partners

**Champaign County Economic Development Corporation** (`champaign-county-edc`, confidence High, status Active)
- [ ] Check New and Growing Business Programs eligibility, amounts, and deadline on https://champaignil.gov/2026/09/17/city-of-champaign-launches-third-round-of-small-business-programs/
- [ ] Confirm the general contact email (edc@champaigncountyedc.com vs .org) on https://www.champaigncountyedc.org/

**Chicago Quantum Exchange (CQE)** (`chicago-quantum-exchange`, confidence High, status Active)
- [ ] Check OQI Undergraduate Fellowship 2027 deadline and stipend on https://chicagoquantum.org/oqi-undergraduate-fellowship
- [ ] Verify Q-Ready program details and cost on chicagoquantum.org

**Discovery Partners Institute (DPI)** (`discovery-partners-institute`, confidence High, status Active)
- [ ] Check Fall 2027 City Scholars application dates on https://cityscholars.grainger.illinois.edu/students/city-scholars-internship/application-and-eligibility
- [ ] Check whether DPI offers any startup or entrepreneurship programs for UIUC students

**Duality Quantum Accelerator** (`duality-quantum-accelerator`, confidence High, status Active)
- [ ] Check current funding, equity terms, eligibility, and next deadline on https://www.dualityaccelerator.com/apply
- [ ] Confirm whether Duality is now a track within Alchemist Chicago

**Engineering Innovation Leadership Council (EILC)** (`eilc`, confidence Medium, status Unknown)
- [ ] Confirm EILC's current home page, NSF role, and whether it is still active (search VentureWell or ask the Landuyt Center)
- [ ] Confirm Grainger's role in EILC with the Landuyt Center

**Entrepreneurial Living-Learning Community (ELLC) Roundtable** (`ellc-roundtable`, confidence Medium, status Unknown)
- [ ] Ask the Landuyt Center whether the ELLC Roundtable still meets and when the next one is (https://landuyt.illinois.edu/collaborations)

**IBM-Illinois Discovery Accelerator Institute** (`discovery-accelerator-institute`, confidence High, status Active)
- [ ] Check the Externship page and any student research openings on https://discoveryacceleratorinstitute.grainger.illinois.edu/

**Illinois AgTech Accelerator** (`illinois-ag-tech-accelerator`, confidence Medium, status Unknown)
- [ ] Check https://www.gener8tor.com for a current Illinois AgTech or gBETA AgTech program page and open applications
- [ ] Ask Serra Ventures (serraventures.com) whether the Illinois AgTech Accelerator still runs cohorts
- [ ] Verify current investment terms before listing any dollar amount

**Illinois Innovation Network (IIN)** (`illinois-innovation-network`, confidence High, status Active)
- [ ] Check whether students can apply to IIN Social Innovation seed grants or Fellows on https://iin.uillinois.edu/about-us/working-committee/social-innovation/

**Illinois Small Business Development Center at Champaign County EDC** (`illinois-sbdc-champaign`, confidence High, status Active)
- [ ] Check whether international students on visas can receive advising on https://cusbdc.org/
- [ ] Check a direct SBDC email or phone on https://cusbdc.org/about-us/

**Illinois University Incubator Network (IUIN)** (`illinois-university-incubator-network`, confidence Medium, status Unknown)
- [ ] Confirm the network is still active (any 2025 or 2026 events) on https://illinoisincubators.org/ or with info@illinoisincubators.org

**Jump ARCHES (Applied Research for Community Health through Engineering and Simulation)** (`jump-arches`, confidence High, status Active)
- [ ] Check Jump ARCHES summer internship dates and eligibility on https://healtheng.illinois.edu/jumparches
- [ ] Check whether students can attend the October 27, 2026 symposium and the cost on the OSF symposium page
- [ ] Check per-award grant amounts in the Award Guidelines on https://healtheng.illinois.edu/jumparches

**Kern Entrepreneurial Engineering Network (KEEN)** (`keen`, confidence Medium, status Active)
- [ ] Confirm KEEN's official URL and whether any student-facing programs exist on https://engineeringunleashed.com/
- [ ] Check whether Grainger has a current KEEN page or contact on https://grainger.illinois.edu/academics/entrepreneurship

**Mayo Clinic & Illinois Alliance for Technology-Based Healthcare** (`mayo-illinois-alliance`, confidence High, status Active)
- [ ] Check summer undergraduate program (SURF, HERE) 2027 deadlines on https://mayoillinois.org/education-training

**Polsky Center for Entrepreneurship and Innovation** (`polsky-center`, confidence High, status Active)
- [ ] Check whether the CIE and Illinois partnership is still active and what it offers UIUC students today (start at https://polsky.uchicago.edu/)
- [ ] Check which Polsky events and programs are open to non-UChicago students on https://polsky.uchicago.edu/

**ThinkChicago** (`thinkchicago`, confidence Medium, status Unknown)
- [ ] Confirm whether ThinkChicago runs any 2026 or 2027 student events and how to apply on https://www.thinkchicago.net/ or with info@thinkchicago.net

**University of Illinois Chicago (UIC) Innovation and Entrepreneurship** (`uic`, confidence Medium, status Unknown)
- [ ] Check whether any UIC Innovation Center program accepts UIUC students, via uicinnovationcenter@uic.edu
- [ ] Check whether the UIC Summer Venture Accelerator returned in 2026 on https://innovationcenter.uic.edu/

<!-- AUTO-VALIDATION START -->

## Automated validation results

Last run: 2026-10-13 with `python3 scripts/validate.py`.

**Structural errors (0).** These break the import or the site.
- None

**Warnings (5).** Review when you can.
- [ ] `ew-aware`: no official URL
- [ ] `brand-hub-certificates`: no official URL
- [ ] `translational-research-facility`: no official URL
- [ ] `brand-hub-workshops`: no official URL
- [ ] `brand-hub`: no official URL

**URL check: 9 of 229 URLs did not return a success response.** Open each in a browser. If it works, leave it. If it is broken, find the new page and update `url` or `source_urls`.
- [ ] https://alchemyfoundry.com/ returned redirects to a domain-for-sale page (https://www.hugedomains.com/domain_profile.cfm?d=alchemyfoun). Used by `alchemy-foundry` (source_urls)
- [ ] https://cancer.illinois.edu/biomedical-research-center/ returned 404. Used by `cancer-center-at-illinois` (source_urls), `translational-research-facility` (source_urls)
- [ ] https://corporaterelations.illinois.edu/news/hub-brand-innovation-and-advertising-technology-center-advertising-innovation returned 403 (likely blocks automated requests; open it in a browser). Used by `brand-hub` (source_urls)
- [ ] https://grainger.illinois.edu/news/stories/29522 returned 404. Used by `ew-aware` (source_urls)
- [ ] https://ifabtechhub.org/projects/enterpriseworks-incubator/ returned 403 (likely blocks automated requests; open it in a browser). Used by `enterpriseworks` (source_urls)
- [ ] https://researchpark.illinois.edu/article/illinois-reboot-applications-tech-skills-training-course/ returned 404. Used by `illinois-reboot` (source_urls)
- [ ] https://www.hpcwire.com/off-the-wire/duality-cohort-4-applications-for-quantum-startups-now-open/ returned 403 (likely blocks automated requests; open it in a browser). Used by `duality-quantum-accelerator` (source_urls)
- [ ] https://www.smilepolitely.com/culture/the_ultimate_guide_to_pygmalion_festival_tech/ returned 403 (likely blocks automated requests; open it in a browser). Used by `pygmalion` (source_urls)
- [ ] https://www.usnews.com/education/u-s-news-higher-ground/articles/2026-06-18/consulting-on-campus-university-illinois returned error: TimeoutError: The read operation timed out. Used by `illinois-business-consulting` (source_urls)

<!-- AUTO-VALIDATION END -->

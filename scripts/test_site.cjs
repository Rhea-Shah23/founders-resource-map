// Browser tests for docs/index.html, using Playwright.
// Setup once:  npm i --no-save playwright && npx playwright install chromium
// Run:         node scripts/test_site.cjs
//
// "Today" is pinned with ?today=2026-10-13 so deadline ranges are deterministic.
// Expected results are computed here from data/resources.json, independently of the
// page's own code, then compared with what the page renders. Saves desktop and
// mobile screenshots (directory, calendar, detail, print handout) to docs/screenshots/.
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const TODAY = "2026-10-13";
const base = "file://" + path.join(root, "docs", "index.html") + "?today=" + TODAY;
const shots = path.join(root, "docs", "screenshots");
const data = JSON.parse(fs.readFileSync(path.join(root, "data", "resources.json"), "utf8"));
const R = data.resources;

let passed = 0;
function check(cond, msg) {
  if (!cond) throw new Error("FAIL: " + msg);
  passed++;
  console.log("ok  " + msg);
}
const sameSet = (a, b) => a.length === b.length && [...a].sort().join() === [...b].sort().join();

// ---- Expected deadline buckets, computed independently ----
const DAY = 864e5;
const t0 = Date.UTC(2026, 9, 13);
const days = (s) => (s ? Math.round((Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10)) - t0) / DAY) : null);
const up = (r) => r.next_deadline && days(r.next_deadline) >= 0;
const closed = (r) => {
  const d = r.next_deadline && days(r.next_deadline) < 0 ? r.next_deadline : r.last_deadline;
  const n = days(d);
  return n !== null && n >= -30 && n <= -1;
};
const EXPECT = {
  d7: (r) => up(r) && days(r.next_deadline) <= 7,
  d30: (r) => up(r) && days(r.next_deadline) >= 8 && days(r.next_deadline) <= 30,
  d60: (r) => up(r) && days(r.next_deadline) >= 31 && days(r.next_deadline) <= 60,
  d90: (r) => up(r) && days(r.next_deadline) >= 61 && days(r.next_deadline) <= 90,
  d90p: (r) => up(r) && days(r.next_deadline) > 90,
  rolling: (r) => r.deadline_type === "Rolling",
  none: (r) => r.deadline_type === "None published",
  tbc: (r) => !up(r) && ["Typical", "Unknown", "Confirmed"].includes(r.deadline_type),
  closed,
};

async function rowIds(page) {
  return page.$$eval("#list .row-link", (as) => as.map((a) => a.getAttribute("href").replace("#/resource/", "")));
}
async function pickDeadline(page, key) {
  await page.click("#dlBtn");
  await page.click(`#dlOpts label[data-dl="${key}"]`);
}
function readIcs(file) {
  const text = fs.readFileSync(file, "utf8");
  const lines = text.split("\r\n");
  return { text, lines };
}
function validIcs({ text, lines }, n, label) {
  check(text.startsWith("BEGIN:VCALENDAR\r\nVERSION:2.0\r\n"), `${label}: starts with VCALENDAR and VERSION`);
  check(text.endsWith("END:VCALENDAR\r\n"), `${label}: ends with END:VCALENDAR and CRLF`);
  check(!/[^\r]\n/.test(text), `${label}: every line ends with CRLF`);
  check(lines.every((l) => Buffer.byteLength(l, "utf8") <= 75), `${label}: no line longer than 75 octets`);
  const ev = (text.match(/BEGIN:VEVENT/g) || []).length;
  check(ev === n && (text.match(/END:VEVENT/g) || []).length === n, `${label}: ${n} VEVENT blocks`);
  check((text.match(/DTSTART;VALUE=DATE:\d{8}\r\n/g) || []).length === n, `${label}: all-day DTSTART on each event`);
  check((text.match(/UID:[^\r]+@founders-field-guide/g) || []).length === n, `${label}: unique UID on each event`);
}

(async () => {
  const browser = await chromium.launch();
  const errors = [];
  const watch = (page) => {
    page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
    page.on("pageerror", (e) => errors.push(String(e)));
  };
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 }, acceptDownloads: true });
  const page = await ctx.newPage();
  watch(page);

  // ---- Directory loads ----
  await page.goto(base + "#/?sort=name");
  await page.waitForSelector(".row");
  const all = await rowIds(page);
  check(all.length === R.length, `directory lists all ${R.length} resources`);
  check(/101/.test(await page.textContent("#statResources")), "masthead shows the resource count");

  // ---- Every deadline option returns the right set, and its count matches ----
  for (const key of Object.keys(EXPECT)) {
    const expected = R.filter(EXPECT[key]).map((r) => r.id);
    const shownCount = +(await page.textContent(`#dlOpts label[data-dl="${key}"] .opt-n`));
    await pickDeadline(page, key);
    const got = await rowIds(page);
    check(sameSet(got, expected), `deadline "${key}" shows exactly ${expected.length} expected entries`);
    check(shownCount === expected.length, `deadline "${key}" option count reads ${shownCount}`);
    check((await page.locator('.chip[data-key="dl"]').count()) === 1, `deadline "${key}" adds a removable chip`);
  }
  // Custom range
  await page.click("#dlBtn");
  await page.fill("#dlFrom", "2026-10-14");
  await page.fill("#dlTo", "2026-11-05");
  await page.click("#dlRange button[type=submit]");
  const rangeExp = R.filter((r) => r.next_deadline && r.next_deadline >= "2026-10-14" && r.next_deadline <= "2026-11-05").map((r) => r.id);
  check(sameSet(await rowIds(page), rangeExp), `custom range Oct 14 to Nov 5 shows ${rangeExp.length} entries`);
  check(/Oct 14 to Nov 5/.test(await page.textContent('.chip[data-key="dl"]')), "custom range chip names the dates");

  // Combines with category, location, stage, and method
  await pickDeadline(page, "none");
  await page.click('.tab[data-cat="Maker Spaces & Labs"]');
  await page.selectOption("#f-loc", "UIUC");
  await page.selectOption("#f-method", "Walk-in or open access");
  const combo = R.filter((r) => EXPECT.none(r) && r.category === "Maker Spaces & Labs" && r.location === "UIUC" && r.application_method === "Walk-in or open access").map((r) => r.id);
  check(sameSet(await rowIds(page), combo), `deadline + category + location + method combine (${combo.length} entries)`);
  check((await page.locator(".chip").count()) === 4, "four chips for four active filters");
  await page.selectOption("#f-stage", "Prototype");
  const combo2 = combo.filter((id) => ["Prototype", "Any"].includes(R.find((r) => r.id === id).stage));
  check(sameSet(await rowIds(page), combo2), "stage filter also applies (and keeps Any-stage entries)");
  await page.click('.chip[data-key="loc"]');
  check((await page.locator(".chip").count()) === 4 && (await page.inputValue("#f-loc")) === "", "removing one chip clears only that filter");
  await page.click("#clearAll");
  check((await page.locator(".chip").count()) === 0 && (await rowIds(page)).length === R.length, "Clear all restores every entry");

  // Search and tabs keyboard
  await page.fill("#q", "patent");
  await page.waitForTimeout(250);
  const hits = await rowIds(page);
  check(hits.length > 0 && hits.length < R.length && hits.includes("ip-clinic"), `search "patent" finds ${hits.length}, including the IP Clinic`);
  await page.click('.chip[data-key="q"]');
  check((await page.inputValue("#q")) === "", "removing the search chip clears the box");
  await page.click('.tab[data-cat="Student Organizations"]');
  await page.keyboard.press("ArrowRight");
  check((await page.getAttribute('.tab[aria-selected="true"]', "data-cat")) === "Events & Community", "arrow key moves to the next category tab");
  await page.click('.tab[data-cat=""]');
  check(await page.locator("#hint.is-gone").count() === 1, "the how-to-use line disappears after interaction");

  // Empty state
  await page.fill("#q", "zzqxv");
  await page.waitForTimeout(250);
  check(/Nothing matches/.test(await page.textContent("#list")), "no-results state explains what to try");
  await page.click("[data-action=clear]");

  // ---- Calendar ----
  await page.goto(base + "#/");
  await page.waitForSelector(".row");
  await page.click('[data-viewlink="calendar"]');
  await page.waitForSelector(".cal-grid");
  check(/#\/calendar/.test(page.url()), "Calendar toggle switches the route");
  check(await page.isVisible("#cal-view") && !(await page.isVisible("#list-view")), "calendar view shows and directory hides");
  const octDated = R.filter((r) => r.next_deadline && r.next_deadline.startsWith("2026-10"));
  check((await page.locator(".cal-grid .mk").count()) === octDated.length, `October grid shows ${octDated.length} markers`);
  const upAll = R.filter(up);
  check((await page.locator(".ag-item").count()) === upAll.length, `agenda lists all ${upAll.length} upcoming dated entries`);
  check((await page.locator(".unscheduled .un-list li").count()) === R.length - upAll.length, "every undated entry appears under Rolling and unscheduled");
  const typicalDated = R.filter((r) => r.deadline_type === "Typical" && r.next_deadline).length;
  check((await page.locator(".mk--typical").count()) <= typicalDated, "typical markers only for entries with a justified date");

  // Filters apply to the calendar
  await page.click('.tab[data-cat="External Partners"]');
  const extUp = upAll.filter((r) => r.category === "External Partners");
  const agCats = await page.$$eval(".ag-item", (els) => els.map((e) => e.getAttribute("data-c")));
  check(agCats.length === extUp.length && agCats.every((c) => c === "EX"), `category tab filters the agenda (${extUp.length} partner dates)`);
  check((await page.$$eval(".cal-grid .mk", (els) => els.every((e) => e.getAttribute("data-c") === "EX"))), "category tab filters the grid markers");
  await page.selectOption("#f-method", "Online form");
  const extForm = extUp.filter((r) => r.application_method === "Online form");
  check((await page.locator(".ag-item").count()) === extForm.length, "method filter also applies to the calendar");
  await page.selectOption("#f-method", "");
  await page.selectOption("#f-loc", "Online");
  const emptyMsg = await page.textContent("#cal");
  const tbcLeft = R.filter((r) => r.category === "External Partners" && r.location === "Online" && EXPECT.tbc(r)).length;
  if (!R.some((r) => r.category === "External Partners" && r.location === "Online" && up(r))) {
    check(/No dated deadlines match these filters/.test(emptyMsg), "honest empty state when no dated deadlines match");
    if (tbcLeft) check(emptyMsg.includes(String(tbcLeft)), "empty state says how many still have dates to be confirmed");
  }
  await page.selectOption("#f-loc", "");

  // ---- .ics downloads ----
  const firstAdd = page.locator(".btn-ics").first();
  const [dl1] = await Promise.all([page.waitForEvent("download"), firstAdd.click()]);
  const f1 = await dl1.path();
  check(dl1.suggestedFilename().endsWith(".ics"), "Add to calendar downloads an .ics file");
  validIcs(readIcs(f1), 1, "single .ics");
  const nExport = await page.locator(".ag-item").count();
  const [dl2] = await Promise.all([page.waitForEvent("download"), page.click("#icsAll")]);
  validIcs(readIcs(await dl2.path()), nExport, "export .ics");

  // ---- Calendar marker opens detail; Back restores calendar and filters ----
  const calUrl = page.url();
  const mk = page.locator(".cal-grid .mk").first();
  const mkId = (await mk.getAttribute("href")).replace("#/resource/", "");
  await mk.click();
  await page.waitForSelector(".d-title");
  check(page.url().endsWith("#/resource/" + mkId), "clicking a calendar marker opens the resource route");
  check(await page.locator(".d-head.is-arriving").count() === 1, "arriving from the calendar highlights the header");
  await page.goBack();
  await page.waitForSelector(".cal-grid");
  check(page.url() === calUrl, "Back returns to the same calendar URL");
  check((await page.getAttribute('.tab[aria-selected="true"]', "data-cat")) === "External Partners", "Back restores the active filters");

  // ---- Detail pages: full and sparse entries ----
  const filled = (r) => ["what_it_is", "who_should_apply", "choose_this_if", "apply_url", "contact_email", "next_deadline",
    "opens_date", "deadline_note", "cost_or_funding", "parent_org", "url"].filter((k) => r[k]).length + r.apply_steps.length + (r.source_urls.length ? 1 : 0);
  const sorted = R.slice().sort((a, b) => filled(b) - filled(a));
  const full = sorted[0], sparse = sorted[sorted.length - 1];
  for (const [r, label] of [[full, "full"], [sparse, "sparse"]]) {
    await page.goto(base + "#/resource/" + r.id);
    await page.waitForSelector(".d-title");
    check((await page.textContent(".d-title")) === r.name, `${label} entry (${r.id}) renders its title`);
    for (const sel of [".crumbs", ".d-tagline", ".d-badges", ".d-summary", ".d-apply", ".d-dates", ".d-details", ".d-sources"]) {
      check(await page.locator(sel).count() === 1, `${label} entry has ${sel}`);
    }
    const emptyRows = await page.$$eval(".d dd", (dds) => dds.filter((d) => !d.textContent.trim()).length);
    check(emptyRows === 0, `${label} entry has no empty rows`);
    const body = await page.textContent(".d");
    check(!/undefined|null|NaN|\[object/.test(body), `${label} entry has no broken values`);
    check((await page.locator(".d-summary .kv").count()) === 3, `${label} entry shows all three summary rows`);
    check((await page.locator(".steps li").count()) === r.apply_steps.length, `${label} entry shows ${r.apply_steps.length} apply steps`);
    check((await page.locator(".sources li").count()) === r.source_urls.length, `${label} entry lists its ${r.source_urls.length} sources`);
    check((await page.locator(".rel li").count()) <= 3, `${label} entry shows at most 3 related resources`);
    if (r.needs_confirmation) check(/Needs confirmation/.test(body), `${label} entry shows the needs-confirmation notice`);
    const corr = await page.getAttribute(".correct a", "href");
    check(corr.includes(encodeURIComponent(r.name).slice(0, 20)), `${label} entry's correction link is prefilled with the name`);
  }
  // Print handout fits on one page
  await page.goto(base + "#/resource/" + full.id);
  await page.waitForSelector(".d-title");
  const pdf = await page.pdf({ format: "Letter" });
  const pages = (pdf.toString("latin1").match(/\/Type\s*\/Page[^s]/g) || []).length;
  check(pages === 1, `print handout for ${full.id} is ${pages} page`);
  await page.emulateMedia({ media: "print" });
  await page.screenshot({ path: path.join(shots, "print-handout.png"), fullPage: true });
  await page.emulateMedia({ media: "screen" });

  // ---- Desktop screenshots ----
  await page.goto(base + "#/");
  await page.waitForTimeout(1100);
  await page.screenshot({ path: path.join(shots, "desktop.png") });
  await page.goto(base + "#/calendar");
  await page.waitForSelector(".cal-grid");
  await page.evaluate(() => document.querySelector(".controls").scrollIntoView());
  await page.screenshot({ path: path.join(shots, "desktop-calendar.png") });
  await page.goto(base + "#/resource/cozad-new-venture-challenge");
  await page.waitForSelector(".d-title");
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(shots, "desktop-detail.png") });

  // ---- Mobile ----
  const m = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  watch(m);
  for (const [hash, name] of [["#/", "mobile.png"], ["#/calendar", "mobile-calendar.png"], ["#/resource/city-scholars", "mobile-detail.png"]]) {
    await m.goto(base + hash);
    await m.waitForTimeout(1100);
    const overflow = await m.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    check(!overflow, `no horizontal scroll at 390px on ${hash}`);
    if (hash === "#/calendar") {
      check(!(await m.isVisible(".cal-grid")) && (await m.isVisible(".agenda")), "phone calendar shows the agenda list only");
      await m.evaluate(() => document.querySelector(".cal-top").scrollIntoView());
    }
    await m.screenshot({ path: path.join(shots, name) });
  }
  await m.goto(base + "#/");
  await m.click("#filtersToggle");
  check(await m.isVisible("#f-loc"), "phone Filters button reveals the filters");

  const real = errors.filter((e) => !/fonts\.(googleapis|gstatic)/.test(e));
  check(real.length === 0, "no console errors" + (real.length ? ": " + real.join(" | ") : ""));
  await browser.close();
  console.log(`All ${passed} checks passed.`);
})().catch((e) => { console.error(e.message || e); process.exit(1); });

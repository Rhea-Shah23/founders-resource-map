// Smoke test for docs/index.html using Playwright.
// Setup once:  npm i -D playwright && npx playwright install chromium
// Run:         node scripts/test_site.cjs
// Loads the page from file://, switches tabs, filters, searches, uses the
// matcher, opens a detail panel, fails on any console error, and saves
// desktop and mobile screenshots to docs/screenshots/.
const { chromium } = require("playwright");
const path = require("path");

const root = path.resolve(__dirname, "..");
const url = "file://" + path.join(root, "docs", "index.html");
const shots = path.join(root, "docs", "screenshots");

function check(cond, msg) {
  if (!cond) throw new Error("FAIL: " + msg);
  console.log("ok  " + msg);
}

(async () => {
  const browser = await chromium.launch();
  const errors = [];
  const watch = (page) => {
    page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
    page.on("pageerror", (e) => errors.push(String(e)));
  };

  // Desktop (projector-sized)
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  watch(page);
  await page.goto(url);
  await page.waitForSelector(".card");
  const total = await page.locator(".card").count();
  check(total > 50, `page renders ${total} cards`);
  const banner = await page.textContent("#bannerLine");
  check(/University map: \d+ entries\. Our directory: \d+ resources\./.test(banner), "banner line present");
  await page.screenshot({ path: path.join(shots, "desktop.png") });
  await page.screenshot({ path: path.join(shots, "desktop-full.png"), fullPage: true });

  // Tabs
  await page.click('.tab[data-tab="Student Organizations"]');
  const orgCount = await page.locator(".card").count();
  const allOrgs = await page.locator(".card .cat").allTextContents();
  check(orgCount > 0 && allOrgs.every((c) => c === "Student Organizations"), `tab filters to ${orgCount} student orgs`);
  await page.keyboard.press("ArrowRight");
  const sel = await page.getAttribute('.tab[aria-selected="true"]', "data-tab");
  check(sel === "Events & Community", "arrow key moves to next tab");
  await page.click('.tab[data-tab="All"]');

  // Filter and chip
  await page.selectOption("#f-status", "Active");
  const statuses = await page.locator(".card .badge.Active").count();
  const shown = await page.locator(".card").count();
  check(shown > 0 && statuses === shown, `status filter shows ${shown} active resources`);
  check(await page.locator(".chip").count() === 1, "filter chip appears");
  await page.selectOption("#f-deadline", "upcoming");
  const dl = await page.locator(".card").count();
  check(dl >= 0, `upcoming-deadline filter shows ${dl}`);
  await page.click("#clearAll");
  check(await page.locator(".chip").count() === 0, "clear all removes chips");

  // Search
  await page.fill("#q", "patent");
  const hits = await page.locator(".card").count();
  check(hits > 0 && hits < total, `search "patent" finds ${hits}`);
  await page.click('.chip[data-key="q"]');
  check((await page.inputValue("#q")) === "", "removing search chip clears box");

  // Matcher
  await page.fill("#matchText", "medical device for rural clinics");
  await page.selectOption("#matchStage", "Prototype");
  await page.click('#matchForm button[type="submit"]');
  const matches = await page.locator(".card.is-match").count();
  check(matches > 0, `matcher highlights ${matches} resources`);
  const first = await page.locator(".card").first().getAttribute("class");
  check(first.includes("is-match"), "best match sorted first");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: path.join(shots, "desktop-matcher.png") });
  await page.click("#matchReset");

  // Detail panel
  await page.locator(".card h3 button").first().click();
  await page.waitForSelector("dialog[open]");
  const title = await page.textContent("#dTitle");
  check(title.length > 0, `detail panel opens for "${title}"`);
  await page.screenshot({ path: path.join(shots, "desktop-detail.png") });
  await page.keyboard.press("Escape");
  check(!(await page.locator("dialog[open]").count()), "Escape closes the panel");

  // Mobile
  const m = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  watch(m);
  await m.goto(url);
  await m.waitForSelector(".card");
  const overflow = await m.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  check(!overflow, "no horizontal scroll at phone width");
  await m.screenshot({ path: path.join(shots, "mobile.png") });
  await m.locator(".card h3 button").first().click();
  await m.waitForSelector("dialog[open]");
  await m.screenshot({ path: path.join(shots, "mobile-detail.png") });

  // External resources (Google Fonts) may fail offline; that is not a page error.
  const real = errors.filter((e) => !/fonts\.(googleapis|gstatic)/.test(e));
  check(real.length === 0, "no console errors" + (real.length ? ": " + real.join(" | ") : ""));
  await browser.close();
  console.log("All checks passed.");
})().catch((e) => { console.error(e.message || e); process.exit(1); });

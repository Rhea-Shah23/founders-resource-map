/* Founders Field Guide: site logic.
   scripts/build.py inlines this file, styles.css, and the data into docs/index.html.
   Routes (hash based, so the page works from file:// and GitHub Pages):
     #/?filters            directory
     #/calendar?filters    deadlines calendar
     #/resource/<id>       one resource
   Add ?today=YYYY-MM-DD to the page URL to pin "today" (used by the tests). */
(function () {
  "use strict";

  /* ---------- Data and dates ---------- */
  var DATA = JSON.parse(document.getElementById("data").textContent);
  var CONFIG = DATA.config || {};
  var CATS = DATA.categories;
  var METHODS = DATA.application_methods;
  var DAY = 864e5;
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August",
    "September", "October", "November", "December"];
  var MON = MONTHS.map(function (m) { return m.slice(0, 3); });
  var WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  function $(s, el) { return (el || document).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function iso(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || "");
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
  }
  function isoOf(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  var TODAY = (function () {
    var t = iso(new URLSearchParams(location.search).get("today"));
    if (t) return t;
    var n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), n.getDate());
  })();
  function daysTo(d) { return Math.round((d - TODAY) / DAY); }
  function fmt(d) { return MON[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear(); }
  function fmtShort(d) { return MON[d.getMonth()] + " " + d.getDate(); }
  function plural(n, one, many) { return n + " " + (n === 1 ? one : (many || one + "s")); }

  var CAT = {
    "Pitch Competitions & Challenges": ["CP", "Competitions"],
    "Accelerators & Incubators": ["AC", "Accelerators"],
    "Funding & Grants": ["FN", "Funding"],
    "Courses & Training": ["CR", "Courses"],
    "Fellowships & Internships": ["FL", "Fellowships"],
    "Maker Spaces & Labs": ["MK", "Maker spaces"],
    "Student Organizations": ["SO", "Student orgs"],
    "Events & Community": ["EV", "Events"],
    "Advising & Legal/IP": ["AD", "Advising"],
    "Campus Hubs": ["HB", "Campus hubs"],
    "External Partners": ["EX", "Partners"]
  };

  var R = DATA.resources.map(function (r, i) {
    r.no = pad3(i + 1);
    r.code = CAT[r.category][0];
    r.catShort = CAT[r.category][1];
    r.dl = iso(r.next_deadline);
    r.last = iso(r.last_deadline);
    r.opens = iso(r.opens_date);
    r.isEvent = /^event:/i.test(r.deadline_note);
    r.hay = [r.name, r.tagline, r.description, r.what_it_is, r.who_should_apply, r.choose_this_if,
      r.good_for, r.subcategory, r.parent_org, r.ideal_participant, r.tags.join(" "),
      r.category, r.application_method].join(" ").toLowerCase();
    return r;
  });
  function pad3(n) { return ("00" + n).slice(-3); }
  var BY_ID = {};
  R.forEach(function (r) { BY_ID[r.id] = r; });

  function upcoming(r) { return !!r.dl && daysTo(r.dl) >= 0; }
  function closedOn(r) { return r.dl && daysTo(r.dl) < 0 ? r.dl : r.last; }
  function within(n, a, b) { return n >= a && n <= b; }

  /* Deadline filter options, in display order. */
  var DL = [
    { k: "d7", label: "Next 7 days", test: function (r) { return upcoming(r) && daysTo(r.dl) <= 7; } },
    { k: "d30", label: "8 to 30 days", test: function (r) { return upcoming(r) && within(daysTo(r.dl), 8, 30); } },
    { k: "d60", label: "31 to 60 days", test: function (r) { return upcoming(r) && within(daysTo(r.dl), 31, 60); } },
    { k: "d90", label: "61 to 90 days", test: function (r) { return upcoming(r) && within(daysTo(r.dl), 61, 90); } },
    { k: "d90p", label: "More than 90 days", test: function (r) { return upcoming(r) && daysTo(r.dl) > 90; } },
    { k: "rolling", label: "Rolling admissions", test: function (r) { return r.deadline_type === "Rolling"; } },
    { k: "none", label: "No deadline published", test: function (r) { return r.deadline_type === "None published"; } },
    { k: "tbc", label: "Date to be confirmed", test: function (r) {
      return !upcoming(r) && ["Typical", "Unknown", "Confirmed"].indexOf(r.deadline_type) >= 0;
    } },
    { k: "closed", label: "Recently closed (past 30 days)", test: function (r) {
      var c = closedOn(r);
      return !!c && within(daysTo(c), -30, -1);
    } }
  ];
  var DL_BY = {};
  DL.forEach(function (o) { DL_BY[o.k] = o; });

  /* Plain-language search: every word must appear in the entry, or map to one of its tags. */
  var STOP = "a an and the of for to in on at with my our we i is are be it this that from by as or want need".split(" ");
  var SYN = {
    software: "software app apps web mobile saas ai ml data platform code coding",
    hardware: "hardware device devices robot robotics sensor sensors electronics physical",
    prototyping: "prototype prototyping build device 3d print printing fabricate",
    "maker-space": "3d print printing laser fabricate fabrication tools makerspace",
    health: "health medical medicine clinic patient patients hospital biotech healthcare",
    agtech: "farm farming agriculture ag crop crops food rural",
    quantum: "quantum qubit",
    "social-impact": "social nonprofit impact sustainability climate equity",
    funding: "funding money raise grant grants capital invest investment seed",
    equity: "investor investors vc venture",
    prizes: "prize prizes win",
    pitching: "pitch pitching demo",
    "legal-ip": "patent patents ip legal law lawyer trademark",
    "design-thinking": "design ux ui designer",
    mentorship: "mentor mentors advice advisor",
    "customer-discovery": "customers customer discovery market validate validation",
    careers: "job jobs career",
    internships: "internship internships intern",
    workspace: "office space desk"
  };
  var SYN_INDEX = {};
  Object.keys(SYN).forEach(function (tag) {
    SYN[tag].split(" ").forEach(function (w) { (SYN_INDEX[w] = SYN_INDEX[w] || []).push(tag); });
  });
  function searchHit(r, q) {
    var words = q.toLowerCase().split(/[^a-z0-9+#]+/).filter(Boolean);
    var real = words.filter(function (w) { return STOP.indexOf(w) < 0; });
    if (real.length) words = real;
    return words.every(function (w) {
      if (r.hay.indexOf(w) >= 0) return true;
      return (SYN_INDEX[w] || []).some(function (t) { return r.tags.indexOf(t) >= 0; });
    });
  }

  /* ---------- State in the URL ---------- */
  var KEYS = ["q", "cat", "loc", "stage", "method", "dl", "from", "to", "sort", "m"];
  var state = { view: "directory", id: null };
  KEYS.forEach(function (k) { state[k] = ""; });
  var lastListHash = "#/";
  var prevView = null;
  var scrollMemo = {};

  function readHash() {
    var h = location.hash.replace(/^#/, "") || "/";
    var qi = h.indexOf("?");
    var path = qi >= 0 ? h.slice(0, qi) : h;
    var p = new URLSearchParams(qi >= 0 ? h.slice(qi + 1) : "");
    var parts = path.split("/").filter(Boolean);
    if (parts[0] === "resource" && parts[1]) {
      return { view: "resource", id: decodeURIComponent(parts[1]) };
    }
    var s = { view: parts[0] === "calendar" ? "calendar" : "directory", id: null };
    KEYS.forEach(function (k) { s[k] = p.get(k) || ""; });
    if (s.cat && CATS.indexOf(s.cat) < 0) s.cat = "";
    if (s.dl && s.dl !== "custom" && !DL_BY[s.dl]) s.dl = "";
    return s;
  }
  function listHash(s, view) {
    var p = new URLSearchParams();
    KEYS.forEach(function (k) {
      if (!s[k]) return;
      if (k === "m" && view !== "calendar") return;
      if (k === "sort" && view === "calendar") return;
      p.set(k, s[k]);
    });
    var q = p.toString();
    return "#/" + (view === "calendar" ? "calendar" : "") + (q ? "?" + q : "");
  }
  function setFilters(patch) {
    Object.keys(patch).forEach(function (k) { state[k] = patch[k]; });
    var h = listHash(state, state.view);
    try { history.replaceState(null, "", h); } catch (e) { location.replace(h); return; }
    dismissHint();
    render();
  }
  function go(hash) {
    if (state.view !== "resource") scrollMemo[location.hash || "#/"] = window.scrollY;
    location.hash = hash;
  }

  /* ---------- Filtering ---------- */
  function rangeTest(s) {
    var from = iso(s.from), to = iso(s.to);
    return function (r) { return !!r.dl && (!from || r.dl >= from) && (!to || r.dl <= to); };
  }
  function passes(r, s, skip) {
    if (skip !== "cat" && s.cat && r.category !== s.cat) return false;
    if (skip !== "loc" && s.loc && r.location !== s.loc) return false;
    if (skip !== "stage" && s.stage && r.stage !== s.stage && r.stage !== "Any") return false;
    if (skip !== "method" && s.method && r.application_method !== s.method) return false;
    if (skip !== "dl" && s.dl) {
      var t = s.dl === "custom" ? rangeTest(s) : DL_BY[s.dl].test;
      if (!t(r)) return false;
    }
    if (skip !== "q" && s.q && !searchHit(r, s.q)) return false;
    return true;
  }
  function filtered(skip) { return R.filter(function (r) { return passes(r, state, skip); }); }

  var TYPE_ORDER = { Confirmed: 0, Typical: 1, Rolling: 2, "None published": 3, Unknown: 4 };
  function sortItems(items) {
    var s = state.sort;
    var out = items.slice();
    if (s === "name") {
      out.sort(function (a, b) { return a.name.localeCompare(b.name); });
    } else if (s === "deadline") {
      out.sort(function (a, b) {
        var ua = upcoming(a), ub = upcoming(b);
        if (ua && ub) return a.dl - b.dl || a.name.localeCompare(b.name);
        if (ua !== ub) return ua ? -1 : 1;
        return (TYPE_ORDER[a.deadline_type] - TYPE_ORDER[b.deadline_type]) || a.name.localeCompare(b.name);
      });
    }
    return out;
  }

  /* ---------- Icons (one 1.5px stroke family) ---------- */
  var ICON_PATHS = {
    form: '<rect x="5" y="3.5" width="14" height="17" rx="1.5"/><path d="M8.5 8h7M8.5 12h7M8.5 16h4"/>',
    mail: '<rect x="3.5" y="5.5" width="17" height="13" rx="1.5"/><path d="m4 7 8 6 8-6"/>',
    pitch: '<path d="M12 3.5v10"/><path d="M8 7.5 12 3.5l4 4"/><path d="M4.5 14.5v4a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-4"/>',
    event: '<rect x="3.5" y="5" width="17" height="15" rx="1.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    course: '<path d="M4 6.5c3-1.5 5.5-1.5 8 0v13c-2.5-1.5-5-1.5-8 0z"/><path d="M12 6.5c2.5-1.5 5-1.5 8 0v13c-3-1.5-5.5-1.5-8 0"/>',
    staff: '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c.8-3.7 3.6-5.5 7-5.5s6.2 1.8 7 5.5"/>',
    door: '<path d="M6 20.5V4.5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v16"/><path d="M3.5 20.5h17"/><circle cx="14.5" cy="12.5" r=".9" fill="currentColor"/>',
    na: '<circle cx="12" cy="12" r="8.5"/><path d="M8 12h8"/>',
    unknown: '<circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.4a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .8-1 1.5v.5"/><circle cx="12" cy="16.8" r=".9" fill="currentColor"/>',
    arrow: '<path d="M7 17 17 7M9 7h8v8"/>',
    back: '<path d="M15 6l-6 6 6 6"/>',
    next: '<path d="M9 6l6 6-6 6"/>',
    cal: '<rect x="3.5" y="5" width="17" height="15" rx="1.5"/><path d="M3.5 10h17M8 3v4M16 3v4M12 13v4M10 15h4"/>',
    download: '<path d="M12 4v11"/><path d="m7.5 10.5 4.5 4.5 4.5-4.5"/><path d="M4.5 19.5h15"/>',
    rolling: '<path d="M19 12a7 7 0 1 1-2.1-5"/><path d="M19.5 4.5v4h-4"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>'
  };
  function icon(name, cls) {
    return '<svg class="ico' + (cls ? " " + cls : "") + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      ICON_PATHS[name] + "</svg>";
  }
  var METHOD_ICON = {
    "Online form": "form", "Email": "mail", "Pitch submission": "pitch",
    "Info session or event": "event", "Course registration": "course", "Contact staff": "staff",
    "Walk-in or open access": "door", "Not applicable": "na", "Unknown": "unknown"
  };
  var METHOD_SHORT = {
    "Online form": "Online form", "Email": "Email", "Pitch submission": "Pitch submission",
    "Info session or event": "Event or info session", "Course registration": "Course registration",
    "Contact staff": "Contact staff", "Walk-in or open access": "Walk in", "Not applicable": "Nothing to apply for",
    "Unknown": "Method unknown"
  };
  /* Deadline type marks: shape carries meaning, so color is never the only cue. */
  function typeMark(t) {
    var cls = { Confirmed: "solid", Typical: "ring", Rolling: "loop", "None published": "bar", Unknown: "query" }[t] || "query";
    return '<span class="tm tm--' + cls + '" aria-hidden="true"></span>';
  }

  /* ---------- Shared bits ---------- */
  function flags(r) {
    var out = "";
    if (r.status === "Inactive") out += '<span class="flag flag--inactive">Inactive</span>';
    if (r.needs_confirmation) out += '<span class="flag flag--unverified" title="Some facts still need a human check">Unverified</span>';
    if (!r.on_university_map) out += '<span class="flag flag--added" title="Not on the University map. Added by Founders">Added by Founders</span>';
    return out;
  }
  function relDays(n) {
    if (n === 0) return "Today";
    if (n === 1) return "Tomorrow";
    if (n < 0) return plural(-n, "day") + " ago";
    return "In " + plural(n, "day");
  }
  function deadlineCell(r) {
    var t = r.deadline_type;
    if (upcoming(r)) {
      var n = daysTo(r.dl);
      var kind = t === "Typical" ? "Typical date" : (r.isEvent ? "Next event" : "Deadline");
      return '<span class="dl dl--' + (t === "Typical" ? "typical" : "confirmed") + (n <= 7 ? " is-soon" : "") + '">' +
        '<span class="dl-kind">' + typeMark(t) + kind + "</span>" +
        '<time class="dl-date" datetime="' + r.next_deadline + '">' + fmtShort(r.dl) + "</time>" +
        '<span class="dl-rel">' + relDays(n) + "</span></span>";
    }
    var c = closedOn(r);
    var recent = c && within(daysTo(c), -30, -1);
    var label = { Typical: "Typical timing", Rolling: "Rolling", "None published": "No deadline",
      Unknown: "To be confirmed", Confirmed: "Closed" }[t] || "To be confirmed";
    var sub = { Typical: "Date not yet posted", Rolling: "Apply any time",
      "None published": "No application date", Unknown: "No date found yet", Confirmed: "Next date not posted" }[t] || "";
    if (recent) sub = "Closed " + fmtShort(c);
    return '<span class="dl dl--' + (t === "Typical" ? "typical" : "plain") + '"><span class="dl-kind">' + typeMark(t) +
      label + '</span><span class="dl-rel">' + esc(sub) + "</span></span>";
  }
  function methodCell(r) {
    var n = r.apply_steps.length;
    return '<span class="how">' + icon(METHOD_ICON[r.application_method] || "unknown") +
      '<span><span class="how-m">' + esc(METHOD_SHORT[r.application_method] || r.application_method) + "</span>" +
      (n ? '<span class="how-n">' + plural(n, "step") + "</span>" : "") + "</span></span>";
  }
  function catTag(r) {
    return '<span class="cat" data-c="' + r.code + '"><span class="cat-code">' + r.code + "</span>" + esc(r.catShort) + "</span>";
  }

  /* ---------- Toolbar: tabs, selects, deadline menu, chips ---------- */
  var LOCS = [["UIUC", "On campus"], ["CU", "Champaign-Urbana"], ["Chicago", "Chicago"], ["National", "National"], ["Online", "Online"]];
  var STAGES = [["Idea", "Just an idea"], ["Prototype", "Building a prototype"], ["Launched", "Launched or selling"]];

  function countBy(skip, fn) {
    var base = filtered(skip);
    return function (v) { return base.filter(function (r) { return fn(r, v); }).length; };
  }
  function fillSelect(sel, anyLabel, opts, counter, current) {
    sel.innerHTML = '<option value="">' + esc(anyLabel) + "</option>" + opts.map(function (o) {
      return '<option value="' + esc(o[0]) + '">' + esc(o[1]) + " (" + counter(o[0]) + ")</option>";
    }).join("");
    sel.value = current;
  }
  function renderTabs() {
    var c = countBy("cat", function (r, v) { return !v || r.category === v; });
    var tabs = [["", "All", c("")]].concat(CATS.map(function (k) { return [k, CAT[k][1], c(k)]; }));
    $("#tabs").innerHTML = tabs.map(function (t) {
      var on = state.cat === t[0];
      return '<button type="button" role="tab" class="tab" data-cat="' + esc(t[0]) + '" aria-selected="' + on +
        '" tabindex="' + (on ? 0 : -1) + '"' + (t[0] ? ' title="' + esc(t[0]) + '"' : "") + ">" +
        (t[0] ? '<span class="tab-code" data-c="' + CAT[t[0]][0] + '">' + CAT[t[0]][0] + "</span>" : "") +
        '<span class="tab-label">' + esc(t[1]) + '</span><span class="tab-n">' + t[2] + "</span></button>";
    }).join("");
  }
  function renderSelects() {
    fillSelect($("#f-loc"), "Anywhere", LOCS, countBy("loc", function (r, v) { return r.location === v; }), state.loc);
    fillSelect($("#f-stage"), "Any stage", STAGES, countBy("stage", function (r, v) { return r.stage === v || r.stage === "Any"; }), state.stage);
    fillSelect($("#f-method"), "Any way to apply", METHODS.map(function (m) { return [m, m]; }),
      countBy("method", function (r, v) { return r.application_method === v; }), state.method);
    $("#sort").value = state.sort || "guide";
  }
  function dlLabel() {
    if (state.dl === "custom") {
      var f = iso(state.from), t = iso(state.to);
      if (f && t) return fmtShort(f) + " to " + fmtShort(t);
      if (f) return "From " + fmtShort(f);
      if (t) return "Until " + fmtShort(t);
      return "Custom range";
    }
    return state.dl ? DL_BY[state.dl].label : "";
  }
  function renderDeadlineMenu() {
    var base = filtered("dl");
    $("#dlOpts").innerHTML = [{ k: "", label: "Any time" }].concat(DL).map(function (o) {
      var n = o.k ? base.filter(o.test).length : base.length;
      var on = state.dl === o.k;
      return '<label class="opt' + (n ? "" : " is-zero") + '" data-dl="' + o.k + '"><input type="radio" name="dl" value="' + o.k +
        '"' + (on ? " checked" : "") + '><span class="opt-l">' + esc(o.label) + '</span><span class="opt-n">' + n + "</span></label>";
    }).join("");
    $("#dlFrom").value = state.dl === "custom" ? state.from : "";
    $("#dlTo").value = state.dl === "custom" ? state.to : "";
    $("#dlBtnVal").textContent = dlLabel() || "Any time";
    $("#dlBtn").classList.toggle("is-set", !!state.dl);
  }
  function renderChips() {
    var chips = [];
    if (state.q) chips.push(["q", "Search: \u201c" + state.q + "\u201d"]);
    if (state.cat) chips.push(["cat", state.cat]);
    if (state.loc) chips.push(["loc", LOCS.filter(function (l) { return l[0] === state.loc; })[0][1]]);
    if (state.stage) chips.push(["stage", "Stage: " + STAGES.filter(function (l) { return l[0] === state.stage; })[0][1]]);
    if (state.method) chips.push(["method", "Apply by: " + state.method]);
    if (state.dl) chips.push(["dl", "Deadline: " + dlLabel()]);
    $("#chips").innerHTML = chips.map(function (c) {
      return '<button type="button" class="chip" data-key="' + c[0] + '" aria-label="Remove filter ' + esc(c[1]) + '">' +
        esc(c[1]) + icon("x") + "</button>";
    }).join("");
    $("#clearAll").hidden = !chips.length;
  }

  /* ---------- Directory ---------- */
  function rowHTML(r, i, showCat) {
    return '<li class="row' + (r.status === "Inactive" ? " is-inactive" : "") + '" style="--i:' + Math.min(i, 18) + '">' +
      '<a class="row-link" href="#/resource/' + esc(r.id) + '">' +
      '<span class="row-no" aria-hidden="true">' + r.no + "</span>" +
      '<span class="row-main">' +
      '<span class="row-name">' + esc(r.name) + "</span>" +
      '<span class="row-tagline">' + esc(r.tagline) + "</span>" +
      '<span class="row-fit">' + esc(r.choose_this_if) + "</span>" +
      '<span class="row-flags">' + (showCat ? catTag(r) : "") + flags(r) + "</span>" +
      "</span>" +
      '<span class="row-dl">' + deadlineCell(r) + "</span>" +
      '<span class="row-how">' + methodCell(r) + "</span>" +
      "</a></li>";
  }
  function renderDirectory(items) {
    var el = $("#list");
    if (!items.length) { el.innerHTML = emptyState(); return; }
    var grouped = !state.cat && (!state.sort || state.sort === "guide");
    var html = "";
    if (grouped) {
      var i = 0;
      CATS.forEach(function (cat, ci) {
        var g = items.filter(function (r) { return r.category === cat; });
        if (!g.length) return;
        html += '<section class="group" data-c="' + CAT[cat][0] + '"><h2 class="group-h"><span class="group-no">' + pad(ci + 1) +
          '</span><span class="group-name">' + esc(cat) + '</span><span class="group-n">' + plural(g.length, "entry", "entries") +
          '</span></h2><ol class="rows">' + g.map(function (r) { return rowHTML(r, i++, false); }).join("") + "</ol></section>";
      });
    } else {
      var sorted = sortItems(items);
      html = '<ol class="rows rows--flat">' + sorted.map(function (r, i) { return rowHTML(r, i, true); }).join("") + "</ol>";
    }
    el.innerHTML = html;
  }
  function emptyState() {
    var hints = [];
    if (state.q) hints.push("try fewer or broader words than \u201c" + esc(state.q) + "\u201d");
    if (state.dl) hints.push("widen the deadline range");
    if (state.loc || state.stage || state.method) hints.push("drop a location, stage, or apply-by filter");
    if (state.cat) hints.push("look across all categories");
    return '<div class="empty"><p class="empty-h">Nothing matches all of that.</p><p>' +
      (hints.length ? "You could " + hints.join(", or ") + "." : "Try a different combination.") +
      '</p><button type="button" class="btn btn--quiet" data-action="clear">Clear all filters</button></div>';
  }

  /* ---------- Calendar ---------- */
  function monthKey(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1); }
  function renderCalendar(items) {
    var dated = items.filter(function (r) { return !!r.dl; }).sort(function (a, b) { return a.dl - b.dl; });
    var ahead = dated.filter(upcoming);
    var m = /^(\d{4})-(\d{2})$/.exec(state.m || "");
    var first = m ? new Date(+m[1], +m[2] - 1, 1) : new Date(TODAY.getFullYear(), TODAY.getMonth(), 1);
    var prev = new Date(first.getFullYear(), first.getMonth() - 1, 1);
    var next = new Date(first.getFullYear(), first.getMonth() + 1, 1);

    // Month grid
    var start = new Date(first.getFullYear(), first.getMonth(), 1 - first.getDay());
    var cells = "";
    for (var i = 0; i < 42; i++) {
      var d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      if (i >= 35 && d.getMonth() !== first.getMonth()) break;
      var here = dated.filter(function (r) { return r.dl.getTime() === d.getTime(); });
      var cls = "day" + (d.getMonth() !== first.getMonth() ? " is-out" : "") +
        (d.getTime() === TODAY.getTime() ? " is-today" : "") + (d < TODAY ? " is-past" : "") + (here.length ? " has-items" : "");
      cells += '<div class="' + cls + '" data-date="' + isoOf(d) + '" role="gridcell">' +
        (here.length ? '<button type="button" class="day-n" data-day="' + isoOf(d) + '" aria-label="' + fmt(d) + ", " +
          plural(here.length, "deadline") + '">' + d.getDate() + "</button>" : '<span class="day-n">' + d.getDate() + "</span>") +
        here.map(function (r) {
          var typ = r.deadline_type === "Typical" ? "typical" : "confirmed";
          var lab = r.deadline_type === "Typical" ? "Typical, date not yet posted" : (r.isEvent ? "Event" : "Deadline");
          return '<a class="mk mk--' + typ + '" data-c="' + r.code + '" href="#/resource/' + esc(r.id) + '" title="' + esc(r.name + ". " + lab) + '">' +
            '<span class="mk-code">' + r.code + '</span><span class="mk-name">' + esc(r.name) + "</span></a>";
        }).join("") + "</div>";
    }
    var monthCount = dated.filter(function (r) { return monthKey(r.dl) === monthKey(first); }).length;

    // Agenda (upcoming only, grouped by month)
    var agenda = "";
    if (ahead.length) {
      var groups = {};
      ahead.forEach(function (r) { (groups[monthKey(r.dl)] = groups[monthKey(r.dl)] || []).push(r); });
      agenda = Object.keys(groups).map(function (k) {
        var g = groups[k], d0 = g[0].dl;
        return '<section class="ag-month"><h3 class="ag-h">' + MONTHS[d0.getMonth()] + " " + d0.getFullYear() + "</h3><ol class=\"ag-list\">" +
          g.map(function (r) {
            var typical = r.deadline_type === "Typical";
            return '<li class="ag-item' + (typical ? " is-typical" : "") + '" data-date="' + r.next_deadline + '" data-c="' + r.code + '">' +
              '<time class="ag-date" datetime="' + r.next_deadline + '"><span class="ag-d">' + r.dl.getDate() + '</span><span class="ag-wd">' +
              WD[r.dl.getDay()] + "</span></time>" +
              '<div class="ag-body"><a class="ag-name" href="#/resource/' + esc(r.id) + '">' + esc(r.name) + "</a>" +
              '<span class="ag-meta">' + catTag(r) + '<span class="ag-kind">' + typeMark(r.deadline_type) +
              (typical ? "Typical, date not yet posted" : (r.isEvent ? "Event" : "Deadline")) + "</span>" +
              '<span class="ag-how">' + icon(METHOD_ICON[r.application_method] || "unknown") + esc(METHOD_SHORT[r.application_method]) + "</span></span></div>" +
              (r.deadline_type === "Confirmed" ? '<button type="button" class="btn-ics" data-ics="' + esc(r.id) + '" aria-label="Add ' + esc(r.name) + ' to your calendar">' +
                icon("cal") + "<span>Add</span></button>" : "") + "</li>";
          }).join("") + "</ol></section>";
      }).join("");
    } else {
      var tbc = items.filter(DL_BY.tbc.test).length;
      agenda = '<div class="empty empty--cal"><p class="empty-h">No dated deadlines match these filters.</p><p>' +
        (tbc ? plural(tbc, "matching entry has", "matching entries have") + " a date still to be confirmed. They are listed under Rolling and unscheduled, below."
          : "Nothing in this filter runs on a fixed date. Rolling and open-access options are listed below.") + "</p></div>";
    }

    // Rolling and unscheduled
    var rest = items.filter(function (r) { return !upcoming(r); });
    var buckets = [
      ["Typical timing, date not yet posted", "These usually open around the same time each year. The note says when, and what it is based on.",
        rest.filter(function (r) { return r.deadline_type === "Typical"; }), true],
      ["Date to be confirmed", "We could not find a current date. If you know it, tell us.",
        rest.filter(function (r) { return r.deadline_type === "Unknown" || r.deadline_type === "Confirmed"; }), true],
      ["Rolling admissions", "Apply or book whenever you are ready.", rest.filter(function (r) { return r.deadline_type === "Rolling"; }), false],
      ["No deadline published", "Open hours, courses, offices, and networks that do not run on application dates.",
        rest.filter(function (r) { return r.deadline_type === "None published"; }), false]
    ];
    var unsched = buckets.filter(function (b) { return b[2].length; }).map(function (b) {
      return '<section class="un-group"><h3 class="un-h">' + esc(b[0]) + ' <span class="un-n">' + b[2].length + '</span></h3><p class="un-sub">' + esc(b[1]) +
        '</p><ul class="un-list">' + b[2].map(function (r) {
          return '<li data-c="' + r.code + '"><a href="#/resource/' + esc(r.id) + '"><span class="cat-code" data-c="' + r.code + '">' + r.code + "</span>" +
            '<span class="un-body"><span class="un-name">' + esc(r.name) + '</span><span class="un-tag">' + esc(r.tagline) + "</span>" +
            (b[3] && r.deadline_note ? '<span class="un-note">' + esc(r.deadline_note) + "</span>" : "") + "</span></a></li>";
        }).join("") + "</ul></section>";
    }).join("");

    var legendCats = CATS.filter(function (c) { return dated.some(function (r) { return r.category === c; }); });
    $("#cal").innerHTML =
      '<div class="cal-top">' +
      '<div class="cal-nav"><a class="icon-btn" href="' + listHash(Object.assign({}, state, { m: monthKey(prev) }), "calendar") + '" aria-label="Previous month" data-replace>' + icon("back") + "</a>" +
      '<h2 class="cal-month" aria-live="polite">' + MONTHS[first.getMonth()] + ' <span class="cal-year">' + first.getFullYear() + "</span></h2>" +
      '<a class="icon-btn" href="' + listHash(Object.assign({}, state, { m: monthKey(next) }), "calendar") + '" aria-label="Next month" data-replace>' + icon("next") + "</a>" +
      '<a class="btn btn--quiet btn--sm" href="' + listHash(Object.assign({}, state, { m: "" }), "calendar") + '" data-replace>This month</a></div>' +
      '<button type="button" class="btn btn--quiet btn--sm" id="icsAll"' + (ahead.length ? "" : " disabled") + ">" + icon("download") +
      "Export " + (ahead.length ? plural(ahead.length, "visible deadline") : "deadlines") + " (.ics)</button></div>" +
      '<div class="cal-body">' +
      '<div class="cal-grid-wrap"><div class="cal-grid" role="grid" aria-label="' + MONTHS[first.getMonth()] + " " + first.getFullYear() + '">' +
      WD.map(function (w) { return '<div class="wd" role="columnheader">' + w + "</div>"; }).join("") + cells + "</div>" +
      '<p class="cal-foot">' + (monthCount ? plural(monthCount, "dated item") + " this month." : "No dated items this month.") + "</p>" +
      '<div class="legend"><span class="legend-types"><span>' + typeMark("Confirmed") + 'Confirmed date</span><span>' + typeMark("Typical") +
      "Typical, date not yet posted</span></span>" +
      (legendCats.length ? '<span class="legend-cats">' + legendCats.map(function (c) {
        return '<span><span class="cat-code" data-c="' + CAT[c][0] + '">' + CAT[c][0] + "</span>" + esc(c) + "</span>";
      }).join("") + "</span>" : "") + "</div></div>" +
      '<div class="agenda"><h2 class="agenda-h">Coming up</h2>' + agenda + "</div></div>" +
      '<div class="unscheduled"><h2 class="un-title">Rolling and unscheduled</h2><p class="un-lede">Everything here matches your filters but has no upcoming date, so it stays visible instead of vanishing from the calendar.</p>' +
      (unsched || '<p class="un-sub">Every matching entry has an upcoming date.</p>') + "</div>";
  }

  /* ---------- .ics export ---------- */
  function icsText(list) {
    function e(s) { return String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n"); }
    function fold(line) {
      var out = [];
      while (line.length > 74) { out.push(line.slice(0, 74)); line = " " + line.slice(74); }
      out.push(line);
      return out.join("\r\n");
    }
    var stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
    var lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Founders Illinois Entrepreneurs//Field Guide//EN",
      "CALSCALE:GREGORIAN", "METHOD:PUBLISH", "X-WR-CALNAME:Founders Field Guide deadlines"];
    list.forEach(function (r) {
      var d = r.dl, d2 = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
      var day = function (x) { return x.getFullYear() + pad(x.getMonth() + 1) + pad(x.getDate()); };
      var kind = r.isEvent ? "Event" : "Deadline";
      var typical = r.deadline_type === "Typical" ? " (typical date, not yet posted)" : "";
      var link = r.apply_url || r.url;
      var desc = [r.tagline, r.deadline_note, link ? "Official page: " + link : "",
        "From the Founders Field Guide. Confirm on the official page before you rely on this date."].filter(Boolean).join("\n\n");
      lines.push("BEGIN:VEVENT", "UID:" + r.id + "-" + day(d) + "@founders-field-guide", "DTSTAMP:" + stamp,
        "DTSTART;VALUE=DATE:" + day(d), "DTEND;VALUE=DATE:" + day(d2),
        fold("SUMMARY:" + e(kind + ": " + r.name + typical)), fold("DESCRIPTION:" + e(desc)));
      if (link) lines.push(fold("URL:" + link));
      lines.push("TRANSP:TRANSPARENT", "END:VEVENT");
    });
    lines.push("END:VCALENDAR");
    return lines.join("\r\n") + "\r\n";
  }
  function download(name, text) {
    var blob = new Blob([text], { type: "text/calendar;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  }

  /* ---------- Season strip (masthead) ---------- */
  function renderStrip(items) {
    var y = TODAY.getMonth() >= 7 ? TODAY.getFullYear() : TODAY.getFullYear() - 1;
    var start = new Date(y, 7, 1), end = new Date(y + 1, 7, 1), span = end - start;
    function pct(d) { return ((d - start) / span * 100).toFixed(2); }
    var months = "";
    for (var k = 0; k < 12; k++) {
      var d = new Date(y, 7 + k, 1), d2 = new Date(y, 8 + k, 1);
      months += '<span class="ss-m' + (TODAY >= d && TODAY < d2 ? " is-now" : "") + '" style="left:' + pct(d) + "%;width:" +
        (pct(d2) - pct(d)).toFixed(2) + '%"><span class="ss-ml">' + MON[d.getMonth()] + "</span></span>";
    }
    var lanes = [];
    var dots = items.filter(function (r) { return r.dl && r.dl >= start && r.dl < end; })
      .sort(function (a, b) { return a.dl - b.dl; }).map(function (r) {
        var x = +pct(r.dl), lane = 0;
        while (lanes[lane] != null && x - lanes[lane] < 1.6) lane++;
        lanes[lane] = x;
        var past = r.dl < TODAY;
        return '<a class="ss-dot' + (r.deadline_type === "Typical" ? " is-typical" : "") + (past ? " is-past" : "") + '" data-c="' + r.code +
          '" style="left:' + x + "%;--lane:" + Math.min(lane, 3) + '" href="#/resource/' + esc(r.id) + '"><span class="ss-tip">' +
          esc(fmtShort(r.dl) + "  " + r.name) + "</span></a>";
      }).join("");
    var nAhead = items.filter(upcoming).length;
    $("#strip").innerHTML = '<div class="ss-track">' + months + dots +
      '<span class="ss-today" style="left:' + pct(TODAY) + '%"><span class="ss-tl">Today</span></span></div>';
    $("#stripCap").innerHTML = "The " + y + " to " + String(y + 1).slice(2) + " season: " +
      plural(nAhead, "dated deadline or event", "dated deadlines and events") + " still ahead" +
      (state.view === "calendar" ? "." : '. <a href="' + listHash(state, "calendar") + '">Open the calendar</a>');
  }

  /* ---------- Resource page ---------- */
  function row(label, html) { return html ? '<div class="kv"><dt>' + label + "</dt><dd>" + html + "</dd></div>" : ""; }
  var STATUS_TEXT = { Active: "Active", Inactive: "Inactive", Unknown: "Status unknown" };
  var TYPE_TEXT = { Confirmed: "Confirmed date", Typical: "Typical timing, date not yet posted", Rolling: "Rolling admissions",
    "None published": "No deadline published", Unknown: "Date to be confirmed" };
  var CTA = { "Online form": "Open the application", "Email": "Visit the official page", "Pitch submission": "Submit through the official page",
    "Info session or event": "See the event details", "Course registration": "See the courses", "Contact staff": "Contact the team",
    "Walk-in or open access": "Plan a visit", "Not applicable": "Visit the official page", "Unknown": "Visit the official page" };
  var LOC_TEXT = { UIUC: "On the UIUC campus", CU: "Champaign-Urbana, off campus", Chicago: "Chicago", National: "National, outside Illinois", Online: "Online" };
  var STAGE_TEXT = { Idea: "Just an idea", Prototype: "Building a prototype", Launched: "Launched or selling", Any: "Any stage" };
  var ELIG_TEXT = { Yes: "Open to UIUC students", No: "Not open to students", Varies: "Depends on the program", Unknown: "" };

  function hostOf(u) { try { var x = new URL(u); return x.hostname.replace(/^www\./, "") + (x.pathname.length > 1 ? x.pathname.replace(/\/$/, "") : ""); } catch (e) { return u; } }
  function correctionHref(r) {
    var subject = "Correction: " + r.name;
    var body = "Resource: " + r.name + " (" + r.id + ")\n\nWhat is wrong or missing:\n\nWhere you saw the correct information (link):\n";
    if (CONFIG.corrections_email) {
      return "mailto:" + CONFIG.corrections_email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    }
    return CONFIG.repo + "/issues/new?title=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  }
  function related(r) {
    return R.filter(function (o) { return o !== r && o.status !== "Inactive"; }).map(function (o) {
      var shared = o.tags.filter(function (t) { return r.tags.indexOf(t) >= 0; }).length;
      return [o, (o.category === r.category ? 2 : 0) + shared + (upcoming(o) ? 0.5 : 0)];
    }).filter(function (x) { return x[1] >= 2; }).sort(function (a, b) { return b[1] - a[1] || a[0].name.localeCompare(b[0].name); })
      .slice(0, 3).map(function (x) { return x[0]; });
  }
  function renderDetail(r, arriving) {
    var link = r.apply_url || r.url;
    var steps = r.apply_steps.length ? '<ol class="steps">' + r.apply_steps.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ol>" : "";
    var noSteps = !steps && ["Unknown", "Not applicable", "Walk-in or open access"].indexOf(r.application_method) < 0
      ? '<p class="muted">The official page does not spell out the steps, so start with the link below.</p>' : "";
    var cta = link ? '<a class="btn btn--primary" href="' + esc(link) + '" target="_blank" rel="noopener">' + esc(CTA[r.application_method] || "Visit the official page") +
      icon("arrow") + "</a>" : '<p class="muted">We have not found a working official page yet.</p>';
    var second = r.apply_url && r.url ? '<a class="link-quiet" href="' + esc(r.url) + '" target="_blank" rel="noopener">Program page' + icon("arrow") + "</a>" : "";
    var mail = r.contact_email ? '<p class="contact">Questions: <a href="mailto:' + esc(r.contact_email) + '">' + esc(r.contact_email) + "</a></p>" : "";
    var methodLine = r.application_method === "Not applicable"
      ? "There is nothing for students to apply to here."
      : r.application_method === "Unknown" ? "We have not confirmed how to apply yet." : r.application_method;

    var t = r.deadline_type, dateBlock;
    if (r.dl) {
      var n = daysTo(r.dl);
      dateBlock = '<p class="kd-big' + (t === "Typical" ? " is-typical" : "") + '"><span class="kd-kind">' + typeMark(t) +
        (t === "Typical" ? "Typical date" : (r.isEvent ? "Next event" : "Deadline")) + '</span><time datetime="' + r.next_deadline + '">' +
        WD[r.dl.getDay()] + ", " + fmt(r.dl) + '</time><span class="kd-rel">' + (n < 0 ? "Passed " + relDays(n).toLowerCase() : relDays(n)) + "</span></p>";
    } else {
      dateBlock = '<p class="kd-big kd-big--none"><span class="kd-kind">' + typeMark(t) + esc(TYPE_TEXT[t] || t) + "</span></p>";
    }
    var dates = '<dl class="kv-list">' +
      row("Type", esc(TYPE_TEXT[t] || t)) +
      row("Opens", r.opens ? fmt(r.opens) : "") +
      row("Last closed", r.last ? fmt(r.last) : "") +
      row("Repeats", r.recurrence && r.recurrence !== "Unknown" ? esc(r.recurrence) : "") + "</dl>" +
      (r.deadline_note ? '<p class="kd-note">' + esc(r.deadline_note.replace(/^event:\s*/i, "")) + "</p>" : "") +
      (t === "Confirmed" && upcoming(r) ? '<button type="button" class="btn btn--quiet btn--sm" data-ics="' + esc(r.id) + '">' + icon("cal") + "Add to calendar (.ics)</button>" : "");

    var elig = [ELIG_TEXT[r.student_eligible], r.ideal_participant].filter(Boolean).map(esc).join(". ");
    var details = '<dl class="kv-list">' +
      row("Where", esc(LOC_TEXT[r.location] || r.location)) +
      row("Stage", esc(STAGE_TEXT[r.stage] || r.stage)) +
      row("Cost or funding", esc(r.cost_or_funding)) +
      row("Eligibility", elig) +
      row("Run by", esc(r.parent_org)) +
      row("Type", esc(r.subcategory)) +
      row("Tags", r.tags.length ? '<span class="tags">' + r.tags.map(function (x) { return "<span>" + esc(x.replace(/-/g, " ")) + "</span>"; }).join("") + "</span>" : "") +
      "</dl>";

    var sources = r.source_urls.length ? '<ul class="sources">' + r.source_urls.map(function (u) {
      return '<li><a href="' + esc(u) + '" target="_blank" rel="noopener">' + esc(hostOf(u)) + "</a></li>";
    }).join("") + "</ul>" : '<p class="muted">No source pages recorded yet.</p>';
    var lv = iso(r.last_verified);
    var verify = (r.needs_confirmation ? '<div class="notice"><p><strong>Needs confirmation.</strong> At least one fact here, such as a date, a step, or eligibility, has not been checked against an official page by a person yet. Confirm on the official site before you rely on it.</p></div>' : "") +
      '<dl class="kv-list">' +
      row("Last verified", lv ? fmt(lv) : "") +
      row("Confidence", esc({ High: "High: an official page confirms it", Medium: "Medium: based on a credible secondary source", Low: "Low: inferred, treat with care" }[r.confidence] || r.confidence)) +
      row("On the University map", r.on_university_map ? (r.map_sections.length ? esc(r.map_sections.join("; ")) : "Yes") : "No. Added by Founders") +
      "</dl>" + '<p class="sources-h">Sources</p>' + sources +
      '<p class="correct"><a href="' + esc(correctionHref(r)) + '"' + (CONFIG.corrections_email ? "" : ' target="_blank" rel="noopener"') + ">Suggest a correction</a> if something here is wrong or out of date.</p>";

    var rel = related(r);
    var relHTML = rel.length ? '<section class="d-block d-related"><h2 class="d-h">Worth a look next</h2><ul class="rel">' + rel.map(function (o) {
      return '<li><a href="#/resource/' + esc(o.id) + '"><span class="rel-no">' + o.no + '</span><span class="rel-name">' + esc(o.name) +
        '</span><span class="rel-tag">' + esc(o.tagline) + "</span></a></li>";
    }).join("") + "</ul></section>" : "";

    var catHash = listHash({ cat: r.category }, "directory");
    $("#detail").innerHTML =
      '<article class="d" data-c="' + r.code + '">' +
      '<nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="' + esc(lastListHash) + '">' + (lastListHash.indexOf("#/calendar") === 0 ? "Calendar" : "Directory") +
      '</a></li><li><a href="' + esc(catHash) + '">' + esc(r.category) + '</a></li><li aria-current="page">' + esc(r.name) + "</li></ol></nav>" +
      '<header class="d-head' + (arriving ? " is-arriving" : "") + '">' +
      '<p class="d-no"><span class="d-num">No. ' + r.no + "</span>" + catTag(r) + "</p>" +
      '<h1 class="d-title" tabindex="-1">' + esc(r.name) + "</h1>" +
      '<p class="d-tagline">' + esc(r.tagline) + "</p>" +
      '<p class="d-badges"><span class="badge badge--' + r.status.toLowerCase() + '">' + STATUS_TEXT[r.status] + "</span>" +
      (r.needs_confirmation ? '<span class="badge badge--unverified">Unverified</span>' : '<span class="badge badge--verified">' + icon("check") + "Verified</span>") +
      (!r.on_university_map ? '<span class="badge badge--added">Added by Founders</span>' : "") + "</p></header>" +
      '<div class="d-grid"><div class="d-main">' +
      '<section class="d-block d-summary" aria-label="Summary"><dl>' +
      row("What it is", esc(r.what_it_is)) + row("Who should apply", esc(r.who_should_apply)) + row("Choose this if", esc(r.choose_this_if)) + "</dl></section>" +
      '<section class="d-block d-apply"><h2 class="d-h">How to apply</h2>' +
      '<p class="method">' + icon(METHOD_ICON[r.application_method] || "unknown") + "<span>" + esc(methodLine) + "</span></p>" +
      steps + noSteps + '<div class="cta-row">' + cta + second + "</div>" + mail + "</section>" +
      '<section class="d-block d-details"><h2 class="d-h">Details</h2>' + details + "</section>" +
      '<section class="d-block d-sources"><h2 class="d-h">Sources and verification</h2>' + verify + "</section>" +
      "</div>" +
      '<aside class="d-aside"><section class="d-block d-dates"><h2 class="d-h">Key dates</h2>' + dateBlock + dates + "</section>" + relHTML + "</aside>" +
      "</div>" +
      '<p class="print-foot">Founders Field Guide, No. ' + r.no + ". Printed " + fmt(TODAY) + ". Student-run project, not an official University of Illinois resource. " +
      "Confirm details on the official page.</p></article>";
    document.title = r.name + " | Founders Field Guide";
  }

  /* ---------- Render loop ---------- */
  function render() {
    var view = state.view;
    document.body.setAttribute("data-view", view);
    $$("[data-viewlink]").forEach(function (a) {
      var on = a.getAttribute("data-viewlink") === view;
      a.setAttribute("aria-current", on ? "page" : "false");
      a.setAttribute("href", listHash(state, a.getAttribute("data-viewlink")));
    });
    if (view === "resource") {
      var r = BY_ID[state.id];
      $("#list-view").hidden = true;
      $("#cal-view").hidden = true;
      $("#detail-view").hidden = false;
      if (!r) {
        $("#detail").innerHTML = '<div class="empty"><p class="empty-h">We could not find that entry.</p><p>It may have been renamed or merged. <a href="#/">Back to the directory</a></p></div>';
        return;
      }
      renderDetail(r, prevView === "calendar");
      return;
    }
    document.title = "Founders Field Guide: entrepreneurship resources at Illinois";
    $("#detail-view").hidden = true;
    $("#list-view").hidden = view !== "directory";
    $("#cal-view").hidden = view !== "calendar";
    if (document.activeElement !== $("#q")) $("#q").value = state.q;
    renderTabs();
    renderSelects();
    renderDeadlineMenu();
    renderChips();
    var items = filtered();
    renderStrip(items);
    var dated = items.filter(upcoming).length;
    $("#count").textContent = view === "calendar"
      ? plural(items.length, "entry", "entries") + " match. " + plural(dated, "has an upcoming date", "have upcoming dates") + "."
      : "Showing " + items.length + " of " + R.length;
    $("#sortWrap").hidden = view !== "directory";
    if (view === "directory") renderDirectory(items); else renderCalendar(items);
  }

  function onRoute() {
    var next = readHash();
    var from = state.view;
    if (next.view !== "resource") {
      lastListHash = listHash(next, next.view);
      Object.keys(next).forEach(function (k) { state[k] = next[k]; });
    } else {
      state.view = "resource";
      state.id = next.id;
    }
    prevView = from;
    render();
    if (next.view === "resource") {
      window.scrollTo(0, 0);
      var h = $(".d-title");
      if (h && from) h.focus({ preventScroll: true });
    } else if (from === "resource") {
      var y = scrollMemo[location.hash || "#/"];
      window.scrollTo(0, y || 0);
    }
  }

  /* ---------- How-to-use hint ---------- */
  var hintGone = false;
  try { hintGone = localStorage.getItem("ffg-hint") === "1"; } catch (e) { /* storage blocked */ }
  function dismissHint() {
    if (hintGone) return;
    hintGone = true;
    var h = $("#hint");
    if (h) h.classList.add("is-gone");
    try { localStorage.setItem("ffg-hint", "1"); } catch (e) { /* ignore */ }
  }

  /* ---------- Events ---------- */
  function bind() {
    var t;
    $("#q").addEventListener("input", function (e) {
      clearTimeout(t);
      var v = e.target.value.trim();
      t = setTimeout(function () { setFilters({ q: v }); }, 140);
    });
    $("#searchForm").addEventListener("submit", function (e) { e.preventDefault(); setFilters({ q: $("#q").value.trim() }); });
    $("#f-loc").addEventListener("change", function (e) { setFilters({ loc: e.target.value }); });
    $("#f-stage").addEventListener("change", function (e) { setFilters({ stage: e.target.value }); });
    $("#f-method").addEventListener("change", function (e) { setFilters({ method: e.target.value }); });
    $("#sort").addEventListener("change", function (e) { setFilters({ sort: e.target.value === "guide" ? "" : e.target.value }); });

    // Category tabs with roving focus
    $("#tabs").addEventListener("click", function (e) {
      var b = e.target.closest(".tab");
      if (b) setFilters({ cat: b.getAttribute("data-cat") });
    });
    $("#tabs").addEventListener("keydown", function (e) {
      var tabs = $$(".tab", e.currentTarget), i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      var j = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
      if (j == null) return;
      e.preventDefault();
      j = (j + tabs.length) % tabs.length;
      setFilters({ cat: tabs[j].getAttribute("data-cat") });
      $$(".tab")[j].focus();
    });

    // Deadline menu
    var btn = $("#dlBtn"), panel = $("#dlPanel");
    function openMenu(open) {
      panel.hidden = !open;
      btn.setAttribute("aria-expanded", String(open));
      if (open) { var c = $("input:checked", panel) || $("input", panel); if (c) c.focus(); }
    }
    btn.addEventListener("click", function () { openMenu(panel.hidden); });
    $("#dlOpts").addEventListener("change", function (e) {
      if (e.target.name !== "dl") return;
      setFilters({ dl: e.target.value, from: "", to: "" });
      openMenu(false);
      btn.focus();
    });
    $("#dlRange").addEventListener("submit", function (e) {
      e.preventDefault();
      var f = $("#dlFrom").value, to = $("#dlTo").value;
      if (!f && !to) return;
      if (f && to && f > to) { var x = f; f = to; to = x; }
      setFilters({ dl: "custom", from: f, to: to });
      openMenu(false);
    });
    document.addEventListener("click", function (e) {
      if (!panel.hidden && !e.target.closest("#dlWrap")) openMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !panel.hidden) { openMenu(false); btn.focus(); }
      if (e.key === "/" && !/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) {
        e.preventDefault();
        if (state.view === "resource") go(lastListHash);
        $("#q").focus();
      }
    });

    // Chips and clear
    $("#chips").addEventListener("click", function (e) {
      var c = e.target.closest(".chip");
      if (!c) return;
      var k = c.getAttribute("data-key"), patch = {};
      patch[k] = "";
      if (k === "dl") { patch.from = ""; patch.to = ""; }
      if (k === "q") $("#q").value = "";
      setFilters(patch);
    });
    function clearAll() { $("#q").value = ""; setFilters({ q: "", cat: "", loc: "", stage: "", method: "", dl: "", from: "", to: "" }); }
    $("#clearAll").addEventListener("click", clearAll);

    document.addEventListener("click", function (e) {
      var a = e.target.closest("[data-action=clear]");
      if (a) { clearAll(); return; }
      var ics = e.target.closest("[data-ics]");
      if (ics) {
        var r = BY_ID[ics.getAttribute("data-ics")];
        if (r && r.dl) download(r.id + ".ics", icsText([r]));
        return;
      }
      if (e.target.closest("#icsAll")) {
        var list = filtered().filter(upcoming).sort(function (a, b) { return a.dl - b.dl; });
        if (list.length) download("founders-field-guide-deadlines.ics", icsText(list));
        return;
      }
      var rep = e.target.closest("a[data-replace]");
      if (rep) {
        e.preventDefault();
        var h = rep.getAttribute("href");
        var p = new URLSearchParams(h.split("?")[1] || "");
        setFilters({ m: p.get("m") || "" });
        return;
      }
      var day = e.target.closest(".day.has-items");
      if (day && !e.target.closest(".mk")) {
        var mks = $$(".mk", day);
        if (mks.length === 1) { go(mks[0].getAttribute("href")); return; }
        var date = day.getAttribute("data-date");
        var hits = $$('.ag-item[data-date="' + date + '"]');
        if (hits.length) {
          hits[0].scrollIntoView({ block: "center", behavior: reduceMotion() ? "auto" : "smooth" });
          hits.forEach(function (h) { h.classList.remove("is-flash"); void h.offsetWidth; h.classList.add("is-flash"); });
        }
        return;
      }
      var internal = e.target.closest('a[href^="#/"]');
      if (internal && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
        e.preventDefault();
        if (internal.closest(".row, .ag-item, .day, .un-list, .ss-track")) dismissHint();
        go(internal.getAttribute("href"));
      }
    });
    window.addEventListener("hashchange", onRoute);
  }
  function reduceMotion() { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; }

  /* ---------- Start ---------- */
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  var verifiedCount = R.filter(function (r) { return !r.needs_confirmation; }).length;
  $("#statResources").textContent = R.length;
  $("#statMap").textContent = DATA.map_entry_count;
  $("#statAdded").textContent = R.filter(function (r) { return !r.on_university_map; }).length;
  $("#statDated").textContent = R.filter(function (r) { return upcoming(r) && r.deadline_type === "Confirmed"; }).length;
  var lu = iso(DATA.data_last_updated);
  $("#updated").textContent = lu ? fmt(lu) : "";
  $("#footCounts").textContent = R.length + " resources. " + verifiedCount + " fully verified, " + (R.length - verifiedCount) + " still waiting on a human check.";
  $("#repoLink").href = CONFIG.repo;
  $("#suggestLink").href = CONFIG.corrections_email
    ? "mailto:" + CONFIG.corrections_email + "?subject=" + encodeURIComponent("Suggest a resource for the Field Guide")
    : CONFIG.repo + "/issues/new?title=" + encodeURIComponent("Suggest a resource: ");
  if (hintGone) $("#hint").classList.add("is-gone");
  bind();
  onRoute();
  document.body.classList.add("is-ready");
  setTimeout(function () { document.body.classList.add("is-settled"); }, 900);
})();

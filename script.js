/* EasyPrint prototype — small router + interactions, no dependencies. */
(function () {
  "use strict";
  var root = document.documentElement;
  root.classList.add("js");

  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };

  var meta = JSON.parse($("#proto-meta").textContent);
  var SERVICES = JSON.parse($("#svc-data").textContent);
  var screens = $$(".screen");
  var ids = screens.map(function (s) { return s.id; });
  var PANELS = meta.panels;            // overlays shown on top of the current screen
  var MOBILE = meta.mobile;            // desktop route -> mobile variant
  var DESKTOP = {}; Object.keys(MOBILE).forEach(function (k) { DESKTOP[MOBILE[k]] = k; });
  var HOME = "splash";
  var menu = $(".proto-menu");
  var acct = $("#acct-menu");
  var current = null, under = null, splashTimer = null;

  /* ---------- scale: 1440px designs follow the window width ---------- */
  function setZoom() {
    var w = Math.min(root.clientWidth, 1920);
    root.style.setProperty("--z", (w / 1440).toFixed(4));
  }
  window.addEventListener("resize", setZoom);
  setZoom();

  function isNarrow() { return window.innerWidth < 760; }

  /* ---------- router ---------- */
  function resolve(hash) {
    var id = decodeURIComponent(hash.replace(/^#/, ""));
    if (!id) return HOME;
    if (ids.indexOf(id) === -1) return "404";
    if (isNarrow() && MOBILE[id]) return MOBILE[id];
    return id;
  }

  function route() {
    var id = resolve(location.hash);
    closeAccount();
    closeModal();

    if (PANELS.indexOf(id) !== -1) {
      if (current && PANELS.indexOf(current) === -1) under = current;
      if (!under) under = id === "notif-admin" ? "admin-dashboard" : "dashboard";
      if (isNarrow() && MOBILE[under]) under = MOBILE[under];
    } else {
      under = null;
    }

    screens.forEach(function (s) {
      s.classList.toggle("is-active", s.id === id);
      s.classList.toggle("is-under", s.id === under);
    });

    if (PANELS.indexOf(id) === -1 && id !== current) window.scrollTo(0, 0);
    current = id;
    root.classList.toggle("on-splash", id === HOME);
    document.body.classList.remove("is-scrolled");

    var active = document.getElementById(id);
    document.title = (active ? active.getAttribute("data-title") + " · " : "") + "EasyPrint Prototype";

    if (menu) {
      menu.open = false;
      $$("a", menu).forEach(function (a) {
        if (a.getAttribute("href") === "#" + id) a.setAttribute("aria-current", "page");
        else a.removeAttribute("aria-current");
      });
    }

    clearTimeout(splashTimer);
    if (id === HOME) {
      splashTimer = setTimeout(function () { if (current === HOME) location.replace("#landing"); }, 2200);
    }
  }

  function closePanel() { location.hash = under || "dashboard"; }

  /* ---------- toast ---------- */
  var toastTimer = null;
  function toast(msg) {
    var t = $("#toast");
    $("#toast-text").textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, 2600);
  }

  /* ---------- modal ---------- */
  var openModalEl = null;
  function openModal(id, trigger) {
    var m = document.getElementById("modal-" + id);
    if (!m) return;
    var slot = $("[data-modal-title-slot]", m);
    if (slot) {
      if (!slot.dataset.base) slot.dataset.base = slot.textContent;
      slot.textContent = (trigger && trigger.getAttribute("data-modal-title")) || slot.dataset.base;
    }
    var ct = $("[data-confirm-text]", m);
    if (ct) {
      if (!ct.dataset.base) ct.dataset.base = ct.textContent;
      ct.textContent = (trigger && trigger.getAttribute("data-confirm")) || ct.dataset.base;
    }
    m.classList.add("open");
    openModalEl = m;
    var first = $("input:not([type=hidden]):not([disabled]), select, textarea", m);
    if (first) setTimeout(function () { first.focus(); }, 60);
  }
  function closeModal() {
    if (openModalEl) openModalEl.classList.remove("open");
    openModalEl = null;
  }

  /* ---------- account menu ---------- */
  function openAccount(anchor) {
    var r = anchor.getBoundingClientRect();
    acct.style.top = Math.round(r.bottom + 10) + "px";
    acct.style.left = Math.round(Math.min(window.innerWidth - 240, Math.max(10, r.right - 230))) + "px";
    acct.classList.add("open");
  }
  function closeAccount() { if (acct) acct.classList.remove("open"); }

  /* ---------- service detail (catalogue data) ---------- */
  var currentService = "print";
  function rp(n) { return "Rp " + n.toLocaleString("id-ID"); }
  function fillService(id) {
    var s = SERVICES[id]; if (!s) return;
    currentService = id;
    $$("#detail-layanan [data-svc]").forEach(function (el) {
      var k = el.getAttribute("data-svc");
      if (k === "rows") el.innerHTML = s.rows.map(function (r) { return '<tr><td>' + r[0] + '</td><td class="num strong">' + rp(r[1]) + "</td></tr>"; }).join("");
      else if (k === "icon") el.innerHTML = s.icon;
      else if (k === "start") el.textContent = rp(s.start);
      else el.textContent = s[k];
    });
    calc();
  }
  function calc() {
    var q = $("[data-calc-qty]"); var t = $("[data-calc-total]");
    if (!q || !t) return;
    var s = SERVICES[currentService];
    t.textContent = rp(Math.max(1, parseInt(q.value || "1", 10)) * s.start);
  }
  document.addEventListener("input", function (e) {
    if (e.target.matches("[data-calc-qty]")) calc();
    if (e.target.matches("[data-search]")) applyFilter(e.target.getAttribute("data-search"));
  });

  /* ---------- filters (chips + search) ---------- */
  function applyFilter(name) {
    var group = $('[data-filter-group="' + name + '"]');
    var list = $('[data-filter-list="' + name + '"]');
    if (!list) return;
    var on = group ? $(".chip.on", group) : null;
    var f = on ? on.getAttribute("data-filter") : "semua";
    var qEl = $('[data-search="' + name + '"]');
    var q = qEl ? qEl.value.trim().toLowerCase() : "";
    var items = $$("[data-cat], [data-status]", list);
    var shown = 0;
    items.forEach(function (it) {
      var key = it.getAttribute("data-cat") || it.getAttribute("data-status");
      var ok = (f === "semua" || key === f) && (!q || it.textContent.toLowerCase().indexOf(q) !== -1);
      it.hidden = !ok; if (ok) shown++;
    });
    var empty = $('[data-empty="' + name + '"]');
    if (empty) empty.hidden = shown !== 0;
    if (list.tagName === "TABLE") list.style.display = shown ? "" : "none";
  }

  /* ---------- pesan step 1: live summary ---------- */
  document.addEventListener("change", function (e) {
    if (e.target.name === "layanan") {
      var s = SERVICES[e.target.value];
      $('#pesan-1 [data-pick="name"]').textContent = s.name;
      $('#pesan-1 [data-pick="start"]').textContent = rp(s.start);
      $('#pesan-1 [data-pick="icon"]').innerHTML = s.icon.replace("ic lg", "ic");
      fillService(e.target.value);
    }
  });

  /* ---------- clicks ---------- */
  document.addEventListener("click", function (e) {
    var t = e.target;

    if (acct && acct.classList.contains("open") && !t.closest("#acct-menu") && !t.closest("[data-account]")) closeAccount();

    var accBtn = t.closest("[data-account]");
    if (accBtn) { e.preventDefault(); acct.classList.contains("open") ? closeAccount() : openAccount(accBtn); return; }

    var chip = t.closest("[data-filter]");
    if (chip) {
      var g = chip.closest("[data-filter-group]");
      $$(".chip", g).forEach(function (c) { c.classList.toggle("on", c === chip); });
      applyFilter(g.getAttribute("data-filter-group"));
      return;
    }

    var svc = t.closest("[data-service]");
    if (svc) fillService(svc.getAttribute("data-service"));

    var mBtn = t.closest("[data-modal]");
    if (mBtn) { e.preventDefault(); openModal(mBtn.getAttribute("data-modal"), mBtn); return; }

    if (t.closest("[data-close]")) { e.preventDefault(); closeModal(); return; }
    if (t.classList && t.classList.contains("modal-wrap")) { closeModal(); return; }

    var act = t.closest("[data-action]");
    if (act) {
      var a = act.getAttribute("data-action");
      if (a === "print") { e.preventDefault(); window.print(); return; }
      if (a === "close") { e.preventDefault(); closePanel(); return; }
    }

    var tl = t.closest("[data-toast]");
    if (tl) toast(tl.getAttribute("data-toast"));

    // click on the dimmed area beside a panel closes it
    if (PANELS.indexOf(current) !== -1 && t.id === current) { closePanel(); return; }

    // click on an empty part of a design screen: flash what is clickable
    if (t.closest(".frame") && current !== HOME && !t.closest("input, .hot, .sb-overlay")) {
      document.body.classList.remove("show-hints");
      void document.body.offsetWidth;
      document.body.classList.add("show-hints");
      setTimeout(function () { document.body.classList.remove("show-hints"); }, 900);
    }
  });

  /* ---------- forms: typing works, nothing is validated or stored ---------- */
  document.addEventListener("submit", function (e) {
    var f = e.target;
    e.preventDefault();
    if (f.hasAttribute("data-modal-form")) {
      var btn = e.submitter || $("[type=submit]", f);
      if (btn && btn.getAttribute("data-toast-msg")) toast(btn.getAttribute("data-toast-msg"));
      closeModal();
      if (btn && btn.getAttribute("data-after")) location.hash = btn.getAttribute("data-after");
      return;
    }
    if (f.getAttribute("data-toast-submit")) toast(f.getAttribute("data-toast-submit"));
    if (f.getAttribute("data-next")) location.hash = f.getAttribute("data-next");
  });

  /* ---------- sticky header shadow ---------- */
  window.addEventListener("scroll", function () {
    document.body.classList.toggle("is-scrolled", window.scrollY > 4);
    closeAccount();
  }, { passive: true });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (openModalEl) closeModal();
    else if (acct && acct.classList.contains("open")) closeAccount();
    else if (menu && menu.open) menu.open = false;
    else if (PANELS.indexOf(current) !== -1) closePanel();
  });

  var lastNarrow = isNarrow();
  window.addEventListener("resize", function () {
    if (isNarrow() !== lastNarrow) { lastNarrow = isNarrow(); route(); }
  });

  window.addEventListener("hashchange", route);
  route();
})();

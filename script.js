/* EasyPrint prototype: tiny router + interactions (no dependencies). */
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  var screens = Array.prototype.slice.call(document.querySelectorAll(".screen"));
  var ids = screens.map(function (s) { return s.id; });
  var menu = document.querySelector(".proto-menu");
  var current = null;   // visible screen id
  var under = null;     // screen kept behind the notification panel
  var splashTimer = null;
  var OVERLAY = "notifikasi";
  var HOME = "splash";

  function route() {
    var id = decodeURIComponent(location.hash.slice(1));
    if (ids.indexOf(id) === -1) id = HOME;

    if (id === OVERLAY) {
      if (current && current !== OVERLAY) under = current;
      if (!under) under = "dashboard";
    } else {
      under = null;
    }

    screens.forEach(function (s) {
      s.classList.toggle("is-active", s.id === id);
      s.classList.toggle("is-under", s.id === under);
    });

    if (id !== OVERLAY && id !== current) window.scrollTo(0, 0);
    current = id;
    document.documentElement.classList.toggle("on-splash", id === HOME);
    document.body.classList.remove("is-scrolled");

    var active = document.getElementById(id);
    document.title = (active ? active.getAttribute("data-title") + " · " : "") + "EasyPrint Prototype";

    if (menu) {
      menu.open = false;
      Array.prototype.forEach.call(menu.querySelectorAll("a"), function (a) {
        if (a.getAttribute("href") === "#" + id) a.setAttribute("aria-current", "page");
        else a.removeAttribute("aria-current");
      });
    }

    clearTimeout(splashTimer);
    if (id === HOME) {
      splashTimer = setTimeout(function () {
        if (current === HOME) location.replace("#landing");
      }, 2200);
    }
  }

  function closeOverlay() {
    location.hash = under || "dashboard";
  }

  document.addEventListener("click", function (e) {
    var hot = e.target.closest(".hot");
    if (hot) {
      var action = hot.getAttribute("data-action");
      if (action === "print") { e.preventDefault(); window.print(); }
      else if (action === "close") { e.preventDefault(); closeOverlay(); }
      return;
    }
    // click on the dimmed area beside the notification panel closes it
    if (current === OVERLAY && e.target.id === OVERLAY) { closeOverlay(); return; }
    // click on an empty part of a screen: flash what is clickable
    if (e.target.closest(".frame") && current !== HOME && !e.target.closest("input")) {
      document.body.classList.remove("show-hints");
      void document.body.offsetWidth;  // restart animation
      document.body.classList.add("show-hints");
      setTimeout(function () { document.body.classList.remove("show-hints"); }, 900);
    }
  });

  // typeable fields: free text, Enter = continue (no validation, it's a prototype)
  Array.prototype.forEach.call(document.querySelectorAll(".screen-form"), function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      location.hash = f.getAttribute("data-next");
    });
  });

  // soft shadow under the sticky header once the page is scrolled
  window.addEventListener("scroll", function () {
    document.body.classList.toggle("is-scrolled", window.scrollY > 4);
  }, { passive: true });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (menu && menu.open) menu.open = false;
      else if (current === OVERLAY) closeOverlay();
    }
  });

  window.addEventListener("hashchange", route);
  route();
})();

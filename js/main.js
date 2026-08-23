/* johnjofin.com — behaviour: header, nav scrollspy, mobile menu,
   reveals, parallax, floating whatsapp, references carousel, contact form. */

(function () {
  "use strict";

  var reduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  var header = document.getElementById("siteheader");
  var burger = document.getElementById("burger");
  var menu = document.getElementById("menu");

  /* ---------- header: scrolls away on the way down, slides back on the way up ---------- */
  var lastY = window.scrollY;
  var PIN_AFTER = 160; /* px of travel before the header may re-attach */
  var DIR_MIN = 6; /* ignore scroll jitter smaller than this */

  function headerState() {
    var y = window.scrollY;
    if (y < 0) y = 0;
    var dy = y - lastY;

    if (menu.getAttribute("data-open") === "true") {
      /* menu is open: leave the header exactly where it is */
      lastY = y;
      return;
    }

    if (y <= 8) {
      /* back at the top: return to the transparent in-flow header */
      header.classList.remove("is-pinned", "is-hidden", "is-solid");
    } else if (y > PIN_AFTER) {
      if (!header.classList.contains("is-pinned")) {
        /* re-attach off-screen so it can only ever animate *in*.
           without is-instant the browser would tween transform from
           0 to -100%, flashing the header through the viewport. */
        header.classList.add("is-instant");
        header.classList.add("is-pinned", "is-hidden", "is-solid");
        void header.offsetHeight; /* flush styles before re-enabling */
        header.classList.remove("is-instant");
      }
      if (Math.abs(dy) > DIR_MIN) {
        header.classList.toggle("is-hidden", dy > 0);
      }
    } else {
      /* in the hand-off zone the header simply scrolls with the page */
      header.classList.remove("is-pinned", "is-hidden", "is-solid");
    }

    lastY = y;
  }

  /* ---------- mobile menu ---------- */
  function setMenu(open) {
    menu.setAttribute("data-open", open ? "true" : "false");
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    header.classList.toggle("menu-open", open);
    if (open && window.scrollY > 8) {
      header.classList.add("is-pinned");
      header.classList.remove("is-hidden");
    }
    document.body.style.overflow = open ? "hidden" : "";
    if (open) {
      var first = menu.querySelector("a");
      if (first) first.focus({ preventScroll: true });
    }
  }
  burger.addEventListener("click", function () {
    setMenu(menu.getAttribute("data-open") !== "true");
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && menu.getAttribute("data-open") === "true") {
      setMenu(false);
      burger.focus();
    }
  });

  /* ---------- smooth anchors ---------- */
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a[data-scroll]");
    if (!a) return;
    var id = a.getAttribute("href");
    if (!id || id.charAt(0) !== "#") return;
    var el = document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    if (menu.getAttribute("data-open") === "true") setMenu(false);
    el.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "start",
    });
    if (history.replaceState) history.replaceState(null, "", id);
  });

  /* ---------- reveals ---------- */
  var revealables = document.querySelectorAll(".reveal, .tl-item");
  if ("IntersectionObserver" in window && !reduced) {
    var ro = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            ro.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
    );
    revealables.forEach(function (el) {
      ro.observe(el);
    });
  } else {
    revealables.forEach(function (el) {
      el.classList.add("is-in");
    });
  }

  /* ---------- active nav ----------
     a section stays lit until the next watched one takes over, so the
     in-between sections (dimensions, spiritual, expertise,
     certifications, beyond) keep their parent item highlighted        */
  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll("[data-nav]"),
  );
  var watched = [
    "top",
    "about",
    "faith",
    "journey",
    "credentials",
    "references",
  ];
  var spyEls = watched
    .map(function (id) {
      return document.getElementById(id);
    })
    .filter(Boolean);
  var spyTops = [];
  var activeNow = null;

  function measureSpy() {
    spyTops = spyEls.map(function (el) {
      return el.getBoundingClientRect().top + window.scrollY;
    });
  }

  function paintActive() {
    if (!spyEls.length) return;
    var line = window.scrollY + window.innerHeight * 0.35;
    var cur = spyEls[0].id;
    for (var i = 0; i < spyEls.length; i++) {
      if (spyTops[i] <= line) cur = spyEls[i].id;
    }
    if (cur === activeNow) return;
    activeNow = cur;
    navLinks.forEach(function (l) {
      l.classList.toggle("is-active", l.getAttribute("data-nav") === cur);
    });
  }

  measureSpy();
  window.addEventListener("load", function () {
    /* browsers restore the scroll position after load: re-measure and
       re-paint so header, nav and fab match where we actually are */
    measureSpy();
    frame();
  });

  /* ---------- parallax ---------- */
  var plxActive = [];
  var plxNodes = Array.prototype.slice.call(
    document.querySelectorAll("[data-parallax]"),
  );
  if (plxNodes.length && !reduced && "IntersectionObserver" in window) {
    var po = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var i = plxActive.indexOf(entry.target);
          if (entry.isIntersecting && i === -1)
            plxActive.push(entry.target);
          else if (!entry.isIntersecting && i > -1)
            plxActive.splice(i, 1);
        });
      },
      { threshold: 0 },
    );
    plxNodes.forEach(function (el) {
      po.observe(el);
    });
  }

  var ticking = false;
  function frame() {
    ticking = false;
    headerState();
    paintActive();
    for (var i = 0; i < plxActive.length; i++) {
      var el = plxActive[i];
      var rect = el.getBoundingClientRect();
      var speed = parseFloat(el.getAttribute("data-parallax")) || 0.1;
      var offset =
        (rect.top + rect.height / 2 - window.innerHeight / 2) * speed;
      el.style.transform = "translate3d(0," + offset.toFixed(2) + "px,0)";
    }
  }
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(frame);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener(
    "resize",
    function () {
      measureSpy();
      onScroll();
    },
    { passive: true },
  );
  frame();

  /* ---------- references: featured quote ---------- */
  /* splide (MIT) runs the carousel — auto-advance, crossfade, swipe and the
     screen-reader plumbing. the arrows, counter and name tabs stay ours; they
     just drive splide instead of hand-rolled state. */
  (function () {
    var wrap = document.getElementById("refCarousel");
    if (!wrap || typeof Splide === "undefined") return;
    var tabs = [].slice.call(wrap.querySelectorAll(".q-tab"));
    var now = document.getElementById("qNow");
    var prev = document.getElementById("qPrev");
    var next = document.getElementById("qNext");

    var splide = new Splide(wrap, {
      type: "fade",
      rewind: true,
      perPage: 1,
      speed: 450,
      easing: "ease",
      autoplay: true,
      interval: 7000,
      pauseOnHover: true,
      pauseOnFocus: true,
      arrows: false /* the .q-arrow buttons below stand in */,
      pagination: false /* the .q-tab strip stands in */,
      keyboard: false /* arrow keys belong to the page, not the carousel */,
      drag: !reduced,
      i18n: { carousel: "references", slide: "reference" },
    });

    splide.on("move", function (i) {
      now.textContent = ("0" + (i + 1)).slice(-2);
      tabs.forEach(function (t, k) {
        var on = k === i;
        t.classList.toggle("is-active", on);
        if (on) {
          t.setAttribute("aria-current", "true");
        } else {
          t.removeAttribute("aria-current");
        }
      });
    });

    splide.mount();

    prev.addEventListener("click", function () {
      splide.go("<");
    });
    next.addEventListener("click", function () {
      splide.go(">");
    });
    tabs.forEach(function (t) {
      t.addEventListener("click", function () {
        splide.go(parseInt(t.getAttribute("data-i"), 10));
      });
    });
  })();

  /* ---------- contact form ---------- */
  var form = document.getElementById("contactForm");
  if (form) {
    var status = document.getElementById("cf-status");
    var submit = document.getElementById("cf-submit");

    function showErr(id, on) {
      var err = document.getElementById(id + "-err");
      var input = document.getElementById(id);
      if (err) err.classList.toggle("show", on);
      if (input)
        input.setAttribute("aria-invalid", on ? "true" : "false");
    }
    function setStatus(msg, kind) {
      status.className = "mt-5 form-note " + kind;
      status.innerHTML = msg;
      status.classList.remove("hidden");
    }

    ["cf-name", "cf-email", "cf-message", "cf-consent"].forEach(
      function (id) {
        var el = document.getElementById(id);
        if (el)
          el.addEventListener("input", function () {
            showErr(id, false);
          });
        if (el)
          el.addEventListener("change", function () {
            showErr(id, false);
          });
      },
    );

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = document.getElementById("cf-name");
      var email = document.getElementById("cf-email");
      var message = document.getElementById("cf-message");
      var consent = document.getElementById("cf-consent");
      var honeypot = document.getElementById("cf-website");
      var ok = true,
        firstBad = null;

      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(
        email.value.trim(),
      );
      if (!name.value.trim()) {
        showErr("cf-name", true);
        ok = false;
        firstBad = firstBad || name;
      }
      if (!emailOk) {
        showErr("cf-email", true);
        ok = false;
        firstBad = firstBad || email;
      }
      if (message.value.trim().length < 5) {
        showErr("cf-message", true);
        ok = false;
        firstBad = firstBad || message;
      }
      if (!consent.checked) {
        showErr("cf-consent", true);
        ok = false;
        firstBad = firstBad || consent;
      }

      if (!ok) {
        if (firstBad) firstBad.focus();
        return;
      }
      if (honeypot && honeypot.value) return; /* bot */

      var endpoint =
        form.getAttribute("data-endpoint") ||
        form.getAttribute("action") ||
        "";

      if (!endpoint) {
        setStatus(
          "Thanks — message sending isn’t connected yet. Please reach me on " +
            '<a class="ulink font-semibold" href="https://wa.me/18255266099" target="_blank" rel="noopener">WhatsApp</a> or ' +
            '<a class="ulink font-semibold" href="https://calendly.com/johnjofin-santomission/30min" target="_blank" rel="noopener">book a call</a>.',
          "ok",
        );
        return;
      }

      submit.disabled = true;
      submit.style.opacity = ".65";
      setStatus("Sending your message…", "ok");

      fetch(endpoint, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      })
        .then(function (r) {
          if (!r.ok) throw new Error("HTTP " + r.status);
          form.reset();
          setStatus(
            "Thank you — your message has been sent. I’ll reply personally.",
            "ok",
          );
        })
        .catch(function () {
          setStatus(
            "Sorry, the message could not be sent. Please try again, or reach me on " +
              '<a class="ulink font-semibold" href="https://wa.me/18255266099" target="_blank" rel="noopener">WhatsApp</a>.',
            "err",
          );
        })
        .then(function () {
          submit.disabled = false;
          submit.style.opacity = "";
        });
    });
  }
})();

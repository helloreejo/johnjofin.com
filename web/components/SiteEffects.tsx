"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/* Port of js/main.js:1-214 — header state, mobile menu, smooth anchors,
   reveals, scroll-spy and parallax.

   These stay imperative and DOM-driven rather than becoming React state: they
   run on every scroll frame, and routing them through re-renders would be both
   slower and a bigger change than the port needs to be. The markup they touch
   is rendered by the server components using the same ids and data-attributes
   the original used. */
export default function SiteEffects() {
  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    /* ---------- lenis (MIT): eases the wheel/trackpad, leaves the real
       scroll position alone so the header, scrollspy, parallax and reveals
       all keep reading window.scrollY as before ---------- */
    let lenis: Lenis | null = null;
    let rafId = 0;

    if (!reduced) {
      lenis = new Lenis({
        duration: 1.05,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 1.6,
      });
      const raf = (time: number) => {
        lenis?.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);
    }

    const header = document.getElementById("siteheader");
    const burger = document.getElementById("burger");
    const menu = document.getElementById("menu");
    if (!header || !burger || !menu) return;

    /* ---------- header: fixed at the top, solid once the page moves ---------- */
    /* two thresholds, not one: a single trip point sits right where a trackpad
       jitters, and the bar would re-fire the whole change every wobble */
    const SOLID_ON = 88; /* going down: past the transparent bar's own height */
    const SOLID_OFF = 24; /* coming back up: only clear once near the very top */

    function headerState() {
      if (menu!.getAttribute("data-open") === "true") {
        /* menu is open: leave the header exactly where it is */
        return;
      }
      const y = window.scrollY;
      if (y > SOLID_ON) header!.classList.add("is-solid");
      else if (y < SOLID_OFF) header!.classList.remove("is-solid");
    }

    /* ---------- mobile menu ---------- */
    function setMenu(open: boolean) {
      menu!.setAttribute("data-open", open ? "true" : "false");
      burger!.setAttribute("aria-expanded", open ? "true" : "false");
      burger!.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      header!.classList.toggle("menu-open", open);
      document.body.style.overflow = open ? "hidden" : "";
      if (lenis) open ? lenis.stop() : lenis.start();
      if (open) menu!.querySelector("a")?.focus({ preventScroll: true });
    }

    const onBurger = () => setMenu(menu.getAttribute("data-open") !== "true");
    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && menu.getAttribute("data-open") === "true") {
        setMenu(false);
        burger.focus();
      }
    };
    burger.addEventListener("click", onBurger);
    document.addEventListener("keydown", onKeydown);

    /* ---------- smooth anchors ---------- */
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement)?.closest?.("a[data-scroll]");
      if (!a) return;
      const id = a.getAttribute("href");
      if (!id || id.charAt(0) !== "#") return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      if (menu.getAttribute("data-open") === "true") setMenu(false);
      if (lenis) {
        /* no manual offset: lenis already honours scroll-margin-top */
        lenis.scrollTo(el as HTMLElement);
      } else {
        el.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
      }
      if (history.replaceState) history.replaceState(null, "", id);
    };
    document.addEventListener("click", onClick);

    /* ---------- reveals ---------- */
    const revealables = document.querySelectorAll(".reveal, .tl-item");
    let ro: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window && !reduced) {
      ro = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-in");
              ro!.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
      );
      revealables.forEach((el) => ro!.observe(el));
    } else {
      revealables.forEach((el) => el.classList.add("is-in"));
    }

    /* ---------- active nav ----------
       a section stays lit until the next watched one takes over, so the
       in-between sections (dimensions, spiritual, expertise,
       certifications, beyond) keep their parent item highlighted        */
    const navLinks = Array.from(document.querySelectorAll("[data-nav]"));
    const watched = [
      "top",
      "about",
      "faith",
      "journey",
      "credentials",
      "references",
    ];
    const spyEls = watched
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];
    let spyTops: number[] = [];
    let activeNow: string | null = null;

    function measureSpy() {
      spyTops = spyEls.map(
        (el) => el.getBoundingClientRect().top + window.scrollY,
      );
    }

    function paintActive() {
      if (!spyEls.length) return;
      const line = window.scrollY + window.innerHeight * 0.35;
      let cur = spyEls[0].id;
      for (let i = 0; i < spyEls.length; i++) {
        if (spyTops[i] <= line) cur = spyEls[i].id;
      }
      if (cur === activeNow) return;
      activeNow = cur;
      navLinks.forEach((l) =>
        l.classList.toggle("is-active", l.getAttribute("data-nav") === cur),
      );
    }

    measureSpy();

    /* ---------- parallax ---------- */
    let plxActive: Element[] = [];
    const plxNodes = Array.from(document.querySelectorAll("[data-parallax]"));
    let po: IntersectionObserver | null = null;
    if (plxNodes.length && !reduced && "IntersectionObserver" in window) {
      po = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const i = plxActive.indexOf(entry.target);
            if (entry.isIntersecting && i === -1) plxActive.push(entry.target);
            else if (!entry.isIntersecting && i > -1) plxActive.splice(i, 1);
          });
        },
        { threshold: 0 },
      );
      plxNodes.forEach((el) => po!.observe(el));
    }

    let ticking = false;
    function frame() {
      ticking = false;
      headerState();
      paintActive();
      for (const el of plxActive) {
        const rect = el.getBoundingClientRect();
        const speed = parseFloat(el.getAttribute("data-parallax") || "") || 0.1;
        const offset =
          (rect.top + rect.height / 2 - window.innerHeight / 2) * speed;
        (el as HTMLElement).style.transform =
          "translate3d(0," + offset.toFixed(2) + "px,0)";
      }
    }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(frame);
    }
    function onResize() {
      measureSpy();
      onScroll();
    }
    /* browsers restore the scroll position after load: re-measure and
       re-paint so header and nav match where we actually are */
    function onLoad() {
      measureSpy();
      frame();
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("load", onLoad);
    frame();

    return () => {
      cancelAnimationFrame(rafId);
      lenis?.destroy();
      burger.removeEventListener("click", onBurger);
      document.removeEventListener("keydown", onKeydown);
      document.removeEventListener("click", onClick);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", onLoad);
      ro?.disconnect();
      po?.disconnect();
    };
  }, []);

  return null;
}

"use client";

import * as React from "react";

/**
 * Homepage hero BACKGROUND carousel — owner order 9 Nov 2026
 * ("UK calculator wali website par aisa carousel banao jaisa
 * SEORank me banaya; wo pehle wala remove kar do, wo acha nahi
 * hai"): the framed Embla photo panel that used to sit below the
 * hero copy is gone, and the photos now crossfade as the hero
 * section's full-bleed background, behind the unchanged hero copy
 * (badge, title, subtitle, both CTAs and the trust row render on
 * top of them). Same build as SEORankGulf's hero (shipped earlier
 * the same day): plain crossfading slides + a veil + dot pill.
 *
 * Why the photos changed: the panel's three photos centred on
 * people (sick pay at home, family leave, an HR office). As
 * object-cover backgrounds, people get cropped hard on tall
 * screens — that is exactly why the 8 Nov 2026 background attempt
 * on this page was rejected and replaced by the panel. The
 * owner's standing rule is that every person stays fully in
 * frame, so — like SEORankGulf — the backgrounds are people-free
 * scenes of the world the calculators serve: Westminster over the
 * Thames, a payroll desk, the City of London, Tower Bridge at
 * dusk. Cover-cropping only ever trims sky, water and rooftops.
 * Every candidate was downloaded and eyeballed before use; two
 * were rejected at that step (a desk photo whose report was
 * printed in Russian, and a high-street photo with colour-fringe
 * artefacts and edge-cropped pedestrians).
 *
 * Photos: Pexels (free to use), hotlinked as plain <img> — not
 * next/image, because the Pexels CDN is not in next.config's
 * remotePatterns. srcSet serves a 1080w copy to small screens and
 * 1920w to large ones. The CSP img-src allowance for
 * images.pexels.com lives in next.config.ts.
 *
 * The veil (global.css .hbg-overlay) is theme-aware: a pale slate
 * veil in light mode and a slate-950 veil in dark mode, strong
 * enough that the hero copy keeps the contrast it had on the
 * plain page background in both themes.
 *
 * Behaviour: crossfade every 5s; hovering the hero or focusing
 * inside it pauses the cycle; a hidden tab pauses it too; under
 * prefers-reduced-motion it never auto-advances and the fade is
 * disabled in CSS. Indicator dots sit at the bottom-centre of the
 * hero on a dark pill and jump to their slide. The slides are
 * decorative (alt="") — the hero text carries the meaning — and
 * the dot buttons are labelled.
 *
 * The two returned elements are siblings on purpose: the
 * background layer stacks below the hero copy (.z-10 wrapper in
 * page.tsx) while the dots must stack above it to stay clickable,
 * so they cannot share one stacking context.
 */
const HERO_SLIDES = [
  {
    // Westminster and Big Ben over the Thames, from above — Pexels
    base: "https://images.pexels.com/photos/39473887/pexels-photo-39473887.jpeg",
  },
  {
    // A tidy payroll desk: calculator, keyboard, laptop, calendar — Pexels
    base: "https://images.pexels.com/photos/16213402/pexels-photo-16213402.jpeg",
  },
  {
    // The City of London towers, the Gherkin in the middle — Pexels
    base: "https://images.pexels.com/photos/7245368/pexels-photo-7245368.jpeg",
  },
  {
    // Tower Bridge and the Thames at dusk, from above — Pexels
    base: "https://images.pexels.com/photos/372470/pexels-photo-372470.jpeg",
  },
] as const;

const AUTOPLAY_MS = 5000;

export function HeroCarousel() {
  const bgRef = React.useRef<HTMLDivElement>(null);
  const [current, setCurrent] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const [reducedMotion, setReducedMotion] = React.useState(false);

  // Track the reduced-motion preference, including live changes.
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Pause while the pointer is over the hero or focus is inside it.
  React.useEffect(() => {
    const section = bgRef.current?.closest("section");
    if (!section) {
      return;
    }
    const on = () => setPaused(true);
    const off = () => setPaused(false);
    section.addEventListener("mouseenter", on);
    section.addEventListener("mouseleave", off);
    section.addEventListener("focusin", on);
    section.addEventListener("focusout", off);
    return () => {
      section.removeEventListener("mouseenter", on);
      section.removeEventListener("mouseleave", off);
      section.removeEventListener("focusin", on);
      section.removeEventListener("focusout", off);
    };
  }, []);

  // Autoplay: advance every 5s unless paused, reduced-motion, or
  // the tab is hidden. `current` is a dependency so a dot click
  // restarts the clock and the chosen slide gets its full 5s.
  React.useEffect(() => {
    if (paused || reducedMotion) {
      return;
    }
    const id = window.setInterval(() => {
      if (document.hidden) {
        return;
      }
      setCurrent((c) => (c + 1) % HERO_SLIDES.length);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [paused, reducedMotion, current]);

  return (
    <>
      <div ref={bgRef} className="hbg" aria-hidden="true">
        <div className="hbg-slides">
          {HERO_SLIDES.map((slide, i) => (
            <div
              key={slide.base}
              className={`hbg-slide${i === current ? " is-active" : ""}`}
            >
              <img
                src={`${slide.base}?auto=compress&w=1920`}
                srcSet={`${slide.base}?auto=compress&w=1080 1080w, ${slide.base}?auto=compress&w=1920 1920w`}
                sizes="100vw"
                alt=""
                draggable={false}
                loading={i === 0 ? "eager" : "lazy"}
                fetchPriority={i === 0 ? "high" : undefined}
              />
            </div>
          ))}
        </div>
        <div className="hbg-overlay" />
      </div>
      {/* Slide indicators: bottom-centre of the hero, on the same
          subtle dark pill the old panel used, so the white dots
          read clearly over any photo in either colour mode. The
          active dot stretches into a pill and follows the
          crossfade; clicking a dot jumps to that slide. */}
      <div className="hbg-dots" role="group" aria-label="Hero background photos">
        <div className="hbg-dots-pill">
          {HERO_SLIDES.map((slide, i) => {
            const active = i === current;
            return (
              <button
                key={slide.base}
                type="button"
                onClick={() => setCurrent(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={active || undefined}
                className="hbg-dot-btn"
              >
                <span
                  aria-hidden
                  className={`hbg-dot${active ? " is-active" : ""}`}
                />
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

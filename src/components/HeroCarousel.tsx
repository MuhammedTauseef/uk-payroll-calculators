"use client";

import * as React from "react";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

/**
 * Decorative background carousel for the homepage hero — the
 * ready-made shadcn/ui Carousel (Embla) with its Autoplay plugin,
 * layered behind the hero copy. It is pure decoration: the whole
 * layer is aria-hidden, holds no focusable elements, and the hero
 * text/CTAs live in a sibling wrapper above it.
 *
 * The slides are the owner-approved workplace photos (SSP at home,
 * family leave, HR office — the three themes of the calculators
 * below), hosted in the site's public Supabase storage because
 * binaries cannot be pushed through the GitHub connector (the same
 * arrangement as the default og:image).
 *
 * Readability (the owner's condition — text must not be spoiled in
 * either mode): a theme-aware wash sits between the photos and the
 * copy, 90%→78% of the page background colour in light mode and
 * 75%→68% black in dark mode, so the slate-900 / slate-50 hero
 * text keeps AA contrast over every slide (measured on the built
 * site, both modes — see the 8 Nov 2026 verification notes).
 *
 * Motion: autoplay every 6s, looping; hovering the hero section
 * pauses it (the plugin's own mouse-enter stop cannot see the
 * pointer — the copy layer sits on top — so the pause is wired to
 * the section instead), focus inside the carousel pauses it, and
 * under prefers-reduced-motion autoplay never starts.
 */
const HERO_SLIDES = [
  "https://zrwssbvlettgrcfdwxsw.supabase.co/storage/v1/object/public/blog-images/hero/hero-sickpay.webp",
  "https://zrwssbvlettgrcfdwxsw.supabase.co/storage/v1/object/public/blog-images/hero/hero-family.webp",
  "https://zrwssbvlettgrcfdwxsw.supabase.co/storage/v1/object/public/blog-images/hero/hero-hroffice.webp",
] as const;

type AutoplayPlugin = ReturnType<typeof Autoplay>;

export function HeroCarousel() {
  const layerRef = React.useRef<HTMLDivElement>(null);
  // No plugin during SSR / first paint: autoplay is attached only
  // after mount, and never when the visitor prefers reduced motion.
  const [plugins, setPlugins] = React.useState<AutoplayPlugin[]>([]);

  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const autoplay = Autoplay({
      delay: 6000,
      stopOnMouseEnter: false,
      stopOnFocusIn: true,
    });
    setPlugins([autoplay]);

    const section = layerRef.current?.closest("section");
    if (!section) {
      return () => autoplay.stop();
    }
    const pause = () => autoplay.stop();
    // play(), not reset(): in embla-carousel-autoplay v8 reset()
    // only restarts the timer while playing — after a stop() it is
    // a no-op (checked against the installed source).
    const resume = () => autoplay.play();
    section.addEventListener("mouseenter", pause);
    section.addEventListener("mouseleave", resume);
    return () => {
      section.removeEventListener("mouseenter", pause);
      section.removeEventListener("mouseleave", resume);
      autoplay.stop();
    };
  }, []);

  return (
    <div ref={layerRef} aria-hidden="true" className="absolute inset-0">
      <Carousel
        opts={{ loop: true }}
        plugins={plugins}
        tabIndex={-1}
        className="h-full w-full [&_[data-slot=carousel-content]]:h-full [&_[data-slot=carousel-content]>div]:h-full"
      >
        <CarouselContent className="ml-0 h-full">
          {HERO_SLIDES.map((src, i) => (
            <CarouselItem key={src} className="relative h-full pl-0">
              <Image
                src={src}
                alt=""
                fill
                sizes="100vw"
                priority={i === 0}
                draggable={false}
                className="object-cover"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      {/* Readability wash — above the photos, below the copy. The
          stops follow the section's own background tokens (slate-50
          page wash in light mode, slate-950 in dark). They sit a few
          points above the first sketch (~85→70 / ~70→60): measured
          glyph-adjacent contrast for the weakest texts (the emerald
          headline span, the trust row) hovered at the 4.5 line on
          the sketch values, and the owner's condition is that the
          text is never spoiled — with these stops every hero text
          measures ≥4.5:1 against the background actually touching
          its glyphs, in both modes (8 Nov 2026 verification). */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-50/90 via-slate-50/82 to-slate-50/78 dark:from-slate-950/75 dark:via-slate-950/72 dark:to-slate-950/68" />
    </div>
  );
}

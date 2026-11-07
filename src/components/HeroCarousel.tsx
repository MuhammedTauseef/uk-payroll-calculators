"use client";

import * as React from "react";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

/**
 * Photo panel for the homepage hero — the ready-made shadcn/ui
 * Carousel (Embla) with its Autoplay plugin, shown as a visible
 * framed card BELOW the hero copy and trust row.
 *
 * Why a framed panel and not a hero background (owner rejection,
 * 8 Nov 2026): as a full-bleed background the photos were cropped
 * hard by object-cover — on a tall phone most of each 3:2 / 16:9
 * photo was cut away and the people in them were sliced at the
 * edges. The owner's standing rule is that every person must be
 * FULLY visible in frame, nothing important cropped. So the hero
 * copy sits on the plain page background again, and the photos
 * live in this panel instead.
 *
 * Zero-crop display: the slides are NOT all the same ratio — the
 * sick-pay and family photos are 3:2, the HR-office photo is
 * 16:9 — so no single frame ratio can match all three under
 * object-cover. Each slide is therefore shown with object-contain
 * inside a 16:9 frame (every pixel of every photo stays visible),
 * over a blurred, enlarged copy of the same photo that fills the
 * frame's side space for the 3:2 slides, so the panel never shows
 * empty bars. The 16:9 slide fills its frame exactly.
 *
 * The slides are the owner-approved workplace photos (SSP at home,
 * family leave, HR office — the three themes of the calculators
 * below), hosted in the site's public Supabase storage because
 * binaries cannot be pushed through the GitHub connector (the same
 * arrangement as the default og:image). They are content images
 * now, not decoration: each carries a real alt text and the
 * carousel region is labelled.
 *
 * Motion: autoplay every 6s, looping; hovering the panel pauses
 * it, focus inside the carousel pauses it (the plugin's
 * stopOnFocusIn), and under prefers-reduced-motion autoplay never
 * starts. No arrows.
 *
 * Slide dots (owner request, 8 Nov 2026 — "carousel kuch aisa
 * nishan ho ke pata chale carousel chal raha hai"): three small
 * indicator buttons sit at the bottom-centre inside the frame on
 * a subtle dark pill, so they read clearly over any photo in
 * either colour mode. The active dot stretches into a pill and
 * follows the Embla "select" event as autoplay advances; clicking
 * a dot jumps to that slide (api.scrollTo) and autoplay then
 * resumes its normal cycle (hover-pause via play() on mouseleave
 * is untouched).
 */
const HERO_SLIDES = [
  {
    src: "https://zrwssbvlettgrcfdwxsw.supabase.co/storage/v1/object/public/blog-images/hero/hero-sickpay.webp",
    alt: "A man resting unwell on a sofa at home under a blanket, while a woman hands him a note about his sick pay",
  },
  {
    src: "https://zrwssbvlettgrcfdwxsw.supabase.co/storage/v1/object/public/blog-images/hero/hero-family.webp",
    alt: "New parents at home on a sofa with their newborn baby, checking family leave information on a tablet",
  },
  {
    src: "https://zrwssbvlettgrcfdwxsw.supabase.co/storage/v1/object/public/blog-images/hero/hero-hroffice.webp",
    alt: "Two colleagues talking in a bright, modern HR office",
  },
] as const;

type AutoplayPlugin = ReturnType<typeof Autoplay>;

export function HeroCarousel() {
  const panelRef = React.useRef<HTMLDivElement>(null);
  // No plugin during SSR / first paint: autoplay is attached only
  // after mount, and never when the visitor prefers reduced motion.
  const [plugins, setPlugins] = React.useState<AutoplayPlugin[]>([]);
  // Embla api + the currently selected slide, driving the dots.
  const [api, setApi] = React.useState<CarouselApi | null>(null);
  const [current, setCurrent] = React.useState(0);

  React.useEffect(() => {
    if (!api) {
      return;
    }
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);

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

    const panel = panelRef.current;
    if (!panel) {
      return () => autoplay.stop();
    }
    const pause = () => autoplay.stop();
    // play(), not reset(): in embla-carousel-autoplay v8 reset()
    // only restarts the timer while playing — after a stop() it is
    // a no-op (checked against the installed source).
    const resume = () => autoplay.play();
    panel.addEventListener("mouseenter", pause);
    panel.addEventListener("mouseleave", resume);
    return () => {
      panel.removeEventListener("mouseenter", pause);
      panel.removeEventListener("mouseleave", resume);
      autoplay.stop();
    };
  }, []);

  return (
    <div ref={panelRef} className="relative mt-10 sm:mt-12">
      <Carousel
        opts={{ loop: true }}
        plugins={plugins}
        setApi={setApi}
        aria-label="UK payroll in everyday life"
        className="w-full"
      >
        <CarouselContent className="ml-0">
          {HERO_SLIDES.map((slide, i) => (
            <CarouselItem key={slide.src} className="pl-0">
              <div className="relative aspect-video overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-md dark:border-slate-800 dark:bg-slate-900">
                {/* Blurred backdrop: the same photo, enlarged and
                    blurred, fills the frame behind the contained
                    image so the 3:2 slides show no empty side bars.
                    Purely decorative — the sharp copy in front
                    carries the alt text. */}
                <Image
                  src={slide.src}
                  alt=""
                  aria-hidden
                  fill
                  sizes="(min-width: 1152px) 1120px, 100vw"
                  draggable={false}
                  className="scale-125 object-cover blur-2xl"
                />
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  sizes="(min-width: 1152px) 1120px, 100vw"
                  priority={i === 0}
                  draggable={false}
                  className="object-contain"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      {/* Slide indicators: bottom-centre inside the frame, on a
          subtle dark pill so the white dots read clearly over any
          photo, light or dark mode. The active dot stretches into
          a pill and tracks the selected slide; each dot is a real
          button that jumps to its slide. */}
      <div className="absolute inset-x-0 bottom-3 z-10 flex justify-center sm:bottom-4">
        <div className="flex items-center gap-1 rounded-full bg-black/35 px-2 py-1 shadow-sm backdrop-blur-sm">
          {HERO_SLIDES.map((slide, i) => {
            const active = i === current;
            return (
              <button
                key={slide.src}
                type="button"
                onClick={() => api?.scrollTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={active || undefined}
                className="flex h-5 w-5 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <span
                  aria-hidden
                  className={`block h-2 rounded-full transition-all duration-300 ${
                    active ? "w-5 bg-white" : "w-2 bg-white/60 hover:bg-white/85"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

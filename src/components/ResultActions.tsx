"use client";

import { useState, type RefObject } from "react";

/**
 * The shared results-panel action row carried by the maternity pay,
 * redundancy pay and holiday pay calculators (the pattern the other
 * calculators will adopt next): Save PDF, Save Image, Reset.
 *
 * - Save PDF opens the browser print view (the same mechanism as
 *   PrintButton); the print stylesheet hides the site chrome and the
 *   form, so "Save as PDF" there produces a clean copy of the result.
 * - Save Image renders the results card to a PNG in the browser and
 *   downloads it. It deliberately uses no library: the card is cloned,
 *   its computed styles are inlined (a visual-properties whitelist),
 *   the clone is drawn through an SVG foreignObject onto a canvas at
 *   2x scale, and the canvas is saved as a PNG.
 * - Reset restores the calculator's default inputs via the callback
 *   the calculator passes in.
 *
 * The row carries data-capture-exclude so the image capture can hide
 * the row itself inside the cloned card, and print:hidden so it never
 * appears on the printed/PDF copy.
 */

const CAPTURE_PROPS = [
  "display",
  "box-sizing",
  "width",
  "height",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "color",
  "background-color",
  "font-family",
  "font-size",
  "font-weight",
  "font-style",
  "line-height",
  "letter-spacing",
  "text-align",
  "text-transform",
  "vertical-align",
  "white-space",
  "border-top-width",
  "border-right-width",
  "border-bottom-width",
  "border-left-width",
  "border-top-style",
  "border-right-style",
  "border-bottom-style",
  "border-left-style",
  "border-top-color",
  "border-right-color",
  "border-bottom-color",
  "border-left-color",
  "border-top-left-radius",
  "border-top-right-radius",
  "border-bottom-left-radius",
  "border-bottom-right-radius",
  "border-collapse",
  "border-spacing",
  "table-layout",
  "list-style-type",
  "list-style-position",
  "overflow-x",
  "overflow-y",
] as const;

function inlineStyles(source: Element, target: Element): void {
  const targetEl = target as HTMLElement;
  if (source.hasAttribute("data-capture-exclude")) {
    targetEl.style.cssText = "display:none !important;";
    return;
  }
  const computed = window.getComputedStyle(source);
  let css = "";
  for (const prop of CAPTURE_PROPS) {
    const value = computed.getPropertyValue(prop);
    if (value) css += `${prop}:${value};`;
  }
  targetEl.style.cssText = css;
  const sourceKids = source.children;
  const targetKids = target.children;
  for (let i = 0; i < sourceKids.length && i < targetKids.length; i++) {
    inlineStyles(sourceKids[i], targetKids[i]);
  }
}

async function downloadElementImage(
  element: HTMLElement,
  fileName: string,
): Promise<void> {
  const width = element.offsetWidth;
  const height = element.offsetHeight;
  if (width === 0 || height === 0) {
    throw new Error("The result is not visible yet.");
  }
  const clone = element.cloneNode(true) as HTMLElement;
  clone.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
  inlineStyles(element, clone);
  clone.style.width = `${width}px`;
  clone.style.height = `${height}px`;
  clone.style.margin = "0";

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">` +
    `<foreignObject x="0" y="0" width="100%" height="100%">` +
    new XMLSerializer().serializeToString(clone) +
    `</foreignObject></svg>`;
  const svgUrl = URL.createObjectURL(
    new Blob([svg], { type: "image/svg+xml;charset=utf-8" }),
  );
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Could not render the image."));
      img.src = svgUrl;
    });
    const scale = 2;
    const canvas = document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is not available in this browser.");
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0);
    const png = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png"),
    );
    if (!png) throw new Error("Could not create the image file.");
    const pngUrl = URL.createObjectURL(png);
    const a = document.createElement("a");
    a.href = pngUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(pngUrl), 4000);
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}

const buttonClass =
  "rounded-full border border-brand-700 bg-white dark:bg-slate-900 px-5 py-2.5 text-sm font-semibold text-brand-800 dark:text-brand-300 shadow-sm transition hover:bg-brand-50 dark:hover:bg-brand-900/40 disabled:cursor-wait disabled:opacity-60";
const primaryButtonClass =
  "rounded-full border border-brand-700 bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800 disabled:cursor-wait disabled:opacity-60";

export default function ResultActions({
  targetRef,
  fileName,
  onReset,
}: {
  targetRef: RefObject<HTMLElement | null>;
  fileName: string;
  onReset: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveImage = async () => {
    if (!targetRef.current || busy) return;
    setBusy(true);
    setError(null);
    try {
      await downloadElementImage(targetRef.current, fileName);
    } catch {
      setError(
        "The image could not be created in this browser — please use Save PDF instead.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div data-capture-exclude className="print:hidden">
      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => window.print()}
          className={primaryButtonClass}
        >
          Save PDF
        </button>
        <button
          type="button"
          onClick={saveImage}
          disabled={busy}
          className={buttonClass}
        >
          {busy ? "Creating image…" : "Save Image"}
        </button>
        <button type="button" onClick={onReset} className={buttonClass}>
          Reset
        </button>
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Save PDF opens your browser&apos;s print view with a clean summary
        of this calculation — choose &ldquo;Save as PDF&rdquo; there. Save
        Image downloads a picture of this result. Reset puts the example
        figures back.
      </p>
      {error && (
        <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

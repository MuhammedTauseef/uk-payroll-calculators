"use client";

import { useState } from "react";

/**
 * The shared results-panel action row carried by the maternity pay,
 * redundancy pay and holiday pay calculators (the pattern the other
 * calculators will adopt next): Save PDF, Save Image, Reset.
 *
 * - Save PDF opens the browser print view (the same mechanism as
 *   PrintButton); the print stylesheet hides the site chrome and the
 *   form, so "Save as PDF" there produces a clean copy of the result.
 * - Save Image draws a branded result card on a canvas in the
 *   browser — the tool title, the headline figure and the breakdown
 *   rows the calculator passes in — and downloads it as a PNG. It
 *   deliberately uses no library and no DOM screenshot: an SVG
 *   foreignObject capture taints the canvas in Chrome, so the card
 *   is drawn directly, which is also why it always looks the same.
 * - Reset restores the calculator's default inputs via the callback
 *   the calculator passes in.
 *
 * The row is print:hidden so it never appears on the printed/PDF
 * copy of the result.
 */

export interface ResultImageData {
  /** Tool name, e.g. "Statutory Maternity Pay". */
  title: string;
  /** The big figure, pre-formatted, e.g. "£10,151.02". */
  headline: string;
  /** One line under the headline, e.g. "Total across 39 paid weeks". */
  headlineNote?: string;
  /** Breakdown rows shown under the headline. */
  rows: { label: string; value: string }[];
  fileName: string;
}

const CARD = {
  width: 1200,
  pad: 72,
  bg: "#ecfdf5", // brand-50
  border: "#a7f3d0", // brand-200
  brand: "#047857", // brand-700
  headline: "#065f46", // brand-800
  ink: "#0f172a", // slate-900
  muted: "#475569", // slate-600
  faint: "#64748b", // slate-500
  font: "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
};

function drawResultCard(image: ResultImageData): HTMLCanvasElement {
  const rows = image.rows.slice(0, 8);
  const topBlock = 64 + 30 + 18 + 58 + 22 + 108 + (image.headlineNote ? 46 : 10);
  const rowsBlock = rows.length > 0 ? 34 + rows.length * 58 : 0;
  const height = topBlock + rowsBlock + 96;

  const canvas = document.createElement("canvas");
  const scale = 2;
  canvas.width = CARD.width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available in this browser.");
  ctx.scale(scale, scale);

  // Card body and border.
  ctx.fillStyle = CARD.bg;
  ctx.fillRect(0, 0, CARD.width, height);
  ctx.strokeStyle = CARD.border;
  ctx.lineWidth = 3;
  ctx.strokeRect(1.5, 1.5, CARD.width - 3, height - 3);

  const left = CARD.pad;
  const right = CARD.width - CARD.pad;
  let y = 64;

  ctx.fillStyle = CARD.brand;
  ctx.font = `700 25px ${CARD.font}`;
  ctx.fillText("P A Y R O L L C A L C . C O . U K", left, y);
  y += 48;

  ctx.fillStyle = CARD.ink;
  ctx.font = `600 42px ${CARD.font}`;
  ctx.fillText(image.title, left, y);
  y += 22;

  ctx.fillStyle = CARD.headline;
  ctx.font = `800 104px ${CARD.font}`;
  ctx.fillText(image.headline, left, y + 84);
  y += 108;

  if (image.headlineNote) {
    ctx.fillStyle = CARD.muted;
    ctx.font = `400 29px ${CARD.font}`;
    ctx.fillText(image.headlineNote, left, y + 8);
    y += 46;
  }

  if (rows.length > 0) {
    y += 16;
    ctx.strokeStyle = CARD.border;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(right, y);
    ctx.stroke();
    y += 52;
    for (const row of rows) {
      ctx.fillStyle = CARD.muted;
      ctx.font = `400 29px ${CARD.font}`;
      let label = row.label;
      while (label.length > 4 && ctx.measureText(label).width > 720) {
        label = label.slice(0, -2);
      }
      if (label !== row.label) label = label.trimEnd() + "…";
      ctx.fillText(label, left, y);
      ctx.fillStyle = CARD.ink;
      ctx.font = `600 29px ${CARD.font}`;
      const valueWidth = ctx.measureText(row.value).width;
      ctx.fillText(row.value, right - valueWidth, y);
      y += 58;
    }
  }

  ctx.fillStyle = CARD.faint;
  ctx.font = `400 24px ${CARD.font}`;
  ctx.fillText(
    "Calculated free at payrollcalc.co.uk — UK rules verified 20 November 2026",
    left,
    height - 44,
  );
  return canvas;
}

const buttonClass =
  "rounded-full border border-brand-700 bg-white dark:bg-slate-900 px-5 py-2.5 text-sm font-semibold text-brand-800 dark:text-brand-300 shadow-sm transition hover:bg-brand-50 dark:hover:bg-brand-900/40 disabled:cursor-wait disabled:opacity-60";
const primaryButtonClass =
  "rounded-full border border-brand-700 bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800 disabled:cursor-wait disabled:opacity-60";

export default function ResultActions({
  image,
  onReset,
}: {
  image: ResultImageData;
  onReset: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveImage = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const canvas = drawResultCard(image);
      const png = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      );
      if (!png) throw new Error("Could not create the image file.");
      const pngUrl = URL.createObjectURL(png);
      const a = document.createElement("a");
      a.href = pngUrl;
      a.download = image.fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(pngUrl), 4000);
    } catch {
      setError(
        "The image could not be created in this browser — please use Save PDF instead.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="print:hidden">
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

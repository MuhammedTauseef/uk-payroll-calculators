"use client";

import type { AdminSubscriberRow } from "@/lib/admin/data";

/**
 * CSV download for the admin subscribers list (UX Phase 2,
 * 2026-11-20): builds the file in the browser from the rows the
 * (already admin-gated) page rendered — no extra endpoint, no extra
 * server work.
 */
export function ExportSubscribersButton({
  rows,
}: {
  rows: AdminSubscriberRow[];
}) {
  const onClick = () => {
    const escape = (value: string) =>
      /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
    const lines = [
      "email,status,source,subscribed_at,unsubscribed_at",
      ...rows.map((row) =>
        [
          escape(row.email),
          escape(row.unsubscribed_at ? "Unsubscribed" : "Confirmed"),
          escape(row.source ?? ""),
          escape(row.created_at),
          escape(row.unsubscribed_at ?? ""),
        ].join(","),
      ),
    ];
    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "subscribers.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 shadow-sm transition hover:border-brand-300 dark:hover:border-brand-700 hover:text-brand-800 dark:hover:text-brand-300"
    >
      Download CSV
    </button>
  );
}

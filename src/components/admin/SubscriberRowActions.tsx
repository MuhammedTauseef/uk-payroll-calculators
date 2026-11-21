"use client";

import { useActionState, useState } from "react";
import {
  deleteSubscriberAction,
  reactivateSubscriberAction,
  unsubscribeSubscriberAction,
} from "@/lib/admin/actions";
import { adminActionIdle } from "@/lib/admin/state";

const outlineButtonClass =
  "inline-flex items-center rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm transition hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-60";
const dangerButtonClass =
  "inline-flex items-center rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-60";

/**
 * Per-row controls on /admin/subscribers (email nizam, 2026-11-21):
 * the admin's full control over one address — Unsubscribe (soft mark,
 * the row stays as "Unsubscribed"), Reactivate (back on the list as
 * "Confirmed"), and Delete (two-step, gone for good). Each button is
 * its own tiny form bound to the matching admin-gated server action;
 * the page revalidates after every action, so the row's status and
 * the counters refresh on their own.
 */
export function SubscriberRowActions({
  subscriberId,
  email,
  unsubscribed,
}: {
  subscriberId: string;
  email: string;
  unsubscribed: boolean;
}) {
  const [unsubState, unsubAction, unsubPending] = useActionState(
    unsubscribeSubscriberAction.bind(null, subscriberId),
    adminActionIdle,
  );
  const [reactState, reactAction, reactPending] = useActionState(
    reactivateSubscriberAction.bind(null, subscriberId),
    adminActionIdle,
  );
  const [delState, delAction, delPending] = useActionState(
    deleteSubscriberAction.bind(null, subscriberId),
    adminActionIdle,
  );
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const error =
    unsubState.status === "error"
      ? unsubState.message
      : reactState.status === "error"
        ? reactState.message
        : delState.status === "error"
          ? delState.message
          : null;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-center gap-2">
        {unsubscribed ? (
          <form action={reactAction}>
            <button type="submit" className={outlineButtonClass} disabled={reactPending}>
              {reactPending ? "Reactivating…" : "Reactivate"}
            </button>
          </form>
        ) : (
          <form action={unsubAction}>
            <button type="submit" className={outlineButtonClass} disabled={unsubPending}>
              {unsubPending ? "Unsubscribing…" : "Unsubscribe"}
            </button>
          </form>
        )}

        {confirmingDelete ? (
          <form action={delAction} className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-slate-700 dark:text-slate-300">
              Delete {email} for good?
            </span>
            <input type="hidden" name="confirm" value="delete" />
            <button type="submit" className={dangerButtonClass} disabled={delPending}>
              {delPending ? "Deleting…" : "Yes, delete"}
            </button>
            <button
              type="button"
              className={outlineButtonClass}
              onClick={() => setConfirmingDelete(false)}
              disabled={delPending}
            >
              Cancel
            </button>
          </form>
        ) : (
          <button type="button" className={dangerButtonClass} onClick={() => setConfirmingDelete(true)}>
            Delete
          </button>
        )}
      </div>
      {error && (
        <span role="alert" className="text-sm leading-6 text-red-700 dark:text-red-400">
          {error}
        </span>
      )}
    </div>
  );
}

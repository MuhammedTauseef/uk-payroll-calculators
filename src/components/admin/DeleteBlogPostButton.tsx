"use client";

import { useActionState, useState } from "react";
import { deleteBlogPostAction } from "@/lib/admin/actions";
import { adminActionIdle } from "@/lib/admin/state";

const dangerButtonClass =
  "inline-flex items-center rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-60";
const outlineButtonClass =
  "inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60";

/**
 * Two-step delete for one blog post, used in the admin blog list and
 * on the post's edit page. The first click only asks "are you sure?"
 * — the post is deleted by the second, explicit click, and never on
 * one click. The server action re-checks the confirmation, deletes
 * the post (and, best-effort, its cover image), then sends the admin
 * back to the list.
 */
export function DeleteBlogPostButton({
  postId,
  postTitle,
}: {
  postId: string;
  postTitle: string;
}) {
  const [state, action, pending] = useActionState(
    deleteBlogPostAction.bind(null, postId),
    adminActionIdle,
  );
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button type="button" className={dangerButtonClass} onClick={() => setConfirming(true)}>
        Delete
      </button>
    );
  }

  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-slate-700">
        Delete “{postTitle}” for good? This can&rsquo;t be undone.
      </span>
      <input type="hidden" name="confirm" value="delete" />
      <button type="submit" className={dangerButtonClass} disabled={pending}>
        {pending ? "Deleting…" : "Yes, delete"}
      </button>
      <button
        type="button"
        className={outlineButtonClass}
        onClick={() => setConfirming(false)}
        disabled={pending}
      >
        Cancel
      </button>
      {state.status === "error" && state.message && (
        <span role="alert" className="w-full text-sm leading-6 text-red-700">
          {state.message}
        </span>
      )}
    </form>
  );
}

import { AdminRefusal } from "@/components/admin/AdminRefusal";
import { ExportSubscribersButton } from "@/components/admin/ExportSubscribersButton";
import { SubscriberRowActions } from "@/components/admin/SubscriberRowActions";
import { listAdminSubscribers } from "@/lib/admin/data";
import { requireAdminContext } from "@/lib/admin/guard";
import { formatDateGB } from "@/lib/blog/format";
import { getServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

// /admin/subscribers — everyone who joined the email update list from
// the site-wide email box, newest first (UX Phase 2, 2026-11-20;
// full admin control added by the email nizam, 2026-11-21).
//
// Signup is single opt-in: an address is Confirmed the moment it is
// entered — there is no confirmation email and no "Pending" state,
// here or anywhere in the design. Leaving the list is a soft mark
// (unsubscribed_at), never a silent delete, so this page always shows
// the true picture: Total / Confirmed / Unsubscribed, a status word
// on every row, and per-row Unsubscribe / Reactivate / Delete
// controls — the admin runs the whole list from here, no database
// console needed.
//
// The gate is the same as every panel page — requireAdminContext()
// here AND in the panel layout; without an admin session this page
// renders the refusal, never the list. Reads and writes run on the
// service-role client (after the gate) because the subscribers table
// has RLS on with no admin policy — it is write-only from the public
// site by design.
export default async function AdminSubscribersPage() {
  const ctx = await requireAdminContext();
  if (!ctx) return <AdminRefusal />;

  const client = getServiceClient() ?? ctx.supabase;
  const subscribers = await listAdminSubscribers(client).catch(() => null);

  const confirmedCount =
    subscribers?.filter((row) => row.unsubscribed_at === null).length ?? 0;
  const unsubscribedCount =
    subscribers?.filter((row) => row.unsubscribed_at !== null).length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <section className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Subscribers
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
            Everyone who joined the email update list, newest first. The
            source column shows the page each person subscribed from.
            This list never leaves the panel.
          </p>
        </section>
        {subscribers && subscribers.length > 0 && (
          <ExportSubscribersButton rows={subscribers} />
        )}
      </div>

      {subscribers === null ? (
        <p
          role="alert"
          className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950 px-4 py-3 text-sm leading-6 text-red-800 dark:text-red-300"
        >
          The subscribers could not be loaded. Check the database
          connection and try again.
        </p>
      ) : subscribers.length === 0 ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            No subscribers yet
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            The email box sits in the footer of every page and at the
            foot of every calculator. Addresses will appear here as
            visitors join the list.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-3">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-4 shadow-sm">
              <p className="text-sm text-slate-500 dark:text-slate-400">Total</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-50">
                {subscribers.length}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-4 shadow-sm">
              <p className="text-sm text-slate-500 dark:text-slate-400">Confirmed</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-50">
                {confirmedCount}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-4 shadow-sm">
              <p className="text-sm text-slate-500 dark:text-slate-400">Unsubscribed</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-50">
                {unsubscribedCount}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Source page</th>
                  <th className="px-4 py-3 font-medium">Subscribed</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {subscribers.map((row) => {
                  const unsubscribed = row.unsubscribed_at !== null;
                  return (
                    <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-50">
                        {row.email}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {unsubscribed ? (
                          <span className="inline-flex items-center rounded-full bg-red-50 dark:bg-red-950 px-2.5 py-0.5 text-xs font-semibold text-red-700 dark:text-red-300">
                            Unsubscribed
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                            Confirmed
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                        {row.source ?? "—"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                        {formatDateGB(row.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <SubscriberRowActions
                          subscriberId={row.id}
                          email={row.email}
                          unsubscribed={unsubscribed}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

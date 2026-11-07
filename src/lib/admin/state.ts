// Shared state shape for the admin server actions, consumed by the
// editor form and the delete button via useActionState (the same
// contract as the reference sites' admin panels).

export type AdminActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export const adminActionIdle: AdminActionState = { status: "idle" };

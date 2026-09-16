"use client";

import { useActionState } from "react";

import { login } from "@/lib/auth/actions";

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory px-4">
      <form action={formAction} className="w-full max-w-sm">
        <h1 className="font-editorial text-2xl">Bee Hairplace admin</h1>
        <div className="mt-6 space-y-4">
          <div>
            <label className="text-sm text-ink-soft">Email</label>
            <input
              name="email"
              type="email"
              required
              className="mt-1 w-full border border-line px-3 py-2.5 text-sm outline-none focus:border-ink"
            />
          </div>
          <div>
            <label className="text-sm text-ink-soft">Password</label>
            <input
              name="password"
              type="password"
              required
              className="mt-1 w-full border border-line px-3 py-2.5 text-sm outline-none focus:border-ink"
            />
          </div>
        </div>

        {state?.error && (
          <p className="mt-4 text-sm text-burgundy">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-6 w-full bg-ink py-3 text-sm font-medium text-ivory disabled:opacity-50"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

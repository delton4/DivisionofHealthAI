"use client";

import { useActionState } from "react";
import { login } from "@/lib/actions";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, null);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm text-text-secondary mb-1">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full px-3 py-2 bg-surface border border-border rounded-md text-foreground text-sm focus:outline-none focus:border-accent transition-colors"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm text-text-secondary mb-1">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="w-full px-3 py-2 bg-surface border border-border rounded-md text-foreground text-sm focus:outline-none focus:border-accent transition-colors"
        />
      </div>
      {state?.error && (
        <p className="text-sm text-accent-warm">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full py-2 bg-foreground text-background text-sm font-medium rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}

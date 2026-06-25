"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  isAdminAuthed,
  setAdminAuthed,
  verifyAdminCredentials,
} from "@/lib/adminAuth";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const nextPath = useMemo(() => {
    const raw = searchParams?.get("next");
    return raw && raw.startsWith("/") ? raw : "/admin/";
  }, [searchParams]);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already authed, go straight to admin
  if (typeof window !== "undefined" && isAdminAuthed()) {
    router.replace(nextPath);
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const ok = await verifyAdminCredentials(identifier, password);
      if (!ok) {
        setError("Invalid username/email or password.");
        return;
      }
      setAdminAuthed(7);
      router.replace(nextPath);
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <div className="space-y-2 mb-6">
          <h1 className="text-2xl font-extrabold text-slate-900">Admin Login</h1>
          <p className="text-sm text-gray-500">
            Sign in to access the admin panel.
          </p>
        </div>

        {error ? (
          <div className="mb-4 rounded-lg border border-red-100 bg-red-50 text-red-700 px-4 py-3 text-sm">
            {error}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">
              Username or Email
            </label>
            <input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
              placeholder="cyseox or cyseox@gmail.com"
              autoComplete="username"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
              placeholder="Your password"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-orange-600 hover:bg-orange-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm py-2.5 transition-colors"
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-6 text-xs text-gray-500 flex items-center justify-between">
          <Link href="/" className="hover:text-orange-600">
            Back to home
          </Link>
          <span className="text-gray-300">|</span>
          <Link href="/admin/" className="hover:text-orange-600">
            Go to admin
          </Link>
        </div>
      </div>
    </div>
  );
}


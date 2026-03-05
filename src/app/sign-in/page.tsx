"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const { error: authError } = await authClient.signIn.email({
      email,
      password,
    });

    if (authError) {
      setError(authError.message ?? "Invalid email or password.");
      setIsLoading(false);
      return;
    }

    router.push("/upload");
  };

  return (
    <div className="min-h-screen bg-[#1a4d2e] relative flex items-center justify-center px-6">
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.15] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-10">
          <Link
            href="/"
            className="hover-lift text-3xl tracking-tight text-white inline-block"
            style={{ fontFamily: '"Instrument Serif", serif' }}
          >
            Moneyball
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label
              htmlFor="email"
              className="block text-xs text-gray-300 uppercase tracking-wider mb-2"
              style={{ fontFamily: '"Instrument Sans", sans-serif' }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/[0.06] border border-white/[0.15] text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-[#E8A838]/50 transition-colors"
              style={{ fontFamily: '"Instrument Sans", sans-serif' }}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs text-gray-300 uppercase tracking-wider mb-2"
              style={{ fontFamily: '"Instrument Sans", sans-serif' }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/[0.06] border border-white/[0.15] text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-[#E8A838]/50 transition-colors"
              style={{ fontFamily: '"Instrument Sans", sans-serif' }}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p
              className="text-sm text-red-400 text-center"
              style={{ fontFamily: '"Instrument Sans", sans-serif' }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="hover-lift mt-2 px-8 py-3 text-sm text-white/90 bg-white/[0.08] backdrop-blur-2xl border border-white/[0.15] hover:bg-white/[0.14] hover:border-white/25 transition-all uppercase tracking-wider shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_8px_24px_rgba(0,0,0,0.2)] disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ fontFamily: '"Instrument Sans", sans-serif' }}
          >
            {isLoading && <Loader2 size={16} className="animate-spin" />}
            Sign In
          </button>
        </form>

        <p
          className="text-center text-gray-400 text-sm mt-8"
          style={{ fontFamily: '"Instrument Sans", sans-serif' }}
        >
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="hover-lift text-[#E8A838] hover:text-[#f0b94d] transition-colors"
          >
            Sign up
          </Link>
        </p>

        <p
          className="text-center text-gray-500 text-xs mt-4"
          style={{ fontFamily: '"Instrument Sans", sans-serif' }}
        >
          or{" "}
          <Link
            href="/upload"
            className="hover-lift text-gray-400 hover:text-white transition-colors underline underline-offset-2"
          >
            try the demo
          </Link>
        </p>
      </div>
    </div>
  );
}

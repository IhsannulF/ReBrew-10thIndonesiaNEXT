import React from "react";
import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { login } from "@/app/actions/auth";
import { GoogleIcon } from "@/components/ui/GoogleIcon";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const userRole = profile?.role || user.user_metadata?.role || "mitra";
    if (userRole === "admin") {
      redirect("/admin");
    } else {
      redirect("/dashboard");
    }
  }

  const { error, message } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f4ef] px-4 py-12">
      <div className="flex w-full max-w-md flex-col items-center">
        {/* ReBrew Logo */}
        <Link href="/" className="mb-6 flex items-center gap-2 transition-transform hover:scale-105">
          <Image
            src="/logo.png"
            alt="ReBrew"
            width={140}
            height={42}
            className="h-10 w-auto object-contain"
            priority
          />
        </Link>

        {/* Card Form */}
        <div className="w-full rounded-2xl border border-[#d8e6d9] bg-white p-8 shadow-[0px_8px_30px_rgba(46,125,50,0.08)]">
          <div className="mb-6 text-center">
            <h1
              className="text-2xl font-extrabold tracking-tight text-[#1a2a1b]"
              style={{ fontFamily: "var(--font-fraunces, serif)" }}
            >
              Selamat Datang Kembali
            </h1>
            <p className="mt-1.5 text-sm text-[#6b7c6f]">
              Masuk ke akun ReBrew untuk mengelola sampah dan poin reward Anda.
            </p>
          </div>

          {/* Success / Info Message */}
          {message && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl bg-[#e8f5e9] p-3.5 text-sm text-[#2e7d32] border border-[#c8e6c9]">
              <GoogleIcon name="check_circle" size={20} filled className="shrink-0 text-[#2e7d32]" />
              <span>{message}</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl bg-[#ffdad6] p-3.5 text-sm text-[#93000a] border border-[#ffb4ab]">
              <GoogleIcon name="error" size={20} filled className="shrink-0 text-[#93000a]" />
              <span>{error}</span>
            </div>
          )}

          <form className="flex flex-col gap-4">
            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-xs font-bold uppercase tracking-wider text-[#1a2a1b]"
              >
                Email
              </label>
              <div className="relative flex items-center">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="h-12 w-full rounded-xl border border-[#bbcabf] bg-transparent px-4 pr-10 text-sm text-[#1a2a1b] outline-none transition focus:border-[#2e7d32] focus:ring-1 focus:ring-[#2e7d32]"
                  placeholder="nama@email.com"
                />
                <div className="pointer-events-none absolute right-3 text-[#6b7c6f]">
                  <GoogleIcon name="mail" size={18} />
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-xs font-bold uppercase tracking-wider text-[#1a2a1b]"
                >
                  Password
                </label>
              </div>
              <div className="relative flex items-center">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="h-12 w-full rounded-xl border border-[#bbcabf] bg-transparent px-4 pr-10 text-sm text-[#1a2a1b] outline-none transition focus:border-[#2e7d32] focus:ring-1 focus:ring-[#2e7d32]"
                  placeholder="••••••••"
                />
                <div className="pointer-events-none absolute right-3 text-[#6b7c6f]">
                  <GoogleIcon name="lock" size={18} />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              formAction={login}
              className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#2e7d32] text-sm font-bold text-white shadow-md transition-all hover:bg-[#256829] hover:shadow-lg focus-visible:outline-2 focus-visible:outline-[#2e7d32]"
            >
              <span>Masuk</span>
              <GoogleIcon name="arrow_forward" size={18} />
            </button>
          </form>

          {/* Link to Register */}
          <div className="mt-6 border-t border-[#d8e6d9]/70 pt-5 text-center text-sm text-[#6b7c6f]">
            Belum punya akun ReBrew?{" "}
            <Link
              href="/daftar"
              className="font-bold text-[#2e7d32] hover:underline"
            >
              Daftar Sekarang
            </Link>
          </div>
        </div>

        {/* Back to Home Link */}
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-1.5 text-xs font-medium text-[#6b7c6f] transition-colors hover:text-[#2e7d32]"
        >
          <GoogleIcon name="arrow_back" size={16} />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>
    </div>
  );
}
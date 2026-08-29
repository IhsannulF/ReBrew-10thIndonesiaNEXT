import React from "react";
import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { signup } from "@/app/actions/auth";
import { GoogleIcon } from "@/components/ui/GoogleIcon";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
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

  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8f9ff] px-4 py-12">
      <div className="flex w-full max-w-xl flex-col items-center">
        {/* ReBrew Logo Header */}
        <Link
          href="/"
          className="mb-6 flex items-center gap-2.5 transition-transform hover:scale-105"
          aria-label="ReBrew Beranda"
        >
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
        <div className="w-full rounded-3xl border border-[#bbcabf]/30 bg-white p-6 sm:p-8 shadow-[0px_10px_35px_rgba(0,108,73,0.06)]">
          {/* Title & Tagline */}
          <div className="mb-6 text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#eff4ff] text-[#006c49] border border-[#adedd3] mb-2">
              <GoogleIcon name="eco" size={15} filled />
              Pendaftaran Mitra Coffee Shop (Gratis)
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0b1c30]">
              Daftar Akun Mitra ReBrew
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-[#3c4a42] max-w-md mx-auto">
              Kelola limbah plastic cup kafe Anda, dapatkan sertifikat Eco-Partner, dan tukar sampah jadi koin bernilai rupiah.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-2xl bg-[#ffdad6]/60 p-3.5 text-xs sm:text-sm text-[#ba1a1a] border border-[#ffdad6]">
              <GoogleIcon name="error" size={20} filled className="shrink-0 text-[#ba1a1a]" />
              <span>{error}</span>
            </div>
          )}

          <form action={signup} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nama Lengkap Pemilik / Manager */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="fullName"
                  className="text-xs font-bold text-[#0b1c30]"
                >
                  Nama Lengkap Pemilik / PIC *
                </label>
                <div className="relative flex items-center">
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    className="h-11 w-full rounded-xl border border-[#bbcabf]/40 bg-[#f8f9ff] px-3.5 pr-10 text-xs sm:text-sm text-[#0b1c30] outline-none transition focus:bg-white focus:border-[#006c49] focus:ring-1 focus:ring-[#006c49]"
                    placeholder="Contoh: Budi Santoso"
                  />
                  <div className="pointer-events-none absolute right-3 text-[#6c7a71]">
                    <GoogleIcon name="person" size={18} />
                  </div>
                </div>
              </div>

              {/* Nama Coffee Shop */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="cafeName"
                  className="text-xs font-bold text-[#0b1c30]"
                >
                  Nama Coffee Shop / Kedai Kopi *
                </label>
                <div className="relative flex items-center">
                  <input
                    id="cafeName"
                    name="cafeName"
                    type="text"
                    required
                    className="h-11 w-full rounded-xl border border-[#bbcabf]/40 bg-[#f8f9ff] px-3.5 pr-10 text-xs sm:text-sm text-[#0b1c30] outline-none transition focus:bg-white focus:border-[#006c49] focus:ring-1 focus:ring-[#006c49]"
                    placeholder="Contoh: Kopi Selamat Cafe"
                  />
                  <div className="pointer-events-none absolute right-3 text-[#6c7a71]">
                    <GoogleIcon name="coffee" size={18} />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Kota / Wilayah */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="city"
                  className="text-xs font-bold text-[#0b1c30]"
                >
                  Kota Operasional Kafe *
                </label>
                <select
                  id="city"
                  name="city"
                  defaultValue="Surabaya"
                  className="h-11 w-full rounded-xl border border-[#bbcabf]/40 bg-[#f8f9ff] px-3.5 text-xs sm:text-sm text-[#0b1c30] outline-none transition focus:bg-white focus:border-[#006c49] focus:ring-1 focus:ring-[#006c49] cursor-pointer"
                >
                  <option value="Surabaya">Surabaya</option>
                  <option value="Malang">Malang</option>
                  <option value="Sidoarjo">Sidoarjo</option>
                  <option value="Gresik">Gresik</option>
                  <option value="Jakarta Selatan">Jakarta Selatan</option>
                  <option value="Jakarta Pusat">Jakarta Pusat</option>
                  <option value="Bandung">Bandung</option>
                  <option value="Makassar">Makassar</option>
                </select>
              </div>

              {/* Nomor WhatsApp / Kontak */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="phone"
                  className="text-xs font-bold text-[#0b1c30]"
                >
                  Nomor WhatsApp Kafe
                </label>
                <div className="relative flex items-center">
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    className="h-11 w-full rounded-xl border border-[#bbcabf]/40 bg-[#f8f9ff] px-3.5 pr-10 text-xs sm:text-sm text-[#0b1c30] outline-none transition focus:bg-white focus:border-[#006c49] focus:ring-1 focus:ring-[#006c49]"
                    placeholder="Contoh: 081234567890"
                  />
                  <div className="pointer-events-none absolute right-3 text-[#6c7a71]">
                    <GoogleIcon name="call" size={18} />
                  </div>
                </div>
              </div>
            </div>

            {/* Email Kafe / Akun */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-xs font-bold text-[#0b1c30]"
              >
                Email Akun Bisnis *
              </label>
              <div className="relative flex items-center">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="h-11 w-full rounded-xl border border-[#bbcabf]/40 bg-[#f8f9ff] px-3.5 pr-10 text-xs sm:text-sm text-[#0b1c30] outline-none transition focus:bg-white focus:border-[#006c49] focus:ring-1 focus:ring-[#006c49]"
                  placeholder="mitra@kopiselamat.com"
                />
                <div className="pointer-events-none absolute right-3 text-[#6c7a71]">
                  <GoogleIcon name="mail" size={18} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="password"
                  className="text-xs font-bold text-[#0b1c30]"
                >
                  Kata Sandi (Min. 6 Karakter) *
                </label>
                <div className="relative flex items-center">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={6}
                    className="h-11 w-full rounded-xl border border-[#bbcabf]/40 bg-[#f8f9ff] px-3.5 pr-10 text-xs sm:text-sm text-[#0b1c30] outline-none transition focus:bg-white focus:border-[#006c49] focus:ring-1 focus:ring-[#006c49]"
                    placeholder="Minimal 6 karakter"
                  />
                  <div className="pointer-events-none absolute right-3 text-[#6c7a71]">
                    <GoogleIcon name="lock" size={18} />
                  </div>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="confirmPassword"
                  className="text-xs font-bold text-[#0b1c30]"
                >
                  Konfirmasi Kata Sandi *
                </label>
                <div className="relative flex items-center">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    minLength={6}
                    className="h-11 w-full rounded-xl border border-[#bbcabf]/40 bg-[#f8f9ff] px-3.5 pr-10 text-xs sm:text-sm text-[#0b1c30] outline-none transition focus:bg-white focus:border-[#006c49] focus:ring-1 focus:ring-[#006c49]"
                    placeholder="Ulangi kata sandi"
                  />
                  <div className="pointer-events-none absolute right-3 text-[#6c7a71]">
                    <GoogleIcon name="lock_reset" size={18} />
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits Trust Point */}
            <div className="rounded-2xl border border-[#bbcabf]/30 bg-[#f8f9ff] p-3.5 text-xs text-[#3c4a42] flex items-center gap-2.5">
              <GoogleIcon name="verified" size={20} className="text-[#006c49] shrink-0" filled />
              <span>
                Paket <strong>Starter Tier Gratis</strong> mencakup dashboard monitoring, akses drop point, dan sertifikasi Eco-Partner bulanan.
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#006c49] text-sm font-bold text-white shadow-sm transition-all hover:bg-[#2b6954] hover:shadow-md active:scale-[0.99]"
            >
              <span>Daftarkan Kafe Saya Sekarang</span>
              <GoogleIcon name="arrow_forward" size={18} />
            </button>
          </form>

          {/* Link to Login */}
          <div className="mt-6 border-t border-[#bbcabf]/20 pt-5 text-center text-xs sm:text-sm text-[#3c4a42]">
            Sudah memiliki akun mitra?{" "}
            <Link
              href="/login"
              className="font-bold text-[#006c49] hover:underline"
            >
              Masuk di sini
            </Link>
          </div>
        </div>

        {/* Back to Home Link */}
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-1.5 text-xs font-medium text-[#6c7a71] transition-colors hover:text-[#006c49]"
        >
          <GoogleIcon name="arrow_back" size={16} />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>
    </div>
  );
}

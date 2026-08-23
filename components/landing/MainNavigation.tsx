import React from "react";
import Link from "next/link";
import Image from "next/image";
import type { User } from "@supabase/supabase-js";
import { signout } from "@/app/actions/auth";
import { GoogleIcon } from "@/components/ui/GoogleIcon";

interface MainNavigationProps {
  user?: User | null;
}

export const MainNavigation: React.FC<MainNavigationProps> = ({ user }) => {
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Pengguna";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#d8e6d9] bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-4 sm:px-8 lg:px-12">
        <Link
          href="/"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
          aria-label="Beranda ReBrew"
        >
          <Image
            src="/logo.png"
            alt="ReBrew"
            width={120}
            height={36}
            className="h-9 w-auto object-contain"
            priority
          />
        </Link>

        <nav aria-label="Navigasi utama" className="hidden md:flex items-center gap-8">
          <a
            href="#keunggulan"
            className="text-sm font-medium text-[#6b7c6f] transition-colors hover:text-[#2e7d32]"
          >
            Keunggulan
          </a>
          <a
            href="#cara-kerja"
            className="text-sm font-medium text-[#6b7c6f] transition-colors hover:text-[#2e7d32]"
          >
            Cara Kerja
          </a>
          <a
            href="#harga"
            className="text-sm font-medium text-[#6b7c6f] transition-colors hover:text-[#2e7d32]"
          >
            Harga Sampah
          </a>
        </nav>

        <div className="inline-flex items-center gap-2.5">
          {user ? (
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Profile Pill */}
              <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-[#e8f5e9] px-3 py-1.5 text-xs font-bold text-[#2e7d32]">
                <GoogleIcon name="account_circle" size={18} filled className="text-[#2e7d32]" />
                <span className="max-w-[120px] truncate md:max-w-[160px]">
                  {displayName}
                </span>
              </div>

              {/* Buka Dashboard Button */}
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-[10px] bg-[#006c49] px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#256829] hover:shadow"
              >
                <GoogleIcon name="grid_view" size={16} />
                <span>Dashboard →</span>
              </Link>

              {/* Logout Button */}
              <form action={signout}>
                <button
                  type="submit"
                  title="Keluar"
                  className="inline-flex items-center gap-1 rounded-[10px] border border-[#d8e6d9] bg-white px-2.5 sm:px-3 py-2 text-xs font-bold text-[#6b7c6f] transition-colors hover:border-[#ffdad6] hover:bg-[#ffdad6]/40 hover:text-[#93000a]"
                >
                  <GoogleIcon name="logout" size={15} />
                  <span className="hidden md:inline">Keluar</span>
                </button>
              </form>
            </div>
          ) : (
            <nav aria-label="Navigasi akun" className="inline-flex items-center gap-2.5">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-[10px] border border-[#2e7d32] bg-white px-4 py-2 text-[13px] font-bold text-[#2e7d32] transition-colors hover:bg-[#e8f5e9]"
              >
                Masuk
              </Link>
              <Link
                href="/daftar"
                className="inline-flex items-center justify-center rounded-[10px] bg-[#2e7d32] px-4 py-2 text-[13px] font-bold text-white shadow-sm transition-all hover:bg-[#256829] hover:shadow"
              >
                Daftar Gratis →
              </Link>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
};

"use client";

import React, { useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import type { LandingStatistics } from "@/app/actions/landing";

interface WasteRecyclingHeroProps {
  stats?: LandingStatistics | null;
}

export const WasteRecyclingHero = ({ stats }: WasteRecyclingHeroProps): React.JSX.Element => {
  const handleScrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  const displayStats = [
    {
      value: stats?.formattedWasteText || "52.5 kg",
      label: "Sampah Terkelola",
    },
    {
      value: stats?.formattedDropPointsText || "2 Central Hub",
      label: "Titik Kumpul Aktif",
    },
    {
      value: `${stats?.userSatisfactionPercent || 99}%`,
      label: "Kepuasan Mitra",
    },
  ];

  const floatingBadges = stats?.topRewards || [
    {
      icon: "coffee",
      coinsText: "Cup Plastik → 15 koin/kg",
      position: "top-4 -left-4 sm:-left-8",
    },
    {
      icon: "compost",
      coinsText: "Ampas Kopi → 10 koin/kg",
      position: "top-28 -right-4 sm:-right-8",
    },
    {
      icon: "local_drink",
      coinsText: "Botol PET → 5 koin/kg",
      position: "bottom-10 -left-6 sm:-left-12",
    },
  ];

  return (
    <section
      aria-labelledby="waste-recycling-heading"
      className="relative overflow-hidden bg-gradient-to-b from-[#f5f4ef]/60 via-[#f5f4ef]/30 to-white px-4 py-16 sm:px-8 sm:py-20 lg:px-12"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Left Column: Text & CTA */}
        <div className="flex flex-col items-start text-left">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f5e9] px-3.5 py-1 text-xs font-bold text-[#2e7d32]">
            <GoogleIcon name="eco" size={16} filled className="text-[#2e7d32]" />
            <span>
              {stats?.formattedMitraText ? `${stats.formattedMitraText} Aktif Terdaftar` : "Ekosistem Sirkular Coffee Shop & F&B"}
            </span>
          </div>

          {/* Heading */}
          <h1
            id="waste-recycling-heading"
            className="mt-4 text-4xl font-extrabold tracking-tight text-[#1a2a1b] sm:text-5xl lg:text-[52px] lg:leading-[1.15]"
            style={{ fontFamily: "var(--font-fraunces, serif)" }}
          >
            Setor Sampah, <br className="hidden sm:inline" />
            Dapat Uang Nyata.
          </h1>

          {/* Description */}
          <p className="mt-4 max-w-xl text-base text-[#6b7c6f] sm:text-lg leading-relaxed">
            Pilah limbah cup plastik PP, botol PET, dan ampas kopi dari tokomu. 
            Timbangan terverifikasi di Micro-Hub dan koin langsung masuk senilai <strong className="text-[#2e7d32] font-semibold">Rp 35/koin</strong> siap ditarik ke rekening bank atau e-wallet.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-3.5">
            <Link
              href="/daftar"
              className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#2e7d32] px-6 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-[#256829] hover:shadow-lg focus-visible:outline-2 focus-visible:outline-[#2e7d32]"
            >
              <span>Mulai Sekarang</span>
              <GoogleIcon name="arrow_forward" size={18} />
            </Link>
            <button
              type="button"
              onClick={() => handleScrollTo("cara-kerja")}
              className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-[#2e7d32] bg-white px-6 py-3.5 text-sm font-bold text-[#2e7d32] transition-colors hover:bg-[#e8f5e9] focus-visible:outline-2 focus-visible:outline-[#2e7d32]"
            >
              <span>Pelajari Cara Kerja</span>
            </button>
          </div>

          {/* Statistics */}
          <dl className="mt-10 sm:mt-12 grid grid-cols-3 gap-3 sm:gap-6 border-t border-[#d8e6d9]/60 pt-6 sm:pt-8 w-full max-w-xl">
            {displayStats.map((statistic) => (
              <div key={statistic.label} className="flex flex-col min-w-0">
                <dt
                  className="text-lg sm:text-2xl lg:text-[28px] font-bold text-[#2e7d32] tracking-tight leading-tight"
                  style={{ fontFamily: "var(--font-fraunces, serif)" }}
                >
                  {statistic.value}
                </dt>
                <dd className="mt-1 text-xs text-[#6b7c6f] sm:text-sm font-medium leading-snug">
                  {statistic.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Right Column: Interactive Illustration & Badges */}
        <div
          aria-label="Ilustrasi program penukaran sampah menjadi koin"
          className="relative flex items-center justify-center py-8 lg:py-0"
        >
          {/* Radial Gradient Glow */}
          <div className="relative flex h-80 w-80 items-center justify-center rounded-full bg-gradient-to-tr from-[#66bb6a]/20 via-[#a5d6a7]/30 to-[#f5f4ef] sm:h-[400px] sm:w-[400px]">
            <div className="flex h-64 w-64 items-center justify-center rounded-full bg-gradient-to-tr from-[#66bb6a]/30 via-[#c8e6c9]/40 to-white sm:h-[300px] sm:w-[300px] shadow-inner">
              <div className="relative flex h-40 w-40 items-center justify-center sm:h-48 sm:w-48 transition-transform hover:scale-105 duration-300">
                <Image
                  src="/logo-mark.png"
                  alt="ReBrew Eco Symbol"
                  width={180}
                  height={180}
                  className="h-auto w-36 sm:w-44 object-contain drop-shadow-xl"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Floating Reward Badges */}
          {floatingBadges.map((reward) => (
            <div
              key={reward.coinsText}
              className={`absolute ${reward.position} z-10 flex items-center gap-2 rounded-xl border border-[#d8e6d9] bg-white/95 px-3.5 py-2.5 shadow-[0px_8px_24px_rgba(0,0,0,0.08)] backdrop-blur-sm transition-transform hover:-translate-y-1`}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e8f5e9] text-[#2e7d32]">
                <GoogleIcon name={reward.icon} size={18} filled />
              </div>
              <p className="text-xs sm:text-[13px] font-bold text-[#1a2a1b] whitespace-nowrap">
                {reward.coinsText}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};


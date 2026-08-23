"use client";

import React, { useState } from "react";
import Link from "next/link";
import { GoogleIcon } from "@/components/ui/GoogleIcon";

export interface TransactionItem {
  id: string;
  icon: string;
  material: string;
  date: string;
  weight: string;
  coins: number;
  status?: string;
}

export interface DashboardData {
  user: {
    id?: string;
    name: string;
    email: string;
    cafeName: string;
    tier: string;
  };
  stats: {
    totalCoins: number;
    balanceIdr: number;
    wasteKgThisMonth: number;
    targetKgThisMonth: number;
    co2SavedKg: number;
  };
  notification?: {
    id: string;
    message: string;
    detail: string;
    coinsEarned: number;
  } | null;
  recentTransactions: TransactionItem[];
}

interface RecyclingDashboardProps {
  data?: DashboardData;
  user?: {
    name?: string | null;
    email?: string | null;
    cafeName?: string | null;
    tier?: string | null;
  } | null;
}

export const RecyclingDashboard: React.FC<RecyclingDashboardProps> = ({
  data,
  user,
}) => {
  const [isNotificationVisible, setIsNotificationVisible] = useState(true);

  // Fallback defaults if props are partial
  const userName = data?.user?.name || user?.name || "Budi";
  const tierName = data?.user?.tier || user?.tier || "Eco Partner ⭐";
  const totalCoins = data?.stats?.totalCoins ?? 1250;
  const balanceIdr = data?.stats?.balanceIdr ?? totalCoins * 50;
  const wasteKg = data?.stats?.wasteKgThisMonth ?? 8.4;
  const targetKg = data?.stats?.targetKgThisMonth ?? 20;
  const co2Kg = data?.stats?.co2SavedKg ?? 4.2;

  const progressPercent = Math.min(
    100,
    Math.round((wasteKg / targetKg) * 100),
  );
  const remainingKg = Math.max(0, targetKg - wasteKg).toFixed(1);

  const transactions = data?.recentTransactions || [
    {
      id: "RB-001",
      icon: "water_bottle",
      material: "Botol Plastik",
      date: "Hari ini 09:15",
      weight: "1.2 kg",
      coins: 18,
    },
    {
      id: "RB-002",
      icon: "package_2",
      material: "Kardus",
      date: "Kemarin 14:30",
      weight: "3.5 kg",
      coins: 17,
    },
    {
      id: "RB-003",
      icon: "inventory_2",
      material: "Kaleng",
      date: "2 hari lalu",
      weight: "0.8 kg",
      coins: 8,
    },
    {
      id: "RB-004",
      icon: "water_bottle",
      material: "Botol Plastik",
      date: "4 hari lalu",
      weight: "2.1 kg",
      coins: 31,
    },
  ];

  return (
    <div className="flex w-full flex-col gap-6">
      {/* 1. Verified Transaction Notification Banner */}
      {isNotificationVisible && (
        <section
          className="flex w-full items-center justify-between gap-4 rounded-xl border border-[#a5d6a7] bg-[#e8f5e9] px-5 py-3.5 shadow-sm"
          aria-label="Notifikasi transaksi"
        >
          <div className="flex items-center gap-3.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#2e7d32] text-white">
              <GoogleIcon name="check" size={16} />
            </div>
            <div className="flex flex-col">
              <strong className="text-sm font-bold text-[#2e7d32]">
                Transaksi RB-A1B2C3 Terverifikasi!
              </strong>
              <p className="text-xs text-[#6b7c6f]">
                Timbangan IoT mencatat 1.2 kg Botol Plastik ·{" "}
                <span className="font-bold text-[#2e7d32]">+18 koin</span> sudah masuk ke saldomu
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsNotificationVisible(false)}
            className="flex h-7 w-7 shrink-0 items-center justify-center text-lg text-[#6b7c6f] transition-colors hover:text-[#1a2a1b]"
            aria-label="Tutup notifikasi"
          >
            ×
          </button>
        </section>
      )}

      {/* 2. Welcome Header & CTA */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-col">
          <h1
            className="text-2xl font-bold tracking-tight text-[#1a2a1b] sm:text-3xl"
            style={{ fontFamily: "var(--font-fraunces, serif)" }}
          >
            Selamat Datang, {userName} 👋
          </h1>
          <p className="mt-0.5 text-xs font-normal text-[#6b7c6f] sm:text-sm">
            Agustus 2026 · {tierName}
          </p>
        </div>

        <Link
          href="/dashboard/setor"
          className="inline-flex items-center justify-center gap-1.5 rounded-[10px] bg-[#2e7d32] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#256829]"
        >
          <span>+ Setor Sampah</span>
        </Link>
      </header>

      {/* 3. 4 Summary Metric Cards (Centered Content Inside Boxes) */}
      <section
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full"
        aria-label="Ringkasan akun"
      >
        {/* Card 1: Total Koin */}
        <article className="flex flex-col items-center justify-center text-center rounded-2xl border border-[#d8e6d9] bg-white p-5 shadow-sm min-w-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-[#fff8e1] text-[#d97706] mb-3">
            <GoogleIcon name="monetization_on" size={24} filled />
          </div>
          <span className="text-xs font-semibold text-[#6b7c6f] uppercase tracking-wider">
            Total Koin
          </span>
          <div className="mt-1.5 flex items-baseline justify-center gap-1">
            <span
              className="text-2xl font-black tracking-tight text-[#d97706]"
              style={{ fontFamily: "var(--font-fraunces, serif)" }}
            >
              {totalCoins.toLocaleString("id-ID")}
            </span>
            <span
              className="text-xs font-semibold text-[#6b7c6f]"
              style={{ fontFamily: "var(--font-fraunces, serif)" }}
            >
              koin
            </span>
          </div>
        </article>

        {/* Card 2: Nilai Saldo */}
        <article className="flex flex-col items-center justify-center text-center rounded-2xl border border-[#d8e6d9] bg-white p-5 shadow-sm min-w-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-[#e8f5e9] text-[#2e7d32] mb-3">
            <GoogleIcon name="payments" size={24} filled />
          </div>
          <span className="text-xs font-semibold text-[#6b7c6f] uppercase tracking-wider">
            Nilai Saldo
          </span>
          <div className="mt-1.5 flex items-baseline justify-center gap-1">
            <span
              className="text-2xl font-black tracking-tight text-[#2e7d32]"
              style={{ fontFamily: "var(--font-fraunces, serif)" }}
            >
              Rp {balanceIdr.toLocaleString("id-ID")}
            </span>
          </div>
        </article>

        {/* Card 3: Sampah Bulan Ini */}
        <article className="flex flex-col items-center justify-center text-center rounded-2xl border border-[#d8e6d9] bg-white p-5 shadow-sm min-w-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-[#f1f8e9] text-[#66bb6a] mb-3">
            <GoogleIcon name="recycling" size={24} filled />
          </div>
          <span className="text-xs font-semibold text-[#6b7c6f] uppercase tracking-wider">
            Sampah Bulan Ini
          </span>
          <div className="mt-1.5 flex items-baseline justify-center gap-1">
            <span
              className="text-2xl font-black tracking-tight text-[#66bb6a]"
              style={{ fontFamily: "var(--font-fraunces, serif)" }}
            >
              {wasteKg}
            </span>
            <span
              className="text-xs font-semibold text-[#6b7c6f]"
              style={{ fontFamily: "var(--font-fraunces, serif)" }}
            >
              kg
            </span>
          </div>
        </article>

        {/* Card 4: CO2 Terselamatkan */}
        <article className="flex flex-col items-center justify-center text-center rounded-2xl border border-[#d8e6d9] bg-white p-5 shadow-sm min-w-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-[#efebe9] text-[#8d6e63] mb-3">
            <GoogleIcon name="public" size={24} filled />
          </div>
          <span className="text-xs font-semibold text-[#6b7c6f] uppercase tracking-wider">
            CO₂ Terselamatkan
          </span>
          <div className="mt-1.5 flex items-baseline justify-center gap-1">
            <span
              className="text-2xl font-black tracking-tight text-[#8d6e63]"
              style={{ fontFamily: "var(--font-fraunces, serif)" }}
            >
              {co2Kg}
            </span>
            <span
              className="text-xs font-semibold text-[#6b7c6f]"
              style={{ fontFamily: "var(--font-fraunces, serif)" }}
            >
              kg
            </span>
          </div>
        </article>
      </section>

      {/* 4. Lower Section (2 Columns: Left Transaksi, Right Target & Aksi) */}
      <div className="flex flex-col lg:flex-row items-start gap-5 w-full">
        {/* Left Column: Recent Transactions (Flex-1) */}
        <section
          className="flex flex-1 w-full min-w-0 flex-col rounded-2xl border border-[#d8e6d9] bg-white p-6 shadow-sm"
          aria-labelledby="recent-transactions-heading"
        >
          <div className="flex items-center justify-between pb-3">
            <h2
              id="recent-transactions-heading"
              className="text-base font-bold text-[#1a2a1b]"
            >
              Transaksi Terbaru
            </h2>

            <Link
              href="/dashboard/riwayat"
              className="text-[13px] font-semibold text-[#2e7d32] transition-colors hover:underline"
            >
              Lihat Semua →
            </Link>
          </div>

          <div className="divide-y divide-[#f0f4f0]">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between py-3.5 px-1"
              >
                {/* Left: Material Info */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#f5f4ef] text-[#2e7d32]">
                    <GoogleIcon name={tx.icon} size={20} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <strong className="truncate text-sm font-bold text-[#1a2a1b]">
                      {tx.material}
                    </strong>
                    <p className="text-xs text-[#6b7c6f]">
                      {tx.date} · {tx.weight}
                    </p>
                  </div>
                </div>

                {/* Right: Tag & Coins */}
                <div className="flex items-center gap-3 shrink-0 pl-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#2e7d3218] px-2.5 py-0.5 text-[11px] font-bold text-[#2e7d32]">
                    <span>✔ {tx.status || "Terverifikasi"}</span>
                  </span>

                  <div className="flex items-center gap-0.5 font-extrabold text-[#ffc107]">
                    <span className="text-sm font-bold">+{tx.coins}</span>
                    <GoogleIcon
                      name="monetization_on"
                      size={15}
                      filled
                      className="text-[#d97706]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right Column: Target Bulan Ini & Aksi Cepat */}
        <aside
          className="flex w-full lg:w-[280px] xl:w-[320px] flex-col gap-4 shrink-0"
          aria-label="Target dan aksi cepat"
        >
          {/* Target Bulan Ini Card */}
          <section
            className="flex w-full flex-col items-center justify-center text-center rounded-2xl bg-[#2e7d32] p-5 text-white shadow-sm"
            aria-labelledby="monthly-target-heading"
          >
            <span
              id="monthly-target-heading"
              className="text-xs font-semibold text-white/80"
            >
              Target Bulan Ini
            </span>

            <div className="mt-1.5">
              <strong
                className="text-2xl font-black text-white"
                style={{ fontFamily: "var(--font-fraunces, serif)" }}
              >
                {wasteKg} / {targetKg} kg
              </strong>
            </div>

            {/* Progress Bar */}
            <div className="mt-3 flex flex-col gap-1.5 w-full">
              <div
                className="h-2 w-full overflow-hidden rounded-full bg-white/30"
                role="progressbar"
                aria-label="Progres target bulan ini"
                aria-valuemin={0}
                aria-valuemax={targetKg}
                aria-valuenow={wasteKg}
              >
                <div
                  className="h-full rounded-full bg-[#ffc107] transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-xs text-white/80">
                {progressPercent}% tercapai · {remainingKg} kg lagi 💪
              </p>
            </div>
          </section>

          {/* Quick Actions Card */}
          <section
            className="flex w-full flex-col rounded-2xl border border-[#d8e6d9] bg-white p-5 shadow-sm"
            aria-labelledby="quick-actions-heading"
          >
            <h2
              id="quick-actions-heading"
              className="flex items-center justify-center gap-1.5 text-[13px] font-bold text-[#1a2a1b]"
            >
              <span className="text-[#f59e0b]">⚡</span>
              <span>Aksi Cepat</span>
            </h2>

            <div className="mt-3 flex flex-col gap-2">
              <Link
                href="/dashboard/setor"
                className="flex items-center justify-center rounded-[10px] bg-[#2e7d32] py-2.5 text-[13px] font-bold text-white shadow-sm transition-colors hover:bg-[#256829]"
              >
                <span>Setor Sampah</span>
              </Link>

              <Link
                href="/dashboard/saldo"
                className="flex items-center justify-center rounded-[10px] bg-[#ffc107] py-2.5 text-[13px] font-bold text-[#7a4700] shadow-sm transition-colors hover:bg-[#ffcd38]"
              >
                <span>Tarik Uang</span>
              </Link>

              <Link
                href="/dashboard/insight"
                className="flex items-center justify-center rounded-[10px] border border-[#2e7d32] bg-white py-2.5 text-[13px] font-bold text-[#2e7d32] transition-colors hover:bg-[#e8f5e9]"
              >
                <span>Lihat Insight</span>
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};

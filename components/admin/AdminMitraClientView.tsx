"use client";

import React, { useState } from "react";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import {
  AdminMitraItem,
  updateMitraTierAction,
  adjustMitraPointsAction,
} from "@/app/actions/admin";

interface AdminMitraClientViewProps {
  initialData: {
    mitraList: AdminMitraItem[];
    totalTonaseKg: number;
    totalSaldoPoinBeredar: number;
  };
}

export const AdminMitraClientView: React.FC<AdminMitraClientViewProps> = ({
  initialData,
}) => {
  const [mitraList, setMitraList] = useState<AdminMitraItem[]>(initialData.mitraList);
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<"all" | "starter" | "1_ton_club" | "enterprise">("all");
  const [cityFilter, setCityFilter] = useState<string>("all");

  // Selected Cafe for Management Modal
  const [selectedMitra, setSelectedMitra] = useState<AdminMitraItem | null>(null);
  const [selectedTier, setSelectedTier] = useState<"starter" | "1_ton_club" | "enterprise">("starter");
  const [pointsDeltaInput, setPointsDeltaInput] = useState<string>("");
  const [pointsReason, setPointsReason] = useState<string>("Bonus kampanye pemilahan sampah");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Extract unique cities
  const uniqueCities = Array.from(new Set(mitraList.map((m) => m.city))).filter(Boolean);

  const handleOpenDetail = (m: AdminMitraItem) => {
    setSelectedMitra(m);
    let mapped: "starter" | "1_ton_club" | "enterprise" = "starter";
    if (m.tier.includes("1 Ton")) mapped = "1_ton_club";
    else if (m.tier.includes("Enterprise")) mapped = "enterprise";
    setSelectedTier(mapped);
    setPointsDeltaInput("");
    setErrorMessage(null);
  };

  const handleSaveTier = async () => {
    if (!selectedMitra || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await updateMitraTierAction({
        userId: selectedMitra.id,
        tier: selectedTier,
      });

      if (res.success) {
        let label = "Starter (Gratis)";
        if (selectedTier === "1_ton_club") label = "1 Ton Club (Rp200k/thn)";
        else if (selectedTier === "enterprise") label = "Enterprise (Chain)";

        setMitraList((prev) =>
          prev.map((m) => (m.id === selectedMitra.id ? { ...m, tier: label } : m))
        );
        setSelectedMitra((prev) => (prev ? { ...prev, tier: label } : null));

        setSuccessToast(`Paket tier langganan ${selectedMitra.cafeName} berhasil diperbarui menjadi ${label}!`);
        setTimeout(() => setSuccessToast(null), 4000);
      } else {
        setErrorMessage(res.error || "Gagal memperbarui tier.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Terjadi kesalahan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdjustPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMitra || isSubmitting) return;

    const delta = parseInt(pointsDeltaInput);
    if (isNaN(delta) || delta === 0) {
      setErrorMessage("Masukkan nominal poin yang valid (positif atau negatif).");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await adjustMitraPointsAction({
        userId: selectedMitra.id,
        pointsDelta: delta,
        reason: pointsReason,
      });

      if (res.success && res.newSaldo !== undefined) {
        setMitraList((prev) =>
          prev.map((m) =>
            m.id === selectedMitra.id ? { ...m, saldoPoin: res.newSaldo! } : m
          )
        );
        setSelectedMitra((prev) =>
          prev ? { ...prev, saldoPoin: res.newSaldo! } : null
        );

        setSuccessToast(
          `Penyesuaian saldo poin ${selectedMitra.cafeName} berhasil! Saldo baru: ${res.newSaldo.toLocaleString("id-ID")} pt.`
        );
        setPointsDeltaInput("");
        setTimeout(() => setSuccessToast(null), 5000);
      } else {
        setErrorMessage(res.error || "Gagal menyesuaikan poin.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Terjadi kesalahan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered List
  const filteredMitra = mitraList.filter((m) => {
    if (tierFilter !== "all") {
      if (tierFilter === "starter" && !m.tier.toLowerCase().includes("starter")) return false;
      if (tierFilter === "1_ton_club" && !m.tier.toLowerCase().includes("1 ton")) return false;
      if (tierFilter === "enterprise" && !m.tier.toLowerCase().includes("enterprise")) return false;
    }
    if (cityFilter !== "all" && m.city !== cityFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        m.cafeName.toLowerCase().includes(q) ||
        m.fullName.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.city.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Calculate live KPI metrics
  const totalKafeCount = mitraList.length;
  const totalTonase = mitraList.reduce((acc, m) => acc + m.totalKg, 0);
  const totalSaldoPoin = mitraList.reduce((acc, m) => acc + m.saldoPoin, 0);
  const avgKgPerKafe = totalKafeCount > 0 ? (totalTonase / totalKafeCount).toFixed(1) : "0";

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#bbcabf]/30 pb-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-[#006c49] font-semibold mb-0.5">
            <span>Admin</span>
            <span>/</span>
            <span className="text-[#6c7a71]">Mitra Kafe</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0b1c30]">
            Manajemen Coffee Shop & Langganan SaaS
          </h1>
          <p className="text-xs text-[#6c7a71] mt-0.5">
            Kelola {totalKafeCount} kedai kopi mitra terdaftar, status tier langganan, akumulasi limbah, dan penyesuaian saldo poin.
          </p>
        </div>
      </div>

      {/* Success Toast */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-[#f0fdf4] border border-[#006c49]/30 text-xs text-[#006c49] font-bold flex items-center gap-2.5 animate-fade-in shadow-xs">
          <GoogleIcon name="check_circle" size={20} filled />
          <span>{successToast}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#bbcabf]/30 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6c7a71]">Total Mitra Kafe</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eff4ff] text-[#006c49]">
              <GoogleIcon name="storefront" size={18} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-[#0b1c30]">{totalKafeCount} Kedai</div>
            <div className="text-[11px] text-[#006c49] font-medium mt-0.5">Mitra aktif terdaftar</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#bbcabf]/30 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6c7a71]">Total Tonase Limbah Kafe</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eff6ff] text-[#0284c7]">
              <GoogleIcon name="inventory_2" size={18} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-[#0b1c30]">
              {(totalTonase / 1000).toFixed(2)}{" "}
              <span className="text-sm font-semibold text-[#6c7a71]">Ton</span>
            </div>
            <div className="text-[11px] text-[#0284c7] font-medium mt-0.5">
              ≈ {totalTonase.toLocaleString("id-ID")} kg terkumpul
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#bbcabf]/30 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6c7a71]">Saldo Poin Beredar</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f0fdf4] text-[#006c49]">
              <GoogleIcon name="account_balance_wallet" size={18} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-[#006c49]">
              Rp {totalSaldoPoin.toLocaleString("id-ID")}
            </div>
            <div className="text-[11px] text-[#306d58] font-medium mt-0.5">
              {totalSaldoPoin.toLocaleString("id-ID")} Poin terbit
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#bbcabf]/30 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6c7a71]">Rata-rata per Kafe</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#fffdf5] text-[#d97706]">
              <GoogleIcon name="trending_up" size={18} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-[#0b1c30]">{avgKgPerKafe} kg</div>
            <div className="text-[11px] text-[#6c7a71] font-medium mt-0.5">Kontribusi per kedai</div>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="rounded-3xl border border-[#bbcabf]/30 bg-white p-5 sm:p-6 shadow-2xs">
        {/* Search & Filter Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-5">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama kafe, PIC, email, atau kota..."
              className="w-full text-xs p-2.5 pl-9 rounded-xl border border-[#bbcabf]/40 bg-white text-[#0b1c30] outline-none focus:ring-1 focus:ring-[#006c49]"
            />
            <div className="absolute left-3 top-2.5 text-[#6c7a71]">
              <GoogleIcon name="search" size={16} />
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter Tier */}
            <div className="flex items-center gap-1 bg-[#eff4ff] p-1 rounded-xl border border-[#bbcabf]/30 text-xs">
              {[
                { key: "all", label: "Semua Tier" },
                { key: "starter", label: "Starter" },
                { key: "1_ton_club", label: "1 Ton Club" },
                { key: "enterprise", label: "Enterprise" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setTierFilter(tab.key as any)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    tierFilter === tab.key
                      ? "bg-white text-[#006c49] shadow-2xs"
                      : "text-[#6c7a71] hover:text-[#0b1c30]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Filter City */}
            {uniqueCities.length > 1 && (
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="text-xs p-2 rounded-xl border border-[#bbcabf]/40 bg-white text-[#0b1c30] outline-none"
              >
                <option value="all">Semua Kota</option>
                {uniqueCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#bbcabf]/30 text-[#6c7a71] font-bold text-[11px] uppercase tracking-wider">
                <th className="pb-3 pr-4">Nama Kafe & Pemilik</th>
                <th className="pb-3 pr-4">Kota / Wilayah</th>
                <th className="pb-3 pr-4">Paket Tier SaaS</th>
                <th className="pb-3 pr-4">Total Setor (kg)</th>
                <th className="pb-3 pr-4">Saldo Poin (Rp)</th>
                <th className="pb-3 pr-4">Transaksi</th>
                <th className="pb-3 pr-4">Bergabung</th>
                <th className="pb-3 text-right">Aksi Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#bbcabf]/20">
              {filteredMitra.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-[#6c7a71]">
                    Tidak ada mitra kafe yang sesuai dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredMitra.map((m) => (
                  <tr key={m.id} className="hover:bg-[#f8f9ff] transition-colors">
                    <td className="py-3.5 pr-4">
                      <div className="font-bold text-[#0b1c30] text-sm">{m.cafeName}</div>
                      <div className="text-[10px] text-[#6c7a71]">
                        PIC: {m.fullName} • {m.email}
                      </div>
                    </td>
                    <td className="py-3.5 pr-4 text-[#3c4a42] font-medium">{m.city}</td>
                    <td className="py-3.5 pr-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] inline-block ${
                          m.tier.includes("1 Ton")
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : m.tier.includes("Enterprise")
                            ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {m.tier}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 font-extrabold text-[#006c49]">
                      {m.totalKg} kg
                    </td>
                    <td className="py-3.5 pr-4">
                      <span className="font-extrabold text-[#0b1c30]">
                        {m.saldoPoin.toLocaleString("id-ID")} pt
                      </span>
                      <span className="block text-[10px] text-[#6c7a71]">
                        ≈ Rp {m.saldoPoin.toLocaleString("id-ID")}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-[#3c4a42] font-semibold">
                      {m.totalTransactionsCount}x setor
                    </td>
                    <td className="py-3.5 pr-4 text-[#6c7a71]">{m.joinedDate}</td>
                    <td className="py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenDetail(m)}
                        className="px-3 py-1.5 rounded-lg border border-[#006c49] text-[#006c49] font-bold text-[11px] hover:bg-[#eff4ff] transition-colors cursor-pointer"
                      >
                        Kelola & Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail & Kelola Mitra Kafe */}
      {selectedMitra && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-[#bbcabf]/30 space-y-4 animate-fade-in my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#bbcabf]/20">
              <div className="flex items-center gap-2 text-[#006c49]">
                <GoogleIcon name="storefront" size={22} />
                <h3 className="text-base font-bold text-[#0b1c30]">
                  Manajemen Mitra: {selectedMitra.cafeName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMitra(null)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold">
                {errorMessage}
              </div>
            )}

            {/* Overview Summary */}
            <div className="p-3.5 rounded-2xl bg-[#f8f9ff] border border-[#bbcabf]/30 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#6c7a71]">Pemilik / PIC:</span>
                <span className="font-bold text-[#0b1c30]">{selectedMitra.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6c7a71]">Email Akun:</span>
                <span className="font-mono text-[#0b1c30]">{selectedMitra.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6c7a71]">Kota / Lokasi:</span>
                <span className="font-medium text-[#0b1c30]">{selectedMitra.city}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-[#bbcabf]/20">
                <span className="text-[#6c7a71]">Total Sampah Terkelola:</span>
                <span className="font-extrabold text-[#006c49]">{selectedMitra.totalKg} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6c7a71]">Saldo Poin Saat Ini:</span>
                <span className="font-extrabold text-[#0b1c30]">
                  {selectedMitra.saldoPoin.toLocaleString("id-ID")} Poin (Rp {selectedMitra.saldoPoin.toLocaleString("id-ID")})
                </span>
              </div>
            </div>

            {/* 1. Kelola Paket Tier Langganan SaaS */}
            <div className="space-y-2 pt-1 border-t border-[#bbcabf]/20 text-xs">
              <label className="font-bold text-[#0b1c30] block">
                Ubah Paket Tier SaaS Mitra:
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedTier}
                  onChange={(e) => setSelectedTier(e.target.value as any)}
                  className="flex-1 p-2.5 rounded-xl border border-[#bbcabf]/40 bg-white text-[#0b1c30] outline-none font-bold"
                >
                  <option value="starter">Starter (Gratis)</option>
                  <option value="1_ton_club">1 Ton Club (Rp200k/thn)</option>
                  <option value="enterprise">Enterprise (Chain)</option>
                </select>
                <button
                  type="button"
                  onClick={handleSaveTier}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl bg-[#006c49] text-white font-bold hover:bg-[#005237] transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Simpan Tier
                </button>
              </div>
            </div>

            {/* 2. Penyesuaian Saldo Poin Bonus / Koreksi */}
            <form onSubmit={handleAdjustPoints} className="space-y-2.5 pt-1 border-t border-[#bbcabf]/20 text-xs">
              <label className="font-bold text-[#0b1c30] block">
                Penyesuaian Saldo Poin Mitra (Bonus / Koreksi):
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="number"
                    placeholder="Contoh: 5000 / -2000"
                    value={pointsDeltaInput}
                    onChange={(e) => setPointsDeltaInput(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#bbcabf]/40 bg-white text-[#0b1c30] outline-none font-bold"
                  />
                  <span className="text-[10px] text-[#6c7a71] mt-0.5 block">
                    Gunakan tanda minus (-) untuk pengurangan.
                  </span>
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Alasan penyesuaian..."
                    value={pointsReason}
                    onChange={(e) => setPointsReason(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#bbcabf]/40 bg-white text-[#0b1c30] outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isSubmitting || !pointsDeltaInput}
                className="w-full py-2.5 rounded-xl border border-[#006c49] text-[#006c49] font-bold hover:bg-[#eff4ff] transition-colors disabled:opacity-40 cursor-pointer"
              >
                Terapkan Penyesuaian Poin
              </button>
            </form>

            <div className="pt-2 border-t border-[#bbcabf]/20 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedMitra(null)}
                className="px-5 py-2.5 rounded-xl bg-gray-100 text-[#0b1c30] font-bold text-xs hover:bg-gray-200 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

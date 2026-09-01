"use client";

import React, { useState } from "react";
import Link from "next/link";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import { useDepositCalculator } from "@/hooks/useDepositCalculator";
import { WasteCategoryList } from "@/components/WasteCategoryList";
import { DepositMethodSelector } from "@/components/DepositMethodSelector";
import { SuccessTicketModal } from "@/components/SuccessTicketModal";

export default function SetorSampahPage() {
  const {
    weights,
    shareRate,
    setShareRate,
    method,
    setMethod,
    selectedDropPoint,
    setSelectedDropPoint,
    pickupDistance,
    setPickupDistance,
    pickupAddress,
    setPickupAddress,
    pickupNotes,
    setPickupNotes,
    pickupDate,
    setPickupDate,
    pickupTimeSlot,
    setPickupTimeSlot,
    isSuccessModalOpen,
    setIsSuccessModalOpen,
    summary,
    handleWeightChange,
    adjustWeight,
    resetWeights,
    createdTicketCode,
    isSubmitting,
    submitError,
    handleSubmit,
  } = useDepositCalculator();

  // State untuk Widget Simulasi Skala Bulanan
  const [simMonthlyKg, setSimMonthlyKg] = useState<number>(50);
  const [showSimCard, setShowSimCard] = useState<boolean>(true);

  // Perhitungan simulasi bulanan (asumsi basis cup plastik Rp 5.000 / kg, 15 poin/kg, 1 Poin = Rp 35)
  const simOfftakerGross = simMonthlyKg * 5000;
  const simShopPoints = Math.round(simMonthlyKg * 15);
  const simShopReward = simShopPoints * 35;
  const simReBrewGrossMargin = simOfftakerGross - simShopReward;
  const simCo2Saved = Math.round(simMonthlyKg * 1.2 * 10) / 10;

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#bbcabf]/30 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#006c49] mb-1">
            <Link href="/dashboard" className="hover:underline">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-[#6c7a71]">Setor Sampah</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0b1c30] tracking-tight">
            Setor Sampah & Raih Poin
          </h1>
          <p className="text-sm text-[#3c4a42] mt-0.5">
            Pilah sampah kafe Anda, input estimasi berat, dan pilih metode pengumpulan.
          </p>
        </div>

        {/* Ringkasan Cepat Saldo / Dampak */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-white border border-[#bbcabf]/30 rounded-2xl p-3 shadow-2xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eff4ff] text-[#006c49]">
              <GoogleIcon name="eco" size={22} filled />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6c7a71]">
                Estimasi Poin
              </div>
              <div className="text-lg font-bold text-[#006c49]">
                +{summary.finalPoints.toLocaleString("id-ID")}{" "}
                <span className="text-xs font-medium text-[#306d58]">
                  (≈ Rp {summary.equivalentRupiah.toLocaleString("id-ID")})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Simulation & Unit Economics Banner */}
      {showSimCard && (
        <div className="rounded-3xl border border-[#006c49]/25 bg-linear-to-r from-[#f0fdf4] via-[#f8fafc] to-[#eff6ff] p-5 sm:p-6 lg:pr-12 shadow-xs relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 relative z-10">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#006c49] text-white">
                  Kalkulator Unit Economics
                </span>
                <span className="text-xs font-semibold text-[#006c49]">
                  Model Bagi Hasil Transparan
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-[#0b1c30]">
                Simulasi Skala Bulanan: Proyeksi Nilai Daur Ulang Kafe
              </h2>
              <p className="text-xs text-[#3c4a42] mt-1 max-w-2xl">
                ReBrew mengkonversi sampah kafe ke offtaker recycler dengan skema poin transparan (Cup Plastik 15 pt/kg, Ampas Kopi 10 pt/kg). <strong>1 Poin = Rp 35</strong> yang dapat dicairkan langsung ke saldo kas kafe.
              </p>

              {/* Slider Simulasi Bulanan & Buffer Share Rate */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 max-w-xl">
                <div className="bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-[#bbcabf]/30">
                  <div className="flex justify-between text-xs font-bold text-[#0b1c30] mb-1">
                    <span>Estimasi Sampah Kafe:</span>
                    <span className="text-[#006c49]">{simMonthlyKg} kg / bulan</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="300"
                    step="10"
                    value={simMonthlyKg}
                    onChange={(e) => setSimMonthlyKg(parseInt(e.target.value))}
                    className="w-full accent-[#006c49] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#6c7a71] mt-1">
                    <span>10 kg</span>
                    <span>50 kg</span>
                    <span>150 kg</span>
                    <span>300 kg</span>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-[#bbcabf]/30">
                  <div className="flex justify-between text-xs font-bold text-[#0b1c30] mb-1">
                    <span>Rate Poin Insentif:</span>
                    <span className="text-[#006c49]">15 Poin/kg (Rp 525/kg)</span>
                  </div>
                  <div className="flex gap-1.5 mt-2">
                    <div className="flex-1 py-1 rounded-lg text-xs font-bold bg-[#006c49] text-white text-center shadow-2xs">
                      1 Poin = Rp 35
                    </div>
                  </div>
                  <span className="text-[10px] text-[#6c7a71] block mt-1">
                    Standar konversi poin ke kas tunai operasional
                  </span>
                </div>
              </div>
            </div>

            {/* Metric Results Box */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2.5 w-full lg:w-64 shrink-0">
              <div className="bg-white p-3 rounded-2xl border border-[#bbcabf]/30 shadow-2xs">
                <div className="text-[10px] font-semibold text-[#6c7a71]">
                  Nilai Jual ke Recycler
                </div>
                <div className="text-sm font-extrabold text-[#0b1c30]">
                  Rp {simOfftakerGross.toLocaleString("id-ID")}
                </div>
                <div className="text-[10px] text-[#6c7a71]">({simMonthlyKg} kg × Rp5.000)</div>
              </div>

              <div className="bg-[#f0fdf4] p-3 rounded-2xl border border-[#006c49]/30 shadow-2xs">
                <div className="text-[10px] font-bold text-[#006c49]">
                  Penghasilan Kafe (Poin)
                </div>
                <div className="text-base font-extrabold text-[#006c49]">
                  Rp {simShopReward.toLocaleString("id-ID")}
                </div>
                <div className="text-[10px] text-[#306d58]">
                  +{simShopPoints.toLocaleString("id-ID")} Poin (Rp 35/pt)
                </div>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-[#bbcabf]/30 shadow-2xs col-span-2 sm:col-span-1">
                <div className="text-[10px] font-semibold text-[#6c7a71]">
                  Margin Kotor ReBrew
                </div>
                <div className="text-sm font-bold text-[#0b1c30]">
                  Rp {simReBrewGrossMargin.toLocaleString("id-ID")}
                </div>
                <div className="text-[10px] text-[#6c7a71]">Operasional & Logistik</div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowSimCard(false)}
            className="absolute top-3.5 right-3.5 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 border border-[#bbcabf]/50 shadow-xs text-[#6c7a71] hover:text-[#ba1a1a] hover:bg-white hover:scale-105 active:scale-95 transition-all"
            aria-label="Tutup Banner Simulasi"
          >
            <GoogleIcon name="close" size={16} />
          </button>
        </div>
      )}

      {/* Form Container */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
      >
        {/* Kolom Kiri: Pilihan Kategori Sampah */}
        <div className="lg:col-span-7">
          <WasteCategoryList
            weights={weights}
            shareRate={shareRate}
            handleWeightChange={handleWeightChange}
            adjustWeight={adjustWeight}
            resetWeights={resetWeights}
          />
        </div>

        {/* Kolom Kanan: Metode Penyetoran & Ringkasan */}
        <div className="lg:col-span-5">
          <DepositMethodSelector
            method={method}
            setMethod={setMethod}
            selectedDropPoint={selectedDropPoint}
            setSelectedDropPoint={setSelectedDropPoint}
            pickupDistance={pickupDistance}
            setPickupDistance={setPickupDistance}
            pickupAddress={pickupAddress}
            setPickupAddress={setPickupAddress}
            pickupNotes={pickupNotes}
            setPickupNotes={setPickupNotes}
            pickupDate={pickupDate}
            setPickupDate={setPickupDate}
            pickupTimeSlot={pickupTimeSlot}
            setPickupTimeSlot={setPickupTimeSlot}
            summary={summary}
            isSubmitting={isSubmitting}
            submitError={submitError}
          />
        </div>
      </form>

      {/* Modal Sukses Tiket Setor */}
      {isSuccessModalOpen && (
        <SuccessTicketModal
          method={method}
          selectedDropPoint={selectedDropPoint}
          pickupAddress={pickupAddress}
          summary={summary}
          ticketCode={createdTicketCode}
          onClose={() => setIsSuccessModalOpen(false)}
        />
      )}
    </div>
  );
}

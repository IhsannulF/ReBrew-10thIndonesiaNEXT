"use client";

import React from "react";
import Link from "next/link";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import { useDepositCalculator } from "@/hooks/useDepositCalculator";
import { WasteCategoryList } from "@/components/WasteCategoryList";
import { DepositMethodSelector } from "@/components/DepositMethodSelector";
import { SuccessTicketModal } from "@/components/SuccessTicketModal";

export default function SetorSampahPage() {
  const {
    weights,
    method,
    setMethod,
    selectedDropPoint,
    setSelectedDropPoint,
    isSuccessModalOpen,
    setIsSuccessModalOpen,
    summary,
    handleWeightChange,
    adjustWeight,
    handleSubmit,
  } = useDepositCalculator();

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
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
        <div className="flex items-center gap-3 bg-white border border-[#bbcabf]/30 rounded-2xl p-3 shadow-2xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eff4ff] text-[#006c49]">
            <GoogleIcon name="eco" size={22} filled />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6c7a71]">
              Estimasi Poin
            </div>
            <div className="text-lg font-bold text-[#006c49]">
              +{summary.finalPoints}{" "}
              <span className="text-xs font-medium text-[#306d58]">Poin</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
      >
        {/* Kolom Kiri: Pilihan Kategori Sampah */}
        <div className="lg:col-span-7">
          <WasteCategoryList
            weights={weights}
            handleWeightChange={handleWeightChange}
            adjustWeight={adjustWeight}
          />
        </div>

        {/* Kolom Kanan: Metode Penyetoran & Ringkasan */}
        <div className="lg:col-span-5">
          <DepositMethodSelector
            method={method}
            setMethod={setMethod}
            selectedDropPoint={selectedDropPoint}
            setSelectedDropPoint={setSelectedDropPoint}
            summary={summary}
          />
        </div>
      </form>

      {/* Modal Sukses Tiket Setor */}
      {isSuccessModalOpen && (
        <SuccessTicketModal
          summary={summary}
          onClose={() => setIsSuccessModalOpen(false)}
        />
      )}
    </div>
  );
}

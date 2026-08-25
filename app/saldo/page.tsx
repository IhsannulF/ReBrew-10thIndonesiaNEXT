"use client";

import React from "react";
import Link from "next/link";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import { usePayout } from "@/hooks/usePayout";
import { BalanceOverviewCard } from "@/components/saldo/BalanceOverviewCard";
import { PayoutForm } from "@/components/saldo/PayoutForm";
import { PayoutStatusCard } from "@/components/saldo/PayoutStatusCard";
import { PayoutHistoryList } from "@/components/saldo/PayoutHistoryList";

export default function SaldoPage() {
  const {
    balancePoints,
    maxCashIdr,
    formData,
    formErrors,
    isSubmitting,
    selectedChannel,
    calculatedAmountIdr,
    adminFeeIdr,
    netAmountIdr,
    activePayout,
    payoutHistory,
    setChannelId,
    setAccountNumber,
    setAccountHolderName,
    setPointsToWithdraw,
    setPresetPercentage,
    handleSubmitPayout,
    handleResetActivePayout,
  } = usePayout();

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
            <span className="text-[#6c7a71]">Tarik Uang & Saldo</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0b1c30] tracking-tight">
            Pencairan Saldo & Kas Koin
          </h1>
          <p className="text-sm text-[#3c4a42] mt-0.5">
            Konversi poin hasil setor sampah kafe Anda menjadi uang tunai langsung ke rekening bank atau e-wallet.
          </p>
        </div>

        {/* Action Header Button */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/dashboard/riwayat"
            className="flex items-center gap-2 bg-[#eff4ff] text-[#006c49] border border-[#adedd3] px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-[#dce9ff] transition-all"
          >
            <GoogleIcon name="receipt_long" size={18} />
            <span>Lihat Riwayat Sampah</span>
          </Link>
        </div>
      </div>

      {/* Saldo Poin & Nilai Rupiah Card */}
      <BalanceOverviewCard
        balancePoints={balancePoints}
        maxCashIdr={maxCashIdr}
      />

      {/* Jika user baru saja submit rekening -> Tampilkan Status & Estimasi Real-Time */}
      {activePayout ? (
        <PayoutStatusCard
          payout={activePayout}
          onReset={handleResetActivePayout}
        />
      ) : (
        /* Jika belum submit -> Tampilkan Form Pengajuan Penarikan */
        <PayoutForm
          formData={formData}
          formErrors={formErrors}
          isSubmitting={isSubmitting}
          selectedChannel={selectedChannel}
          balancePoints={balancePoints}
          calculatedAmountIdr={calculatedAmountIdr}
          adminFeeIdr={adminFeeIdr}
          netAmountIdr={netAmountIdr}
          onChannelChange={setChannelId}
          onAccountNumberChange={setAccountNumber}
          onAccountHolderNameChange={setAccountHolderName}
          onPointsChange={setPointsToWithdraw}
          onPresetPercentage={setPresetPercentage}
          onSubmit={handleSubmitPayout}
        />
      )}

      {/* Daftar Riwayat Penarikan Dana Sebelumnya */}
      <PayoutHistoryList history={payoutHistory} />
    </div>
  );
}

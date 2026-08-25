"use client";

import React, { useState } from "react";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import { PayoutTransaction } from "@/types/payout";

interface PayoutStatusCardProps {
  payout: PayoutTransaction;
  onReset: () => void;
}

export const PayoutStatusCard: React.FC<PayoutStatusCardProps> = ({
  payout,
  onReset,
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(payout.id);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Mask account number for security: e.g. 1234567890 -> ******7890
  const maskedAccount =
    payout.accountNumber.length > 4
      ? "•••• " + payout.accountNumber.slice(-4)
      : payout.accountNumber;

  return (
    <div className="flex flex-col gap-6 rounded-3xl border border-[#006c49]/30 bg-white p-6 sm:p-7 shadow-md w-full animate-fade-in">
      {/* Top Banner Status & Estimation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#bbcabf]/20 pb-5">
        <div className="flex items-start gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#eff4ff] text-[#006c49] shadow-2xs">
            <GoogleIcon name="hourglass_top" size={26} className="animate-spin" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#fff8e1] text-[#92400e] border border-[#fde68a]">
                <span className="h-2 w-2 rounded-full bg-[#d97706] animate-ping" />
                Permintaan Pencairan Diproses
              </span>
              <span className="font-mono text-xs font-bold text-[#006c49]">
                {payout.id}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#0b1c30] mt-1">
              Transfer Sedang Dikirim ke Rekening
            </h2>
            <p className="text-xs text-[#3c4a42] mt-0.5 flex items-center gap-1">
              <GoogleIcon name="schedule" size={14} className="text-[#006c49]" />
              <span>Estimasi Masuk: <strong className="text-[#006c49]">{payout.estimatedArrival}</strong></span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopyId}
          className="self-start sm:self-center inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#bbcabf]/40 text-xs font-semibold text-[#0b1c30] hover:bg-[#f8f9ff] transition-colors"
        >
          <GoogleIcon name={isCopied ? "check" : "content_copy"} size={14} />
          <span>{isCopied ? "ID Disalin!" : "Salin ID Transaksi"}</span>
        </button>
      </div>

      {/* 3-Step Live Progress Timeline */}
      <div className="flex flex-col gap-2 rounded-2xl bg-[#f8f9ff] border border-[#bbcabf]/30 p-4 sm:p-5">
        <span className="text-xs font-bold text-[#0b1c30]">Status Progres Pencairan:</span>
        <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2">
          {/* Step 1: Diajukan */}
          <div className="flex flex-col items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#006c49] text-white text-xs font-bold mb-1 shadow-2xs">
              ✓
            </div>
            <span className="font-bold text-[#0b1c30]">1. Diajukan</span>
            <span className="text-[11px] text-[#6c7a71]">{payout.time}</span>
          </div>

          {/* Step 2: Kliring Gateway */}
          <div className="flex flex-col items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#006c49] text-white text-xs font-bold mb-1 shadow-2xs animate-pulse">
              <GoogleIcon name="sync" size={16} className="animate-spin" />
            </div>
            <span className="font-bold text-[#006c49]">2. Diproses Bank</span>
            <span className="text-[11px] text-[#306d58] font-medium">Sedang Berjalan</span>
          </div>

          {/* Step 3: Dana Diterima */}
          <div className="flex flex-col items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#bbcabf]/50 text-white text-xs font-bold mb-1">
              3
            </div>
            <span className="font-semibold text-[#6c7a71]">3. Dana Masuk</span>
            <span className="text-[11px] text-[#6c7a71]">Dalam 1-15 Mnt</span>
          </div>
        </div>
      </div>

      {/* Rincian Rekening & Nominal Transfer */}
      <div className="divide-y divide-[#bbcabf]/20 rounded-2xl border border-[#bbcabf]/30 bg-white p-4 sm:p-5 text-xs">
        <div className="flex justify-between py-2.5">
          <span className="text-[#6c7a71]">Bank / E-Wallet Tujuan:</span>
          <span className="font-bold text-[#0b1c30]">{payout.channelName}</span>
        </div>

        <div className="flex justify-between py-2.5">
          <span className="text-[#6c7a71]">Nomor Rekening / HP:</span>
          <span className="font-mono font-bold text-[#0b1c30]">{maskedAccount}</span>
        </div>

        <div className="flex justify-between py-2.5">
          <span className="text-[#6c7a71]">Nama Penerima:</span>
          <span className="font-bold text-[#0b1c30]">{payout.accountHolderName}</span>
        </div>

        <div className="flex justify-between py-2.5">
          <span className="text-[#6c7a71]">Poin Dikonversi:</span>
          <span className="font-bold text-[#d97706]">-{payout.pointsDeducted} Poin</span>
        </div>

        <div className="flex justify-between py-2.5">
          <span className="text-[#6c7a71]">Biaya Admin Transfer:</span>
          <span className="font-semibold text-[#006c49]">Gratis (Rp 0)</span>
        </div>

        <div className="flex justify-between items-center py-3 text-sm">
          <span className="font-bold text-[#0b1c30]">Total Dana yang Diterima:</span>
          <span className="text-xl font-extrabold font-mono text-[#006c49]">
            Rp {payout.netAmountIdr.toLocaleString("id-ID")}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onReset}
          className="w-full sm:w-auto px-5 py-3 rounded-xl border border-[#bbcabf]/40 text-xs font-bold text-[#0b1c30] hover:bg-[#f8f9ff] transition-colors"
        >
          Tarik Saldo Baru
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#006c49] text-white text-xs font-bold hover:bg-[#2b6954] transition-colors inline-flex items-center justify-center gap-1.5 shadow-sm"
        >
          <GoogleIcon name="receipt" size={16} />
          <span>Cetak Bukti Pengajuan</span>
        </button>
      </div>
    </div>
  );
};

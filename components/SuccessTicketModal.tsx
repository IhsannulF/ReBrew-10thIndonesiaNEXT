"use client";

import React, { useId } from "react";
import Link from "next/link";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import { DepositSummary } from "@/hooks/useDepositCalculator";

export interface SuccessTicketModalProps {
  summary: DepositSummary;
  onClose: () => void;
}

export const SuccessTicketModal: React.FC<SuccessTicketModalProps> = ({
  summary,
  onClose,
}) => {
  const randomSuffix = useId().replace(/[^a-zA-Z0-9]/g, "").slice(0, 6).toUpperCase() || "782910";
  const ticketId = `RB-${randomSuffix}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ticket-modal-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-[#bbcabf]/30 flex flex-col items-center text-center animate-fade-in">
        {/* Success Icon */}
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eff4ff] text-[#006c49] mb-4">
          <GoogleIcon name="qr_code_2" size={32} />
        </div>

        {/* Modal Title */}
        <h3 id="ticket-modal-title" className="text-lg font-bold text-[#0b1c30]">
          Tiket Setor Sampah Dibuat!
        </h3>
        <p className="text-xs text-[#3c4a42] mt-1 mb-4">
          Tunjukkan kode tiket ini saat menyerahkan sampah ke petugas / drop point untuk verifikasi penimbangan aktual.
        </p>

        {/* Ticket Detail Box */}
        <div className="w-full bg-[#f8f9ff] border border-dashed border-[#bbcabf] p-4 rounded-xl mb-5 flex flex-col gap-1.5 text-xs text-left">
          <div className="flex justify-between font-mono text-sm font-bold text-[#006c49]">
            <span>ID TIKET:</span>
            <span>{ticketId}</span>
          </div>
          <div className="flex justify-between text-[#3c4a42]">
            <span>Total Berat Estimasi:</span>
            <span className="font-bold text-[#0b1c30]">{summary.totalWeight} kg</span>
          </div>
          <div className="flex justify-between text-[#3c4a42]">
            <span>Estimasi Poin:</span>
            <span className="font-bold text-[#006c49]">+{summary.finalPoints} Poin</span>
          </div>
          <div className="flex justify-between text-[#3c4a42]">
            <span>Estimasi CO₂ Dicegah:</span>
            <span className="font-bold text-[#306d58]">{summary.totalCo2} kg CO₂e</span>
          </div>
          <div className="flex justify-between text-[#3c4a42] pt-1 border-t border-[#bbcabf]/20">
            <span>Status:</span>
            <span className="font-bold text-[#d97706]">Menunggu Penimbangan</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 w-full">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-[#bbcabf]/40 text-xs font-bold text-[#0b1c30] hover:bg-[#f8f9ff] transition-colors"
          >
            Tutup
          </button>
          <Link
            href="/dashboard/riwayat"
            className="flex-1 py-2.5 rounded-xl bg-[#006c49] text-white text-xs font-bold text-center hover:bg-[#2b6954] transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Lihat Riwayat</span>
            <GoogleIcon name="arrow_forward" size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};

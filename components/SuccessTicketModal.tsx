"use client";

import React, { useId } from "react";
import Link from "next/link";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import { DepositMethod, DepositSummary } from "@/hooks/useDepositCalculator";
import { DROP_POINTS } from "@/constants/wasteData";

export interface SuccessTicketModalProps {
  method: DepositMethod;
  selectedDropPoint: string;
  pickupAddress: string;
  summary: DepositSummary;
  ticketCode?: string;
  onClose: () => void;
}

export const SuccessTicketModal: React.FC<SuccessTicketModalProps> = ({
  method,
  selectedDropPoint,
  pickupAddress,
  summary,
  ticketCode,
  onClose,
}) => {
  const randomSuffix = useId().replace(/[^a-zA-Z0-9]/g, "").slice(0, 6).toUpperCase() || "782910";
  const displayTicketId = ticketCode || `RB-${randomSuffix}`;

  const currentDropPoint = DROP_POINTS.find((dp) => dp.id === selectedDropPoint);


  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ticket-modal-title"
    >
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-[#bbcabf]/30 flex flex-col items-center text-center animate-fade-in my-8">
        {/* Success Icon Badge */}
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f0fdf4] text-[#006c49] border border-[#006c49]/20 mb-4">
          <GoogleIcon name="qr_code_2" size={36} />
        </div>

        {/* Modal Title */}
        <h3 id="ticket-modal-title" className="text-xl font-extrabold text-[#0b1c30]">
          Tiket Setor Sampah Dibuat!
        </h3>
        <p className="text-xs text-[#3c4a42] mt-1 mb-5 max-w-sm">
          {method === "drop_point"
            ? "Tunjukkan tiket ini saat tiba di Micro-Hub untuk penimbangan aktual oleh staf ReBrew."
            : "Armada ReBrew telah menerima jadwal penjemputan ke lokasi kafe Anda."}
        </p>

        {/* Ticket Detail Box */}
        <div className="w-full bg-[#f8f9ff] border border-dashed border-[#006c49]/40 p-4 sm:p-5 rounded-2xl mb-5 flex flex-col gap-2.5 text-xs text-left">
          <div className="flex items-center justify-between font-mono pb-2.5 border-b border-[#bbcabf]/20">
            <span className="text-[#6c7a71] font-semibold">KODE TIKET:</span>
            <span className="text-base font-extrabold text-[#006c49]">{displayTicketId}</span>
          </div>

          <div className="flex justify-between text-[#3c4a42]">
            <span>Metode Penyetoran:</span>
            <span className="font-bold text-[#0b1c30]">
              {method === "drop_point" ? "Drop Point (Antar Mandiri)" : `Penjemputan Armada (${summary.pickupDistanceKm} km)`}
            </span>
          </div>

          {method === "drop_point" ? (
            <div className="flex justify-between text-[#3c4a42]">
              <span>Lokasi Hub:</span>
              <span className="font-semibold text-[#006c49] text-right truncate max-w-[200px]">
                {currentDropPoint?.name || "ReBrew Micro-Hub"}
              </span>
            </div>
          ) : (
            <div className="flex justify-between text-[#3c4a42]">
              <span>Alamat Jemput:</span>
              <span className="font-medium text-[#0b1c30] text-right truncate max-w-[200px]">
                {pickupAddress}
              </span>
            </div>
          )}

          <div className="flex justify-between text-[#3c4a42]">
            <span>Estimasi Total Berat:</span>
            <span className="font-bold text-[#0b1c30]">{summary.totalWeight} kg</span>
          </div>

          <div className="flex justify-between text-[#3c4a42]">
            <span>Pencegahan Emisi:</span>
            <span className="font-bold text-[#306d58]">{summary.totalCo2} kg CO₂e</span>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-[#bbcabf]/20">
            <span className="font-bold text-[#0b1c30]">Estimasi Poin Reward:</span>
            <div className="text-right">
              <span className="font-extrabold text-[#006c49] text-sm block">
                +{summary.finalPoints.toLocaleString("id-ID")} Poin
              </span>
              <span className="text-[11px] text-[#6c7a71]">
                ≈ Rp {summary.equivalentRupiah.toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center text-[#3c4a42] pt-1">
            <span>Status Transaksi:</span>
            <span className="font-bold px-2 py-0.5 rounded-full bg-[#fef3c7] text-[#92400e] text-[11px]">
              Menunggu Penimbangan Aktual
            </span>
          </div>
        </div>

        {/* Action Next Steps */}
        <div className="p-3 bg-[#eff4ff] rounded-xl text-left text-[11px] text-[#006c49] mb-5 w-full flex items-start gap-2">
          <GoogleIcon name="info" size={16} className="shrink-0 mt-0.5" />
          <span>
            {method === "drop_point"
              ? "Pastikan sampah dalam keadaan kering dan terpilah sesuai kategori untuk mempercepat proses verifikasi di Drop Point."
              : "Kurir armada ReBrew akan menghubungi nomor terdaftar sebelum tiba di lokasi kafe."}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 w-full">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-[#bbcabf]/40 text-xs font-bold text-[#0b1c30] hover:bg-[#f8f9ff] transition-colors"
          >
            Tutup
          </button>
          <Link
            href="/dashboard/riwayat"
            className="flex-1 py-3 rounded-xl bg-[#006c49] text-white text-xs font-bold text-center hover:bg-[#2b6954] transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span>Lihat Riwayat</span>
            <GoogleIcon name="arrow_forward" size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};


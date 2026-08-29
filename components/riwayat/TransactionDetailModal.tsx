"use client";

import React, { useState } from "react";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import { TransactionDetail } from "@/types/transaction";
import { CATEGORY_OPTIONS } from "@/constants/transactionHistoryData";

interface TransactionDetailModalProps {
  transaction: TransactionDetail | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction: tx,
  isOpen,
  onClose,
}) => {
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen || !tx) return null;

  const categoryInfo =
    CATEGORY_OPTIONS.find((c) => c.key === tx.categoryKey) || CATEGORY_OPTIONS[1];

  const handleCopyId = () => {
    navigator.clipboard.writeText(tx.id);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const getStatusInfo = () => {
    switch (tx.status) {
      case "confirmed":
        return {
          title: "Transaksi Terverifikasi",
          desc: "Sampah telah ditimbang aktual dan poin telah dikreditkan ke saldo akun Anda.",
          badgeColor: "bg-[#eff4ff] text-[#006c49] border-[#adedd3]",
          icon: "verified",
        };
      case "pending":
        return {
          title: "Menunggu Penimbangan Fisik",
          desc: "Tunjukkan kode tiket ini ke petugas drop point atau kurir saat penyerahan sampah.",
          badgeColor: "bg-[#fff8e1] text-[#92400e] border-[#fde68a]",
          icon: "schedule",
        };
      case "rejected":
        const isScheduleExpired =
          tx.isExpired || (tx.notes || "").toLowerCase().includes("melewati batas");
        return {
          title: isScheduleExpired ? "Penjemputan Ditolak (Kedaluwarsa)" : "Setoran Ditolak",
          desc:
            tx.notes ||
            (isScheduleExpired
              ? "Penjemputan otomatis dibatalkan/ditolak karena telah melewati batas jadwal waktu yang ditentukan tanpa penyerahan limbah."
              : "Material sampah tidak memenuhi kriteria penerimaan daur ulang ReBrew."),
          badgeColor: "bg-[#ffdad6]/60 text-[#ba1a1a] border-[#ffdad6]",
          icon: isScheduleExpired ? "timer_off" : "cancel",
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-[#bbcabf]/40 overflow-hidden animate-fade-in my-8">
        {/* Header with gradient pattern */}
        <div className="relative bg-gradient-to-br from-[#006c49] to-[#2b6954] p-6 text-white">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            title="Tutup"
          >
            <GoogleIcon name="close" size={18} />
          </button>

          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#006c49] shadow-sm">
              <GoogleIcon name="qr_code_2" size={30} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest text-[#6ffbbe] font-bold">
                  Detail Tiket Setoran
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <h2 className="text-xl font-black font-mono tracking-wider text-white">
                  {tx.id}
                </h2>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="flex items-center gap-1 text-[11px] font-semibold bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded-md transition-colors"
                >
                  <GoogleIcon name={isCopied ? "check" : "content_copy"} size={13} />
                  <span>{isCopied ? "Disalin!" : "Salin"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex flex-col gap-5 max-h-[70vh] overflow-y-auto">
          {/* Status Alert Banner */}
          <div className={`flex items-start gap-3 p-3.5 rounded-2xl border ${statusInfo.badgeColor}`}>
            <GoogleIcon name={statusInfo.icon} size={22} className="shrink-0 mt-0.5" filled />
            <div>
              <div className="text-xs font-bold">{statusInfo.title}</div>
              <div className="text-xs mt-0.5 leading-relaxed opacity-90">{statusInfo.desc}</div>
            </div>
          </div>

          {/* Stepper Timeline for Lifecycle */}
          <div className="flex flex-col gap-2 bg-[#f8f9ff] border border-[#bbcabf]/30 rounded-2xl p-4">
            <span className="text-xs font-bold text-[#0b1c30]">Alur Verifikasi Setoran:</span>
            <div className="grid grid-cols-3 gap-2 text-center text-[11px] pt-2">
              <div className="flex flex-col items-center">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#006c49] text-white text-xs font-bold mb-1">
                  ✓
                </div>
                <span className="font-bold text-[#0b1c30]">1. Dibuat</span>
                <span className="text-[10px] text-[#6c7a71]">{tx.date}</span>
              </div>

              <div className="flex flex-col items-center">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold mb-1 ${
                    tx.status !== "rejected" ? "bg-[#006c49] text-white" : "bg-[#ba1a1a] text-white"
                  }`}
                >
                  {tx.status === "rejected" ? "✕" : "✓"}
                </div>
                <span className="font-bold text-[#0b1c30]">
                  {tx.method === "drop_point" ? "2. Drop Point" : "2. Dijemput"}
                </span>
                <span className="text-[10px] text-[#6c7a71]">Diserahkan</span>
              </div>

              <div className="flex flex-col items-center">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold mb-1 ${
                    tx.status === "confirmed"
                      ? "bg-[#006c49] text-white"
                      : tx.status === "rejected"
                      ? "bg-[#ba1a1a] text-white"
                      : "bg-[#bbcabf] text-white"
                  }`}
                >
                  {tx.status === "confirmed" ? "✓" : tx.status === "rejected" ? "✕" : "3"}
                </div>
                <span className="font-bold text-[#0b1c30]">3. Poin Masuk</span>
                <span className="text-[10px] text-[#6c7a71]">
                  {tx.status === "confirmed" ? "Selesai" : tx.status === "rejected" ? "Batal" : "Menunggu"}
                </span>
              </div>
            </div>
          </div>

          {/* Rincian Transaksi */}
          <div className="flex flex-col gap-2.5 text-xs">
            <span className="font-bold text-[#0b1c30] text-xs uppercase tracking-wider">
              Rincian Material & Penimbangan
            </span>

            <div className="divide-y divide-[#bbcabf]/20 rounded-2xl border border-[#bbcabf]/30 bg-white p-3.5">
              <div className="flex justify-between py-2">
                <span className="text-[#6c7a71]">Jenis Material</span>
                <span className="font-bold text-[#0b1c30] flex items-center gap-1.5">
                  <GoogleIcon name={categoryInfo.icon} size={15} className="text-[#006c49]" />
                  {tx.material}
                </span>
              </div>

              <div className="flex justify-between py-2">
                <span className="text-[#6c7a71]">Berat Aktual (Ditimbang)</span>
                <span className="font-black text-[#0b1c30] text-sm">{tx.weightKg} kg</span>
              </div>

              <div className="flex justify-between py-2">
                <span className="text-[#6c7a71]">Poin Didapat</span>
                <span className="font-extrabold text-[#006c49] text-sm">+{tx.pointsEarned} Poin</span>
              </div>

              <div className="flex justify-between py-2">
                <span className="text-[#6c7a71]">Reduksi Emisi CO₂</span>
                <span className="font-bold text-[#306d58]">{tx.co2SavedKg} kg CO₂e</span>
              </div>

              <div className="flex justify-between py-2">
                <span className="text-[#6c7a71]">Metode Pengumpulan</span>
                <span className="font-semibold text-[#0b1c30]">
                  {tx.method === "drop_point" ? "Drop Point Mandiri" : "Dijemput Armada (-15%)"}
                </span>
              </div>

              {tx.dropPointName && (
                <div className="flex justify-between py-2">
                  <span className="text-[#6c7a71]">Lokasi Drop Point</span>
                  <span className="font-medium text-[#0b1c30] text-right max-w-[220px]">
                    {tx.dropPointName}
                  </span>
                </div>
              )}

              {tx.pickupAddress && (
                <div className="flex justify-between py-2">
                  <span className="text-[#6c7a71]">Alamat Penjemputan</span>
                  <span className="font-medium text-[#0b1c30] text-right max-w-[220px]">
                    {tx.pickupAddress}
                  </span>
                </div>
              )}

              {tx.scaleModel && (
                <div className="flex justify-between py-2">
                  <span className="text-[#6c7a71]">Perangkat Penimbang</span>
                  <span className="font-mono text-[#006c49] font-medium">{tx.scaleModel}</span>
                </div>
              )}

              {tx.verifiedAt && (
                <div className="flex justify-between py-2">
                  <span className="text-[#6c7a71]">Waktu Verifikasi</span>
                  <span className="font-medium text-[#0b1c30]">{tx.verifiedAt}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions (Disembunyikan saat Cetak / Simpan PDF) */}
        <div className="flex items-center gap-3 p-5 bg-[#f8f9ff] border-t border-[#bbcabf]/30 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-[#bbcabf]/40 text-xs font-bold text-[#0b1c30] hover:bg-white transition-colors cursor-pointer"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex-1 py-3 rounded-xl bg-[#006c49] text-white text-xs font-bold hover:bg-[#2b6954] transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
          >
            <GoogleIcon name="print" size={16} />
            <span>Cetak / Simpan Tiket</span>
          </button>
        </div>
      </div>
    </div>
  );
};

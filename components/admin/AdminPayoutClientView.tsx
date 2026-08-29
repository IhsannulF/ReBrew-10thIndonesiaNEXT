"use client";

import React, { useState } from "react";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import { approvePayoutAction, rejectPayoutAction } from "@/app/actions/payouts";

export interface AdminPayoutItem {
  id: string;
  code: string;
  cafeName: string;
  userEmail?: string;
  amountRupiah: number;
  pointsDeducted: number;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  status: "processing" | "completed" | "failed" | "pending";
  requestedAt: string;
}

interface AdminPayoutClientViewProps {
  initialPayouts: AdminPayoutItem[];
}

export const AdminPayoutClientView: React.FC<AdminPayoutClientViewProps> = ({
  initialPayouts,
}) => {
  const [payouts, setPayouts] = useState<AdminPayoutItem[]>(initialPayouts);
  const [filterTab, setFilterTab] = useState<"all" | "processing" | "completed" | "failed">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reject Modal State
  const [selectedRejectPayout, setSelectedRejectPayout] = useState<AdminPayoutItem | null>(null);
  const [rejectReason, setRejectReason] = useState("Nomor rekening atau nama pemilik tidak sesuai");

  // Handle Approve Payout
  const handleApprove = async (id: string, code: string, cafeName: string, amount: number) => {
    if (isActionLoading) return;
    setIsActionLoading(true);
    setErrorMessage(null);

    try {
      const res = await approvePayoutAction(id);
      if (res.success) {
        setPayouts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: "completed" } : p))
        );
        setToastMessage(
          `Pencairan ${code} (${cafeName}) sebesar Rp ${amount.toLocaleString("id-ID")} berhasil disetujui & transfer dikonfirmasi!`
        );
        setTimeout(() => setToastMessage(null), 5000);
      } else {
        setErrorMessage(res.error || "Gagal mengonfirmasi approval payout.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Terjadi kesalahan saat approval.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle Reject Payout
  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRejectPayout || isActionLoading) return;

    setIsActionLoading(true);
    setErrorMessage(null);

    try {
      const res = await rejectPayoutAction(selectedRejectPayout.id, rejectReason);
      if (res.success) {
        setPayouts((prev) =>
          prev.map((p) =>
            p.id === selectedRejectPayout.id ? { ...p, status: "failed" } : p
          )
        );
        setToastMessage(
          `Permintaan pencairan ${selectedRejectPayout.code} ditolak. Poin sebesar ${selectedRejectPayout.pointsDeducted.toLocaleString("id-ID")} pt telah dikembalikan ke saldo kafe.`
        );
        setSelectedRejectPayout(null);
        setTimeout(() => setToastMessage(null), 5000);
      } else {
        setErrorMessage(res.error || "Gagal membatalkan payout.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Terjadi kesalahan saat membatalkan payout.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Filtered List
  const filteredPayouts = payouts.filter((p) => {
    if (filterTab !== "all") {
      if (filterTab === "processing" && p.status !== "processing" && p.status !== "pending") return false;
      if (filterTab === "completed" && p.status !== "completed") return false;
      if (filterTab === "failed" && p.status !== "failed") return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        p.code.toLowerCase().includes(q) ||
        p.cafeName.toLowerCase().includes(q) ||
        p.bankName.toLowerCase().includes(q) ||
        p.accountNumber.toLowerCase().includes(q) ||
        p.accountHolder.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Calculate Metrics
  const totalRequests = payouts.length;
  const pendingCount = payouts.filter((p) => p.status === "processing" || p.status === "pending").length;
  const completedTotalRupiah = payouts
    .filter((p) => p.status === "completed")
    .reduce((acc, p) => acc + p.amountRupiah, 0);
  const completedTotalPoints = payouts
    .filter((p) => p.status === "completed")
    .reduce((acc, p) => acc + p.pointsDeducted, 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#bbcabf]/30 pb-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-[#006c49] font-semibold mb-0.5">
            <span>Admin</span>
            <span>/</span>
            <span className="text-[#6c7a71]">Approval Payout</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0b1c30]">
            Approval Pencairan Saldo & Payout Kas Mitra Kafe
          </h1>
          <p className="text-xs text-[#6c7a71] mt-0.5">
            Verifikasi dan otorisasi transfer pencairan saldo poin ke rekening bank atau e-wallet mitra kafe.
          </p>
        </div>
      </div>

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-[#f0fdf4] border border-[#006c49]/30 text-xs text-[#006c49] font-bold flex items-center gap-2.5 shadow-xs animate-fade-in">
          <GoogleIcon name="check_circle" size={20} filled />
          <span>{toastMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-[#fef2f2] border border-[#ef4444]/30 text-xs text-[#b91c1c] font-bold flex items-center gap-2.5 shadow-xs animate-fade-in">
          <GoogleIcon name="error" size={20} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#bbcabf]/30 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6c7a71]">Total Permintaan</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eff4ff] text-[#006c49]">
              <GoogleIcon name="receipt_long" size={18} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-[#0b1c30]">{totalRequests} Request</div>
            <div className="text-[11px] text-[#6c7a71] font-medium mt-0.5">Semua riwayat pencairan</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#bbcabf]/30 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6c7a71]">Menunggu Transfer</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#fffdf5] text-[#d97706]">
              <GoogleIcon name="hourglass_top" size={18} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-[#d97706]">{pendingCount} Antrean</div>
            <div className="text-[11px] text-[#92400e] font-medium mt-0.5">Memerlukan otorisasi admin</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#bbcabf]/30 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6c7a71]">Total Dana Ditransfer</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f0fdf4] text-[#006c49]">
              <GoogleIcon name="payments" size={18} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-[#006c49]">
              Rp {completedTotalRupiah.toLocaleString("id-ID")}
            </div>
            <div className="text-[11px] text-[#306d58] font-medium mt-0.5">Pencairan sukses selesai</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#bbcabf]/30 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6c7a71]">Poin Dicairkan</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eff6ff] text-[#0284c7]">
              <GoogleIcon name="monetization_on" size={18} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-[#0284c7]">
              {completedTotalPoints.toLocaleString("id-ID")} pt
            </div>
            <div className="text-[11px] text-[#0369a1] font-medium mt-0.5">Kredit poin terkonversi</div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-3xl border border-[#bbcabf]/30 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-bold text-[#0b1c30] flex items-center gap-2">
            <GoogleIcon name="account_balance" size={20} className="text-[#006c49]" />
            Daftar Permintaan Pencairan Dana Kas
          </h2>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-[#eff4ff] p-1 rounded-xl border border-[#bbcabf]/30 text-xs self-start">
            {[
              { key: "all", label: "Semua" },
              { key: "processing", label: `Menunggu (${pendingCount})` },
              { key: "completed", label: "Selesai" },
              { key: "failed", label: "Dibatalkan" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilterTab(tab.key as any)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  filterTab === tab.key
                    ? "bg-white text-[#006c49] shadow-2xs"
                    : "text-[#6c7a71] hover:text-[#0b1c30]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kode WD, nama kafe, nama pemilik, atau nomor rekening..."
            className="w-full text-xs p-2.5 pl-9 rounded-xl border border-[#bbcabf]/40 bg-white text-[#0b1c30] outline-none focus:ring-1 focus:ring-[#006c49]"
          />
          <div className="absolute left-3 top-2.5 text-[#6c7a71]">
            <GoogleIcon name="search" size={16} />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#bbcabf]/30 text-[#6c7a71] font-bold text-[11px] uppercase tracking-wider">
                <th className="pb-3 pr-4">Kode WD</th>
                <th className="pb-3 pr-4">Mitra Kafe</th>
                <th className="pb-3 pr-4">Nominal Rupiah (Poin)</th>
                <th className="pb-3 pr-4">Rekening / E-Wallet Tujuan</th>
                <th className="pb-3 pr-4">Waktu Permintaan</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 text-right">Aksi Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#bbcabf]/20">
              {filteredPayouts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-xs text-[#6c7a71]">
                    {payouts.length === 0
                      ? "Belum ada permintaan pencairan saldo kas (payout) dari mitra kafe di database."
                      : "Tidak ada permintaan payout yang sesuai dengan filter pencarian."}
                  </td>
                </tr>
              ) : (
                filteredPayouts.map((p) => {
                  const isPending = p.status === "pending" || p.status === "processing";
                  return (
                    <tr key={p.id} className="hover:bg-[#f8f9ff] transition-colors">
                      <td className="py-3.5 pr-4 font-mono font-bold text-[#006c49]">{p.code}</td>
                      <td className="py-3.5 pr-4">
                        <div className="font-bold text-[#0b1c30]">{p.cafeName}</div>
                        {p.userEmail && <div className="text-[10px] text-[#6c7a71]">{p.userEmail}</div>}
                      </td>
                      <td className="py-3.5 pr-4">
                        <div className="font-extrabold text-[#006c49]">
                          Rp {p.amountRupiah.toLocaleString("id-ID")}
                        </div>
                        <div className="text-[10px] text-[#6c7a71]">
                          -{p.pointsDeducted.toLocaleString("id-ID")} Poin
                        </div>
                      </td>
                      <td className="py-3.5 pr-4">
                        <div className="font-semibold text-[#0b1c30]">
                          {p.bankName} • {p.accountNumber}
                        </div>
                        <div className="text-[10px] text-[#6c7a71]">a/n {p.accountHolder}</div>
                      </td>
                      <td className="py-3.5 pr-4 text-[#6c7a71]">{p.requestedAt}</td>
                      <td className="py-3.5 pr-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] inline-block ${
                            isPending
                              ? "bg-amber-100 text-amber-900 border border-amber-300"
                              : p.status === "completed"
                              ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                              : "bg-red-100 text-red-900 border border-red-300"
                          }`}
                        >
                          {isPending
                            ? "Sedang Diproses (Pending)"
                            : p.status === "completed"
                            ? "Selesai Ditransfer ✓"
                            : "Dibatalkan / Ditolak ✕"}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleApprove(p.id, p.code, p.cafeName, p.amountRupiah)}
                              disabled={isActionLoading}
                              className="px-3 py-1.5 rounded-lg bg-[#006c49] text-white font-bold text-[11px] hover:bg-[#005237] transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                            >
                              Approve Transfer
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedRejectPayout(p)}
                              disabled={isActionLoading}
                              className="px-2.5 py-1.5 rounded-lg border border-red-300 text-red-700 font-bold text-[11px] hover:bg-red-50 transition-all cursor-pointer disabled:opacity-50"
                            >
                              Tolak
                            </button>
                          </div>
                        ) : p.status === "completed" ? (
                          <span className="text-[11px] text-[#006c49] font-bold flex items-center justify-end gap-1">
                            <GoogleIcon name="check_circle" size={14} filled />
                            Berhasil Ditransfer
                          </span>
                        ) : (
                          <span className="text-[11px] text-red-600 font-medium">Dibatalkan</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Tolak Permintaan Payout */}
      {selectedRejectPayout && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-[#bbcabf]/30 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#bbcabf]/20">
              <div className="flex items-center gap-2 text-red-700">
                <GoogleIcon name="cancel" size={22} />
                <h3 className="text-base font-bold text-[#0b1c30]">Tolak Permintaan Payout</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRejectPayout(null)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#6c7a71]">Kode WD:</span>
                <span className="font-mono font-bold text-[#0b1c30]">{selectedRejectPayout.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6c7a71]">Mitra Kafe:</span>
                <span className="font-bold text-[#0b1c30]">{selectedRejectPayout.cafeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6c7a71]">Nominal Rupiah:</span>
                <span className="font-extrabold text-red-700">
                  Rp {selectedRejectPayout.amountRupiah.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-red-200/60">
                <span className="text-[#6c7a71]">Poin yang Dikembalikan:</span>
                <span className="font-bold text-[#006c49]">
                  +{selectedRejectPayout.pointsDeducted.toLocaleString("id-ID")} Poin
                </span>
              </div>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#0b1c30]">Alasan Penolakan:</label>
                <input
                  type="text"
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Contoh: Nomor rekening tidak valid / tidak aktif"
                  className="w-full p-2.5 rounded-xl border border-[#bbcabf]/40 bg-white text-[#0b1c30] outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-[#bbcabf]/20">
                <button
                  type="button"
                  onClick={() => setSelectedRejectPayout(null)}
                  className="flex-1 py-2.5 rounded-xl border border-[#bbcabf]/40 text-xs font-bold text-[#0b1c30] hover:bg-gray-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isActionLoading}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isActionLoading ? "Memproses..." : "Konfirmasi Tolak"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

"use client";

import React, { useState } from "react";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import { AdminTicketItem, verifyDepositTransaction, rejectDepositTransaction } from "@/app/actions/admin";

interface AdminVerificationClientViewProps {
  initialTickets: AdminTicketItem[];
  selectedTicketCodeFromUrl?: string;
}

export const AdminVerificationClientView: React.FC<AdminVerificationClientViewProps> = ({
  initialTickets,
  selectedTicketCodeFromUrl,
}) => {
  const [tickets, setTickets] = useState<AdminTicketItem[]>(initialTickets);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "confirmed" | "rejected">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Selected ticket
  const initialSelected =
    (selectedTicketCodeFromUrl
      ? tickets.find((t) => t.ticketCode === selectedTicketCodeFromUrl || t.id === selectedTicketCodeFromUrl)
      : null) ||
    tickets.find((t) => t.status === "pending") ||
    tickets[0] ||
    null;

  const [selectedTicket, setSelectedTicket] = useState<AdminTicketItem | null>(initialSelected);
  const [inputWeight, setInputWeight] = useState<string>(
    selectedTicket?.actualWeight?.toString() || selectedTicket?.estimatedWeight.toString() || ""
  );
  const [adminNotes, setAdminNotes] = useState<string>("Kondisi sampah bersih dan terpilah.");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal Tolak Setoran
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("Kontaminasi sampah organik basah/kotor");

  const handleSelectTicket = (t: AdminTicketItem) => {
    setSelectedTicket(t);
    setInputWeight(t.actualWeight?.toString() || t.estimatedWeight.toString());
    setErrorMessage(null);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || isSubmitting) return;

    const actual = parseFloat(inputWeight);
    if (isNaN(actual) || actual <= 0) {
      setErrorMessage("Berat aktual harus berupa angka lebih dari 0 kg.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await verifyDepositTransaction({
        transactionId: selectedTicket.id,
        actualWeight: actual,
        adminNotes,
      });

      if (res.success) {
        setTickets((prev) =>
          prev.map((t) =>
            t.id === selectedTicket.id
              ? {
                  ...t,
                  actualWeight: actual,
                  status: "confirmed",
                  notes: adminNotes,
                }
              : t
          )
        );

        setSelectedTicket((prev) =>
          prev ? { ...prev, actualWeight: actual, status: "confirmed" } : null
        );

        setSuccessToast(
          `Tiket ${selectedTicket.ticketCode} (${selectedTicket.cafeName}) berhasil diverifikasi! +${res.pointsEarned?.toLocaleString("id-ID")} Poin telah diterbitkan.`
        );

        setTimeout(() => setSuccessToast(null), 5000);
      } else {
        setErrorMessage(res.error || "Gagal memverifikasi tiket.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Terjadi kesalahan sistem saat verifikasi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedTicket || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await rejectDepositTransaction({
        transactionId: selectedTicket.id,
        reason: rejectionReason,
      });

      if (res.success) {
        setTickets((prev) =>
          prev.map((t) =>
            t.id === selectedTicket.id
              ? { ...t, status: "rejected", notes: rejectionReason }
              : t
          )
        );

        setSelectedTicket((prev) =>
          prev ? { ...prev, status: "rejected", notes: rejectionReason } : null
        );

        setIsRejectModalOpen(false);
        setSuccessToast(`Tiket ${selectedTicket.ticketCode} telah ditolak.`);
        setTimeout(() => setSuccessToast(null), 4000);
      } else {
        setErrorMessage(res.error || "Gagal menolak tiket.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Terjadi kesalahan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered tickets
  const filteredTickets = tickets.filter((t) => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.ticketCode.toLowerCase().includes(q) ||
        t.cafeName.toLowerCase().includes(q) ||
        t.cafeCity.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pendingCount = tickets.filter((t) => t.status === "pending").length;
  const verifiedCount = tickets.filter((t) => t.status === "confirmed").length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#bbcabf]/30 pb-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-[#006c49] font-semibold mb-0.5">
            <span>Admin</span>
            <span>/</span>
            <span className="text-[#6c7a71]">Verifikasi</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0b1c30]">
            Verifikasi & Penimbangan Aktual Setor Sampah
          </h1>
          <p className="text-xs text-[#6c7a71] mt-0.5">
            Timbang fisik limbah kafe di Micro-Hub Jakarta Selatan (Melawai), sesuaikan berat riil, dan terbitkan poin reward ke saldo kafe.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
            <GoogleIcon name="pending" size={15} />
            <span>{pendingCount} Tiket Menunggu</span>
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
            <GoogleIcon name="check_circle" size={15} />
            <span>{verifiedCount} Terverifikasi</span>
          </span>
        </div>
      </div>

      {/* Success / Error Alerts */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-[#f0fdf4] border border-[#006c49]/30 text-xs text-[#006c49] font-bold flex items-center gap-2.5 animate-fade-in shadow-xs">
          <GoogleIcon name="check_circle" size={20} filled />
          <span>{successToast}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-[#ffdad6] border border-[#ffb4ab] text-xs text-[#93000a] font-bold flex items-center gap-2.5 animate-fade-in shadow-xs">
          <GoogleIcon name="error" size={20} filled />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Verification Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Tickets Queue List (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <h2 className="text-sm font-bold text-[#0b1c30]">
              Daftar Tiket Masuk ({filteredTickets.length})
            </h2>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-[#eff4ff] p-1 rounded-xl border border-[#bbcabf]/30 self-start">
              {[
                { key: "all", label: "Semua" },
                { key: "pending", label: "Menunggu" },
                { key: "confirmed", label: "Selesai" },
                { key: "rejected", label: "Ditolak" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setStatusFilter(tab.key as any)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    statusFilter === tab.key
                      ? "bg-white text-[#006c49] shadow-2xs"
                      : "text-[#6c7a71] hover:text-[#0b1c30]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kode tiket, nama kafe, atau kota..."
              className="w-full text-xs p-2.5 pl-9 rounded-xl border border-[#bbcabf]/40 bg-white text-[#0b1c30] outline-none focus:ring-1 focus:ring-[#006c49]"
            />
            <div className="absolute left-3 top-2.5 text-[#6c7a71]">
              <GoogleIcon name="search" size={16} />
            </div>
          </div>

          {/* Ticket Items List */}
          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {filteredTickets.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white border border-[#bbcabf]/30 text-center text-xs text-[#6c7a71]">
                Tidak ada tiket yang cocok dengan filter.
              </div>
            ) : (
              filteredTickets.map((t) => {
                const isSelected = selectedTicket?.id === t.id;
                const isPending = t.status === "pending";
                const isConfirmed = t.status === "confirmed";
                const isRejected = t.status === "rejected";

                return (
                  <div
                    key={t.id}
                    onClick={() => handleSelectTicket(t)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-white border-[#006c49] shadow-md ring-2 ring-[#006c49]/20"
                        : "bg-white border-[#bbcabf]/30 hover:border-[#bbcabf]/60 hover:bg-[#f8f9ff]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#006c49] bg-[#eff4ff] px-2.5 py-0.5 rounded-md border border-[#adedd3]">
                          {t.ticketCode}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isPending
                              ? "bg-amber-100 text-amber-900 border border-amber-200"
                              : isConfirmed
                              ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                              : "bg-red-100 text-red-900 border border-red-200"
                          }`}
                        >
                          {isPending
                            ? "Menunggu Timbang"
                            : isConfirmed
                            ? "Terverifikasi ✓"
                            : "Ditolak ✕"}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#6c7a71]">{t.createdAt}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-[#0b1c30]">{t.cafeName}</h3>
                        <p className="text-xs text-[#6c7a71] mt-0.5 flex items-center gap-1.5">
                          <span className="font-semibold text-[#006c49]">{t.category}</span>
                          <span>•</span>
                          <span>{t.method}</span>
                          <span>•</span>
                          <span>{t.cafeCity}</span>
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="text-[11px] text-[#6c7a71]">
                          {isConfirmed ? "Berat Aktual:" : "Est. Berat:"}
                        </div>
                        <div className="text-sm font-extrabold text-[#0b1c30]">
                          {isConfirmed ? t.actualWeight : t.estimatedWeight} kg
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Penimbangan Workspace (5 cols) */}
        <div className="lg:col-span-5">
          {selectedTicket ? (
            <div className="rounded-3xl border border-[#bbcabf]/30 bg-white p-5 sm:p-6 shadow-xs sticky top-20">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#bbcabf]/20">
                <div>
                  <span className="text-[10px] font-bold text-[#6c7a71] uppercase tracking-wider block">
                    Form QC & Verifikasi Timbangan
                  </span>
                  <h3 className="text-base font-bold text-[#0b1c30] flex items-center gap-1.5">
                    <span className="font-mono text-[#006c49]">{selectedTicket.ticketCode}</span>
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-[#eff4ff] text-[#006c49] text-xs font-bold border border-[#adedd3]">
                  {selectedTicket.method}
                </span>
              </div>

              <form onSubmit={handleVerify} className="space-y-4 text-xs">
                {/* Cafe Info Summary */}
                <div className="p-3.5 rounded-2xl bg-[#f8f9ff] border border-[#bbcabf]/30 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-[#6c7a71]">Mitra Kafe:</span>
                    <span className="font-bold text-[#0b1c30]">{selectedTicket.cafeName} ({selectedTicket.cafeCity})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6c7a71]">Kategori Material:</span>
                    <span className="font-semibold text-[#006c49]">{selectedTicket.category}</span>
                  </div>
                  {selectedTicket.pickupAddress && (
                    <div className="flex justify-between">
                      <span className="text-[#6c7a71]">Alamat Jemput:</span>
                      <span className="font-medium text-[#0b1c30] text-right max-w-[200px]">{selectedTicket.pickupAddress}</span>
                    </div>
                  )}
                  {selectedTicket.notes && (
                    <div className="flex justify-between pt-1 border-t border-[#bbcabf]/20">
                      <span className="text-[#6c7a71]">Catatan Setoran:</span>
                      <span className="font-medium text-[#3c4a42] text-right max-w-[200px] italic">{selectedTicket.notes}</span>
                    </div>
                  )}
                </div>

                {/* Input Berat Aktual Timbangan Fisik */}
                <div className="space-y-1.5">
                  <label className="font-bold text-[#0b1c30] block flex items-center justify-between">
                    <span>Berat Aktual Timbangan Fisik (kg):</span>
                    <span className="text-[10px] text-[#6c7a71]">Est. Awal: {selectedTicket.estimatedWeight} kg</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0.1"
                      required
                      disabled={selectedTicket.status !== "pending" || isSubmitting}
                      value={inputWeight}
                      onChange={(e) => setInputWeight(e.target.value)}
                      className="w-full text-lg font-extrabold p-3 rounded-xl border border-[#bbcabf]/50 bg-white text-[#006c49] focus:ring-2 focus:ring-[#006c49] outline-none pr-10 disabled:bg-[#f8f9ff]"
                      placeholder="Contoh: 7.50"
                    />
                    <span className="absolute right-3 top-3.5 text-xs font-bold text-[#6c7a71]">
                      kg
                    </span>
                  </div>
                </div>

                {/* Live Points Calculation Preview */}
                <div className="p-3.5 rounded-2xl bg-[#f0fdf4] border border-[#006c49]/30 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-bold text-[#006c49] uppercase tracking-wider block">
                      Total Reward Saldo Kafe:
                    </span>
                    <span className="text-[11px] text-[#306d58]">
                      (Rate: {selectedTicket.pointsRatePerKg} pt/kg)
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-extrabold text-[#006c49]">
                      +{Math.round((parseFloat(inputWeight) || 0) * selectedTicket.pointsRatePerKg).toLocaleString("id-ID")} Poin
                    </div>
                    <div className="text-[10px] font-semibold text-[#306d58]">
                      ≈ Rp {Math.round((parseFloat(inputWeight) || 0) * selectedTicket.pointsRatePerKg).toLocaleString("id-ID")}
                    </div>
                  </div>
                </div>

                {/* Admin Verification Notes */}
                <div className="space-y-1">
                  <label className="font-semibold text-[#3c4a42]">Catatan Quality Control (QC):</label>
                  <textarea
                    rows={2}
                    disabled={selectedTicket.status !== "pending" || isSubmitting}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#bbcabf]/40 bg-white text-[#0b1c30] outline-none disabled:bg-[#f8f9ff]"
                    placeholder="Catatan kebersihan material atau kondisi sortir..."
                  />
                </div>

                {/* Action Buttons */}
                {selectedTicket.status === "pending" ? (
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsRejectModalOpen(true)}
                      disabled={isSubmitting}
                      className="px-4 py-3 rounded-xl border border-red-300 text-red-700 hover:bg-red-50 text-xs font-bold transition-all cursor-pointer"
                    >
                      Tolak
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-3 rounded-xl bg-[#006c49] text-white font-extrabold text-xs shadow-sm hover:bg-[#005237] active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <GoogleIcon name="verified" size={16} />
                      <span>{isSubmitting ? "Memproses..." : "Konfirmasi & Terbitkan Poin"}</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 pt-2">
                    <div
                      className={`p-3 rounded-xl text-center text-xs font-bold border ${
                        selectedTicket.status === "confirmed"
                          ? "bg-[#dcfce7] text-[#15803d] border-[#86efac]"
                          : "bg-[#fee2e2] text-[#991b1b] border-[#fca5a5]"
                      }`}
                    >
                      {selectedTicket.status === "confirmed"
                        ? "✓ Tiket Ini Telah Diverifikasi"
                        : "✕ Tiket Ini Ditolak"}
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2.5 rounded-xl border border-[#006c49]/40 text-[#006c49] bg-[#eff4ff] hover:bg-[#dbeafe] font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <GoogleIcon name="sync" size={15} />
                      <span>{isSubmitting ? "Menyinkronkan..." : "Sinkronkan & Terbitkan Ulang Poin Kafe"}</span>
                    </button>
                  </div>
                )}
              </form>
            </div>
          ) : (
            <div className="p-8 rounded-3xl border border-[#bbcabf]/30 bg-white text-center text-[#6c7a71] text-xs">
              Pilih tiket di sebelah kiri untuk memulai penimbangan fisik.
            </div>
          )}
        </div>
      </div>

      {/* Modal Tolak Tiket */}
      {isRejectModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-[#bbcabf]/30 space-y-4 animate-fade-in">
            <div className="flex items-center gap-3 text-red-600">
              <GoogleIcon name="warning" size={24} filled />
              <h3 className="text-base font-bold text-[#0b1c30]">Konfirmasi Penolakan Setoran</h3>
            </div>

            <p className="text-xs text-[#6c7a71] leading-relaxed">
              Anda akan menolak tiket <strong>{selectedTicket?.ticketCode}</strong> dari kafe{" "}
              <strong>{selectedTicket?.cafeName}</strong>. Poin tidak akan diterbitkan ke akun mitra.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0b1c30]">Alasan Penolakan:</label>
              <select
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-[#bbcabf]/40 bg-white text-[#0b1c30] outline-none"
              >
                <option value="Kontaminasi sampah organik basah/kotor">
                  Kontaminasi sampah organik basah/kotor
                </option>
                <option value="Material tidak sesuai jenis yang didaftarkan">
                  Material tidak sesuai jenis yang didaftarkan
                </option>
                <option value="Sampah plastik bercampur bahan berbahaya/B3">
                  Sampah plastik bercampur bahan berbahaya/B3
                </option>
                <option value="Jumlah berat di bawah toleransi minimal">
                  Jumlah berat di bawah toleransi minimal
                </option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#bbcabf]/40 text-xs font-bold text-[#0b1c30] hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 shadow-sm"
              >
                {isSubmitting ? "Memproses..." : "Tolak Setoran"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

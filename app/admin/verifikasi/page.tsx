"use client";

import React, { useState } from "react";
import { GoogleIcon } from "@/components/ui/GoogleIcon";

interface VerificationTicket {
  id: string;
  ticketCode: string;
  cafeName: string;
  cafeCity: string;
  method: "Drop Point" | "Dijemput";
  category: string;
  estimatedWeight: number;
  actualWeight: number | null;
  pointsRatePerKg: number;
  offtakerPricePerKg: number;
  status: "pending" | "verified" | "rejected";
  createdAt: string;
}

export default function AdminVerifikasiPage() {
  const [tickets, setTickets] = useState<VerificationTicket[]>([
    {
      id: "1",
      ticketCode: "RB-892104",
      cafeName: "Kopi Selamat Cafe",
      cafeCity: "Gubeng, Surabaya",
      method: "Drop Point",
      category: "Plastic Cup (PP/PET)",
      estimatedWeight: 7.5,
      actualWeight: 7.5,
      pointsRatePerKg: 1750,
      offtakerPricePerKg: 5000,
      status: "pending",
      createdAt: "Hari ini, 10:45 WIB",
    },
    {
      id: "2",
      ticketCode: "RB-763412",
      cafeName: "Brew & Co Manyar",
      cafeCity: "Manyar, Surabaya",
      method: "Dijemput",
      category: "Plastic Cup + Botol PET",
      estimatedWeight: 5.0,
      actualWeight: 5.2,
      pointsRatePerKg: 1750,
      offtakerPricePerKg: 5000,
      status: "pending",
      createdAt: "Hari ini, 09:15 WIB",
    },
    {
      id: "3",
      ticketCode: "RB-541908",
      cafeName: "Kedai Kopi Titik Koma",
      cafeCity: "Rungkut, Surabaya",
      method: "Drop Point",
      category: "Ampas Kopi (Spent Grounds)",
      estimatedWeight: 12.0,
      actualWeight: 12.0,
      pointsRatePerKg: 1050,
      offtakerPricePerKg: 3000,
      status: "pending",
      createdAt: "Kemarin, 16:30 WIB",
    },
    {
      id: "4",
      ticketCode: "RB-110294",
      cafeName: "Urban Coffee Lab",
      cafeCity: "Tegalsari, Surabaya",
      method: "Drop Point",
      category: "Kaleng Aluminium",
      estimatedWeight: 4.0,
      actualWeight: 4.1,
      pointsRatePerKg: 4900,
      offtakerPricePerKg: 14000,
      status: "verified",
      createdAt: "Kemarin, 14:00 WIB",
    },
  ]);

  const [selectedTicket, setSelectedTicket] = useState<VerificationTicket | null>(tickets[0]);
  const [inputWeight, setInputWeight] = useState<string>(selectedTicket?.estimatedWeight.toString() || "");
  const [adminNotes, setAdminNotes] = useState<string>("Kondisi sampah bersih dan terpilah.");
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const handleSelectTicket = (t: VerificationTicket) => {
    setSelectedTicket(t);
    setInputWeight(t.actualWeight?.toString() || t.estimatedWeight.toString());
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    const actual = parseFloat(inputWeight) || selectedTicket.estimatedWeight;
    const finalPts = Math.round(actual * selectedTicket.pointsRatePerKg);

    setTickets((prev) =>
      prev.map((t) =>
        t.id === selectedTicket.id
          ? { ...t, actualWeight: actual, status: "verified" }
          : t
      )
    );

    setSuccessToast(
      `Tiket ${selectedTicket.ticketCode} (${selectedTicket.cafeName}) berhasil diverifikasi! Berat aktual: ${actual} kg (+${finalPts.toLocaleString("id-ID")} Poin).`
    );

    setTimeout(() => {
      setSuccessToast(null);
    }, 4000);
  };

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
            Timbang fisik sampah di Micro-Hub Surabaya Timur, sesuaikan berat riil, dan terbitkan poin saldo ke akun kafe.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-1.5">
            <GoogleIcon name="pending" size={15} />
            <span>{tickets.filter((t) => t.status === "pending").length} Tiket Menunggu</span>
          </span>
        </div>
      </div>

      {/* Success Toast */}
      {successToast && (
        <div className="p-3.5 rounded-2xl bg-[#f0fdf4] border border-[#006c49]/30 text-xs text-[#006c49] font-semibold flex items-center gap-2 animate-fade-in shadow-xs">
          <GoogleIcon name="check_circle" size={18} />
          <span>{successToast}</span>
        </div>
      )}

      {/* Main Verification Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Tickets Queue List (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <h2 className="text-sm font-bold text-[#0b1c30]">Daftar Tiket Masuk</h2>

          <div className="space-y-2.5">
            {tickets.map((t) => {
              const isSelected = selectedTicket?.id === t.id;
              const isPending = t.status === "pending";

              return (
                <div
                  key={t.id}
                  onClick={() => handleSelectTicket(t)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-white border-[#006c49] shadow-sm ring-2 ring-[#006c49]/20"
                      : "bg-white border-[#bbcabf]/30 hover:border-[#bbcabf]/60 hover:bg-[#f8f9ff]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-[#006c49] bg-[#eff4ff] px-2 py-0.5 rounded-md">
                        {t.ticketCode}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isPending
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {isPending ? "Menunggu Verifikasi" : "Terverifikasi ✓"}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#6c7a71]">{t.createdAt}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-[#0b1c30]">{t.cafeName}</h3>
                      <p className="text-xs text-[#6c7a71]">{t.category}</p>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-[#6c7a71]">Est. Berat:</div>
                      <div className="text-sm font-extrabold text-[#0b1c30]">
                        {t.estimatedWeight} kg
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Penimbangan Workspace (5 cols) */}
        <div className="lg:col-span-5">
          {selectedTicket ? (
            <div className="rounded-3xl border border-[#bbcabf]/30 bg-white p-5 sm:p-6 shadow-xs sticky top-20">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#bbcabf]/20">
                <div>
                  <span className="text-[10px] font-bold text-[#6c7a71] uppercase tracking-wider">
                    Form Penimbangan
                  </span>
                  <h3 className="text-base font-bold text-[#0b1c30]">
                    {selectedTicket.ticketCode}
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-[#eff4ff] text-[#006c49] text-xs font-bold">
                  {selectedTicket.method}
                </span>
              </div>

              <form onSubmit={handleVerify} className="space-y-4 text-xs">
                {/* Cafe Info */}
                <div className="p-3 rounded-xl bg-[#f8f9ff] border border-[#bbcabf]/30 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[#6c7a71]">Nama Mitra Kafe:</span>
                    <span className="font-bold text-[#0b1c30]">{selectedTicket.cafeName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6c7a71]">Kategori Sampah:</span>
                    <span className="font-semibold text-[#006c49]">{selectedTicket.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6c7a71]">Harga Offtaker:</span>
                    <span className="font-semibold text-[#0b1c30]">Rp {selectedTicket.offtakerPricePerKg.toLocaleString("id-ID")}/kg</span>
                  </div>
                </div>

                {/* Input Berat Aktual Timbangan Fisik */}
                <div className="space-y-1.5">
                  <label className="font-bold text-[#0b1c30] block">
                    Berat Aktual Timbangan Fisik (kg):
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        step="0.01"
                        min="0.1"
                        required
                        value={inputWeight}
                        onChange={(e) => setInputWeight(e.target.value)}
                        className="w-full text-base font-extrabold p-3 rounded-xl border border-[#bbcabf]/50 bg-white text-[#006c49] focus:ring-2 focus:ring-[#006c49] outline-none pl-3 pr-10"
                        placeholder="Contoh: 7.50"
                      />
                      <span className="absolute right-3 top-3.5 text-xs font-bold text-[#6c7a71]">
                        kg
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-[#6c7a71]">
                    Estimasi awal kafe: {selectedTicket.estimatedWeight} kg
                  </span>
                </div>

                {/* Live Points Calculation Preview */}
                <div className="p-3.5 rounded-xl bg-[#f0fdf4] border border-[#006c49]/30 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-bold text-[#006c49] uppercase tracking-wider block">
                      Total Poin yang Diterbitkan:
                    </span>
                    <span className="text-[11px] text-[#306d58]">
                      (1 Poin = Rp 1 Saldo Kafe)
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-extrabold text-[#006c49]">
                      +{Math.round((parseFloat(inputWeight) || 0) * selectedTicket.pointsRatePerKg).toLocaleString("id-ID")} pt
                    </div>
                    <div className="text-[10px] font-semibold text-[#306d58]">
                      ≈ Rp {Math.round((parseFloat(inputWeight) || 0) * selectedTicket.pointsRatePerKg).toLocaleString("id-ID")}
                    </div>
                  </div>
                </div>

                {/* Admin Verification Notes */}
                <div className="space-y-1">
                  <label className="font-medium text-[#3c4a42]">Catatan Verifikasi Admin:</label>
                  <textarea
                    rows={2}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#bbcabf]/40 bg-white text-[#0b1c30] outline-none"
                    placeholder="Catatan kebersihan atau kondisi sorting..."
                  />
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={selectedTicket.status === "verified"}
                  className="w-full py-3.5 rounded-xl bg-[#006c49] text-white font-extrabold text-sm shadow-md hover:bg-[#005237] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  <GoogleIcon name="verified" size={18} />
                  <span>
                    {selectedTicket.status === "verified"
                      ? "Sudah Terverifikasi"
                      : "Konfirmasi & Terbitkan Poin"}
                  </span>
                </button>
              </form>
            </div>
          ) : (
            <div className="p-8 rounded-3xl border border-[#bbcabf]/30 bg-white text-center text-[#6c7a71] text-xs">
              Pilih tiket di sebelah kiri untuk memulai penimbangan fisik.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

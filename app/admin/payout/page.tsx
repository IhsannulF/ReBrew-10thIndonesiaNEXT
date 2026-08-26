"use client";

import React, { useState } from "react";
import { GoogleIcon } from "@/components/ui/GoogleIcon";

export default function AdminPayoutPage() {
  const [payouts, setPayouts] = useState([
    {
      id: "po-1",
      code: "WD-2026-0891",
      cafeName: "Kopi Selamat Cafe",
      amountRupiah: 350000,
      pointsDeducted: 350000,
      bankName: "BCA",
      accountNumber: "8291048192",
      accountHolder: "Satrio Alif",
      status: "pending",
      requestedAt: "Hari ini, 09:30 WIB",
    },
    {
      id: "po-2",
      code: "WD-2026-0890",
      cafeName: "Kedai Kopi Titik Koma",
      amountRupiah: 200000,
      pointsDeducted: 200000,
      bankName: "Mandiri",
      accountNumber: "1420019284712",
      accountHolder: "Dimas Pratama",
      status: "pending",
      requestedAt: "Kemarin, 15:40 WIB",
    },
    {
      id: "po-3",
      code: "WD-2026-0888",
      cafeName: "Brew & Co Manyar",
      amountRupiah: 150000,
      pointsDeducted: 150000,
      bankName: "GoPay / E-Wallet",
      accountNumber: "081298765432",
      accountHolder: "Rian Hidayat",
      status: "completed",
      requestedAt: "24 Feb 2026",
    },
  ]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleApprove = (id: string) => {
    setPayouts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "completed" } : p))
    );
    setToastMessage("Pencairan dana berhasil disetujui & transfer dikonfirmasi!");
    setTimeout(() => setToastMessage(null), 4000);
  };

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
            Approval Pencairan Saldo & Payout Mitra Kafe
          </h1>
          <p className="text-xs text-[#6c7a71] mt-0.5">
            Verifikasi permintaan konversi poin ke rupiah rekening bank/e-wallet mitra kafe.
          </p>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-[#f0fdf4] border border-[#006c49]/30 text-xs text-[#006c49] font-semibold flex items-center gap-2 shadow-xs animate-fade-in">
          <GoogleIcon name="check_circle" size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Table of Payout Requests */}
      <div className="rounded-3xl border border-[#bbcabf]/30 bg-white p-5 sm:p-6 shadow-2xs">
        <h2 className="text-base font-bold text-[#0b1c30] mb-4 flex items-center gap-2">
          <GoogleIcon name="payments" size={20} className="text-[#006c49]" />
          Permintaan Pencairan Saldo
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#bbcabf]/30 text-[#6c7a71] font-bold text-[11px] uppercase tracking-wider">
                <th className="pb-3 pr-4">Kode WD</th>
                <th className="pb-3 pr-4">Mitra Kafe</th>
                <th className="pb-3 pr-4">Nominal (Rp)</th>
                <th className="pb-3 pr-4">Rekening Tujuan</th>
                <th className="pb-3 pr-4">Waktu Request</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 text-right">Aksi Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#bbcabf]/20">
              {payouts.map((p) => {
                const isPending = p.status === "pending";
                return (
                  <tr key={p.id} className="hover:bg-[#f8f9ff] transition-colors">
                    <td className="py-3.5 pr-4 font-mono font-bold text-[#006c49]">{p.code}</td>
                    <td className="py-3.5 pr-4 font-bold text-[#0b1c30]">{p.cafeName}</td>
                    <td className="py-3.5 pr-4 font-extrabold text-[#006c49]">
                      Rp {p.amountRupiah.toLocaleString("id-ID")}
                      <span className="block text-[10px] text-[#6c7a71]">(-{p.pointsDeducted.toLocaleString("id-ID")} pt)</span>
                    </td>
                    <td className="py-3.5 pr-4">
                      <div className="font-semibold text-[#0b1c30]">{p.bankName} - {p.accountNumber}</div>
                      <div className="text-[10px] text-[#6c7a71]">a/n {p.accountHolder}</div>
                    </td>
                    <td className="py-3.5 pr-4 text-[#6c7a71]">{p.requestedAt}</td>
                    <td className="py-3.5 pr-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          isPending
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                        }`}
                      >
                        {isPending ? "Menunggu Transfer" : "Selesai Ditransfer ✓"}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      {isPending ? (
                        <button
                          type="button"
                          onClick={() => handleApprove(p.id)}
                          className="px-3 py-1.5 rounded-lg bg-[#006c49] text-white font-bold text-[11px] hover:bg-[#005237] transition-colors shadow-2xs"
                        >
                          Approve Transfer
                        </button>
                      ) : (
                        <span className="text-[11px] text-[#6c7a71] font-semibold">Tuntas</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

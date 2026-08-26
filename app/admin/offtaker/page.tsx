"use client";

import React, { useState } from "react";
import { GoogleIcon } from "@/components/ui/GoogleIcon";

export default function AdminOfftakerPage() {
  const [sales, setSales] = useState([
    {
      id: "sale-1",
      code: "BULK-2026-001",
      offtaker: "Recosistem Jawa Timur",
      category: "Plastic Cup (PP/PET)",
      weightKg: 500,
      pricePerKg: 5000,
      grossTotal: 2500000,
      cafeRewardAllocated: 875000, // 35%
      rebrewGrossMargin: 1625000, // 65%
      status: "Terkirim & Lunas",
      date: "24 Feb 2026",
    },
    {
      id: "sale-2",
      code: "BULK-2026-002",
      offtaker: "Paste Lab Upcycling",
      category: "Tutup Cup HDPE (Merchandise Coaster)",
      weightKg: 200,
      pricePerKg: 6000,
      grossTotal: 1200000,
      cafeRewardAllocated: 420000,
      rebrewGrossMargin: 780000,
      status: "Terkirim & Lunas",
      date: "20 Feb 2026",
    },
    {
      id: "sale-3",
      code: "BULK-2026-003",
      offtaker: "Bank Sampah Induk Surabaya",
      category: "Botol Plastik PET Bening",
      weightKg: 400,
      pricePerKg: 6000,
      grossTotal: 2400000,
      cafeRewardAllocated: 840000,
      rebrewGrossMargin: 1560000,
      status: "Siap Kirim",
      date: "26 Feb 2026",
    },
  ]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#bbcabf]/30 pb-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-[#006c49] font-semibold mb-0.5">
            <span>Admin</span>
            <span>/</span>
            <span className="text-[#6c7a71]">Offtaker & Arbitrage</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0b1c30]">
            Manajemen Offtaker & Penjualan Bulk Daur Ulang
          </h1>
          <p className="text-xs text-[#6c7a71] mt-0.5">
            Katalog pabrik daur ulang, pencatatan penjualan tonase dari Micro-Hub, dan realisasi margin waste arbitrage.
          </p>
        </div>

        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#006c49] text-white text-xs font-bold hover:bg-[#005237] transition-colors shadow-sm self-start sm:self-center"
        >
          <GoogleIcon name="add" size={17} />
          <span>Buat Pengiriman Bulk Baru</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#bbcabf]/30 shadow-2xs">
          <div className="text-xs text-[#6c7a71] font-semibold">Total Nilai Jual Offtaker</div>
          <div className="text-2xl font-extrabold text-[#0b1c30] mt-1">Rp 6.100.000</div>
          <div className="text-[11px] text-[#006c49] font-semibold mt-0.5">1.100 kg total terkirim</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#f0fdf4] border border-[#006c49]/30 shadow-2xs">
          <div className="text-xs text-[#006c49] font-bold">Reward Poin Dibagikan ke Kafe (35%)</div>
          <div className="text-2xl font-extrabold text-[#006c49] mt-1">Rp 2.135.000</div>
          <div className="text-[11px] text-[#306d58] font-semibold mt-0.5">2.135.000 Poin terdistribusi</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#bbcabf]/30 shadow-2xs">
          <div className="text-xs text-[#6c7a71] font-semibold">Margin Kotor ReBrew (65%)</div>
          <div className="text-2xl font-extrabold text-[#0b1c30] mt-1">Rp 3.965.000</div>
          <div className="text-[11px] text-[#6c7a71] font-semibold mt-0.5">Operasional, armada & sorting</div>
        </div>
      </div>

      {/* Table of Shipments */}
      <div className="rounded-3xl border border-[#bbcabf]/30 bg-white p-5 sm:p-6 shadow-2xs">
        <h2 className="text-base font-bold text-[#0b1c30] mb-4 flex items-center gap-2">
          <GoogleIcon name="local_shipping" size={20} className="text-[#006c49]" />
          Riwayat Pengiriman Bulk ke Pabrik Recycler
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#bbcabf]/30 text-[#6c7a71] font-bold text-[11px] uppercase tracking-wider">
                <th className="pb-3 pr-4">Kode Batch</th>
                <th className="pb-3 pr-4">Pabrik Offtaker</th>
                <th className="pb-3 pr-4">Kategori Sampah</th>
                <th className="pb-3 pr-4">Tonase (kg)</th>
                <th className="pb-3 pr-4">Harga / kg</th>
                <th className="pb-3 pr-4">Total Kotor (Rp)</th>
                <th className="pb-3 pr-4">Margin ReBrew</th>
                <th className="pb-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#bbcabf]/20">
              {sales.map((s) => (
                <tr key={s.id} className="hover:bg-[#f8f9ff] transition-colors">
                  <td className="py-3.5 pr-4 font-mono font-bold text-[#006c49]">{s.code}</td>
                  <td className="py-3.5 pr-4 font-semibold text-[#0b1c30]">{s.offtaker}</td>
                  <td className="py-3.5 pr-4 text-[#3c4a42]">{s.category}</td>
                  <td className="py-3.5 pr-4 font-bold text-[#0b1c30]">{s.weightKg} kg</td>
                  <td className="py-3.5 pr-4 text-[#6c7a71]">Rp {s.pricePerKg.toLocaleString("id-ID")}</td>
                  <td className="py-3.5 pr-4 font-extrabold text-[#0b1c30]">
                    Rp {s.grossTotal.toLocaleString("id-ID")}
                  </td>
                  <td className="py-3.5 pr-4 font-bold text-[#006c49]">
                    +Rp {s.rebrewGrossMargin.toLocaleString("id-ID")}
                  </td>
                  <td className="py-3.5 text-right">
                    <span className="px-2.5 py-1 rounded-full bg-[#dcfce7] text-[#15803d] font-bold text-[10px]">
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

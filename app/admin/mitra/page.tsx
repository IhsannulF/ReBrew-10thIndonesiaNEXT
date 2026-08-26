"use client";

import React, { useState } from "react";
import { GoogleIcon } from "@/components/ui/GoogleIcon";

export default function AdminMitraPage() {
  const [cafes] = useState([
    {
      id: "cafe-1",
      name: "Kopi Selamat Cafe",
      owner: "Satrio Alif",
      city: "Gubeng, Surabaya",
      tier: "1 Ton Club (Rp200k/thn)",
      totalKg: 342.5,
      saldoPoin: 599375,
      joinedDate: "12 Jan 2026",
      status: "Aktif",
    },
    {
      id: "cafe-2",
      name: "Brew & Co Manyar",
      owner: "Rian Hidayat",
      city: "Manyar, Surabaya",
      tier: "Starter (Gratis)",
      totalKg: 185.0,
      saldoPoin: 323750,
      joinedDate: "18 Jan 2026",
      status: "Aktif",
    },
    {
      id: "cafe-3",
      name: "Kedai Kopi Titik Koma",
      owner: "Dimas Pratama",
      city: "Rungkut, Surabaya",
      tier: "Starter (Gratis)",
      totalKg: 420.0,
      saldoPoin: 441000,
      joinedDate: "02 Feb 2026",
      status: "Aktif",
    },
    {
      id: "cafe-4",
      name: "Urban Coffee Lab",
      owner: "Nadia Rahma",
      city: "Tegalsari, Surabaya",
      tier: "Enterprise (Chain)",
      totalKg: 890.0,
      saldoPoin: 1557500,
      joinedDate: "05 Feb 2026",
      status: "Aktif",
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
            <span className="text-[#6c7a71]">Mitra Kafe</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0b1c30]">
            Manajemen Coffee Shop & Paket Langganan SaaS
          </h1>
          <p className="text-xs text-[#6c7a71] mt-0.5">
            Daftar kafe mitra terdaftar, akumulasi tonase limbah cup terkelola, saldo poin, dan status tier langganan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Cari nama kafe / kota..."
            className="text-xs p-2.5 rounded-xl border border-[#bbcabf]/40 bg-white text-[#0b1c30] outline-none w-56"
          />
        </div>
      </div>

      {/* Table of Partners */}
      <div className="rounded-3xl border border-[#bbcabf]/30 bg-white p-5 sm:p-6 shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#bbcabf]/30 text-[#6c7a71] font-bold text-[11px] uppercase tracking-wider">
                <th className="pb-3 pr-4">Nama Kafe</th>
                <th className="pb-3 pr-4">Kota / Lokasi</th>
                <th className="pb-3 pr-4">Paket Tier SaaS</th>
                <th className="pb-3 pr-4">Total Setor (kg)</th>
                <th className="pb-3 pr-4">Saldo Poin (Rp)</th>
                <th className="pb-3 pr-4">Bergabung</th>
                <th className="pb-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#bbcabf]/20">
              {cafes.map((c) => (
                <tr key={c.id} className="hover:bg-[#f8f9ff] transition-colors">
                  <td className="py-3.5 pr-4 font-bold text-[#0b1c30]">
                    {c.name}
                    <span className="block text-[10px] text-[#6c7a71] font-normal">PIC: {c.owner}</span>
                  </td>
                  <td className="py-3.5 pr-4 text-[#3c4a42]">{c.city}</td>
                  <td className="py-3.5 pr-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        c.tier.includes("1 Ton")
                          ? "bg-amber-100 text-amber-900 border border-amber-300"
                          : c.tier.includes("Enterprise")
                          ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {c.tier}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4 font-extrabold text-[#006c49]">{c.totalKg} kg</td>
                  <td className="py-3.5 pr-4 font-bold text-[#0b1c30]">
                    {c.saldoPoin.toLocaleString("id-ID")} pt
                    <span className="block text-[10px] text-[#6c7a71]">≈ Rp {c.saldoPoin.toLocaleString("id-ID")}</span>
                  </td>
                  <td className="py-3.5 pr-4 text-[#6c7a71]">{c.joinedDate}</td>
                  <td className="py-3.5 text-right">
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg border border-[#bbcabf]/50 hover:bg-[#eff4ff] text-[#006c49] font-bold text-[11px] transition-colors"
                    >
                      Detail Kafe
                    </button>
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

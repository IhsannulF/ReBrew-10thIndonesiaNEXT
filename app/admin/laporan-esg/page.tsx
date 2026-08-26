"use client";

import React, { useState } from "react";
import { GoogleIcon } from "@/components/ui/GoogleIcon";

export default function AdminEsgPage() {
  const [reports] = useState([
    {
      id: "esg-1",
      code: "ESG-2026-02-KS",
      cafeName: "Kopi Selamat Cafe",
      period: "Februari 2026",
      totalKg: 342.5,
      co2Saved: 411.0,
      grade: "Gold Partner ⭐",
      status: "Diterbitkan",
    },
    {
      id: "esg-2",
      code: "ESG-2026-02-UCL",
      cafeName: "Urban Coffee Lab",
      period: "Februari 2026",
      totalKg: 890.0,
      co2Saved: 1068.0,
      grade: "Platinum Partner 🏆",
      status: "Diterbitkan",
    },
    {
      id: "esg-3",
      code: "ESG-2026-02-TK",
      cafeName: "Kedai Kopi Titik Koma",
      period: "Februari 2026",
      totalKg: 420.0,
      co2Saved: 504.0,
      grade: "Gold Partner ⭐",
      status: "Siap Terbit",
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
            <span className="text-[#6c7a71]">ESG & Sertifikasi</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0b1c30]">
            Penerbitan Laporan ESG & Sertifikat Eco-Partner
          </h1>
          <p className="text-xs text-[#6c7a71] mt-0.5">
            Otomatisasi laporan dampak lingkungan bulanan dan sertifikat kepatuhan regulasi limbah (Permen LHK 75/2019).
          </p>
        </div>

        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#006c49] text-white text-xs font-bold hover:bg-[#005237] transition-colors shadow-sm self-start sm:self-center"
        >
          <GoogleIcon name="auto_awesome" size={17} />
          <span>Generate Laporan Bulan Ini</span>
        </button>
      </div>

      {/* Table of Issued Reports */}
      <div className="rounded-3xl border border-[#bbcabf]/30 bg-white p-5 sm:p-6 shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#bbcabf]/30 text-[#6c7a71] font-bold text-[11px] uppercase tracking-wider">
                <th className="pb-3 pr-4">Kode Laporan</th>
                <th className="pb-3 pr-4">Mitra Kafe</th>
                <th className="pb-3 pr-4">Periode</th>
                <th className="pb-3 pr-4">Sampah Terkelola</th>
                <th className="pb-3 pr-4">CO₂ Dicegah</th>
                <th className="pb-3 pr-4">Grade Sertifikat</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#bbcabf]/20">
              {reports.map((r) => (
                <tr key={r.id} className="hover:bg-[#f8f9ff] transition-colors">
                  <td className="py-3.5 pr-4 font-mono font-bold text-[#006c49]">{r.code}</td>
                  <td className="py-3.5 pr-4 font-bold text-[#0b1c30]">{r.cafeName}</td>
                  <td className="py-3.5 pr-4 text-[#3c4a42]">{r.period}</td>
                  <td className="py-3.5 pr-4 font-bold text-[#0b1c30]">{r.totalKg} kg</td>
                  <td className="py-3.5 pr-4 font-bold text-[#059669]">{r.co2Saved} kg CO₂e</td>
                  <td className="py-3.5 pr-4 font-semibold text-[#006c49]">{r.grade}</td>
                  <td className="py-3.5 pr-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg border border-[#006c49] text-[#006c49] font-bold text-[11px] hover:bg-[#eff4ff] transition-colors"
                    >
                      Download PDF
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

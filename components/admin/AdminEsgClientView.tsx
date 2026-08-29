"use client";

import React, { useState } from "react";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import {
  AdminEsgReportItem,
  generateEsgReportAction,
} from "@/app/actions/admin";

interface AdminEsgClientViewProps {
  initialData: {
    reports: AdminEsgReportItem[];
    partners: { id: string; name: string; cafeName: string; totalKg: number }[];
    metrics: {
      totalReportsIssued: number;
      totalCertificatesIssued: number;
      totalWasteValidatedKg: number;
      totalCo2SavedKg: number;
    };
  };
}

export const AdminEsgClientView: React.FC<AdminEsgClientViewProps> = ({
  initialData,
}) => {
  const [reports, setReports] = useState<AdminEsgReportItem[]>(initialData.reports);
  const [partners] = useState(initialData.partners);
  const [searchQuery, setSearchQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState<string>("all");

  // Modal: Generate Report State
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState(partners[0]?.id || "");
  const [periodMonth, setPeriodMonth] = useState<number>(new Date().getMonth() + 1);
  const [periodYear, setPeriodYear] = useState<number>(new Date().getFullYear());
  const [wasteKgInput, setWasteKgInput] = useState<string>(
    String(partners[0]?.totalKg || 14.6)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal: View Certificate & ESG Preview
  const [previewReport, setPreviewReport] = useState<AdminEsgReportItem | null>(null);

  // Feedback State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Update waste weight when selecting another partner
  const handlePartnerChange = (partnerId: string) => {
    setSelectedPartnerId(partnerId);
    const matched = partners.find((p) => p.id === partnerId);
    if (matched) {
      setWasteKgInput(String(matched.totalKg || 10));
    }
  };

  // Handle Generate Report Action
  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartnerId || isSubmitting) return;

    const kg = parseFloat(wasteKgInput);
    if (isNaN(kg) || kg <= 0) {
      setErrorMessage("Masukkan tonase sampah yang valid (> 0 kg).");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const co2 = Math.round(kg * 1.2 * 10) / 10;
    const matchedPartner = partners.find((p) => p.id === selectedPartnerId);
    const cafeName = matchedPartner?.cafeName || "Mitra Kafe";

    try {
      const res = await generateEsgReportAction({
        partnerId: selectedPartnerId,
        periodMonth,
        periodYear,
        totalWasteKg: kg,
        co2SavedKg: co2,
      });

      if (res.success && res.reportCode) {
        const monthNames = [
          "",
          "Januari",
          "Februari",
          "Maret",
          "April",
          "Mei",
          "Juni",
          "Juli",
          "Agustus",
          "September",
          "Oktober",
          "November",
          "Desember",
        ];
        const grade =
          kg >= 100
            ? "Platinum Partner 🏆"
            : kg >= 25
            ? "Gold Partner ⭐"
            : "Silver Eco Partner 🥉";

        const newReportObj: AdminEsgReportItem = {
          id: `esg-${Date.now()}`,
          code: res.reportCode,
          partnerId: selectedPartnerId,
          cafeName,
          period: `${monthNames[periodMonth]} ${periodYear}`,
          periodMonth,
          periodYear,
          totalKg: kg,
          co2Saved: co2,
          grade,
          status: "Diterbitkan & Sah",
          issuedAt: new Date().toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
        };

        setReports([newReportObj, ...reports]);
        setIsGenerateOpen(false);
        setToastMessage(
          `Laporan ${res.reportCode} dan Sertifikat Digital untuk ${cafeName} berhasil diterbitkan!`
        );
        setTimeout(() => setToastMessage(null), 5000);
      } else {
        setErrorMessage(res.error || "Gagal menerbitkan laporan ESG.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Terjadi kesalahan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered Reports
  const filteredReports = reports.filter((r) => {
    if (gradeFilter !== "all") {
      if (gradeFilter === "platinum" && !r.grade.toLowerCase().includes("platinum")) return false;
      if (gradeFilter === "gold" && !r.grade.toLowerCase().includes("gold")) return false;
      if (gradeFilter === "silver" && !r.grade.toLowerCase().includes("silver")) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        r.code.toLowerCase().includes(q) ||
        r.cafeName.toLowerCase().includes(q) ||
        r.period.toLowerCase().includes(q) ||
        r.grade.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalReportsCount = reports.length;
  const totalWasteValidated = reports.reduce((acc, r) => acc + r.totalKg, 0);
  const totalCo2Saved = reports.reduce((acc, r) => acc + r.co2Saved, 0);

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
            Otomatisasi laporan kepatuhan regulasi lingkungan (Permen LHK 75/2019) dan sertifikat keberlanjutan mitra kafe.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (partners.length > 0 && !selectedPartnerId) {
              setSelectedPartnerId(partners[0].id);
              setWasteKgInput(String(partners[0].totalKg || 10));
            }
            setIsGenerateOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#006c49] text-white text-xs font-bold hover:bg-[#005237] transition-all shadow-sm self-start sm:self-center cursor-pointer active:scale-95"
        >
          <GoogleIcon name="auto_awesome" size={17} />
          <span>Generate Laporan & Sertifikat Baru</span>
        </button>
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
            <span className="text-xs font-semibold text-[#6c7a71]">Laporan Diterbitkan</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eff4ff] text-[#006c49]">
              <GoogleIcon name="description" size={18} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-[#0b1c30]">{totalReportsCount} Dokumen</div>
            <div className="text-[11px] text-[#006c49] font-medium mt-0.5">Laporan audit resmi</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#bbcabf]/30 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6c7a71]">Sertifikat Digital</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eff6ff] text-[#0284c7]">
              <GoogleIcon name="workspace_premium" size={18} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-[#0284c7]">{totalReportsCount} Sertifikat</div>
            <div className="text-[11px] text-[#0369a1] font-medium mt-0.5">Berlaku 1 tahun penuh</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#bbcabf]/30 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6c7a71]">Tonase Tervalidasi</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f0fdf4] text-[#006c49]">
              <GoogleIcon name="scale" size={18} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-[#006c49]">
              {totalWasteValidated.toLocaleString("id-ID")} kg
            </div>
            <div className="text-[11px] text-[#306d58] font-medium mt-0.5">
              ≈ {(totalWasteValidated / 1000).toFixed(2)} Ton limbah
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#bbcabf]/30 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6c7a71]">CO₂e Dicegah</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#fffdf5] text-[#d97706]">
              <GoogleIcon name="eco" size={18} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-[#0b1c30]">
              {totalCo2Saved.toLocaleString("id-ID")} kg
            </div>
            <div className="text-[11px] text-[#6c7a71] font-medium mt-0.5">Reduksi jejak karbon</div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-3xl border border-[#bbcabf]/30 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-bold text-[#0b1c30] flex items-center gap-2">
            <GoogleIcon name="verified_user" size={20} className="text-[#006c49]" />
            Daftar Laporan ESG & Sertifikat Resmi Terbit
          </h2>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-[#eff4ff] p-1 rounded-xl border border-[#bbcabf]/30 text-xs self-start">
            {[
              { key: "all", label: "Semua" },
              { key: "platinum", label: "Platinum" },
              { key: "gold", label: "Gold" },
              { key: "silver", label: "Silver" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setGradeFilter(tab.key)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  gradeFilter === tab.key
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
            placeholder="Cari kode laporan, nama kafe, atau grade..."
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
                <th className="pb-3 pr-4">Kode Laporan</th>
                <th className="pb-3 pr-4">Mitra Kafe</th>
                <th className="pb-3 pr-4">Periode</th>
                <th className="pb-3 pr-4">Sampah Terkelola</th>
                <th className="pb-3 pr-4">CO₂ Dicegah</th>
                <th className="pb-3 pr-4">Grade Sertifikat</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 text-right">Aksi Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#bbcabf]/20">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-[#6c7a71]">
                    {reports.length === 0 ? (
                      <div className="space-y-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eff4ff] text-[#6c7a71] mx-auto">
                          <GoogleIcon name="workspace_premium" size={24} />
                        </div>
                        <p className="font-bold text-[#0b1c30]">Belum ada laporan ESG atau sertifikat yang diterbitkan</p>
                        <p className="text-[11px] text-[#6c7a71]">
                          Klik tombol &quot;Generate Laporan &amp; Sertifikat Baru&quot; di atas untuk menerbitkan sertifikat kepatuhan lingkungan.
                        </p>
                      </div>
                    ) : (
                      "Tidak ada laporan yang sesuai dengan pencarian."
                    )}
                  </td>
                </tr>
              ) : (
                filteredReports.map((r) => (
                  <tr key={r.id} className="hover:bg-[#f8f9ff] transition-colors">
                    <td className="py-3.5 pr-4 font-mono font-bold text-[#006c49]">{r.code}</td>
                    <td className="py-3.5 pr-4 font-bold text-[#0b1c30]">{r.cafeName}</td>
                    <td className="py-3.5 pr-4 text-[#3c4a42]">{r.period}</td>
                    <td className="py-3.5 pr-4 font-extrabold text-[#0b1c30]">{r.totalKg} kg</td>
                    <td className="py-3.5 pr-4 font-extrabold text-[#006c49]">{r.co2Saved} kg CO₂e</td>
                    <td className="py-3.5 pr-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] inline-block ${
                          r.grade.includes("Platinum")
                            ? "bg-purple-100 text-purple-900 border border-purple-300"
                            : r.grade.includes("Gold")
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {r.grade}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => setPreviewReport(r)}
                        className="px-3 py-1.5 rounded-lg border border-[#006c49] text-[#006c49] font-bold text-[11px] hover:bg-[#eff4ff] transition-all cursor-pointer shadow-2xs"
                      >
                        Lihat Sertifikat
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Generate Laporan ESG & Sertifikat */}
      {isGenerateOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-[#bbcabf]/30 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#bbcabf]/20">
              <div className="flex items-center gap-2 text-[#006c49]">
                <GoogleIcon name="auto_awesome" size={22} />
                <h3 className="text-base font-bold text-[#0b1c30]">Terbitkan Laporan &amp; Sertifikat ESG</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsGenerateOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateReport} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#0b1c30]">Pilih Mitra Kafe Penerima:</label>
                <select
                  value={selectedPartnerId}
                  onChange={(e) => handlePartnerChange(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#bbcabf]/40 bg-white text-[#0b1c30] outline-none font-bold"
                >
                  {partners.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.cafeName} ({p.totalKg} kg terkelola)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-[#0b1c30]">Bulan Periode:</label>
                  <select
                    value={periodMonth}
                    onChange={(e) => setPeriodMonth(parseInt(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-[#bbcabf]/40 bg-white text-[#0b1c30] outline-none font-semibold"
                  >
                    {[
                      { m: 1, name: "Januari" },
                      { m: 2, name: "Februari" },
                      { m: 3, name: "Maret" },
                      { m: 4, name: "April" },
                      { m: 5, name: "Mei" },
                      { m: 6, name: "Juni" },
                      { m: 7, name: "Juli" },
                      { m: 8, name: "Agustus" },
                      { m: 9, name: "September" },
                      { m: 10, name: "Oktober" },
                      { m: 11, name: "November" },
                      { m: 12, name: "Desember" },
                    ].map((item) => (
                      <option key={item.m} value={item.m}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#0b1c30]">Tahun:</label>
                  <input
                    type="number"
                    value={periodYear}
                    onChange={(e) => setPeriodYear(parseInt(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-[#bbcabf]/40 bg-white text-[#0b1c30] outline-none font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#0b1c30]">Total Sampah Terkelola (kg):</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={wasteKgInput}
                  onChange={(e) => setWasteKgInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#bbcabf]/40 bg-white text-[#0b1c30] outline-none font-bold"
                />
                <span className="text-[10px] text-[#6c7a71] block">
                  Estimasi reduksi emisi: {(parseFloat(wasteKgInput || "0") * 1.2).toFixed(1)} kg CO₂e
                </span>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-[#bbcabf]/20">
                <button
                  type="button"
                  onClick={() => setIsGenerateOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#bbcabf]/40 text-xs font-bold text-[#0b1c30] hover:bg-gray-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-[#006c49] text-white text-xs font-bold hover:bg-[#005237] shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Menerbitkan..." : "Terbitkan Sekarang"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Preview & Cetak Sertifikat Digital */}
      {previewReport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-[#bbcabf]/30 space-y-6 animate-fade-in my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#bbcabf]/20">
              <span className="font-mono text-xs font-bold text-[#006c49]">{previewReport.code}</span>
              <button
                type="button"
                onClick={() => setPreviewReport(null)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Certificate Canvas View */}
            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-[#f0fdf4] to-white border-2 border-[#006c49]/30 text-center space-y-4 shadow-sm relative overflow-hidden">
              <div className="flex justify-center mb-1 text-[#006c49]">
                <GoogleIcon name="workspace_premium" size={48} />
              </div>
              <div>
                <h3 className="text-xs uppercase tracking-widest text-[#006c49] font-bold">
                  Sertifikat Kepatuhan Lingkungan &amp; ESG
                </h3>
                <h4 className="text-xl font-extrabold text-[#0b1c30] mt-1">
                  {previewReport.cafeName}
                </h4>
                <p className="text-xs text-[#3c4a42] mt-1 max-w-md mx-auto">
                  Dianugerahi penghargaan resmi atas komitmen pemilahan sirkular sampah kemasan minuman periode {previewReport.period}.
                </p>
              </div>

              {/* Badges & Metrics in Certificate */}
              <div className="grid grid-cols-2 gap-3 py-3 border-y border-[#006c49]/20 text-xs">
                <div className="p-2.5 rounded-xl bg-white border border-[#bbcabf]/30">
                  <div className="text-[10px] text-[#6c7a71]">Total Sampah Terpilah</div>
                  <div className="text-base font-extrabold text-[#006c49]">{previewReport.totalKg} kg</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-[#bbcabf]/30">
                  <div className="text-[10px] text-[#6c7a71]">Emisi Karbon Dicegah</div>
                  <div className="text-base font-extrabold text-[#0284c7]">{previewReport.co2Saved} kg CO₂e</div>
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] text-[#6c7a71] pt-1">
                <span>Diterbitkan: {previewReport.issuedAt}</span>
                <span className="font-bold text-[#006c49]">{previewReport.grade}</span>
                <span>Standar: Permen LHK 75/2019</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#bbcabf]/20">
              <button
                type="button"
                onClick={() => setPreviewReport(null)}
                className="px-4 py-2.5 rounded-xl border border-[#bbcabf]/40 text-xs font-bold text-[#0b1c30] hover:bg-gray-50 cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#006c49] text-white text-xs font-bold hover:bg-[#005237] shadow-sm cursor-pointer"
              >
                <GoogleIcon name="print" size={16} />
                <span>Cetak / Simpan PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

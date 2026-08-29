"use client";

import React, { useState } from "react";
import Link from "next/link";
import { GoogleIcon } from "@/components/ui/GoogleIcon";

interface EcoCertificateLevel {
  level: number;
  id: string;
  name: string;
  minKg: number;
  badgeLabel: string;
  icon: string;
  color: string;
  bgColor: string;
  description: string;
}

const CERTIFICATE_LEVELS: EcoCertificateLevel[] = [
  {
    level: 1,
    id: "lvl-1",
    name: "Sertifikat Eco-Partner 2026",
    minKg: 25.0,
    badgeLabel: "Level 1: Eco-Partner ⭐",
    icon: "verified",
    color: "#006c49",
    bgColor: "#eff4ff",
    description: "Pengakuan resmi kemitraan pemilahan sampah kafe tahap pertama.",
  },
  {
    level: 2,
    id: "lvl-2",
    name: "Sertifikat Plastic Warrior",
    minKg: 50.0,
    badgeLabel: "Level 2: Plastic Warrior 🛡️",
    icon: "shield",
    color: "#d97706",
    bgColor: "#fffdf5",
    description: "Sertifikasi dedikasi pengelolaan limbah plastik & ampas kopi konsisten.",
  },
  {
    level: 3,
    id: "lvl-3",
    name: "Sertifikat Zero-Waste Hero",
    minKg: 100.0,
    badgeLabel: "Level 3: Zero-Waste Hero 🏆",
    icon: "military_tech",
    color: "#7c3aed",
    bgColor: "#f5f3ff",
    description: "Standar kepatuhan ESG lanjutan dan sirkularitas limbah unggul.",
  },
  {
    level: 4,
    id: "lvl-4",
    name: "Sertifikat Enterprise Pioneer",
    minKg: 250.0,
    badgeLabel: "Level 4: Enterprise Pioneer 👑",
    icon: "workspace_premium",
    color: "#0b1c30",
    bgColor: "#f8f9ff",
    description: "Penghargaan tertinggi pemimpin ekosistem sirkular kafe komersial.",
  },
];

interface EcoCertificateLevelSectionProps {
  cafeName: string;
  city: string;
  totalKg: number;
}

export const EcoCertificateLevelSection: React.FC<EcoCertificateLevelSectionProps> = ({
  cafeName,
  city,
  totalKg,
}) => {
  const [selectedCert, setSelectedCert] = useState<EcoCertificateLevel | null>(null);

  // Cari level tertinggi yang sudah terbuka
  const highestUnlocked = CERTIFICATE_LEVELS.filter((lvl) => totalKg >= lvl.minKg).pop();
  
  // Level berikutnya yang sedang dituju
  const nextLevel = CERTIFICATE_LEVELS.find((lvl) => totalKg < lvl.minKg) || CERTIFICATE_LEVELS[0];
  const nextTargetDeficit = Math.max(0, Math.round((nextLevel.minKg - totalKg) * 10) / 10);
  const nextProgressPercent = Math.min(100, Math.round((totalKg / nextLevel.minKg) * 100));

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <>
      <section
        className="flex w-full flex-col rounded-3xl border border-[#bbcabf]/30 bg-gradient-to-br from-white via-[#f0fdf4] to-[#eff4ff] p-6 sm:p-7 shadow-xs gap-5"
        aria-label="Sertifikat Eco-Partner Berlevel"
      >
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#bbcabf]/20 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#006c49] text-white shadow-2xs">
              <GoogleIcon name="workspace_premium" size={26} filled />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#006c49]">
                  Sertifikasi Kemitraan Berlevel
                </span>
                <span className="text-[10px] font-bold bg-[#eff4ff] text-[#006c49] border border-[#adedd3] px-2 py-0.5 rounded-full">
                  ESG Verified
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#0b1c30] mt-0.5">
                Sertifikat Resmi ReBrew Eco-Partner
              </h2>
            </div>
          </div>

          {/* Status Level Badge */}
          {highestUnlocked ? (
            <button
              type="button"
              onClick={() => setSelectedCert(highestUnlocked)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#006c49] text-white text-xs font-bold shadow-2xs hover:bg-[#005237] transition-all cursor-pointer"
            >
              <GoogleIcon name="download" size={16} />
              <span>Unduh {highestUnlocked.name}</span>
            </button>
          ) : (
            <span className="text-xs font-bold bg-[#fff8e1] text-[#92400e] border border-[#fde68a] px-3 py-1 rounded-full">
              Butuh {nextTargetDeficit} kg lagi untuk Level 1
            </span>
          )}
        </div>

        {/* Progress Menuju Level Berikutnya */}
        <div className="p-4 rounded-2xl bg-white border border-[#bbcabf]/30 flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-[#0b1c30] flex items-center gap-1.5">
              <GoogleIcon name="trending_up" size={16} className="text-[#006c49]" />
              Progres Sertifikat: {highestUnlocked ? highestUnlocked.badgeLabel : "Menuju Level 1"}
            </span>
            <span className="font-extrabold text-[#006c49]">
              {totalKg} / {nextLevel.minKg} kg ({nextProgressPercent}%)
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-2.5 w-full rounded-full bg-[#e2e8f0] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#006c49] to-[#10b981] rounded-full transition-all duration-500"
              style={{ width: `${nextProgressPercent}%` }}
            />
          </div>

          <p className="text-[11px] text-[#6c7a71] mt-0.5">
            {totalKg >= nextLevel.minKg
              ? `Selamat! Kafe ${cafeName} telah berhasil membuka seluruh level sertifikat kemitraan sirkular.`
              : `Setor ${nextTargetDeficit} kg sampah lagi untuk membuka "${nextLevel.name}" dan dapatkan sertifikat resmi siap cetak.`}
          </p>
        </div>

        {/* Grid 4 Level Sertifikat */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 pt-1">
          {CERTIFICATE_LEVELS.map((lvl) => {
            const isUnlocked = totalKg >= lvl.minKg;

            return (
              <div
                key={lvl.id}
                className={`flex flex-col justify-between p-4 rounded-2xl border transition-all gap-3 ${
                  isUnlocked
                    ? "bg-white border-[#006c49]/40 shadow-xs hover:shadow-md"
                    : "bg-[#f8f9ff]/70 border-[#bbcabf]/30 opacity-75"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-white"
                      style={{ backgroundColor: isUnlocked ? lvl.color : "#94a3b8" }}
                    >
                      <GoogleIcon name={lvl.icon} size={18} filled={isUnlocked} />
                    </span>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                        isUnlocked
                          ? "bg-[#eff4ff] text-[#006c49] border-[#adedd3]"
                          : "bg-gray-100 text-gray-500 border-gray-200"
                      }`}
                    >
                      {isUnlocked ? "Terbuka ✔" : `Min. ${lvl.minKg} kg`}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-[#0b1c30]">{lvl.name}</h3>
                  <p className="text-[10px] text-[#6c7a71] mt-1 leading-relaxed">
                    {lvl.description}
                  </p>
                </div>

                {isUnlocked ? (
                  <button
                    type="button"
                    onClick={() => setSelectedCert(lvl)}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] text-[#006c49] text-xs font-bold border border-[#adedd3] transition-all cursor-pointer"
                  >
                    <GoogleIcon name="visibility" size={14} />
                    <span>Lihat & Unduh</span>
                  </button>
                ) : (
                  <Link
                    href="/dashboard/setor"
                    className="w-full inline-flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-[#f1f5f9] text-[#64748b] text-[11px] font-semibold hover:bg-[#e2e8f0] transition-all"
                  >
                    <span>Setor Sampah</span>
                    <GoogleIcon name="arrow_forward" size={12} />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Modal Preview & Cetak Sertifikat Resmi */}
      {selectedCert && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto print:p-0 print:bg-white print:static print:overflow-visible"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-[#bbcabf]/40 overflow-hidden animate-fade-in my-8 print:my-0 print:shadow-none print:border-none print:max-w-none print:w-full">
            {/* Header Modal */}
            <div className="bg-[#006c49] p-4 px-6 text-white flex items-center justify-between print:hidden">
              <div className="flex items-center gap-2">
                <GoogleIcon name="workspace_premium" size={20} />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Pratinjau Sertifikat Resmi
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCert(null)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer print:hidden"
                title="Tutup"
              >
                <GoogleIcon name="close" size={16} />
              </button>
            </div>

            {/* Certificate Frame Printable */}
            <div className="p-6 sm:p-8 bg-[#fbfdfa] flex flex-col items-center text-center relative border-8 border-[#f5f0e1] m-4 sm:m-6 rounded-2xl shadow-inner">
              {/* Corner Ornaments */}
              <div className="absolute top-2 left-2 text-[#d97706] opacity-60">❖</div>
              <div className="absolute top-2 right-2 text-[#d97706] opacity-60">❖</div>
              <div className="absolute bottom-2 left-2 text-[#d97706] opacity-60">❖</div>
              <div className="absolute bottom-2 right-2 text-[#d97706] opacity-60">❖</div>

              {/* Logo / Header */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#006c49] text-white shadow-2xs">
                  <GoogleIcon name="recycling" size={20} />
                </div>
                <span className="text-sm font-black tracking-widest text-[#006c49] uppercase">
                  ReBrew Indonesia
                </span>
              </div>

              <span className="text-[10px] font-bold uppercase tracking-widest text-[#d97706] block">
                Certificate of Environmental Excellence
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#0b1c30] mt-1 font-serif">
                {selectedCert.name}
              </h2>
              <span className="text-[11px] text-[#6c7a71] block mt-0.5">
                No. Sertifikat: CERT-RB-2026-{(Math.abs(selectedCert.minKg * 100)).toString().padStart(6, "0")}
              </span>

              {/* Given To */}
              <div className="my-5 w-full">
                <span className="text-xs text-[#3c4a42] italic block">Diberikan secara resmi kepada:</span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#006c49] mt-1 font-serif underline decoration-[#d97706]/40 underline-offset-8">
                  {cafeName}
                </h3>
                <span className="text-xs text-[#6c7a71] block mt-2">
                  Kota Operasional: <strong>{city}</strong>
                </span>
              </div>

              {/* Statement */}
              <p className="text-xs text-[#3c4a42] max-w-lg leading-relaxed mb-6">
                Atas komitmen dan kontribusi nyata dalam pengelolaan limbah kopi sirkular, pengurangan jejak karbon emisi gas rumah kaca, serta kepatuhan standar lingkungan hidup <strong>Permen LHK No. 75/2019</strong> bersama platform ReBrew.
              </p>

              {/* Footer Signatures & QR */}
              <div className="w-full flex items-center justify-between pt-4 border-t border-[#bbcabf]/30 text-left text-[10px]">
                <div>
                  <span className="text-[#6c7a71] block">Tanggal Diterbitkan:</span>
                  <span className="font-bold text-[#0b1c30]">
                    {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                  <span className="text-[#006c49] font-bold block mt-1">✔ Terverifikasi ReBrew Core</span>
                </div>

                <div className="text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white border border-[#bbcabf]/40 mx-auto shadow-2xs text-[#006c49]">
                    <GoogleIcon name="qr_code_2" size={28} />
                  </div>
                  <span className="text-[9px] text-[#6c7a71] block mt-0.5">Scan Verifikasi</span>
                </div>

                <div className="text-right">
                  <span className="text-[#6c7a71] block">Direktur Kemitraan Sirkular:</span>
                  <span className="font-bold text-[#0b1c30] block mt-4 underline">
                    ReBrew Circular Committee
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Modal Actions (Disembunyikan saat Cetak / Simpan PDF) */}
            <div className="flex items-center gap-3 p-5 bg-[#f8f9ff] border-t border-[#bbcabf]/30 print:hidden">
              <button
                type="button"
                onClick={() => setSelectedCert(null)}
                className="flex-1 py-3 rounded-xl border border-[#bbcabf]/40 text-xs font-bold text-[#0b1c30] hover:bg-white transition-colors cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handlePrintCertificate}
                className="flex-1 py-3 rounded-xl bg-[#006c49] text-white text-xs font-bold hover:bg-[#005237] transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <GoogleIcon name="print" size={16} />
                <span>Cetak / Simpan PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

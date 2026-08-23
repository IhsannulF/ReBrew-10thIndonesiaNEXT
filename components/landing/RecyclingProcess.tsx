import React from "react";
import { GoogleIcon } from "@/components/ui/GoogleIcon";

const recyclingSteps = [
  {
    number: "01",
    icon: "recycling",
    title: "Pilah Sampah",
    description: "Pilah berdasarkan jenis: botol plastik, kardus, kaleng, hingga elektronik.",
    bg: "bg-white",
  },
  {
    number: "02",
    icon: "location_on",
    title: "Pilih Metode Setor",
    description: "Kunjungi drop point terdekat atau gunakan opsi penjemputan mitra armada.",
    bg: "bg-[#f5f4ef]/80",
  },
  {
    number: "03",
    icon: "scale",
    title: "Timbang Otomatis",
    description: "Timbangan IoT menghitung berat secara presisi dan akurat secara real-time.",
    bg: "bg-white",
  },
  {
    number: "04",
    icon: "verified",
    title: "Verifikasi Instan",
    description: "Sistem cerdas memverifikasi jenis & berat sampah dalam hitungan detik.",
    bg: "bg-[#f5f4ef]/80",
  },
  {
    number: "05",
    icon: "toll",
    title: "Dapat Koin",
    description: "Poin reward langsung masuk otomatis ke saldo dompet akun ReBrew kamu.",
    bg: "bg-white",
  },
  {
    number: "06",
    icon: "account_balance",
    title: "Tarik ke Bank",
    description: "Konversi koin ke rupiah dan cairkan langsung ke rekening bank atau e-wallet.",
    bg: "bg-[#f5f4ef]/80",
  },
];

export const RecyclingProcess = (): React.JSX.Element => {
  return (
    <section
      id="cara-kerja"
      className="w-full bg-white px-4 py-16 sm:px-8 sm:py-20 lg:px-12"
      aria-labelledby="recycling-process-title"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center">
          <h2
            id="recycling-process-title"
            className="text-3xl font-extrabold tracking-tight text-[#1a2a1b] sm:text-4xl"
            style={{ fontFamily: "var(--font-fraunces, serif)" }}
          >
            Cara Kerja ReBrew
          </h2>
          <p className="mt-3 max-w-2xl text-base text-[#6b7c6f] sm:text-lg">
            6 langkah mudah dari pilah sampah hingga uang di tangan
          </p>
        </div>

        {/* Steps Grid */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recyclingSteps.map((step) => (
            <div
              key={step.number}
              className={`relative flex items-start gap-4 rounded-2xl border border-[#d8e6d9] p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${step.bg}`}
            >
              {/* Left: Icon & Step Number */}
              <div className="flex flex-col items-center shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e8f5e9] text-[#2e7d32]">
                  <GoogleIcon name={step.icon} size={26} filled />
                </div>
                <span className="mt-2 text-xs font-black tracking-wider text-[#66bb6a]">
                  {step.number}
                </span>
              </div>

              {/* Right: Title & Description */}
              <div className="flex flex-col">
                <h3 className="text-base font-bold text-[#1a2a1b]">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[#6b7c6f]">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

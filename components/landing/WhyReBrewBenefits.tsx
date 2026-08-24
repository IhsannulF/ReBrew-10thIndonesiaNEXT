import React from "react";
import { GoogleIcon } from "@/components/ui/GoogleIcon";

const benefits = [
  {
    icon: "visibility",
    title: "Transparan",
    description: "Proses penimbangan jelas, riwayat terlacak, dan terverifikasi secara terbuka.",
    bgGradient: "bg-gradient-to-br from-white via-white to-[#f0fdf4]",
    borderColor: "border-[#bbf7d0] hover:border-[#2e7d32]",
    iconBg: "bg-[#e8f5e9] text-[#2e7d32]",
    hoverIconBg: "group-hover:bg-[#2e7d32]",
  },
  {
    icon: "eco",
    title: "Berkelanjutan",
    description: "Mendukung ekosistem sirkular ekonomi dan kelestarian bumi Indonesia.",
    bgGradient: "bg-gradient-to-br from-white via-white to-[#f0f9ff]",
    borderColor: "border-[#bae6fd] hover:border-[#0284c7]",
    iconBg: "bg-[#e0f2fe] text-[#0284c7]",
    hoverIconBg: "group-hover:bg-[#0284c7]",
  },
  {
    icon: "payments",
    title: "Bermanfaat",
    description: "Setiap kilogram sampah terpilah langsung menghasilkan reward uang nyata.",
    bgGradient: "bg-gradient-to-br from-white via-white to-[#fffdf5]",
    borderColor: "border-[#fde68a] hover:border-[#d97706]",
    iconBg: "bg-[#fef3c7] text-[#d97706]",
    hoverIconBg: "group-hover:bg-[#d97706]",
  },
  {
    icon: "handshake",
    title: "Bersama",
    description: "Membangun sinergi komunitas, mitra UMKM, dan masyarakat berdaya.",
    bgGradient: "bg-gradient-to-br from-white via-white to-[#faf8ff]",
    borderColor: "border-[#ddd6fe] hover:border-[#7c3aed]",
    iconBg: "bg-[#ede9fe] text-[#7c3aed]",
    hoverIconBg: "group-hover:bg-[#7c3aed]",
  },
];

export const WhyReBrewBenefits = (): React.JSX.Element => {
  return (
    <section
      id="keunggulan"
      className="w-full bg-[#f9faf8] px-4 py-16 sm:px-8 sm:py-20 lg:px-12 border-t border-[#e5ebe5]"
      aria-labelledby="why-rebrew-heading"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center">
          <h2
            id="why-rebrew-heading"
            className="text-3xl font-extrabold tracking-tight text-[#1a2a1b] sm:text-4xl"
            style={{ fontFamily: "var(--font-fraunces, serif)" }}
          >
            Kenapa ReBrew?
          </h2>
          <p className="mt-3 max-w-2xl text-base text-[#6b7c6f] sm:text-lg leading-relaxed">
            Platform pilah sampah pertama di Indonesia dengan reward uang nyata dan ekosistem terintegrasi.
          </p>
        </div>

        {/* Benefit Cards Grid */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className={`group flex flex-col items-center rounded-2xl border ${benefit.borderColor} ${benefit.bgGradient} p-8 text-center shadow-xs transition-all duration-200 hover:-translate-y-1.5 hover:shadow-md`}
            >
              {/* Icon Container */}
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-2xl ${benefit.iconBg} ${benefit.hoverIconBg} group-hover:text-white transition-all shadow-xs`}
              >
                <GoogleIcon name={benefit.icon} size={32} filled />
              </div>

              {/* Title */}
              <h3 className="mt-6 text-xl font-bold text-[#1a2a1b]">
                {benefit.title}
              </h3>

              {/* Description */}
              <p className="mt-3 text-sm leading-relaxed text-[#556957]">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

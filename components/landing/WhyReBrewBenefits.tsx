import React from "react";
import { GoogleIcon } from "@/components/ui/GoogleIcon";

const benefits = [
  {
    icon: "visibility",
    title: "Transparan",
    description: "Proses penimbangan jelas, riwayat terlacak, dan terverifikasi secara terbuka.",
  },
  {
    icon: "eco",
    title: "Berkelanjutan",
    description: "Mendukung ekosistem sirkular ekonomi dan kelestarian bumi Indonesia.",
  },
  {
    icon: "payments",
    title: "Bermanfaat",
    description: "Setiap kilogram sampah terpilah langsung menghasilkan reward uang nyata.",
  },
  {
    icon: "handshake",
    title: "Bersama",
    description: "Membangun sinergi komunitas, mitra UMKM, dan masyarakat berdaya.",
  },
];

export const WhyReBrewBenefits = (): React.JSX.Element => {
  return (
    <section
      id="keunggulan"
      className="w-full bg-[#f5f4ef] px-4 py-16 sm:px-8 sm:py-20 lg:px-12"
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
          <p className="mt-3 max-w-2xl text-base text-[#6b7c6f] sm:text-lg">
            Platform pilah sampah pertama di Indonesia dengan reward uang nyata dan ekosistem terintegrasi.
          </p>
        </div>

        {/* Benefit Cards Grid */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="group flex flex-col items-center rounded-2xl border border-[#d8e6d9] bg-white p-7 text-center shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-[#66bb6a]"
            >
              {/* Icon Container */}
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e8f5e9] text-[#2e7d32] transition-colors group-hover:bg-[#2e7d32] group-hover:text-white">
                <GoogleIcon name={benefit.icon} size={32} filled />
              </div>

              {/* Title */}
              <h3 className="mt-5 text-lg font-bold text-[#1a2a1b]">
                {benefit.title}
              </h3>

              {/* Description */}
              <p className="mt-2 text-sm leading-relaxed text-[#6b7c6f]">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

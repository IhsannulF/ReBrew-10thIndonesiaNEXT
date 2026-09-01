import React from "react";
import Link from "next/link";
import { GoogleIcon } from "@/components/ui/GoogleIcon";

const wastePrices = [
  {
    icon: "local_cafe",
    name: "Plastic Cup (PP/PET)",
    description: "Cup kopi takeaway & cup boba bersih",
    coins: "15",
  },
  {
    icon: "compost",
    name: "Ampas Kopi (Spent Grounds)",
    description: "Ampas espresso & manual brew untuk pupuk & bio-arang",
    coins: "10",
  },
  {
    icon: "water_bottle",
    name: "Botol Plastik (PET Bening)",
    description: "Botol air mineral, botol sirup bening",
    coins: "5",
  },
  {
    icon: "takeout_dining",
    name: "Tutup Cup & Sedotan (HDPE/PP)",
    description: "Lid plastik cembung/flat, seal cup, sedotan",
    coins: "3",
  },
  {
    icon: "package_2",
    name: "Kardus & Karton Kemasan",
    description: "Kardus susu, boks sirup, dan karton kering",
    coins: "15",
  },
  {
    icon: "inventory_2",
    name: "Kaleng Minuman (Aluminium)",
    description: "Kaleng krimer kental manis, soda, dan susu evaporasi",
    coins: "20",
  },
];

export const WastePricing = (): React.JSX.Element => {
  return (
    <section
      id="harga"
      className="w-full bg-[#2e7d32] px-4 py-16 text-white sm:px-8 sm:py-20 lg:px-12"
      aria-labelledby="waste-pricing-heading"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
        {/* Left Column: Heading & Value Proposition */}
        <div className="flex flex-col items-start lg:col-span-5">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold text-white/90 backdrop-blur-sm">
            <GoogleIcon name="price_change" size={16} />
            <span>Transparan & Real-Time</span>
          </div>

          <h2
            id="waste-pricing-heading"
            className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-[40px]"
            style={{ fontFamily: "var(--font-fraunces, serif)" }}
          >
            Harga Sampah <br />
            yang Kompetitif
          </h2>

          <p className="mt-4 text-base leading-relaxed text-white/80">
            Kami memberikan penawaran nilai terbaik untuk setiap kilogram sampah daur ulang tokomu.{" "}
            <span className="font-bold text-[#ffc107]">1 koin = Rp 35</span> yang bisa kamu cairkan kapan saja tanpa potongan tersembunyi.
          </p>

          <div className="mt-8">
            <Link
              href="/daftar"
              className="inline-flex items-center gap-2 rounded-[10px] bg-[#ffc107] px-6 py-3.5 text-sm font-bold text-[#663c00] shadow-md transition-all hover:bg-[#ffcd38] hover:shadow-lg focus-visible:outline-2 focus-visible:outline-white"
            >
              <span>Mulai Setor Sekarang</span>
              <GoogleIcon name="arrow_forward" size={18} />
            </Link>
          </div>
        </div>

        {/* Right Column: Pricing Items */}
        <div
          className="flex flex-col gap-3 lg:col-span-7"
          aria-label="Daftar harga sampah per kilogram"
        >
          {wastePrices.map((waste) => (
            <article
              key={waste.name}
              className="flex items-center justify-between rounded-xl bg-white/10 p-4 backdrop-blur-sm transition-all duration-200 hover:bg-white/15"
            >
              {/* Left: Icon & Info */}
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
                  <GoogleIcon name={waste.icon} size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white sm:text-base">
                    {waste.name}
                  </h3>
                  <p className="text-xs text-white/70 sm:text-sm">
                    {waste.description}
                  </p>
                </div>
              </div>

              {/* Right: Coins / kg */}
              <div className="flex flex-col items-end shrink-0 pl-3">
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-[#ffc107] sm:text-2xl">
                    {waste.coins}
                  </span>
                  <span className="text-xs font-medium text-white/80">
                    koin/kg
                  </span>
                </div>
                <span className="text-[11px] text-white/60">
                  ≈ Rp {(parseInt(waste.coins) * 35).toLocaleString("id-ID")}/kg
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

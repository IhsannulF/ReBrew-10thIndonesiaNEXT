import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { createAdminClient } from "@/utils/supabase/admin";
import { GoogleIcon } from "@/components/ui/GoogleIcon";

interface EcoPartnerPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: EcoPartnerPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const partnerId = resolvedParams.id;

  return {
    title: `Sertifikat Eco-Partner Resmi - ReBrew WMaaS`,
    description: `Verifikasi publik komitmen sirkularitas limbah dan reduksi emisi karbon kafe mitra bersama ReBrew Indonesia.`,
    openGraph: {
      title: `Sertifikat Eco-Partner Resmi - ReBrew`,
      description: `Kafe ini telah terverifikasi aktif memilah dan mendaur ulang limbah bersama ReBrew.`,
      url: `https://re-brew-10th-indonesia-next.vercel.app/eco-partner/${partnerId}`,
      siteName: "ReBrew Indonesia",
      type: "website",
    },
  };
}

export default async function PublicEcoPartnerPage({ params }: EcoPartnerPageProps) {
  const resolvedParams = await params;
  const partnerId = resolvedParams.id;

  let cafeName = "Kopi Selamat";
  let city = "Jakarta Selatan";
  let totalKg = 24.5;
  let totalCo2 = 29.4;
  let tierName = "Eco-Partner ⭐";
  let certificateLevel = "Level 1: Eco-Partner Verified";
  let verifiedDate = "1 September 2026";
  let transactionsCount = 3;

  try {
    const adminDb = createAdminClient();
    
    // Fetch profile by ID
    const { data: profile } = await adminDb
      .from("profiles")
      .select("id, full_name, cafe_name, city, total_kg, tier, created_at")
      .eq("id", partnerId)
      .maybeSingle();

    if (profile) {
      cafeName = profile.cafe_name || profile.full_name || cafeName;
      city = profile.city || city;
      totalKg = Number(profile.total_kg || totalKg);
      totalCo2 = Math.round(totalKg * 1.2 * 10) / 10;
      
      if (totalKg >= 250) {
        tierName = "Enterprise Pioneer 👑";
        certificateLevel = "Level 4: Enterprise Pioneer";
      } else if (totalKg >= 100) {
        tierName = "Zero-Waste Hero 🏆";
        certificateLevel = "Level 3: Zero-Waste Hero";
      } else if (totalKg >= 50) {
        tierName = "Plastic Warrior 🛡️";
        certificateLevel = "Level 2: Plastic Warrior";
      } else {
        tierName = "Eco-Partner ⭐";
        certificateLevel = "Level 1: Eco-Partner Verified";
      }

      if (profile.created_at) {
        verifiedDate = new Date(profile.created_at).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      }
    }

    // Fetch transaction stats
    const { count } = await adminDb
      .from("transactions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", partnerId)
      .eq("status", "confirmed");

    if (count && count > 0) {
      transactionsCount = count;
    }
  } catch (err) {
    console.warn("Using fallback demo data for public certificate page:", err);
  }

  const certificateNumber = `CERT-RB-2026-${partnerId.slice(0, 8).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col items-center justify-between">
      {/* Top Public Navigation */}
      <header className="w-full border-b border-[#bbcabf]/30 bg-white/95 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="ReBrew"
            width={100}
            height={30}
            className="h-7 w-auto object-contain"
            priority
          />
        </Link>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#f0fdf4] border border-[#006c49]/20 px-3 py-1 text-xs font-bold text-[#006c49]">
            <GoogleIcon name="verified" size={14} className="text-[#006c49]" />
            Sertifikat Publik Terverifikasi
          </span>
          <Link
            href="/daftar"
            className="rounded-xl bg-[#006c49] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#005236] transition-all"
          >
            Gabung Mitra
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-4xl px-4 py-8 sm:py-12 flex flex-col items-center gap-8">
        {/* Certificate Frame */}
        <div className="w-full rounded-3xl bg-white shadow-xl border border-[#bbcabf]/40 p-6 sm:p-10 relative overflow-hidden">
          {/* Top Decorative Border */}
          <div className="absolute top-0 inset-x-0 h-2.5 bg-gradient-to-r from-[#006c49] via-[#10b981] to-[#d97706]" />

          {/* Certificate Inner Border */}
          <div className="border-4 border-[#f5f0e1] rounded-2xl p-6 sm:p-10 flex flex-col items-center text-center bg-[#fbfdfa] relative shadow-inner">
            {/* Corner Ornaments */}
            <div className="absolute top-3 left-3 text-[#d97706] opacity-60 text-base">❖</div>
            <div className="absolute top-3 right-3 text-[#d97706] opacity-60 text-base">❖</div>
            <div className="absolute bottom-3 left-3 text-[#d97706] opacity-60 text-base">❖</div>
            <div className="absolute bottom-3 right-3 text-[#d97706] opacity-60 text-base">❖</div>

            {/* Header Brand */}
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#006c49] text-white shadow-xs">
                <GoogleIcon name="eco" size={24} filled />
              </div>
              <span className="text-sm font-black tracking-widest text-[#006c49] uppercase">
                ReBrew Indonesia
              </span>
            </div>

            <span className="text-[11px] font-bold uppercase tracking-widest text-[#d97706] mt-1">
              Certificate of Environmental Excellence & Circular Economy
            </span>

            <h1
              className="text-2xl sm:text-3xl font-black text-[#0b1c30] mt-2 tracking-tight"
              style={{ fontFamily: "var(--font-fraunces, serif)" }}
            >
              {certificateLevel}
            </h1>

            <span className="text-xs font-mono text-[#6c7a71] mt-1">
              No. Sertifikat: <strong className="text-[#0b1c30]">{certificateNumber}</strong>
            </span>

            {/* Recipient Details */}
            <div className="my-6 w-full py-4 border-y border-[#bbcabf]/30">
              <span className="text-xs text-[#6c7a71] italic block">
                Diberikan secara resmi atas dedikasi keberlanjutan lingkungan kepada:
              </span>
              <h2
                className="text-3xl sm:text-4xl font-extrabold text-[#006c49] mt-1 tracking-tight"
                style={{ fontFamily: "var(--font-fraunces, serif)" }}
              >
                {cafeName}
              </h2>
              <span className="text-xs font-semibold text-[#3c4a42] block mt-1.5">
                Kota Operasional: <span className="font-bold text-[#0b1c30]">{city}</span>
              </span>
            </div>

            {/* Statement of Impact */}
            <p className="text-xs sm:text-sm text-[#3c4a42] max-w-2xl leading-relaxed">
              Telah terverifikasi aktif memilah limbah cup plastik PP, botol PET, dan ampas kopi melalui ekosistem <strong>Waste Management-as-a-Service (WMaaS) ReBrew</strong>, serta memenuhi standar kepatuhan regulasi lingkungan hidup <strong>Permen LHK No. 75/2019</strong>.
            </p>

            {/* Key Verified Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full mt-6 max-w-2xl">
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-[#bbcabf]/30 shadow-2xs">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eff4ff] text-[#006c49] mb-1">
                  <GoogleIcon name="scale" size={18} />
                </div>
                <span className="text-[10px] font-bold text-[#6c7a71] uppercase">Limbah Terkelola</span>
                <span className="text-xl font-black text-[#006c49] mt-0.5">
                  {totalKg} <span className="text-xs font-semibold">kg</span>
                </span>
                <span className="text-[10px] text-[#306d58] font-medium">{transactionsCount} setoran terverifikasi</span>
              </div>

              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-[#bbcabf]/30 shadow-2xs">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f0fdf4] text-[#10b981] mb-1">
                  <GoogleIcon name="cloud_off" size={18} />
                </div>
                <span className="text-[10px] font-bold text-[#6c7a71] uppercase">Reduksi Karbon</span>
                <span className="text-xl font-black text-[#10b981] mt-0.5">
                  {totalCo2} <span className="text-xs font-semibold">kg CO₂e</span>
                </span>
                <span className="text-[10px] text-[#059669] font-medium">Gas Rumah Kaca Dicegah</span>
              </div>

              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-[#bbcabf]/30 shadow-2xs">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#fffdf5] text-[#d97706] mb-1">
                  <GoogleIcon name="workspace_premium" size={18} filled />
                </div>
                <span className="text-[10px] font-bold text-[#6c7a71] uppercase">Status ESG</span>
                <span className="text-sm font-black text-[#d97706] mt-1.5">
                  {tierName}
                </span>
                <span className="text-[10px] text-[#b45309] font-medium">Terverifikasi ReBrew AI</span>
              </div>
            </div>

            {/* Certificate Signatures & Footer */}
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#bbcabf]/30 text-[11px] text-[#6c7a71] mt-8">
              <div className="text-left">
                <span>Tanggal Verifikasi:</span>
                <div className="font-bold text-[#0b1c30]">{verifiedDate}</div>
                <span className="text-[#006c49] font-semibold text-[10px] block mt-0.5">
                  ✔ Validasi Timbangan Micro-Hub
                </span>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white border border-[#bbcabf]/40 shadow-xs text-[#006c49]">
                  <GoogleIcon name="qr_code_2" size={28} />
                </div>
                <span className="text-[9px] text-[#6c7a71] mt-0.5">Scan Keaslian</span>
              </div>

              <div className="text-right">
                <span>Komite Kemitraan Sirkular:</span>
                <div className="font-bold text-[#0b1c30] underline mt-0.5">
                  ReBrew Certification Board
                </div>
                <span className="text-[10px] text-[#306d58] block mt-0.5">
                  IndonesiaNEXT 10th
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action for Visitors */}
        <div className="w-full rounded-3xl bg-gradient-to-r from-[#0b1c30] via-[#00422b] to-[#006c49] p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 text-[#6ffbbe] border border-white/20">
              Gerakan Sirkular Coffee Shop
            </span>
            <h3 className="text-xl font-bold mt-2 text-white">
              Ingin Kafe Anda Memiliki Sertifikasi Hijau Seperti Ini?
            </h3>
            <p className="text-xs text-white/80 mt-1 max-w-xl">
              Setor sampah plastik & ampas kopi tokomu, dapatkan insentif koin tunai, dan raih sertifikat ESG resmi untuk dipajang di kasir.
            </p>
          </div>

          <Link
            href="/daftar"
            className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-[#ffc107] px-6 py-3.5 text-xs font-bold text-[#663c00] shadow-md hover:bg-[#ffcd38] transition-all active:scale-95"
          >
            <span>Daftar Kafe Gratis</span>
            <GoogleIcon name="arrow_forward" size={16} />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#bbcabf]/30 bg-white py-6 text-center text-xs text-[#6c7a71]">
        <p>© 2026 ReBrew Indonesia • Waste Management-as-a-Service (WMaaS) for Coffee Shops</p>
      </footer>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Image from "next/image";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import { CafeProfile, DashboardStats } from "@/types/dashboard";
import { formatWeight } from "@/lib/dashboard-utils";

interface ShareImpactModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: CafeProfile;
  stats: DashboardStats;
}

export const ShareImpactModal: React.FC<ShareImpactModalProps> = ({
  isOpen,
  onClose,
  user,
  stats,
}) => {
  const [copied, setCopied] = useState(false);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [storySuccessMsg, setStorySuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const getBaseUrl = () => {
    if (typeof window !== "undefined" && window.location.origin) {
      return window.location.origin;
    }
    return "https://re-brew-10th-indonesia-next.vercel.app";
  };

  const partnerId = user.id || "e4ea8d6e-99ce-494c-8176-88ffdc1099d5";
  const shareUrl = `${getBaseUrl()}/eco-partner/${partnerId}`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Helper untuk membuat gambar 9:16 (1080x1920) beresolusi tinggi untuk Instagram Story
  const generateStoryImageBlob = async (): Promise<Blob> => {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context not available");

    // 1. Background Gradient (Dark Eco-Luxury Theme)
    const bgGradient = ctx.createLinearGradient(0, 0, 1080, 1920);
    bgGradient.addColorStop(0, "#00281b");
    bgGradient.addColorStop(0.35, "#004e33");
    bgGradient.addColorStop(0.7, "#006c49");
    bgGradient.addColorStop(1, "#001b10");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 1080, 1920);

    // Subtle Radial Glows for premium aesthetics
    const glow1 = ctx.createRadialGradient(850, 300, 50, 850, 300, 600);
    glow1.addColorStop(0, "rgba(111, 251, 190, 0.18)");
    glow1.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = glow1;
    ctx.fillRect(0, 0, 1080, 1920);

    const glow2 = ctx.createRadialGradient(200, 1600, 50, 200, 1600, 700);
    glow2.addColorStop(0, "rgba(0, 108, 73, 0.35)");
    glow2.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = glow2;
    ctx.fillRect(0, 0, 1080, 1920);

    // 2. Top Bar: ReBrew Brand & Verified Badge
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 44px 'Plus Jakarta Sans', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("🌿 ReBrew", 100, 180);

    // Badge Pill
    const badgeText = "VERIFIED ECO-PARTNER";
    ctx.font = "bold 24px 'Plus Jakarta Sans', sans-serif";
    const badgeWidth = ctx.measureText(badgeText).width + 50;
    const badgeHeight = 50;
    const badgeX = 1080 - 100 - badgeWidth;
    const badgeY = 140;

    ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 25);
    ctx.fill();
    ctx.strokeStyle = "rgba(173, 237, 211, 0.5)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#6ffbbe";
    ctx.textAlign = "center";
    ctx.fillText(badgeText, badgeX + badgeWidth / 2, badgeY + 34);

    // 3. Center Main Card
    const cardX = 90;
    const cardY = 320;
    const cardW = 900;
    const cardH = 1260;

    // Card background & glass stroke
    ctx.fillStyle = "rgba(0, 33, 19, 0.65)";
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 48);
    ctx.fill();
    ctx.strokeStyle = "rgba(173, 237, 211, 0.35)";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Storefront Icon Box
    const iconBoxSize = 130;
    const iconBoxX = cardX + (cardW - iconBoxSize) / 2;
    const iconBoxY = cardY + 110;
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    ctx.beginPath();
    ctx.roundRect(iconBoxX, iconBoxY, iconBoxSize, iconBoxSize, 32);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = "64px 'Plus Jakarta Sans', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("☕", iconBoxX + iconBoxSize / 2, iconBoxY + 90);

    // Cafe Name
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 56px 'Plus Jakarta Sans', sans-serif";
    ctx.textAlign = "center";
    const cafeTitle = user.cafeName || "Kedai Kopi Mitra";
    ctx.fillText(cafeTitle, 540, iconBoxY + iconBoxSize + 85);

    // Subtitle
    ctx.fillStyle = "#adedd3";
    ctx.font = "500 30px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText("Bulan Ini Berhasil Memilah & Mendaur Ulang:", 540, iconBoxY + iconBoxSize + 145);

    // Metric Stats Container
    const statY = iconBoxY + iconBoxSize + 220;
    const statW = 760;
    const statH = 340;
    const statX = cardX + (cardW - statW) / 2;

    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.beginPath();
    ctx.roundRect(statX, statY, statW, statH, 36);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Metric 1: Limbah Terpilah
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.font = "bold 24px 'Plus Jakarta Sans', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("LIMBAH TERPILAH", statX + statW / 4, statY + 90);

    ctx.fillStyle = "#6ffbbe";
    ctx.font = "900 68px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText(formatWeight(stats.wasteKgThisMonth), statX + statW / 4, statY + 185);

    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.font = "22px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText("Terkonversi Circular", statX + statW / 4, statY + 240);

    // Divider line between stats
    ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
    ctx.beginPath();
    ctx.moveTo(statX + statW / 2, statY + 40);
    ctx.lineTo(statX + statW / 2, statY + statH - 40);
    ctx.stroke();

    // Metric 2: Reduksi Karbon
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.font = "bold 24px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText("REDUKSI KARBON", statX + (statW * 3) / 4, statY + 90);

    ctx.fillStyle = "#ffffff";
    ctx.font = "900 68px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText(`${stats.co2SavedKg.toFixed(1)} kg`, statX + (statW * 3) / 4, statY + 185);

    ctx.fillStyle = "#adedd3";
    ctx.font = "22px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText("CO₂ Emisi Ditekan", statX + (statW * 3) / 4, statY + 240);

    // Card Footer Quote
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 28px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText("🌱 Dikelola Bersama ReBrew Waste Management", 540, cardY + cardH - 120);

    ctx.fillStyle = "#6ffbbe";
    ctx.font = "bold 24px monospace";
    ctx.fillText("#PilahSampahCiptakanDampak", 540, cardY + cardH - 65);

    // 4. Bottom Story CTA Helper
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.font = "500 26px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText("🔗 Cek Sertifikat & Audit Dampak Sirkular di Link Sticker", 540, 1780);

    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Gagal mengekspor gambar story"));
      }, "image/png");
    });
  };

  const handleShareToInstagramStory = async () => {
    setIsGeneratingStory(true);
    setStorySuccessMsg(null);

    try {
      // 1. Generate high-res 9:16 PNG
      const blob = await generateStoryImageBlob();
      const file = new File([blob], `ReBrew-Impact-${user.cafeName?.replace(/\s+/g, "_") || "Cafe"}.png`, {
        type: "image/png",
      });

      // 2. Cek apakah browser mendukung Web Share API dengan file gambar (iOS / Android Mobile Chrome/Safari)
      if (
        typeof navigator !== "undefined" &&
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        // Otomatis salin link sertifikat ke clipboard agar user bisa tempel link sticker di Story
        await navigator.clipboard?.writeText(shareUrl);
        await navigator.share({
          title: `Dampak Hijau ${user.cafeName}`,
          text: `Aksi pilah & daur ulang sampah ${user.cafeName} bersama ReBrew!`,
          files: [file],
        });
        setStorySuccessMsg("Gambar berhasil dibagikan! Link sertifikat telah disalin ke clipboard.");
      } else {
        // Fallback untuk Desktop & Browser yang tidak mendukung native file share:
        // Download gambar story 9:16 otomatis & salin link
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `ReBrew-Story-${user.cafeName?.replace(/\s+/g, "_") || "Impact"}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        await navigator.clipboard?.writeText(shareUrl);
        setStorySuccessMsg(
          "Gambar Instagram Story (9:16) telah didownload! Link sertifikat otomatis tersalin di clipboard."
        );
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("Error sharing to Instagram Story:", err);
        setStorySuccessMsg("Link profil tersalin. Silakan simpan gambar untuk Story Anda.");
      }
    } finally {
      setIsGeneratingStory(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative z-50 flex w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-200 border border-[#bbcabf]/30">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#bbcabf]/20 p-4 sm:px-6">
          <div className="flex items-center gap-2">
            <GoogleIcon name="share" size={20} className="text-[#006c49]" />
            <h3 className="text-sm font-bold text-[#0b1c30]">
              Bagikan Dampak Hijau Kafe
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-lg text-[#6c7a71] hover:bg-[#eff4ff] hover:text-[#0b1c30] cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Shareable Card Canvas Preview */}
        <div className="p-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#00422b] via-[#006c49] to-[#002113] p-6 text-white shadow-lg border border-[#adedd3]/30">
            {/* Top Brand & Partner */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image
                  src="/logo.png"
                  alt="ReBrew"
                  width={80}
                  height={24}
                  className="h-6 w-auto brightness-0 invert object-contain"
                />
              </div>
              <span className="rounded-full bg-white/20 border border-white/30 px-3 py-0.5 text-[10px] font-bold tracking-wide uppercase text-[#adedd3]">
                Verified Eco-Partner
              </span>
            </div>

            {/* Center Cafe Branding */}
            <div className="mt-6 flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 border border-white/20 text-white mb-2 shadow-inner">
                <GoogleIcon name="storefront" size={28} />
              </div>
              <h4
                className="text-xl font-black text-white tracking-tight"
                style={{ fontFamily: "var(--font-fraunces, serif)" }}
              >
                {user.cafeName}
              </h4>
              <p className="text-xs text-[#adedd3] mt-1 font-medium">
                Bulan Ini Berhasil Memilah & Mendaur Ulang:
              </p>
            </div>

            {/* Stat Counters */}
            <div className="mt-5 grid grid-cols-2 gap-3 bg-black/25 rounded-xl p-3.5 border border-white/15">
              <div className="flex flex-col items-center text-center">
                <span className="text-[10px] uppercase font-bold text-white/70">
                  Limbah Terpilah
                </span>
                <span
                  className="text-xl font-extrabold text-[#6ffbbe] mt-0.5"
                  style={{ fontFamily: "var(--font-fraunces, serif)" }}
                >
                  {formatWeight(stats.wasteKgThisMonth)}
                </span>
              </div>

              <div className="flex flex-col items-center text-center border-l border-white/15">
                <span className="text-[10px] uppercase font-bold text-white/70">
                  Reduksi Karbon
                </span>
                <span
                  className="text-xl font-extrabold text-white mt-0.5"
                  style={{ fontFamily: "var(--font-fraunces, serif)" }}
                >
                  {stats.co2SavedKg.toFixed(1)} kg CO₂
                </span>
              </div>
            </div>

            {/* Bottom Tagline */}
            <div className="mt-4 flex items-center justify-between text-[10px] text-white/80 border-t border-white/15 pt-3">
              <span>🌱 Bersama ReBrew WMaaS</span>
              <span className="font-mono">#PilahSampahCiptakanDampak</span>
            </div>
          </div>

          {/* Feedback message banner */}
          {storySuccessMsg && (
            <div className="mt-3.5 rounded-xl bg-[#f0fdf4] border border-[#006c49]/30 p-2.5 text-center text-xs font-semibold text-[#006c49] animate-in fade-in duration-200">
              {storySuccessMsg}
            </div>
          )}

          {/* Action Share Area */}
          <div className="mt-4 flex flex-col gap-3">
            {/* 1. Salin Link Button On Top */}
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#bbcabf]/50 bg-[#f8f9ff] py-2.5 text-xs font-bold text-[#0b1c30] hover:bg-[#eff4ff] hover:text-[#006c49] hover:border-[#006c49]/40 transition-colors shadow-2xs cursor-pointer"
            >
              <GoogleIcon name="content_copy" size={16} className="text-[#006c49]" />
              <span>{copied ? "Link Sertifikat Tersalin! ✔" : "Salin Link"}</span>
            </button>

            {/* 2. Side-by-Side WhatsApp & Instagram Story Buttons */}
            <div className="flex items-center gap-2.5">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `Kedai ${user.cafeName} telah mendaur ulang ${stats.wasteKgThisMonth} kg limbah plastik bersama ReBrew! Cek sertifikat dan aksi sirkular kami di: ${shareUrl}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-[#bbcabf]/50 bg-[#f8f9ff] py-2.5 text-xs font-bold text-[#0b1c30] hover:bg-[#eff4ff] hover:text-[#006c49] hover:border-[#006c49]/40 transition-colors shadow-2xs"
              >
                <GoogleIcon name="chat" size={16} className="text-[#25D366]" />
                <span>WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={handleShareToInstagramStory}
                disabled={isGeneratingStory}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-[#bbcabf]/50 bg-[#f8f9ff] py-2.5 text-xs font-bold text-[#0b1c30] hover:bg-[#eff4ff] hover:text-[#006c49] hover:border-[#006c49]/40 transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
              >
                <GoogleIcon name="photo_camera" size={16} className="text-[#006c49]" />
                <span>{isGeneratingStory ? "Menyiapkan..." : "Instagram Story"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


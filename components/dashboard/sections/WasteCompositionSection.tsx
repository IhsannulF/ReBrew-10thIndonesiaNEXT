import React from "react";
import Link from "next/link";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import { WasteCompositionItem } from "@/types/dashboard";
import { formatWeight } from "@/lib/dashboard-utils";

interface WasteCompositionSectionProps {
  composition: WasteCompositionItem[];
  totalWasteKg: number;
}

export const WasteCompositionSection: React.FC<WasteCompositionSectionProps> = ({
  composition,
  totalWasteKg,
}) => {
  const getCategoryTheme = (key: string) => {
    switch (key) {
      case "cup_plastik":
        return {
          bg: "bg-gradient-to-br from-[#f0f9ff] to-[#e0f2fe]/60",
          border: "border-[#bae6fd]",
          text: "text-[#0369a1]",
          badgeBg: "bg-[#e0f2fe] text-[#0284c7]",
        };
      case "kardus":
        return {
          bg: "bg-gradient-to-br from-[#fffdf5] to-[#fef3c7]/60",
          border: "border-[#fde68a]",
          text: "text-[#92400e]",
          badgeBg: "bg-[#fef3c7] text-[#d97706]",
        };
      case "botol_plastik":
        return {
          bg: "bg-gradient-to-br from-[#f6fcf8] to-[#dcfce7]/60",
          border: "border-[#a7f3d0]",
          text: "text-[#15803d]",
          badgeBg: "bg-[#dcfce7] text-[#16a34a]",
        };
      case "kaleng":
        return {
          bg: "bg-gradient-to-br from-[#f0fdfa] to-[#ccfbf1]/60",
          border: "border-[#99f6e4]",
          text: "text-[#0f766e]",
          badgeBg: "bg-[#ccfbf1] text-[#0d9488]",
        };
      case "tutup_cup":
        return {
          bg: "bg-gradient-to-br from-[#faf8ff] to-[#ede9fe]/60",
          border: "border-[#ddd6fe]",
          text: "text-[#5b21b6]",
          badgeBg: "bg-[#ede9fe] text-[#7c3aed]",
        };
      default:
        return {
          bg: "bg-[#f9faf8]",
          border: "border-[#bbcabf]/30",
          text: "text-[#0b1c30]",
          badgeBg: "bg-[#eff4ff] text-[#3c4a42]",
        };
    }
  };

  const hasData = totalWasteKg > 0 && composition.some((c) => c.weightKg > 0);

  return (
    <section
      className="flex w-full flex-col rounded-2xl border border-[#bbcabf]/40 bg-white p-6 sm:p-7 shadow-xs"
      aria-labelledby="waste-distribution-heading"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-[#bbcabf]/20">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eff4ff] text-[#006c49] shadow-2xs">
            <GoogleIcon name="pie_chart" size={20} />
          </div>
          <div>
            <h2
              id="waste-distribution-heading"
              className="text-base sm:text-lg font-bold text-[#0b1c30]"
            >
              Komposisi Kategori Sampah Kafe
            </h2>
            <p className="text-xs sm:text-sm text-[#3c4a42] mt-0.5">
              Pilah sampah berdasarkan kategori material bahan baku daur ulang
            </p>
          </div>
        </div>

        <span className="self-start sm:self-auto text-xs sm:text-sm font-bold text-[#006c49] bg-[#eff4ff] px-3.5 py-1.5 rounded-xl border border-[#adedd3] shadow-2xs">
          Total: {formatWeight(totalWasteKg)}
        </span>
      </div>

      {/* Multi-segment Progress Bar */}
      <div className="mt-6 flex flex-col gap-3">
        {hasData ? (
          <div className="h-4 w-full overflow-hidden rounded-full bg-[#f1f5f9] flex shadow-inner p-0.5">
            {composition.map((item) => (
              <div
                key={item.key}
                style={{
                  width: `${item.percentage}%`,
                  backgroundColor: item.color,
                }}
                className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-500 hover:opacity-90"
                title={`${item.name}: ${item.weightKg} kg (${item.percentage}%)`}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#f8f9ff] border border-[#bbcabf]/30 text-xs text-[#3c4a42]">
            <div className="flex items-center gap-2">
              <GoogleIcon name="info" size={17} className="text-[#006c49]" />
              <span>Belum ada setoran sampah. Komposisi akan terhitung otomatis saat Anda mulai menyetor.</span>
            </div>
            <Link
              href="/dashboard/setor"
              className="font-bold text-[#006c49] hover:underline shrink-0 ml-2"
            >
              Setor Sekarang →
            </Link>
          </div>
        )}

        {/* 5-Category Legends Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-3">
          {composition.map((item) => {
            const theme = getCategoryTheme(item.key);
            return (
              <div
                key={item.key}
                className={`flex items-center justify-between p-3.5 rounded-2xl border ${theme.border} ${theme.bg} transition-all hover:shadow-xs hover:-translate-y-0.5`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="h-3.5 w-3.5 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs sm:text-sm font-bold text-[#0b1c30] truncate">
                      {item.name}
                    </span>
                    <span className="text-[11px] text-[#3c4a42]">
                      +{item.points} Poin/kg
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0 pl-2">
                  <span className={`text-xs sm:text-sm font-black ${theme.text}`}>
                    {formatWeight(item.weightKg)}
                  </span>
                  <span className="text-[11px] font-semibold text-[#3c4a42]">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

"use client";

import React from "react";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import { WASTE_CATEGORIES } from "@/constants/wasteData";

export interface WasteCategoryListProps {
  weights: Record<string, number>;
  shareRate?: number;
  handleWeightChange: (id: string, value: string) => void;
  adjustWeight: (id: string, delta: number) => void;
  resetWeights?: () => void;
}

export const WasteCategoryList: React.FC<WasteCategoryListProps> = ({
  weights,
  shareRate = 0.35,
  handleWeightChange,
  adjustWeight,
  resetWeights,
}) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Section Title & Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-[#0b1c30] flex items-center gap-2">
            <GoogleIcon name="category" size={20} className="text-[#006c49]" />
            Kategori Sampah & Estimasi Berat
          </h2>
        </div>
        {resetWeights && (
          <button
            type="button"
            onClick={resetWeights}
            className="text-xs font-semibold text-[#6c7a71] hover:text-[#ba1a1a] transition-colors self-start sm:self-center flex items-center gap-1"
          >
            <GoogleIcon name="refresh" size={15} />
            <span>Reset Input</span>
          </button>
        )}
      </div>

      {/* List Categories */}
      <div className="flex flex-col gap-3">
        {WASTE_CATEGORIES.map((cat) => {
          const currentWeight = weights[cat.id] || 0;
          const hasWeight = currentWeight > 0;
          
          // Kalkulasi Poin & Rupiah (1 Poin = Rp 35)
          const pointPerKg = cat.pointPerKg;
          const subtotalPoints = Math.round(currentWeight * pointPerKg);
          const subtotalRupiah = subtotalPoints * 35;

          return (
            <div
              key={cat.id}
              className={`flex flex-col p-4 rounded-2xl border transition-all ${
                hasWeight
                  ? "bg-white border-[#006c49]/40 shadow-xs ring-1 ring-[#006c49]/15"
                  : "bg-white border-[#bbcabf]/30 hover:border-[#bbcabf]/60"
              }`}
            >
              {/* Header Baris Kategori */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                {/* Info Kategori & Harga */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl transition-colors ${
                      hasWeight
                        ? "bg-[#006c49] text-white"
                        : "bg-[#eff4ff] text-[#006c49]"
                    }`}
                  >
                    <GoogleIcon name={cat.icon} size={24} />
                  </div>

                  <div className="flex flex-col min-w-0 justify-center">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-[#0b1c30]">
                        {cat.name}
                      </h3>
                      <span className="text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#f0fdf4] text-[#006c49] border border-[#006c49]/20">
                        {pointPerKg} Poin/kg (Rp {(pointPerKg * 35).toLocaleString("id-ID")}/kg)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Counter Input Berat (kg) & Subtotal */}
                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                  <div className="flex items-center rounded-xl border border-[#bbcabf]/40 bg-[#f8f9ff] p-1">
                    <button
                      type="button"
                      onClick={() => adjustWeight(cat.id, -0.5)}
                      disabled={currentWeight <= 0}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-[#0b1c30] shadow-2xs hover:bg-[#eff4ff] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      aria-label={`Kurangi ${cat.name}`}
                    >
                      <GoogleIcon name="remove" size={16} />
                    </button>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={currentWeight === 0 ? "" : currentWeight}
                      placeholder="0.0"
                      onChange={(e) => handleWeightChange(cat.id, e.target.value)}
                      className="w-14 text-center text-sm font-bold text-[#0b1c30] bg-transparent outline-none"
                      aria-label={`Berat ${cat.name}`}
                    />
                    <span className="text-xs font-semibold text-[#6c7a71] pr-1.5">kg</span>
                    <button
                      type="button"
                      onClick={() => adjustWeight(cat.id, 0.5)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#006c49] text-white shadow-2xs hover:bg-[#2b6954] transition-colors"
                      aria-label={`Tambah ${cat.name}`}
                    >
                      <GoogleIcon name="add" size={16} />
                    </button>
                  </div>

                  {/* Subtotal Poin & Rupiah */}
                  <div className="w-24 text-right shrink-0">
                    <div
                      className={`text-xs font-bold ${
                        hasWeight ? "text-[#006c49]" : "text-[#6c7a71]"
                      }`}
                    >
                      +{subtotalPoints.toLocaleString("id-ID")} pt
                    </div>
                    <div className="text-[10px] text-[#6c7a71]">
                      ≈ Rp {subtotalRupiah.toLocaleString("id-ID")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


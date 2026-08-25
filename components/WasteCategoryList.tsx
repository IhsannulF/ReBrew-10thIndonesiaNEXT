"use client";

import React from "react";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import { WASTE_CATEGORIES } from "@/constants/wasteData";

export interface WasteCategoryListProps {
  weights: Record<string, number>;
  handleWeightChange: (id: string, value: string) => void;
  adjustWeight: (id: string, delta: number) => void;
}

export const WasteCategoryList: React.FC<WasteCategoryListProps> = ({
  weights,
  handleWeightChange,
  adjustWeight,
}) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Section Title */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-[#0b1c30] flex items-center gap-2">
          <GoogleIcon name="category" size={20} className="text-[#006c49]" />
          Pilih Jenis Sampah & Berat (kg)
        </h2>
        <span className="text-xs text-[#6c7a71]">
          Harga poin per kg
        </span>
      </div>

      {/* List Categories */}
      <div className="flex flex-col gap-3">
        {WASTE_CATEGORIES.map((cat) => {
          const currentWeight = weights[cat.id] || 0;
          const hasWeight = currentWeight > 0;
          const subtotalPoints = Math.round(currentWeight * cat.pointPerKg);

          return (
            <div
              key={cat.id}
              className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl border transition-all ${
                hasWeight
                  ? "bg-white border-[#006c49]/50 shadow-sm ring-1 ring-[#006c49]/20"
                  : "bg-white border-[#bbcabf]/30 hover:border-[#bbcabf]/60"
              }`}
            >
              {/* Info Kategori */}
              <div className="flex items-start gap-3.5 min-w-0 mb-3 sm:mb-0">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl transition-colors ${
                    hasWeight
                      ? "bg-[#006c49] text-white"
                      : "bg-[#eff4ff] text-[#006c49]"
                  }`}
                >
                  <GoogleIcon name={cat.icon} size={24} />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#0b1c30] truncate">
                      {cat.name}
                    </h3>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#f8f9ff] text-[#306d58] border border-[#bbcabf]/30">
                      {cat.pointPerKg} Poin/kg
                    </span>
                  </div>
                  <p className="text-xs text-[#6c7a71] mt-0.5 line-clamp-1">
                    {cat.description}
                  </p>
                </div>
              </div>

              {/* Counter Input Berat (kg) */}
              <div className="flex items-center gap-2 self-end sm:self-center">
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

                {/* Subtotal Poin */}
                <div className="w-16 text-right">
                  <span
                    className={`text-xs font-bold ${
                      hasWeight ? "text-[#006c49]" : "text-[#6c7a71]"
                    }`}
                  >
                    +{subtotalPoints} pt
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

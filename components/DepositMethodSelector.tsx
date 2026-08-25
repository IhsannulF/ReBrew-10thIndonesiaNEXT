"use client";

import React from "react";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import { DROP_POINTS } from "@/constants/wasteData";
import { DepositMethod, DepositSummary } from "@/hooks/useDepositCalculator";

export interface DepositMethodSelectorProps {
  method: DepositMethod;
  setMethod: (method: DepositMethod) => void;
  selectedDropPoint: string;
  setSelectedDropPoint: (id: string) => void;
  summary: DepositSummary;
}

export const DepositMethodSelector: React.FC<DepositMethodSelectorProps> = ({
  method,
  setMethod,
  selectedDropPoint,
  setSelectedDropPoint,
  summary,
}) => {
  return (
    <div className="flex flex-col gap-5">
      {/* Pilihan Metode */}
      <div className="rounded-2xl border border-[#bbcabf]/30 bg-white p-5 shadow-2xs">
        <h2 className="text-base font-bold text-[#0b1c30] mb-3 flex items-center gap-2">
          <GoogleIcon name="local_shipping" size={20} className="text-[#006c49]" />
          Metode Penyetoran
        </h2>

        <div className="grid grid-cols-2 gap-3">
          {/* Option: Drop Point */}
          <button
            type="button"
            onClick={() => setMethod("drop_point")}
            className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all ${
              method === "drop_point"
                ? "border-[#006c49] bg-[#eff4ff] ring-1 ring-[#006c49]"
                : "border-[#bbcabf]/30 hover:bg-[#f8f9ff]"
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1.5">
              <GoogleIcon
                name="store"
                size={22}
                className={method === "drop_point" ? "text-[#006c49]" : "text-[#6c7a71]"}
              />
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#10b981]/20 text-[#00422b]">
                100% Poin
              </span>
            </div>
            <div className="text-sm font-bold text-[#0b1c30]">Drop Point</div>
            <div className="text-xs text-[#3c4a42] mt-0.5">Antar ke titik kumpul</div>
          </button>

          {/* Option: Dijemput */}
          <button
            type="button"
            onClick={() => setMethod("dijemput")}
            className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all ${
              method === "dijemput"
                ? "border-[#006c49] bg-[#eff4ff] ring-1 ring-[#006c49]"
                : "border-[#bbcabf]/30 hover:bg-[#f8f9ff]"
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1.5">
              <GoogleIcon
                name="electric_moped"
                size={22}
                className={method === "dijemput" ? "text-[#006c49]" : "text-[#6c7a71]"}
              />
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#fff3cd] text-[#856404]">
                -15% Jasa
              </span>
            </div>
            <div className="text-sm font-bold text-[#0b1c30]">Dijemput Armada</div>
            <div className="text-xs text-[#3c4a42] mt-0.5">Min. 2.0 kg sampah</div>
          </button>
        </div>

        {/* Drop Point Selector / Form Alamat */}
        <div className="mt-4 pt-4 border-t border-[#bbcabf]/20">
          {method === "drop_point" ? (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#0b1c30]">
                Pilih Lokasi Drop Point Terdekat:
              </label>
              <div className="flex flex-col gap-2">
                {DROP_POINTS.map((dp) => (
                  <label
                    key={dp.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      selectedDropPoint === dp.id
                        ? "bg-[#f0fdf4] border-[#006c49]"
                        : "border-[#bbcabf]/30 hover:bg-[#f8f9ff]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="drop_point"
                      value={dp.id}
                      checked={selectedDropPoint === dp.id}
                      onChange={() => setSelectedDropPoint(dp.id)}
                      className="mt-1 accent-[#006c49]"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#0b1c30] truncate">{dp.name}</span>
                        <span className="text-[11px] font-semibold text-[#006c49] shrink-0 ml-1">{dp.distance}</span>
                      </div>
                      <p className="text-[11px] text-[#6c7a71] mt-0.5">{dp.address}</p>
                      <span className="text-[10px] text-[#306d58] font-medium block mt-1">🕒 {dp.hours}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              <label className="text-xs font-bold text-[#0b1c30]">Alamat Penjemputan Kafe:</label>
              <textarea
                rows={2}
                defaultValue="Kopi Selamat Cafe, Jl. Raya Gubeng No. 18, Surabaya"
                className="w-full text-xs p-2.5 rounded-xl border border-[#bbcabf]/40 bg-[#f8f9ff] text-[#0b1c30] focus:ring-1 focus:ring-[#006c49] outline-none"
                placeholder="Masukkan alamat lengkap penjemputan..."
              />
              {!summary.isPickupEligible && (
                <div className="flex items-center gap-1.5 text-xs text-[#ba1a1a] bg-[#ffdad6]/40 p-2 rounded-lg">
                  <GoogleIcon name="warning" size={16} />
                  <span>Total berat minimal 2.0 kg untuk penjemputan armada.</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Ringkasan Estimasi & Submit Button */}
      <div className="rounded-2xl border border-[#bbcabf]/30 bg-white p-5 shadow-xs flex flex-col gap-4">
        <h3 className="text-sm font-bold text-[#0b1c30]">Ringkasan Penyetoran</h3>

        <div className="flex flex-col gap-2 text-xs">
          <div className="flex justify-between text-[#3c4a42]">
            <span>Total Berat Sampah:</span>
            <span className="font-bold text-[#0b1c30]">{summary.totalWeight} kg</span>
          </div>
          <div className="flex justify-between text-[#3c4a42]">
            <span>Estimasi Mencegah CO₂:</span>
            <span className="font-bold text-[#006c49]">{summary.totalCo2} kg CO₂e</span>
          </div>
          <div className="flex justify-between text-[#3c4a42]">
            <span>Metode Penyetoran:</span>
            <span className="font-semibold text-[#0b1c30]">
              {method === "drop_point" ? "Drop Point (Penuh)" : "Dijemput (-15%)"}
            </span>
          </div>
          <div className="my-1 border-t border-[#bbcabf]/20" />
          <div className="flex justify-between items-center text-sm">
            <span className="font-bold text-[#0b1c30]">Total Poin Diperoleh:</span>
            <span className="text-lg font-extrabold text-[#006c49]">+{summary.finalPoints} Poin</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={summary.totalWeight === 0 || (method === "dijemput" && !summary.isPickupEligible)}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-[#006c49] text-white text-sm font-bold shadow-sm hover:bg-[#2b6954] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <GoogleIcon name="check_circle" size={20} />
          <span>Konfirmasi & Buat Tiket Setor</span>
        </button>
      </div>
    </div>
  );
};

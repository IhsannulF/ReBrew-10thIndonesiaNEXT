"use client";

import React from "react";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import { PaymentChannel, PayoutFormData } from "@/types/payout";
import { PAYMENT_CHANNELS, MIN_WITHDRAW_POINTS, COIN_RATE } from "@/constants/payoutData";

interface PayoutFormProps {
  formData: PayoutFormData;
  formErrors: Record<string, string>;
  generalError?: string | null;
  isSubmitting: boolean;
  selectedChannel: PaymentChannel;
  balancePoints: number;
  calculatedAmountIdr: number;
  adminFeeIdr: number;
  netAmountIdr: number;
  onChannelChange: (id: string) => void;
  onAccountNumberChange: (num: string) => void;
  onAccountHolderNameChange: (name: string) => void;
  onPointsChange: (pts: number) => void;
  onPresetPercentage: (pct: number) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const PayoutForm: React.FC<PayoutFormProps> = ({
  formData,
  formErrors,
  generalError,
  isSubmitting,
  selectedChannel,
  balancePoints,
  calculatedAmountIdr,
  adminFeeIdr,
  netAmountIdr,
  onChannelChange,
  onAccountNumberChange,
  onAccountHolderNameChange,
  onPointsChange,
  onPresetPercentage,
  onSubmit,
}) => {
  const bankChannels = PAYMENT_CHANNELS.filter((c) => c.type === "bank");
  const ewalletChannels = PAYMENT_CHANNELS.filter((c) => c.type === "ewallet");

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-6 rounded-3xl border border-[#bbcabf]/30 bg-white p-6 sm:p-7 shadow-xs w-full"
    >
      <div className="flex items-center justify-between border-b border-[#bbcabf]/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eff4ff] text-[#006c49]">
            <GoogleIcon name="send_to_mobile" size={22} />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#0b1c30]">
              Formulir Penarikan Saldo
            </h2>
            <p className="text-xs text-[#3c4a42] mt-0.5">
              Masukkan detail nomor rekening atau e-wallet tujuan penarikan
            </p>
          </div>
        </div>
      </div>

      {generalError && (
        <div className="p-3.5 rounded-2xl bg-[#ffdad6]/40 border border-[#ba1a1a]/30 text-xs text-[#ba1a1a] font-semibold flex items-center gap-2">
          <GoogleIcon name="error" size={18} />
          <span>{generalError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Kolom Kiri: Input Detail Rekening */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* 1. Pilih Bank / E-Wallet */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-[#0b1c30] flex items-center justify-between">
              <span>Metode Transfer Tujuan:</span>
              <span className="text-[11px] font-medium text-[#6c7a71]">Bank & E-Wallet Resmi</span>
            </label>

            <select
              value={formData.channelId}
              onChange={(e) => onChannelChange(e.target.value)}
              className="w-full text-sm font-semibold p-3.5 rounded-2xl border border-[#bbcabf]/40 bg-[#f8f9ff] text-[#0b1c30] focus:bg-white focus:border-[#006c49] focus:ring-1 focus:ring-[#006c49] outline-none cursor-pointer transition-all"
            >
              <optgroup label="Transfer Bank">
                {bankChannels.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="E-Wallet">
                {ewalletChannels.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* 2. Input Nomor Rekening / No HP */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-[#0b1c30] flex items-center gap-1.5">
              <GoogleIcon name={selectedChannel.icon} size={16} className="text-[#006c49]" />
              <span>
                {selectedChannel.type === "bank"
                  ? "Nomor Rekening Bank"
                  : "Nomor HP E-Wallet Terdaftar"}
              </span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={formData.accountNumber}
              onChange={(e) => onAccountNumberChange(e.target.value)}
              placeholder={selectedChannel.accountPlaceholder}
              className={`w-full text-sm font-mono font-semibold p-3.5 rounded-2xl border bg-[#f8f9ff] text-[#0b1c30] focus:bg-white focus:ring-1 outline-none transition-all ${
                formErrors.accountNumber
                  ? "border-[#ba1a1a] focus:ring-[#ba1a1a]"
                  : "border-[#bbcabf]/40 focus:border-[#006c49] focus:ring-[#006c49]"
              }`}
            />
            {formErrors.accountNumber && (
              <span className="text-[11px] font-semibold text-[#ba1a1a] flex items-center gap-1">
                <GoogleIcon name="error" size={14} />
                {formErrors.accountNumber}
              </span>
            )}
          </div>

          {/* 3. Input Nama Pemilik Rekening */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-[#0b1c30]">
              Nama Lengkap Pemilik Rekening:
            </label>
            <input
              type="text"
              value={formData.accountHolderName}
              onChange={(e) => onAccountHolderNameChange(e.target.value)}
              placeholder="Contoh: Budi Santoso"
              className={`w-full text-sm font-semibold p-3.5 rounded-2xl border bg-[#f8f9ff] text-[#0b1c30] focus:bg-white focus:ring-1 outline-none transition-all ${
                formErrors.accountHolderName
                  ? "border-[#ba1a1a] focus:ring-[#ba1a1a]"
                  : "border-[#bbcabf]/40 focus:border-[#006c49] focus:ring-[#006c49]"
              }`}
            />
            {formErrors.accountHolderName && (
              <span className="text-[11px] font-semibold text-[#ba1a1a] flex items-center gap-1">
                <GoogleIcon name="error" size={14} />
                {formErrors.accountHolderName}
              </span>
            )}
          </div>
        </div>

        {/* Kolom Kanan: Jumlah Poin & Rincian Transaksi */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Input Jumlah Poin */}
          <div className="flex flex-col gap-2.5 rounded-2xl border border-[#bbcabf]/30 bg-[#f8f9ff] p-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#0b1c30]">Jumlah Poin Ditarik:</label>
              <span className="text-[11px] font-semibold text-[#006c49]">
                Maks: {balancePoints.toLocaleString("id-ID")} pt
              </span>
            </div>

            <div className="flex items-center gap-2 bg-white border border-[#bbcabf]/40 rounded-xl px-3 py-2">
              <GoogleIcon name="monetization_on" size={20} filled className="text-[#d97706]" />
              <input
                type="number"
                min={MIN_WITHDRAW_POINTS}
                max={balancePoints}
                value={formData.pointsToWithdraw === 0 ? "" : formData.pointsToWithdraw}
                onChange={(e) => onPointsChange(Number(e.target.value))}
                placeholder="0"
                className="w-full text-base font-bold text-[#0b1c30] bg-transparent outline-none"
              />
              <span className="text-xs font-bold text-[#6c7a71]">Poin</span>
            </div>

            {/* Quick Percentage Chips */}
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {[25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => onPresetPercentage(pct)}
                  className="py-1.5 rounded-lg border border-[#bbcabf]/40 bg-white hover:bg-[#eff4ff] hover:text-[#006c49] hover:border-[#006c49] text-[11px] font-bold text-[#3c4a42] transition-colors"
                >
                  {pct === 100 ? "Semua" : `${pct}%`}
                </button>
              ))}
            </div>

            {formErrors.pointsToWithdraw && (
              <span className="text-[11px] font-semibold text-[#ba1a1a] flex items-center gap-1 mt-1">
                <GoogleIcon name="error" size={14} />
                {formErrors.pointsToWithdraw}
              </span>
            )}
          </div>

          {/* Rincian Konversi Kas */}
          <div className="flex flex-col gap-2 rounded-2xl border border-[#bbcabf]/30 bg-white p-4 text-xs">
            <div className="flex justify-between text-[#3c4a42]">
              <span>Nominal Rupiah (Kotor):</span>
              <span className="font-semibold text-[#0b1c30]">
                Rp {calculatedAmountIdr.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex justify-between text-[#3c4a42]">
              <span>Biaya Layanan Admin:</span>
              <span className="font-semibold text-[#006c49]">Gratis (Rp 0)</span>
            </div>
            <div className="my-1 border-t border-[#bbcabf]/20" />
            <div className="flex justify-between items-center text-sm">
              <span className="font-bold text-[#0b1c30]">Dana Masuk Bersih:</span>
              <span className="text-lg font-extrabold text-[#006c49]">
                Rp {netAmountIdr.toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || balancePoints < MIN_WITHDRAW_POINTS}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-[#006c49] text-white text-sm font-bold shadow-sm hover:bg-[#2b6954] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting ? (
              <>
                <GoogleIcon name="progress_activity" size={20} className="animate-spin" />
                <span>Memproses Penarikan...</span>
              </>
            ) : (
              <>
                <GoogleIcon name="account_balance" size={20} />
                <span>Ajukan Pencairan Saldo</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

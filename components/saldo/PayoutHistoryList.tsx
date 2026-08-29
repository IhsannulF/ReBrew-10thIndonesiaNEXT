"use client";

import React, { useState } from "react";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import { PayoutTransaction } from "@/types/payout";

interface PayoutHistoryListProps {
  history: PayoutTransaction[];
}

export const PayoutHistoryList: React.FC<PayoutHistoryListProps> = ({ history }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.max(1, Math.ceil(history.length / itemsPerPage));
  const paginatedHistory = history.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusChip = (status: PayoutTransaction["status"]) => {
    switch (status) {
      case "completed":
        return {
          bg: "bg-[#eff4ff] text-[#006c49] border-[#adedd3]",
          icon: "check_circle",
          label: "Berhasil Ditransfer",
        };
      case "processing":
        return {
          bg: "bg-[#fff8e1] text-[#92400e] border-[#fde68a]",
          icon: "schedule",
          label: "Sedang Diproses",
        };
      case "failed":
        return {
          bg: "bg-[#ffdad6]/50 text-[#ba1a1a] border-[#ffdad6]",
          icon: "error",
          label: "Gagal",
        };
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-[#bbcabf]/30 bg-white p-6 sm:p-7 shadow-xs w-full">
      <div className="flex items-center justify-between border-b border-[#bbcabf]/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eff4ff] text-[#006c49]">
            <GoogleIcon name="history" size={22} />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#0b1c30]">
              Riwayat Penarikan Dana
            </h2>
            <p className="text-xs text-[#3c4a42] mt-0.5">
              Log mutasi pencairan koin daur ulang ke rekening kas
            </p>
          </div>
        </div>

        <span className="text-xs text-[#6c7a71]">
          Total <strong className="text-[#0b1c30]">{history.length}</strong> penarikan
        </span>
      </div>

      {/* List */}
      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eff4ff] text-[#006c49] mb-3">
            <GoogleIcon name="payments" size={28} />
          </div>
          <h3 className="text-sm font-bold text-[#0b1c30]">Belum Ada Riwayat Penarikan</h3>
          <p className="text-xs text-[#6c7a71] max-w-xs mt-1">
            Kumpulkan poin dari setoran sampah kafe Anda dan ajukan pencairan ke rekening atau e-wallet.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[#bbcabf]/20">
          {paginatedHistory.map((item) => {
            const chip = getStatusChip(item.status);
            const maskedAcc =
              item.accountNumber.length > 4
                ? "•••• " + item.accountNumber.slice(-4)
                : item.accountNumber;

            return (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 px-2 hover:bg-[#f8f9ff] rounded-2xl transition-colors"
              >
                {/* Left Details */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eff4ff] text-[#006c49] shadow-2xs">
                    <GoogleIcon
                      name={item.channelType === "bank" ? "account_balance" : "account_balance_wallet"}
                      size={22}
                    />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-[#0b1c30]">{item.channelName}</span>
                      <span className="text-xs font-mono font-semibold text-[#6c7a71]">
                        ({maskedAcc})
                      </span>
                      <span className="font-mono text-[11px] font-bold text-[#006c49] bg-[#eff4ff] px-2 py-0.5 rounded border border-[#adedd3]">
                        {item.id}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#6c7a71] mt-1">
                      <span>{item.date} • {item.time}</span>
                      <span>•</span>
                      <span className="text-[#d97706] font-semibold">-{item.pointsDeducted} Poin</span>
                    </div>
                  </div>
                </div>

                {/* Right Status & Amount */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pl-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border shadow-2xs ${chip.bg}`}
                  >
                    <GoogleIcon name={chip.icon} size={14} filled />
                    <span>{chip.label}</span>
                  </span>

                  <div className="text-right">
                    <div className="text-sm font-bold font-mono text-[#006c49]">
                      +Rp {item.netAmountIdr.toLocaleString("id-ID")}
                    </div>
                    <div className="text-[10px] text-[#6c7a71]">Bebas Biaya Admin</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-[#bbcabf]/20 text-xs">
          <span className="text-[#6c7a71]">
            Halaman <strong className="text-[#0b1c30]">{currentPage}</strong> dari {totalPages}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-[#bbcabf]/40 text-xs font-bold text-[#0b1c30] hover:bg-[#f8f9ff] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Sebelumnya
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-[#bbcabf]/40 text-xs font-bold text-[#0b1c30] hover:bg-[#f8f9ff] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

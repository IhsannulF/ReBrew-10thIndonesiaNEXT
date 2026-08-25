"use client";

import React from "react";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import { TransactionDetail } from "@/types/transaction";
import { CATEGORY_OPTIONS } from "@/constants/transactionHistoryData";

interface TransactionItemCardProps {
  transaction: TransactionDetail;
  onOpenDetail: (tx: TransactionDetail) => void;
}

export const TransactionItemCard: React.FC<TransactionItemCardProps> = ({
  transaction: tx,
  onOpenDetail,
}) => {
  const categoryInfo =
    CATEGORY_OPTIONS.find((c) => c.key === tx.categoryKey) || CATEGORY_OPTIONS[1];

  const getStatusBadge = () => {
    switch (tx.status) {
      case "confirmed":
        return {
          bg: "bg-[#eff4ff] text-[#006c49] border-[#adedd3]",
          icon: "check_circle",
          label: "Terverifikasi",
        };
      case "pending":
        return {
          bg: "bg-[#fff8e1] text-[#92400e] border-[#fde68a]",
          icon: "schedule",
          label: "Menunggu Timbang",
        };
      case "rejected":
        return {
          bg: "bg-[#ffdad6]/50 text-[#ba1a1a] border-[#ffdad6]",
          icon: "cancel",
          label: "Ditolak",
        };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <div
      onClick={() => onOpenDetail(tx)}
      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-[#bbcabf]/30 bg-white hover:border-[#006c49]/40 hover:shadow-md transition-all cursor-pointer w-full"
    >
      {/* Left: Category Icon & Main Info */}
      <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
        {/* Category Icon Container */}
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-transform group-hover:scale-105 shadow-2xs"
          style={{
            backgroundColor: categoryInfo.bgColor,
            color: categoryInfo.color,
            border: `1px solid ${categoryInfo.borderColor}`,
          }}
        >
          <GoogleIcon name={categoryInfo.icon} size={24} />
        </div>

        {/* Text Details */}
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="text-sm sm:text-base font-bold text-[#0b1c30] truncate group-hover:text-[#006c49] transition-colors">
              {tx.material}
            </h3>
            <span className="text-[11px] font-mono font-bold text-[#006c49] bg-[#eff4ff] border border-[#adedd3] px-2 py-0.5 rounded-md">
              {tx.id}
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-[#3c4a42] flex-wrap">
            <span className="flex items-center gap-1">
              <GoogleIcon name="calendar_today" size={13} className="text-[#6c7a71]" />
              {tx.date} • {tx.time}
            </span>
            <span className="text-[#bbcabf] hidden sm:inline">•</span>
            <span className="font-bold text-[#0b1c30] bg-[#f8f9ff] px-2.5 py-0.5 rounded-md border border-[#bbcabf]/30">
              {tx.weightKg} kg
            </span>
            <span className="text-[#bbcabf] hidden sm:inline">•</span>
            <span className="inline-flex items-center gap-1 text-[11px] text-[#306d58] font-medium bg-[#f0fdf4] px-2.5 py-0.5 rounded-md border border-[#adedd3]/60">
              <GoogleIcon
                name={tx.method === "drop_point" ? "store" : "local_shipping"}
                size={13}
              />
              {tx.method === "drop_point" ? "Drop Point" : "Dijemput Armada"}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Status Pill, Points & Action Trigger */}
      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#bbcabf]/20 pl-2">
        {/* Status Pill */}
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border shadow-2xs ${statusBadge.bg}`}
        >
          <GoogleIcon name={statusBadge.icon} size={14} filled />
          <span>{statusBadge.label}</span>
        </span>

        {/* Points Badge */}
        <div className="flex items-center gap-1.5 font-black text-[#92400e] bg-gradient-to-br from-white to-[#fef3c7] px-3.5 py-1.5 rounded-xl border border-[#fde68a] shadow-2xs">
          <span className="text-sm sm:text-base">
            {tx.status === "rejected" ? "0" : `+${tx.pointsEarned}`}
          </span>
          <GoogleIcon
            name="monetization_on"
            size={17}
            filled
            className="text-[#d97706]"
          />
        </div>

        {/* Chevron detail icon */}
        <div className="hidden sm:flex h-8 w-8 items-center justify-center rounded-xl text-[#6c7a71] group-hover:bg-[#eff4ff] group-hover:text-[#006c49] transition-colors">
          <GoogleIcon name="chevron_right" size={20} />
        </div>
      </div>
    </div>
  );
};

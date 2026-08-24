import React from "react";
import { GoogleIcon } from "@/components/ui/GoogleIcon";

export interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  iconName: string;
  iconBgColor?: string;
  iconColor?: string;
  cardBgGradient?: string;
  cardBorderColor?: string;
  valueColor?: string;
  badgeText?: string;
  badgeColor?: string;
  footerText?: React.ReactNode;
  subValue?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  iconName,
  iconBgColor = "bg-[#f0fdf4]",
  iconColor = "text-[#2e7d32]",
  cardBgGradient = "bg-white",
  cardBorderColor = "border-[#d8e6d9]",
  valueColor = "text-[#1a2a1b]",
  badgeText,
  badgeColor = "bg-[#dcfce7] text-[#15803d]",
  footerText,
}) => {
  return (
    <article
      className={`flex flex-col justify-between rounded-2xl border ${cardBorderColor} ${cardBgGradient} p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 min-w-0 w-full`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#556957] truncate">
          {label}
        </span>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBgColor} ${iconColor} shadow-xs`}
        >
          <GoogleIcon name={iconName} size={22} filled />
        </div>
      </div>

      {/* Main Metric Value */}
      <div className="my-3 flex items-baseline gap-2 flex-wrap">
        <span
          className={`text-3xl sm:text-4xl font-black tracking-tight ${valueColor}`}
          style={{ fontFamily: "var(--font-fraunces, serif)" }}
        >
          {value}
        </span>
        {unit && (
          <span className="text-xs sm:text-sm font-semibold text-[#6b7c6f]">
            {unit}
          </span>
        )}
      </div>

      {/* Footer Details with generous padding */}
      <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-3.5 text-xs text-[#57534e] flex-wrap gap-2">
        {badgeText && (
          <span
            className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 shadow-2xs ${badgeColor}`}
          >
            {badgeText}
          </span>
        )}
        {footerText && (
          <div className="text-xs font-medium truncate leading-relaxed">
            {footerText}
          </div>
        )}
      </div>
    </article>
  );
};

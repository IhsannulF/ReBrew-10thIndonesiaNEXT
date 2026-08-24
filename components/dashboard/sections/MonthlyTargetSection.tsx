import React from "react";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import { MonthlyTargetData } from "@/types/dashboard";
import { formatWeight } from "@/lib/dashboard-utils";

interface MonthlyTargetSectionProps {
  target: MonthlyTargetData;
}

export const MonthlyTargetSection: React.FC<MonthlyTargetSectionProps> = ({ target }) => {
  const progressPercent = Math.min(
    100,
    Math.round((target.currentKg / target.targetKg) * 100)
  );
  const remainingKg = Math.max(0, target.targetKg - target.currentKg).toFixed(1);

  return (
    <section
      className="w-full flex flex-col rounded-2xl bg-gradient-to-br from-[#00422b] via-[#006c49] to-[#002113] p-6 sm:p-7 text-white shadow-md border border-[#adedd3]/20 min-w-0"
      aria-labelledby="monthly-target-heading"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2">
        <span
          id="monthly-target-heading"
          className="text-xs font-bold uppercase tracking-wider text-[#adedd3] truncate flex items-center gap-2"
        >
          <span className="h-2 w-2 rounded-full bg-[#4edea3] animate-ping" />
          Target Daur Ulang Bulanan
        </span>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur-xs">
          <GoogleIcon name="flag" size={18} />
        </span>
      </div>

      {/* Target Large Numbers */}
      <div className="my-3.5 flex items-baseline gap-2 flex-wrap">
        <strong
          className="text-3xl sm:text-4xl font-black text-white tracking-tight"
          style={{ fontFamily: "var(--font-fraunces, serif)" }}
        >
          {formatWeight(target.currentKg)}
        </strong>
        <span className="text-sm sm:text-base font-semibold text-[#adedd3]">
          / {target.targetKg} kg
        </span>
      </div>

      {/* Progress Bar with generous height and glow */}
      <div className="mt-3 flex flex-col gap-2.5 w-full">
        <div
          className="h-3 w-full overflow-hidden rounded-full bg-black/30 p-0.5"
          role="progressbar"
          aria-label="Progres target bulan ini"
          aria-valuemin={0}
          aria-valuemax={target.targetKg}
          aria-valuenow={target.currentKg}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#10b981] to-[#4edea3] transition-all duration-500 shadow-sm"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs sm:text-sm text-white/90 font-medium">
          <span className="font-bold text-[#b0f0d6] bg-black/25 px-2.5 py-0.5 rounded-md">
            {progressPercent}% tercapai
          </span>
          <span className="text-[#adedd3]">{remainingKg} kg lagi 💪</span>
        </div>
      </div>

      {/* Reward Milestone Note */}
      <div className="mt-5 rounded-xl bg-white/10 p-3.5 border border-white/15 text-xs text-white/95 flex items-start gap-3 leading-relaxed">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#10b981] text-[#00422b] shadow-xs mt-0.5 font-bold">
          <GoogleIcon name="emoji_events" size={16} filled />
        </div>
        <div>
          Capai target <strong>{target.targetKg} kg</strong> bulan ini untuk bonus{" "}
          <strong className="text-[#6ffbbe]">+{target.rewardBonusCoins} Koin</strong> & Badge{" "}
          <strong>{target.rewardBadgeName}</strong>.
        </div>
      </div>
    </section>
  );
};

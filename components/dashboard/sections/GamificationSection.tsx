import React from "react";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import { DailyMission, EcoBadge } from "@/types/dashboard";

interface GamificationSectionProps {
  missions: DailyMission[];
  badges: EcoBadge[];
  streakDays: number;
}

export const GamificationSection: React.FC<GamificationSectionProps> = ({
  missions,
  badges,
  streakDays,
}) => {
  return (
    <section
      className="w-full flex flex-col gap-6 rounded-2xl border border-[#bbcabf]/40 bg-white p-6 sm:p-7 shadow-xs min-w-0"
      aria-labelledby="gamification-heading"
    >
      {/* Header & Streak Counter with generous spacing */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-[#bbcabf]/20 w-full">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eff4ff] text-[#006c49] shadow-2xs">
            <GoogleIcon name="military_tech" size={22} filled />
          </div>
          <div>
            <h2
              id="gamification-heading"
              className="text-base sm:text-lg font-bold text-[#0b1c30]"
            >
              Misi Harian & Eco-Badges
            </h2>
            <p className="text-xs sm:text-sm text-[#3c4a42] mt-0.5">
              Tuntaskan misi harian pemilahan untuk raih bonus koin & lencana kehormatan
            </p>
          </div>
        </div>

        {/* Streak Counter Badge */}
        <div className="inline-flex items-center gap-2 self-start sm:self-auto bg-gradient-to-r from-[#fffdf5] to-[#fef3c7] border border-[#fde68a] px-4 py-2 rounded-xl shrink-0 shadow-2xs">
          <span className="text-xl">🔥</span>
          <span className="text-xs sm:text-sm font-bold text-[#92400e]">
            {streakDays} Hari Aktif Beruntun
          </span>
        </div>
      </div>

      {/* 2-Column Subgrid with generous breathing space */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        {/* Left Column: Daily Missions */}
        <div className="flex flex-col gap-4 min-w-0">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#3c4a42] flex items-center gap-2">
            <GoogleIcon name="task_alt" size={18} className="text-[#006c49]" />
            Misi Pemilahan Hari Ini
          </h3>

          <div className="flex flex-col gap-3.5 w-full">
            {missions.map((mission) => {
              const percent = Math.min(
                100,
                Math.round((mission.progressKg / mission.targetKg) * 100)
              );

              return (
                <div
                  key={mission.id}
                  className={`flex flex-col gap-3 p-4 sm:p-4.5 rounded-2xl border transition-all hover:shadow-xs ${
                    mission.completed
                      ? "bg-gradient-to-br from-[#eff4ff] to-[#adedd3]/30 border-[#adedd3]"
                      : "bg-gradient-to-br from-[#ffffff] to-[#f8f9ff] border-[#bbcabf]/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-bold text-[#0b1c30]">
                          {mission.title}
                        </span>
                        {mission.completed && (
                          <span className="text-[10px] font-bold text-[#006c49] bg-[#adedd3]/40 border border-[#adedd3] px-2 py-0.5 rounded-full">
                            Selesai ✔
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#3c4a42] leading-relaxed">
                        {mission.description}
                      </p>
                    </div>

                    <span className="shrink-0 text-xs font-bold text-[#92400e] bg-[#fef3c7] border border-[#fde68a] px-3 py-1 rounded-xl shadow-2xs">
                      +{mission.rewardCoins} Koin
                    </span>
                  </div>

                  {/* Mission Progress Bar */}
                  <div className="flex items-center gap-3 mt-1.5 w-full">
                    <div className="h-2 flex-1 bg-black/5 rounded-full overflow-hidden p-0.5">
                      <div
                        className="h-full bg-gradient-to-r from-[#10b981] to-[#006c49] rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-[#0b1c30] shrink-0">
                      {mission.progressKg} / {mission.targetKg} kg ({percent}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Eco-Badges Grid */}
        <div className="flex flex-col gap-4 min-w-0">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#3c4a42] flex items-center gap-2">
            <GoogleIcon name="shield" size={18} className="text-[#2b6954]" />
            Lencana Mitra Kafe
          </h3>

          <div className="grid grid-cols-2 gap-3 w-full">
            {badges.map((badge) => {
              const rarityTheme =
                badge.rarity === "legendary"
                  ? "from-[#ffffff] via-[#fffdf5] to-[#fef3c7]/50 border-[#fde68a]"
                  : badge.rarity === "epic"
                  ? "from-[#ffffff] via-[#faf8ff] to-[#ede9fe]/50 border-[#ddd6fe]"
                  : badge.rarity === "rare"
                  ? "from-[#ffffff] via-[#f0f9ff] to-[#e0f2fe]/50 border-[#bae6fd]"
                  : "from-[#ffffff] via-[#f8f9ff] to-[#eff4ff] border-[#adedd3]";

              return (
                <div
                  key={badge.id}
                  className={`flex flex-col items-center text-center p-4 rounded-2xl border transition-all min-w-0 ${
                    badge.unlocked
                      ? `bg-gradient-to-br ${rarityTheme} shadow-2xs hover:shadow-md hover:-translate-y-0.5`
                      : "bg-[#f8f9ff] border-[#bbcabf]/30 opacity-60"
                  }`}
                >
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl mb-2.5 shadow-xs ${
                      badge.unlocked
                        ? "bg-[#006c49] text-white"
                        : "bg-[#eff4ff] text-[#6c7a71]"
                    }`}
                  >
                    <GoogleIcon name={badge.icon} size={26} filled={badge.unlocked} />
                  </div>

                  <span className="text-xs sm:text-sm font-bold text-[#0b1c30] truncate w-full mb-1">
                    {badge.name}
                  </span>
                  <p className="text-[11px] text-[#3c4a42] line-clamp-2 leading-relaxed">
                    {badge.description}
                  </p>

                  <span
                    className={`mt-3 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs ${
                      badge.unlocked
                        ? "bg-[#eff4ff] text-[#006c49] border border-[#adedd3]"
                        : "bg-[#f8f9ff] text-[#6c7a71] border border-[#bbcabf]/30"
                    }`}
                  >
                    {badge.unlocked ? badge.unlockedAt || "Terbuka" : "Terkunci"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

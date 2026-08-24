export type WasteCategoryKey =
  | "botol_plastik"
  | "cup_plastik"
  | "tutup_cup"
  | "kardus"
  | "kaleng"
  | "lainnya";

export interface WasteCategoryInfo {
  key: WasteCategoryKey;
  name: string;
  pointsPerKg: number;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
}

export type DepositMethod = "drop_point" | "dijemput";

export type TransactionStatus = "pending" | "confirmed" | "rejected";

export interface TransactionItem {
  id: string;
  categoryKey: WasteCategoryKey;
  material: string;
  date: string;
  weightKg: number;
  coins: number;
  status: TransactionStatus;
  method: DepositMethod;
  dropPointName?: string;
}

export interface WasteCompositionItem {
  key: WasteCategoryKey;
  name: string;
  weightKg: number;
  percentage: number;
  points: number;
  color: string;
  icon: string;
}

export type CafeTier = "starter" | "1_ton_club" | "enterprise";

export interface CafeProfile {
  id?: string;
  name: string;
  email: string;
  cafeName: string;
  tier: CafeTier;
  tierLabel: string;
  city?: string;
  rankInCity?: number;
  totalCafesInCity?: number;
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  cafeName: string;
  city: string;
  totalKg: number;
  totalPoints: number;
  tierLabel: string;
  isCurrentCafe?: boolean;
  avatarInitial?: string;
}

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  progressKg: number;
  targetKg: number;
  rewardCoins: number;
  completed: boolean;
  categoryKey?: WasteCategoryKey;
}

export interface EcoBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  rarity: "common" | "rare" | "epic" | "legendary";
}

export interface DeviceCollectorStatus {
  scaleStatus: "online" | "offline" | "calibrating";
  scaleModel: string;
  scaleLastSync?: string;
  nextPickupDate: string;
  nextPickupTime: string;
  collectorName: string;
  collectorPhone?: string;
}

export interface MonthlyTargetData {
  currentKg: number;
  targetKg: number;
  monthName: string;
  rewardBonusCoins: number;
  rewardBadgeName: string;
}

export interface DashboardStats {
  totalCoins: number;
  balanceIdr: number;
  wasteKgThisMonth: number;
  targetKgThisMonth: number;
  co2SavedKg: number;
  plasticCupsRecycled: number;
  activeStreakDays: number;
}

export interface DashboardNotification {
  id: string;
  message: string;
  detail: string;
  coinsEarned: number;
  timestamp?: string;
}

export interface DashboardData {
  user: CafeProfile;
  stats: DashboardStats;
  target: MonthlyTargetData;
  deviceStatus: DeviceCollectorStatus;
  notification?: DashboardNotification | null;
  recentTransactions: TransactionItem[];
  wasteComposition: WasteCompositionItem[];
  leaderboard: LeaderboardEntry[];
  dailyMissions: DailyMission[];
  badges: EcoBadge[];
}

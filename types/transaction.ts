export type TransactionStatus = "confirmed" | "pending" | "rejected";
export type DepositMethod = "drop_point" | "dijemput";
export type WasteCategoryKey =
  | "all"
  | "cup_plastik"
  | "botol_plastik"
  | "tutup_cup"
  | "kardus"
  | "kaleng"
  | "ampas_kopi";

export interface TransactionDetail {
  id: string;
  categoryKey: Exclude<WasteCategoryKey, "all">;
  material: string;
  date: string;
  time: string;
  fullDate: string;
  weightKg: number;
  pointsEarned: number;
  co2SavedKg: number;
  status: TransactionStatus;
  method: DepositMethod;
  dropPointName?: string;
  pickupAddress?: string;
  collectorName?: string;
  scaleModel?: string;
  verifiedAt?: string;
  notes?: string;
  scheduledPickupAt?: string;
  isExpired?: boolean;
}

export interface TransactionFilterState {
  searchQuery: string;
  statusFilter: "all" | TransactionStatus;
  categoryFilter: WasteCategoryKey;
  methodFilter: "all" | DepositMethod;
  sortBy: "latest" | "oldest" | "highest_points" | "highest_weight";
}

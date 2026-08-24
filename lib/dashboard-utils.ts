import {
  COIN_TO_IDR_RATE,
  CO2_SAVED_PER_KG,
  PICKUP_DISCOUNT_PERCENT,
  WASTE_CATEGORIES,
} from "./constants";
import { DepositMethod, WasteCategoryKey } from "@/types/dashboard";

/**
 * Format numbers with Indonesian thousand separator (dots)
 * Example: 12500 -> "12.500"
 */
export function formatNumber(value: number): string {
  if (isNaN(value)) return "0";
  return value.toLocaleString("id-ID");
}

/**
 * Format currency to IDR with Rp prefix
 * Example: 62500 -> "Rp 62.500"
 */
export function formatCurrency(amount: number): string {
  if (isNaN(amount)) return "Rp 0";
  return `Rp ${formatNumber(amount)}`;
}

/**
 * Format weight with 1 decimal digit
 * Example: 8.4 -> "8.4 kg"
 */
export function formatWeight(kg: number): string {
  if (isNaN(kg)) return "0.0 kg";
  return `${kg.toFixed(1)} kg`;
}

/**
 * Calculate IDR balance from coins
 */
export function coinsToIdr(coins: number): number {
  return Math.round(coins * COIN_TO_IDR_RATE);
}

/**
 * Calculate CO2 emissions saved in kg
 */
export function calculateCO2Savings(wasteKg: number): number {
  return parseFloat((wasteKg * CO2_SAVED_PER_KG).toFixed(1));
}

/**
 * Calculate points earned based on material category and deposit method
 */
export function calculatePoints(
  weightKg: number,
  categoryKey: WasteCategoryKey,
  method: DepositMethod = "drop_point"
): number {
  const category = WASTE_CATEGORIES[categoryKey] || WASTE_CATEGORIES.botol_plastik;
  const rawPoints = weightKg * category.pointsPerKg;

  if (method === "dijemput") {
    // 20% pickup discount
    return Math.round(rawPoints * (1 - PICKUP_DISCOUNT_PERCENT / 100));
  }

  return Math.round(rawPoints);
}

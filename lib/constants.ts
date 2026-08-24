import { WasteCategoryInfo, WasteCategoryKey } from "@/types/dashboard";

/**
 * 5 Standard Waste Categories as defined in ReBrew pitch deck & PRD §6.4:
 * 1. Botol Plastik (10 poin/kg)
 * 2. Cup Plastik (5 poin/kg)
 * 3. Tutup Cup (3 poin/kg)
 * 4. Kardus (15 poin/kg)
 * 5. Kaleng (20 poin/kg)
 */
export const WASTE_CATEGORIES: Record<WasteCategoryKey, WasteCategoryInfo> = {
  botol_plastik: {
    key: "botol_plastik",
    name: "Botol Plastik",
    pointsPerKg: 10,
    icon: "water_bottle",
    color: "#2e7d32",
    bgColor: "#f0fdf4",
    borderColor: "#bbf7d0",
    description: "Botol PET bersih dari air mineral atau sirup kafe",
  },
  cup_plastik: {
    key: "cup_plastik",
    name: "Cup Plastik",
    pointsPerKg: 5,
    icon: "local_cafe",
    color: "#0284c7",
    bgColor: "#f0f9ff",
    borderColor: "#bae6fd",
    description: "Cup PP/PET bekas es kopi & minuman takeaway",
  },
  tutup_cup: {
    key: "tutup_cup",
    name: "Tutup Cup",
    pointsPerKg: 3,
    icon: "radio_button_checked",
    color: "#8b5cf6",
    bgColor: "#f5f3ff",
    borderColor: "#ddd6fe",
    description: "Lid/tutup cup plastik & seal injection",
  },
  kardus: {
    key: "kardus",
    name: "Kardus",
    pointsPerKg: 15,
    icon: "package_2",
    color: "#d97706",
    bgColor: "#fffbeb",
    borderColor: "#fde68a",
    description: "Kardus kemasan susu, sirup, dan biji kopi",
  },
  kaleng: {
    key: "kaleng",
    name: "Kaleng",
    pointsPerKg: 20,
    icon: "inventory_2",
    color: "#059669",
    bgColor: "#ecfdf5",
    borderColor: "#a7f3d0",
    description: "Kaleng krimer kental manis, susu evaporasi, & soda",
  },
  lainnya: {
    key: "lainnya",
    name: "Lainnya",
    pointsPerKg: 2,
    icon: "recycling",
    color: "#6b7280",
    bgColor: "#f9fafb",
    borderColor: "#e5e7eb",
    description: "Material daur ulang kafe terpilah lainnya",
  },
};

/**
 * Economic conversion constants
 */
export const COIN_TO_IDR_RATE = 50; // 1 Coin = Rp 50
export const CO2_SAVED_PER_KG = 0.5; // 1 kg waste = 0.5 kg CO2 eq saved
export const PICKUP_DISCOUNT_PERCENT = 20; // 20% discount on pickup method (minimum 2kg)
export const PICKUP_MIN_WEIGHT_KG = 2;

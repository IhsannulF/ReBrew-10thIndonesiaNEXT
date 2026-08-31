export interface WasteCategory {
  id: string;
  name: string;
  category: "Plastik" | "Kertas & Kardus" | "Logam" | "Organik";
  offtakerPricePerKg: number; // Harga jual ReBrew ke offtaker / recycler (Rp/kg)
  pointPerKg: number;         // Nilai poin yang diberikan ke coffee shop (default 35% dari offtaker)
  co2Factor: number;          // kg CO2 terselamatkan per kg sampah
  icon: string;
  description: string;
  minShareRate?: number;      // Batas bawah rekomendasi rentang (20%)
  maxShareRate?: number;      // Batas atas rekomendasi rentang (40%)
}

export interface DropPoint {
  id: string;
  name: string;
  adminName?: string;
  address: string;
  distance: string;
  distanceKm: number;
  hours: string;
  latitude?: number;
  longitude?: number;
  googleMapsUrl?: string;
  phone?: string;
}

export interface PickupRadiusTier {
  maxDistanceKm: number;
  minWeightKg: number;
  label: string;
  description: string;
}

// Rekomendasi rentang persentase sharing reward ke coffee shop (20% - 40%, standar baseline 35%)
export const DEFAULT_SHARE_RATE = 0.35;
export const MIN_SHARE_RATE = 0.20;
export const MAX_SHARE_RATE = 0.40;

// Konfigurasi syarat minimum berat penjemputan berbasis radius dari micro-hub
export const PICKUP_RADIUS_TIERS: PickupRadiusTier[] = [
  {
    maxDistanceKm: 3.0,
    minWeightKg: 2.0,
    label: "Radius Dekat (≤ 3 km)",
    description: "Area mikro sekitar hub, minimum setor 2.0 kg",
  },
  {
    maxDistanceKm: 7.0,
    minWeightKg: 5.0,
    label: "Radius Sedang (3.1 - 7 km)",
    description: "Minimum 5.0 kg agar efisiensi BBM armada tetap optimal",
  },
  {
    maxDistanceKm: 999.0,
    minWeightKg: 10.0,
    label: "Radius Jauh (> 7 km)",
    description: "Minimum 10.0 kg untuk optimasi rute batch kurir",
  },
];

// Helper fungsi untuk menentukan minimum berat berdasarkan jarak km
export function getMinPickupWeight(distanceKm: number): { minWeight: number; tierLabel: string } {
  for (const tier of PICKUP_RADIUS_TIERS) {
    if (distanceKm <= tier.maxDistanceKm) {
      return { minWeight: tier.minWeightKg, tierLabel: tier.label };
    }
  }
  return { minWeight: 10.0, tierLabel: "Radius Jauh (> 7 km)" };
}

export const WASTE_CATEGORIES: WasteCategory[] = [
  {
    id: "cup-plastik",
    name: "Plastic Cup (PP/PET)",
    category: "Plastik",
    offtakerPricePerKg: 5000,
    pointPerKg: Math.round(5000 * DEFAULT_SHARE_RATE), // 1.750 Poin (Rp 1.750)
    co2Factor: 1.2,
    icon: "coffee",
    description: "Cup kopi takeaway & cup boba (bersih, bebas sisa cairan)",
  },
  {
    id: "botol-plastik",
    name: "Botol Plastik (PET Bening)",
    category: "Plastik",
    offtakerPricePerKg: 6000,
    pointPerKg: Math.round(6000 * DEFAULT_SHARE_RATE), // 2.100 Poin (Rp 2.100)
    co2Factor: 1.4,
    icon: "local_drink",
    description: "Botol air mineral, botol sirup bening / transparan",
  },
  {
    id: "tutup-cup",
    name: "Tutup Cup & Sedotan (HDPE/PP)",
    category: "Plastik",
    offtakerPricePerKg: 3000,
    pointPerKg: Math.round(3000 * DEFAULT_SHARE_RATE), // 1.050 Poin (Rp 1.050)
    co2Factor: 0.8,
    icon: "takeout_dining",
    description: "Lid plastik cembung/flat, seal cup, dan sedotan",
  },
  {
    id: "ampas-kopi",
    name: "Ampas Kopi (Spent Grounds)",
    category: "Organik",
    offtakerPricePerKg: 3000,
    pointPerKg: Math.round(3000 * DEFAULT_SHARE_RATE), // 1.050 Poin (Rp 1.050)
    co2Factor: 0.6,
    icon: "compost",
    description: "Ampas espresso & manual brew untuk pupuk & briket bio-arang",
  },
];

// Data Resmi Drop Point ReBrew (Hanya yang memiliki akun Admin terdaftar)
export const DROP_POINTS: DropPoint[] = [
  {
    id: "dp-melawai-jaksel-01",
    name: "ReBrew Central Hub - Jakarta Selatan (Melawai)",
    adminName: "Fathiyah Nurul Izzah",
    address: "Jl. Iskandarsyah Raya No.65, RT.5/RW.2, Melawai, Kec. Kby. Baru, Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12160",
    distance: "0.5 km",
    distanceKm: 0.5,
    hours: "08:00 - 20:00 WIB",
    latitude: -6.244293,
    longitude: 106.801648,
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=-6.244293,106.801648",
    phone: "0812-3456-7890",
  },
  {
    id: "dp-central-hub-01",
    name: "ReBrew Central Hub - Surabaya Timur",
    address: "Jl. Raya Gn. Anyar Sawah No.15, RT.2, Gn. Anyar, Kec. Gn. Anyar, Surabaya, Jawa Timur 60294",
    distance: "1.2 km",
    distanceKm: 1.2,
    hours: "08:00 - 20:00 WIB",
    latitude: -7.336184,
    longitude: 112.784428,
    googleMapsUrl: "https://www.google.com/maps/dir/?api=1&destination=-7.336184,112.784428",
    phone: "0812-3456-7890",
  },
];





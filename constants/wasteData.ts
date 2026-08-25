export interface WasteCategory {
  id: string;
  name: string;
  category: "Plastik" | "Kertas & Kardus" | "Logam" | "Organik";
  pointPerKg: number;
  co2Factor: number; // kg CO2 terselamatkan per kg sampah
  icon: string;
  description: string;
}

export interface DropPoint {
  id: string;
  name: string;
  address: string;
  distance: string;
  hours: string;
}

export const WASTE_CATEGORIES: WasteCategory[] = [
  {
    id: "botol-plastik",
    name: "Botol Plastik (PET)",
    category: "Plastik",
    pointPerKg: 10,
    co2Factor: 1.4,
    icon: "local_drink",
    description: "Botol air mineral, botol sirup bening / bersih",
  },
  {
    id: "cup-plastik",
    name: "Plastic Cup (PP/PET)",
    category: "Plastik",
    pointPerKg: 5,
    co2Factor: 1.2,
    icon: "coffee",
    description: "Cup kopi takeaway, cup boba (bersih tanpa cairan)",
  },
  {
    id: "tutup-cup",
    name: "Tutup Cup & Sedotan",
    category: "Plastik",
    pointPerKg: 3,
    co2Factor: 0.8,
    icon: "takeout_dining",
    description: "Lid plastik, seal cup, dan sedotan plastik",
  },
  {
    id: "kaleng",
    name: "Kaleng Minuman (Aluminium)",
    category: "Logam",
    pointPerKg: 20,
    co2Factor: 2.5,
    icon: "inventory_2",
    description: "Kaleng soda, susu, dan minuman penyegar",
  },
  {
    id: "kardus",
    name: "Kardus & Karton",
    category: "Kertas & Kardus",
    pointPerKg: 15,
    co2Factor: 0.9,
    icon: "package_2",
    description: "Kardus kemasan susu, karton box sirup kering",
  },
  {
    id: "ampas-kopi",
    name: "Ampas Kopi (Spent Grounds)",
    category: "Organik",
    pointPerKg: 5,
    co2Factor: 0.6,
    icon: "compost",
    description: "Ampas espresso & manual brew untuk pupuk/briket",
  },
];

export const DROP_POINTS: DropPoint[] = [
  {
    id: "dp-1",
    name: "ReBrew Micro-Hub Surabaya Timur",
    address: "Jl. Manyar Kertoarjo No. 45, Surabaya",
    distance: "1.2 km",
    hours: "08:00 - 18:00 WIB",
  },
  {
    id: "dp-2",
    name: "ReBrew Point - Kopi Selamat Cafe",
    address: "Jl. Dharmawangsa No. 12, Surabaya",
    distance: "2.8 km",
    hours: "09:00 - 21:00 WIB",
  },
  {
    id: "dp-3",
    name: "Bank Sampah Induk Surabaya",
    address: "Jl. Ngagel Jaya Selatan No. 88, Surabaya",
    distance: "4.5 km",
    hours: "08:00 - 16:00 WIB",
  },
];

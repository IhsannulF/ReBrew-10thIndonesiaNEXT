import { useState, useMemo } from "react";
import { WASTE_CATEGORIES, DROP_POINTS } from "@/constants/wasteData";

export interface DepositSummary {
  totalWeight: number;
  finalPoints: number;
  totalCo2: number;
  isPickupEligible: boolean;
}

export type DepositMethod = "drop_point" | "dijemput";

export function useDepositCalculator() {
  // State Input Berat per Kategori (kg)
  const [weights, setWeights] = useState<Record<string, number>>({
    "cup-plastik": 2.5,
    "botol-plastik": 1.0,
  });

  // State Metode Pengumpulan & Drop Point
  const [method, setMethod] = useState<DepositMethod>("drop_point");
  const [selectedDropPoint, setSelectedDropPoint] = useState<string>(
    DROP_POINTS[0]?.id || ""
  );
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);

  // Handler perubahan input berat langsung
  const handleWeightChange = (id: string, value: string) => {
    const num = parseFloat(value);
    setWeights((prev) => ({
      ...prev,
      [id]: isNaN(num) || num < 0 ? 0 : Math.round(num * 10) / 10,
    }));
  };

  // Handler tombol counter (+ / -)
  const adjustWeight = (id: string, delta: number) => {
    setWeights((prev) => {
      const current = prev[id] || 0;
      const next = Math.max(0, Math.round((current + delta) * 10) / 10);
      return { ...prev, [id]: next };
    });
  };

  // Kalkulasi total berat, poin & estimasi dampak CO2
  const summary: DepositSummary = useMemo(() => {
    let totalWeight = 0;
    let rawPoints = 0;
    let totalCo2 = 0;

    WASTE_CATEGORIES.forEach((cat) => {
      const w = weights[cat.id] || 0;
      if (w > 0) {
        totalWeight += w;
        rawPoints += w * cat.pointPerKg;
        totalCo2 += w * cat.co2Factor;
      }
    });

    // Metode dijemput ada potongan 15% biaya operasional logistik armada (PRD §6.1)
    const discountMultiplier = method === "dijemput" ? 0.85 : 1.0;
    const finalPoints = Math.round(rawPoints * discountMultiplier);

    return {
      totalWeight: Math.round(totalWeight * 10) / 10,
      finalPoints,
      totalCo2: Math.round(totalCo2 * 10) / 10,
      isPickupEligible: totalWeight >= 2.0, // Syarat minimal 2kg untuk pick-up
    };
  }, [weights, method]);

  // Handler submit transaksi
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (summary.totalWeight <= 0) return;
    if (method === "dijemput" && !summary.isPickupEligible) return;
    setIsSuccessModalOpen(true);
  };

  return {
    weights,
    method,
    setMethod,
    selectedDropPoint,
    setSelectedDropPoint,
    isSuccessModalOpen,
    setIsSuccessModalOpen,
    summary,
    handleWeightChange,
    adjustWeight,
    handleSubmit,
  };
}

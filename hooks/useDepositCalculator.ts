import { useState, useMemo } from "react";
import {
  WASTE_CATEGORIES,
  DROP_POINTS,
  DEFAULT_SHARE_RATE,
  getMinPickupWeight,
} from "@/constants/wasteData";

import { createDepositTransaction } from "@/app/actions/transactions";

export interface DepositSummary {
  totalWeight: number;
  finalPoints: number;
  equivalentRupiah: number; // 1 Poin = Rp 1
  totalOfftakerGross: number; // Nilai kotor penjualan ReBrew ke offtaker
  rebrewGrossMargin: number;  // Margin kotor ReBrew untuk operasional & logistik
  totalCo2: number;
  shareRatePercent: number;
  // Validasi Penjemputan
  pickupDistanceKm: number;
  minWeightRequired: number;
  tierLabel: string;
  isPickupEligible: boolean;
  weightDeficit: number; // Berapa kg lagi untuk memenuhi syarat penjemputan
}

export type DepositMethod = "drop_point" | "dijemput";

export function useDepositCalculator() {
  // State Input Berat per Kategori (kg) - Default set 5 kg cup plastik & 2 kg botol
  const [weights, setWeights] = useState<Record<string, number>>({
    "cup-plastik": 5.0,
    "botol-plastik": 2.0,
  });

  // State Rentang Persentase Sharing (20% - 40%, default 35%)
  const [shareRate, setShareRate] = useState<number>(DEFAULT_SHARE_RATE);

  // State Metode Penyetoran
  const [method, setMethod] = useState<DepositMethod>("drop_point");
  const [selectedDropPoint, setSelectedDropPoint] = useState<string>(
    DROP_POINTS[0]?.id || "dp-central-hub-01"
  );

  // State Jarak, Jadwal, dan Alamat Penjemputan Armada ReBrew
  const [pickupDistance, setPickupDistance] = useState<number>(2.5); // Default 2.5 km (radius dekat)
  const [pickupAddress, setPickupAddress] = useState<string>(
    "Kopi Selamat Cafe, Jl. Raya Gubeng No. 18, Surabaya"
  );
  const [pickupNotes, setPickupNotes] = useState<string>("");
  const [pickupDate, setPickupDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [pickupTimeSlot, setPickupTimeSlot] = useState<string>("09:00 - 12:00 WIB");

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
  const [createdTicketCode, setCreatedTicketCode] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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

  // Reset semua berat
  const resetWeights = () => {
    setWeights({});
  };

  // Kalkulasi total berat, poin, nilai rupiah, unit economics & estimasi CO2
  const summary: DepositSummary = useMemo(() => {
    let totalWeight = 0;
    let totalOfftakerGross = 0;
    let rawPoints = 0;
    let totalCo2 = 0;

    WASTE_CATEGORIES.forEach((cat) => {
      const w = weights[cat.id] || 0;
      if (w > 0) {
        totalWeight += w;
        const grossValue = w * cat.offtakerPricePerKg;
        totalOfftakerGross += grossValue;
        
        // Poin per kategori = berat * harga offtaker * share rate (default 35%)
        const categoryPoints = Math.round(grossValue * shareRate);
        rawPoints += categoryPoints;
        totalCo2 += w * cat.co2Factor;
      }
    });

    // Perhitungan Syarat Penjemputan berdasarkan Radius Jarak Micro-Hub
    const { minWeight: minWeightRequired, tierLabel } = getMinPickupWeight(pickupDistance);

    const isPickupEligible =
      method === "drop_point" ? totalWeight > 0 : totalWeight >= minWeightRequired;

    const weightDeficit = Math.max(0, Math.round((minWeightRequired - totalWeight) * 10) / 10);

    // Drop Point: 100% Poin utuh karena logistik ditanggung coffee shop
    // Dijemput: Poin tetap sesuai rate poin transparan
    const finalPoints = rawPoints;
    const equivalentRupiah = finalPoints; // 1 Poin = Rp 1
    const rebrewGrossMargin = Math.max(0, totalOfftakerGross - equivalentRupiah);

    return {
      totalWeight: Math.round(totalWeight * 10) / 10,
      finalPoints,
      equivalentRupiah,
      totalOfftakerGross,
      rebrewGrossMargin,
      totalCo2: Math.round(totalCo2 * 10) / 10,
      shareRatePercent: Math.round(shareRate * 100),
      pickupDistanceKm: pickupDistance,
      minWeightRequired,
      tierLabel,
      isPickupEligible,
      weightDeficit,
    };
  }, [weights, shareRate, method, pickupDistance]);

  // Handler submit transaksi setor sampah (Tersinkronisasi dengan Database Supabase)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (summary.totalWeight <= 0) return;
    if (method === "dijemput" && !summary.isPickupEligible) return;

    setIsSubmitting(true);

    try {
      const res = await createDepositTransaction({
        weights,
        method,
        selectedDropPoint,
        pickupAddress,
        pickupNotes,
        pickupDate,
        pickupTimeSlot,
        totalWeight: summary.totalWeight,
        finalPoints: summary.finalPoints,
        totalCo2: summary.totalCo2,
      });

      if (res.success && res.ticketCode) {
        setCreatedTicketCode(res.ticketCode);
      }
    } catch (err) {
      console.error("Error creating deposit transaction:", err);
    } finally {
      setIsSubmitting(false);
      setIsSuccessModalOpen(true);
    }
  };

  return {
    weights,
    shareRate,
    setShareRate,
    method,
    setMethod,
    selectedDropPoint,
    setSelectedDropPoint,
    pickupDistance,
    setPickupDistance,
    pickupAddress,
    setPickupAddress,
    pickupNotes,
    setPickupNotes,
    pickupDate,
    setPickupDate,
    pickupTimeSlot,
    setPickupTimeSlot,
    isSuccessModalOpen,
    setIsSuccessModalOpen,
    summary,
    handleWeightChange,
    adjustWeight,
    resetWeights,
    createdTicketCode,
    isSubmitting,
    handleSubmit,
  };
}

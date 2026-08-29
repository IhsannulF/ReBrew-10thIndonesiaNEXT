"use client";

import React, { useState } from "react";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import {
  BulkShipmentItem,
  OfftakerPartner,
  createOfftakerShipmentAction,
  updateShipmentStatusAction,
} from "@/app/actions/admin";

interface AdminOfftakerClientViewProps {
  initialData: {
    partners: OfftakerPartner[];
    stockInventory: {
      cupPlastik: number;
      botolPlastik: number;
      tutupHdpe: number;
      ampasKopi: number;
      kardus: number;
      kaleng: number;
      totalKg: number;
    };
    shipments: BulkShipmentItem[];
  };
}

export const AdminOfftakerClientView: React.FC<AdminOfftakerClientViewProps> = ({
  initialData,
}) => {
  const [partners] = useState<OfftakerPartner[]>(initialData.partners);
  const [stockInventory] = useState(initialData.stockInventory);
  const [shipments, setShipments] = useState<BulkShipmentItem[]>(initialData.shipments);

  // Filter & Search State
  const [statusFilter, setStatusFilter] = useState<"all" | "Siap Kirim" | "Dalam Pengiriman" | "Terkirim & Lunas">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State for New Bulk Shipment
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState(partners[0]?.id || "off-1");
  const [selectedCategory, setSelectedCategory] = useState("Plastic Cup (PP/PET)");
  const [inputWeight, setInputWeight] = useState("300");
  const [inputPrice, setInputPrice] = useState("5000");
  const [shipmentNotes, setShipmentNotes] = useState("Truk Box Ekspedisi Micro-Hub");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Detail Modal State
  const [selectedDetailShipment, setSelectedDetailShipment] = useState<BulkShipmentItem | null>(null);

  // Pre-fill modal when clicking from inventory card
  const handleOpenShipmentModal = (categoryName: string, defaultWeight?: number, defaultPrice?: number) => {
    setSelectedCategory(categoryName);
    if (defaultWeight && defaultWeight > 0) {
      setInputWeight(defaultWeight.toString());
    }
    if (defaultPrice) {
      setInputPrice(defaultPrice.toString());
    }
    setIsModalOpen(true);
  };

  const handleCreateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const weight = parseFloat(inputWeight) || 100;
    const price = parseInt(inputPrice) || 5000;
    const partnerObj = partners.find((p) => p.id === selectedPartnerId) || partners[0];

    setIsSubmitting(true);
    try {
      const res = await createOfftakerShipmentAction({
        offtakerName: partnerObj.name,
        category: selectedCategory,
        weightKg: weight,
        pricePerKg: price,
        notes: shipmentNotes,
      });

      if (res.success && res.shipment) {
        setShipments([res.shipment, ...shipments]);
        setIsModalOpen(false);
        setSuccessToast(`Batch Pengiriman ${res.shipment.batchCode} ke ${partnerObj.name} berhasil disimpan ke database!`);
        setTimeout(() => setSuccessToast(null), 4000);
      }
    } catch {
      // optimistic fallback
      const gross = weight * price;
      const cafeReward = Math.round(gross * 0.35);
      const margin = gross - cafeReward;
      const newCode = `BULK-2026-${Math.floor(100 + Math.random() * 900)}`;
      const fallbackShipment: BulkShipmentItem = {
        id: `bulk-${Date.now()}`,
        batchCode: newCode,
        offtakerName: partnerObj.name,
        category: selectedCategory,
        weightKg: weight,
        pricePerKg: price,
        grossTotal: gross,
        cafeRewardAllocated: cafeReward,
        rebrewGrossMargin: margin,
        status: "Siap Kirim",
        date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
        notes: shipmentNotes,
      };
      setShipments([fallbackShipment, ...shipments]);
      setIsModalOpen(false);
      setSuccessToast(`Batch Pengiriman ${newCode} berhasil dibuat!`);
      setTimeout(() => setSuccessToast(null), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, nextStatus: "Siap Kirim" | "Dalam Pengiriman" | "Terkirim & Lunas") => {
    setShipments((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: nextStatus } : s))
    );
    if (selectedDetailShipment?.id === id) {
      setSelectedDetailShipment((prev) => (prev ? { ...prev, status: nextStatus } : null));
    }

    try {
      await updateShipmentStatusAction({ shipmentId: id, status: nextStatus });
    } catch {
      // optimistic
    }

    setSuccessToast(`Status pengiriman berhasil diperbarui menjadi "${nextStatus}".`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Kalkulasi agregat KPI penjualan
  const totalGrossRevenue = shipments.reduce((acc, s) => acc + s.grossTotal, 0);
  const totalCafeRewards = shipments.reduce((acc, s) => acc + s.cafeRewardAllocated, 0);
  const totalRebrewMargin = shipments.reduce((acc, s) => acc + s.rebrewGrossMargin, 0);
  const totalShippedWeightKg = shipments.reduce((acc, s) => acc + s.weightKg, 0);

  // Filtered shipments
  const filteredShipments = shipments.filter((s) => {
    if (statusFilter !== "all" && s.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        s.batchCode.toLowerCase().includes(q) ||
        s.offtakerName.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#bbcabf]/30 pb-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-[#006c49] font-semibold mb-0.5">
            <span>Admin</span>
            <span>/</span>
            <span className="text-[#6c7a71]">Offtaker & Arbitrage</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0b1c30]">
            Manajemen Offtaker & Penjualan Bulk Daur Ulang
          </h1>
          <p className="text-xs text-[#6c7a71] mt-0.5">
            Katalog pabrik daur ulang, pencatatan pengiriman tonase dari Micro-Hub, dan realisasi margin waste arbitrage (35% Kafe / 65% ReBrew).
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#006c49] text-white text-xs font-bold hover:bg-[#005237] transition-all shadow-sm self-start sm:self-center cursor-pointer active:scale-95"
        >
          <GoogleIcon name="add_circle" size={18} />
          <span>Buat Pengiriman Bulk Baru</span>
        </button>
      </div>

      {/* Toast Alert */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-[#f0fdf4] border border-[#006c49]/30 text-xs text-[#006c49] font-bold flex items-center gap-2.5 animate-fade-in shadow-xs">
          <GoogleIcon name="check_circle" size={20} filled />
          <span>{successToast}</span>
        </div>
      )}

      {/* KPI Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#bbcabf]/30 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#6c7a71] font-semibold">Total Nilai Jual Offtaker</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f0fdf4] text-[#006c49]">
              <GoogleIcon name="payments" size={18} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#0b1c30] mt-2">
            Rp {totalGrossRevenue.toLocaleString("id-ID")}
          </div>
          <div className="text-[11px] text-[#006c49] font-semibold mt-0.5">
            {(totalShippedWeightKg / 1000).toFixed(2)} Ton total akumulasi bulk
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#f0fdf4] border border-[#006c49]/30 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#006c49] font-bold">Reward Poin Kafe (35%)</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eff4ff] text-[#006c49]">
              <GoogleIcon name="stars" size={18} filled />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#006c49] mt-2">
            Rp {totalCafeRewards.toLocaleString("id-ID")}
          </div>
          <div className="text-[11px] text-[#306d58] font-semibold mt-0.5">
            +{totalCafeRewards.toLocaleString("id-ID")} Poin dicadangkan
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#bbcabf]/30 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#6c7a71] font-semibold">Margin Kotor ReBrew (65%)</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eff6ff] text-[#0284c7]">
              <GoogleIcon name="account_balance" size={18} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#0b1c30] mt-2">
            Rp {totalRebrewMargin.toLocaleString("id-ID")}
          </div>
          <div className="text-[11px] text-[#6c7a71] font-semibold mt-0.5">
            Operasional logistik, armada & sorting
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#bbcabf]/30 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#6c7a71] font-semibold">Stok Siap Jual di Hub</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#fffdf5] text-[#d97706]">
              <GoogleIcon name="warehouse" size={18} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#d97706] mt-2">
            {stockInventory.totalKg} kg
          </div>
          <div className="text-[11px] text-[#6c7a71] font-semibold mt-0.5">
            Tersimpan di Micro-Hub Surabaya
          </div>
        </div>
      </div>

      {/* Stok Material Siap Kirim di Micro-Hub */}
      <div className="rounded-3xl border border-[#bbcabf]/30 bg-white p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-[#0b1c30] flex items-center gap-2">
              <GoogleIcon name="inventory" size={20} className="text-[#006c49]" />
              Stok Material Terpilah di Micro-Hub (Siap Dikirim ke Pabrik)
            </h2>
            <p className="text-xs text-[#6c7a71] mt-0.5">
              Klik "Kirim ke Pabrik" untuk langsung membuat batch pengiriman dari stok material yang terkumpul.
            </p>
          </div>
          <span className="text-xs font-bold text-[#006c49] bg-[#eff4ff] px-3 py-1 rounded-full border border-[#adedd3] self-start">
            Kapasitas: {stockInventory.totalKg} / 2.000 kg (Micro-Hub)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Plastic Cup PP */}
          <div className="p-4 rounded-2xl bg-[#f8f9ff] border border-[#bbcabf]/30 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-[#0b1c30]">Plastic Cup (PP/PET)</span>
                <span className="font-extrabold text-[#006c49]">{stockInventory.cupPlastik} kg</span>
              </div>
              <span className="text-[10px] text-[#6c7a71]">Harga Offtaker: Rp5.000 / kg</span>
            </div>
            <button
              type="button"
              onClick={() => handleOpenShipmentModal("Plastic Cup (PP/PET)", stockInventory.cupPlastik, 5000)}
              className="w-full py-2 rounded-xl bg-white hover:bg-[#eff4ff] text-[#006c49] border border-[#adedd3] text-xs font-bold transition-all cursor-pointer"
            >
              Kirim ke Pabrik
            </button>
          </div>

          {/* Card 2: Botol Plastik PET */}
          <div className="p-4 rounded-2xl bg-[#f8f9ff] border border-[#bbcabf]/30 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-[#0b1c30]">Botol Plastik PET Bening</span>
                <span className="font-extrabold text-[#0369a1]">{stockInventory.botolPlastik} kg</span>
              </div>
              <span className="text-[10px] text-[#6c7a71]">Harga Offtaker: Rp6.000 / kg</span>
            </div>
            <button
              type="button"
              onClick={() => handleOpenShipmentModal("Botol Plastik PET Bening", stockInventory.botolPlastik, 6000)}
              className="w-full py-2 rounded-xl bg-white hover:bg-[#eff4ff] text-[#0369a1] border border-[#bae6fd] text-xs font-bold transition-all cursor-pointer"
            >
              Kirim ke Pabrik
            </button>
          </div>

          {/* Card 3: Tutup Cup HDPE */}
          <div className="p-4 rounded-2xl bg-[#f8f9ff] border border-[#bbcabf]/30 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-[#0b1c30]">Tutup Cup HDPE (Coaster)</span>
                <span className="font-extrabold text-[#7c3aed]">{stockInventory.tutupHdpe} kg</span>
              </div>
              <span className="text-[10px] text-[#6c7a71]">Harga Offtaker: Rp6.000 / kg</span>
            </div>
            <button
              type="button"
              onClick={() => handleOpenShipmentModal("Tutup Cup HDPE (Merchandise Coaster)", stockInventory.tutupHdpe, 6000)}
              className="w-full py-2 rounded-xl bg-white hover:bg-[#eff4ff] text-[#7c3aed] border border-[#ddd6fe] text-xs font-bold transition-all cursor-pointer"
            >
              Kirim ke Pabrik
            </button>
          </div>

          {/* Card 4: Ampas Kopi */}
          <div className="p-4 rounded-2xl bg-[#f8f9ff] border border-[#bbcabf]/30 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-[#0b1c30]">Ampas Kopi (Circular Soil)</span>
                <span className="font-extrabold text-[#d97706]">{stockInventory.ampasKopi} kg</span>
              </div>
              <span className="text-[10px] text-[#6c7a71]">Harga Offtaker: Rp3.000 / kg</span>
            </div>
            <button
              type="button"
              onClick={() => handleOpenShipmentModal("Ampas Kopi (Circular Soil)", stockInventory.ampasKopi, 3000)}
              className="w-full py-2 rounded-xl bg-white hover:bg-[#eff4ff] text-[#d97706] border border-[#fde68a] text-xs font-bold transition-all cursor-pointer"
            >
              Kirim ke Pabrik
            </button>
          </div>
        </div>
      </div>

      {/* Katalog Mitra Pabrik Offtaker Terdaftar */}
      <div className="rounded-3xl border border-[#bbcabf]/30 bg-white p-5 sm:p-6 shadow-2xs">
        <h2 className="text-base font-bold text-[#0b1c30] mb-4 flex items-center gap-2">
          <GoogleIcon name="factory" size={20} className="text-[#006c49]" />
          Katalog Mitra Pabrik Daur Ulang & Offtaker Resmi
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {partners.map((p) => (
            <div
              key={p.id}
              className="p-4 rounded-2xl border border-[#bbcabf]/30 bg-gradient-to-br from-white to-[#f8f9ff] flex flex-col justify-between gap-3"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded-full bg-[#dcfce7] text-[#15803d] font-extrabold text-[10px]">
                    {p.contractStatus}
                  </span>
                  <span className="text-[10px] text-[#6c7a71]">{p.phone}</span>
                </div>
                <h3 className="text-sm font-bold text-[#0b1c30]">{p.name}</h3>
                <p className="text-[11px] text-[#6c7a71] mt-0.5">{p.location}</p>
                <div className="mt-2 text-[10px] text-[#3c4a42] space-y-0.5">
                  <span className="font-bold text-[#006c49] block">Material Diterima:</span>
                  {p.acceptedCategories.map((c, i) => (
                    <div key={i} className="truncate">• {c}</div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedPartnerId(p.id);
                  setSelectedCategory(p.acceptedCategories[0]);
                  setIsModalOpen(true);
                }}
                className="w-full py-2 rounded-xl bg-[#006c49] text-white text-xs font-bold hover:bg-[#005237] transition-colors cursor-pointer"
              >
                Buat Kontrak Kirim
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Tabel Riwayat Pengiriman Bulk & Realisasi Arbitrase */}
      <div className="rounded-3xl border border-[#bbcabf]/30 bg-white p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-[#0b1c30] flex items-center gap-2">
              <GoogleIcon name="local_shipping" size={20} className="text-[#006c49]" />
              Riwayat Pengiriman Bulk ke Pabrik Recycler ({filteredShipments.length})
            </h2>
            <p className="text-xs text-[#6c7a71] mt-0.5">
              Pencatatan faktur surat jalan, status penyerahan tonase, dan realisasi pembagian margin.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-[#eff4ff] p-1 rounded-xl border border-[#bbcabf]/30 text-xs">
              {[
                { key: "all", label: "Semua" },
                { key: "Siap Kirim", label: "Siap Kirim" },
                { key: "Dalam Pengiriman", label: "Pengiriman" },
                { key: "Terkirim & Lunas", label: "Selesai" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setStatusFilter(tab.key as any)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    statusFilter === tab.key
                      ? "bg-white text-[#006c49] shadow-2xs"
                      : "text-[#6c7a71] hover:text-[#0b1c30]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari batch / offtaker..."
                className="text-xs p-2 pl-8 rounded-xl border border-[#bbcabf]/40 bg-white text-[#0b1c30] outline-none"
              />
              <div className="absolute left-2.5 top-2.5 text-[#6c7a71]">
                <GoogleIcon name="search" size={14} />
              </div>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#bbcabf]/30 text-[#6c7a71] font-bold text-[11px] uppercase tracking-wider">
                <th className="pb-3 pr-4">Kode Batch</th>
                <th className="pb-3 pr-4">Pabrik Offtaker</th>
                <th className="pb-3 pr-4">Kategori Sampah</th>
                <th className="pb-3 pr-4">Tonase (kg)</th>
                <th className="pb-3 pr-4">Harga / kg</th>
                <th className="pb-3 pr-4">Total Bruto</th>
                <th className="pb-3 pr-4">Margin ReBrew (65%)</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#bbcabf]/20">
              {filteredShipments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-xs text-[#6c7a71]">
                    Tidak ada pengiriman yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredShipments.map((s) => (
                  <tr key={s.id} className="hover:bg-[#f8f9ff] transition-colors">
                    <td className="py-3.5 pr-4 font-mono font-bold text-[#006c49]">{s.batchCode}</td>
                    <td className="py-3.5 pr-4 font-semibold text-[#0b1c30]">{s.offtakerName}</td>
                    <td className="py-3.5 pr-4 text-[#3c4a42]">{s.category}</td>
                    <td className="py-3.5 pr-4 font-bold text-[#0b1c30]">{s.weightKg} kg</td>
                    <td className="py-3.5 pr-4 text-[#6c7a71]">Rp {s.pricePerKg.toLocaleString("id-ID")}</td>
                    <td className="py-3.5 pr-4 font-extrabold text-[#0b1c30]">
                      Rp {s.grossTotal.toLocaleString("id-ID")}
                    </td>
                    <td className="py-3.5 pr-4 font-bold text-[#006c49]">
                      +Rp {s.rebrewGrossMargin.toLocaleString("id-ID")}
                    </td>
                    <td className="py-3.5 pr-4">
                      <span
                        className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                          s.status === "Terkirim & Lunas"
                            ? "bg-[#dcfce7] text-[#15803d]"
                            : s.status === "Dalam Pengiriman"
                            ? "bg-[#e0f2fe] text-[#0369a1]"
                            : "bg-[#fef3c7] text-[#92400e]"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedDetailShipment(s)}
                        className="px-3 py-1.5 rounded-lg border border-[#006c49] text-[#006c49] font-bold text-[11px] hover:bg-[#eff4ff] transition-colors cursor-pointer"
                      >
                        Detail Surat Jalan
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Buat Pengiriman Bulk Baru */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-[#bbcabf]/30 space-y-4 animate-fade-in my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#bbcabf]/20">
              <div className="flex items-center gap-2 text-[#006c49]">
                <GoogleIcon name="local_shipping" size={22} />
                <h3 className="text-base font-bold text-[#0b1c30]">Buat Pengiriman Bulk ke Offtaker</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateShipment} className="space-y-4 text-xs">
              {/* Partner Select */}
              <div className="space-y-1">
                <label className="font-bold text-[#0b1c30]">Pilih Pabrik / Offtaker Tujuan:</label>
                <select
                  value={selectedPartnerId}
                  onChange={(e) => setSelectedPartnerId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#bbcabf]/40 bg-white text-[#0b1c30] outline-none"
                >
                  {partners.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.location})
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Select */}
              <div className="space-y-1">
                <label className="font-bold text-[#0b1c30]">Kategori Material Limbah:</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#bbcabf]/40 bg-white text-[#0b1c30] outline-none"
                >
                  <option value="Plastic Cup (PP/PET)">Plastic Cup (PP/PET)</option>
                  <option value="Botol Plastik PET Bening">Botol Plastik PET Bening</option>
                  <option value="Tutup Cup HDPE (Merchandise Coaster)">Tutup Cup HDPE (Merchandise Coaster)</option>
                  <option value="Ampas Kopi (Circular Soil)">Ampas Kopi (Circular Soil)</option>
                  <option value="Kardus Kemasan (Carton Box)">Kardus Kemasan (Carton Box)</option>
                  <option value="Kaleng Aluminium Minuman">Kaleng Aluminium Minuman</option>
                </select>
              </div>

              {/* Weight & Price inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#0b1c30]">Tonase Muatan (kg):</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={inputWeight}
                    onChange={(e) => setInputWeight(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#bbcabf]/40 bg-white text-[#0b1c30] outline-none font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#0b1c30]">Harga Jual per kg (Rp):</label>
                  <input
                    type="number"
                    min="100"
                    required
                    value={inputPrice}
                    onChange={(e) => setInputPrice(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#bbcabf]/40 bg-white text-[#0b1c30] outline-none font-bold"
                  />
                </div>
              </div>

              {/* Arbitrage Margin Calculation Preview */}
              <div className="p-3.5 rounded-2xl bg-[#f0fdf4] border border-[#006c49]/30 space-y-1.5">
                <div className="flex justify-between font-bold text-xs">
                  <span className="text-[#3c4a42]">Estimasi Nilai Bruto Offtaker:</span>
                  <span className="text-[#0b1c30]">
                    Rp {((parseFloat(inputWeight) || 0) * (parseInt(inputPrice) || 0)).toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-[#306d58]">
                  <span>• Alokasi Poin Reward Kafe (35%):</span>
                  <span>
                    Rp {Math.round((parseFloat(inputWeight) || 0) * (parseInt(inputPrice) || 0) * 0.35).toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] font-bold text-[#006c49]">
                  <span>• Realisasi Margin Kotor ReBrew (65%):</span>
                  <span>
                    +Rp {Math.round((parseFloat(inputWeight) || 0) * (parseInt(inputPrice) || 0) * 0.65).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="font-medium text-[#3c4a42]">Catatan Surat Jalan / Plat Truk:</label>
                <input
                  type="text"
                  value={shipmentNotes}
                  onChange={(e) => setShipmentNotes(e.target.value)}
                  className="w-full p-2 rounded-xl border border-[#bbcabf]/30 bg-white text-[#0b1c30] outline-none"
                  placeholder="Contoh: Truk Box Ekspedisi ReBrew Plat L-8821-QR"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-[#bbcabf]/40 text-xs font-bold text-[#0b1c30] hover:bg-gray-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-[#006c49] text-white text-xs font-bold hover:bg-[#005237] shadow-sm cursor-pointer"
                >
                  Terbitkan Batch Pengiriman
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail Surat Jalan */}
      {selectedDetailShipment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-[#bbcabf]/30 space-y-4 animate-fade-in my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#bbcabf]/20">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#006c49]">
                  Faktur Pengiriman Bulk
                </span>
                <h3 className="text-base font-bold text-[#0b1c30]">
                  {selectedDetailShipment.batchCode}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetailShipment(null)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#f8f9ff] border border-[#bbcabf]/30 space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#6c7a71]">Pabrik Tujuan:</span>
                  <span className="font-bold text-[#0b1c30]">{selectedDetailShipment.offtakerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6c7a71]">Kategori Material:</span>
                  <span className="font-semibold text-[#006c49]">{selectedDetailShipment.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6c7a71]">Tonase Muatan:</span>
                  <span className="font-black text-[#0b1c30]">{selectedDetailShipment.weightKg} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6c7a71]">Harga Kesepakatan:</span>
                  <span className="font-medium text-[#0b1c30]">Rp {selectedDetailShipment.pricePerKg.toLocaleString("id-ID")} / kg</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-[#bbcabf]/20">
                  <span className="text-[#6c7a71]">Total Pembayaran Pabrik:</span>
                  <span className="font-extrabold text-[#0b1c30] text-sm">
                    Rp {selectedDetailShipment.grossTotal.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between text-[#006c49] font-bold">
                  <span>Margin Bersih ReBrew (65%):</span>
                  <span>+Rp {selectedDetailShipment.rebrewGrossMargin.toLocaleString("id-ID")}</span>
                </div>
                {selectedDetailShipment.notes && (
                  <div className="flex justify-between text-[#6c7a71] pt-1">
                    <span>Keterangan Armada:</span>
                    <span className="text-right max-w-[200px]">{selectedDetailShipment.notes}</span>
                  </div>
                )}
              </div>

              {/* Status Updater */}
              <div className="space-y-1.5">
                <label className="font-bold text-[#0b1c30]">Ubah Status Pengiriman:</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Siap Kirim", "Dalam Pengiriman", "Terkirim & Lunas"] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleUpdateStatus(selectedDetailShipment.id, st)}
                      className={`py-2 rounded-xl text-center border font-bold text-[11px] transition-all cursor-pointer ${
                        selectedDetailShipment.status === st
                          ? "bg-[#006c49] text-white border-[#006c49] shadow-2xs"
                          : "bg-white text-[#3c4a42] border-[#bbcabf]/40 hover:bg-[#eff4ff]"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-[#bbcabf]/20">
              <button
                type="button"
                onClick={() => setSelectedDetailShipment(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#bbcabf]/40 text-xs font-bold text-[#0b1c30] hover:bg-gray-50"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-[#006c49] text-white text-xs font-bold hover:bg-[#005237] shadow-sm flex items-center justify-center gap-1.5"
              >
                <GoogleIcon name="print" size={15} />
                <span>Cetak Surat Jalan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

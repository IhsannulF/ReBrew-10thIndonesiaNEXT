"use client";

import React, { useState } from "react";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import { DROP_POINTS, PICKUP_RADIUS_TIERS } from "@/constants/wasteData";
import { DepositMethod, DepositSummary } from "@/hooks/useDepositCalculator";

export interface DepositMethodSelectorProps {
  method: DepositMethod;
  setMethod: (method: DepositMethod) => void;
  selectedDropPoint: string;
  setSelectedDropPoint: (id: string) => void;
  pickupDistance: number;
  setPickupDistance: (dist: number) => void;
  pickupAddress: string;
  setPickupAddress: (addr: string) => void;
  pickupNotes: string;
  setPickupNotes: (notes: string) => void;
  pickupDate?: string;
  setPickupDate?: (date: string) => void;
  pickupTimeSlot?: string;
  setPickupTimeSlot?: (slot: string) => void;
  summary: DepositSummary;
  isSubmitting?: boolean;
  submitError?: string | null;
}

import { createClient } from "@/utils/supabase/client";

// Radius maksimal pemindaian Drop Point ReBrew di area kafe (25 km)
const MAX_SCAN_RADIUS_KM = 25.0;

// Helper fungsi rumus Haversine untuk menghitung jarak presisi (km) antara 2 titik koordinat
function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius bumi dalam km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export const DepositMethodSelector: React.FC<DepositMethodSelectorProps> = ({
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
  pickupDate = new Date().toISOString().split("T")[0],
  setPickupDate,
  pickupTimeSlot = "09:00 - 12:00 WIB",
  setPickupTimeSlot,
  summary,
  isSubmitting = false,
  submitError = null,
}) => {
  const [showFormulaModal, setShowFormulaModal] = useState(false);
  const [dbDropPoints, setDbDropPoints] = useState<typeof DROP_POINTS>(DROP_POINTS);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isScanning, setIsScanning] = useState(true);

  // 1. Fetch data drop points resmi dari tabel Supabase dengan jaminan Hub Melawai Jakarta Selatan
  React.useEffect(() => {
    async function loadDropPointsFromDb() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("drop_points")
          .select("*")
          .eq("is_active", true);

        const existingIds = new Set<string>();
        const combined: typeof DROP_POINTS = [];

        // 1. Selalu pastikan Drop Point Resmi Jakarta Selatan (Melawai) tersedia paling atas
        DROP_POINTS.forEach((p) => {
          existingIds.add(p.id);
          combined.push(p);
        });

        // 2. Tambahkan drop point dari DB jika ada yang belum terdaftar
        if (data && data.length > 0 && !error) {
          data.forEach((dp: any) => {
            if (!existingIds.has(dp.id)) {
              existingIds.add(dp.id);
              combined.push({
                id: dp.id,
                name: dp.name,
                adminName: dp.admin_name || "Fathiyah Nurul Izzah",
                address: dp.address,
                distance: "0.5 km",
                distanceKm: 0.5,
                hours: dp.operating_hours || "08:00 - 20:00 WIB",
                latitude: dp.lat || dp.latitude || -6.244293,
                longitude: dp.lng || dp.longitude || 106.801648,
                googleMapsUrl:
                  dp.google_maps_url ||
                  `https://www.google.com/maps/search/?api=1&query=${dp.lat || dp.latitude || -6.244293},${dp.lng || dp.longitude || 106.801648}`,
                phone: dp.phone || "0812-3456-7890",
              });
            }
          });
        }

        setDbDropPoints(combined);
      } catch {
        // Fallback ke DROP_POINTS constants
        setDbDropPoints(DROP_POINTS);
      }
    }

    loadDropPointsFromDb();
  }, []);

  // 2. Otomatis scan GPS saat komponen pertama kali dimuat & pilih yang terdekat
  React.useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          setUserLocation({ lat: userLat, lng: userLng });
          setIsScanning(false);

          // Cari drop point yang paling dekat
          let closestDp = dbDropPoints[0];
          let minDistance = Infinity;

          dbDropPoints.forEach((dp) => {
            if (dp.latitude && dp.longitude) {
              const dist = calculateHaversineDistance(userLat, userLng, dp.latitude, dp.longitude);
              if (dist < minDistance) {
                minDistance = dist;
                closestDp = dp;
              }
            }
          });

          if (closestDp) {
            setSelectedDropPoint(closestDp.id);
            setPickupDistance(Math.max(0.5, minDistance === Infinity ? closestDp.distanceKm : minDistance));
          }
        },
        () => {
          // Fallback jika izin GPS ditolak
          setIsScanning(false);
          if (dbDropPoints.length > 0) {
            setSelectedDropPoint(dbDropPoints[0].id);
          }
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      setIsScanning(false);
    }
  }, [dbDropPoints, setSelectedDropPoint, setPickupDistance]);

  // 3. Filter dan urutkan Drop Point berdasarkan jarak GPS
  const availableDropPoints = React.useMemo(() => {
    const list = dbDropPoints.map((dp) => {
      let calculatedDistance = dp.distanceKm;
      if (userLocation && dp.latitude && dp.longitude) {
        calculatedDistance = calculateHaversineDistance(
          userLocation.lat,
          userLocation.lng,
          dp.latitude,
          dp.longitude
        );
      }
      return {
        ...dp,
        calculatedDistance,
        isWithin25Km: calculatedDistance <= MAX_SCAN_RADIUS_KM,
      };
    });

    const filtered = list.filter((dp) => dp.isWithin25Km || !userLocation);
    // Jika tidak ada dalam radius 25 km (misal GPS di luar jangkauan), tetap tampilkan drop point terdekat
    if (filtered.length === 0 && list.length > 0) {
      return list.sort((a, b) => a.calculatedDistance - b.calculatedDistance);
    }

    return filtered.sort((a, b) => a.calculatedDistance - b.calculatedDistance);
  }, [dbDropPoints, userLocation]);


  return (
    <div className="flex flex-col gap-5">
      {/* Pilihan Metode Penyetoran */}
      <div className="rounded-2xl border border-[#bbcabf]/30 bg-white p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-[#0b1c30] flex items-center gap-2">
            <GoogleIcon name="local_shipping" size={20} className="text-[#006c49]" />
            Metode Penyetoran
          </h2>
          <span className="text-[11px] text-[#6c7a71]">Pilih logistik</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Option: Drop Point */}
          <button
            type="button"
            onClick={() => setMethod("drop_point")}
            className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all relative ${
              method === "drop_point"
                ? "border-[#006c49] bg-[#eff4ff] ring-1 ring-[#006c49]"
                : "border-[#bbcabf]/30 hover:bg-[#f8f9ff]"
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1.5">
              <GoogleIcon
                name="store"
                size={22}
                className={method === "drop_point" ? "text-[#006c49]" : "text-[#6c7a71]"}
              />
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#10b981]/20 text-[#00422b]">
                Bebas Min. Berat
              </span>
            </div>
            <div className="text-sm font-bold text-[#0b1c30]">Drop Point</div>
            <div className="text-[11px] text-[#3c4a42] mt-0.5">Antar mandiri ke hub</div>
          </button>

          {/* Option: Dijemput */}
          <button
            type="button"
            onClick={() => setMethod("dijemput")}
            className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all relative ${
              method === "dijemput"
                ? "border-[#006c49] bg-[#eff4ff] ring-1 ring-[#006c49]"
                : "border-[#bbcabf]/30 hover:bg-[#f8f9ff]"
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1.5">
              <GoogleIcon
                name="electric_moped"
                size={22}
                className={method === "dijemput" ? "text-[#006c49]" : "text-[#6c7a71]"}
              />
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#e0f2fe] text-[#0369a1]">
                Min. Tier Radius
              </span>
            </div>
            <div className="text-sm font-bold text-[#0b1c30]">Dijemput ReBrew</div>
            <div className="text-[11px] text-[#3c4a42] mt-0.5">Armada ambil ke kafe</div>
          </button>
        </div>

        {/* Dynamic Detail Area: Drop Point vs Dijemput */}
        <div className="mt-4 pt-4 border-t border-[#bbcabf]/20">
          {method === "drop_point" ? (
            <div className="flex flex-col gap-3">
              {/* Header Status Scan Radius 25 km Otomatis */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <label className="text-xs font-bold text-[#0b1c30]">
                    Drop Point Terdekat Kafe:
                  </label>
                </div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#f0fdf4] text-[#006c49] border border-[#006c49]/20">
                  {isScanning
                    ? "Memindai radius 25 km..."
                    : `Radius ≤ ${MAX_SCAN_RADIUS_KM} km`}
                </span>
              </div>

              {/* List Drop Points yang Lolos Radius 25 km */}
              {availableDropPoints.length > 0 ? (
                <div className="flex flex-col gap-2.5">
                  {availableDropPoints.map((dp, index) => {
                    const isClosest = index === 0;
                    const isSelected = selectedDropPoint === dp.id || (isClosest && !selectedDropPoint);

                    return (
                      <label
                        key={dp.id}
                        className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? "bg-[#f0fdf4] border-[#006c49] ring-1 ring-[#006c49]/25 shadow-xs"
                            : "border-[#bbcabf]/30 hover:bg-[#f8f9ff]"
                        }`}
                      >
                        <input
                          type="radio"
                          name="drop_point"
                          value={dp.id}
                          checked={isSelected}
                          onChange={() => setSelectedDropPoint(dp.id)}
                          className="mt-1 accent-[#006c49]"
                        />
                        <div className="flex-1 min-w-0">
                          {/* Header Item: Name & Themed Location Badge */}
                          <div className="flex items-start sm:items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="text-xs font-bold text-[#0b1c30] truncate">
                                {dp.name}
                              </span>
                              {isClosest && (
                                <span className="shrink-0 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#006c49] text-white">
                                  Terdekat ✨
                                </span>
                              )}
                            </div>

                            {/* Themed Location Distance Badge */}
                            <div className="flex items-center gap-1 text-[11px] font-bold text-[#006c49] bg-[#eff4ff] border border-[#006c49]/20 px-2.5 py-0.5 rounded-full shrink-0">
                              <GoogleIcon name="near_me" size={13} className="text-[#006c49]" />
                              <span>{typeof dp.calculatedDistance === "number" ? `${dp.calculatedDistance.toFixed(1)} km` : dp.distance}</span>
                            </div>
                          </div>

                          {/* Address & Admin PIC */}
                          <p className="text-[11px] text-[#6c7a71] mt-1 leading-relaxed">
                            {dp.address}
                          </p>

                          <div className="flex items-center gap-1.5 mt-1.5">
                            <span className="text-[10px] font-bold text-[#006c49] bg-[#eff4ff] border border-[#006c49]/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <GoogleIcon name="verified_user" size={12} className="text-[#006c49]" />
                              Admin Hub: {dp.adminName || "Fathiyah Nurul Izzah"}
                            </span>
                          </div>

                          {/* Footer Details: Operating Hours & Google Maps Action */}
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#bbcabf]/20">
                            <span className="text-[10px] text-[#306d58] font-semibold flex items-center gap-1">
                              <GoogleIcon name="schedule" size={13} />
                              {dp.hours}
                            </span>

                            {dp.googleMapsUrl && (
                              <a
                                href={dp.googleMapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#006c49] hover:text-[#0b1c30] hover:underline px-2.5 py-1 rounded-lg bg-[#eff4ff] border border-[#006c49]/20 transition-colors"
                              >
                                <GoogleIcon name="explore" size={13} />
                                <span>Buka Google Maps</span>
                                <GoogleIcon name="open_in_new" size={11} />
                              </a>
                            )}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[#fff8e1] border border-[#ffecb3] text-xs text-[#8d6e63] flex flex-col gap-1">
                  <span className="font-bold text-[#5d4037]">Tidak ada Drop Point dalam radius 25 km</span>
                  <span>Silakan pilih metode <strong>Dijemput ReBrew</strong> untuk penjemputan langsung oleh armada ke lokasi kafe Anda.</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#0b1c30]">
                  Ketentuan Penjemputan Armada ReBrew:
                </label>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#eff4ff] text-[#006c49]">
                  {summary.tierLabel}
                </span>
              </div>

              {/* Tier Information Chips */}
              <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                {PICKUP_RADIUS_TIERS.map((tier, idx) => {
                  const isActive =
                    (idx === 0 && pickupDistance <= 3.0) ||
                    (idx === 1 && pickupDistance > 3.0 && pickupDistance <= 7.0) ||
                    (idx === 2 && pickupDistance > 7.0);

                  return (
                    <div
                      key={tier.label}
                      className={`p-2 rounded-lg border text-center transition-all ${
                        isActive
                          ? "border-[#006c49] bg-[#f0fdf4] text-[#006c49] font-bold"
                          : "border-[#bbcabf]/30 bg-[#f8f9ff] text-[#6c7a71]"
                      }`}
                    >
                      <div className="truncate">{tier.label}</div>
                      <div className="text-xs font-extrabold mt-0.5">Min. {tier.minWeightKg} kg</div>
                    </div>
                  );
                })}
              </div>

              {/* Jarak Slider / Input */}
              <div className="p-3 rounded-xl bg-[#f8f9ff] border border-[#bbcabf]/30 flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#3c4a42] font-semibold">Estimasi Jarak dari Micro-Hub:</span>
                  <span className="font-extrabold text-[#006c49] text-sm">{pickupDistance} km</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="12.0"
                  step="0.5"
                  value={pickupDistance}
                  onChange={(e) => setPickupDistance(parseFloat(e.target.value))}
                  className="w-full accent-[#006c49] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#6c7a71]">
                  <span>Dekat (0.5 km)</span>
                  <span>Sedang (5.0 km)</span>
                  <span>Jauh (12.0 km)</span>
                </div>
              </div>

              {/* Feedback Syarat Penjemputan */}
              {summary.isPickupEligible ? (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#f0fdf4] border border-[#006c49]/30 text-xs text-[#006c49]">
                  <GoogleIcon name="check_circle" size={18} />
                  <div className="font-medium">
                    <span className="font-bold">Memenuhi syarat penjemputan!</span> Total {summary.totalWeight} kg memenuhi batas min. {summary.minWeightRequired} kg untuk jarak {pickupDistance} km.
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2 p-2.5 rounded-xl bg-[#fff4e5] border border-[#ff9800]/40 text-xs text-[#b45309]">
                  <GoogleIcon name="warning" size={18} className="shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold">
                      Belum memenuhi syarat minimum penjemputan ({summary.minWeightRequired} kg).
                    </span>
                    <span>
                      Untuk jarak <strong>{pickupDistance} km ({summary.tierLabel})</strong>, armada membutuhkan minimal <strong>{summary.minWeightRequired} kg</strong> agar biaya BBM & logistik efisien.
                    </span>
                    <span className="font-semibold mt-1 text-[#d97706]">
                      💡 Tambah <strong>{summary.weightDeficit} kg</strong> lagi atau pilih metode <strong>Drop Point</strong> (tanpa min. berat).
                    </span>
                  </div>
                </div>
              )}

              {/* Jadwal Penjemputan Armada */}
              <div className="flex flex-col gap-3 p-3 rounded-2xl bg-[#f8f9ff] border border-[#bbcabf]/30">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#0b1c30] flex items-center gap-1.5">
                    <GoogleIcon name="calendar_today" size={15} className="text-[#006c49]" />
                    Pilih Jadwal Penjemputan:
                  </label>
                  <span className="text-[10px] font-bold text-[#006c49] bg-[#eff4ff] px-2 py-0.5 rounded-md">
                    Wajib Tepat Waktu
                  </span>
                </div>

                {/* Date Input */}
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-[#3c4a42] font-semibold">Tanggal Jemput:</span>
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={pickupDate}
                    onChange={(e) => setPickupDate && setPickupDate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#bbcabf]/40 bg-white text-[#0b1c30] focus:ring-1 focus:ring-[#006c49] outline-none"
                  />
                </div>

                {/* Time Slot Chips */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] text-[#3c4a42] font-semibold">Slot Jam Penjemputan:</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { slot: "09:00 - 12:00 WIB", label: "Pagi", time: "09:00 - 12:00" },
                      { slot: "13:00 - 15:00 WIB", label: "Siang", time: "13:00 - 15:00" },
                      { slot: "15:00 - 18:00 WIB", label: "Sore", time: "15:00 - 18:00" },
                    ].map((item) => {
                      const isSelected = pickupTimeSlot === item.slot;
                      return (
                        <button
                          key={item.slot}
                          type="button"
                          onClick={() => setPickupTimeSlot && setPickupTimeSlot(item.slot)}
                          className={`p-2 rounded-xl text-center border transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#006c49] text-white border-[#006c49] shadow-2xs font-bold"
                              : "bg-white text-[#3c4a42] border-[#bbcabf]/40 hover:bg-[#eff4ff]"
                          }`}
                        >
                          <div className="text-[11px] font-bold">{item.label}</div>
                          <div className="text-[9px] opacity-90">{item.time}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Auto-Reject Policy Warning Notice */}
                <div className="flex items-start gap-2 p-2.5 rounded-xl bg-[#fff4e5] border border-[#ff9800]/30 text-[11px] text-[#92400e]">
                  <GoogleIcon name="timer" size={16} className="text-[#d97706] shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <strong>Ketentuan Kedaluwarsa Otomatis:</strong> Jika penjemputan belum selesai hingga batas jam slot jadwal berakhir, sistem akan <strong>otomatis menolak/membatalkan</strong> tiket penjemputan.
                  </div>
                </div>
              </div>

              {/* Input Alamat & Catatan */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-[#0b1c30]">Alamat Lengkap Kafe:</label>
                <textarea
                  rows={2}
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#bbcabf]/40 bg-white text-[#0b1c30] focus:ring-1 focus:ring-[#006c49] outline-none"
                  placeholder="Nama kafe, jalan, nomor, patokan khusus..."
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[#3c4a42]">Catatan Khusus Armada (Opsional):</label>
                <input
                  type="text"
                  value={pickupNotes}
                  onChange={(e) => setPickupNotes(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-[#bbcabf]/30 bg-white text-[#0b1c30] outline-none"
                  placeholder="Contoh: Titip di barista kasir lantai 1, penjemputan sore jam 15.00"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ringkasan Estimasi & Transparansi Unit Economics */}
      <div className="rounded-2xl border border-[#bbcabf]/30 bg-white p-5 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#0b1c30] flex items-center gap-1.5">
            <GoogleIcon name="receipt_long" size={18} className="text-[#006c49]" />
            Ringkasan Penyetoran & Nilai
          </h3>
          <button
            type="button"
            onClick={() => setShowFormulaModal(!showFormulaModal)}
            className="text-[11px] font-bold text-[#006c49] hover:underline flex items-center gap-1"
          >
            <GoogleIcon name="info" size={15} />
            <span>Rumus Poin</span>
          </button>
        </div>

        {/* Info Banner Rumus Poin (Collapsible / Tooltip) */}
        {showFormulaModal && (
          <div className="p-3 rounded-xl bg-[#eff4ff] border border-[#006c49]/20 text-xs text-[#0b1c30] flex flex-col gap-1.5 animate-fade-in">
            <div className="font-bold text-[#006c49] flex items-center gap-1">
              <GoogleIcon name="calculate" size={16} />
              Model Konversi Poin ReBrew
            </div>
            <div className="font-mono text-[11px] bg-white p-2 rounded-lg border border-[#bbcabf]/30 text-[#0b1c30]">
              Nilai Poin/kg = Harga Offtaker − Margin ReBrew − Biaya Operasional
            </div>
            <p className="text-[11px] text-[#3c4a42]">
              ReBrew membagikan <strong>{summary.shareRatePercent}% (rentang 20-40%)</strong> dari nilai jual ke offtaker/recycler kepada mitra kafe sebagai reward poin, di mana <strong>1 Poin = Rp 1</strong>. Sisa margin dialokasikan untuk operasional armada, sorting, dan buffer fluktuasi pasar daur ulang.
            </p>
          </div>
        )}

        {/* Tabel Ringkasan Nilai */}
        <div className="flex flex-col gap-2.5 text-xs">
          <div className="flex justify-between text-[#3c4a42]">
            <span>Total Berat Sampah:</span>
            <span className="font-bold text-[#0b1c30]">{summary.totalWeight} kg</span>
          </div>

          <div className="flex justify-between text-[#3c4a42]">
            <span>Pencegahan Emisi Karbon:</span>
            <span className="font-bold text-[#306d58]">{summary.totalCo2} kg CO₂e</span>
          </div>

          <div className="flex justify-between text-[#3c4a42]">
            <span>Metode Pengumpulan:</span>
            <span className="font-semibold text-[#0b1c30]">
              {method === "drop_point" ? "Drop Point (Antar Mandiri)" : `Dijemput (${pickupDistance} km)`}
            </span>
          </div>

          <div className="flex justify-between text-[#6c7a71] text-[11px]">
            <span>Est. Nilai Jual Offtaker:</span>
            <span>Rp {summary.totalOfftakerGross.toLocaleString("id-ID")}</span>
          </div>

          <div className="flex justify-between text-[#6c7a71] text-[11px]">
            <span>Alokasi Poin Coffee Shop ({summary.shareRatePercent}%):</span>
            <span className="font-semibold text-[#006c49]">Rp {summary.equivalentRupiah.toLocaleString("id-ID")}</span>
          </div>

          <div className="my-1 border-t border-[#bbcabf]/20" />

          {/* Highlight Total Reward Poin & Saldo */}
          <div className="flex justify-between items-center">
            <div>
              <span className="text-xs font-bold text-[#0b1c30] block">Total Reward Poin:</span>
              <span className="text-[11px] text-[#6c7a71]">(1 Poin = Rp 1 Saldo)</span>
            </div>
            <div className="text-right">
              <div className="text-xl font-extrabold text-[#006c49]">
                +{summary.finalPoints.toLocaleString("id-ID")} Poin
              </div>
              <div className="text-xs font-bold text-[#306d58]">
                ≈ Rp {summary.equivalentRupiah.toLocaleString("id-ID")}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Error Alert */}
        {submitError && (
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#ffdad6]/40 border border-[#ba1a1a]/30 text-[#ba1a1a] text-xs">
            <GoogleIcon name="error" size={18} className="shrink-0" />
            <span className="font-medium leading-relaxed">{submitError}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={summary.totalWeight === 0 || (method === "dijemput" && !summary.isPickupEligible) || isSubmitting}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-[#006c49] text-white text-sm font-bold shadow-sm hover:bg-[#2b6954] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              <span>Memproses Tiket...</span>
            </>
          ) : (
            <>
              <GoogleIcon name="check_circle" size={20} />
              <span>Konfirmasi & Buat Tiket Setor</span>
            </>
          )}
        </button>

        {method === "dijemput" && !summary.isPickupEligible && summary.totalWeight > 0 && (
          <p className="text-[11px] text-center text-[#ba1a1a]">
            * Belum bisa buat tiket jemput: kurang {summary.weightDeficit} kg lagi untuk radius {pickupDistance} km.
          </p>
        )}
      </div>
    </div>
  );
};


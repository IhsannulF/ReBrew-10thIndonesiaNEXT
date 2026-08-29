"use client";

import React, { useState } from "react";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import {
  AdminCourierItem,
  AdminDispatchItem,
  assignCourierAction,
  addCourierAction,
} from "@/app/actions/admin";

interface AdminLogistikClientViewProps {
  initialData: {
    couriers: AdminCourierItem[];
    dispatches: AdminDispatchItem[];
    metrics: {
      totalCouriers: number;
      activeFleetCount: number;
      pendingPickupCount: number;
      totalPickupWeightEstKg: number;
    };
  };
}

export const AdminLogistikClientView: React.FC<AdminLogistikClientViewProps> = ({
  initialData,
}) => {
  const [couriers, setCouriers] = useState<AdminCourierItem[]>(initialData.couriers);
  const [dispatches, setDispatches] = useState<AdminDispatchItem[]>(initialData.dispatches);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State: Assign Courier
  const [selectedDispatch, setSelectedDispatch] = useState<AdminDispatchItem | null>(null);
  const [selectedCourierName, setSelectedCourierName] = useState<string>(couriers[0]?.name || "Budi Santoso");
  const [isAssigning, setIsAssigning] = useState(false);

  // Modal State: Add Courier
  const [isAddCourierOpen, setIsAddCourierOpen] = useState(false);
  const [newCourierName, setNewCourierName] = useState("");
  const [newCourierPhone, setNewCourierPhone] = useState("");
  const [newCourierVehicle, setNewCourierVehicle] = useState("Motor Listrik Gesits Box (30 kg)");
  const [newCourierPlate, setNewCourierPlate] = useState("");
  const [newCourierArea, setNewCourierArea] = useState("Surabaya Timur");

  // Feedback State
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle Courier Assignment
  const handleAssignCourier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDispatch || isAssigning) return;

    setIsAssigning(true);
    setErrorMessage(null);

    try {
      const res = await assignCourierAction({
        ticketId: selectedDispatch.id,
        courierName: selectedCourierName,
      });

      if (res.success) {
        setDispatches((prev) =>
          prev.map((d) =>
            d.id === selectedDispatch.id
              ? {
                  ...d,
                  courierName: selectedCourierName,
                  status: "Dalam Perjalanan",
                }
              : d
          )
        );

        setSuccessToast(
          `Kurir ${selectedCourierName} berhasil ditugaskan untuk penjemputan tiket ${selectedDispatch.ticketCode} (${selectedDispatch.cafeName})!`
        );
        setSelectedDispatch(null);
        setTimeout(() => setSuccessToast(null), 4000);
      } else {
        setErrorMessage(res.error || "Gagal menugaskan kurir.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Terjadi kesalahan.");
    } finally {
      setIsAssigning(false);
    }
  };

  // Handle Add New Courier
  const handleAddCourier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourierName || isAssigning) return;

    setIsAssigning(true);
    setErrorMessage(null);

    try {
      const res = await addCourierAction({
        name: newCourierName,
        phone: newCourierPhone || "0812-0000-0000",
        vehicle: newCourierVehicle,
        plateNumber: newCourierPlate || "L 1234 XX",
        assignedArea: newCourierArea,
      });

      if (res.success) {
        const newCourierObj: AdminCourierItem = {
          id: `cur-${Date.now()}`,
          name: newCourierName,
          phone: newCourierPhone || "0812-0000-0000",
          vehicle: newCourierVehicle,
          plateNumber: newCourierPlate || "L 1234 XX",
          assignedArea: newCourierArea,
          status: "Standby di Hub",
        };

        setCouriers([newCourierObj, ...couriers]);
        setIsAddCourierOpen(false);
        setNewCourierName("");
        setNewCourierPhone("");
        setNewCourierPlate("");
        setSuccessToast(`Armada kurir ${newCourierName} berhasil ditambahkan!`);
        setTimeout(() => setSuccessToast(null), 4000);
      } else {
        setErrorMessage(res.error || "Gagal menambahkan kurir.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Terjadi kesalahan.");
    } finally {
      setIsAssigning(false);
    }
  };

  // Filter Dispatches
  const filteredDispatches = dispatches.filter((d) => {
    if (statusFilter !== "all" && d.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        d.ticketCode.toLowerCase().includes(q) ||
        d.cafeName.toLowerCase().includes(q) ||
        d.courierName.toLowerCase().includes(q) ||
        d.address.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeFleetCount = couriers.filter((c) => c.status === "Aktif Bertugas").length;
  const pendingPickupCount = dispatches.filter((d) => d.status !== "Selesai" && d.status !== "Ditolak").length;
  const totalWeightKg = dispatches.reduce((acc, d) => acc + d.estimatedWeightKg, 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#bbcabf]/30 pb-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-[#006c49] font-semibold mb-0.5">
            <span>Admin</span>
            <span>/</span>
            <span className="text-[#6c7a71]">Armada & Logistik</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0b1c30]">
            Manajemen Armada Kurir & Penugasan Pickup Kafe
          </h1>
          <p className="text-xs text-[#6c7a71] mt-0.5">
            Kelola rute armada penjemputan berbasis radius dari Micro-Hub Surabaya Timur untuk efisiensi BBM dan waktu.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddCourierOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#006c49] text-white text-xs font-bold hover:bg-[#005237] transition-all shadow-sm self-start sm:self-center cursor-pointer active:scale-95"
        >
          <GoogleIcon name="add_circle" size={18} />
          <span>Tambah Armada Kurir</span>
        </button>
      </div>

      {/* Toast Alerts */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-[#f0fdf4] border border-[#006c49]/30 text-xs text-[#006c49] font-bold flex items-center gap-2.5 animate-fade-in shadow-xs">
          <GoogleIcon name="check_circle" size={20} filled />
          <span>{successToast}</span>
        </div>
      )}

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#bbcabf]/30 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6c7a71]">Total Armada Kurir</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eff4ff] text-[#006c49]">
              <GoogleIcon name="electric_moped" size={18} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-[#0b1c30]">{couriers.length} Unit</div>
            <div className="text-[11px] text-[#006c49] font-medium mt-0.5">{activeFleetCount} armada bertugas</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#bbcabf]/30 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6c7a71]">Penjemputan Aktif</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eff6ff] text-[#0284c7]">
              <GoogleIcon name="local_shipping" size={18} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-[#0284c7]">{pendingPickupCount} Titik</div>
            <div className="text-[11px] text-[#6c7a71] font-medium mt-0.5">Order pickup terjadwal</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#bbcabf]/30 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6c7a71]">Est. Berat Jemputan</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f0fdf4] text-[#006c49]">
              <GoogleIcon name="scale" size={18} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-[#006c49]">{totalWeightKg} kg</div>
            <div className="text-[11px] text-[#306d58] font-medium mt-0.5">Muatan menuju Micro-Hub</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#bbcabf]/30 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6c7a71]">Central Hub</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#fffdf5] text-[#d97706]">
              <GoogleIcon name="warehouse" size={18} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-base font-extrabold text-[#0b1c30] truncate">Surabaya Timur</div>
            <div className="text-[11px] text-[#6c7a71] font-medium mt-0.5">Radius operasional 15 km</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Dispatches Queue and Fleet Couriers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Active Dispatches List (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl border border-[#bbcabf]/30 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#0b1c30] flex items-center gap-2">
                <GoogleIcon name="route" size={20} className="text-[#006c49]" />
                Jadwal Penjemputan Armada ({filteredDispatches.length})
              </h2>
              <p className="text-xs text-[#6c7a71] mt-0.5">
                Penugasan kurir jemput sampah dari kedai kafe menuju Micro-Hub.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-[#eff4ff] p-1 rounded-xl border border-[#bbcabf]/30 text-xs self-start">
              {[
                { key: "all", label: "Semua" },
                { key: "Terjadwal", label: "Terjadwal" },
                { key: "Dalam Perjalanan", label: "Perjalanan" },
                { key: "Selesai", label: "Selesai" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setStatusFilter(tab.key)}
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
          </div>

          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kode tiket, nama kafe, atau kurir..."
              className="w-full text-xs p-2.5 pl-9 rounded-xl border border-[#bbcabf]/40 bg-white text-[#0b1c30] outline-none"
            />
            <div className="absolute left-3 top-2.5 text-[#6c7a71]">
              <GoogleIcon name="search" size={16} />
            </div>
          </div>

          {/* Dispatches List Cards */}
          <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
            {filteredDispatches.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white border border-[#bbcabf]/30 text-center text-xs text-[#6c7a71]">
                Tidak ada jadwal penjemputan armada yang sesuai.
              </div>
            ) : (
              filteredDispatches.map((d) => (
                <div
                  key={d.id}
                  className="p-4 rounded-2xl border border-[#bbcabf]/30 bg-[#f8f9ff] hover:border-[#006c49]/40 hover:bg-white transition-all flex flex-col gap-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-[#006c49] bg-white px-2.5 py-0.5 rounded-md border border-[#adedd3]">
                        {d.ticketCode}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          d.status === "Selesai"
                            ? "bg-[#dcfce7] text-[#15803d]"
                            : d.status === "Dalam Perjalanan"
                            ? "bg-[#e0f2fe] text-[#0369a1]"
                            : d.status === "Ditolak"
                            ? "bg-[#fee2e2] text-[#991b1b]"
                            : "bg-[#fef3c7] text-[#92400e]"
                        }`}
                      >
                        {d.status}
                      </span>
                    </div>

                    <span className="text-[11px] text-[#6c7a71] font-medium">🕒 {d.scheduledTime}</span>
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-[#0b1c30]">{d.cafeName}</h3>
                      <p className="text-xs text-[#6c7a71] mt-0.5 flex items-center gap-1">
                        <GoogleIcon name="location_on" size={13} className="text-[#006c49]" />
                        <span>{d.address}</span>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-[#006c49]">{d.distanceKm} km dari Hub</div>
                      <div className="text-[11px] font-extrabold text-[#0b1c30]">Est. {d.estimatedWeightKg} kg</div>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-[#bbcabf]/20 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-[#3c4a42]">
                      <GoogleIcon name="electric_moped" size={16} className="text-[#006c49]" />
                      <span>
                        Kurir Ditugaskan: <strong className="text-[#0b1c30]">{d.courierName}</strong>
                      </span>
                    </div>

                    {d.status !== "Selesai" && d.status !== "Ditolak" && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDispatch(d);
                          setSelectedCourierName(d.courierName);
                        }}
                        className="px-3 py-1 rounded-lg bg-white border border-[#006c49] text-[#006c49] font-bold text-[11px] hover:bg-[#eff4ff] transition-colors cursor-pointer"
                      >
                        Tugaskan Kurir
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Fleet Couriers & Drivers (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl border border-[#bbcabf]/30 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#0b1c30] flex items-center gap-2">
                <GoogleIcon name="electric_moped" size={20} className="text-[#006c49]" />
                Daftar Armada & Kurir ReBrew
              </h2>
              <p className="text-xs text-[#6c7a71] mt-0.5">
                Kendaraan listrik dan blindvan pickup Micro-Hub Surabaya Timur.
              </p>
            </div>
          </div>

          {/* Courier List */}
          <div className="space-y-3">
            {couriers.length === 0 ? (
              <div className="p-8 rounded-2xl border border-dashed border-[#bbcabf]/60 bg-[#f8f9ff] text-center space-y-2.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#6c7a71] mx-auto shadow-2xs border border-[#bbcabf]/30">
                  <GoogleIcon name="electric_moped" size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0b1c30]">Belum Ada Armada & Kurir</h3>
                  <p className="text-xs text-[#6c7a71] max-w-xs mx-auto mt-0.5">
                    Admin Micro-Hub belum mendaftarkan kurir atau kendaraan penjemputan resmi.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddCourierOpen(true)}
                  className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#006c49] text-white text-xs font-bold hover:bg-[#005237] transition-all cursor-pointer shadow-xs"
                >
                  <GoogleIcon name="add_circle" size={16} />
                  <span>Tambah Kurir Pertama</span>
                </button>
              </div>
            ) : (
              couriers.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-2xl border border-[#bbcabf]/30 bg-gradient-to-br from-white to-[#f8f9ff] flex flex-col gap-2 text-xs"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eff4ff] text-[#006c49] font-bold text-xs">
                        {c.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-bold text-sm text-[#0b1c30] block">{c.name}</span>
                        <span className="text-[10px] text-[#6c7a71]">{c.phone}</span>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        c.status === "Aktif Bertugas"
                          ? "bg-[#dcfce7] text-[#15803d]"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-[#bbcabf]/20 space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-[#6c7a71]">Kendaraan:</span>
                      <span className="font-semibold text-[#0b1c30]">{c.vehicle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6c7a71]">Plat Nomor:</span>
                      <span className="font-mono font-bold text-[#006c49]">{c.plateNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6c7a71]">Zona Rute:</span>
                      <span className="font-medium text-[#3c4a42] text-right">{c.assignedArea}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal: Tugaskan Kurir */}
      {selectedDispatch && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-[#bbcabf]/30 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#bbcabf]/20">
              <div className="flex items-center gap-2 text-[#006c49]">
                <GoogleIcon name="person_pin_circle" size={22} />
                <h3 className="text-base font-bold text-[#0b1c30]">Tugaskan Kurir Armada</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDispatch(null)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-[#f8f9ff] border border-[#bbcabf]/30 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-[#6c7a71]">Kode Tiket:</span>
                <span className="font-mono font-bold text-[#006c49]">{selectedDispatch.ticketCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6c7a71]">Mitra Kafe:</span>
                <span className="font-bold text-[#0b1c30]">{selectedDispatch.cafeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6c7a71]">Alamat Penjemputan:</span>
                <span className="font-medium text-[#3c4a42] text-right max-w-[200px]">{selectedDispatch.address}</span>
              </div>
            </div>

            {couriers.length === 0 ? (
              <div className="p-4 rounded-2xl bg-[#eff4ff] border border-[#bbcabf]/30 text-xs space-y-3 text-center">
                <p className="text-[#3c4a42]">
                  Belum ada armada kurir terdaftar. Tambahkan kurir terlebih dahulu sebelum menugaskan penjemputan.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDispatch(null);
                    setIsAddCourierOpen(true);
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#006c49] text-white font-bold text-xs hover:bg-[#005237] transition-all cursor-pointer shadow-xs"
                >
                  + Tambah Kurir Baru Sekarang
                </button>
              </div>
            ) : (
              <form onSubmit={handleAssignCourier} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-[#0b1c30]">Pilih Kurir Armada:</label>
                  <select
                    value={selectedCourierName}
                    onChange={(e) => setSelectedCourierName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#bbcabf]/40 bg-white text-[#0b1c30] outline-none font-bold"
                  >
                    {couriers.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name} — {c.vehicle} ({c.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-[#bbcabf]/20">
                  <button
                    type="button"
                    onClick={() => setSelectedDispatch(null)}
                    className="flex-1 py-2.5 rounded-xl border border-[#bbcabf]/40 text-xs font-bold text-[#0b1c30] hover:bg-gray-50 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isAssigning}
                    className="flex-1 py-2.5 rounded-xl bg-[#006c49] text-white text-xs font-bold hover:bg-[#005237] shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {isAssigning ? "Menugaskan..." : "Konfirmasi Penugasan"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal: Tambah Armada Kurir Baru */}
      {isAddCourierOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-[#bbcabf]/30 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#bbcabf]/20">
              <div className="flex items-center gap-2 text-[#006c49]">
                <GoogleIcon name="electric_moped" size={22} />
                <h3 className="text-base font-bold text-[#0b1c30]">Tambah Armada Kurir Baru</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddCourierOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCourier} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#0b1c30]">Nama Lengkap Kurir:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rian Mahendra"
                  value={newCourierName}
                  onChange={(e) => setNewCourierName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#bbcabf]/40 bg-white text-[#0b1c30] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#0b1c30]">No. Telepon / WhatsApp:</label>
                <input
                  type="text"
                  required
                  placeholder="0812-xxxx-xxxx"
                  value={newCourierPhone}
                  onChange={(e) => setNewCourierPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#bbcabf]/40 bg-white text-[#0b1c30] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#0b1c30]">Jenis Kendaraan:</label>
                <select
                  value={newCourierVehicle}
                  onChange={(e) => setNewCourierVehicle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#bbcabf]/40 bg-white text-[#0b1c30] outline-none font-bold"
                >
                  <option value="Motor Listrik Gesits Box (30 kg)">Motor Listrik Gesits Box (30 kg)</option>
                  <option value="Motor Listrik Alva One (35 kg)">Motor Listrik Alva One (35 kg)</option>
                  <option value="Pickup Blindvan GranMax (300 kg)">Pickup Blindvan GranMax (300 kg)</option>
                  <option value="Truk Box Engkel L300 (800 kg)">Truk Box Engkel L300 (800 kg)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-[#0b1c30]">Plat Nomor:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: L 4521 AB"
                    value={newCourierPlate}
                    onChange={(e) => setNewCourierPlate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#bbcabf]/40 bg-white text-[#0b1c30] outline-none font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[#0b1c30]">Zona Penugasan:</label>
                  <input
                    type="text"
                    required
                    placeholder="Surabaya Timur"
                    value={newCourierArea}
                    onChange={(e) => setNewCourierArea(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#bbcabf]/40 bg-white text-[#0b1c30] outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-[#bbcabf]/20">
                <button
                  type="button"
                  onClick={() => setIsAddCourierOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#bbcabf]/40 text-xs font-bold text-[#0b1c30] hover:bg-gray-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isAssigning}
                  className="flex-1 py-2.5 rounded-xl bg-[#006c49] text-white text-xs font-bold hover:bg-[#005237] shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isAssigning ? "Menyimpan..." : "Simpan Kurir"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

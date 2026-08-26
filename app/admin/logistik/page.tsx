"use client";

import React, { useState } from "react";
import { GoogleIcon } from "@/components/ui/GoogleIcon";

export default function AdminLogistikPage() {
  const [couriers] = useState([
    {
      id: "cur-1",
      name: "Budi Santoso",
      phone: "0812-4455-6677",
      vehicle: "Motor Listrik Box (Kapasitas 30 kg)",
      plateNumber: "L 4521 AB",
      assignedArea: "Surabaya Timur (Gubeng, Gn. Anyar, Manyar)",
      status: "Aktif Bertugas",
    },
    {
      id: "cur-2",
      name: "Agus Pratama",
      phone: "0813-8899-0011",
      vehicle: "Pickup Blindvan (Kapasitas 300 kg)",
      plateNumber: "L 9120 WZ",
      assignedArea: "Surabaya Pusat & Selatan (Rungkut, Wonokromo)",
      status: "Standby di Hub",
    },
  ]);

  const [dispatches] = useState([
    {
      id: "disp-1",
      ticketCode: "RB-763412",
      cafeName: "Brew & Co Manyar",
      address: "Jl. Manyar Kertoarjo No. 22, Surabaya",
      distanceKm: 3.2,
      minWeightKg: 5.0,
      courierName: "Budi Santoso",
      scheduledTime: "Hari ini, 13:00 - 15:00 WIB",
      status: "Dalam Perjalanan",
    },
    {
      id: "disp-2",
      ticketCode: "RB-992103",
      cafeName: "Kopi Kenangan Rungkut",
      address: "Jl. Rungkut Madya No. 8, Surabaya",
      distanceKm: 4.8,
      minWeightKg: 5.0,
      courierName: "Agus Pratama",
      scheduledTime: "Hari ini, 15:30 - 17:00 WIB",
      status: "Terjadwal",
    },
  ]);

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
            Kelola rute armada penjemputan berbasis radius dari Micro-Hub untuk efisiensi BBM dan waktu.
          </p>
        </div>
      </div>

      {/* Grid: Couriers and Active Dispatches */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Active Dispatches (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl border border-[#bbcabf]/30 bg-white p-5 sm:p-6 shadow-2xs">
          <h2 className="text-base font-bold text-[#0b1c30] mb-4 flex items-center gap-2">
            <GoogleIcon name="route" size={20} className="text-[#006c49]" />
            Jadwal Penjemputan Armada Hari Ini
          </h2>

          <div className="space-y-3">
            {dispatches.map((d) => (
              <div key={d.id} className="p-4 rounded-2xl border border-[#bbcabf]/30 bg-[#f8f9ff] flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-[#006c49]">{d.ticketCode}</span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                    {d.status}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm text-[#0b1c30]">{d.cafeName}</div>
                    <div className="text-xs text-[#6c7a71]">{d.address}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-[#006c49]">{d.distanceKm} km</div>
                    <div className="text-[10px] text-[#6c7a71]">Min {d.minWeightKg} kg</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#bbcabf]/20 flex items-center justify-between text-xs text-[#3c4a42]">
                  <span>🛵 Kurir: <strong className="text-[#0b1c30]">{d.courierName}</strong></span>
                  <span>🕒 {d.scheduledTime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Fleet Couriers (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl border border-[#bbcabf]/30 bg-white p-5 sm:p-6 shadow-2xs">
          <h2 className="text-base font-bold text-[#0b1c30] mb-4 flex items-center gap-2">
            <GoogleIcon name="electric_moped" size={20} className="text-[#006c49]" />
            Daftar Armada ReBrew
          </h2>

          <div className="space-y-3">
            {couriers.map((c) => (
              <div key={c.id} className="p-3.5 rounded-2xl border border-[#bbcabf]/30 bg-white flex flex-col gap-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-[#0b1c30]">{c.name}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    {c.status}
                  </span>
                </div>
                <div className="text-[#6c7a71] text-[11px]">{c.vehicle} • {c.plateNumber}</div>
                <div className="text-[11px] text-[#006c49] font-medium">📍 Area: {c.assignedArea}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

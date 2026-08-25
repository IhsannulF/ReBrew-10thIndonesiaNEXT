import React from "react";
import Link from "next/link";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import { DeviceCollectorStatus } from "@/types/dashboard";

interface DeviceCollectorStatusSectionProps {
  deviceStatus: DeviceCollectorStatus;
}

export const DeviceCollectorStatusSection: React.FC<DeviceCollectorStatusSectionProps> = ({
  deviceStatus,
}) => {
  const isOnline = deviceStatus.scaleStatus === "online";
  const isCalibrating = deviceStatus.scaleStatus === "calibrating";
  const hasPickupSchedule = Boolean(
    deviceStatus.nextPickupDate &&
      deviceStatus.nextPickupDate !== "-" &&
      !deviceStatus.nextPickupDate.toLowerCase().includes("belum")
  );

  return (
    <section
      className="flex w-full flex-col rounded-2xl border border-[#bbcabf]/40 bg-gradient-to-br from-[#ffffff] via-[#f8f9ff] to-[#eff4ff]/60 p-6 shadow-xs"
      aria-label="Status perangkat dan penjemputan"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#bbcabf]/20">
        <span className="text-sm font-bold text-[#0b1c30] flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#eff4ff] text-[#006c49] shadow-2xs">
            <GoogleIcon name="router" size={17} />
          </div>
          Status Timbangan & Driver
        </span>

        {/* Dynamic Status Badge */}
        <span
          className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full shadow-2xs ${
            isOnline
              ? "text-[#006c49] bg-[#eff4ff] border border-[#adedd3]"
              : isCalibrating
              ? "text-[#92400e] bg-[#fef3c7] border border-[#fde68a]"
              : "text-[#991b1b] bg-[#fee2e2] border border-[#fecaca]"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              isOnline
                ? "bg-[#10b981] animate-pulse"
                : isCalibrating
                ? "bg-[#f59e0b] animate-spin"
                : "bg-[#ef4444]"
            }`}
          />
          {isOnline ? "Online (Siap)" : isCalibrating ? "Kalibrasi" : "Offline"}
        </span>
      </div>

      {/* Details List */}
      <div className="mt-4 flex flex-col gap-3.5 text-xs sm:text-sm">
        {/* Device Scale Model */}
        <div className="flex flex-col gap-1 pb-3 border-b border-[#bbcabf]/20">
          <span className="text-xs font-semibold text-[#6c7a71] uppercase tracking-wider">
            Perangkat Timbangan
          </span>
          <span className="font-bold text-[#0b1c30] flex items-center gap-1.5">
            <GoogleIcon name="scale" size={16} className="text-[#006c49]" />
            {deviceStatus.scaleModel || "ReBrew Smart Scale v2.4 (BLE/WiFi)"}
          </span>
        </div>

        {/* Scheduled Pickup */}
        <div className="flex flex-col gap-1 pb-3 border-b border-[#bbcabf]/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6c7a71] uppercase tracking-wider">
              Jadwal Penjemputan Armada
            </span>
            {!hasPickupSchedule && (
              <Link
                href="/dashboard/setor"
                className="text-[11px] font-bold text-[#006c49] hover:underline"
              >
                + Request Pickup
              </Link>
            )}
          </div>
          {hasPickupSchedule ? (
            <span className="font-bold text-[#006c49] flex items-center gap-1.5 bg-[#eff4ff] px-2.5 py-1 rounded-lg border border-[#adedd3] w-fit">
              <GoogleIcon name="calendar_month" size={16} />
              {deviceStatus.nextPickupDate} {deviceStatus.nextPickupTime && `(${deviceStatus.nextPickupTime})`}
            </span>
          ) : (
            <span className="text-[#6c7a71] flex items-center gap-1.5">
              <GoogleIcon name="schedule" size={16} className="text-[#6c7a71]" />
              Belum ada jadwal penjemputan aktif
            </span>
          )}
        </div>

        {/* Collector Name */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-[#6c7a71] uppercase tracking-wider">
            Mitra Driver / Drop Point Terdekat
          </span>
          <span className="font-bold text-[#0b1c30] flex items-center gap-1.5">
            <GoogleIcon name="local_shipping" size={16} className="text-[#0284c7]" />
            {deviceStatus.collectorName || "ReBrew Micro-Hub Surabaya Timur"}
          </span>
        </div>
      </div>
    </section>
  );
};

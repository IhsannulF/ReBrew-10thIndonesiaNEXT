import React from "react";
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

  return (
    <section
      className="flex w-full flex-col rounded-2xl border border-[#d8e6d9] bg-gradient-to-br from-[#ffffff] via-[#f9faf8] to-[#f0fdf4]/60 p-6 shadow-xs"
      aria-label="Status perangkat dan penjemputan"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#f0f4f0]">
        <span className="text-sm font-bold text-[#1a2a1b] flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f0fdf4] text-[#2e7d32] shadow-2xs">
            <GoogleIcon name="router" size={17} />
          </div>
          Status Timbangan & Driver
        </span>

        {/* Dynamic Status Badge */}
        <span
          className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full shadow-2xs ${
            isOnline
              ? "text-[#166534] bg-[#dcfce7] border border-[#a7f3d0]"
              : isCalibrating
              ? "text-[#92400e] bg-[#fef3c7] border border-[#fde68a]"
              : "text-[#991b1b] bg-[#fee2e2] border border-[#fecaca]"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              isOnline
                ? "bg-[#22c55e] animate-pulse"
                : isCalibrating
                ? "bg-[#f59e0b] animate-spin"
                : "bg-[#ef4444]"
            }`}
          />
          {isOnline ? "Online (Siap)" : isCalibrating ? "Kalibrasi" : "Offline"}
        </span>
      </div>

      {/* Details List with generous vertical spacing */}
      <div className="mt-4 flex flex-col gap-3.5 text-xs sm:text-sm">
        {/* Device Scale Model */}
        <div className="flex flex-col gap-1 pb-3 border-b border-[#f0f4f0]">
          <span className="text-xs font-semibold text-[#6b7c6f] uppercase tracking-wider">
            Perangkat Timbangan
          </span>
          <span className="font-bold text-[#1a2a1b] flex items-center gap-1.5">
            <GoogleIcon name="scale" size={16} className="text-[#2e7d32]" />
            {deviceStatus.scaleModel}
          </span>
        </div>

        {/* Scheduled Pickup */}
        <div className="flex flex-col gap-1 pb-3 border-b border-[#f0f4f0]">
          <span className="text-xs font-semibold text-[#6b7c6f] uppercase tracking-wider">
            Jadwal Penjemputan Mitra
          </span>
          <span className="font-bold text-[#15803d] flex items-center gap-1.5 bg-[#f0fdf4] px-2.5 py-1 rounded-lg border border-[#bbf7d0] w-fit">
            <GoogleIcon name="calendar_month" size={16} />
            {deviceStatus.nextPickupDate} ({deviceStatus.nextPickupTime})
          </span>
        </div>

        {/* Collector Name */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-[#6b7c6f] uppercase tracking-wider">
            Mitra Kolektor ReBrew
          </span>
          <span className="font-bold text-[#1a2a1b] flex items-center gap-1.5">
            <GoogleIcon name="local_shipping" size={16} className="text-[#0284c7]" />
            {deviceStatus.collectorName}
          </span>
        </div>
      </div>
    </section>
  );
};

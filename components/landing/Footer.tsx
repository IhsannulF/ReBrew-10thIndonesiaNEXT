import React from "react";
import Image from "next/image";
import Link from "next/link";

export const Footer = (): React.JSX.Element => {
  return (
    <footer className="w-full border-t border-white/10 bg-[#1a2a1b] px-4 py-10 text-white sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="ReBrew"
            width={110}
            height={32}
            className="h-8 w-auto object-contain brightness-0 invert opacity-90"
          />
        </div>

        <p className="text-center text-xs text-white/50 sm:text-right">
          © 2026 ReBrew · Pilah Sampah, Ciptakan Dampak. Seluruh hak cipta dilindungi.
        </p>
      </div>
    </footer>
  );
};

import React from "react";
import Link from "next/link";
import { GoogleIcon } from "@/components/ui/GoogleIcon";

export const RegistrationCallToAction = (): React.JSX.Element => {
  return (
    <section
      id="registration"
      className="w-full bg-[#f5f4ef] px-4 py-20 sm:px-8 lg:px-12"
      aria-labelledby="registration-call-to-action-title"
    >
      <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f5e9] px-3.5 py-1 text-xs font-bold text-[#2e7d32]">
          <GoogleIcon name="volunteer_activism" size={16} filled />
          <span>Ayo Mulai Bersama Kami</span>
        </div>

        <h2
          id="registration-call-to-action-title"
          className="mt-4 text-3xl font-extrabold tracking-tight text-[#1a2a1b] sm:text-4xl lg:text-[44px]"
          style={{ fontFamily: "var(--font-fraunces, serif)" }}
        >
          Siap Mulai Pilah Sampah?
        </h2>

        <p className="mt-4 max-w-xl text-base text-[#6b7c6f] sm:text-lg leading-relaxed">
          Bergabung dengan ribuan pengguna yang sudah merasakan manfaat nyata dari
          memilah sampah dan menghasilkan cuan bersama ReBrew.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/daftar"
            className="inline-flex items-center gap-2 rounded-[10px] bg-[#2e7d32] px-8 py-4 text-sm font-bold text-white shadow-md transition-all hover:bg-[#256829] hover:shadow-lg focus-visible:outline-2 focus-visible:outline-[#2e7d32]"
          >
            <span>Daftar Gratis Sekarang</span>
            <GoogleIcon name="arrow_forward" size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
};

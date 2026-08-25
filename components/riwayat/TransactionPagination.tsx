"use client";

import React from "react";
import { GoogleIcon } from "@/components/ui/GoogleIcon";

interface TransactionPaginationProps {
  currentPage: number;
  totalPages: number;
  totalFiltered: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onNextPage: () => void;
  onPrevPage: () => void;
}

export const TransactionPagination: React.FC<TransactionPaginationProps> = ({
  currentPage,
  totalPages,
  totalFiltered,
  itemsPerPage,
  onPageChange,
  onNextPage,
  onPrevPage,
}) => {
  if (totalFiltered === 0 || totalPages <= 1) return null;

  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalFiltered);

  // Generate page numbers
  const pages: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-[#bbcabf]/30 bg-white shadow-2xs w-full mt-2">
      {/* Range Info */}
      <span className="text-xs text-[#3c4a42]">
        Menampilkan <strong className="text-[#0b1c30]">{startIndex} - {endIndex}</strong> dari{" "}
        <strong className="text-[#0b1c30]">{totalFiltered}</strong> riwayat transaksi
      </span>

      {/* Pagination Nav Buttons */}
      <div className="flex items-center gap-1.5">
        {/* Prev Button */}
        <button
          type="button"
          onClick={onPrevPage}
          disabled={currentPage === 1}
          className="flex h-9 items-center gap-1 px-3 rounded-xl border border-[#bbcabf]/40 text-xs font-bold text-[#0b1c30] hover:bg-[#f8f9ff] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Halaman Sebelumnya"
        >
          <GoogleIcon name="chevron_left" size={18} />
          <span className="hidden sm:inline">Sebelumnya</span>
        </button>

        {/* Page Number Chips */}
        <div className="flex items-center gap-1">
          {pages.map((page) => {
            const isActive = page === currentPage;
            return (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-[#006c49] text-white shadow-2xs"
                    : "border border-[#bbcabf]/30 text-[#3c4a42] hover:bg-[#eff4ff] hover:text-[#006c49]"
                }`}
                aria-current={isActive ? "page" : undefined}
                aria-label={`Halaman ${page}`}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={onNextPage}
          disabled={currentPage === totalPages}
          className="flex h-9 items-center gap-1 px-3 rounded-xl border border-[#bbcabf]/40 text-xs font-bold text-[#0b1c30] hover:bg-[#f8f9ff] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Halaman Selanjutnya"
        >
          <span className="hidden sm:inline">Selanjutnya</span>
          <GoogleIcon name="chevron_right" size={18} />
        </button>
      </div>
    </div>
  );
};

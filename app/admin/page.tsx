import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { autoRejectExpiredPickups } from "@/app/actions/transactions";
import { GoogleIcon } from "@/components/ui/GoogleIcon";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 1. Jalankan auto-reject untuk membersihkan penjemputan kedaluwarsa
  await autoRejectExpiredPickups(supabase);

  // 2. Fetch live profiles (Mitra Kafe)
  const { data: dbMitra } = await supabase
    .from("profiles")
    .select("id, full_name, cafe_name, city, total_kg, saldo_poin, role, tier, created_at")
    .neq("role", "admin");

  const mitraList = dbMitra || [];
  const totalMitraCount = mitraList.length;

  // 3. Fetch live transactions
  const { data: dbTransactions } = await supabase
    .from("transactions")
    .select(`
      id,
      user_id,
      drop_point_id,
      method,
      pickup_address,
      total_weight_kg,
      total_points,
      total_co2_kg,
      status,
      scale_model,
      collector_name,
      category,
      notes,
      created_at,
      profiles (
        cafe_name,
        full_name,
        city
      ),
      drop_points (
        name
      )
    `)
    .order("created_at", { ascending: false });

  const transactionList = dbTransactions || [];

  // 4. Fetch live payouts / withdrawal requests
  const { data: dbPayouts } = await supabase
    .from("payouts")
    .select("id, user_id, amount_idr, points_deducted, status, channel_name, created_at")
    .order("created_at", { ascending: false });

  const payoutList = dbPayouts || [];

  // 5. Agregasi Kalkulasi Metrik Platform Real-Time dari Database
  const totalKgAggregated = mitraList.reduce((acc, m) => acc + Number(m.total_kg || 0), 0);
  const totalCo2Prevented = Math.round(totalKgAggregated * 1.2 * 10) / 10;
  
  // Model Arbitrase Unit Economics (Rata-rata jual ke offtaker Rp 5.000 / kg)
  const grossArbitrageRevenue = Math.round(totalKgAggregated * 5000);
  const rebrewGrossMargin = Math.round(grossArbitrageRevenue * 0.65); // 65% margin logistik & ops

  // Antrean status
  const pendingTransactions = transactionList.filter((t) => t.status === "pending");
  const pendingTicketCount = pendingTransactions.length;
  const pendingPayoutCount = payoutList.filter((p) => p.status === "processing" || p.status === "pending").length;

  // 6. Hitung Stok Material di Micro-Hub dari Transaksi Terverifikasi
  let cupPlastikKg = 0;
  let botolPlastikKg = 0;
  let ampasKopiKg = 0;
  let tutupCupKg = 0;

  transactionList
    .filter((t) => t.status === "confirmed")
    .forEach((tx) => {
      const weight = Number(tx.total_weight_kg || 0);
      const cat = (tx.category || "").toLowerCase();

      if (cat.includes("botol")) {
        botolPlastikKg += weight;
      } else if (cat.includes("ampas")) {
        ampasKopiKg += weight;
      } else if (cat.includes("tutup")) {
        tutupCupKg += weight;
      } else {
        cupPlastikKg += weight;
      }
    });

  // Hub Capacity calculation (Kapasitas Micro-Hub 2.000 kg / 2.0 Ton)
  const hubCapacityKg = 2000;
  const currentStockKg = cupPlastikKg + botolPlastikKg + ampasKopiKg + tutupCupKg;
  const hubUsagePercent = Math.min(100, Math.round((currentStockKg / hubCapacityKg) * 100));

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-linear-to-r from-[#0b1c30] via-[#132842] to-[#006c49] text-white p-6 sm:p-7 rounded-3xl shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Operational Command Hub
            </span>
            <span className="text-xs text-slate-300">Jakarta Selatan (Melawai, Jl. Iskandarsyah)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Pusat Kendali Admin ReBrew
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 mt-1">
            Pantau agregasi limbah F&B dari {totalMitraCount} mitra kafe, verifikasi timbangan fisik, atur logistik armada, dan kelola penjualan bulk ke offtaker daur ulang.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap sm:flex-col gap-2 shrink-0">
          <Link
            href="/admin/verifikasi"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#0b1c30] text-xs font-extrabold hover:bg-emerald-50 transition-colors shadow-sm"
          >
            <GoogleIcon name="fact_check" size={17} className="text-[#006c49]" />
            <span>Verifikasi Tiket ({pendingTicketCount})</span>
          </Link>
          <Link
            href="/admin/offtaker"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#006c49] text-white text-xs font-bold hover:bg-[#005237] transition-colors border border-emerald-400/30"
          >
            <GoogleIcon name="local_shipping" size={17} />
            <span>Kirim ke Offtaker</span>
          </Link>
        </div>

        {/* Decorative Background Circles */}
        <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-[#00a86b]/10 blur-2xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 h-48 w-48 rounded-full bg-blue-500/10 blur-xl pointer-events-none" />
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Tonase */}
        <div className="rounded-2xl border border-[#bbcabf]/30 bg-white p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6c7a71]">Total Sampah Terkelola</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eff4ff] text-[#006c49]">
              <GoogleIcon name="inventory_2" size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-[#0b1c30]">
              {(totalKgAggregated / 1000).toFixed(2)}{" "}
              <span className="text-sm font-semibold text-[#6c7a71]">Ton</span>
            </div>
            <div className="text-[11px] text-[#306d58] font-medium mt-0.5">
              ≈ {totalKgAggregated.toLocaleString("id-ID")} kg teragregasi
            </div>
          </div>
        </div>

        {/* Metric 2: Gross Arbitrage Value */}
        <div className="rounded-2xl border border-[#bbcabf]/30 bg-white p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6c7a71]">Nilai Daur Ulang Offtaker</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f0fdf4] text-[#006c49]">
              <GoogleIcon name="payments" size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-[#006c49]">
              Rp {grossArbitrageRevenue.toLocaleString("id-ID")}
            </div>
            <div className="text-[11px] text-[#6c7a71] font-medium mt-0.5">
              Margin ReBrew (65%): Rp {rebrewGrossMargin.toLocaleString("id-ID")}
            </div>
          </div>
        </div>

        {/* Metric 3: Mitra Kafe Aktif */}
        <div className="rounded-2xl border border-[#bbcabf]/30 bg-white p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6c7a71]">Mitra Kafe Terdaftar</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eff6ff] text-[#0369a1]">
              <GoogleIcon name="storefront" size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-[#0b1c30]">
              {totalMitraCount}{" "}
              <span className="text-sm font-semibold text-[#6c7a71]">Kedai</span>
            </div>
            <div className="text-[11px] text-[#0369a1] font-medium mt-0.5">
              Surabaya & Sekitarnya
            </div>
          </div>
        </div>

        {/* Metric 4: CO2 Mencegah */}
        <div className="rounded-2xl border border-[#bbcabf]/30 bg-white p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6c7a71]">Pencegahan Emisi CO₂</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ecfdf5] text-[#059669]">
              <GoogleIcon name="eco" size={18} filled />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-[#059669]">
              {totalCo2Prevented.toLocaleString("id-ID")}{" "}
              <span className="text-sm font-semibold text-[#6c7a71]">kg CO₂e</span>
            </div>
            <div className="text-[11px] text-[#306d58] font-medium mt-0.5">
              Kepatuhan ESG Permen LHK 75/2019
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Verification Queue & Offtaker Shipments */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Live Verification Queue (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="rounded-3xl border border-[#bbcabf]/30 bg-white p-5 sm:p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-[#0b1c30] flex items-center gap-2">
                  <GoogleIcon name="fact_check" size={20} className="text-[#006c49]" />
                  Antrean Verifikasi Penimbangan Aktual
                </h2>
                <p className="text-xs text-[#6c7a71] mt-0.5">
                  Input berat aktual timbangan fisik untuk menerbitkan saldo poin resmi ke kafe mitra.
                </p>
              </div>
              <Link
                href="/admin/verifikasi"
                className="text-xs font-bold text-[#006c49] hover:underline"
              >
                Lihat Semua ({pendingTicketCount})
              </Link>
            </div>

            {/* Queue Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#bbcabf]/30 text-[#6c7a71] font-bold text-[11px] uppercase tracking-wider">
                    <th className="pb-3 pr-4">Kode Tiket</th>
                    <th className="pb-3 pr-4">Mitra Kafe</th>
                    <th className="pb-3 pr-4">Metode</th>
                    <th className="pb-3 pr-4">Est. Berat</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 text-right">Aksi Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#bbcabf]/20">
                  {transactionList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-xs text-[#6c7a71]">
                        Belum ada tiket setoran sampah yang masuk di sistem.
                      </td>
                    </tr>
                  ) : (
                    transactionList.slice(0, 5).map((tx: any) => {
                      const cafeName = tx.profiles?.cafe_name || tx.profiles?.full_name || "Mitra Kafe";
                      const city = tx.profiles?.city || "Surabaya";
                      const isPending = tx.status === "pending";
                      const isConfirmed = tx.status === "confirmed";
                      const isRejected = tx.status === "rejected";

                      return (
                        <tr key={tx.id} className="hover:bg-[#f8f9ff] transition-colors">
                          <td className="py-3.5 pr-4 font-mono font-bold text-[#006c49]">
                            {tx.code || tx.id}
                          </td>
                          <td className="py-3.5 pr-4 font-semibold text-[#0b1c30]">
                            {cafeName}
                            <span className="block text-[10px] text-[#6c7a71] font-normal">{city}</span>
                          </td>
                          <td className="py-3.5 pr-4">
                            <span
                              className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                                tx.method === "dijemput" || tx.type === "dijemput"
                                  ? "bg-[#e0f2fe] text-[#0369a1]"
                                  : "bg-[#eff4ff] text-[#006c49]"
                              }`}
                            >
                              {tx.method === "dijemput" || tx.type === "dijemput"
                                ? "Dijemput Armada"
                                : "Drop Point"}
                            </span>
                          </td>
                          <td className="py-3.5 pr-4 font-bold text-[#0b1c30]">
                            {Number(tx.total_weight_kg || tx.total_weight || 0)} kg
                          </td>
                          <td className="py-3.5 pr-4">
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                isPending
                                  ? "bg-[#fef3c7] text-[#92400e]"
                                  : isConfirmed
                                  ? "bg-[#dcfce7] text-[#15803d]"
                                  : "bg-[#fee2e2] text-[#991b1b]"
                              }`}
                            >
                              {isPending ? "Menunggu Timbang" : isConfirmed ? "Terverifikasi" : "Ditolak"}
                            </span>
                          </td>
                          <td className="py-3.5 text-right">
                            <Link
                              href={`/admin/verifikasi?ticket=${encodeURIComponent(tx.code || tx.id)}`}
                              className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-colors shadow-2xs inline-block ${
                                isPending
                                  ? "bg-[#006c49] text-white hover:bg-[#005237]"
                                  : "border border-[#bbcabf]/40 text-[#3c4a42] hover:bg-[#f8f9ff]"
                              }`}
                            >
                              {isPending ? "Timbang & Setujui" : "Lihat Detail"}
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link
              href="/admin/mitra"
              className="p-4 rounded-2xl bg-white border border-[#bbcabf]/30 hover:border-[#006c49]/40 hover:shadow-xs transition-all flex flex-col items-start gap-2"
            >
              <div className="h-9 w-9 rounded-xl bg-[#eff4ff] text-[#006c49] flex items-center justify-center">
                <GoogleIcon name="storefront" size={20} />
              </div>
              <div>
                <span className="text-xs font-bold text-[#0b1c30] block">Kelola Mitra Kafe</span>
                <span className="text-[11px] text-[#6c7a71]">{totalMitraCount} kafe terdaftar</span>
              </div>
            </Link>

            <Link
              href="/admin/logistik"
              className="p-4 rounded-2xl bg-white border border-[#bbcabf]/30 hover:border-[#006c49]/40 hover:shadow-xs transition-all flex flex-col items-start gap-2"
            >
              <div className="h-9 w-9 rounded-xl bg-[#e0f2fe] text-[#0369a1] flex items-center justify-center">
                <GoogleIcon name="electric_moped" size={20} />
              </div>
              <div>
                <span className="text-xs font-bold text-[#0b1c30] block">Jadwal Armada</span>
                <span className="text-[11px] text-[#6c7a71]">Rute jemput kafe</span>
              </div>
            </Link>

            <Link
              href="/admin/payout"
              className="p-4 rounded-2xl bg-white border border-[#bbcabf]/30 hover:border-[#006c49]/40 hover:shadow-xs transition-all flex flex-col items-start gap-2"
            >
              <div className="h-9 w-9 rounded-xl bg-[#fef3c7] text-[#92400e] flex items-center justify-center">
                <GoogleIcon name="payments" size={20} />
              </div>
              <div>
                <span className="text-xs font-bold text-[#0b1c30] block">Pencairan Saldo</span>
                <span className="text-[11px] text-[#6c7a71]">{pendingPayoutCount} permintaan pending</span>
              </div>
            </Link>

            <Link
              href="/admin/laporan-esg"
              className="p-4 rounded-2xl bg-white border border-[#bbcabf]/30 hover:border-[#006c49]/40 hover:shadow-xs transition-all flex flex-col items-start gap-2"
            >
              <div className="h-9 w-9 rounded-xl bg-[#ecfdf5] text-[#059669] flex items-center justify-center">
                <GoogleIcon name="verified" size={20} />
              </div>
              <div>
                <span className="text-xs font-bold text-[#0b1c30] block">Terbitkan ESG</span>
                <span className="text-[11px] text-[#6c7a71]">Sertifikat Eco-Partner</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Right Column: Offtaker Partners & Micro-Hub Inventory (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Micro-Hub Inventory Stock */}
          <div className="rounded-3xl border border-[#bbcabf]/30 bg-white p-5 shadow-2xs">
            <h3 className="text-sm font-bold text-[#0b1c30] mb-1 flex items-center gap-2">
              <GoogleIcon name="warehouse" size={18} className="text-[#006c49]" />
              Stok Sampah di Micro-Hub Jakarta Selatan (Melawai)
            </h3>
            <p className="text-[11px] text-[#6c7a71] mb-4">
              Akumulasi sebelum pengiriman bulk ke pabrik daur ulang.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-[#3c4a42]">Plastic Cup (PP/PET):</span>
                  <span className="font-bold text-[#0b1c30]">{cupPlastikKg.toFixed(1)} kg</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#f1f5f9] overflow-hidden">
                  <div
                    className="h-full bg-[#006c49] rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.round((cupPlastikKg / 800) * 100))}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-[#3c4a42]">Botol Plastik (PET Bening):</span>
                  <span className="font-bold text-[#0b1c30]">{botolPlastikKg.toFixed(1)} kg</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#f1f5f9] overflow-hidden">
                  <div
                    className="h-full bg-[#0369a1] rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.round((botolPlastikKg / 500) * 100))}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-[#3c4a42]">Ampas Kopi (Spent Grounds):</span>
                  <span className="font-bold text-[#0b1c30]">{ampasKopiKg.toFixed(1)} kg</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#f1f5f9] overflow-hidden">
                  <div
                    className="h-full bg-[#d97706] rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.round((ampasKopiKg / 400) * 100))}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-[#3c4a42]">Tutup Cup & Sedotan (HDPE/PP):</span>
                  <span className="font-bold text-[#0b1c30]">{tutupCupKg.toFixed(1)} kg</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#f1f5f9] overflow-hidden">
                  <div
                    className="h-full bg-[#8b5cf6] rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.round((tutupCupKg / 300) * 100))}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#bbcabf]/20 flex justify-between items-center text-xs font-bold">
              <span className="text-[#6c7a71]">Total Kapasitas Hub:</span>
              <span className="text-[#006c49]">
                {currentStockKg.toFixed(1)} / {hubCapacityKg} kg ({hubUsagePercent}%)
              </span>
            </div>
          </div>

          {/* Offtaker Partner Status */}
          <div className="rounded-3xl border border-[#bbcabf]/30 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#0b1c30] flex items-center gap-2">
                <GoogleIcon name="factory" size={18} className="text-[#006c49]" />
                Offtaker Daur Ulang Aktif
              </h3>
              <Link href="/admin/offtaker" className="text-[11px] font-bold text-[#006c49] hover:underline">
                Kelola
              </Link>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-[#f8f9ff] border border-[#bbcabf]/30 flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#0b1c30]">Recosistem Jawa Timur</div>
                  <div className="text-[11px] text-[#6c7a71]">Kontrak Bulk PET/PP (Rp5.000/kg)</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#dcfce7] text-[#15803d]">
                  Aktif
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#f8f9ff] border border-[#bbcabf]/30 flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#0b1c30]">Paste Lab Upcycling</div>
                  <div className="text-[11px] text-[#6c7a71]">Furniture & Coaster (Rp6.000/kg)</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#dcfce7] text-[#15803d]">
                  Aktif
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#f8f9ff] border border-[#bbcabf]/30 flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#0b1c30]">Bank Sampah Induk Surabaya</div>
                  <div className="text-[11px] text-[#6c7a71]">Kardus, Logam & Organik</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#dcfce7] text-[#15803d]">
                  Aktif
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

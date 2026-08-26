import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { GoogleIcon } from "@/components/ui/GoogleIcon";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 1. Fetch live metrics from Supabase
  const { count: totalMitraCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "mitra");

  const { data: recentTransactions } = await supabase
    .from("transactions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: pendingPayouts } = await supabase
    .from("withdrawal_requests")
    .select("*")
    .eq("status", "pending");

  const { data: offtakerSales } = await supabase
    .from("offtaker_sales")
    .select("*, offtakers(name)")
    .order("created_at", { ascending: false })
    .limit(4);

  // Fallback demo metrics if database is fresh
  const totalKgAggregated = 1420.5; // kg
  const totalCo2Prevented = 1704.6; // kg CO2e
  const grossArbitrageRevenue = 7102500; // Rp
  const rebrewGrossMargin = 4616625; // Rp (65%)
  const pendingTicketCount = recentTransactions?.filter((t: any) => t.status === "pending").length || 3;
  const pendingPayoutCount = pendingPayouts?.length || 2;
  const activeMitra = totalMitraCount || 16;

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-linear-to-r from-[#0b1c30] via-[#132842] to-[#006c49] text-white p-6 sm:p-7 rounded-3xl shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Operational Command Hub
            </span>
            <span className="text-xs text-slate-300">Surabaya Timur (Gn. Anyar Sawah)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Pusat Kendali Admin ReBrew
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 mt-1">
            Pantau agregasi limbah F&B, verifikasi timbangan aktual kafe, atur logistik armada, dan kelola penjualan bulk ke offtaker daur ulang.
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
              Rp {(grossArbitrageRevenue / 1000000).toFixed(2)}M
            </div>
            <div className="text-[11px] text-[#6c7a71] font-medium mt-0.5">
              Margin ReBrew: Rp {(rebrewGrossMargin / 1000000).toFixed(2)}M
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
              {activeMitra}{" "}
              <span className="text-sm font-semibold text-[#6c7a71]">Kedai</span>
            </div>
            <div className="text-[11px] text-[#0369a1] font-medium mt-0.5">
              Jawa Timur & Surabaya
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
                  {/* Mock item 1 */}
                  <tr className="hover:bg-[#f8f9ff] transition-colors">
                    <td className="py-3.5 pr-4 font-mono font-bold text-[#006c49]">RB-892104</td>
                    <td className="py-3.5 pr-4 font-semibold text-[#0b1c30]">
                      Kopi Selamat Cafe
                      <span className="block text-[10px] text-[#6c7a71] font-normal">Gubeng, Surabaya</span>
                    </td>
                    <td className="py-3.5 pr-4">
                      <span className="px-2 py-0.5 rounded-md bg-[#eff4ff] text-[#006c49] font-semibold text-[10px]">
                        Drop Point (Hub)
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 font-bold text-[#0b1c30]">7.5 kg</td>
                    <td className="py-3.5 pr-4">
                      <span className="px-2 py-0.5 rounded-full bg-[#fef3c7] text-[#92400e] font-bold text-[10px]">
                        Menunggu Timbang
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        type="button"
                        className="px-3 py-1.5 rounded-lg bg-[#006c49] text-white font-bold text-[11px] hover:bg-[#005237] transition-colors shadow-2xs"
                      >
                        Timbang & Setujui
                      </button>
                    </td>
                  </tr>

                  {/* Mock item 2 */}
                  <tr className="hover:bg-[#f8f9ff] transition-colors">
                    <td className="py-3.5 pr-4 font-mono font-bold text-[#006c49]">RB-763412</td>
                    <td className="py-3.5 pr-4 font-semibold text-[#0b1c30]">
                      Brew & Co Manyar
                      <span className="block text-[10px] text-[#6c7a71] font-normal">Manyar, Surabaya</span>
                    </td>
                    <td className="py-3.5 pr-4">
                      <span className="px-2 py-0.5 rounded-md bg-[#e0f2fe] text-[#0369a1] font-semibold text-[10px]">
                        Dijemput (3.2 km)
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 font-bold text-[#0b1c30]">5.0 kg</td>
                    <td className="py-3.5 pr-4">
                      <span className="px-2 py-0.5 rounded-full bg-[#dbeafe] text-[#1e40af] font-bold text-[10px]">
                        Armada Menjemput
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        type="button"
                        className="px-3 py-1.5 rounded-lg border border-[#006c49] text-[#006c49] font-bold text-[11px] hover:bg-[#eff4ff] transition-colors"
                      >
                        Detail Armada
                      </button>
                    </td>
                  </tr>

                  {/* Mock item 3 */}
                  <tr className="hover:bg-[#f8f9ff] transition-colors">
                    <td className="py-3.5 pr-4 font-mono font-bold text-[#006c49]">RB-541908</td>
                    <td className="py-3.5 pr-4 font-semibold text-[#0b1c30]">
                      Kedai Kopi Titik Koma
                      <span className="block text-[10px] text-[#6c7a71] font-normal">Rungkut, Surabaya</span>
                    </td>
                    <td className="py-3.5 pr-4">
                      <span className="px-2 py-0.5 rounded-md bg-[#eff4ff] text-[#006c49] font-semibold text-[10px]">
                        Drop Point (Hub)
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 font-bold text-[#0b1c30]">12.0 kg</td>
                    <td className="py-3.5 pr-4">
                      <span className="px-2 py-0.5 rounded-full bg-[#fef3c7] text-[#92400e] font-bold text-[10px]">
                        Menunggu Timbang
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        type="button"
                        className="px-3 py-1.5 rounded-lg bg-[#006c49] text-white font-bold text-[11px] hover:bg-[#005237] transition-colors shadow-2xs"
                      >
                        Timbang & Setujui
                      </button>
                    </td>
                  </tr>
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
                <span className="text-[11px] text-[#6c7a71]">Tier langganan & status</span>
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
                <span className="text-[11px] text-[#6c7a71]">Rute kurir & BBM</span>
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
              Stok Sampah di Micro-Hub Surabaya Timur
            </h3>
            <p className="text-[11px] text-[#6c7a71] mb-4">
              Akumulasi sebelum pengiriman bulk ke pabrik daur ulang.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-[#3c4a42]">Plastic Cup (PP/PET):</span>
                  <span className="font-bold text-[#0b1c30]">680 kg</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#f1f5f9] overflow-hidden">
                  <div className="h-full bg-[#006c49] rounded-full" style={{ width: "68%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-[#3c4a42]">Botol Plastik (PET Bening):</span>
                  <span className="font-bold text-[#0b1c30]">420 kg</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#f1f5f9] overflow-hidden">
                  <div className="h-full bg-[#0369a1] rounded-full" style={{ width: "42%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-[#3c4a42]">Ampas Kopi (Spent Grounds):</span>
                  <span className="font-bold text-[#0b1c30]">210 kg</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#f1f5f9] overflow-hidden">
                  <div className="h-full bg-[#d97706] rounded-full" style={{ width: "21%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-[#3c4a42]">Kardus & Kaleng:</span>
                  <span className="font-bold text-[#0b1c30]">110.5 kg</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#f1f5f9] overflow-hidden">
                  <div className="h-full bg-[#64748b] rounded-full" style={{ width: "11%" }} />
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#bbcabf]/20 flex justify-between items-center text-xs font-bold">
              <span className="text-[#6c7a71]">Total Kapasitas Hub:</span>
              <span className="text-[#006c49]">1.42 / 2.0 Ton (71%)</span>
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

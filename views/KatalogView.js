/**
 * views/KatalogView.js
 * Implementasi KatalogUI: KPI Cards, Pencarian Komoditas, Filter Kategori/Wilayah,
 * serta Tabel Perbandingan Harga Antar Pasar Lokal.
 */

import { KatalogController } from "../controllers/KatalogController.js";
import { MasterDataModel } from "../models/MasterDataModel.js";

function formatRupiah(num) {
  if (num === null || num === undefined || num === 0) return "-";
  return "Rp " + Number(num).toLocaleString("id-ID");
}

export async function renderKatalogView(container) {
  const [kategoriList, wilayahList] = await Promise.all([
    MasterDataModel.getAll("kategori"),
    MasterDataModel.getAll("wilayah")
  ]);

  let state = {
    keyword: "",
    kategoriId: "",
    wilayahId: ""
  };

  container.innerHTML = `
    <div class="space-y-6">
      <!-- Hero Banner -->
      <div class="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 rounded-2xl p-6 sm:p-8 text-white shadow-md">
        <div class="max-w-3xl">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-emerald-50 mb-3">
            <i data-lucide="shield-check" class="w-3.5 h-3.5"></i> Transparansi Harga Pangan Harian
          </span>
          <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Katalog &amp; Perbandingan Harga Komoditas Pasar
          </h1>
          <p class="text-emerald-100 text-sm sm:text-base mt-2">
            Pantau harga resmi bahan pokok antar pasar tradisional secara real-time sebelum berbelanja.
          </p>
        </div>
      </div>

      <!-- KPI Cards -->
      <div id="katalog-kpi" class="grid grid-cols-2 lg:grid-cols-4 gap-4"></div>

      <!-- Filter & Search Bar -->
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-3">
        <div class="md:col-span-5 relative">
          <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3.5 top-3"></i>
          <input
            id="search-komoditas"
            type="text"
            placeholder="Cari nama komoditas (misal: Cabai, Beras, Telur)..."
            class="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          />
        </div>
        <div class="md:col-span-4">
          <select id="filter-kategori" class="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none">
            <option value="">Semua Kategori Pangan</option>
            ${kategoriList.map((k) => `<option value="${k.id}">${k.nama_kategori}</option>`).join("")}
          </select>
        </div>
        <div class="md:col-span-3">
          <select id="filter-wilayah" class="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none">
            <option value="">Semua Wilayah</option>
            ${wilayahList.map((w) => `<option value="${w.id}">${w.nama_wilayah}</option>`).join("")}
          </select>
        </div>
      </div>

      <!-- Tabel Katalog -->
      <div id="katalog-table-wrapper" class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"></div>
    </div>
  `;

  const updateTable = async () => {
    const res = await KatalogController.getKatalogTerkini(state);
    const kpiEl = container.querySelector("#katalog-kpi");
    const tableWrapper = container.querySelector("#katalog-table-wrapper");

    kpiEl.innerHTML = `
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div class="text-xs font-medium text-slate-500">Total Komoditas Dipantau</div>
        <div class="text-2xl font-extrabold text-slate-900 mt-1">${res.kpi.totalKomoditas} <span class="text-xs font-normal text-slate-400">item</span></div>
      </div>
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div class="text-xs font-medium text-slate-500">Pasar Tradisional Aktif</div>
        <div class="text-2xl font-extrabold text-emerald-600 mt-1">${res.kpi.totalPasar} <span class="text-xs font-normal text-slate-400">lokasi</span></div>
      </div>
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div class="text-xs font-medium text-slate-500">Komoditas Mengalami Kenaikan</div>
        <div class="text-2xl font-extrabold text-rose-600 mt-1">${res.kpi.komoditasNaik} <span class="text-xs font-normal text-slate-400">komoditas</span></div>
      </div>
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div class="text-xs font-medium text-slate-500">Pembaruan Data Terakhir</div>
        <div class="text-lg font-bold text-slate-800 mt-1.5">${res.kpi.lastUpdate}</div>
      </div>
    `;

    // Skenario Alternatif 5A: Komoditas tidak ditemukan
    if (!res.success) {
      tableWrapper.innerHTML = `
        <div class="p-12 text-center">
          <div class="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3">
            <i data-lucide="search-x" class="w-6 h-6"></i>
          </div>
          <h3 class="text-base font-bold text-slate-800">${res.message}</h3>
          <p class="text-sm text-slate-500 mt-1">Coba gunakan kata kunci lain atau atur ulang filter kategori dan wilayah.</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    tableWrapper.innerHTML = `
      <div class="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <span class="font-semibold text-slate-700">Matriks Perbandingan Harga Antar Pasar (${res.items.length} komoditas)</span>
        <div class="flex items-center gap-4">
          <span class="inline-flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Harga Termurah</span>
          <span class="inline-flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Harga Tertinggi</span>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left border-collapse">
          <thead>
            <tr class="bg-slate-50/80 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
              <th class="py-3.5 px-4 font-bold">Komoditas</th>
              ${res.markets
                .map(
                  (m) => `
                  <th class="py-3.5 px-4 font-bold text-right">
                    <div>${m.nama_pasar}</div>
                    <div class="text-[10px] font-normal normal-case text-slate-400">${m.nama_wilayah}</div>
                  </th>
                `
                )
                .join("")}
              <th class="py-3.5 px-4 font-bold text-right bg-slate-100/70">Rata-rata</th>
              <th class="py-3.5 px-4 font-bold text-center">Tren</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${res.items
              .map((item) => {
                const trendBadge =
                  item.diff > 0
                    ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700">+${item.pctChange}%</span>`
                    : item.diff < 0
                    ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">${item.pctChange}%</span>`
                    : `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">Stabil</span>`;

                return `
                  <tr class="hover:bg-slate-50/90 transition">
                    <td class="py-3.5 px-4">
                      <div class="font-bold text-slate-900">${item.nama_komoditas}</div>
                      <div class="text-xs text-slate-500">${item.nama_kategori} &bull; per ${item.nama_satuan}</div>
                    </td>
                    ${res.markets
                      .map((m) => {
                        const rec = item.pricesByMarket[m.id];
                        if (!rec) {
                          return `<td class="py-3.5 px-4 text-right text-slate-400">-</td>`;
                        }
                        const val = Number(rec.harga_sekarang);
                        const isMin = item.minEntry && val === item.minEntry.harga && item.minEntry.harga !== item.maxEntry?.harga;
                        const isMax = item.maxEntry && val === item.maxEntry.harga && item.minEntry?.harga !== item.maxEntry.harga;

                        const cellClass = isMin
                          ? "text-emerald-700 font-extrabold bg-emerald-50/50"
                          : isMax
                          ? "text-rose-700 font-bold bg-rose-50/40"
                          : "text-slate-700 font-medium";

                        return `
                          <td class="py-3.5 px-4 text-right ${cellClass}">
                            <div>${formatRupiah(val)}</div>
                            <div class="text-[10px] font-normal text-slate-400">${rec.tanggal_catat}</div>
                          </td>
                        `;
                      })
                      .join("")}
                    <td class="py-3.5 px-4 text-right font-extrabold text-slate-900 bg-slate-50/70">
                      ${formatRupiah(item.avgPrice)}
                    </td>
                    <td class="py-3.5 px-4 text-center">
                      ${trendBadge}
                    </td>
                  </tr>
                `;
              })
              .join("")}
          </tbody>
        </table>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  };

  container.querySelector("#search-komoditas").addEventListener("input", (e) => {
    state.keyword = e.target.value;
    updateTable();
  });

  container.querySelector("#filter-kategori").addEventListener("change", (e) => {
    state.kategoriId = e.target.value;
    updateTable();
  });

  container.querySelector("#filter-wilayah").addEventListener("change", (e) => {
    state.wilayahId = e.target.value;
    updateTable();
  });

  await updateTable();
}

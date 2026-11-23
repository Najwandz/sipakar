/**
 * views/RekapLogView.js
 * Halaman Admin untuk Rekap Harga Pasaran (Ekspor CSV & Cetak Laporan) serta Log Aktivitas Sistem.
 */

import { KatalogController } from "../controllers/KatalogController.js";
import { LogModel } from "../models/LogModel.js";

export async function renderRekapView(container, { showToast }) {
  const res = await KatalogController.getKatalogTerkini();

  container.innerHTML = `
    <div class="space-y-6">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900">Rekapitulasi Harga Pasaran</h1>
          <p class="text-sm text-slate-500 mt-1">Ringkasan harga terendah, tertinggi, dan rata-rata lintas pasar untuk pelaporan administratif.</p>
        </div>
        <div class="flex items-center gap-2 no-print">
          <button id="btn-export-csv" type="button" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition">
            <i data-lucide="download" class="w-4 h-4"></i>
            <span>Ekspor CSV</span>
          </button>
          <button id="btn-print-rekap" type="button" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold shadow-sm transition">
            <i data-lucide="printer" class="w-4 h-4"></i>
            <span>Cetak Laporan</span>
          </button>
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead class="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th class="py-3.5 px-4">No</th>
                <th class="py-3.5 px-4">Komoditas</th>
                <th class="py-3.5 px-4">Kategori</th>
                <th class="py-3.5 px-4 text-right">Harga Terendah</th>
                <th class="py-3.5 px-4 text-right">Harga Tertinggi</th>
                <th class="py-3.5 px-4 text-right">Rata-rata</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${res.items
                .map(
                  (item, idx) => `
                  <tr>
                    <td class="py-3 px-4 text-slate-500">${idx + 1}</td>
                    <td class="py-3 px-4 font-bold text-slate-900">${item.nama_komoditas} (${item.nama_satuan})</td>
                    <td class="py-3 px-4 text-xs text-slate-600">${item.nama_kategori}</td>
                    <td class="py-3 px-4 text-right text-emerald-700 font-semibold">
                      ${item.minEntry ? `Rp ${item.minEntry.harga.toLocaleString("id-ID")} <span class="block text-[10px] text-slate-400">${item.minEntry.pasar}</span>` : "-"}
                    </td>
                    <td class="py-3 px-4 text-right text-rose-700 font-semibold">
                      ${item.maxEntry ? `Rp ${item.maxEntry.harga.toLocaleString("id-ID")} <span class="block text-[10px] text-slate-400">${item.maxEntry.pasar}</span>` : "-"}
                    </td>
                    <td class="py-3 px-4 text-right font-extrabold text-slate-900">
                      Rp ${item.avgPrice.toLocaleString("id-ID")}
                    </td>
                  </tr>
                `
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  container.querySelector("#btn-print-rekap").addEventListener("click", () => {
    window.print();
  });

  container.querySelector("#btn-export-csv").addEventListener("click", () => {
    const headers = ["No", "Komoditas", "Satuan", "Kategori", "Harga Terendah", "Pasar Termurah", "Harga Tertinggi", "Pasar Termahal", "Rata-Rata"];
    const csvRows = [
      headers.join(","),
      ...res.items.map((item, i) =>
        [
          i + 1,
          `"${item.nama_komoditas}"`,
          `"${item.nama_satuan}"`,
          `"${item.nama_kategori}"`,
          item.minEntry?.harga || 0,
          `"${item.minEntry?.pasar || "-"}"`,
          item.maxEntry?.harga || 0,
          `"${item.maxEntry?.pasar || "-"}"`,
          item.avgPrice
        ].join(",")
      )
    ];

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Rekap_Harga_SIPAKAR_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    if (showToast) showToast("File CSV rekap harga berhasil diunduh!", "success");
  });

  if (window.lucide) window.lucide.createIcons();
}

export async function renderLogView(container) {
  const logs = await LogModel.getAll();

  container.innerHTML = `
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900">Log Aktivitas &amp; Audit Sistem</h1>
        <p class="text-sm text-slate-500 mt-1">Rekam jejak autentikasi pengguna, pembaruan harga harian, dan perubahan data master.</p>
      </div>

      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead class="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th class="py-3.5 px-4">Waktu</th>
                <th class="py-3.5 px-4">Aktor</th>
                <th class="py-3.5 px-4">Peran</th>
                <th class="py-3.5 px-4">Aktivitas</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${logs
                .map(
                  (log) => `
                  <tr class="hover:bg-slate-50">
                    <td class="py-3 px-4 text-xs text-slate-500 whitespace-nowrap">${log.waktu_log}</td>
                    <td class="py-3 px-4 font-semibold text-slate-800">${log.aktor}</td>
                    <td class="py-3 px-4">
                      <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">${log.role}</span>
                    </td>
                    <td class="py-3 px-4 text-slate-700">${log.deskripsi}</td>
                  </tr>
                `
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

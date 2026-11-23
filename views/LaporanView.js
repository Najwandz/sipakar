/**
 * views/LaporanView.js
 * Implementasi LaporanUI: Grafik Tren Fluktuasi Harga (Chart.js) & Filter Rentang Tanggal.
 */

import { LaporanController } from "../controllers/LaporanController.js";
import { MasterDataModel } from "../models/MasterDataModel.js";

let chartInstance = null;

function getDefaultDateRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 6);
  return {
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0]
  };
}

export async function renderLaporanView(container) {
  const komoditasList = await MasterDataModel.getAll("komoditas");
  const defaults = getDefaultDateRange();

  let state = {
    komoditasId: komoditasList[0]?.id || "",
    startDate: defaults.startDate,
    endDate: defaults.endDate
  };

  container.innerHTML = `
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900">Laporan Fluktuasi Harga Komoditas</h1>
        <p class="text-sm text-slate-500 mt-1">Analisis pergerakan harga harian lintas pasar berdasarkan rentang tanggal.</p>
      </div>

      <!-- Filter Controls -->
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        <div class="md:col-span-5">
          <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Pilih Komoditas</label>
          <select id="lap-komoditas" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none">
            ${komoditasList.map((k) => `<option value="${k.id}">${k.nama_komoditas}</option>`).join("")}
          </select>
        </div>
        <div class="md:col-span-3">
          <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Dari Tanggal</label>
          <input id="lap-start" type="date" value="${state.startDate}" class="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
        </div>
        <div class="md:col-span-3">
          <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Sampai Tanggal</label>
          <input id="lap-end" type="date" value="${state.endDate}" class="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
        </div>
        <div class="md:col-span-1">
          <button id="lap-reset" type="button" title="Reset Filter" class="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition flex items-center justify-center">
            <i data-lucide="rotate-ccw" class="w-4 h-4"></i>
          </button>
        </div>
      </div>

      <!-- Chart & Result Container -->
      <div id="laporan-body" class="space-y-6"></div>
    </div>
  `;

  const updateReport = async () => {
    const res = await LaporanController.getLaporanFluktuasi(state);
    const bodyEl = container.querySelector("#laporan-body");

    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }

    // Skenario Alternatif 4A: Data pada rentang tanggal kosong
    if (!res.success) {
      bodyEl.innerHTML = `
        <div class="bg-white rounded-2xl border border-amber-200 p-12 text-center shadow-sm">
          <div class="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3">
            <i data-lucide="calendar-x" class="w-6 h-6"></i>
          </div>
          <h3 class="text-base font-bold text-slate-800">${res.message}</h3>
          <p class="text-sm text-slate-500 mt-1">Silakan ubah filter rentang tanggal untuk melihat riwayat fluktuasi harga.</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    bodyEl.innerHTML = `
      <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div class="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h2 class="text-lg font-bold text-slate-900">Grafik Tren: ${res.komoditas.nama_komoditas}</h2>
            <p class="text-xs text-slate-500">Satuan: per ${res.komoditas.nama_satuan} &bull; Periode ${state.startDate} s.d. ${state.endDate}</p>
          </div>
        </div>
        <div class="relative h-80 w-full">
          <canvas id="fluktuasi-chart"></canvas>
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="px-5 py-3.5 bg-slate-50 border-b border-slate-200 font-bold text-sm text-slate-700">
          Rincian Data Historis (${res.tableRows.length} catatan)
        </div>
        <div class="overflow-x-auto max-h-80">
          <table class="w-full text-sm text-left">
            <thead class="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th class="py-3 px-4">Tanggal</th>
                <th class="py-3 px-4">Pasar</th>
                <th class="py-3 px-4 text-right">Harga Tercatat</th>
                <th class="py-3 px-4">Petugas Pencatat</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${res.tableRows
                .map(
                  (row) => `
                  <tr class="hover:bg-slate-50">
                    <td class="py-2.5 px-4 font-medium text-slate-700">${row.tanggal_catat}</td>
                    <td class="py-2.5 px-4 text-slate-600">${row.nama_pasar}</td>
                    <td class="py-2.5 px-4 text-right font-bold text-emerald-700">Rp ${Number(row.harga_sekarang).toLocaleString("id-ID")}</td>
                    <td class="py-2.5 px-4 text-xs text-slate-500">${row.petugas || "-"}</td>
                  </tr>
                `
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;

    const ctx = bodyEl.querySelector("#fluktuasi-chart").getContext("2d");
    chartInstance = new window.Chart(ctx, {
      type: "line",
      data: {
        labels: res.labels,
        datasets: res.datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index",
          intersect: false
        },
        plugins: {
          legend: {
            position: "top"
          },
          tooltip: {
            callbacks: {
              label: (context) =>
                `${context.dataset.label}: Rp ${Number(context.parsed.y).toLocaleString("id-ID")}`
            }
          }
        },
        scales: {
          y: {
            ticks: {
              callback: (value) => "Rp " + Number(value).toLocaleString("id-ID")
            }
          }
        }
      }
    });

    if (window.lucide) window.lucide.createIcons();
  };

  container.querySelector("#lap-komoditas").addEventListener("change", (e) => {
    state.komoditasId = e.target.value;
    updateReport();
  });

  container.querySelector("#lap-start").addEventListener("change", (e) => {
    state.startDate = e.target.value;
    updateReport();
  });

  container.querySelector("#lap-end").addEventListener("change", (e) => {
    state.endDate = e.target.value;
    updateReport();
  });

  container.querySelector("#lap-reset").addEventListener("click", () => {
    const resetDates = getDefaultDateRange();
    state.startDate = resetDates.startDate;
    state.endDate = resetDates.endDate;
    container.querySelector("#lap-start").value = state.startDate;
    container.querySelector("#lap-end").value = state.endDate;
    updateReport();
  });

  await updateReport();
}

/**
 * views/FormInputView.js
 * Implementasi FormInputUI untuk Petugas Lapangan (Input Harga Komoditas & Melihat Riwayat Harga).
 */

import { HargaController } from "../controllers/HargaController.js";
import { MasterDataModel } from "../models/MasterDataModel.js";

export async function renderFormInputView(container, { showToast }) {
  const [komoditasList, pasarList] = await Promise.all([
    MasterDataModel.getAll("komoditas"),
    MasterDataModel.getAll("pasar")
  ]);

  const today = new Date().toISOString().split("T")[0];

  container.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Form Input Harga -->
      <div class="lg:col-span-5">
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div class="flex items-center gap-2.5 mb-4">
            <div class="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <i data-lucide="edit-3" class="w-5 h-5"></i>
            </div>
            <div>
              <h2 class="text-lg font-extrabold text-slate-900">Input Harga Harian</h2>
              <p class="text-xs text-slate-500">Otomatis memvalidasi kewajaran &amp; mencatat waktu input</p>
            </div>
          </div>

          <form id="form-input-harga" class="space-y-4">
            <div id="input-feedback" class="hidden p-3 rounded-xl text-sm font-medium"></div>

            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Pasar Tradisional</label>
              <select id="inp-pasar" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none" required>
                <option value="">-- Pilih Lokasi Pasar --</option>
                ${pasarList.map((p) => `<option value="${p.id}">${p.nama_pasar}</option>`).join("")}
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Komoditas Pangan</label>
              <select id="inp-komoditas" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none" required>
                <option value="">-- Pilih Komoditas --</option>
                ${komoditasList.map((k) => `<option value="${k.id}">${k.nama_komoditas}</option>`).join("")}
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Harga Sekarang (Rupiah)</label>
              <input
                id="inp-harga"
                type="number"
                placeholder="Contoh: 15000"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
              <p class="text-[11px] text-slate-400 mt-1">Batas validasi kewajaran sistem: Rp 500 – Rp 500.000</p>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Tanggal Pencatatan</label>
              <input
                id="inp-tanggal"
                type="date"
                value="${today}"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
            </div>

            <button
              type="submit"
              class="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm transition flex items-center justify-center gap-2"
            >
              <i data-lucide="save" class="w-4 h-4"></i>
              <span>Simpan &amp; Publikasikan Harga</span>
            </button>
          </form>
        </div>
      </div>

      <!-- Tabel Riwayat Harga -->
      <div class="lg:col-span-7">
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <h3 class="font-bold text-slate-800 text-base">Riwayat Pencatatan Harga</h3>
            <select id="filter-riwayat-pasar" class="px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white">
              <option value="">Semua Pasar</option>
              ${pasarList.map((p) => `<option value="${p.id}">${p.nama_pasar}</option>`).join("")}
            </select>
          </div>
          <div id="riwayat-table-body" class="overflow-x-auto max-h-[520px]"></div>
        </div>
      </div>
    </div>
  `;

  const renderHistory = async (pasarId = "") => {
    const rows = await HargaController.getRiwayatHarga({ pasarId });
    const target = container.querySelector("#riwayat-table-body");

    target.innerHTML = `
      <table class="w-full text-sm text-left">
        <thead class="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200 sticky top-0">
          <tr>
            <th class="py-3 px-4">Komoditas</th>
            <th class="py-3 px-4">Pasar</th>
            <th class="py-3 px-4 text-right">Harga</th>
            <th class="py-3 px-4">Waktu Input</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          ${rows
            .slice(0, 50)
            .map(
              (r) => `
              <tr class="hover:bg-slate-50">
                <td class="py-2.5 px-4 font-semibold text-slate-800">${r.nama_komoditas}</td>
                <td class="py-2.5 px-4 text-slate-600 text-xs">${r.nama_pasar}</td>
                <td class="py-2.5 px-4 text-right font-bold text-emerald-700">Rp ${Number(r.harga_sekarang).toLocaleString("id-ID")}</td>
                <td class="py-2.5 px-4 text-xs text-slate-500">
                  <div>${r.tanggal_catat}</div>
                  <div class="text-[10px] text-slate-400">${r.petugas || "-"}</div>
                </td>
              </tr>
            `
            )
            .join("")}
        </tbody>
      </table>
    `;
  };

  container.querySelector("#form-input-harga").addEventListener("submit", async (e) => {
    e.preventDefault();
    const feedback = container.querySelector("#input-feedback");

    const res = await HargaController.inputHargaKomoditas({
      id_pasar: container.querySelector("#inp-pasar").value,
      id_komoditas: container.querySelector("#inp-komoditas").value,
      harga_sekarang: container.querySelector("#inp-harga").value,
      tanggal_catat: container.querySelector("#inp-tanggal").value
    });

    if (!res.success) {
      feedback.className = "p-3 rounded-xl text-sm font-medium bg-rose-50 border border-rose-200 text-rose-700";
      feedback.textContent = res.message;
      feedback.classList.remove("hidden");
      return;
    }

    feedback.className = "p-3 rounded-xl text-sm font-medium bg-emerald-50 border border-emerald-200 text-emerald-700";
    feedback.textContent = res.message;
    feedback.classList.remove("hidden");
    container.querySelector("#inp-harga").value = "";

    if (showToast) showToast(res.message, "success");
    await renderHistory(container.querySelector("#filter-riwayat-pasar").value);
  });

  container.querySelector("#filter-riwayat-pasar").addEventListener("change", (e) => {
    renderHistory(e.target.value);
  });

  await renderHistory();
  if (window.lucide) window.lucide.createIcons();
}

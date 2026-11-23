/**
 * views/KelolaDataView.js
 * Implementasi KelolaDataUI untuk Admin: CRUD Komoditas, Pasar, Wilayah, Kategori, Satuan.
 */

import { DataController } from "../controllers/DataController.js";

const TABS = [
  { id: "komoditas", label: "Data Komoditas" },
  { id: "pasar", label: "Data Pasar" },
  { id: "wilayah", label: "Data Wilayah" },
  { id: "kategori", label: "Data Kategori" },
  { id: "satuan", label: "Data Satuan" }
];

export async function renderKelolaDataView(container, { showToast }) {
  let activeTab = "komoditas";
  let editingItem = null;

  const render = async () => {
    const master = await DataController.getAllMasterData();
    const wilMap = Object.fromEntries(master.wilayah.map((w) => [w.id, w.nama_wilayah]));
    const katMap = Object.fromEntries(master.kategori.map((k) => [k.id, k.nama_kategori]));
    const satMap = Object.fromEntries(master.satuan.map((s) => [s.id, s.nama_satuan]));

    container.innerHTML = `
      <div class="space-y-6">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900">Kelola Data Master Sistem</h1>
          <p class="text-sm text-slate-500 mt-1">Manajemen entitas referensi komoditas, pasar tradisional, wilayah, kategori, dan satuan.</p>
        </div>

        <!-- Tabs -->
        <div class="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          ${TABS.map(
            (t) => `
            <button
              type="button"
              data-tab="${t.id}"
              class="tab-btn px-4 py-2 rounded-xl text-sm font-semibold transition ${
                activeTab === t.id
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }"
            >
              ${t.label}
            </button>
          `
          ).join("")}
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <!-- Form Tambah / Edit -->
          <div class="lg:col-span-4">
            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <h3 class="font-bold text-slate-900 mb-3">
                ${editingItem ? "Edit Data" : "Tambah Data Baru"} (${TABS.find((t) => t.id === activeTab).label})
              </h3>
              <form id="master-form" class="space-y-3.5">
                ${buildFormFields(activeTab, editingItem, master)}
                <div class="flex gap-2 pt-2">
                  <button type="submit" class="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition">
                    ${editingItem ? "Simpan Perubahan" : "Tambah Data"}
                  </button>
                  ${
                    editingItem
                      ? `<button id="btn-cancel-edit" type="button" class="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold">Batal</button>`
                      : ""
                  }
                </div>
              </form>
            </div>
          </div>

          <!-- Tabel Data -->
          <div class="lg:col-span-8">
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              ${buildEntityTable(activeTab, master, { wilMap, katMap, satMap })}
            </div>
          </div>
        </div>
      </div>
    `;

    container.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeTab = btn.dataset.tab;
        editingItem = null;
        render();
      });
    });

    const cancelBtn = container.querySelector("#btn-cancel-edit");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        editingItem = null;
        render();
      });
    }

    container.querySelector("#master-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const payload = extractFormPayload(activeTab, e.target);
      const res = await DataController.saveMasterItem(activeTab, editingItem?.id || null, payload);

      if (!res.success) {
        if (showToast) showToast(res.message, "error");
        return;
      }

      if (showToast) showToast(res.message, "success");
      editingItem = null;
      await render();
    });

    container.querySelectorAll(".btn-edit-row").forEach((btn) => {
      btn.addEventListener("click", () => {
        const list = master[activeTab];
        editingItem = list.find((item) => String(item.id) === String(btn.dataset.id)) || null;
        render();
      });
    });

    container.querySelectorAll(".btn-del-row").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!confirm("Yakin ingin menghapus data ini?")) return;
        const res = await DataController.deleteMasterItem(activeTab, btn.dataset.id);
        if (res.success && showToast) showToast(res.message, "success");
        await render();
      });
    });

    if (window.lucide) window.lucide.createIcons();
  };

  await render();
}

function buildFormFields(entity, item, master) {
  if (entity === "wilayah") {
    return `
      <div>
        <label class="block text-xs font-bold text-slate-600 mb-1">Kode Wilayah</label>
        <input name="kode_wilayah" value="${item?.kode_wilayah || ""}" placeholder="Contoh: TSK-KOTA" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" required />
      </div>
      <div>
        <label class="block text-xs font-bold text-slate-600 mb-1">Nama Wilayah</label>
        <input name="nama_wilayah" value="${item?.nama_wilayah || ""}" placeholder="Contoh: Kota Tasikmalaya" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" required />
      </div>
    `;
  }

  if (entity === "pasar") {
    return `
      <div>
        <label class="block text-xs font-bold text-slate-600 mb-1">Nama Pasar</label>
        <input name="nama_pasar" value="${item?.nama_pasar || ""}" placeholder="Contoh: Pasar Cikurubuk" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" required />
      </div>
      <div>
        <label class="block text-xs font-bold text-slate-600 mb-1">Wilayah</label>
        <select name="id_wilayah" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white" required>
          <option value="">-- Pilih Wilayah --</option>
          ${master.wilayah
            .map((w) => `<option value="${w.id}" ${item?.id_wilayah === w.id ? "selected" : ""}>${w.nama_wilayah}</option>`)
            .join("")}
        </select>
      </div>
      <div>
        <label class="block text-xs font-bold text-slate-600 mb-1">Alamat / Lokasi</label>
        <input name="lokasi" value="${item?.lokasi || ""}" placeholder="Alamat pasar" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" required />
      </div>
    `;
  }

  if (entity === "kategori") {
    return `
      <div>
        <label class="block text-xs font-bold text-slate-600 mb-1">Nama Kategori</label>
        <input name="nama_kategori" value="${item?.nama_kategori || ""}" placeholder="Contoh: Bumbu Dapur" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" required />
      </div>
    `;
  }

  if (entity === "satuan") {
    return `
      <div>
        <label class="block text-xs font-bold text-slate-600 mb-1">Nama Satuan</label>
        <input name="nama_satuan" value="${item?.nama_satuan || ""}" placeholder="Contoh: Kg / Liter" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" required />
      </div>
    `;
  }

  return `
    <div>
      <label class="block text-xs font-bold text-slate-600 mb-1">Nama Komoditas</label>
      <input name="nama_komoditas" value="${item?.nama_komoditas || ""}" placeholder="Contoh: Cabai Rawit Merah" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" required />
    </div>
    <div>
      <label class="block text-xs font-bold text-slate-600 mb-1">Kategori</label>
      <select name="id_kategori" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white" required>
        <option value="">-- Pilih Kategori --</option>
        ${master.kategori
          .map((k) => `<option value="${k.id}" ${item?.id_kategori === k.id ? "selected" : ""}>${k.nama_kategori}</option>`)
          .join("")}
      </select>
    </div>
    <div>
      <label class="block text-xs font-bold text-slate-600 mb-1">Satuan</label>
      <select name="id_satuan" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white" required>
        <option value="">-- Pilih Satuan --</option>
        ${master.satuan
          .map((s) => `<option value="${s.id}" ${item?.id_satuan === s.id ? "selected" : ""}>${s.nama_satuan}</option>`)
          .join("")}
      </select>
    </div>
  `;
}

function extractFormPayload(entity, form) {
  const fd = new FormData(form);
  return Object.fromEntries(fd.entries());
}

function buildEntityTable(entity, master, { wilMap, katMap, satMap }) {
  const rows = master[entity] || [];

  const actionBtns = (id) => `
    <td class="py-3 px-4 text-right whitespace-nowrap">
      <button type="button" data-id="${id}" class="btn-edit-row px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 text-xs font-semibold mr-1">Edit</button>
      <button type="button" data-id="${id}" class="btn-del-row px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold">Hapus</button>
    </td>
  `;

  if (entity === "wilayah") {
    return `
      <table class="w-full text-sm text-left">
        <thead class="bg-slate-50 text-xs uppercase text-slate-500 border-b">
          <tr><th class="py-3 px-4">Kode</th><th class="py-3 px-4">Nama Wilayah</th><th class="py-3 px-4 text-right">Aksi</th></tr>
        </thead>
        <tbody class="divide-y">
          ${rows.map((r) => `<tr><td class="py-3 px-4 font-mono text-xs">${r.kode_wilayah}</td><td class="py-3 px-4 font-semibold">${r.nama_wilayah}</td>${actionBtns(r.id)}</tr>`).join("")}
        </tbody>
      </table>
    `;
  }

  if (entity === "pasar") {
    return `
      <table class="w-full text-sm text-left">
        <thead class="bg-slate-50 text-xs uppercase text-slate-500 border-b">
          <tr><th class="py-3 px-4">Nama Pasar</th><th class="py-3 px-4">Wilayah</th><th class="py-3 px-4">Lokasi</th><th class="py-3 px-4 text-right">Aksi</th></tr>
        </thead>
        <tbody class="divide-y">
          ${rows.map((r) => `<tr><td class="py-3 px-4 font-semibold">${r.nama_pasar}</td><td class="py-3 px-4 text-xs">${wilMap[r.id_wilayah] || "-"}</td><td class="py-3 px-4 text-xs text-slate-500">${r.lokasi}</td>${actionBtns(r.id)}</tr>`).join("")}
        </tbody>
      </table>
    `;
  }

  if (entity === "kategori" || entity === "satuan") {
    const field = entity === "kategori" ? "nama_kategori" : "nama_satuan";
    return `
      <table class="w-full text-sm text-left">
        <thead class="bg-slate-50 text-xs uppercase text-slate-500 border-b">
          <tr><th class="py-3 px-4">Nama ${entity}</th><th class="py-3 px-4 text-right">Aksi</th></tr>
        </thead>
        <tbody class="divide-y">
          ${rows.map((r) => `<tr><td class="py-3 px-4 font-semibold">${r[field]}</td>${actionBtns(r.id)}</tr>`).join("")}
        </tbody>
      </table>
    `;
  }

  return `
    <table class="w-full text-sm text-left">
      <thead class="bg-slate-50 text-xs uppercase text-slate-500 border-b">
        <tr><th class="py-3 px-4">Komoditas</th><th class="py-3 px-4">Kategori</th><th class="py-3 px-4">Satuan</th><th class="py-3 px-4 text-right">Aksi</th></tr>
      </thead>
      <tbody class="divide-y">
        ${rows.map((r) => `<tr><td class="py-3 px-4 font-semibold">${r.nama_komoditas}</td><td class="py-3 px-4 text-xs">${katMap[r.id_kategori] || "-"}</td><td class="py-3 px-4 text-xs">${satMap[r.id_satuan] || "-"}</td>${actionBtns(r.id)}</tr>`).join("")}
      </tbody>
    </table>
  `;
}

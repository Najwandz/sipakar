/**
 * models/HargaModel.js
 * Implementasi Class Diagram: Riwayat harga (HargaDB).
 */

import { db } from "../config/firebase.js";

export const HargaModel = {
  async getAll() {
    const rows = await db.getAll("riwayat_harga");
    return rows.sort((a, b) => {
      if (b.tanggal_catat !== a.tanggal_catat) {
        return b.tanggal_catat.localeCompare(a.tanggal_catat);
      }
      return String(b.id).localeCompare(String(a.id));
    });
  },

  async simpanData({ id_komoditas, id_pasar, harga_sekarang, tanggal_catat, waktu_input, petugas }) {
    return await db.insert("riwayat_harga", {
      id_komoditas,
      id_pasar,
      harga_sekarang: Number(harga_sekarang),
      tanggal_catat,
      waktu_input,
      petugas
    });
  }
};

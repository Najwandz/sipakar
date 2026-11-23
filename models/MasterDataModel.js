/**
 * models/MasterDataModel.js
 * Implementasi Class Diagram: Wilayah, Pasar, Kategori, Satuan, Komoditas (MasterDataDB).
 */

import { db } from "../config/firebase.js";

const VALID_ENTITIES = ["wilayah", "pasar", "kategori", "satuan", "komoditas"];

export const MasterDataModel = {
  async getAll(entity) {
    if (!VALID_ENTITIES.includes(entity)) {
      throw new Error(`Entitas tidak dikenal: ${entity}`);
    }
    return await db.getAll(entity);
  },

  async getById(entity, id) {
    return await db.getById(entity, id);
  },

  async tambah(entity, payload) {
    return await db.insert(entity, payload);
  },

  async edit(entity, id, payload) {
    return await db.update(entity, id, payload);
  },

  async hapus(entity, id) {
    return await db.remove(entity, id);
  },

  async cariKomoditas(keyword) {
    const all = await db.getAll("komoditas");
    const q = String(keyword || "").trim().toLowerCase();
    if (!q) return all;
    return all.filter((k) => k.nama_komoditas.toLowerCase().includes(q));
  }
};

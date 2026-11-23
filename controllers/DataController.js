/**
 * controllers/DataController.js
 * Sesuai Sequence Diagram Use Case 3 & 3A: Kelola Data Master (Validasi kelengkapan & duplikasi).
 */

import { MasterDataModel } from "../models/MasterDataModel.js";
import { LogModel } from "../models/LogModel.js";
import { AuthController } from "./AuthController.js";

export const DataController = {
  async getAllMasterData() {
    const [wilayah, pasar, kategori, satuan, komoditas] = await Promise.all([
      MasterDataModel.getAll("wilayah"),
      MasterDataModel.getAll("pasar"),
      MasterDataModel.getAll("kategori"),
      MasterDataModel.getAll("satuan"),
      MasterDataModel.getAll("komoditas")
    ]);
    return { wilayah, pasar, kategori, satuan, komoditas };
  },

  async saveMasterItem(entity, id, payload) {
    const session = AuthController.getSession();
    if (session.role !== "admin") {
      return { success: false, message: "Akses ditolak. Hanya Admin yang dapat mengelola data master." };
    }

    const existingList = await MasterDataModel.getAll(entity);

    // Validasi per entitas (Alur Alternatif 3A: Data tidak lengkap / duplikat)
    if (entity === "wilayah") {
      if (!payload.kode_wilayah?.trim() || !payload.nama_wilayah?.trim()) {
        return { success: false, message: "Kode wilayah dan nama wilayah wajib diisi." };
      }
      const dup = existingList.some(
        (w) =>
          String(w.id) !== String(id) &&
          (w.kode_wilayah.toLowerCase() === payload.kode_wilayah.trim().toLowerCase() ||
            w.nama_wilayah.toLowerCase() === payload.nama_wilayah.trim().toLowerCase())
      );
      if (dup) return { success: false, message: "Gagal menyimpan: Kode atau nama wilayah sudah ada." };
    }

    if (entity === "pasar") {
      if (!payload.nama_pasar?.trim() || !payload.id_wilayah || !payload.lokasi?.trim()) {
        return { success: false, message: "Nama pasar, wilayah, dan lokasi wajib diisi." };
      }
      const dup = existingList.some(
        (p) =>
          String(p.id) !== String(id) &&
          p.nama_pasar.toLowerCase() === payload.nama_pasar.trim().toLowerCase()
      );
      if (dup) return { success: false, message: "Gagal menyimpan: Nama pasar sudah terdaftar." };
    }

    if (entity === "kategori") {
      if (!payload.nama_kategori?.trim()) {
        return { success: false, message: "Nama kategori wajib diisi." };
      }
      const dup = existingList.some(
        (k) =>
          String(k.id) !== String(id) &&
          k.nama_kategori.toLowerCase() === payload.nama_kategori.trim().toLowerCase()
      );
      if (dup) return { success: false, message: "Gagal menyimpan: Kategori tersebut sudah ada." };
    }

    if (entity === "satuan") {
      if (!payload.nama_satuan?.trim()) {
        return { success: false, message: "Nama satuan wajib diisi." };
      }
      const dup = existingList.some(
        (s) =>
          String(s.id) !== String(id) &&
          s.nama_satuan.toLowerCase() === payload.nama_satuan.trim().toLowerCase()
      );
      if (dup) return { success: false, message: "Gagal menyimpan: Satuan tersebut sudah ada." };
    }

    if (entity === "komoditas") {
      if (!payload.nama_komoditas?.trim() || !payload.id_kategori || !payload.id_satuan) {
        return { success: false, message: "Nama komoditas, kategori, dan satuan wajib diisi." };
      }
      const dup = existingList.some(
        (k) =>
          String(k.id) !== String(id) &&
          k.nama_komoditas.toLowerCase() === payload.nama_komoditas.trim().toLowerCase()
      );
      if (dup) return { success: false, message: "Gagal menyimpan: Komoditas sudah terdaftar." };
    }

    let result;
    if (id) {
      result = await MasterDataModel.edit(entity, id, payload);
      await LogModel.catatRiwayat({
        deskripsi: `Memperbarui data ${entity} (ID: ${id})`,
        aktor: session.nama_lengkap,
        role: session.role
      });
    } else {
      result = await MasterDataModel.tambah(entity, payload);
      await LogModel.catatRiwayat({
        deskripsi: `Menambahkan data baru pada ${entity}`,
        aktor: session.nama_lengkap,
        role: session.role
      });
    }

    return {
      success: true,
      message: id ? "Data berhasil diperbarui." : "Data baru berhasil ditambahkan.",
      data: result
    };
  },

  async deleteMasterItem(entity, id) {
    const session = AuthController.getSession();
    if (session.role !== "admin") {
      return { success: false, message: "Akses ditolak." };
    }

    await MasterDataModel.hapus(entity, id);
    await LogModel.catatRiwayat({
      deskripsi: `Menghapus data ${entity} (ID: ${id})`,
      aktor: session.nama_lengkap,
      role: session.role
    });

    return { success: true, message: "Data berhasil dihapus." };
  }
};

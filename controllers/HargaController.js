/**
 * controllers/HargaController.js
 * Sesuai Sequence Diagram Use Case 2: Menginput Harga Komoditas (Validasi, Catat Waktu, Simpan, Log).
 */

import { HargaModel } from "../models/HargaModel.js";
import { MasterDataModel } from "../models/MasterDataModel.js";
import { LogModel } from "../models/LogModel.js";
import { AuthController } from "./AuthController.js";

const MIN_VALID_PRICE = 500;
const MAX_VALID_PRICE = 500000;

export const HargaController = {
  validasiHarga({ id_komoditas, id_pasar, harga_sekarang, tanggal_catat }) {
    if (!id_komoditas || !id_pasar || !tanggal_catat) {
      return {
        valid: false,
        message: "Komoditas, pasar, dan tanggal pencatatan wajib diisi."
      };
    }

    const numericPrice = Number(harga_sekarang);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      return {
        valid: false,
        message: "Harga harus berupa angka positif lebih dari Rp 0."
      };
    }

    if (numericPrice < MIN_VALID_PRICE || numericPrice > MAX_VALID_PRICE) {
      return {
        valid: false,
        message: `Validasi kewajaran gagal: Harga harus berada di antara Rp ${MIN_VALID_PRICE.toLocaleString("id-ID")} hingga Rp ${MAX_VALID_PRICE.toLocaleString("id-ID")}.`
      };
    }

    return { valid: true };
  },

  async inputHargaKomoditas(payload) {
    const session = AuthController.getSession();
    if (session.role !== "petugas" && session.role !== "admin") {
      return {
        success: false,
        message: "Akses ditolak. Hanya Petugas Lapangan atau Admin yang dapat menginput harga."
      };
    }

    // 1. Include: Validasi Harga
    const check = this.validasiHarga(payload);
    if (!check.valid) {
      return {
        success: false,
        message: check.message
      };
    }

    // 2. Include: Mencatat Waktu Input
    const now = new Date();
    const waktuInput = `${now.toLocaleDateString("id-ID")} ${now.toLocaleTimeString("id-ID")} WIB`;

    // 3. Include: Menyimpan Data
    const saved = await HargaModel.simpanData({
      id_komoditas: payload.id_komoditas,
      id_pasar: payload.id_pasar,
      harga_sekarang: Number(payload.harga_sekarang),
      tanggal_catat: payload.tanggal_catat,
      waktu_input: waktuInput,
      petugas: session.nama_lengkap
    });

    // 4. Include: Mencatat Riwayat Aktivitas
    const [kom, psr] = await Promise.all([
      MasterDataModel.getById("komoditas", payload.id_komoditas),
      MasterDataModel.getById("pasar", payload.id_pasar)
    ]);

    await LogModel.catatRiwayat({
      deskripsi: `Input harga ${kom?.nama_komoditas || payload.id_komoditas} di ${psr?.nama_pasar || payload.id_pasar} sebesar Rp ${Number(payload.harga_sekarang).toLocaleString("id-ID")}`,
      aktor: session.nama_lengkap,
      role: session.role
    });

    return {
      success: true,
      message: "Data harga komoditas berhasil divalidasi dan disimpan!",
      data: saved
    };
  },

  async getRiwayatHarga({ pasarId = "", komoditasId = "" } = {}) {
    const [riwayatAll, komoditasAll, pasarAll, satuanAll] = await Promise.all([
      HargaModel.getAll(),
      MasterDataModel.getAll("komoditas"),
      MasterDataModel.getAll("pasar"),
      MasterDataModel.getAll("satuan")
    ]);

    const komMap = Object.fromEntries(komoditasAll.map((k) => [k.id, k]));
    const psrMap = Object.fromEntries(pasarAll.map((p) => [p.id, p]));
    const satMap = Object.fromEntries(satuanAll.map((s) => [s.id, s.nama_satuan]));

    return riwayatAll
      .filter((r) => {
        const matchPsr = !pasarId || r.id_pasar === pasarId;
        const matchKom = !komoditasId || r.id_komoditas === komoditasId;
        return matchPsr && matchKom;
      })
      .map((r) => {
        const kom = komMap[r.id_komoditas];
        return {
          ...r,
          nama_komoditas: kom?.nama_komoditas || "-",
          nama_satuan: kom ? satMap[kom.id_satuan] || "Kg" : "Kg",
          nama_pasar: psrMap[r.id_pasar]?.nama_pasar || "-"
        };
      });
  }
};

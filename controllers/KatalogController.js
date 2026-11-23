/**
 * controllers/KatalogController.js
 * Sesuai Sequence Diagram Use Case 5: Melihat Katalog Harga Terkini & Mencari Komoditas.
 */

import { MasterDataModel } from "../models/MasterDataModel.js";
import { HargaModel } from "../models/HargaModel.js";

export const KatalogController = {
  async getKatalogTerkini({ keyword = "", kategoriId = "", wilayahId = "" } = {}) {
    const [komoditasAll, pasarAll, wilayahAll, kategoriAll, satuanAll, riwayatAll] = await Promise.all([
      MasterDataModel.getAll("komoditas"),
      MasterDataModel.getAll("pasar"),
      MasterDataModel.getAll("wilayah"),
      MasterDataModel.getAll("kategori"),
      MasterDataModel.getAll("satuan"),
      HargaModel.getAll()
    ]);

    const wilayahMap = Object.fromEntries(wilayahAll.map((w) => [w.id, w]));
    const kategoriMap = Object.fromEntries(kategoriAll.map((k) => [k.id, k]));
    const satuanMap = Object.fromEntries(satuanAll.map((s) => [s.id, s]));

    // Filter pasar berdasarkan wilayah jika dipilih
    const activeMarkets = wilayahId
      ? pasarAll.filter((p) => p.id_wilayah === wilayahId)
      : pasarAll;

    // Filter komoditas berdasarkan keyword & kategori
    const cleanQuery = String(keyword).trim().toLowerCase();
    const filteredKomoditas = komoditasAll.filter((kom) => {
      const matchName = !cleanQuery || kom.nama_komoditas.toLowerCase().includes(cleanQuery);
      const matchKat = !kategoriId || kom.id_kategori === kategoriId;
      return matchName && matchKat;
    });

    // Skenario Alternatif 5A: Komoditas tidak ditemukan
    if (filteredKomoditas.length === 0) {
      return {
        success: false,
        message: "Komoditas tidak ditemukan / tidak tersedia.",
        markets: activeMarkets.map((m) => ({
          ...m,
          nama_wilayah: wilayahMap[m.id_wilayah]?.nama_wilayah || "-"
        })),
        items: [],
        kpi: {
          totalKomoditas: komoditasAll.length,
          totalPasar: pasarAll.length,
          lastUpdate: riwayatAll[0]?.tanggal_catat || "-",
          komoditasNaik: 0
        }
      };
    }

    let komoditasNaikCount = 0;

    const items = filteredKomoditas.map((kom) => {
      const pricesByMarket = {};
      const validPrices = [];
      let prevPrices = [];

      for (const psr of activeMarkets) {
        const records = riwayatAll.filter(
          (r) => r.id_komoditas === kom.id && r.id_pasar === psr.id
        );
        if (records.length > 0) {
          pricesByMarket[psr.id] = records[0];
          validPrices.push({
            pasar: psr.nama_pasar,
            harga: Number(records[0].harga_sekarang)
          });
          if (records.length > 1) {
            prevPrices.push(Number(records[1].harga_sekarang));
          }
        } else {
          pricesByMarket[psr.id] = null;
        }
      }

      const avgPrice = validPrices.length
        ? Math.round(validPrices.reduce((acc, cur) => acc + cur.harga, 0) / validPrices.length)
        : 0;

      const prevAvg = prevPrices.length
        ? Math.round(prevPrices.reduce((acc, cur) => acc + cur, 0) / prevPrices.length)
        : avgPrice;

      const diff = avgPrice - prevAvg;
      const pctChange = prevAvg > 0 ? Number(((diff / prevAvg) * 100).toFixed(1)) : 0;
      if (diff > 0) komoditasNaikCount++;

      const sortedPrices = [...validPrices].sort((a, b) => a.harga - b.harga);
      const minEntry = sortedPrices[0] || null;
      const maxEntry = sortedPrices[sortedPrices.length - 1] || null;

      return {
        id: kom.id,
        nama_komoditas: kom.nama_komoditas,
        nama_kategori: kategoriMap[kom.id_kategori]?.nama_kategori || "-",
        nama_satuan: satuanMap[kom.id_satuan]?.nama_satuan || "Kg",
        pricesByMarket,
        avgPrice,
        diff,
        pctChange,
        minEntry,
        maxEntry
      };
    });

    return {
      success: true,
      message: "Katalog berhasil dimuat.",
      markets: activeMarkets.map((m) => ({
        ...m,
        nama_wilayah: wilayahMap[m.id_wilayah]?.nama_wilayah || "-"
      })),
      items,
      kpi: {
        totalKomoditas: komoditasAll.length,
        totalPasar: pasarAll.length,
        lastUpdate: riwayatAll[0]?.tanggal_catat || "-",
        komoditasNaik: komoditasNaikCount
      }
    };
  }
};

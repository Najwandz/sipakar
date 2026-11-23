/**
 * controllers/LaporanController.js
 * Sesuai Sequence Diagram Use Case 4: Melihat Laporan Fluktuasi Harga & Alur Alternatif 4A.
 */

import { MasterDataModel } from "../models/MasterDataModel.js";
import { HargaModel } from "../models/HargaModel.js";

const LINE_COLORS = [
  "#059669", // Emerald
  "#2563eb", // Blue
  "#d97706", // Amber
  "#dc2626", // Rose
  "#7c3aed"  // Violet
];

export const LaporanController = {
  async getLaporanFluktuasi({ komoditasId, startDate, endDate }) {
    const [komoditasAll, pasarAll, satuanAll, riwayatAll] = await Promise.all([
      MasterDataModel.getAll("komoditas"),
      MasterDataModel.getAll("pasar"),
      MasterDataModel.getAll("satuan"),
      HargaModel.getAll()
    ]);

    const selectedKomoditas =
      komoditasAll.find((k) => k.id === komoditasId) || komoditasAll[0];

    if (!selectedKomoditas) {
      return {
        success: false,
        message: "Data master komoditas belum tersedia."
      };
    }

    const satuan = satuanAll.find((s) => s.id === selectedKomoditas.id_satuan)?.nama_satuan || "Kg";
    const pasarMap = Object.fromEntries(pasarAll.map((p) => [p.id, p.nama_pasar]));

    const filtered = riwayatAll.filter((r) => {
      const matchKom = r.id_komoditas === selectedKomoditas.id;
      const matchStart = !startDate || r.tanggal_catat >= startDate;
      const matchEnd = !endDate || r.tanggal_catat <= endDate;
      return matchKom && matchStart && matchEnd;
    });

    // Skenario Alternatif 4A: Data laporan kosong / tidak ditemukan
    if (filtered.length === 0) {
      return {
        success: false,
        message: "Data tidak tersedia untuk rentang tanggal ini.",
        komoditas: { ...selectedKomoditas, nama_satuan: satuan },
        labels: [],
        datasets: [],
        tableRows: []
      };
    }

    const uniqueDates = [...new Set(filtered.map((r) => r.tanggal_catat))].sort();

    const datasets = pasarAll.map((psr, idx) => {
      const dataPoints = uniqueDates.map((tgl) => {
        const match = filtered.find((r) => r.id_pasar === psr.id && r.tanggal_catat === tgl);
        return match ? Number(match.harga_sekarang) : null;
      });

      const color = LINE_COLORS[idx % LINE_COLORS.length];
      return {
        label: psr.nama_pasar,
        data: dataPoints,
        borderColor: color,
        backgroundColor: color + "20",
        borderWidth: 2.5,
        tension: 0.3,
        spanGaps: true,
        pointRadius: 4,
        pointHoverRadius: 6
      };
    });

    const tableRows = filtered
      .map((r) => ({
        ...r,
        nama_pasar: pasarMap[r.id_pasar] || "-",
        nama_komoditas: selectedKomoditas.nama_komoditas,
        nama_satuan: satuan
      }))
      .sort((a, b) => b.tanggal_catat.localeCompare(a.tanggal_catat));

    return {
      success: true,
      message: "Laporan fluktuasi berhasil dimuat.",
      komoditas: { ...selectedKomoditas, nama_satuan: satuan },
      labels: uniqueDates,
      datasets,
      tableRows
    };
  }
};

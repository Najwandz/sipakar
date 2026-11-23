/**
 * config/seeder.js
 * Auto-seeding data awal pasar lokal (Tasikmalaya & Ciamis) beserta riwayat harga 7 hari terakhir
 * agar katalog dan grafik fluktuasi langsung siap digunakan saat database masih kosong.
 */

import { db } from "./firebase.js";

function formatDateOffset(daysOffset) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function seedInitialData(forceReset = false) {
  if (forceReset) {
    await db.clearAllLocal();
  }

  const existingKomoditas = await db.count("komoditas");
  if (existingKomoditas > 0 && !forceReset) {
    return false;
  }

  // 1. Wilayah
  const wilayahList = [
    { id: "wil_1", kode_wilayah: "TSK-KOTA", nama_wilayah: "Kota Tasikmalaya" },
    { id: "wil_2", kode_wilayah: "CMS-KAB", nama_wilayah: "Kabupaten Ciamis" }
  ];
  for (const w of wilayahList) await db.insert("wilayah", w);

  // 2. Pasar
  const pasarList = [
    { id: "psr_1", id_wilayah: "wil_1", nama_pasar: "Pasar Cikurubuk", lokasi: "Jl. Residen Ardiwinangun, Kec. Mangkubumi" },
    { id: "psr_2", id_wilayah: "wil_1", nama_pasar: "Pasar Pancasila", lokasi: "Jl. Pancasila, Kec. Tawang" },
    { id: "psr_3", id_wilayah: "wil_1", nama_pasar: "Pasar Padayungan", lokasi: "Jl. Perintis Kemerdekaan, Kec. Kawalu" },
    { id: "psr_4", id_wilayah: "wil_2", nama_pasar: "Pasar Manis Ciamis", lokasi: "Jl. Pemuda, Kec. Ciamis" }
  ];
  for (const p of pasarList) await db.insert("pasar", p);

  // 3. Kategori
  const kategoriList = [
    { id: "kat_1", nama_kategori: "Beras & Biji-bijian" },
    { id: "kat_2", nama_kategori: "Bumbu Dapur & Cabai" },
    { id: "kat_3", nama_kategori: "Protein Hewani" },
    { id: "kat_4", nama_kategori: "Minyak & Gula" },
    { id: "kat_5", nama_kategori: "Sayur-mayur" }
  ];
  for (const k of kategoriList) await db.insert("kategori", k);

  // 4. Satuan
  const satuanList = [
    { id: "sat_1", nama_satuan: "Kg" },
    { id: "sat_2", nama_satuan: "Liter" },
    { id: "sat_3", nama_satuan: "Ikat" }
  ];
  for (const s of satuanList) await db.insert("satuan", s);

  // 5. Komoditas
  const komoditasList = [
    { id: "kom_1", id_kategori: "kat_1", id_satuan: "sat_1", nama_komoditas: "Beras Medium Lokal" },
    { id: "kom_2", id_kategori: "kat_1", id_satuan: "sat_1", nama_komoditas: "Beras Premium" },
    { id: "kom_3", id_kategori: "kat_2", id_satuan: "sat_1", nama_komoditas: "Cabai Merah Keriting" },
    { id: "kom_4", id_kategori: "kat_2", id_satuan: "sat_1", nama_komoditas: "Cabai Rawit Domba" },
    { id: "kom_5", id_kategori: "kat_2", id_satuan: "sat_1", nama_komoditas: "Bawang Merah Brebes" },
    { id: "kom_6", id_kategori: "kat_2", id_satuan: "sat_1", nama_komoditas: "Bawang Putih Kating" },
    { id: "kom_7", id_kategori: "kat_3", id_satuan: "sat_1", nama_komoditas: "Daging Ayam Ras" },
    { id: "kom_8", id_kategori: "kat_3", id_satuan: "sat_1", nama_komoditas: "Telur Ayam Ras" },
    { id: "kom_9", id_kategori: "kat_4", id_satuan: "sat_2", nama_komoditas: "Minyak Goreng Kita" },
    { id: "kom_10", id_kategori: "kat_4", id_satuan: "sat_1", nama_komoditas: "Gula Pasir Lokal" }
  ];
  for (const kom of komoditasList) await db.insert("komoditas", kom);

  // 6. Riwayat Harga 7 Hari Terakhir (H-6 s.d. Hari Ini)
  const basePrices = {
    kom_1: 13500,
    kom_2: 15500,
    kom_3: 44000,
    kom_4: 56000,
    kom_5: 36000,
    kom_6: 40000,
    kom_7: 37000,
    kom_8: 28500,
    kom_9: 16500,
    kom_10: 17500
  };

  const marketDelta = {
    psr_1: -500,  // Cikurubuk (pasar induk, cenderung lebih murah)
    psr_2: 500,   // Pancasila
    psr_3: 1000,  // Padayungan
    psr_4: 0      // Manis Ciamis
  };

  const dailyFluctuation = [-1000, -500, 0, 1000, 500, -500, 0];

  for (let dayIdx = -6; dayIdx <= 0; dayIdx++) {
    const tanggal = formatDateOffset(dayIdx);
    const fluktuasi = dailyFluctuation[dayIdx + 6];

    for (const kom of komoditasList) {
      for (const psr of pasarList) {
        const wave = ((kom.id.charCodeAt(4) + psr.id.charCodeAt(4) + dayIdx) % 3 - 1) * 500;
        const harga = Math.max(2000, basePrices[kom.id] + marketDelta[psr.id] + fluktuasi + wave);

        await db.insert("riwayat_harga", {
          id_komoditas: kom.id,
          id_pasar: psr.id,
          harga_sekarang: harga,
          tanggal_catat: tanggal,
          waktu_input: `${tanggal} 07:30:00 WIB`,
          petugas: "Petugas Lapangan (Sistem)"
        });
      }
    }
  }

  // 7. Log Aktivitas Awal
  await db.insert("log_aktivitas", {
    deskripsi: "Inisialisasi otomatis data master pasar lokal & riwayat harga 7 hari terakhir",
    aktor: "Sistem",
    role: "system",
    waktu_log: new Date().toLocaleString("id-ID")
  });

  return true;
}

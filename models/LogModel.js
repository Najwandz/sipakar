/**
 * models/LogModel.js
 * Implementasi Class Diagram: log aktivitas (LogDB).
 */

import { db } from "../config/firebase.js";

export const LogModel = {
  async getAll() {
    const logs = await db.getAll("log_aktivitas");
    return logs.reverse();
  },

  async catatRiwayat({ deskripsi, aktor, role }) {
    return await db.insert("log_aktivitas", {
      deskripsi,
      aktor: aktor || "Sistem",
      role: role || "system",
      waktu_log: new Date().toLocaleString("id-ID")
    });
  }
};

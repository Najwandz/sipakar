/**
 * models/UserModel.js
 * Implementasi Class Diagram: User {abstract}, Admin, PetugasLapangan, Masyarakat, serta AuditLogDB.
 */

import { db } from "../config/firebase.js";

const SESSION_KEY = "sipakar_active_user";

export class User {
  constructor({ id_user, username, nama_lengkap, role }) {
    if (new.target === User) {
      throw new Error("Kelas abstrak User tidak dapat diinstansiasi langsung.");
    }
    this.id_user = id_user;
    this.username = username;
    this.nama_lengkap = nama_lengkap;
    this.role = role;
  }

  login() {
    localStorage.setItem(SESSION_KEY, JSON.stringify(this));
    return this;
  }

  logout() {
    localStorage.removeItem(SESSION_KEY);
  }
}

export class AdminUser extends User {
  constructor(data) {
    super({ ...data, role: "admin" });
  }
}

export class PetugasLapanganUser extends User {
  constructor(data) {
    super({ ...data, role: "petugas" });
  }
}

export class MasyarakatUser extends User {
  constructor() {
    super({
      id_user: 0,
      username: "publik",
      nama_lengkap: "Masyarakat Umum",
      role: "masyarakat"
    });
  }
}

// Daftar kredensial demo terstruktur sesuai skenario UML
const DEMO_ACCOUNTS = [
  {
    id_user: 1,
    username: "admin",
    password: "admin123",
    nama_lengkap: "Administrator Dinas Pasar",
    role: "admin"
  },
  {
    id_user: 2,
    username: "petugas",
    password: "petugas123",
    nama_lengkap: "Petugas Lapangan Pasar",
    role: "petugas"
  }
];

export const UserModel = {
  authenticate(username, password) {
    const cleanUser = String(username || "").trim().toLowerCase();
    const cleanPass = String(password || "").trim();

    const found = DEMO_ACCOUNTS.find(
      (acc) => acc.username === cleanUser && acc.password === cleanPass
    );

    if (!found) return null;

    const instance =
      found.role === "admin"
        ? new AdminUser(found)
        : new PetugasLapanganUser(found);

    return instance.login();
  },

  getCurrentUser() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return new MasyarakatUser();
      const parsed = JSON.parse(raw);
      if (parsed.role === "admin") return new AdminUser(parsed);
      if (parsed.role === "petugas") return new PetugasLapanganUser(parsed);
      return new MasyarakatUser();
    } catch {
      return new MasyarakatUser();
    }
  },

  clearCurrentUser() {
    localStorage.removeItem(SESSION_KEY);
  },

  async recordAuditLogin(username, berhasil, keterangan) {
    await db.insert("log_aktivitas", {
      deskripsi: `[Auth] Login user '${username}': ${keterangan}`,
      aktor: username || "anonim",
      role: berhasil ? "authenticated" : "guest",
      waktu_log: new Date().toLocaleString("id-ID")
    });
  }
};

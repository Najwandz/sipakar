/**
 * controllers/AuthController.js
 * Sesuai Sequence Diagram Use Case 1: Login & Alur Alternatif 1A.
 */

import { UserModel } from "../models/UserModel.js";

export const AuthController = {
  async login(username, password) {
    if (!username || !password) {
      return {
        success: false,
        message: "Username dan password wajib diisi."
      };
    }

    const user = UserModel.authenticate(username, password);
    if (!user) {
      await UserModel.recordAuditLogin(username, false, "Gagal (Username/Password salah)");
      return {
        success: false,
        message: "Username atau password salah. Silakan periksa kembali."
      };
    }

    await UserModel.recordAuditLogin(user.username, true, `Berhasil login sebagai ${user.role}`);
    return {
      success: true,
      message: `Selamat datang, ${user.nama_lengkap}!`,
      user
    };
  },

  logout() {
    UserModel.clearCurrentUser();
  },

  getSession() {
    return UserModel.getCurrentUser();
  },

  isAuthenticated() {
    const user = this.getSession();
    return user.role === "admin" || user.role === "petugas";
  },

  hasRole(allowedRoles = []) {
    const user = this.getSession();
    return allowedRoles.includes(user.role);
  }
};

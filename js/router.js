/**
 * js/router.js
 * Pengatur navigasi antar halaman dan penjaga hak akses (Role Guard) sesuai Use Case Diagram.
 */

import { AuthController } from "../controllers/AuthController.js";
import { renderNavbar } from "../views/components/NavbarView.js";
import { openLoginModal } from "../views/components/ModalLoginView.js";
import { renderKatalogView } from "../views/KatalogView.js";
import { renderLaporanView } from "../views/LaporanView.js";
import { renderFormInputView } from "../views/FormInputView.js";
import { renderKelolaDataView } from "../views/KelolaDataView.js";
import { renderRekapView, renderLogView } from "../views/RekapLogView.js";

const ROUTE_PERMISSIONS = {
  katalog: ["masyarakat", "petugas", "admin"],
  laporan: ["masyarakat", "petugas", "admin"],
  "input-harga": ["petugas", "admin"],
  "kelola-data": ["admin"],
  rekap: ["admin"],
  log: ["admin"]
};

export class Router {
  constructor({ showToast }) {
    this.currentRoute = "katalog";
    this.showToast = showToast;
  }

  async navigate(route = "katalog") {
    const allowedRoles = ROUTE_PERMISSIONS[route] || ["masyarakat"];
    const session = AuthController.getSession();

    // Role guard: jika peran tidak berhak, arahkan kembali ke katalog
    if (!allowedRoles.includes(session.role)) {
      this.showToast("Anda tidak memiliki hak akses ke halaman tersebut.", "error");
      route = "katalog";
    }

    this.currentRoute = route;

    renderNavbar(this.currentRoute, {
      onNavigate: (nextRoute) => this.navigate(nextRoute),
      onOpenLogin: () =>
        openLoginModal({
          onSuccess: (user) => {
            this.showToast(`Berhasil masuk sebagai ${user.nama_lengkap}`, "success");
            const defaultTarget = user.role === "petugas" ? "input-harga" : "kelola-data";
            this.navigate(defaultTarget);
          }
        }),
      onLogout: () => {
        AuthController.logout();
        this.showToast("Anda telah keluar dari sesi internal.", "info");
        this.navigate("katalog");
      }
    });

    const appContent = document.getElementById("app-content");

    switch (route) {
      case "katalog":
        await renderKatalogView(appContent);
        break;
      case "laporan":
        await renderLaporanView(appContent);
        break;
      case "input-harga":
        await renderFormInputView(appContent, { showToast: this.showToast });
        break;
      case "kelola-data":
        await renderKelolaDataView(appContent, { showToast: this.showToast });
        break;
      case "rekap":
        await renderRekapView(appContent, { showToast: this.showToast });
        break;
      case "log":
        await renderLogView(appContent);
        break;
      default:
        await renderKatalogView(appContent);
    }
  }
}

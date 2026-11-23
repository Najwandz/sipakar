/**
 * views/components/NavbarView.js
 * Navigasi responsif dinamis berdasarkan peran pengguna (Masyarakat, Petugas Lapangan, Admin).
 */

import { AuthController } from "../../controllers/AuthController.js";

export function renderNavbar(activeRoute, { onNavigate, onOpenLogin, onLogout }) {
  const container = document.getElementById("navbar-container");
  const session = AuthController.getSession();

  const navItems = [
    { id: "katalog", label: "Katalog Harga", icon: "store", roles: ["masyarakat", "petugas", "admin"] },
    { id: "laporan", label: "Laporan Fluktuasi", icon: "trending-up", roles: ["masyarakat", "petugas", "admin"] },
    { id: "input-harga", label: "Input & Riwayat Harga", icon: "plus-circle", roles: ["petugas", "admin"] },
    { id: "kelola-data", label: "Kelola Data Master", icon: "database", roles: ["admin"] },
    { id: "rekap", label: "Rekap Pasaran", icon: "file-spreadsheet", roles: ["admin"] },
    { id: "log", label: "Log Aktivitas", icon: "history", roles: ["admin"] }
  ];

  const visibleItems = navItems.filter((item) => item.roles.includes(session.role));

  const roleBadge = {
    masyarakat: `<span class="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">Portal Publik</span>`,
    petugas: `<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">Petugas Lapangan</span>`,
    admin: `<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">Admin Sistem</span>`
  }[session.role];

  container.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Brand -->
        <button type="button" data-route="katalog" class="nav-link flex items-center gap-3 text-left focus:outline-none">
          <img src="./assets/img/logo.svg" alt="Logo SIPAKAR" class="w-9 h-9 rounded-lg shadow-sm" />
          <div>
            <div class="font-extrabold text-lg tracking-tight text-slate-900 leading-none">SIPAKAR</div>
            <div class="text-[11px] text-slate-500 font-medium mt-0.5">Pantau Harga Pasar Lokal</div>
          </div>
        </button>

        <!-- Desktop Menu -->
        <nav class="hidden md:flex items-center gap-1">
          ${visibleItems
            .map((item) => {
              const isActive = activeRoute === item.id;
              return `
                <button
                  type="button"
                  data-route="${item.id}"
                  class="nav-link inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }"
                >
                  <i data-lucide="${item.icon}" class="w-4 h-4"></i>
                  <span>${item.label}</span>
                </button>
              `;
            })
            .join("")}
        </nav>

        <!-- Auth Action -->
        <div class="flex items-center gap-3">
          <div class="hidden sm:flex items-center gap-2">
            ${roleBadge}
          </div>
          ${
            session.role === "masyarakat"
              ? `
                <button
                  id="btn-open-login"
                  type="button"
                  class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition"
                >
                  <i data-lucide="log-in" class="w-4 h-4"></i>
                  <span>Login Petugas / Admin</span>
                </button>
              `
              : `
                <button
                  id="btn-logout"
                  type="button"
                  class="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition"
                >
                  <i data-lucide="log-out" class="w-4 h-4"></i>
                  <span>Keluar</span>
                </button>
              `
          }
        </div>
      </div>

      <!-- Mobile Horizontal Nav -->
      <div class="flex md:hidden items-center gap-1 overflow-x-auto pb-2.5 pt-1 border-t border-slate-100">
        ${visibleItems
          .map((item) => {
            const isActive = activeRoute === item.id;
            return `
              <button
                type="button"
                data-route="${item.id}"
                class="nav-link whitespace-nowrap inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
                  isActive
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-600"
                }"
              >
                <i data-lucide="${item.icon}" class="w-3.5 h-3.5"></i>
                <span>${item.label}</span>
              </button>
            `;
          })
          .join("")}
      </div>
    </div>
  `;

  container.querySelectorAll(".nav-link").forEach((btn) => {
    btn.addEventListener("click", () => onNavigate(btn.dataset.route));
  });

  const loginBtn = container.querySelector("#btn-open-login");
  if (loginBtn) loginBtn.addEventListener("click", onOpenLogin);

  const logoutBtn = container.querySelector("#btn-logout");
  if (logoutBtn) logoutBtn.addEventListener("click", onLogout);

  if (window.lucide) window.lucide.createIcons();
}

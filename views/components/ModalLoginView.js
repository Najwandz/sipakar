/**
 * views/components/ModalLoginView.js
 * Implementasi LoginUI sesuai Sequence Diagram Use Case 1 & 1A.
 */

import { AuthController } from "../../controllers/AuthController.js";

export function openLoginModal({ onSuccess }) {
  const modalContainer = document.getElementById("modal-container");

  modalContainer.innerHTML = `
    <div id="login-backdrop" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        <div class="px-6 py-5 bg-emerald-600 text-white flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold">Login Akses Internal</h3>
            <p class="text-xs text-emerald-100 mt-0.5">Khusus Petugas Lapangan &amp; Administrator Sistem</p>
          </div>
          <button id="btn-close-login" type="button" class="p-1.5 rounded-lg hover:bg-emerald-500/50 transition">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <form id="login-form" class="p-6 space-y-4">
          <div id="login-error" class="hidden p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium"></div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">Username</label>
            <input
              id="login-username"
              type="text"
              placeholder="Masukkan username"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm outline-none"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1">Password</label>
            <input
              id="login-password"
              type="password"
              placeholder="Masukkan password"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm outline-none"
              required
            />
          </div>

          <button
            type="submit"
            class="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm transition"
          >
            Masuk ke Sistem
          </button>

          <!-- Akun Demo Cepat -->
          <div class="pt-3 border-t border-slate-100">
            <p class="text-xs font-semibold text-slate-500 mb-2">Isi Otomatis Akun Demo (Uji UML):</p>
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                data-user="petugas"
                data-pass="petugas123"
                class="demo-fill px-3 py-2 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold text-left transition"
              >
                <div>Petugas Lapangan</div>
                <div class="text-[11px] font-normal text-amber-700">petugas / petugas123</div>
              </button>
              <button
                type="button"
                data-user="admin"
                data-pass="admin123"
                class="demo-fill px-3 py-2 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-semibold text-left transition"
              >
                <div>Admin Sistem</div>
                <div class="text-[11px] font-normal text-emerald-700">admin / admin123</div>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  `;

  const close = () => {
    modalContainer.innerHTML = "";
  };

  modalContainer.querySelector("#btn-close-login").addEventListener("click", close);
  modalContainer.querySelector("#login-backdrop").addEventListener("click", (e) => {
    if (e.target.id === "login-backdrop") close();
  });

  modalContainer.querySelectorAll(".demo-fill").forEach((btn) => {
    btn.addEventListener("click", () => {
      modalContainer.querySelector("#login-username").value = btn.dataset.user;
      modalContainer.querySelector("#login-password").value = btn.dataset.pass;
    });
  });

  modalContainer.querySelector("#login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = modalContainer.querySelector("#login-username").value;
    const password = modalContainer.querySelector("#login-password").value;
    const errorBox = modalContainer.querySelector("#login-error");

    const res = await AuthController.login(username, password);
    if (!res.success) {
      errorBox.textContent = res.message;
      errorBox.classList.remove("hidden");
      return;
    }

    close();
    if (onSuccess) onSuccess(res.user);
  });

  if (window.lucide) window.lucide.createIcons();
}

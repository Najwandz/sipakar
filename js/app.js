/**
 * js/app.js
 * Entry point utama aplikasi SIPAKAR.
 */

import { seedInitialData } from "../config/seeder.js";
import { Router } from "./router.js";

function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const palette = {
    success: "bg-emerald-600 text-white",
    error: "bg-rose-600 text-white",
    info: "bg-slate-800 text-white"
  }[type] || "bg-slate-800 text-white";

  const toast = document.createElement("div");
  toast.className = `toast-enter pointer-events-auto px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${palette}`;
  toast.textContent = message;

  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3500);
}

async function bootstrap() {
  try {
    await seedInitialData(false);
    const router = new Router({ showToast });
    await router.navigate("katalog");
  } catch (err) {
    console.error("[SIPAKAR Bootstrap Error]:", err);
    const appContent = document.getElementById("app-content");
    if (appContent) {
      appContent.innerHTML = `
        <div class="bg-rose-50 border border-rose-200 text-rose-800 p-6 rounded-2xl">
          <h2 class="font-bold text-lg">Terjadi Kesalahan Saat Memuat Aplikasi</h2>
          <p class="text-sm mt-1">${err.message}</p>
        </div>
      `;
    }
  }
}

document.addEventListener("DOMContentLoaded", bootstrap);

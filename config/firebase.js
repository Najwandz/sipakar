/**
 * config/firebase.js
 * Konfigurasi koneksi database SIPAKAR.
 *
 * Mode Default (USE_FIREBASE = false):
 * Menggunakan penyimpanan LocalStorage terstruktur yang kompatibel dengan skema Firestore,
 * sehingga aplikasi langsung berjalan di VS Code Live Server tanpa konfigurasi tambahan.
 *
 * Mode Cloud Firestore (USE_FIREBASE = true):
 * Ganti FIREBASE_CONFIG dengan kredensial proyek Firebase Anda untuk sinkronisasi cloud real-time.
 */

const USE_FIREBASE = false;

const FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const STORAGE_PREFIX = "sipakar_db_v1_";

class DatabaseAdapter {
  constructor() {
    this.firestore = null;
    this.fsOps = null;
    this.readyPromise = this._init();
  }

  async _init() {
    if (USE_FIREBASE && FIREBASE_CONFIG.apiKey !== "YOUR_API_KEY") {
      try {
        const appMod = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js");
        const fsMod = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");
        const app = appMod.initializeApp(FIREBASE_CONFIG);
        this.firestore = fsMod.getFirestore(app);
        this.fsOps = fsMod;
        console.info("[SIPAKAR DB] Terhubung ke Firebase Firestore.");
      } catch (err) {
        console.warn("[SIPAKAR DB] Gagal memuat Firebase SDK, beralih ke LocalStorage:", err);
        this.firestore = null;
      }
    } else {
      console.info("[SIPAKAR DB] Berjalan pada mode LocalStorage (siap offline/lokal).");
    }
  }

  isFirebaseActive() {
    return Boolean(this.firestore);
  }

  _readLocal(collectionName) {
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + collectionName);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  _writeLocal(collectionName, rows) {
    localStorage.setItem(STORAGE_PREFIX + collectionName, JSON.stringify(rows));
  }

  _generateId(prefix = "id") {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  }

  async getAll(collectionName) {
    await this.readyPromise;
    if (this.firestore) {
      const snap = await this.fsOps.getDocs(this.fsOps.collection(this.firestore, collectionName));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
    return this._readLocal(collectionName);
  }

  async getById(collectionName, id) {
    const items = await this.getAll(collectionName);
    return items.find((item) => String(item.id) === String(id)) || null;
  }

  async insert(collectionName, data) {
    await this.readyPromise;
    if (this.firestore) {
      const ref = await this.fsOps.addDoc(this.fsOps.collection(this.firestore, collectionName), data);
      return { id: ref.id, ...data };
    }
    const items = this._readLocal(collectionName);
    const newItem = { id: data.id || this._generateId(collectionName), ...data };
    items.push(newItem);
    this._writeLocal(collectionName, items);
    return newItem;
  }

  async update(collectionName, id, partialData) {
    await this.readyPromise;
    if (this.firestore) {
      const ref = this.fsOps.doc(this.firestore, collectionName, String(id));
      await this.fsOps.updateDoc(ref, partialData);
      return { id, ...partialData };
    }
    const items = this._readLocal(collectionName);
    const idx = items.findIndex((item) => String(item.id) === String(id));
    if (idx === -1) throw new Error("Data tidak ditemukan.");
    items[idx] = { ...items[idx], ...partialData };
    this._writeLocal(collectionName, items);
    return items[idx];
  }

  async remove(collectionName, id) {
    await this.readyPromise;
    if (this.firestore) {
      const ref = this.fsOps.doc(this.firestore, collectionName, String(id));
      await this.fsOps.deleteDoc(ref);
      return true;
    }
    const items = this._readLocal(collectionName);
    const filtered = items.filter((item) => String(item.id) !== String(id));
    this._writeLocal(collectionName, filtered);
    return true;
  }

  async count(collectionName) {
    const items = await this.getAll(collectionName);
    return items.length;
  }

  async clearAllLocal() {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(STORAGE_PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  }
}

export const db = new DatabaseAdapter();

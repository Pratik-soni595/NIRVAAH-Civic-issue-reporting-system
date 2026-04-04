/**
 * NIRVAAH Frontend - IndexedDB Service
 * Stores offline complaints for background sync when connectivity returns
 */

const DB_NAME = 'nirvaah-db';
const DB_VERSION = 1;
const STORE_NAME = 'pending-complaints';

// ============================================================
// OPEN DATABASE
// ============================================================
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true
        });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// ============================================================
// ADD A PENDING COMPLAINT
// ============================================================
const queueComplaint = async (complaintData, token = null) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const record = {
      ...complaintData,
      token, // inject token directly for backend request
      timestamp: Date.now(),
      synced: false
    };
    const req = store.add(record);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
};

// ============================================================
// GET ALL PENDING COMPLAINTS
// ============================================================
const getPendingComplaints = async () => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result.filter(r => !r.synced));
    req.onerror = () => reject(req.error);
  });
};

// ============================================================
// MARK A COMPLAINT AS SYNCED (remove from queue)
// ============================================================
const removePendingComplaint = async (id) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
};

// ============================================================
// COUNT PENDING COMPLAINTS (for offline banner)
// ============================================================
const countPending = async () => {
  const items = await getPendingComplaints();
  return items.length;
};

// ============================================================
// SYNC PENDING COMPLAINTS (upload when back online)
// ============================================================
const syncPendingComplaints = async () => {
  if (typeof navigator !== 'undefined' && 'onLine' in navigator && !navigator.onLine) {
    return { synced: 0, failed: 0 };
  }

  const pending = await getPendingComplaints();
  let synced = 0;
  let failed = 0;

  for (const item of pending) {
    try {
      const formData = new FormData();
      formData.append('title', item.title);
      formData.append('description', item.description);
      formData.append('category', item.category);
      formData.append('lat', item.lat);
      formData.append('lng', item.lng);
      formData.append('address', item.address || '');
      formData.append('priority', item.priority || 'medium');

      if (item.images && item.images.length > 0) {
        item.images.forEach(file => formData.append('images', file));
      }

      const headers = {};
      if (item.token) {
        headers['Authorization'] = `Bearer ${item.token}`;
      }

      const response = await fetch('/api/complaints', {
        method: 'POST',
        headers,
        body: formData
      });

      if (response.ok) {
        await removePendingComplaint(item.id);
        synced++;
      } else {
        console.error('Failed to sync complaint', item.id, await response.text());
        failed++;
      }
    } catch (e) {
      console.error('Network/sync error for complaint', item.id, e);
      failed++;
    }
  }

  return { synced, failed };
};

const root = typeof globalThis !== 'undefined' ? globalThis : self;
root.NirvaahDB = {
  queueComplaint,
  getPendingComplaints,
  removePendingComplaint,
  countPending,
  syncPendingComplaints
};

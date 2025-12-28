// Pequeno wrapper IndexedDB para armazenar fotos (data URLs)
const DB_NAME = 'album-db'
const STORE = 'photos'
const VERSION = 1

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION)
    req.onupgradeneeded = (ev) => {
      const db = ev.target.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function dbAddPhoto(photo) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    const store = tx.objectStore(STORE)
    const p = store.add({
      ...photo,
      createdAt: new Date().toISOString()
    })
    p.onsuccess = () => resolve(p.result)
    p.onerror = () => reject(p.error)
  })
}

export async function dbGetAllPhotos() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const store = tx.objectStore(STORE)
    const req = store.getAll()
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function dbClearAll() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    const store = tx.objectStore(STORE)
    const req = store.clear()
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

export async function dbBulkAdd(photos) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    const store = tx.objectStore(STORE)
    let count = 0
    photos.forEach(p => {
      const req = store.add({ ...p, importedAt: new Date().toISOString() })
      req.onsuccess = () => {
        count++
        if (count === photos.length) resolve()
      }
      req.onerror = (e) => {
        console.error('Erro ao adicionar item', e)
      }
    })
    tx.oncomplete = () => { /* resolve handled above */ }
    tx.onerror = () => reject(tx.error)
  })
}
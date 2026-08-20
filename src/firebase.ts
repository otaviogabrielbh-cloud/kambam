import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  getDocs,
  onSnapshot,
  type Firestore,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  type FirebaseStorage,
} from 'firebase/storage';

/**
 * KAMBAM Firebase setup.
 *
 * Credentials are read from environment variables (VITE_* are exposed to the
 * client by Vite). Set them in a `.env.local` file at the project root:
 *
 *   VITE_FIREBASE_API_KEY="..."
 *   VITE_FIREBASE_AUTH_DOMAIN="..."
 *   VITE_FIREBASE_PROJECT_ID="..."
 *   VITE_FIREBASE_STORAGE_BUCKET="..."
 *   VITE_FIREBASE_MESSAGING_SENDER_ID="..."
 *   VITE_FIREBASE_APP_ID="..."
 *
 * If the variables are not configured, the app keeps working in "local mode"
 * (localStorage) so development is not blocked.
 */

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId
);

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

export function getDb(): Firestore | null {
  if (!isFirebaseConfigured) return null;
  if (!db) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  }
  return db;
}

export function getStorageInstance(): FirebaseStorage | null {
  const database = getDb();
  if (!database) return null;
  if (!storage) {
    storage = getStorage(database.app);
  }
  return storage;
}

export const COLLECTIONS = {
  cards: 'cards',
  teamMembers: 'team_members',
  checklistTemplates: 'checklist_templates',
  contentFormats: 'content_formats',
} as const;

type DocData = { id: string } & Record<string, unknown>;

export const firestoreService = {
  /**
   * Fetch all documents from a collection. Returns [] if nothing stored.
   */
  async getAll(collectionName: string): Promise<DocData[]> {
    const database = getDb();
    if (!database) return [];
    const snap = await getDocs(collection(database, collectionName));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as DocData);
  },

  async get(collectionName: string, id: string): Promise<DocData | null> {
    const database = getDb();
    if (!database) return null;
    const snap = await getDoc(doc(database, collectionName, id));
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as DocData) : null;
  },

  async set(collectionName: string, id: string, data: object): Promise<void> {
    const database = getDb();
    if (!database) return;
    await setDoc(doc(database, collectionName, id), data, { merge: true });
  },

  async remove(collectionName: string, id: string): Promise<void> {
    const database = getDb();
    if (!database) return;
    await deleteDoc(doc(database, collectionName, id));
  },

  /**
   * Full sync of a collection: writes every item (keyed by `id`) and removes
   * any document that no longer exists in the array.
   */
  async syncCollection(collectionName: string, items: DocData[]): Promise<void> {
    const database = getDb();
    if (!database) return;
    const existing = await this.getAll(collectionName);
    const existingIds = new Set<string>(existing.map((e) => String(e.id)));
    const itemIds = new Set<string>(items.map((i) => String(i.id)));

    const writes: Promise<void>[] = items.map(({ id, ...rest }) =>
      this.set(collectionName, id, rest)
    );
    for (const id of existingIds) {
      if (!itemIds.has(id)) {
        writes.push(this.remove(collectionName, id));
      }
    }
    await Promise.all(writes);
  },

  /**
   * Real-time subscription. Calls `onChange` with every doc on any change.
   */
  subscribe(
    collectionName: string,
    onChange: (items: DocData[]) => void
  ): () => void {
    const database = getDb();
    if (!database) {
      onChange([]);
      return () => {};
    }
    const col = collection(database, collectionName);
    return onSnapshot(
      col,
      (snap) => {
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as DocData);
        onChange(items);
      },
      (err) => {
        console.warn(`Firestore subscription error (${collectionName}):`, err);
      }
    );
  },
};

/**
 * Firebase Storage: arquivos anexados aos cards.
 * O conteúdo é salvo em `attachments/<id>/<nome>` e apenas a URL + caminho
 * ficam no documento do Firestore (evita estourar o limite de 1 MiB por doc).
 */
export const storageService = {
  async uploadFile(file: File): Promise<{ url: string; storagePath: string }> {
    const bucket = getStorageInstance();
    if (!bucket) throw new Error('Firebase Storage não configurado');

    const id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `attachments/${id}/${safeName}`;

    const fileRef = ref(bucket, storagePath);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);
    return { url, storagePath };
  },

  async deleteFile(storagePath: string): Promise<void> {
    const bucket = getStorageInstance();
    if (!bucket) return;
    try {
      await deleteObject(ref(bucket, storagePath));
    } catch (e) {
      console.warn('Não foi possível remover o arquivo do Storage:', e);
    }
  },
};
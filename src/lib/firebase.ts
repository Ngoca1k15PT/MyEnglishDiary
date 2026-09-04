import type { FirebaseApp } from "firebase/app";
import type { Auth, User } from "firebase/auth";
import type { Firestore } from "firebase/firestore";

/**
 * Firebase chỉ được nạp trên trình duyệt.
 *
 * App này render phía máy chủ (Cloudflare Worker). SDK web của Firebase đụng tới
 * `window`/`indexedDB` nên nếu import tĩnh sẽ làm hỏng SSR. Vì vậy mọi thứ ở đây
 * đều là dynamic import, và chỉ được gọi từ trong useEffect / event handler.
 */

const config = {
  apiKey: import.meta.env["VITE_FIREBASE_API_KEY"] as string,
  authDomain: import.meta.env["VITE_FIREBASE_AUTH_DOMAIN"] as string,
  projectId: import.meta.env["VITE_FIREBASE_PROJECT_ID"] as string,
  appId: import.meta.env["VITE_FIREBASE_APP_ID"] as string,
  messagingSenderId: import.meta.env["VITE_FIREBASE_MESSAGING_SENDER_ID"] as string,
};

/** Thiếu cấu hình thì app vẫn chạy được, chỉ là không đăng nhập/đồng bộ được. */
export const firebaseReady = Boolean(config.apiKey && config.projectId && config.appId);

let appPromise: Promise<FirebaseApp> | undefined;
let authPromise: Promise<Auth> | undefined;
let dbPromise: Promise<Firestore> | undefined;

async function getApp(): Promise<FirebaseApp> {
  if (!appPromise) {
    appPromise = (async () => {
      const { initializeApp, getApps, getApp: get } = await import("firebase/app");
      return getApps().length ? get() : initializeApp(config);
    })();
  }
  return appPromise;
}

export async function getFirebaseAuth(): Promise<Auth> {
  if (!authPromise) {
    authPromise = (async () => {
      const [{ getAuth, setPersistence, browserLocalPersistence }, app] = await Promise.all([
        import("firebase/auth"),
        getApp(),
      ]);
      const auth = getAuth(app);
      // Giữ phiên đăng nhập qua các lần mở lại trình duyệt.
      await setPersistence(auth, browserLocalPersistence).catch(() => {});
      return auth;
    })();
  }
  return authPromise;
}

export async function getDb(): Promise<Firestore> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const [{ initializeFirestore, persistentLocalCache }, app] = await Promise.all([
        import("firebase/firestore"),
        getApp(),
      ]);
      // Cache offline: học được cả khi mất mạng, có mạng lại thì tự đẩy lên.
      try {
        return initializeFirestore(app, { localCache: persistentLocalCache({}) });
      } catch {
        const { getFirestore } = await import("firebase/firestore");
        return getFirestore(app);
      }
    })();
  }
  return dbPromise;
}

export type { User };

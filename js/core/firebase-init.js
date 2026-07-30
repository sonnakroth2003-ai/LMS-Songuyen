/**
 * @file firebase-init.js
 * @description Khởi tạo và cung cấp các dịch vụ Firebase SDK cho hệ thống LMS.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { firebaseConfig, isFirebaseConfigured } from '../config/firebase-config.js';

// Cảnh báo nếu Firebase chưa được cấu hình credentials thật
if (!isFirebaseConfigured()) {
  console.warn(
    '[LMS Firebase Warning]: Cấu hình Firebase chưa hoàn tất hoặc đang dùng Mock Keys. Vui lòng kiểm tra lại file .env!'
  );
}

// Khởi tạo Firebase App (Singleton Pattern: Tránh khởi tạo lại nếu đã có instance)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Khởi tạo các dịch vụ cốt lõi
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };

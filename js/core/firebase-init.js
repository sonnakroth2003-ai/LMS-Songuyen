/**
 * @file firebase-init.js
 * @description Khởi tạo và cung cấp các dịch vụ Firebase SDK cho hệ thống LMS.
 */

// Import Firebase SDK trực tiếp qua CDN chính thức của Google dành cho trình duyệt
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js';

import { firebaseConfig, isFirebaseConfigured } from '../config/firebase-config.js';

// Cảnh báo nếu Firebase chưa được cấu hình credentials thật
if (!isFirebaseConfigured()) {
  console.warn(
    '[LMS Firebase Warning]: Cấu hình Firebase chưa hoàn tất hoặc đang dùng Mock Keys. Vui lòng kiểm tra lại file .env hoặc firebase-config.js!'
  );
}

// Khởi tạo Firebase App (Singleton Pattern: Tránh khởi tạo lại nếu đã có instance)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Khởi tạo các dịch vụ cốt lõi
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };

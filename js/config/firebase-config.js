/**
 * @file firebase-config.js
 * @description Đọc và kiểm tra các cấu hình Firebase Credentials từ biến môi trường.
 */

/**
 * Hàm lấy giá trị biến môi trường an toàn
 * @param {string} key - Tên biến môi trường
 * @param {string} fallbackValue - Giá trị mặc định nếu biến không tồn tại
 * @returns {string}
 */
const getEnvVar = (key, fallbackValue = '') => {
  // Đọc từ chuẩn Vite import.meta.env hoặc process.env
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return fallbackValue;
};

/**
 * Cấu hình kết nối Firebase Project
 * Lưu ý: Các biến thực tế được cấu hình trong file .env
 */
export const firebaseConfig = Object.freeze({
  apiKey: getEnvVar('VITE_FIREBASE_API_KEY', 'MOCK_API_KEY'),
  authDomain: getEnvVar('VITE_FIREBASE_AUTH_DOMAIN', 'lms-math6.firebaseapp.com'),
  projectId: getEnvVar('VITE_FIREBASE_PROJECT_ID', 'lms-math6'),
  storageBucket: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET', 'lms-math6.appspot.com'),
  messagingSenderId: getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID', '1234567890'),
  appId: getEnvVar('VITE_FIREBASE_APP_ID', '1:1234567890:web:abcdef123456')
});

/**
 * Kiểm tra xem cấu hình Firebase đã được điền thông tin thật chưa
 * @returns {boolean}
 */
export const isFirebaseConfigured = () => {
  return (
    firebaseConfig.apiKey !== 'MOCK_API_KEY' &&
    firebaseConfig.apiKey !== 'YOUR_FIREBASE_API_KEY' &&
    Boolean(firebaseConfig.apiKey)
  );
};

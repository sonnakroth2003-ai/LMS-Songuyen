/**
 * @file auth.js
 * @description Quản lý đăng nhập, đăng xuất và phân quyền người dùng trong ứng dụng.
 */

import { 
  signInWithEmailAndPassword, 
  signOut as fbSignOut, 
  onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { auth, db } from './firebase-init.js';
import { ROLES, DB_COLLECTIONS, MESSAGES } from '../config/constants.js';

/**
 * State lưu trữ thông tin người dùng hiện tại trong bộ nhớ (Memory Cache)
 * @type {Object|null}
 */
let currentUserProfile = null;

/**
 * Đăng nhập người dùng bằng Email và Mật khẩu
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<Object>} Dữ liệu profile người dùng từ Firestore
 */
export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const profile = await fetchUserProfile(user.uid);
    if (!profile) {
      throw new Error('Không tìm thấy thông tin tài khoản trên hệ thống database.');
    }

    currentUserProfile = {
      uid: user.uid,
      email: user.email,
      ...profile
    };

    return currentUserProfile;
  } catch (error) {
    console.error('[Auth Service] Login error:', error);
    throw new Error(MESSAGES?.AUTH?.LOGIN_FAILED || 'Đăng nhập thất bại.');
  }
};

/**
 * Đăng xuất người dùng khỏi hệ thống (Export tên logoutUser để tương thích với app.js)
 * @returns {Promise<void>}
 */
export const logoutUser = async () => {
  try {
    await fbSignOut(auth);
    currentUserProfile = null;
  } catch (error) {
    console.error('[Auth Service] Logout error:', error);
    throw error;
  }
};

// Giữ lại alias logout để phòng các file khác gọi
export const logout = logoutUser;

/**
 * Lấy thông tin hồ sơ chi tiết người dùng từ Firestore
 * @param {string} uid - Firebase Auth User ID
 * @returns {Promise<Object|null>}
 */
export const fetchUserProfile = async (uid) => {
  try {
    const userDocRef = doc(db, DB_COLLECTIONS.USERS, uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      return userDocSnap.data();
    }
    return null;
  } catch (error) {
    console.error('[Auth Service] Fetch profile error:', error);
    return null;
  }
};

/**
 * Lấy thông tin người dùng đang đăng nhập trong Cache
 * @returns {Object|null}
 */
export const getCurrentUser = () => {
  return currentUserProfile;
};

/**
 * Kiểm tra xem người dùng hiện tại có phải Giáo viên không
 * @returns {boolean}
 */
export const isTeacher = () => {
  return currentUserProfile?.role === ROLES.TEACHER;
};

/**
 * Kiểm tra xem người dùng hiện tại có phải Học sinh không
 * @returns {boolean}
 */
export const isStudent = () => {
  return currentUserProfile?.role === ROLES.STUDENT;
};

/**
 * Lắng nghe sự thay đổi trạng thái xác thực từ Firebase Auth (Export tên onAuthStateChangedListener cho app.js)
 * @param {Function} callback - Hàm thực thi sau khi khôi phục xong trạng thái Auth
 */
export const onAuthStateChangedListener = (callback) => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      if (!currentUserProfile || currentUserProfile.uid !== user.uid) {
        const profile = await fetchUserProfile(user.uid);
        if (profile) {
          currentUserProfile = {
            uid: user.uid,
            email: user.email,
            ...profile
          };
        } else {
          currentUserProfile = null;
        }
      }
    } else {
      currentUserProfile = null;
    }

    if (typeof callback === 'function') {
      callback(currentUserProfile);
    }
  });
};

// Giữ lại alias initAuthObserver
export const initAuthObserver = onAuthStateChangedListener;

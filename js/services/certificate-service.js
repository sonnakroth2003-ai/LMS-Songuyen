/**
 * @file certificate-service.js
 * @description Dịch vụ quản lý chứng nhận học tập.
 */

import { doc, getDoc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { db } from '../core/firebase-init.js';
import { DB_COLLECTIONS } from '../config/constants.js';

/**
 * Lấy chứng nhận của học sinh (nếu đã có)
 */
export const getCertificateByStudentId = async (studentId) => {
  const certRef = doc(db, DB_COLLECTIONS.CERTIFICATES, studentId);
  const certSnap = await getDoc(certRef);
  return certSnap.exists() ? certSnap.data() : null;
};

/**
 * Hàm này thay thế cho generateCertificateForStudent để khớp với file certificate-page.js
 */
export const generateCertificateForStudent = async (studentId, studentInfo) => {
  try {
    const certRef = doc(db, DB_COLLECTIONS.CERTIFICATES, studentId);
    
    // Tạo dữ liệu chứng nhận mới
    const newCertificate = {
      studentId,
      studentName: studentInfo.studentName,
      studentCode: studentInfo.studentCode,
      courseName: 'Toán học Lớp 6',
      issueDate: new Date().toLocaleDateString('vi-VN'),
      certificateId: 'CERT-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      createdAt: serverTimestamp()
    };

    await setDoc(certRef, newCertificate);
    return newCertificate;
  } catch (error) {
    console.error('Lỗi khi tạo chứng nhận:', error);
    return null;
  }
};

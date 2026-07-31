import { getStudentProgress } from './progress-service.js';
import { isEligibleForCertificate } from './scoring-service.js';

/**
 * @file certificate-service.js
 * @description Dịch vụ quản lý chứng nhận học tập (Mock version cho LocalStorage).
 */

/**
 * Kiểm tra xem học sinh có đủ điều kiện nhận chứng nhận không
 */
export const checkEligibilityForCertificate = async (studentId) => {
  const progress = await getStudentProgress(studentId);
  if (!progress || !progress.islands) return false;

  const scores = Object.values(progress.islands).map(i => i.score || 0);
  const avg = scores.reduce((a, b) => a + b, 0) / (scores.length || 1);
  
  return isEligibleForCertificate(avg);
};

export const getCertificateByStudentId = async (studentId) => {
  try {
    const certData = localStorage.getItem(`dkt_cert_${studentId}`);
    return certData ? JSON.parse(certData) : null;
  } catch (error) {
    console.error('[CertificateService] Lỗi khi lấy chứng nhận:', error);
    return null;
  }
};

export const generateCertificateForStudent = async (studentId, studentInfo) => {
  try {
    // Kiểm tra điều kiện trước khi cấp chứng nhận
    const isEligible = await checkEligibilityForCertificate(studentId);
    if (!isEligible) {
      throw new Error('Học sinh chưa đủ điều kiện điểm trung bình để nhận chứng nhận.');
    }

    const newCertificate = {
      studentId,
      studentName: studentInfo.studentName || 'Học sinh',
      studentCode: studentInfo.studentCode || 'N/A',
      courseName: 'Toán học Lớp 6',
      issueDate: new Date().toLocaleDateString('vi-VN'),
      certificateId: 'CERT-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      createdAt: new Date().toISOString()
    };

    localStorage.setItem(`dkt_cert_${studentId}`, JSON.stringify(newCertificate));
    return newCertificate;
  } catch (error) {
    console.error('[CertificateService] Lỗi khi tạo chứng nhận:', error);
    throw error; // Ném lỗi để UI hiển thị thông báo cho học sinh
  }
};

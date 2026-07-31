/**
 * @file certificate-service.js
 * @description Dịch vụ quản lý chứng nhận học tập (Mock version cho LocalStorage).
 */

/**
 * Lấy chứng nhận của học sinh từ LocalStorage
 */
export const getCertificateByStudentId = async (studentId) => {
  try {
    const certData = localStorage.getItem(`dkt_cert_${studentId}`);
    return certData ? JSON.parse(certData) : null;
  } catch (error) {
    console.error('[CertificateService] Lỗi khi lấy chứng nhận:', error);
    return null;
  }
};

/**
 * Tạo chứng nhận cho học sinh và lưu vào LocalStorage
 */
export const generateCertificateForStudent = async (studentId, studentInfo) => {
  try {
    // Tạo dữ liệu chứng nhận giả lập
    const newCertificate = {
      studentId,
      studentName: studentInfo.studentName || 'Học sinh',
      studentCode: studentInfo.studentCode || 'N/A',
      courseName: 'Toán học Lớp 6',
      issueDate: new Date().toLocaleDateString('vi-VN'),
      certificateId: 'CERT-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      createdAt: new Date().toISOString()
    };

    // Lưu vào LocalStorage thay vì Firestore
    localStorage.setItem(`dkt_cert_${studentId}`, JSON.stringify(newCertificate));
    
    return newCertificate;
  } catch (error) {
    console.error('[CertificateService] Lỗi khi tạo chứng nhận:', error);
    return null;
  }
};

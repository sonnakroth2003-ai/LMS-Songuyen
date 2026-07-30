/**
 * @file certificate-service.js
 * @description Dịch vụ kiểm tra điều kiện, cấp và xuất giấy chứng nhận PDF cho học sinh.
 */

// Đã cập nhật đường dẫn import sang CDN chuẩn của Firebase
import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

import { db } from '../core/firebase-init.js';
import { DB_COLLECTIONS, MESSAGES } from '../config/constants.js';
import { 
  calculateAverageScore, 
  getAcademicRank, 
  isEligibleForCertificate 
} from './scoring-service.js';

/**
 * Kiểm tra học sinh có đủ điều kiện và lấy dữ liệu chứng nhận từ Firestore
 * @param {string} studentId - UID học sinh
 * @returns {Promise<{eligible: boolean, certificateData: Object|null, reason?: string}>}
 */
export const checkAndGetCertificate = async (studentId) => {
  try {
    if (!studentId) throw new Error('Student ID không hợp lệ.');

    // 1. Kiểm tra xem đã có bản ghi chứng nhận trên Firestore chưa
    const certRef = doc(db, DB_COLLECTIONS.CERTIFICATES, studentId);
    const certSnap = await getDoc(certRef);

    if (certSnap.exists()) {
      return {
        eligible: true,
        certificateData: certSnap.data()
      };
    }

    // 2. Lấy thông tin tài khoản học sinh
    const userRef = doc(db, DB_COLLECTIONS.USERS, studentId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) throw new Error('Không tìm thấy thông tin học sinh.');
    const studentData = userSnap.data();

    // 3. Lấy tiến độ học tập để tính Điểm Trung Bình
    const progressRef = doc(db, DB_COLLECTIONS.STUDENT_PROGRESS, studentId);
    const progressSnap = await getDoc(progressRef);
    if (!progressSnap.exists()) {
      return { eligible: false, certificateData: null, reason: MESSAGES.CERTIFICATE.NOT_ELIGIBLE };
    }

    const progressData = progressSnap.data();
    const islands = progressData.islands || {};
    
    // Thu thập điểm các đảo đã làm
    const islandScores = Object.values(islands).map(i => i.score || 0);
    const averageScore = calculateAverageScore(islandScores);

    // 4. Đánh giá điều kiện cấp chứng nhận (ĐTB >= 6.5)
    if (!isEligibleForCertificate(averageScore)) {
      return {
        eligible: false,
        certificateData: null,
        reason: MESSAGES.CERTIFICATE.NOT_ELIGIBLE
      };
    }

    // 5. Khởi tạo dữ liệu chứng nhận mới và lưu vào Firestore
    const rank = getAcademicRank(averageScore);
    const issueDate = new Date().toLocaleDateString('vi-VN');
    const certificateId = `CERT-MATH6-${Date.now().toString().slice(-6)}`;

    const newCertificate = {
      certificateId,
      studentId,
      studentName: studentData.fullName || 'Học sinh',
      className: studentData.className || 'Toán 6',
      averageScore,
      rankLabel: rank.label,
      issueDate,
      createdAt: serverTimestamp()
    };

    await setDoc(certRef, newCertificate);

    return {
      eligible: true,
      certificateData: newCertificate
    };
  } catch (error) {
    console.error('[Certificate Service] Lỗi khi kiểm tra/cấp chứng nhận:', error);
    throw error;
  }
};

/**
 * Render cấu trúc HTML mẫu giấy chứng nhận (Certificate Template)
 * @param {Object} cert - Đối tượng chứa thông tin chứng nhận
 * @returns {string} Chuỗi HTML khung chứng nhận
 */
export const renderCertificateHTML = (cert) => {
  if (!cert) return '<div class="error-msg">Không có dữ liệu chứng nhận</div>';

  return `
    <div id="certificate-template" class="certificate-container">
      <div class="certificate-border">
        <div class="certificate-inner">
          <div class="certificate-header">
            <div class="badge-icon">🎓</div>
            <h1 class="cert-title">GIẤY CHỨNG NHẬN HOÀN THÀNH KHÓA HỌC</h1>
            <p class="cert-subtitle">Chương Trình Toán THCS - Chương 3: Số Nguyên</p>
          </div>

          <div class="certificate-body">
            <p class="cert-text">Chứng nhận em:</p>
            <h2 class="student-name">${cert.studentName}</h2>
            <p class="student-class">Lớp: <strong>${cert.className}</strong></p>
            
            <p class="cert-description">
              Đã hoàn thành xuất sắc các nội dung học tập và bài kiểm tra đánh giá năng lực thuộc chương trình học trực tuyến.
            </p>

            <div class="cert-results">
              <div class="result-item">
                <span class="label">Điểm trung bình:</span>
                <span class="value highlight">${cert.averageScore} / 10</span>
              </div>
              <div class="result-item">
                <span class="label">Xếp loại học lực:</span>
                <span class="value rank-badge">${cert.rankLabel}</span>
              </div>
            </div>
          </div>

          <div class="certificate-footer">
            <div class="cert-info">
              <p>Mã số: <strong>${cert.certificateId}</strong></p>
              <p>Ngày cấp: <sup>${cert.issueDate}</sup></p>
            </div>
            <div class="cert-signature">
              <p class="sig-title">XÁC NHẬN CỦA HỆ THỐNG LMS</p>
              <div class="sig-stamp">ĐÃ KÝ SOẠN</div>
              <p class="sig-name">Ban Quản Lý Chương Trình</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
};

/**
 * Xuất file Giấy chứng nhận ra định dạng PDF bằng html2pdf.js
 * @param {string} elementId - ID của phần tử DOM chứa khung giấy chứng nhận (mặc định: 'certificate-template')
 * @param {string} fileName - Tên file PDF xuất ra
 * @returns {Promise<void>}
 */
export const downloadCertificatePDF = async (elementId = 'certificate-template', fileName = 'Giay_Chung_Nhan_LMS.pdf') => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Không tìm thấy khung chứng nhận với ID #${elementId}`);
    }

    if (typeof window.html2pdf === 'undefined') {
      throw new Error('Thư viện html2pdf.js chưa sẵn sàng.');
    }

    // Cấu hình tham số cho html2pdf
    const options = {
      margin: [10, 10, 10, 10],
      filename: fileName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    // Thực thi tạo PDF và tải về
    await window.html2pdf().set(options).from(element).save();
  } catch (error) {
    console.error('[Certificate Service] Lỗi khi xuất PDF chứng nhận:', error);
    throw error;
  }
};
```eof

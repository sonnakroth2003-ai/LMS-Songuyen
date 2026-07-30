/**
 * @file certificate-page.js
 * @description Trang hiển thị và xuất Chứng nhận Hoàn thành khóa học dành cho học sinh.
 */

import { store } from '../core/store.js';
import { getCertificateByStudentId, generateCertificateForStudent } from '../services/certificate-service.js';
import { exportCertificateToPDF } from '../utils/pdf-generator.js';
import { formatDate } from '../utils/formatters.js';

/**
 * Render HTML cho trang Chứng nhận
 * @param {Object} certData - Dữ liệu chứng nhận
 * @returns {string} Chuỗi HTML
 */
const renderCertificateContentHTML = (certData) => {
  const { studentName, studentCode, issueDate, certificateId, courseName } = certData;

  return `
    <div class="certificate-page-container">
      <!-- Toolbar thao tác -->
      <div class="certificate-toolbar d-print-none mb-4 text-center">
        <button id="btn-back-dashboard" class="btn btn-outline-secondary mr-2">
          ⬅️ Quay lại trang chủ
        </button>
        <button id="btn-print-cert" class="btn btn-primary mr-2">
          🖨️ In Chứng nhận
        </button>
        <button id="btn-download-pdf" class="btn btn-success">
          📥 Tải file PDF
        </button>
      </div>

      <!-- Khung bằng chứng nhận (Dùng để hiển thị & In) -->
      <div id="certificate-paper" class="certificate-paper">
        <div class="certificate-border">
          <div class="certificate-inner-border">
            
            <div class="certificate-header text-center">
              <div class="certificate-badge">🎓</div>
              <h1 class="certificate-title">GIẤY CHỨNG NHẬN HOÀN THÀNH</h1>
              <p class="certificate-subtitle">KHÓA HỌC TOÁN 6 - HÀNH TRÌNH KHÁM PHÁ CÁC ĐẢO TRI THỨC</p>
            </div>

            <div class="certificate-body text-center my-4">
              <p class="certify-text">Trân trọng trao tặng cho học sinh:</p>
              <h2 class="student-name">${studentName}</h2>
              <p class="student-code">Mã số học sinh: <strong>${studentCode}</strong></p>

              <p class="achievement-desc mt-4">
                Đã xuất sắc hoàn thành toàn bộ bài tập và thử thách tại tất cả các Đảo Tri Thức<br>
                thuộc chương trình <strong>${courseName || 'Toán học Lớp 6'}</strong>.
              </p>
            </div>

            <div class="certificate-footer row align-items-end mt-5">
              <div class="col-6 text-left">
                <p class="cert-meta">Ngày cấp: <span>${formatDate(issueDate)}</span></p>
                <p class="cert-meta">Mã tra cứu: <span class="cert-id">${certificateId}</span></p>
              </div>
              <div class="col-6 text-center">
                <p class="signature-title"><strong>BAN QUẢN LÝ KHÓA HỌC</strong></p>
                <div class="signature-space"></div>
                <p class="signature-name"><em>(Đã xác thực điện tử)</em></p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  `;
};

/**
 * Render giao diện khi học sinh chưa đủ điều kiện nhận bằng
 * @returns {string} Chuỗi HTML thông báo
 */
const renderNotEligibleHTML = () => {
  return `
    <div class="container text-center py-5">
      <div class="card p-5 shadow-sm border-warning mx-auto" style="max-width: 600px;">
        <div class="display-1 text-warning mb-3">🔒</div>
        <h3 class="mb-3">Bạn chưa hoàn thành khóa học!</h3>
        <p class="text-muted mb-4">
          Để nhận Giấy chứng nhận, bạn cần vượt qua bài kiểm tra ở tất cả các Đảo Tri Thức với số điểm đạt quy định.
        </p>
        <div>
          <button id="btn-back-dashboard" class="btn btn-primary px-4">
            🚀 Quay lại tiếp tục học
          </button>
        </div>
      </div>
    </div>
  `;
};

/**
 * Hàm khởi tạo và render chính của trang Certificate Page
 * @param {HTMLElement} container - DOM Container cần render
 */
export const renderCertificatePage = async (container) => {
  if (!container) return;

  container.innerHTML = `
    <div class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-2 text-muted">Đang kiểm tra thông tin chứng nhận...</p>
    </div>
  `;

  const state = store.getState();
  const currentUser = state.currentUser;

  if (!currentUser) {
    window.location.hash = '#/login';
    return;
  }

  try {
    // 1. Thử lấy chứng nhận đã có
    let certData = await getCertificateByStudentId(currentUser.uid);

    // 2. Nếu chưa có, thử khởi tạo nếu đủ điều kiện
    if (!certData) {
      certData = await generateCertificateForStudent(currentUser.uid, {
        studentName: currentUser.fullName || currentUser.username,
        studentCode: currentUser.code || currentUser.uid
      });
    }

    // 3. Kiểm tra nếu vẫn không có (do chưa đủ điều kiện)
    if (!certData) {
      container.innerHTML = renderNotEligibleHTML();
      setupNotEligibleEvents(container);
      return;
    }

    // 4. Render chứng nhận hoàn chỉnh
    container.innerHTML = renderCertificateContentHTML(certData);
    setupCertificateEvents(container, certData);

  } catch (error) {
    console.error('Lỗi khi tải trang chứng nhận:', error);
    container.innerHTML = `
      <div class="alert alert-danger text-center my-4">
        Không thể tải thông tin chứng nhận. Vui lòng thử lại sau!
      </div>
    `;
  }
};

/**
 * Gắn sự kiện cho trang khi không đủ điều kiện
 */
const setupNotEligibleEvents = (container) => {
  const backBtn = container.querySelector('#btn-back-dashboard');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.hash = '#/student-dashboard';
    });
  }
};

/**
 * Gắn các sự kiện tương tác trên trang Chứng nhận (In, Tải PDF, Quay lại)
 * @param {HTMLElement} container 
 * @param {Object} certData 
 */
const setupCertificateEvents = (container, certData) => {
  // Nút quay lại Dashboard
  const backBtn = container.querySelector('#btn-back-dashboard');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.hash = '#/student-dashboard';
    });
  }

  // Nút In chứng nhận
  const printBtn = container.querySelector('#btn-print-cert');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // Nút Tải file PDF
  const downloadBtn = container.querySelector('#btn-download-pdf');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', async () => {
      const paperEl = container.querySelector('#certificate-paper');
      if (!paperEl) return;

      try {
        downloadBtn.disabled = true;
        downloadBtn.innerHTML = '⏳ Đang tạo PDF...';
        await exportCertificateToPDF(paperEl, `Chung_Nhan_${certData.studentCode || 'Toan6'}.pdf`);
      } catch (err) {
        console.error('Lỗi xuất PDF:', err);
        alert('Có lỗi xảy ra khi tạo file PDF. Bạn có thể sử dụng tính năng In (Print) để lưu dạng PDF!');
      } finally {
        downloadBtn.disabled = false;
        downloadBtn.innerHTML = '📥 Tải file PDF';
      }
    });
  }
};

/**
 * @file pdf-generator.js
 * @description Utility hỗ trợ xuất phần tử HTML (Giấy chứng nhận) ra file PDF hoặc In trực tiếp.
 */

import { formatCapitalizeName } from './formatters.js';

/**
 * Xuất khung HTML Giấy chứng nhận ra file PDF
 * @param {HTMLElement|string} elementTarget - DOM Element hoặc Selector chứa khung chứng nhận
 * @param {Object} options - Cấu hình tên học sinh và tên file
 * @returns {Promise<boolean>} Trạng thái thành công
 */
export const exportCertificateToPDF = async (elementTarget, options = {}) => {
  const element = typeof elementTarget === 'string'
    ? document.querySelector(elementTarget)
    : elementTarget;

  if (!element) {
    console.error('[PDFGenerator] Không tìm thấy phần tử HTML Giấy chứng nhận.');
    alert('Không tìm thấy khung Giấy chứng nhận để xuất PDF!');
    return false;
  }

  const rawName = options.studentName || 'Hoc_Sinh';
  const cleanName = formatCapitalizeName(rawName).replace(/\s+/g, '_');
  const fileName = options.filename || `Giay_Chung_Nhan_${cleanName}.pdf`;

  // 1. Kiểm tra nếu có thư viện html2pdf.js trên window
  if (typeof window !== 'undefined' && window.html2pdf) {
    try {
      const pdfOptions = {
        margin:       0,
        filename:     fileName,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' } // Khổ A4 nằm ngang
      };

      // Thực hiện chuyển đổi và tải file
      await window.html2pdf().set(pdfOptions).from(element).save();
      console.log(`[PDFGenerator] Xuất thành công PDF: ${fileName}`);
      return true;
    } catch (error) {
      console.error('[PDFGenerator] Lỗi khi tạo PDF bằng html2pdf.js:', error);
    }
  }

  // 2. Fallback: Nếu không tìm thấy html2pdf.js, dùng lệnh Print gốc của trình duyệt
  console.warn('[PDFGenerator] Thư viện html2pdf chưa sẵn sàng. Đang kích hoạt chế độ In (Print Fallback).');
  return printElementDirectly(element);
};

/**
 * Phương thức Fallback: Mở giao diện In chuẩn của trình duyệt (Lưu dưới dạng PDF)
 * @param {HTMLElement} element - Phần tử cần in
 */
export const printElementDirectly = (element) => {
  if (!element) return false;

  try {
    // Thêm class tạm thời để tối ưu CSS khi in
    document.body.classList.add('printing-certificate-mode');

    // Gọi lệnh in gốc
    window.print();

    // Dọn dẹp sau khi đóng cửa sổ in
    setTimeout(() => {
      document.body.classList.remove('printing-certificate-mode');
    }, 1000);

    return true;
  } catch (err) {
    console.error('[PDFGenerator] Lỗi khi gọi lệnh in trình duyệt:', err);
    return false;
  }
};

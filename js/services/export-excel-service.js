import { MESSAGES } from '../config/constants.js';
import { calculateAverageScore, getAcademicRank } from './scoring-service.js';

/**
 * @file export-excel-service.js
 * @description Dịch vụ hỗ trợ xuất dữ liệu tiến độ học tập của học sinh ra file Excel (.xlsx).
 */

/**
 * Xuất dữ liệu học sinh ra file Excel
 * @param {Array} studentsData - Dữ liệu thô từ TeacherService
 */
export const exportStudentsReportToExcel = async (studentsData) => {
  try {
    if (!studentsData || studentsData.length === 0) {
      throw new Error(MESSAGES.ERROR.NO_DATA_TO_EXPORT);
    }

    const exportData = studentsData.map((student) => {
      const islands = student.progress?.islands || {};
      const scores = Object.values(islands).map(i => i.score || 0);
      const avg = calculateAverageScore(scores);
      const rank = getAcademicRank(avg);

      return {
        'Mã học sinh': student.studentCode || 'N/A',
        'Họ và tên': student.fullName || 'Học sinh',
        'Điểm Đảo 1': islands.island_1?.score || 0,
        'Điểm Đảo 2': islands.island_2?.score || 0,
        'Điểm Đảo 3': islands.island_3?.score || 0,
        'Điểm Trung bình': avg,
        'Xếp loại': rank.label
      };
    });

    // Giả định thư viện XLSX đã được load qua script tag trong index.html
    if (typeof XLSX === 'undefined') {
      throw new Error("Thư viện SheetJS (XLSX) chưa được tải!");
    }

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Báo cáo Học tập");

    // Tạo tên file theo thời gian
    const fileName = `Bao_Cao_Hoc_Tap_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '_')}.xlsx`;
    
    XLSX.writeFile(workbook, fileName);
    return true;
  } catch (error) {
    console.error('[ExportExcelService] Lỗi khi xuất Excel:', error);
    throw error;
  }
};

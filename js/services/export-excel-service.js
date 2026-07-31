/**
 * @file export-excel-service.js
 * @description Dịch vụ xuất báo cáo điểm số (Bản Mock để chạy không cần Firebase).
 */

import { MESSAGES } from '../config/constants.js';
import { calculateAverageScore, getAcademicRank } from './scoring-service.js';

/**
 * Thu thập dữ liệu báo cáo (Mock data thay vì query Firestore)
 */
export const fetchClassReportData = async (classId) => {
  try {
    // Giả lập danh sách học sinh từ LocalStorage hoặc dữ liệu mẫu
    const mockStudents = [
      { id: 'student_dang_ngoc_son', fullName: 'Đặng Ngọc Sơn', studentCode: 'HS001', classId: '6A1' },
      { id: 'student_nguyen_van_a', fullName: 'Nguyễn Văn A', studentCode: 'HS002', classId: '6A1' }
    ];

    // Giả lập dữ liệu tiến độ từ LocalStorage
    const reportData = mockStudents.map((student, index) => {
      const progressRaw = localStorage.getItem(`dkt_progress_${student.id}`);
      const studentProgress = progressRaw ? JSON.parse(progressRaw) : { islands: {} };
      const islands = studentProgress.islands || {};

      const island1Score = islands.island_1?.score ?? 0;
      const island2Score = islands.island_2?.score ?? 0;
      const island3Score = islands.island_3?.score ?? 0;

      const avgScore = calculateAverageScore([island1Score, island2Score, island3Score]);
      const rank = getAcademicRank(avgScore);

      return {
        'STT': index + 1,
        'Mã Học Sinh': student.studentCode,
        'Họ và Tên': student.fullName,
        'Lớp': student.classId,
        'Đảo 1 (Điểm)': island1Score,
        'Đảo 2 (Điểm)': island2Score,
        'Đảo 3 (Điểm)': island3Score,
        'Điểm Trung Bình': avgScore,
        'Xếp Loại': rank.label
      };
    });

    return reportData;
  } catch (error) {
    console.error('[Export Excel Service] Lỗi khi tạo dữ liệu báo cáo:', error);
    return [];
  }
};

/**
 * Xuất dữ liệu báo cáo ra Excel
 */
export const exportClassReportToExcel = async (classId = 'ALL', customFileName = '') => {
  try {
    if (typeof window.XLSX === 'undefined') {
      throw new Error('Thư viện SheetJS (XLSX) chưa được tải.');
    }

    const reportData = await fetchClassReportData(classId);

    if (!reportData || reportData.length === 0) {
      throw new Error('Không có dữ liệu học sinh để xuất báo cáo.');
    }

    const worksheet = window.XLSX.utils.json_to_sheet(reportData);
    
    // Cấu hình cột
    worksheet['!cols'] = [
      { wch: 6 }, { wch: 15 }, { wch: 25 }, { wch: 10 }, 
      { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 14 }
    ];

    const workbook = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(workbook, worksheet, 'Bang_Diem_LMS');

    const finalFileName = customFileName || `Bao_Cao_Diem_LMS_${new Date().toISOString().slice(0, 10)}.xlsx`;
    window.XLSX.writeFile(workbook, finalFileName);
    
    console.log(MESSAGES.EXPORT.SUCCESS);
  } catch (error) {
    console.error('[Export Excel Service] Lỗi khi xuất file Excel:', error);
    alert(error.message); // Hiển thị cho người dùng biết
  }
};

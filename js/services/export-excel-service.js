import { MESSAGES, ISLANDS } from '../config/constants.js';
import { calculateAverageScore, getAcademicRank } from './scoring-service.js';

export const fetchClassReportData = async (classId) => {
  try {
    const mockStudents = [
      { id: 'student_dang_ngoc_son', fullName: 'Đặng Ngọc Sơn', studentCode: 'HS001', classId: '6A1' },
      { id: 'student_nguyen_van_a', fullName: 'Nguyễn Văn A', studentCode: 'HS002', classId: '6A1' }
    ];

    const reportData = mockStudents.map((student, index) => {
      const progressRaw = localStorage.getItem(`dkt_progress_${student.id}`);
      const studentProgress = progressRaw ? JSON.parse(progressRaw) : { islands: {} };
      const islands = studentProgress.islands || {};

      const islandKeys = Object.keys(ISLANDS || { ISLAND_1: 'island_1', ISLAND_2: 'island_2', ISLAND_3: 'island_3' });
      const scores = islandKeys.map(key => islands[key.toLowerCase()]?.score ?? 0);
      
      const avgScore = calculateAverageScore(scores);
      const rank = getAcademicRank(avgScore);

      return {
        'STT': index + 1,
        'Mã Học Sinh': student.studentCode,
        'Họ và Tên': student.fullName,
        'Lớp': student.classId,
        'Đảo 1': scores[0] || 0,
        'Đảo 2': scores[1] || 0,
        'Đảo 3': scores[2] || 0,
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
    
    worksheet['!cols'] = [
      { wch: 6 }, { wch: 15 }, { wch: 25 }, { wch: 10 }, 
      { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 16 }, { wch: 14 }
    ];

    const workbook = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(workbook, worksheet, 'Bang_Diem_LMS');

    const finalFileName = customFileName || `Bao_Cao_Diem_LMS_${new Date().toISOString().slice(0, 10)}.xlsx`;
    window.XLSX.writeFile(workbook, finalFileName);
    
    console.log(MESSAGES.EXPORT.SUCCESS);
  } catch (error) {
    console.error('[Export Excel Service] Lỗi khi xuất file Excel:', error);
    alert(error.message);
  }
};

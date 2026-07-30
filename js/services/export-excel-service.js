/**
 * @file export-excel-service.js
 * @description Dịch vụ xuất báo cáo điểm số và tiến độ học tập của học sinh ra file Excel (.xlsx).
 */

// Đã cập nhật đường dẫn import sang CDN chuẩn của Firebase
import { 
  collection, 
  getDocs, 
  query, 
  where 
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

import { db } from '../core/firebase-init.js';
import { DB_COLLECTIONS, MESSAGES, ROLES } from '../config/constants.js';
import { calculateAverageScore, getAcademicRank } from './scoring-service.js';

/**
 * Thu thập dữ liệu báo cáo học sinh của một lớp từ Firestore
 * @param {string} classId - Mã lớp học (e.g., '6A1', '6A2')
 * @returns {Promise<Array<Object>>} Danh sách dữ liệu học sinh đã chuẩn hóa
 */
export const fetchClassReportData = async (classId) => {
  try {
    // 1. Lấy danh sách học sinh thuộc lớp
    const usersRef = collection(db, DB_COLLECTIONS.USERS);
    let qUsers;
    
    if (classId && classId !== 'ALL') {
      qUsers = query(usersRef, where('role', '==', ROLES.STUDENT), where('classId', '==', classId));
    } else {
      qUsers = query(usersRef, where('role', '==', ROLES.STUDENT));
    }

    const usersSnap = await getDocs(qUsers);
    const students = [];
    usersSnap.forEach(docSnap => {
      students.push({ id: docSnap.id, ...docSnap.data() });
    });

    // 2. Lấy toàn bộ bản ghi tiến độ từ collection 'student_progress'
    const progressRef = collection(db, DB_COLLECTIONS.STUDENT_PROGRESS);
    const progressSnap = await getDocs(progressRef);
    const progressMap = new Map();
    
    progressSnap.forEach(docSnap => {
      progressMap.set(docSnap.id, docSnap.data());
    });

    // 3. Tổng hợp dữ liệu hiển thị cho báo cáo Excel
    const reportData = students.map((student, index) => {
      const studentProgress = progressMap.get(student.id) || { islands: {} };
      const islands = studentProgress.islands || {};

      const island1Score = islands.island_1?.score ?? 0;
      const island2Score = islands.island_2?.score ?? 0;
      const island3Score = islands.island_3?.score ?? 0;

      const avgScore = calculateAverageScore([island1Score, island2Score, island3Score]);
      const rank = getAcademicRank(avgScore);

      return {
        'STT': index + 1,
        'Mã Học Sinh': student.studentCode || student.id.slice(0, 8),
        'Họ và Tên': student.fullName || 'Chưa cập nhật',
        'Lớp': student.className || student.classId || '6A',
        'Đảo 1 (Điểm)': island1Score,
        'Đảo 2 (Điểm)': island2Score,
        'Đảo 3 (Điểm)': island3Score,
        'Điểm Trung Bình': avgScore,
        'Xếp Loại': rank.label
      };
    });

    return reportData;
  } catch (error) {
    console.error('[Export Excel Service] Lỗi khi lấy dữ liệu báo cáo:', error);
    throw error;
  }
};

/**
 * Xuất dữ liệu báo cáo điểm ra tệp tin Excel (.xlsx)
 * @param {string} classId - Mã lớp học
 * @param {string} customFileName - Tên file tùy chỉnh
 * @returns {Promise<void>}
 */
export const exportClassReportToExcel = async (classId = 'ALL', customFileName = '') => {
  try {
    if (typeof window.XLSX === 'undefined') {
      throw new Error('Thư viện SheetJS (XLSX) chưa được tải thành công.');
    }

    // 1. Thu thập dữ liệu báo cáo
    const reportData = await fetchClassReportData(classId);

    if (!reportData || reportData.length === 0) {
      throw new Error('Không có dữ liệu học sinh để xuất báo cáo.');
    }

    // 2. Tạo Sheet từ mảng đối tượng JSON
    const worksheet = window.XLSX.utils.json_to_sheet(reportData);

    // Cấu hình độ rộng các cột tự động
    const columnWidths = [
      { wch: 6 },  // STT
      { wch: 15 }, // Mã Học Sinh
      { wch: 25 }, // Họ và Tên
      { wch: 10 }, // Lớp
      { wch: 14 }, // Đảo 1
      { wch: 14 }, // Đảo 2
      { wch: 14 }, // Đảo 3
      { wch: 16 }, // Điểm Trung Bình
      { wch: 14 }  // Xếp Loại
    ];
    worksheet['!cols'] = columnWidths;

    // 3. Khởi tạo Workbook và thêm Worksheet vào
    const workbook = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(workbook, worksheet, 'Bang_Diem_LMS');

    // 4. Tạo tên file và tải về
    const defaultFileName = `Bao_Cao_Diem_LMS_Lop_${classId}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    const finalFileName = customFileName || defaultFileName;

    window.XLSX.writeFile(workbook, finalFileName);
    console.log(MESSAGES.EXPORT.SUCCESS);
  } catch (error) {
    console.error('[Export Excel Service] Lỗi khi xuất file Excel:', error);
    throw error;
  }
};
```eof

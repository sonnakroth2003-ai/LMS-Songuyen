/**
 * @file excel-generator.js
 * @description Utility hỗ trợ xuất báo cáo kết quả học tập lớp học ra file Excel (.xlsx / .csv).
 */

import { calculateAverageScore, getAcademicRank } from '../services/scoring-service.js';
import { ISLANDS } from '../config/constants.js';

/**
 * Chuẩn hóa dữ liệu danh sách học sinh thành mảng JSON bảng tính
 * @param {Array} studentsList - Danh sách học sinh từ teacher-service
 * @returns {Array<Object>} Mảng các dòng dữ liệu để xuất Excel
 */
const prepareExportData = (studentsList = []) => {
  const islandKeys = Object.keys(ISLANDS || {
    ISLAND_1: 'Đảo 1',
    ISLAND_2: 'Đảo 2',
    ISLAND_3: 'Đảo 3',
    ISLAND_4: 'Đảo 4',
    ISLAND_5: 'Đảo 5'
  });

  return studentsList.map((student, index) => {
    const islandsData = student.progress?.islands || student.progress || {};
    
    // Khởi tạo dòng dữ liệu cơ bản
    const row = {
      'STT': index + 1,
      'Mã Học Sinh': student.studentCode || student.uid || '---',
      'Họ và Tên': student.fullName || student.username || 'Học sinh'
    };

    const scores = [];
    let completedCount = 0;

    // Điền điểm số từng Đảo
    islandKeys.forEach((key, idx) => {
      const islandName = ISLANDS[key]?.name || `Đảo ${idx + 1}`;
      const islandInfo = islandsData[key];

      if (islandInfo?.isCompleted) {
        completedCount++;
      }

      if (typeof islandInfo?.score === 'number') {
        row[islandName] = islandInfo.score;
        scores.push(islandInfo.score);
      } else {
        row[islandName] = 'Chưa làm';
      }
    });

    // Tính điểm trung bình & Xếp loại
    const avgScore = calculateAverageScore ? calculateAverageScore(scores) : 0;
    const rank = getAcademicRank ? getAcademicRank(avgScore) : { label: 'Chưa xếp loại' };

    row['Số Đảo Hoàn Thành'] = `${completedCount}/${islandKeys.length}`;
    row['Điểm Trung Bình'] = typeof avgScore === 'number' ? avgScore : Number(avgScore) || 0;
    row['Xếp Loại'] = rank.label || 'Chưa xếp loại';
    row['Chứng Nhận'] = completedCount >= islandKeys.length ? 'Đủ điều kiện' : 'Chưa đủ điều kiện';

    return row;
  });
};

/**
 * Xuất dữ liệu ra file CSV chuẩn UTF-8 (mở không bị lỗi font Tiếng Việt trong Excel)
 * @param {Array<Object>} data - Dữ liệu phẳng dạng key-value
 * @param {string} filename - Tên file cần lưu
 */
export const exportToCSV = (studentsList = [], filename = 'Bao_Cao_Tien_Do_Lop_Hoc.csv') => {
  const data = prepareExportData(studentsList);
  if (!data || data.length === 0) {
    alert('Không có dữ liệu để xuất file!');
    return;
  }

  // Lấy danh sách tiêu đề cột từ object đầu tiên
  const headers = Object.keys(data[0]);
  const csvRows = [];

  // Thêm dòng tiêu đề
  csvRows.push(headers.map((h) => `"${h}"`).join(','));

  // Thêm các dòng dữ liệu
  data.forEach((row) => {
    const values = headers.map((header) => {
      const val = row[header] !== undefined ? row[header] : '';
      const escaped = ('' + val).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  });

  // Đính kèm UTF-8 BOM (\uFEFF) để Microsoft Excel hiển thị đúng font tiếng Việt
  const csvString = '\uFEFF' + csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

  // Tạo liên kết tải về
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Xuất dữ liệu ra file Excel (.xlsx) sử dụng thư viện SheetJS (nếu có window.XLSX)
 * @param {Array} studentsList - Danh sách học sinh
 * @param {string} filename - Tên file xuất (.xlsx)
 */
export const exportToExcel = (studentsList = [], filename = 'Bao_Cao_Tien_Do_Toan_6.xlsx') => {
  const data = prepareExportData(studentsList);

  if (!data || data.length === 0) {
    alert('Không có dữ liệu học sinh để xuất!');
    return;
  }

  // Kiểm tra nếu thư viện SheetJS (XLSX) đã tích hợp trong ứng dụng
  if (typeof window !== 'undefined' && window.XLSX) {
    try {
      const worksheet = window.XLSX.utils.json_to_sheet(data);
      const workbook = window.XLSX.utils.book_new();
      window.XLSX.utils.book_append_sheet(workbook, worksheet, 'Báo Cáo Tiến Độ');
      
      // Tự động căn độ rộng cột cơ bản
      const maxCols = Object.keys(data[0]).length;
      worksheet['!cols'] = Array(maxCols).fill({ wch: 18 });

      window.XLSX.writeFile(workbook, filename);
      console.log(`[ExcelGenerator] Xuất thành công file ${filename}`);
      return;
    } catch (err) {
      console.error('[ExcelGenerator] Lỗi khi tạo file XLSX với SheetJS:', err);
    }
  }

  // Fallback: Nếu chưa nạp SheetJS, tự động chuyển hướng xuất file CSV chuẩn Excel
  console.warn('[ExcelGenerator] Không tìm thấy thư viện SheetJS (window.XLSX). Đang fallback sang định dạng CSV UTF-8.');
  const csvFileName = filename.replace(/\.xlsx$/i, '.csv');
  exportToCSV(studentsList, csvFileName);
};

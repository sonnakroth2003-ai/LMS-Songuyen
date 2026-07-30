/**
 * @file student-table.js
 * @description Component quản lý Bảng danh sách học sinh và điểm số dành cho Giáo viên trong LMS Toán 6.
 */

import { ISLANDS, PASSING_SCORE } from '../config/constants.js';

/**
 * Tính điểm trung bình các đảo của một học sinh
 * @param {Object} scoresMap - Map chứa điểm các đảo (vd: { ISLAND_1: 9, ISLAND_2: 8 })
 * @returns {number} Điểm trung bình làm tròn 1 chữ số thập phân
 */
const calculateAverageScore = (scoresMap = {}) => {
  const islandKeys = Object.keys(ISLANDS);
  if (islandKeys.length === 0) return 0;

  let totalScore = 0;
  let count = 0;

  islandKeys.forEach((key) => {
    if (typeof scoresMap[key] === 'number') {
      totalScore += scoresMap[key];
      count += 1;
    }
  });

  return count > 0 ? Number((totalScore / islandKeys.length).toFixed(1)) : 0;
};

/**
 * Kiểm tra xem học sinh đã hoàn thành tất cả các đảo chưa
 * @param {Object} islandProgress - Tiến độ các đảo của học sinh
 * @returns {boolean}
 */
const isStudentCompletedAll = (islandProgress = {}) => {
  const islandKeys = Object.keys(ISLANDS);
  return islandKeys.every((key) => {
    const prog = islandProgress[key];
    return prog && prog.isCompleted && (prog.score || 0) >= PASSING_SCORE;
  });
};

/**
 * Render HTML cho Bảng danh sách học sinh
 * @param {Array<Object>} studentsList - Danh sách các học sinh
 * @returns {string} Chuỗi HTML hiển thị bảng
 */
export const renderStudentTableHTML = (studentsList = []) => {
  const islandKeys = Object.keys(ISLANDS);

  // Tạo header cột cho các Đảo
  const islandHeadersHTML = islandKeys
    .map((key) => `<th class="text-center" title="${ISLANDS[key].name}">${ISLANDS[key].shortName || key}</th>`)
    .join('');

  if (!studentsList || studentsList.length === 0) {
    return `
      <div class="table-responsive">
        <table class="table student-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Mã HS</th>
              <th>Họ và Tên</th>
              ${islandHeadersHTML}
              <th class="text-center">ĐTB</th>
              <th class="text-center">Trạng Thái</th>
              <th class="text-center">Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colspan="${6 + islandKeys.length}" class="text-center py-4 text-muted">
                📭 Chưa có dữ liệu học sinh nào.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  const rowsHTML = studentsList.map((student, index) => {
    const scores = student.scores || {};
    const progress = student.progress || {};
    const avgScore = calculateAverageScore(scores);
    const isCompletedAll = isStudentCompletedAll(progress);

    // Render điểm số từng đảo
    const islandScoresHTML = islandKeys.map((key) => {
      const score = scores[key];
      const isDone = progress[key]?.isCompleted;

      if (typeof score === 'number') {
        const scoreClass = score >= PASSING_SCORE ? 'score-pass' : 'score-fail';
        return `<td class="text-center ${scoreClass}">${score}</td>`;
      }
      return `<td class="text-center text-muted">${isDone ? '0' : '--'}</td>`;
    }).join('');

    // Badge trạng thái
    const statusBadgeHTML = isCompletedAll
      ? `<span class="badge badge-completed">🎓 Hoàn thành</span>`
      : `<span class="badge badge-active">📖 Đang học</span>`;

    return `
      <tr data-student-id="${student.id}">
        <td>${index + 1}</td>
        <td><strong>${student.code || student.id}</strong></td>
        <td>
          <div class="student-name-cell">
            <span class="student-avatar">${student.avatar || '👨‍🎓'}</span>
            <span class="student-fullname">${student.fullName || student.username}</span>
          </div>
        </td>
        ${islandScoresHTML}
        <td class="text-center font-weight-bold ${avgScore >= 5 ? 'text-success' : 'text-danger'}">
          ${avgScore}
        </td>
        <td class="text-center">${statusBadgeHTML}</td>
        <td class="text-center">
          <div class="btn-group-actions">
            <button class="btn btn-sm btn-outline-info btn-view-student" data-id="${student.id}" title="Xem chi tiết">
              👁️
            </button>
            <button class="btn btn-sm btn-outline-warning btn-reset-student" data-id="${student.id}" title="Đặt lại tiến độ">
              🔄
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  return `
    <div class="table-responsive">
      <table class="table student-table table-hover">
        <thead>
          <tr>
            <th style="width: 50px;">#</th>
            <th style="width: 100px;">Mã HS</th>
            <th>Họ và Tên</th>
            ${islandHeadersHTML}
            <th class="text-center" style="width: 80px;">ĐTB</th>
            <th class="text-center" style="width: 130px;">Trạng Thái</th>
            <th class="text-center" style="width: 110px;">Thao Tác</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHTML}
        </tbody>
      </table>
    </div>
  `;
};

/**
 * Lọc và sắp xếp danh sách học sinh theo từ khóa và bộ lọc
 * @param {Array<Object>} studentsList - Danh sách học sinh gốc
 * @param {Object} filterOptions - Cấu hình lọc { keyword, status, sortBy }
 * @returns {Array<Object>} Danh sách đã qua lọc/sắp xếp
 */
export const filterAndSortStudents = (studentsList = [], { keyword = '', status = 'ALL', sortBy = 'NAME_ASC' }) => {
  let result = [...studentsList];

  // 1. Tìm kiếm theo Từ khóa (Tên hoặc Mã HS)
  if (keyword.trim() !== '') {
    const term = keyword.toLowerCase().trim();
    result = result.filter((student) => {
      const nameMatch = (student.fullName || '').toLowerCase().includes(term);
      const codeMatch = (student.code || student.id || '').toLowerCase().includes(term);
      return nameMatch || codeMatch;
    });
  }

  // 2. Lọc theo trạng thái
  if (status === 'COMPLETED') {
    result = result.filter((s) => isStudentCompletedAll(s.progress));
  } else if (status === 'LEARNING') {
    result = result.filter((s) => !isStudentCompletedAll(s.progress));
  }

  // 3. Sắp xếp
  result.sort((a, b) => {
    if (sortBy === 'NAME_ASC') {
      return (a.fullName || '').localeCompare(b.fullName || '', 'vi');
    }
    if (sortBy === 'NAME_DESC') {
      return (b.fullName || '').localeCompare(a.fullName || '', 'vi');
    }
    if (sortBy === 'SCORE_DESC') {
      return calculateAverageScore(b.scores) - calculateAverageScore(a.scores);
    }
    if (sortBy === 'SCORE_ASC') {
      return calculateAverageScore(a.scores) - calculateAverageScore(b.scores);
    }
    return 0;
  });

  return result;
};

/**
 * Lắng nghe các sự kiện bấm nút Thao tác trong bảng
 * @param {HTMLElement|string} tableContainer - Container chứa bảng
 * @param {Object} callbacks - { onViewDetail(studentId), onResetProgress(studentId) }
 */
export const setupStudentTableEvents = (tableContainer, { onViewDetail, onResetProgress }) => {
  const container = typeof tableContainer === 'string'
    ? document.querySelector(tableContainer)
    : tableContainer;

  if (!container) return;

  // Lắng nghe sự kiện click bằng Event Delegation
  container.addEventListener('click', (e) => {
    const viewBtn = e.target.closest('.btn-view-student');
    if (viewBtn) {
      const studentId = viewBtn.dataset.id;
      if (typeof onViewDetail === 'function') onViewDetail(studentId);
      return;
    }

    const resetBtn = e.target.closest('.btn-reset-student');
    if (resetBtn) {
      const studentId = resetBtn.dataset.id;
      if (typeof onResetProgress === 'function') onResetProgress(studentId);
    }
  });
};

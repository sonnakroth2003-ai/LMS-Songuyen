/**
 * @file teacher-dashboard-page.js
 * @description Trang Bảng điều khiển dành cho Giáo viên (Thống kê tiến độ & Quản lý học sinh).
 */

import { store } from '../core/store.js';
import { getAllStudentsProgress } from '../services/teacher-service.js';
import { calculateAverageScore, getAcademicRank } from '../services/scoring-service.js';
import { ISLANDS } from '../config/constants.js';

/**
 * Render HTML giao diện Bảng điều khiển Giáo viên
 * @param {Object} teacherUser - Thông tin giáo viên
 * @param {Array} studentsList - Danh sách học sinh kèm tiến độ
 * @returns {string} Chuỗi HTML
 */
export const renderTeacherDashboardHTML = (teacherUser, studentsList = []) => {
  const totalStudents = studentsList.length;
  const totalIslands = Object.keys(ISLANDS).length || 5;

  // Tính toán thống kê chung toàn lớp
  let completedAllCount = 0;
  let totalScoreSum = 0;
  let scoredStudentCount = 0;

  studentsList.forEach((st) => {
    const islandsData = st.progress?.islands || st.progress || {};
    const completedCount = Object.keys(islandsData).filter((k) => islandsData[k]?.isCompleted).length;
    if (completedCount >= totalIslands) completedAllCount++;

    const scores = Object.values(islandsData)
      .map((item) => item?.score)
      .filter((s) => typeof s === 'number');

    if (scores.length > 0) {
      const studentAvg = calculateAverageScore ? calculateAverageScore(scores) : 0;
      totalScoreSum += Number(studentAvg);
      scoredStudentCount++;
    }
  });

  const classAvgScore = scoredStudentCount > 0 ? (totalScoreSum / scoredStudentCount).toFixed(1) : '--';
  const completionRate = totalStudents > 0 ? Math.round((completedAllCount / totalStudents) * 100) : 0;

  // Render danh sách hàng trong bảng học sinh
  const tableRowsHTML = studentsList.map((student, index) => {
    const islandsData = student.progress?.islands || student.progress || {};
    const completedCount = Object.keys(islandsData).filter((k) => islandsData[k]?.isCompleted).length;

    const scores = Object.values(islandsData)
      .map((item) => item?.score)
      .filter((s) => typeof s === 'number');

    const avgScore = calculateAverageScore ? calculateAverageScore(scores) : '--';
    const rank = getAcademicRank ? getAcademicRank(avgScore) : { label: 'Chưa xếp loại' };

    const isEligibleCert = completedCount >= totalIslands;

    return `
      <tr>
        <td class="text-center font-monospace">${index + 1}</td>
        <td>
          <div class="fw-bold">${student.fullName || student.username || 'Học sinh'}</div>
          <small class="text-muted">Mã HS: ${student.studentCode || student.uid || '---'}</small>
        </td>
        <td class="text-center">
          <span class="badge ${completedCount === totalIslands ? 'bg-success' : 'bg-primary'}">
            ${completedCount}/${totalIslands} Đảo
          </span>
        </td>
        <td class="text-center fw-bold text-primary">
          ${avgScore}
        </td>
        <td class="text-center">
          <span class="badge bg-light text-dark border">${rank.label || 'Chưa xếp loại'}</span>
        </td>
        <td class="text-center">
          ${
            isEligibleCert
              ? `<span class="badge bg-success-subtle text-success border border-success">🎓 Đủ điều kiện</span>`
              : `<span class="badge bg-secondary-subtle text-secondary">⏳ Đang học</span>`
          }
        </td>
        <td class="text-center">
          <button class="btn btn-sm btn-outline-primary btn-view-detail" data-student-id="${student.uid}">
            👁️ Chi tiết
          </button>
        </td>
      </tr>
    `;
  }).join('');

  return `
    <div class="teacher-dashboard-page container py-4">
      <!-- Header Banner Giáo Viên -->
      <section class="card bg-dark text-white shadow-sm mb-4 border-0">
        <div class="card-body p-4">
          <div class="d-flex justify-content-between align-items-center flex-wrap">
            <div>
              <h2 class="fw-bold mb-1">Bảng Quản Lý Lớp Học 👋</h2>
              <p class="mb-0 opacity-75">Giáo viên: <strong>${teacherUser?.fullName || teacherUser?.username || 'Thầy/Cô'}</strong></p>
            </div>
            <div class="mt-3 mt-md-0">
              <span class="badge bg-info fs-6 px-3 py-2">Khóa học: Toán 6 - Đảo Tri Thức</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Các thẻ Thống Kê Nhanh -->
      <section class="row g-3 mb-4">
        <div class="col-12 col-sm-6 col-lg-4">
          <div class="card border-0 shadow-sm p-3 border-start border-4 border-primary">
            <div class="text-muted small fw-semibold">TỔNG SỐ HỌC SINH</div>
            <div class="fs-2 fw-bold text-dark mt-1">${totalStudents} <span class="fs-6 fw-normal text-muted">học sinh</span></div>
          </div>
        </div>
        <div class="col-12 col-sm-6 col-lg-4">
          <div class="card border-0 shadow-sm p-3 border-start border-4 border-success">
            <div class="text-muted small fw-semibold">ĐIỂM TRUNG BÌNH LỚP</div>
            <div class="fs-2 fw-bold text-success mt-1">${classAvgScore} <span class="fs-6 fw-normal text-muted">/ 10</span></div>
          </div>
        </div>
        <div class="col-12 col-sm-6 col-lg-4">
          <div class="card border-0 shadow-sm p-3 border-start border-4 border-warning">
            <div class="text-muted small fw-semibold">TỶ LỆ HOÀN THÀNH KHÓA HỌC</div>
            <div class="fs-2 fw-bold text-warning mt-1">${completionRate}% <span class="fs-6 fw-normal text-muted">(${completedAllCount} HS)</span></div>
          </div>
        </div>
      </section>

      <!-- Danh Sách Học Sinh -->
      <section class="card border-0 shadow-sm">
        <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h5 class="fw-bold mb-0">📋 Tiến Độ Chi Tiết Học Sinh</h5>
          <div class="d-flex gap-2" style="max-width: 300px; width: 100%;">
            <input 
              type="text" 
              id="search-student-input" 
              class="form-control form-control-sm" 
              placeholder="🔍 Tìm theo tên hoặc mã HS..."
            >
          </div>
        </div>

        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0" id="students-table">
              <thead class="table-light">
                <tr>
                  <th class="text-center" style="width: 50px;">#</th>
                  <th>Học Sinh</th>
                  <th class="text-center">Số Đảo Đã Qua</th>
                  <th class="text-center">Điểm TB</th>
                  <th class="text-center">Xếp Loại</th>
                  <th class="text-center">Chứng Nhận</th>
                  <th class="text-center" style="width: 100px;">Thao Tác</th>
                </tr>
              </thead>
              <tbody id="students-table-body">
                ${studentsList.length > 0 ? tableRowsHTML : `<tr><td colspan="7" class="text-center py-4 text-muted">Chưa có dữ liệu học sinh.</td></tr>`}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  `;
};

/**
 * Gắn các sự kiện tương tác cho trang Quản Lý Giáo Viên
 * @param {HTMLElement} container 
 * @param {Array} originalStudentsList 
 */
export const setupTeacherDashboardEvents = (container, originalStudentsList = []) => {
  const searchInput = container.querySelector('#search-student-input');
  const tableBody = container.querySelector('#students-table-body');

  // Sự kiện tìm kiếm học sinh
  if (searchInput && tableBody) {
    searchInput.addEventListener('input', (e) => {
      const keyword = e.target.value.trim().toLowerCase();
      const filtered = originalStudentsList.filter((st) => {
        const nameMatch = (st.fullName || st.username || '').toLowerCase().includes(keyword);
        const codeMatch = (st.studentCode || st.uid || '').toLowerCase().includes(keyword);
        return nameMatch || codeMatch;
      });

      // Render lại danh sách đã lọc
      if (filtered.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">Không tìm thấy học sinh nào phù hợp.</td></tr>`;
      } else {
        const dummyTeacher = store.getState().currentUser;
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = renderTeacherDashboardHTML(dummyTeacher, filtered);
        const newRows = tempContainer.querySelector('#students-table-body').innerHTML;
        tableBody.innerHTML = newRows;
        attachDetailButtons(container);
      }
    });
  }

  attachDetailButtons(container);
};

/**
 * Gắn sự kiện click xem chi tiết cho các nút trong bảng
 */
const attachDetailButtons = (container) => {
  const detailBtns = container.querySelectorAll('.btn-view-detail');
  detailBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const studentId = e.currentTarget.dataset.studentId;
      if (studentId) {
        alert(`Tính năng xem chi tiết học sinh ID: ${studentId} đang được phát triển!`);
      }
    });
  });
};

/**
 * Hàm khởi tạo và render chính của trang Teacher Dashboard Page
 * @param {HTMLElement} container - DOM Container
 */
export const renderTeacherDashboardPage = async (container) => {
  if (!container) return;

  const state = store.getState();
  const currentUser = state.currentUser;

  // 1. Kiểm tra đăng nhập
  if (!currentUser) {
    window.location.hash = '#/login';
    return;
  }

  // 2. Kiểm tra quyền Giáo Viên
  if (currentUser.role !== 'teacher') {
    container.innerHTML = `
      <div class="container text-center py-5">
        <div class="alert alert-warning shadow-sm" role="alert">
          🚫 Trang này chỉ dành cho tài khoản Giáo viên. 
        </div>
        <button class="btn btn-primary mt-2" onclick="window.location.hash='#/student-dashboard'">
          Quay lại Bảng điều khiển Học sinh
        </button>
      </div>
    `;
    return;
  }

  // Hiển thị trạng thái đang tải
  container.innerHTML = `
    <div class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-2 text-muted">Đang tải danh sách học sinh và tiến độ lớp học...</p>
    </div>
  `;

  try {
    // Tải danh sách học sinh & tiến độ từ Firestore / Service
    const studentsList = await getAllStudentsProgress();

    // Render HTML & Gắn event
    container.innerHTML = renderTeacherDashboardHTML(currentUser, studentsList);
    setupTeacherDashboardEvents(container, studentsList);

  } catch (error) {
    console.error('[Teacher Dashboard] Lỗi tải dữ liệu lớp học:', error);
    container.innerHTML = `
      <div class="container text-center py-5">
        <div class="alert alert-danger shadow-sm" role="alert">
          ⚠️ Không thể tải dữ liệu danh sách học sinh. Vui lòng thử lại sau!
        </div>
        <button class="btn btn-secondary mt-2" onclick="window.location.reload()">Thử lại</button>
      </div>
    `;
  }
};

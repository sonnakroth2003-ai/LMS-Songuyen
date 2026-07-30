/**
 * @file student-dashboard-page.js
 * @description Quản lý giao diện Bảng điều khiển Học sinh (Hiển thị các Đảo Tri Thức & Tiến độ).
 */

import { store } from '../core/store.js';
import { getStudentProgress } from '../services/progress-service.js';
import { calculateAverageScore, getAcademicRank } from '../services/scoring-service.js';
import { ISLANDS } from '../config/constants.js';

/**
 * Render cấu trúc HTML Bảng điều khiển học sinh
 * @param {Object} user - Dữ liệu học sinh
 * @param {Object} progress - Dữ liệu tiến độ học tập từ Firestore
 * @returns {string} Chuỗi HTML
 */
export const renderStudentDashboardHTML = (user, progress) => {
  const islandsData = progress?.islands || progress || {};

  // Tính toán số đảo đã hoàn thành và điểm trung bình
  const islandKeys = Object.keys(ISLANDS);
  let completedCount = 0;
  const scores = [];

  islandKeys.forEach((key) => {
    const islandProgress = islandsData[key];
    if (islandProgress?.isCompleted) {
      completedCount++;
    }
    if (typeof islandProgress?.score === 'number') {
      scores.push(islandProgress.score);
    }
  });

  const completionPercent = islandKeys.length > 0 
    ? Math.round((completedCount / islandKeys.length) * 100) 
    : 0;
  const avgScore = calculateAverageScore ? calculateAverageScore(scores) : 0;
  const rank = getAcademicRank ? getAcademicRank(avgScore) : { label: 'Chưa xếp loại' };

  // Render thẻ danh sách các Đảo Tri Thức
  const islandCardsHTML = islandKeys.map((key, index) => {
    const config = ISLANDS[key] || { name: `Đảo ${index + 1}`, description: '' };
    const itemProgress = islandsData[key] || {};

    // Đảo 1 luôn mở. Đảo N mở khi đảo N-1 đã hoàn thành.
    const isPreviousCompleted = index === 0 || islandsData[islandKeys[index - 1]]?.isCompleted;
    const isUnlocked = isPreviousCompleted || itemProgress.isUnlocked;
    const isCompleted = itemProgress.isCompleted || false;
    const currentScore = itemProgress.score !== undefined ? `${itemProgress.score}` : '--';

    let statusBadge = `<span class="badge bg-secondary">🔒 Đã khóa</span>`;
    if (isCompleted) {
      statusBadge = `<span class="badge bg-success">✅ Hoàn thành</span>`;
    } else if (isUnlocked) {
      statusBadge = `<span class="badge bg-warning text-dark">🌟 Đang mở</span>`;
    }

    return `
      <div class="col-12 col-md-6 col-lg-4 mb-4">
        <div class="card h-100 shadow-sm island-card ${!isUnlocked ? 'border-secondary opacity-75' : ''} ${isCompleted ? 'border-success' : ''}">
          <div class="card-header bg-white d-flex justify-content-between align-items-center">
            <span class="fs-3">${config.icon || '🏝️'}</span>
            ${statusBadge}
          </div>
          <div class="card-body">
            <h5 class="card-title fw-bold">${config.name}</h5>
            <p class="card-text text-muted small">${config.description || ''}</p>
            <div class="d-flex justify-content-between align-items-center mt-3 pt-2 border-top small">
              <span>Điểm cao nhất:</span>
              <strong class="text-primary fs-6">${currentScore} / 10</strong>
            </div>
          </div>
          <div class="card-footer bg-transparent border-0 pb-3">
            ${
              isUnlocked
                ? `<button class="btn ${isCompleted ? 'btn-outline-primary' : 'btn-primary'} w-100 btn-start-quiz" data-island="${key}">
                    ${isCompleted ? '🔄 Ôn Tập Lại' : '🚀 Chinh Phục Đảo'}
                   </button>`
                : `<button class="btn btn-secondary w-100" disabled>🔒 Cần Hoàn Thành Đảo Trước</button>`
            }
          </div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="student-dashboard-page container py-4">
      <!-- Welcome Header Banner -->
      <section class="card bg-primary text-white shadow-sm mb-4 border-0">
        <div class="card-body p-4">
          <div class="row align-items-center">
            <div class="col-md-7 mb-3 mb-md-0">
              <h2 class="fw-bold mb-2">Xin chào, ${user?.fullName || user?.username || 'Học sinh'}! 👋</h2>
              <p class="mb-0 opacity-90">Hãy sẵn sàng khám phá các hòn đảo tri thức và thu thập chứng nhận nhé!</p>
            </div>
            <div class="col-md-5">
              <div class="row text-center g-2">
                <div class="col-4">
                  <div class="bg-white bg-opacity-25 rounded p-2">
                    <div class="fs-4 fw-bold">${completionPercent}%</div>
                    <div class="small opacity-75">Tiến Độ</div>
                  </div>
                </div>
                <div class="col-4">
                  <div class="bg-white bg-opacity-25 rounded p-2">
                    <div class="fs-4 fw-bold">${avgScore}</div>
                    <div class="small opacity-75">ĐTB</div>
                  </div>
                </div>
                <div class="col-4">
                  <div class="bg-white bg-opacity-25 rounded p-2">
                    <div class="fs-6 fw-bold text-truncate">${rank.label || 'Khá'}</div>
                    <div class="small opacity-75">Xếp Loại</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Main Section: Islands Grid -->
      <section class="mb-5">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h3 class="fw-bold mb-1">🏝️ Hành Trình Khám Phá Các Đảo</h3>
            <p class="text-muted small mb-0">Hoàn thành từng đảo để mở khóa nội dung tiếp theo.</p>
          </div>
        </div>

        <div class="row">
          ${islandCardsHTML}
        </div>
      </section>

      <!-- Quick Action: Certificate Section -->
      <section class="card bg-light border-0 shadow-sm p-4 text-center text-md-start">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-center">
          <div class="mb-3 mb-md-0">
            <h4 class="fw-bold mb-1">🎓 Giấy Chứng Nhận Hoàn Thành</h4>
            <p class="text-muted mb-0">Hoàn thành tất cả các Đảo Tri Thức để nhận Giấy Chứng Nhận chính thức.</p>
          </div>
          <button id="btn-view-certificate" class="btn btn-success px-4">
            🏆 Xem Chứng Nhận
          </button>
        </div>
      </section>
    </div>
  `;
};

/**
 * Đăng ký các sự kiện tương tác trên Bảng điều khiển Học sinh
 * @param {HTMLElement} container 
 */
export const setupStudentDashboardEvents = (container) => {
  // Lắng nghe sự kiện bấm nút Chinh phục / Luyện tập
  const quizButtons = container.querySelectorAll('.btn-start-quiz');
  quizButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const islandId = e.currentTarget.dataset.island;
      if (islandId) {
        window.location.hash = `#/lesson?id=${islandId}`;
      }
    });
  });

  // Nút xem chứng nhận
  const certBtn = container.querySelector('#btn-view-certificate');
  if (certBtn) {
    certBtn.addEventListener('click', () => {
      window.location.hash = '#/certificate';
    });
  }
};

/**
 * Hàm khởi tạo và render chính của trang Student Dashboard Page
 * @param {HTMLElement} container - DOM Element container
 */
export const renderStudentDashboardPage = async (container) => {
  if (!container) return;

  const state = store.getState();
  const currentUser = state.currentUser;

  // Kiểm tra nếu chưa đăng nhập thì chuyển hướng về màn Login
  if (!currentUser) {
    window.location.hash = '#/login';
    return;
  }

  // Hiển thị loading
  container.innerHTML = `
    <div class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-2 text-muted">Đang tải hành trình khám phá đảo...</p>
    </div>
  `;

  try {
    // Lấy tiến độ học tập từ Firestore / Service
    const progress = await getStudentProgress(currentUser.uid);

    // Cập nhật vào store
    store.setStudentProgress(progress);

    // Render HTML và gắn Event Listener
    container.innerHTML = renderStudentDashboardHTML(currentUser, progress);
    setupStudentDashboardEvents(container);

  } catch (error) {
    console.error('[Student Dashboard] Lỗi khởi tạo trang Dashboard:', error);
    container.innerHTML = `
      <div class="container text-center py-5">
        <div class="alert alert-danger" role="alert">
          ⚠️ Có lỗi xảy ra khi tải dữ liệu tiến độ. Vui lòng thử lại sau!
        </div>
        <button class="btn btn-secondary mt-2" onclick="window.location.reload()">Làm mới trang</button>
      </div>
    `;
  }
};

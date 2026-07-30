/**
 * @file student-dashboard.js
 * @description Quản lý logic giao diện Bảng điều khiển Học sinh (Hiển thị các Đảo học tập & Tiến độ).
 */

import { getCurrentUser } from '../services/auth-service.js';
import { getStudentProgress } from '../services/student-progress-service.js';
import { calculateAverageScore, getAcademicRank } from '../services/scoring-service.js';
import { ISLANDS, ROUTES } from '../config/constants.js';
import { initNavbar } from '../components/navbar.js';

/**
 * Render cấu trúc HTML Bảng điều khiển học sinh
 * @param {Object} user - Dữ liệu học sinh
 * @param {Object} progress - Dữ liệu tiến độ học tập từ Firestore
 * @returns {string} Chuỗi HTML
 */
export const renderStudentDashboardHTML = (user, progress) => {
  const islandsData = progress?.islands || {};
  
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

  const completionPercent = Math.round((completedCount / islandKeys.length) * 100);
  const avgScore = calculateAverageScore(scores);
  const rank = getAcademicRank(avgScore);

  // Render thẻ danh sách các Đảo
  const islandCardsHTML = islandKeys.map((key, index) => {
    const config = ISLANDS[key];
    const itemProgress = islandsData[key] || {};
    
    // Đảo 1 luôn mở. Đảo N mở khi đảo N-1 đã hoàn thành.
    const isPreviousCompleted = index === 0 || islandsData[islandKeys[index - 1]]?.isCompleted;
    const isUnlocked = isPreviousCompleted || itemProgress.isUnlocked;
    const isCompleted = itemProgress.isCompleted || false;
    const currentScore = itemProgress.score ?? '--';

    let statusBadge = `<span class="badge badge-locked">🔒 Đã khóa</span>`;
    if (isCompleted) {
      statusBadge = `<span class="badge badge-completed">✅ Hoàn thành</span>`;
    } else if (isUnlocked) {
      statusBadge = `<span class="badge badge-unlocked">🌟 Đang mở</span>`;
    }

    return `
      <div class="island-card ${!isUnlocked ? 'is-locked' : ''} ${isCompleted ? 'is-completed' : ''}" data-island-id="${key}">
        <div class="island-card-header">
          <span class="island-icon">${config.icon || '🏝️'}</span>
          <div class="island-title-group">
            <h3 class="island-name">${config.name}</h3>
            <span class="island-subtitle">${config.description || ''}</span>
          </div>
          ${statusBadge}
        </div>

        <div class="island-card-body">
          <div class="island-stat">
            <span class="stat-label">Số câu hỏi:</span>
            <span class="stat-value">${config.totalQuestions || 10} câu</span>
          </div>
          <div class="island-stat">
            <span class="stat-label">Điểm cao nhất:</span>
            <span class="stat-value highlight">${currentScore} / 10</span>
          </div>
        </div>

        <div class="island-card-footer">
          ${
            isUnlocked
              ? `<button class="btn btn-primary btn-start-quiz" data-island="${key}">
                  ${isCompleted ? '🔄 Luyện Tập Lại' : '🚀 Chinh Phục Đảo'}
                 </button>`
              : `<button class="btn btn-disabled" disabled>🔒 Cần Hoàn Thành Đảo Trước</button>`
          }
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="student-dashboard-page">
      <!-- Welcome Header Banner -->
      <section class="dashboard-banner">
        <div class="banner-content">
          <h1 class="welcome-title">Xin chào, ${user.fullName || 'Học sinh'}! 👋</h1>
          <p class="welcome-sub">Hãy sẵn sàng khám phá các hòn đảo tri thức và thu thập chứng nhận nhé!</p>
        </div>
        <div class="banner-stats">
          <div class="stat-box">
            <span class="stat-number">${completionPercent}%</span>
            <span class="stat-desc">Tiến Độ Tự Học</span>
          </div>
          <div class="stat-box">
            <span class="stat-number">${avgScore}</span>
            <span class="stat-desc">Điểm Trung Bình</span>
          </div>
          <div class="stat-box">
            <span class="stat-number">${rank.label}</span>
            <span class="stat-desc">Xếp Loại</span>
          </div>
        </div>
      </section>

      <!-- Main Section: Islands Grid -->
      <section class="islands-section">
        <div class="section-header">
          <h2>🏝️ Hành Trình Khám Phá Các Đảo</h2>
          <p>Hoàn thành từng đảo để mở khóa nội dung tiếp theo và nhận giấy chứng nhận.</p>
        </div>

        <div class="islands-grid">
          ${islandCardsHTML}
        </div>
      </section>

      <!-- Quick Action: Certificate Section -->
      <section class="certificate-shortcut-card">
        <div class="shortcut-info">
          <h3>🎓 Giấy Chứng Nhận Hoàn Thành</h3>
          <p>Đạt điểm trung bình từ 6.5 trở lên để mở khóa Giấy Chứng Nhận chính thức từ hệ thống.</p>
        </div>
        <a href="${ROUTES.STUDENT_CERTIFICATE}" class="btn btn-accent">
          🏆 Xem Chứng Nhận
        </a>
      </section>
    </div>
  `;
};

/**
 * Đăng ký các sự kiện tương tác trên Bảng điều khiển Học sinh
 */
export const setupStudentDashboardEvents = () => {
  // Lắng nghe sự kiện bấm nút Chinh phục / Luyện tập bài thi ở các Đảo
  const quizButtons = document.querySelectorAll('.btn-start-quiz');
  quizButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const islandId = e.currentTarget.dataset.island;
      if (islandId) {
        // Điều hướng sang trang làm bài thi của Đảo chỉ định
        window.location.href = `${ROUTES.STUDENT_QUIZ}?island=${islandId}`;
      }
    });
  });
};

/**
 * Hàm khởi tạo và tải toàn bộ trang Dashboard Học Sinh
 * @param {string|HTMLElement} containerTarget - DOM element hoặc selector
 */
export const initStudentDashboardPage = async (containerTarget = '#app-content') => {
  const container = typeof containerTarget === 'string' 
    ? document.querySelector(containerTarget) 
    : containerTarget;

  if (!container) {
    console.error('[Student Dashboard] Không tìm thấy phần tử DOM container.');
    return;
  }

  try {
    // 1. Kiểm tra tài khoản hiện tại
    const currentUser = getCurrentUser();
    if (!currentUser) {
      window.location.href = ROUTES.LOGIN;
      return;
    }

    // Render Navbar chung
    initNavbar('#app-header', currentUser);

    // Hiển thị trạng thái đang tải
    container.innerHTML = `
      <div class="loading-spinner-container">
        <div class="spinner"></div>
        <p>Đang tải hành trình khám phá đảo...</p>
      </div>
    `;

    // 2. Lấy tiến độ học tập từ Firestore
    const progress = await getStudentProgress(currentUser.uid);

    // 3. Render HTML và gắn Event Listener
    container.innerHTML = renderStudentDashboardHTML(currentUser, progress);
    setupStudentDashboardEvents();
  } catch (error) {
    console.error('[Student Dashboard] Lỗi khởi tạo trang Dashboard:', error);
    container.innerHTML = `
      <div class="error-container">
        <p class="error-msg">⚠️ Có lỗi xảy ra khi tải dữ liệu tiến độ. Vui lòng thử lại!</p>
        <button class="btn btn-secondary" onclick="window.location.reload()">Thử lại</button>
      </div>
    `;
  }
};

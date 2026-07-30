/**
 * @file island-card.js
 * @description Component hiển thị Thẻ Đảo Khám Phá Tri Thức trong LMS Toán 6.
 */

import { ROUTES } from '../config/constants.js';

/**
 * Render HTML cho một Thẻ Đảo học tập
 * @param {string} islandKey - Mã định danh đảo (vd: 'ISLAND_1')
 * @param {Object} islandConfig - Cấu hình thông tin đảo từ constants (name, description, totalQuestions, icon)
 * @param {Object} islandProgress - Tiến độ của học sinh ở đảo này ({ isUnlocked, isCompleted, score })
 * @param {boolean} isUnlocked - Trạng thái đảo có được mở khóa hay không
 * @returns {string} Chuỗi HTML đại diện thẻ Đảo
 */
export const renderIslandCardHTML = (islandKey, islandConfig = {}, islandProgress = {}, isUnlocked = false) => {
  const isCompleted = islandProgress?.isCompleted || false;
  const currentScore = typeof islandProgress?.score === 'number' ? islandProgress.score : null;

  // Xử lý hiển thị Badge trạng thái
  let statusBadge = `<span class="badge badge-locked" title="Cần hoàn thành đảo trước">🔒 Đã khóa</span>`;
  if (isCompleted) {
    statusBadge = `<span class="badge badge-completed" title="Đã hoàn thành xuất sắc">✅ Hoàn thành</span>`;
  } else if (isUnlocked) {
    statusBadge = `<span class="badge badge-unlocked" title="Sẵn sàng chinh phục">🌟 Đang mở</span>`;
  }

  // Xử lý lớp CSS trạng thái cho card
  const cardClasses = [
    'island-card',
    !isUnlocked ? 'is-locked' : '',
    isCompleted ? 'is-completed' : '',
    isUnlocked && !isCompleted ? 'is-active' : ''
  ].filter(Boolean).join(' ');

  // Hiển thị điểm số
  const scoreDisplay = currentScore !== null ? `${currentScore} / 10` : '--';

  return `
    <div class="${cardClasses}" data-island-id="${islandKey}">
      <div class="island-card-header">
        <div class="island-icon-wrapper">
          <span class="island-icon">${islandConfig.icon || '🏝️'}</span>
        </div>
        <div class="island-title-group">
          <h3 class="island-name">${islandConfig.name || 'Đảo Tri Thức'}</h3>
          <p class="island-subtitle">${islandConfig.description || 'Chinh phục các bài toán để thu thập điểm số.'}</p>
        </div>
        <div class="island-badge-container">
          ${statusBadge}
        </div>
      </div>

      <div class="island-card-body">
        <div class="island-stat-item">
          <span class="stat-label">🎯 Số câu hỏi:</span>
          <span class="stat-value">${islandConfig.totalQuestions || 10} câu</span>
        </div>
        <div class="island-stat-item">
          <span class="stat-label">🏆 Điểm cao nhất:</span>
          <span class="stat-value ${currentScore !== null ? 'highlight-score' : ''}">${scoreDisplay}</span>
        </div>
      </div>

      <div class="island-card-footer">
        ${
          isUnlocked
            ? `<button 
                class="btn ${isCompleted ? 'btn-outline-primary' : 'btn-primary'} btn-start-island" 
                data-island-key="${islandKey}"
               >
                 ${isCompleted ? '🔄 Ôn Tập Lại' : '🚀 Chinh Phục Đảo'}
               </button>`
            : `<button class="btn btn-disabled" disabled title="Hãy hoàn thành đảo phía trước">
                 🔒 Cần Hoàn Thành Đảo Trước
               </button>`
        }
      </div>
    </div>
  `;
};

/**
 * Gắn sự kiện click cho tất cả nút Chinh Phục / Ôn Tập trong container
 * @param {HTMLElement|string} containerTarget - DOM Element chứa danh sách thẻ đảo
 * @param {Function} [onSelectIsland] - Callback tùy chọn thực thi khi bấm chọn đảo (mặc định chuyển trang)
 */
export const setupIslandCardEvents = (containerTarget, onSelectIsland) => {
  const container = typeof containerTarget === 'string' 
    ? document.querySelector(containerTarget) 
    : containerTarget;

  if (!container) return;

  const actionButtons = container.querySelectorAll('.btn-start-island');
  actionButtons.forEach((button) => {
    button.addEventListener('click', (e) => {
      const islandKey = e.currentTarget.dataset.islandKey;
      if (!islandKey) return;

      if (typeof onSelectIsland === 'function') {
        onSelectIsland(islandKey);
      } else {
        // Mặc định chuyển hướng sang trang bài thi trắc nghiệm
        window.location.href = `${ROUTES.STUDENT_QUIZ || '#/quiz'}?island=${islandKey}`;
      }
    });
  });
};

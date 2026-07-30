/**
 * @file quiz-modal.js
 * @description Component hiển thị Popup tổng kết và chúc mừng kết quả bài thi trắc nghiệm trong LMS Toán 6.
 */

import { showCustomModal } from './modal.js';
import { ROUTES } from '../config/constants.js';

/**
 * Hiển thị Modal Kết Quả Bài Thi Trắc Nghiệm
 * @param {Object} options - Tham số kết quả bài thi
 * @param {number} options.score - Điểm số đạt được (thang điểm 10)
 * @param {number} options.correctCount - Số câu trả lời đúng
 * @param {number} options.totalQuestions - Tổng số câu hỏi
 * @param {number} options.timeSpentSeconds - Thời gian làm bài (tính bằng giây)
 * @param {string} options.islandKey - Mã định danh đảo (vd: 'ISLAND_1')
 * @param {string} [options.islandName='Đảo Tri Thức'] - Tên đảo
 * @param {boolean} [options.isPassed=true] - Trạng thái đạt/không đạt đảo
 * @param {Function} [options.onRetry] - Callback khi bấm nút "Làm lại bài"
 * @param {Function} [options.onNextIsland] - Callback khi bấm "Chinh phục đảo tiếp"
 * @returns {Object} Đối tượng điều khiển modal
 */
export const showQuizResultModal = ({
  score = 0,
  correctCount = 0,
  totalQuestions = 10,
  timeSpentSeconds = 0,
  islandKey = '',
  islandName = 'Đảo Tri Thức',
  isPassed = false,
  onRetry = null,
  onNextIsland = null
}) => {
  // Đổi giây ra định dạng mm:ss
  const minutes = Math.floor(timeSpentSeconds / 60);
  const seconds = timeSpentSeconds % 60;
  const timeFormatted = `${minutes > 0 ? `${minutes} phút ` : ''}${seconds} giây`;

  // Tỷ lệ phần trăm đúng
  const percentage = Math.round((correctCount / totalQuestions) * 100);

  // Đánh giá dựa trên điểm số
  let resultIcon = '🎉';
  let resultTitle = 'Chúc Mừng Bạn Hoàn Thành!';
  let badgeClass = 'badge-success';
  let resultNote = 'Bạn đã nắm rất vững kiến thức bài học này!';

  if (score >= 9) {
    resultIcon = '🏆';
    resultTitle = 'Xuất Sắc! Thần Đồng Toán Học';
    badgeClass = 'badge-excel';
    resultNote = 'Tất cả các câu hỏi khó đều không làm khó được bạn!';
  } else if (score >= 7) {
    resultIcon = '🌟';
    resultTitle = 'Tốt Lắm! Đạt Kết Quả Khá';
    badgeClass = 'badge-good';
    resultNote = 'Cố gắng phát huy thêm một chút nữa ở lượt làm sau nhé!';
  } else if (isPassed) {
    resultIcon = '🎯';
    resultTitle = 'Đã Vượt Qua Đảo!';
    badgeClass = 'badge-pass';
    resultNote = 'Bạn đã đạt đủ điều kiện để mở khóa kiến thức tiếp theo.';
  } else {
    resultIcon = '💪';
    resultTitle = 'Chưa Đạt Yêu Cầu';
    badgeClass = 'badge-fail';
    resultNote = 'Đừng nản lòng! Hãy ôn tập lại lý thuyết và thử lại nhé.';
  }

  const contentHTML = `
    <div class="quiz-result-modal-content text-center">
      <div class="result-header">
        <div class="result-icon-animate">${resultIcon}</div>
        <h2 class="result-title">${resultTitle}</h2>
        <span class="result-badge ${badgeClass}">${islandName}</span>
      </div>

      <div class="result-score-banner">
        <div class="score-number">${score}<span class="score-max">/10</span></div>
        <p class="score-label">Điểm số thu thập</p>
      </div>

      <div class="result-stats-grid">
        <div class="result-stat-card">
          <span class="stat-icon">✅</span>
          <div class="stat-info">
            <span class="stat-value">${correctCount} / ${totalQuestions}</span>
            <span class="stat-title">Số câu đúng (${percentage}%)</span>
          </div>
        </div>

        <div class="result-stat-card">
          <span class="stat-icon">⏱️</span>
          <div class="stat-info">
            <span class="stat-value">${timeFormatted}</span>
            <span class="stat-title">Thời gian làm</span>
          </div>
        </div>
      </div>

      <p class="result-note-text">${resultNote}</p>

      <div class="result-actions-group">
        <button class="btn btn-secondary btn-retry-quiz">
          🔄 Làm Lại
        </button>
        
        ${
          isPassed && onNextIsland
            ? `<button class="btn btn-primary btn-next-island">
                 🚀 Đảo Tiếp Theo
               </button>`
            : `<a href="${ROUTES.STUDENT_DASHBOARD || '#/dashboard'}" class="btn btn-primary btn-go-dashboard">
                 🏝️ Bảng Điều Khiển
               </a>`
        }
      </div>
    </div>
  `;

  // Mở Custom Modal
  const modalInstance = showCustomModal({
    contentHTML,
    closeOnOverlayClick: false
  });

  const modalElement = modalInstance.modalElement;

  // Gắn sự kiện cho các nút hành động
  const retryBtn = modalElement.querySelector('.btn-retry-quiz');
  if (retryBtn) {
    retryBtn.addEventListener('click', () => {
      modalInstance.close();
      if (typeof onRetry === 'function') onRetry();
    });
  }

  const nextBtn = modalElement.querySelector('.btn-next-island');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      modalInstance.close();
      if (typeof onNextIsland === 'function') onNextIsland();
    });
  }

  return modalInstance;
};

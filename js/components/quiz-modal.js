import { showCustomModal } from './modal.js';
import { ROUTES } from '../config/constants.js';
import { getQuizQuestionsByLessonId } from '../services/course-service.js';

 * @file quiz-modal.js
 * @description Component hiển thị Popup tổng kết và chúc mừng kết quả bài thi trắc nghiệm trong LMS Toán 6.
 */

import { ROUTES } from '../config/constants.js';

/**
 * Hàm mới: Bao bọc để khớp với tên hàm mà lesson-detail-page.js đang gọi
 */
export const showQuizModal = async (islandId, title) => {
  const questions = await getQuizQuestionsByLessonId(islandId);
  // Ở đây bạn có thể gọi logic render modal quiz trắc nghiệm thực tế
  console.log(`Đang mở quiz cho ${islandId}:`, questions);
  
  // Gọi hàm result để test modal nếu cần:
  showQuizResultModal({ islandName: title, isPassed: true });
};

/**
 * Hiển thị Modal Kết Quả Bài Thi Trắc Nghiệm
 */
export const showQuizResultModal = ({
  score = 0,
  correctCount = 0,
  totalQuestions = 10,
  timeSpentSeconds = 0,
  islandName = 'Đảo Tri Thức',
  isPassed = false,
  onRetry = null
}) => {
  const minutes = Math.floor(timeSpentSeconds / 60);
  const seconds = timeSpentSeconds % 60;
  const timeFormatted = `${minutes > 0 ? `${minutes} phút ` : ''}${seconds} giây`;
  const percentage = Math.round((correctCount / totalQuestions) * 100);

  let resultIcon = isPassed ? '🎉' : '💪';
  let resultTitle = isPassed ? 'Chúc Mừng Bạn Hoàn Thành!' : 'Chưa Đạt Yêu Cầu';
  let badgeClass = isPassed ? 'bg-success' : 'bg-danger';

  const contentHTML = `
    <style>
      .result-score-banner { font-size: 2rem; font-weight: bold; color: #0d6efd; margin: 1rem 0; }
      .score-max { font-size: 1rem; color: #6c757d; }
      .result-stats-grid { display: flex; justify-content: space-around; margin: 1rem 0; }
      .result-stat-card { background: #f8f9fa; padding: 10px; border-radius: 8px; flex: 1; margin: 0 5px; }
    </style>
    <div class="quiz-result-modal-content text-center p-3">
      <div class="result-header">
        <div style="font-size: 3rem;">${resultIcon}</div>
        <h2 class="result-title fw-bold">${resultTitle}</h2>
        <span class="badge ${badgeClass} mb-3">${islandName}</span>
      </div>

      <div class="result-score-banner">
        ${score}<span class="score-max">/10</span>
      </div>

      <div class="result-stats-grid">
        <div class="result-stat-card">
          <div>✅</div>
          <div class="fw-bold">${correctCount}/${totalQuestions}</div>
          <small>Số câu đúng (${percentage}%)</small>
        </div>
        <div class="result-stat-card">
          <div>⏱️</div>
          <div class="fw-bold">${timeFormatted}</div>
          <small>Thời gian làm</small>
        </div>
      </div>

      <div class="result-actions-group mt-4 d-flex gap-2 justify-content-center">
        <button class="btn btn-secondary btn-retry-quiz">🔄 Làm Lại</button>
        <a href="#/student-dashboard" class="btn btn-primary">🏝️ Về Bản Đồ</a>
      </div>
    </div>
  `;

  // Tạo Modal thủ công bằng Bootstrap API nếu không có showCustomModal
  const modalId = 'result-modal';
  let modalEl = document.getElementById(modalId);
  if (!modalEl) {
    modalEl = document.createElement('div');
    modalEl.id = modalId;
    modalEl.className = 'modal fade';
    modalEl.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content"><div class="modal-body"></div></div>
      </div>
    `;
    document.body.appendChild(modalEl);
  }

  modalEl.querySelector('.modal-body').innerHTML = contentHTML;
  const bootstrapModal = new bootstrap.Modal(modalEl);
  bootstrapModal.show();

  modalEl.querySelector('.btn-retry-quiz').onclick = () => {
    bootstrapModal.hide();
    if (onRetry) onRetry();
  };
};

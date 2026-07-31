/**
 * @file quiz-modal.js
 * @description Quản lý modal làm bài trắc nghiệm và kết quả.
 */

import { getQuizQuestionsByLessonId } from '../services/course-service.js';
import { submitQuizAttempt } from '../services/quiz-service.js';
import { store } from '../core/store.js';

export const showQuizModal = async (islandId, title) => {
  const questions = await getQuizQuestionsByLessonId(islandId);
  
  if (!questions || questions.length === 0) {
    alert("Chưa có câu hỏi cho bài học này!");
    return;
  }

  const modalEl = document.createElement('div');
  modalEl.className = 'modal fade';
  modalEl.id = 'quiz-active-modal';
  modalEl.innerHTML = `
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title">🎯 Thử thách: ${title}</h5>
        </div>
        <div class="modal-body" id="quiz-body"></div>
      </div>
    </div>
  `;
  document.body.appendChild(modalEl);
  const bootstrapModal = new bootstrap.Modal(modalEl);
  bootstrapModal.show();

  const quizBody = modalEl.querySelector('#quiz-body');
  quizBody.innerHTML = `
    <div class="p-3">
      ${questions.map((q, i) => `
        <div class="mb-4 p-3 border rounded">
          <p class="fw-bold mb-3">${i + 1}. ${q.content}</p>
          <div class="row">
            ${q.options.map((opt, idx) => `
              <div class="col-6 mb-2">
                <div class="form-check">
                  <input class="form-check-input" type="radio" name="q${q.id}" value="${idx}" id="opt${q.id}_${idx}">
                  <label class="form-check-label" for="opt${q.id}_${idx}">${opt}</label>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
      <button class="btn btn-primary w-100 btn-lg mt-3" id="btn-submit-quiz">Nộp bài</button>
    </div>
  `;

  modalEl.querySelector('#btn-submit-quiz').onclick = async () => {
    let userAnswers = [];
    questions.forEach(q => {
      const selected = modalEl.querySelector(`input[name="q${q.id}"]:checked`);
      if (selected) {
        userAnswers.push({ questionId: q.id, selectedOption: parseInt(selected.value) });
      }
    });

    if (userAnswers.length < questions.length) {
      alert("Bạn cần hoàn thành đủ tất cả câu hỏi trước khi nộp bài!");
      return;
    }

    const result = await submitQuizAttempt(store.getState().currentUser?.uid, islandId, userAnswers, questions);
    
    // Xóa modal khỏi DOM sau khi animation kết thúc
    modalEl.addEventListener('hidden.bs.modal', () => {
      modalEl.remove();
    });
    bootstrapModal.hide();
    
    showQuizResultModal({ ...result, islandName: title, isPassed: result.isPassed });
  };
};

export const showQuizResultModal = ({
  score = 0,
  correctCount = 0,
  totalQuestions = 5,
  islandName = 'Đảo Tri Thức',
  isPassed = false
}) => {
  const contentHTML = `
    <div class="text-center p-4">
      <h2 class="mb-3">${isPassed ? '🎉 Chúc mừng!' : '💪 Cố gắng thêm nhé!'}</h2>
      <div class="display-3 my-3 text-primary fw-bold">${score}/10</div>
      <p class="text-muted">Bạn đã trả lời đúng ${correctCount}/${totalQuestions} câu hỏi.</p>
      <!-- SỬA LỖI: Chuyển hướng bằng hash thay vì reload trang để tránh gián đoạn trải nghiệm -->
      <button class="btn btn-primary w-100 mt-3" onclick="window.location.hash='#/student-dashboard'; bootstrap.Modal.getInstance(this.closest('.modal')).hide()">Về Bản Đồ</button>
    </div>
  `;
  
  let modalEl = document.createElement('div');
  modalEl.className = 'modal fade';
  modalEl.innerHTML = `<div class="modal-dialog modal-dialog-centered"><div class="modal-content"><div class="modal-body">${contentHTML}</div></div></div>`;
  document.body.appendChild(modalEl);
  new bootstrap.Modal(modalEl).show();
};

import { getQuestionsByIsland, submitQuizAttempt } from '../services/quiz-service.js';
import { store } from '../core/store.js';

export const showQuizModal = async (islandId, islandTitle) => {
  const modalId = 'quiz-modal-container';
  let modal = document.getElementById(modalId);
  
  if (!modal) {
    modal = document.createElement('div');
    modal.id = modalId;
    document.body.appendChild(modal);
  }

  modal.innerHTML = `<div class="text-center p-5"><div class="spinner-border text-primary"></div><p>Đang chuẩn bị đề thi...</p></div>`;

  try {
    const questions = await getQuestionsByIsland(islandId);
    
    modal.innerHTML = `
      <div class="modal fade show" style="display: block; background: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-lg">
          <div class="modal-content shadow-lg border-0">
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title">🎯 ${islandTitle} - Thử Thách</h5>
            </div>
            <div class="modal-body p-4">
              <form id="quiz-form">
                ${questions.map((q, index) => `
                  <div class="mb-4">
                    <p class="fw-bold">Câu ${index + 1}: ${q.content}</p>
                    ${q.options.map((opt, i) => `
                      <div class="form-check">
                        <input class="form-check-input" type="radio" name="q_${q.id}" value="${i}" id="q_${q.id}_${i}" required>
                        <label class="form-check-label" for="q_${q.id}_${i}">${opt}</label>
                      </div>
                    `).join('')}
                  </div>
                `).join('')}
              </form>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" id="btn-close-quiz">Đóng</button>
              <button class="btn btn-primary" id="btn-submit-quiz">Nộp bài ngay!</button>
            </div>
          </div>
        </div>
      </div>
    `;

    modal.querySelector('#btn-close-quiz').onclick = () => modal.remove();
    modal.querySelector('#btn-submit-quiz').onclick = async () => {
      const formData = new FormData(modal.querySelector('#quiz-form'));
      const userAnswers = [];
      questions.forEach(q => {
        userAnswers.push({ questionId: q.id, selectedOption: formData.get(`q_${q.id}`) });
      });

      const result = await submitQuizAttempt(store.getState().currentUser.uid, islandId, userAnswers, questions);
      alert(`Hoàn thành! Điểm của bạn: ${result.score}/10`);
      modal.remove();
      window.location.reload(); // Reload để cập nhật trạng thái đảo
    };

  } catch (err) {
    modal.innerHTML = `<div class="alert alert-danger">Lỗi tải quiz: ${err.message}</div>`;
  }
};

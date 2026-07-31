import { getQuizQuestionsByLessonId } from '../services/course-service.js';
import { submitQuizAttempt } from '../services/quiz-service.js';
import { showQuizResultModal } from './quiz-modal.js';
import { store } from '../core/store.js';

export const startQuizSession = async (islandId, title) => {
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
        <div class="modal-header"><h5 class="modal-title">🎯 Thử thách: ${title}</h5></div>
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
        <div class="mb-4">
          <p class="fw-bold">${i + 1}. ${q.content}</p>
          ${q.options.map((opt, idx) => `
            <div class="form-check">
              <input class="form-check-input" type="radio" name="q${q.id}" value="${idx}" id="opt${q.id}_${idx}">
              <label class="form-check-label" for="opt${q.id}_${idx}">${opt}</label>
            </div>
          `).join('')}
        </div>
      `).join('')}
      <button class="btn btn-primary w-100" id="btn-submit-quiz">Nộp bài</button>
    </div>
  `;

  modalEl.querySelector('#btn-submit-quiz').onclick = async () => {
    let userAnswers = [];
    questions.forEach(q => {
      const selected = modalEl.querySelector(`input[name="q${q.id}"]:checked`);
      if (selected) userAnswers.push({ questionId: q.id, selectedOption: parseInt(selected.value) });
    });

    const result = await submitQuizAttempt(store.getState().currentUser?.uid, islandId, userAnswers, questions);
    bootstrapModal.hide();
    modalEl.remove();
    showQuizResultModal({ ...result, islandName: title, isPassed: result.isPassed });
  };
};

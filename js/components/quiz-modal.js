import { startQuizSession } from './quiz-player.js';

export const showQuizModal = async (islandId, title) => {
  // Gọi hàm bắt đầu phiên Quiz từ file mới tạo
  await startQuizSession(islandId, title);
};

export const showQuizResultModal = ({
  score = 0,
  correctCount = 0,
  totalQuestions = 10,
  islandName = 'Đảo Tri Thức',
  isPassed = false
}) => {
  const contentHTML = `
    <div class="text-center p-3">
      <h2>${isPassed ? '🎉 Hoàn thành!' : '💪 Cố gắng thêm nhé!'}</h2>
      <div class="display-4 my-3">${score}/10</div>
      <p>Số câu đúng: ${correctCount}/${totalQuestions}</p>
      <button class="btn btn-primary" onclick="window.location.reload()">Về Bản Đồ</button>
    </div>
  `;
  
  let modalEl = document.getElementById('result-modal') || document.createElement('div');
  modalEl.id = 'result-modal';
  modalEl.className = 'modal fade';
  modalEl.innerHTML = `<div class="modal-dialog"><div class="modal-content"><div class="modal-body">${contentHTML}</div></div></div>`;
  document.body.appendChild(modalEl);
  new bootstrap.Modal(modalEl).show();
};

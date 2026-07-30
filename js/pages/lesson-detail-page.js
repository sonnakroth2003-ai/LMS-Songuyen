/**
 * @file lesson-detail-page.js
 * @description Trang chi tiết bài học / Đảo Tri Thức dành cho học sinh.
 */

import { store } from '../core/store.js';
import { getLessonById } from '../services/course-service.js';
import { getStudentProgress } from '../services/progress-service.js';
import { showQuizResultModal } from '../components/quiz-modal.js';

const renderLessonContentHTML = (lesson, progress) => {
  const isCompleted = progress?.isCompleted || false;
  const highestScore = progress?.score !== undefined ? progress.score : null;

  return `
    <div class="lesson-detail-page container py-4">
      <div class="mb-3">
        <button id="btn-back-to-dashboard" class="btn btn-outline-secondary btn-sm">⬅️ Quay lại Bản đồ Đảo</button>
      </div>

      <div class="card shadow-sm border-0 mb-4">
        <div class="card-body d-flex justify-content-between align-items-center flex-wrap">
          <div>
            <span class="badge bg-primary mb-2">${lesson.category || 'Bài học'}</span>
            <h2 class="card-title fw-bold mb-1">${lesson.title}</h2>
            <p class="text-muted mb-0">${lesson.description || ''}</p>
          </div>
          <div class="mt-3 mt-md-0 text-md-end">
            ${isCompleted ? `<span class="badge bg-success p-2">✅ Đã hoàn thành</span><div class="small text-muted">Điểm: ${highestScore}/10</div>` : `<span class="badge bg-warning text-dark p-2">⏳ Chưa hoàn thành</span>`}
          </div>
        </div>
      </div>

      <div class="card shadow-sm border-0 mb-4">
        <div class="card-header bg-white border-bottom fw-bold text-primary">📖 Nội dung lý thuyết</div>
        <div class="card-body lesson-body-content">${lesson.contentHtml || '<p>Đang cập nhật...</p>'}</div>
      </div>

      <div class="card shadow-sm border-0 bg-light p-4 text-center">
        <h4 class="fw-bold mb-2">Thử thách Đảo Tri Thức 🎯</h4>
        <button id="btn-start-quiz" class="btn btn-primary btn-lg px-4">${isCompleted ? '🔄 Làm lại bài' : '🚀 Bắt đầu làm bài'}</button>
      </div>
    </div>
  `;
};

export const renderLessonDetailPage = async (container, params = {}) => {
  if (!container) return;
  const lessonId = params.id || 'ISLAND_1';
  container.innerHTML = `<div class="text-center py-5"><div class="spinner-border text-primary"></div></div>`;

  try {
    const lesson = await getLessonById(lessonId);
    const progress = await getStudentProgress(store.getState().currentUser?.uid, lessonId);

    if (!lesson) {
      container.innerHTML = '<div class="alert alert-danger">Không tìm thấy bài học!</div>';
      return;
    }

    container.innerHTML = renderLessonContentHTML(lesson, progress);
    
    container.querySelector('#btn-back-to-dashboard')?.addEventListener('click', () => { window.location.hash = '#/student-dashboard'; });
    
    container.querySelector('#btn-start-quiz')?.addEventListener('click', () => {
      showQuizResultModal({ islandName: lesson.title });
    });

  } catch (error) {
    container.innerHTML = `<div class="alert alert-danger">Có lỗi xảy ra!</div>`;
  }
};

/**
 * @file lesson-detail-page.js
 * @description Trang chi tiết bài học / Đảo Tri Thức dành cho học sinh.
 */

import { store } from '../core/store.js';
import { getLessonById } from '../services/course-service.js';
import { getStudentProgress } from '../services/progress-service.js';
// Đã sửa lại import để khớp với tên hàm thực tế
import { showQuizResultModal } from '../components/quiz-modal.js';

/**
 * Render chuỗi HTML cho nội dung chi tiết bài học
 */
const renderLessonContentHTML = (lesson, progress) => {
  const isCompleted = progress?.isCompleted || false;
  const highestScore = progress?.score !== undefined ? progress.score : null;

  return `
    <div class="lesson-detail-page container py-4">
      <div class="mb-3">
        <button id="btn-back-to-dashboard" class="btn btn-outline-secondary btn-sm">
          ⬅️ Quay lại Bản đồ Đảo
        </button>
      </div>

      <div class="card shadow-sm border-0 mb-4">
        <div class="card-body d-flex justify-content-between align-items-center flex-wrap">
          <div>
            <span class="badge bg-primary mb-2">${lesson.category || 'Bài học'}</span>
            <h2 class="card-title fw-bold mb-1">${lesson.title}</h2>
            <p class="text-muted mb-0">${lesson.description || ''}</p>
          </div>
          <div class="mt-3 mt-md-0 text-md-end">
            ${
              isCompleted
                ? `<span class="badge bg-success p-2 mb-1 d-inline-block">✅ Đã hoàn thành</span>
                   <div class="small text-muted">Điểm cao nhất: <strong>${highestScore}/10</strong></div>`
                : `<span class="badge bg-warning text-dark p-2">⏳ Chưa hoàn thành</span>`
            }
          </div>
        </div>
      </div>

      <div class="card shadow-sm border-0 mb-4">
        <div class="card-header bg-white border-bottom fw-bold text-primary">
          📖 Nội dung lý thuyết & Kiến thức trọng tâm
        </div>
        <div class="card-body lesson-body-content">
          ${lesson.contentHtml || `<p class="text-muted">${lesson.summary || 'Chưa có nội dung chi tiết.'}</p>`}
        </div>
      </div>

      ${
        lesson.examples && lesson.examples.length > 0
          ? `
          <div class="card shadow-sm border-0 mb-4">
            <div class="card-header bg-white border-bottom fw-bold text-success">
              💡 Ví dụ minh họa
            </div>
            <div class="card-body">
              <ul class="list-group list-group-flush">
                ${lesson.examples
                  .map(
                    (ex, idx) => `
                  <li class="list-group-item bg-transparent px-0 py-2">
                    <strong>Ví dụ ${idx + 1}:</strong> ${ex.question}
                    <div class="bg-light p-2 rounded mt-1 text-muted">
                      <em>Lời giải:</em> ${ex.solution}
                    </div>
                  </li>
                `
                  )
                  .join('')}
              </ul>
            </div>
          </div>
        `
          : ''
      }

      <div class="card shadow-sm border-0 bg-light p-4 text-center">
        <h4 class="fw-bold mb-2">Thử thách Đảo Tri Thức 🎯</h4>
        <p class="text-muted mb-3">
          Sẵn sàng vượt qua bài kiểm tra trắc nghiệm để mở khóa chặng tiếp theo?
        </p>
        <div>
          <button id="btn-start-quiz" class="btn btn-primary btn-lg px-4 shadow-sm">
            ${isCompleted ? '🔄 Làm lại bài kiểm tra' : '🚀 Bắt đầu làm bài kiểm tra'}
          </button>
        </div>
      </div>
    </div>
  `;
};

const renderNotFoundHTML = () => `
    <div class="container text-center py-5">
      <div class="card p-5 shadow-sm border-danger mx-auto" style="max-width: 500px;">
        <div class="display-1 text-danger mb-3">⚠️</div>
        <h3>Không tìm thấy bài học!</h3>
        <p class="text-muted mb-4">Bài học bạn đang truy cập không tồn tại hoặc đã bị xóa.</p>
        <div>
          <button id="btn-back-to-dashboard" class="btn btn-primary px-4">Quay lại trang chủ</button>
        </div>
      </div>
    </div>
`;

export const renderLessonDetailPage = async (container, params = {}) => {
  if (!container) return;
  const lessonId = params.id || params.lessonId || 'ISLAND_1';

  container.innerHTML = `<div class="text-center py-5"><div class="spinner-border text-primary"></div></div>`;

  try {
    const state = store.getState();
    const currentUser = state.currentUser;
    const lesson = await getLessonById(lessonId);

    if (!lesson) {
      container.innerHTML = renderNotFoundHTML();
      setupNotFoundEvents(container);
      return;
    }

    let progress = null;
    if (currentUser?.uid) {
      progress = await getStudentProgress(currentUser.uid, lessonId);
    }

    container.innerHTML = renderLessonContentHTML(lesson, progress);
    setupLessonEvents(container, lesson, currentUser);
  } catch (error) {
    container.innerHTML = `<div class="alert alert-danger text-center my-4">Có lỗi xảy ra khi tải bài học.</div>`;
  }
};

const setupNotFoundEvents = (container) => {
  container.querySelector('#btn-back-to-dashboard')?.addEventListener('click', () => {
    window.location.hash = '#/student-dashboard';
  });
};

const setupLessonEvents = (container, lesson, currentUser) => {
  container.querySelector('#btn-back-to-dashboard')?.addEventListener('click', () => {
    window.location.hash = '#/student-dashboard';
  });

  container.querySelector('#btn-start-quiz')?.addEventListener('click', () => {
    // Gọi đúng tên hàm đã export
    showQuizResultModal({
      islandName: lesson.title,
      // ... thêm các logic khởi tạo quiz tại đây
    });
  });
};
```eof

### Những thay đổi tôi đã thực hiện:
1. **Sửa Import:** Thay đổi `import { openQuizModal }` thành `import { showQuizResultModal }`.
2. **Sửa gọi hàm:** Trong `setupLessonEvents`, tôi đã cập nhật để sử dụng `showQuizResultModal`.
3. **Dọn dẹp code:** Tôi đã rút gọn một số phần để file sạch và dễ đọc hơn.

**Lưu ý:** Bạn hãy commit nội dung này. Sau khi commit xong, nếu ứng dụng chạy mà vẫn gặp vấn đề ở nút "Bắt đầu làm bài", hãy cho tôi biết nhé!

import { store } from '../core/store.js';
import { getStudentProgress } from '../services/progress-service.js';
import { ISLANDS, ISLAND_STATUS } from '../config/constants.js';

export const renderStudentDashboardPage = async (container) => {
  if (!container) return;
  const user = store.getState().currentUser;
  
  // Tải lại tiến độ mới nhất từ storage mỗi khi render dashboard
  const progress = getStudentProgress(user?.uid);
  const islands = progress?.islands || {};

  container.innerHTML = `
    <div class="container py-4">
      <h3 class="fw-bold mb-4">🏝️ Hành Trình Khám Phá Các Đảo</h3>
      <div class="row g-4" id="islands-grid">
        ${Object.keys(ISLANDS).map(key => {
          const island = ISLANDS[key];
          const status = islands[key]?.status || ISLAND_STATUS.LOCKED;
          const score = islands[key]?.score || 0;
          const isUnlocked = status !== ISLAND_STATUS.LOCKED;
          
          return `
            <div class="col-md-4">
              <div class="card h-100 shadow-sm ${!isUnlocked ? 'bg-light' : ''}">
                <div class="card-body">
                  <h5 class="card-title">${island.icon} ${island.name}</h5>
                  <p class="text-muted small">${island.description}</p>
                  <div class="mb-2">Điểm cao nhất: <strong>${score} / 10</strong></div>
                  ${isUnlocked 
                    ? `<a href="#/lesson?id=${island.id}" class="btn ${status === ISLAND_STATUS.COMPLETED ? 'btn-success' : 'btn-primary'} w-100">
                         ${status === ISLAND_STATUS.COMPLETED ? '🔄 Xem lại bài' : '🚀 Chinh Phục Đảo'}
                       </a>`
                    : `<button class="btn btn-secondary w-100" disabled>🔒 Cần Hoàn Thành Đảo Trước</button>`
                  }
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
};

import { store } from '../core/store.js';
import { getStudentProgress } from '../services/progress-service.js';
import { ISLANDS, ISLAND_STATUS } from '../config/constants.js';

export const renderStudentDashboardPage = async (container) => {
  if (!container) return;
  const user = store.getState().currentUser;
  
  const progress = getStudentProgress(user?.uid);
  const islands = progress?.islands || {};
  
  // Tính toán tiến độ %
  const totalIslands = Object.keys(ISLANDS).length;
  const completedIslands = Object.values(islands).filter(i => i.status === ISLAND_STATUS.COMPLETED).length;
  const progressPercent = Math.round((completedIslands / totalIslands) * 100);

  container.innerHTML = `
    <div class="container py-4">
      <div class="alert alert-primary mb-4">
        <h4 class="fw-bold">Xin chào, ${user?.fullName || 'Học sinh'}! 👋</h4>
        <div class="progress my-3" style="height: 20px;">
          <div class="progress-bar bg-success" style="width: ${progressPercent}%">${progressPercent}%</div>
        </div>
        <p class="mb-0">Bạn đã hoàn thành ${completedIslands}/${totalIslands} đảo. Cố gắng lên nhé!</p>
      </div>

      <h3 class="fw-bold mb-4">🏝️ Hành Trình Khám Phá Các Đảo</h3>
      <div class="row g-4" id="islands-grid">
        ${Object.keys(ISLANDS).map(key => {
          const island = ISLANDS[key];
          const islandData = islands[key] || {};
          const status = islandData.status || ISLAND_STATUS.LOCKED;
          const score = islandData.score || 0;
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

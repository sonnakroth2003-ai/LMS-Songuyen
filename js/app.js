import { store } from './core/store.js';
import { initRouter, registerRoute } from './core/router.js';
import { logoutUser, checkAuthStatus } from './core/auth.js';
import { ROUTES, ROLES } from './config/constants.js';

import { renderLoginPage } from './pages/login-page.js';
import { renderStudentDashboardPage } from './pages/student-dashboard-page.js';
import { renderTeacherDashboardPage } from './pages/teacher-dashboard-page.js';
import { renderCertificatePage } from './pages/certificate-page.js';
import { renderLessonDetailPage } from './pages/lesson-detail-page.js';

const renderNavbar = () => {
  const navContainer = document.querySelector('#navbar-container');
  if (!navContainer) return;

  const state = store.getState();
  const currentUser = state.currentUser;
  const isTeacher = currentUser?.role === ROLES.TEACHER;

  navContainer.innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div class="container">
        <a class="navbar-brand d-flex align-items-center gap-2 fw-bold" href="#/">
          <span class="fs-4">🏝️</span>
          <span>Đảo Tri Thức</span>
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            ${currentUser ? (isTeacher ? `
              <li class="nav-item"><a class="nav-link" href="#/teacher-dashboard">📋 Quản Lý</a></li>
            ` : `
              <li class="nav-item"><a class="nav-link" href="#/student-dashboard">🗺️ Bản Đồ</a></li>
              <li class="nav-item"><a class="nav-link" href="#/certificate">🎓 Chứng Nhận</a></li>
            `) : ''}
          </ul>
          <div class="d-flex align-items-center gap-3">
            ${currentUser ? `
              <div class="text-white text-end d-none d-md-block">
                <div class="fw-bold">${currentUser.fullName || 'Người dùng'}</div>
                <small class="badge bg-light text-dark">${isTeacher ? '👨‍🏫 Giáo viên' : '👨‍🎓 Học sinh'}</small>
              </div>
              <button id="btn-global-logout" class="btn btn-outline-light btn-sm">🚪 Đăng xuất</button>
            ` : `
              <a href="#/login" class="btn btn-light text-primary fw-bold btn-sm px-3">🔑 Đăng nhập</a>
            `}
          </div>
        </div>
      </div>
    </nav>
  `;

  const logoutBtn = navContainer.querySelector('#btn-global-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await logoutUser();
      store.setState({ currentUser: null });
      window.location.hash = ROUTES.LOGIN;
    });
  }
};

const renderFooter = () => {
  const footerContainer = document.querySelector('#footer-container');
  if (!footerContainer) return;
  footerContainer.innerHTML = `
    <footer class="bg-dark text-white-50 py-4 mt-auto border-top">
      <div class="container text-center">
        <p class="mb-1 text-white fw-semibold">Ứng Dụng Học Tập Gamification Toán 6</p>
        <small>© ${new Date().getFullYear()} Đảo Tri Thức. All rights reserved.</small>
      </div>
    </footer>
  `;
};

const initApp = async () => {
  renderFooter();

  // Đăng ký các Routes
  registerRoute(ROUTES.LOGIN, renderLoginPage, { title: 'Đăng nhập' });
  registerRoute(ROUTES.STUDENT_DASHBOARD, renderStudentDashboardPage, { allowedRoles: [ROLES.STUDENT], title: 'Bản Đồ Đảo' });
  registerRoute(ROUTES.TEACHER_DASHBOARD, renderTeacherDashboardPage, { allowedRoles: [ROLES.TEACHER], title: 'Quản Lý Lớp' });
  registerRoute('#/certificate', renderCertificatePage, { allowedRoles: [ROLES.STUDENT], title: 'Chứng Nhận' });
  registerRoute('#/lesson', renderLessonDetailPage, { allowedRoles: [ROLES.STUDENT], title: 'Bài Học' });

  // Kiểm tra đăng nhập (Học sinh cũ hoặc phiên làm việc)
  const user = await checkAuthStatus();
  if (user) {
    store.setState({ currentUser: user });
  }

  store.subscribe(renderNavbar);
  renderNavbar();
  initRouter();
};

document.addEventListener('DOMContentLoaded', initApp);

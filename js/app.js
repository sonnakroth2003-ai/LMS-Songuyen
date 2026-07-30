/**
 * @file app.js
 * @description Entry point chính khởi chạy ứng dụng web học tập "Đảo Tri Thức - Toán 6".
 */

import { store } from './core/store.js';
import { initRouter } from './core/router.js';
import { logoutUser, onAuthStateChangedListener } from './core/auth.js';

/**
 * Render Navbar / Header chung cho toàn ứng dụng
 */
const renderNavbar = () => {
  const navContainer = document.querySelector('#navbar-container');
  if (!navContainer) return;

  const state = store.getState();
  const currentUser = state.currentUser;

  // Kiểm tra vai trò giáo viên
  const isTeacher = currentUser?.role === 'teacher';

  navContainer.innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div class="container">
        <a class="navbar-brand d-flex align-items-center gap-2 fw-bold" href="#/">
          <span class="fs-4">🏝️</span>
          <span>Đảo Tri Thức - Toán 6</span>
        </a>

        <button 
          class="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            ${
              currentUser
                ? isTeacher
                  ? `
                    <li class="nav-item">
                      <a class="nav-link" href="#/teacher-dashboard">📋 Quản Lý Lớp Học</a>
                    </li>
                  `
                  : `
                    <li class="nav-item">
                      <a class="nav-link" href="#/student-dashboard">🗺️ Bản Đồ Đảo</a>
                    </li>
                    <li class="nav-item">
                      <a class="nav-link" href="#/certificate">🎓 Chứng Nhận</a>
                    </li>
                  `
                : ''
            }
          </ul>

          <div class="d-flex align-items-center gap-3">
            ${
              currentUser
                ? `
                  <div class="text-white text-end d-none d-md-block">
                    <div class="fw-bold fs-6">${currentUser.fullName || currentUser.username || 'Người dùng'}</div>
                    <small class="badge bg-light text-dark text-capitalize">${isTeacher ? '👨‍🏫 Giáo viên' : '👨‍🎓 Học sinh'}</small>
                  </div>
                  <button id="btn-global-logout" class="btn btn-outline-light btn-sm">
                    🚪 Đăng xuất
                  </button>
                `
                : `
                  <a href="#/login" class="btn btn-light text-primary fw-bold btn-sm px-3">
                    🔑 Đăng nhập
                  </a>
                `
            }
          </div>
        </div>
      </div>
    </nav>
  `;

  // Gắn sự kiện nút Đăng xuất
  const logoutBtn = navContainer.querySelector('#btn-global-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      if (confirm('Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?')) {
        await logoutUser();
        window.location.hash = '#/login';
      }
    });
  }
};

/**
 * Render Footer chung cho ứng dụng
 */
const renderFooter = () => {
  const footerContainer = document.querySelector('#footer-container');
  if (!footerContainer) return;

  footerContainer.innerHTML = `
    <footer class="bg-dark text-white-50 py-4 mt-auto border-top">
      <div class="container text-center">
        <p class="mb-1 text-white fw-semibold">Ứng Dụng Học Tập Gamification Toán 6 - Đảo Tri Thức</p>
        <small>© ${new Date().getFullYear()} Chương trình GDPT 2018. Mọi quyền được bảo lưu.</small>
      </div>
    </footer>
  `;
};

/**
 * Khởi tạo ứng dụng
 */
const initApp = () => {
  console.log('[App] Đang khởi chạy ứng dụng Đảo Tri Thức...');

  // Render các thành phần tĩnh chung
  renderFooter();

  // Đăng ký lắng nghe sự kiện thay đổi state trong Store để re-render Navbar
  store.subscribe(() => {
    renderNavbar();
  });

  // Lắng nghe trạng thái xác thực từ Firebase (hoặc Mock Session)
  if (typeof onAuthStateChangedListener === 'function') {
    onAuthStateChangedListener((user) => {
      store.setState({ currentUser: user });
      renderNavbar();
    });
  } else {
    renderNavbar();
  }

  // Khởi tạo bộ định tuyến (Router sẽ tự động lắng nghe hashchange và xử lý route đầu tiên)
  initRouter();
};

// Kích hoạt ứng dụng khi DOM đã sẵn sàng
document.addEventListener('DOMContentLoaded', initApp);

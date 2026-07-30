/**
 * @file navbar.js
 * @description Component điều hướng dùng chung cho hệ thống LMS.
 */

import { logoutUser, getCurrentUser } from '../services/auth-service.js';
import { ROLES, ROUTES } from '../config/constants.js';

/**
 * Render cấu trúc Navbar dựa trên trạng thái người dùng
 * @param {Object|null} user - Thông tin người dùng hiện tại
 * @param {string} currentPath - Đường dẫn/trang hiện tại để highlight
 * @returns {string} Chuỗi HTML Navbar
 */
export const renderNavbarHTML = (user, currentPath = window.location.pathname) => {
  if (!user) {
    // Giao diện Navbar khi chưa đăng nhập
    return `
      <nav class="lms-navbar navbar-guest">
        <div class="navbar-container">
          <a href="${ROUTES.LOGIN}" class="navbar-brand">
            <span class="brand-icon">📐</span>
            <span class="brand-text">Toán 6 - LMS</span>
          </a>
          <div class="navbar-actions">
            <a href="${ROUTES.LOGIN}" class="btn btn-outline">Đăng Nhập</a>
          </div>
        </div>
      </nav>
    `;
  }

  const isTeacher = user.role === ROLES.TEACHER;
  const isStudent = user.role === ROLES.STUDENT;

  // Tạo các liên kết điều hướng dựa vào Role
  let navLinks = '';

  if (isStudent) {
    navLinks = `
      <li class="nav-item ${currentPath.includes('student-dashboard') ? 'active' : ''}">
        <a href="${ROUTES.STUDENT_DASHBOARD}" class="nav-link">
          <span class="icon">🏝️</span> Các Đảo Học Tập
        </a>
      </li>
      <li class="nav-item ${currentPath.includes('certificate') ? 'active' : ''}">
        <a href="${ROUTES.STUDENT_CERTIFICATE}" class="nav-link">
          <span class="icon">🎓</span> Chứng Nhận
        </a>
      </li>
    `;
  } else if (isTeacher) {
    navLinks = `
      <li class="nav-item ${currentPath.includes('teacher-dashboard') ? 'active' : ''}">
        <a href="${ROUTES.TEACHER_DASHBOARD}" class="nav-link">
          <span class="icon">📊</span> Quản Lý Lớp Học
        </a>
      </li>
      <li class="nav-item ${currentPath.includes('question-management') ? 'active' : ''}">
        <a href="${ROUTES.QUESTION_MANAGEMENT || '#/questions'}" class="nav-link">
          <span class="icon">📝</span> Ngân Hàng Câu Hỏi
        </a>
      </li>
    `;
  }

  const avatarUrl = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || 'User')}&background=0D8ABC&color=fff`;

  return `
    <nav class="lms-navbar">
      <div class="navbar-container">
        <!-- Logo / Brand -->
        <a href="${isTeacher ? ROUTES.TEACHER_DASHBOARD : ROUTES.STUDENT_DASHBOARD}" class="navbar-brand">
          <span class="brand-icon">📐</span>
          <span class="brand-text">Toán 6 - LMS</span>
        </a>

        <!-- Mobile Toggle Button -->
        <button class="navbar-toggle" id="navbar-toggle-btn" aria-label="Toggle navigation">
          <span class="hamburger-bar"></span>
          <span class="hamburger-bar"></span>
          <span class="hamburger-bar"></span>
        </button>

        <!-- Navigation Links -->
        <div class="navbar-menu" id="navbar-menu-container">
          <ul class="nav-list">
            ${navLinks}
          </ul>

          <!-- User Profile & Actions -->
          <div class="user-profile-menu">
            <div class="user-info">
              <img src="${avatarUrl}" alt="Avatar" class="user-avatar" />
              <div class="user-details">
                <span class="user-name">${user.fullName || 'Người dùng'}</span>
                <span class="user-role-badge badge-${user.role}">
                  ${isTeacher ? 'Giáo Viên' : 'Học Sinh'}
                </span>
              </div>
            </div>
            
            <button id="btn-navbar-logout" class="btn btn-logout" title="Đăng xuất">
              <span class="icon">🚪</span>
              <span class="text">Đăng Xuất</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  `;
};

/**
 * Gắn các sự kiện tương tác cho Navbar (Toggle Mobile, Logout)
 * @param {Function} [onLogoutSuccess] - Callback thực thi sau khi đăng xuất thành công
 */
export const setupNavbarEvents = (onLogoutSuccess) => {
  // 1. Lắng nghe sự kiện click Đăng xuất
  const logoutBtn = document.getElementById('btn-navbar-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      const confirmLogout = window.confirm('Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?');
      if (confirmLogout) {
        try {
          await logoutUser();
          if (typeof onLogoutSuccess === 'function') {
            onLogoutSuccess();
          } else {
            window.location.href = ROUTES.LOGIN;
          }
        } catch (error) {
          console.error('[Navbar Component] Lỗi khi đăng xuất:', error);
          alert('Không thể đăng xuất. Vui lòng thử lại.');
        }
      }
    });
  }

  // 2. Lắng nghe sự kiện Menu Mobile Toggle
  const toggleBtn = document.getElementById('navbar-toggle-btn');
  const menuContainer = document.getElementById('navbar-menu-container');

  if (toggleBtn && menuContainer) {
    toggleBtn.addEventListener('click', () => {
      menuContainer.classList.toggle('is-open');
      toggleBtn.classList.toggle('is-active');
    });
  }
};

/**
 * Hàm hỗ trợ mount nhanh Navbar vào container chỉ định
 * @param {string|HTMLElement} target - Element hoặc selector container (vd: '#app-header')
 * @param {Object|null} user - User object
 * @param {Function} [onLogoutSuccess] - Callback sau đăng xuất
 */
export const initNavbar = (target, user = getCurrentUser(), onLogoutSuccess) => {
  const container = typeof target === 'string' ? document.querySelector(target) : target;
  if (!container) {
    console.warn('[Navbar Component] Không tìm thấy phần tử DOM target để gắn Navbar.');
    return;
  }

  container.innerHTML = renderNavbarHTML(user);
  setupNavbarEvents(onLogoutSuccess);
};

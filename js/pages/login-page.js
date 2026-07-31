/**
 * @file login-page.js
 * @description Trang đăng nhập hệ thống "Đảo Tri Thức".
 */

import { store } from '../core/store.js';
import { loginUser } from '../core/auth.js';
import { ROUTES } from '../config/constants.js';

const renderLoginFormHTML = () => {
  return `
    <div class="container py-5">
      <div class="row justify-content-center align-items-center min-vh-75">
        <div class="col-12 col-md-8 col-lg-5">
          <div class="card shadow-lg border-0 rounded-lg">
            <div class="card-header bg-primary text-white text-center py-4">
              <h2 class="fw-bold mb-1">🏝️ Đảo Tri Thức</h2>
              <p class="small mb-0 opacity-75">Hệ Thống Học Tập & Luyện Tập Toán 6</p>
            </div>
            <div class="card-body p-4 p-sm-5">
              <form id="login-form" novalidate>
                <div id="login-error-alert" class="alert alert-danger d-none" role="alert"></div>

                <div class="mb-3">
                  <label class="form-label fw-bold">Bạn là:</label>
                  <div class="d-flex gap-3">
                    <div class="form-check flex-fill border rounded p-2 ps-4">
                      <input class="form-check-input" type="radio" name="role" id="role-student" value="student" checked>
                      <label class="form-check-label fw-semibold" for="role-student">👨‍🎓 Học sinh</label>
                    </div>
                    <div class="form-check flex-fill border rounded p-2 ps-4">
                      <input class="form-check-input" type="radio" name="role" id="role-teacher" value="teacher">
                      <label class="form-check-label fw-semibold" for="role-teacher">👩‍🏫 Giáo viên</label>
                    </div>
                  </div>
                </div>

                <div class="mb-3">
                  <label for="username" class="form-label fw-bold" id="username-label">Tên học sinh</label>
                  <input type="text" class="form-control form-control-lg" id="username" placeholder="Nhập tên..." required>
                </div>

                <div class="mb-4" id="password-group">
                  <label for="password" class="form-label fw-bold">Mật khẩu</label>
                  <input type="password" class="form-control form-control-lg" id="password" placeholder="Nhập mật khẩu...">
                </div>

                <button type="submit" id="btn-submit-login" class="btn btn-primary btn-lg w-100 shadow-sm">🚀 Đăng Nhập</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
};

export const renderLoginPage = (container) => {
  if (!container) return;
  container.innerHTML = renderLoginFormHTML();

  const form = container.querySelector('#login-form');
  const passwordGroup = container.querySelector('#password-group');
  const usernameLabel = container.querySelector('#username-label');
  const usernameInput = container.querySelector('#username');
  const errorAlert = container.querySelector('#login-error-alert');
  const submitBtn = container.querySelector('#btn-submit-login');

  // Đổi nhãn và ẩn/hiện mật khẩu theo vai trò
  container.querySelectorAll('input[name="role"]').forEach(input => {
    input.addEventListener('change', (e) => {
      if (e.target.value === 'teacher') {
        usernameLabel.textContent = 'Email / Tài khoản Giáo viên';
        passwordGroup.classList.remove('d-none');
      } else {
        usernameLabel.textContent = 'Tên học sinh';
        passwordGroup.classList.add('d-none');
      }
    });
  });

  // Xử lý submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    const password = container.querySelector('#password').value || '123';
    const selectedRole = container.querySelector('input[name="role"]:checked').value;

    try {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '⏳ Đang đăng nhập...';

      // Gọi hàm login từ auth.js (đã có sẵn logic cho Giáo viên và Học sinh)
      const user = await loginUser(username, password, selectedRole);
      
      if (user) {
        store.setState({ currentUser: user });
        window.location.hash = user.role === 'teacher' ? ROUTES.TEACHER_DASHBOARD : ROUTES.STUDENT_DASHBOARD;
      }
    } catch (err) {
      errorAlert.textContent = err.message;
      errorAlert.classList.remove('d-none');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '🚀 Đăng Nhập';
    }
  });
};

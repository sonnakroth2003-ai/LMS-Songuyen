/**
 * @file login-page.js
 * @description Trang đăng nhập hệ thống LMS Hành Trình Khám Phá Các Đảo Tri Thức.
 */

import { store } from '../core/store.js';
import { loginUser } from '../core/auth.js';

/**
 * Render chuỗi HTML cho trang Đăng Nhập
 * @returns {string} Chuỗi HTML
 */
const renderLoginFormHTML = () => {
  return `
    <div class="login-page-container container py-5">
      <div class="row justify-content-center align-items-center min-vh-75">
        <div class="col-12 col-md-8 col-lg-5">
          <div class="card shadow-lg border-0 rounded-lg">
            <div class="card-header bg-primary text-white text-center py-4">
              <h2 class="fw-bold mb-1">🏝️ Đảo Tri Thức</h2>
              <p class="small mb-0 opacity-75">Hệ Thống Học Tập & Luyện Tập Toán 6</p>
            </div>
            
            <div class="card-body p-4 p-sm-5">
              <form id="login-form" novalidate>
                <!-- Thông báo lỗi (mặc định ẩn) -->
                <div id="login-error-alert" class="alert alert-danger d-none" role="alert"></div>

                <!-- Chọn vai trò -->
                <div class="mb-3">
                  <label class="form-label fw-bold">Bạn là:</label>
                  <div class="d-flex gap-3">
                    <div class="form-check flex-fill border rounded p-2 ps-4 cursor-pointer">
                      <input class="form-check-input" type="radio" name="role" id="role-student" value="student" checked>
                      <label class="form-check-input-label fw-semibold cursor-pointer" for="role-student">
                        👨‍🎓 Học sinh
                      </label>
                    </div>
                    <div class="form-check flex-fill border rounded p-2 ps-4 cursor-pointer">
                      <input class="form-check-input" type="radio" name="role" id="role-teacher" value="teacher">
                      <label class="form-check-input-label fw-semibold cursor-pointer" for="role-teacher">
                        👩‍🏫 Giáo viên
                      </label>
                    </div>
                  </div>
                </div>

                <!-- Tài khoản / Mã số -->
                <div class="mb-3">
                  <label for="username" class="form-label fw-bold" id="username-label">Tài khoản / Mã học sinh</label>
                  <input 
                    type="text" 
                    class="form-control form-control-lg" 
                    id="username" 
                    placeholder="Nhập tên đăng nhập hoặc mã học sinh..."
                    required
                  >
                  <div class="invalid-feedback">Vui lòng nhập tài khoản hoặc mã số!</div>
                </div>

                <!-- Mật khẩu -->
                <div class="mb-4">
                  <label for="password" class="form-label fw-bold">Mật khẩu</label>
                  <input 
                    type="password" 
                    class="form-control form-control-lg" 
                    id="password" 
                    placeholder="Nhập mật khẩu..."
                    required
                  >
                  <div class="invalid-feedback">Vui lòng nhập mật khẩu!</div>
                </div>

                <!-- Nút Đăng nhập -->
                <button type="submit" id="btn-submit-login" class="btn btn-primary btn-lg w-100 shadow-sm">
                  🚀 Đăng Nhập
                </button>
              </form>
            </div>

            <div class="card-footer bg-light text-center py-3 text-muted small">
              Chúc các em có một chuyến hành trình khám phá thú vị! 🌟
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
};

/**
 * Khởi tạo và Render trang Login Page
 * @param {HTMLElement} container - Element chứa trang
 */
export const renderLoginPage = (container) => {
  if (!container) return;

  // Render HTML
  container.innerHTML = renderLoginFormHTML();

  // Gắn sự kiện
  setupLoginEvents(container);
};

/**
 * Gắn các sự kiện lắng nghe trên form Đăng nhập
 * @param {HTMLElement} container 
 */
const setupLoginEvents = (container) => {
  const form = container.querySelector('#login-form');
  const errorAlert = container.querySelector('#login-error-alert');
  const submitBtn = container.querySelector('#btn-submit-login');
  const roleInputs = container.querySelectorAll('input[name="role"]');
  const usernameLabel = container.querySelector('#username-label');
  const usernameInput = container.querySelector('#username');

  // Đổi nhãn input theo vai trò
  roleInputs.forEach((input) => {
    input.addEventListener('change', (e) => {
      if (e.target.value === 'teacher') {
        usernameLabel.textContent = 'Email / Tên tài khoản Giáo viên';
        usernameInput.placeholder = 'Nhập email hoặc tên tài khoản giáo viên...';
      } else {
        usernameLabel.textContent = 'Tài khoản / Mã học sinh';
        usernameInput.placeholder = 'Nhập tên đăng nhập hoặc mã học sinh...';
      }
    });
  });

  // Xử lý Submit Form
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Reset alert
    errorAlert.classList.add('d-none');
    errorAlert.textContent = '';

    const username = usernameInput.value.trim();
    const password = container.querySelector('#password').value;
    const selectedRole = container.querySelector('input[name="role"]:checked')?.value || 'student';

    // Validate đơn giản
    if (!username || !password) {
      errorAlert.textContent = 'Vui lòng nhập đầy đủ Tài khoản và Mật khẩu!';
      errorAlert.classList.remove('d-none');
      return;
    }

    try {
      // Hiệu ứng Loading
      submitBtn.disabled = true;
      submitBtn.innerHTML = '⏳ Đang đăng nhập...';

      // Gọi service đăng nhập
      const user = await loginUser(username, password, selectedRole);

      if (user) {
        // Cập nhật State toàn cục
        store.setCurrentUser(user);

        // Điều hướng theo vai trò
        if (user.role === 'teacher') {
          window.location.hash = '#/teacher-dashboard';
        } else {
          window.location.hash = '#/student-dashboard';
        }
      } else {
        throw new Error('Tài khoản hoặc mật khẩu không chính xác!');
      }

    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      errorAlert.textContent = error.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!';
      errorAlert.classList.remove('d-none');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '🚀 Đăng Nhập';
    }
  });
};

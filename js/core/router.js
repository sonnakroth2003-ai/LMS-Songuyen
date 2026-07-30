/**
 * @file router.js
 * @description Quản lý Client-side Hash Router và phân quyền bảo vệ đường dẫn cho SPA.
 */

import { ROUTES, ROLES } from '../config/constants.js';
import { getCurrentUser } from './auth.js';

/**
 * Bảng lưu trữ cấu hình các routes trong hệ thống
 * Key: Hash path (e.g. '#/login')
 * Value: { render: Function, roles: Array<string>|null, title: string }
 */
const routesMap = new Map();

/**
 * Container DOM mặc định để render giao diện trang
 */
let appContainer = null;

/**
 * Đăng ký một route mới vào hệ thống Router
 * @param {string} path - Hash route path (e.g. '#/login')
 * @param {Function} renderFn - Hàm async/sync trả về HTML string hoặc Element để render
 * @param {Object} options - Tùy chọn cấu hình
 * @param {Array<string>|null} options.allowedRoles - Danh sách role được phép truy cập (null = public)
 * @param {string} options.title - Tiêu đề hiển thị của trang
 */
export const registerRoute = (path, renderFn, options = {}) => {
  const { allowedRoles = null, title = 'LMS Toán THCS' } = options;
  routesMap.set(path, {
    render: renderFn,
    allowedRoles,
    title
  });
};

/**
 * Chuyển hướng trang bằng lập trình (Programmatic Navigation)
 * @param {string} path - Hash path đích
 */
export const navigateTo = (path) => {
  if (window.location.hash === path) {
    handleRouteChange();
  } else {
    window.location.hash = path;
  }
};

/**
 * Lấy các tham số query từ hash (Ví dụ: #/student/lesson?id=123 -> { id: '123' })
 * @returns {Object}
 */
export const getQueryParams = () => {
  const hash = window.location.hash;
  const queryStringIndex = hash.indexOf('?');
  if (queryStringIndex === -1) return {};

  const searchParams = new URLSearchParams(hash.slice(queryStringIndex + 1));
  const params = {};
  for (const [key, value] of searchParams.entries()) {
    params[key] = value;
  }
  return params;
};

/**
 * Xử lý kiểm tra quyền và render trang khi route thay đổi
 */
const handleRouteChange = async () => {
  if (!appContainer) {
    appContainer = document.getElementById('app');
  }

  if (!appContainer) {
    console.error('[Router] Không tìm thấy phần tử container #app!');
    return;
  }

  // Tách lấy route path bỏ phần query string
  const fullHash = window.location.hash || ROUTES.LOGIN;
  const pathOnly = fullHash.split('?')[0];

  const route = routesMap.get(pathOnly);
  const user = getCurrentUser();

  // 1. Trường hợp Route không tồn tại trong hệ thống
  if (!route) {
    console.warn(`[Router] Route không hợp lệ: ${pathOnly}`);
    if (user) {
      const redirectPath = user.role === ROLES.TEACHER 
        ? ROUTES.TEACHER_DASHBOARD 
        : ROUTES.STUDENT_DASHBOARD;
      navigateTo(redirectPath);
    } else {
      navigateTo(ROUTES.LOGIN);
    }
    return;
  }

  // 2. Route Guard - Kiểm tra đăng nhập và phân quyền (Authorization)
  const isPublicRoute = !route.allowedRoles || route.allowedRoles.length === 0;

  if (!isPublicRoute) {
    // Chưa đăng nhập -> Chuyển về Login
    if (!user) {
      console.warn('[Router] Yêu cầu đăng nhập để truy cập trang này.');
      navigateTo(ROUTES.LOGIN);
      return;
    }

    // Đã đăng nhập nhưng sai Role -> Chuyển về Dashboard tương ứng
    if (!route.allowedRoles.includes(user.role)) {
      console.warn(`[Router] User role "${user.role}" không có quyền truy cập route "${pathOnly}".`);
      const defaultDashboard = user.role === ROLES.TEACHER 
        ? ROUTES.TEACHER_DASHBOARD 
        : ROUTES.STUDENT_DASHBOARD;
      navigateTo(defaultDashboard);
      return;
    }
  } else {
    // Nếu đã đăng nhập mà cố vào trang Login -> Chuyển thẳng về Dashboard
    if (user && pathOnly === ROUTES.LOGIN) {
      const defaultDashboard = user.role === ROLES.TEACHER 
        ? ROUTES.TEACHER_DASHBOARD 
        : ROUTES.STUDENT_DASHBOARD;
      navigateTo(defaultDashboard);
      return;
    }
  }

  // 3. Render giao diện và Cập nhật Title
  try {
    document.title = route.title;
    
    // Đưa container về trạng thái loading nhẹ trong khi render
    appContainer.classList.add('route-loading');
    
    const content = await route.render();
    
    if (typeof content === 'string') {
      appContainer.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      appContainer.innerHTML = '';
      appContainer.appendChild(content);
    }

    // Cuộn lên đầu trang sau khi render xong
    window.scrollTo(0, 0);
  } catch (error) {
    console.error('[Router] Lỗi khi render route:', error);
    appContainer.innerHTML = `
      <div class="error-container" style="padding: 2rem; text-align: center;">
        <h2>Đã xảy ra lỗi khi tải trang</h2>
        <p>${error.message || 'Vui lòng thử lại sau.'}</p>
      </div>
    `;
  } finally {
    appContainer.classList.remove('route-loading');
  }
};

/**
 * Khởi tạo Bộ điều hướng Router
 */
export const initRouter = () => {
  // Lắng nghe sự kiện đổi hash trên trình duyệt
  window.addEventListener('hashchange', handleRouteChange);

  // Xử lý route khởi chạy ban đầu
  if (!window.location.hash) {
    window.location.hash = ROUTES.LOGIN;
  } else {
    handleRouteChange();
  }
};

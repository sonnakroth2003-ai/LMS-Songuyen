/**
 * @file router.js
 * @description Quản lý Client-side Hash Router và phân quyền bảo vệ đường dẫn cho SPA.
 */

import { ROUTES, ROLES } from '../config/constants.js';
import { getCurrentUser } from './auth.js';

const routesMap = new Map();
let appContainer = null;

export const registerRoute = (path, renderFn, options = {}) => {
  const { allowedRoles = null, title = 'LMS Toán THCS' } = options;
  routesMap.set(path, { render: renderFn, allowedRoles, title });
};

export const navigateTo = (path) => {
  if (window.location.hash === path) {
    handleRouteChange();
  } else {
    window.location.hash = path;
  }
};

const handleRouteChange = async () => {
  if (!appContainer) appContainer = document.getElementById('app');
  if (!appContainer) return;

  // Xử lý chuẩn hóa hash: nếu là #, #/ hoặc rỗng -> chuyển về Dashboard mặc định
  let fullHash = window.location.hash || ROUTES.STUDENT_DASHBOARD;
  if (fullHash === '#' || fullHash === '#/') {
    fullHash = ROUTES.STUDENT_DASHBOARD;
  }
  
  const pathOnly = fullHash.split('?')[0];
  const route = routesMap.get(pathOnly);
  const user = getCurrentUser();

  // 1. Route không tồn tại
  if (!route) {
    console.warn(`[Router] Route không hợp lệ: ${pathOnly}`);
    const fallbackPath = user 
      ? (user.role === ROLES.TEACHER ? ROUTES.TEACHER_DASHBOARD : ROUTES.STUDENT_DASHBOARD)
      : ROUTES.LOGIN;
    if (pathOnly !== fallbackPath) navigateTo(fallbackPath);
    return;
  }

  // 2. Route Guard - Kiểm tra phân quyền
  const isPublicRoute = !route.allowedRoles || route.allowedRoles.length === 0;

  if (!isPublicRoute) {
    if (!user) {
      if (pathOnly !== ROUTES.LOGIN) navigateTo(ROUTES.LOGIN);
      return;
    }
    if (!route.allowedRoles.includes(user.role)) {
      const defaultDashboard = user.role === ROLES.TEACHER ? ROUTES.TEACHER_DASHBOARD : ROUTES.STUDENT_DASHBOARD;
      if (pathOnly !== defaultDashboard) navigateTo(defaultDashboard);
      return;
    }
  } else if (user && pathOnly === ROUTES.LOGIN) {
    const defaultDashboard = user.role === ROLES.TEACHER ? ROUTES.TEACHER_DASHBOARD : ROUTES.STUDENT_DASHBOARD;
    navigateTo(defaultDashboard);
    return;
  }

  // 3. Render giao diện
  try {
    document.title = route.title;
    appContainer.classList.add('route-loading');
    const content = await route.render(appContainer, {});
    
    if (typeof content === 'string') appContainer.innerHTML = content;
    window.scrollTo(0, 0);
  } catch (error) {
    console.error('[Router] Lỗi khi render route:', error);
    appContainer.innerHTML = `<div class="error-container" style="padding: 2rem; text-align: center;"><h2>Đã xảy ra lỗi</h2><p>${error.message}</p></div>`;
  } finally {
    appContainer.classList.remove('route-loading');
  }
};

export const initRouter = () => {
  window.addEventListener('hashchange', handleRouteChange);
  // Gọi ngay lần đầu để load trang hiện tại
  handleRouteChange();
};

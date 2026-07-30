/**
 * @file modal.js
 * @description Component quản lý và hiển thị Hộp thoại Popup (Modal) dùng chung trong LMS Toán 6.
 */

/** ID của phần tử Modal Wrapper trên DOM */
const MODAL_CONTAINER_ID = 'lms-global-modal';

/**
 * Khởi tạo hoặc lấy ra container chứa Modal
 * @returns {HTMLElement} Element wrapper của Modal
 */
const getOrCreateModalContainer = () => {
  let container = document.getElementById(MODAL_CONTAINER_ID);
  if (!container) {
    container = document.createElement('div');
    container.id = MODAL_CONTAINER_ID;
    container.className = 'modal-wrapper-container';
    document.body.appendChild(container);
  }
  return container;
};

/**
 * Khóa hoặc mở lại hiệu ứng cuộn trang của body
 * @param {boolean} lock - true để khóa cuộn, false để mở lại
 */
const toggleBodyScroll = (lock) => {
  if (lock) {
    document.body.classList.add('modal-open');
  } else {
    // Chỉ gỡ bỏ khi không còn modal nào đang hiển thị
    const container = document.getElementById(MODAL_CONTAINER_ID);
    if (!container || container.children.length === 0) {
      document.body.classList.remove('modal-open');
    }
  }
};

/**
 * Đóng và dọn dẹp Modal khỏi DOM
 * @param {HTMLElement} modalOverlayElement - Element overlay chứa modal cần đóng
 */
export const closeModal = (modalOverlayElement) => {
  if (!modalOverlayElement) {
    const container = document.getElementById(MODAL_CONTAINER_ID);
    if (container) container.innerHTML = '';
    toggleBodyScroll(false);
    return;
  }

  modalOverlayElement.classList.remove('active');
  setTimeout(() => {
    if (modalOverlayElement.parentNode) {
      modalOverlayElement.parentNode.removeChild(modalOverlayElement);
    }
    toggleBodyScroll(false);
  }, 200); // Khớp với hiệu ứng transition CSS (200ms)
};

/**
 * Hiển thị Hộp thoại Thông báo đơn giản (Alert Modal)
 * @param {Object} options - Tham số cấu hình
 * @param {string} options.title - Tiêu đề thông báo
 * @param {string} options.message - Nội dung thông báo (hỗ trợ chuỗi HTML)
 * @param {string} [options.type='info'] - Loại thông báo: 'success' | 'warning' | 'error' | 'info'
 * @param {string} [options.confirmText='Đồng ý'] - Nhãn nút đóng/đồng ý
 * @returns {Promise<void>} Trả về Promise khi người dùng đóng Modal
 */
export const showAlert = ({ title = 'Thông báo', message = '', type = 'info', confirmText = 'Đồng ý' }) => {
  return new Promise((resolve) => {
    const container = getOrCreateModalContainer();

    const typeIcons = {
      success: '🎉',
      warning: '⚠️',
      error: '❌',
      info: '💡'
    };

    const icon = typeIcons[type] || '💡';

    const modalHTML = `
      <div class="modal-overlay active" id="current-alert-modal">
        <div class="modal-card modal-type-${type}">
          <div class="modal-header">
            <span class="modal-icon">${icon}</span>
            <h3 class="modal-title">${title}</h3>
          </div>
          <div class="modal-body">
            <div class="modal-message">${message}</div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary btn-modal-confirm">${confirmText}</button>
          </div>
        </div>
      </div>
    `;

    container.insertAdjacentHTML('beforeend', modalHTML);
    toggleBodyScroll(true);

    const overlay = container.querySelector('#current-alert-modal');
    const confirmBtn = overlay.querySelector('.btn-modal-confirm');

    const handleClose = () => {
      closeModal(overlay);
      resolve();
    };

    confirmBtn.addEventListener('click', handleClose);

    // Bấm phím ESC để đóng
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        document.removeEventListener('keydown', handleKeyDown);
        handleClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
  });
};

/**
 * Hiển thị Hộp thoại Xác nhận (Confirm Modal)
 * @param {Object} options - Tham số cấu hình
 * @param {string} options.title - Tiêu đề hộp thoại
 * @param {string} options.message - Nội dung câu hỏi xác nhận
 * @param {string} [options.confirmText='Xác nhận'] - Nhãn nút đồng ý
 * @param {string} [options.cancelText='Hủy bỏ'] - Nhãn nút hủy
 * @param {string} [options.type='warning'] - Loại thông báo: 'warning' | 'danger' | 'info'
 * @returns {Promise<boolean>} Trả về true nếu chọn Đồng ý, false nếu chọn Hủy
 */
export const showConfirm = ({
  title = 'Xác nhận action',
  message = 'Bạn có chắc chắn muốn thực hiện thao tác này?',
  confirmText = 'Xác nhận',
  cancelText = 'Hủy bỏ',
  type = 'warning'
}) => {
  return new Promise((resolve) => {
    const container = getOrCreateModalContainer();

    const typeIcons = {
      warning: '❓',
      danger: '🚨',
      info: 'ℹ️'
    };

    const icon = typeIcons[type] || '❓';
    const confirmBtnClass = type === 'danger' ? 'btn-danger' : 'btn-primary';

    const modalHTML = `
      <div class="modal-overlay active" id="current-confirm-modal">
        <div class="modal-card modal-type-${type}">
          <div class="modal-header">
            <span class="modal-icon">${icon}</span>
            <h3 class="modal-title">${title}</h3>
          </div>
          <div class="modal-body">
            <div class="modal-message">${message}</div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary btn-modal-cancel">${cancelText}</button>
            <button class="btn ${confirmBtnClass} btn-modal-confirm">${confirmText}</button>
          </div>
        </div>
      </div>
    `;

    container.insertAdjacentHTML('beforeend', modalHTML);
    toggleBodyScroll(true);

    const overlay = container.querySelector('#current-confirm-modal');
    const confirmBtn = overlay.querySelector('.btn-modal-confirm');
    const cancelBtn = overlay.querySelector('.btn-modal-cancel');

    const handleChoice = (result) => {
      closeModal(overlay);
      resolve(result);
    };

    confirmBtn.addEventListener('click', () => handleChoice(true));
    cancelBtn.addEventListener('click', () => handleChoice(false));

    // Bấm ra ngoài vùng card để hủy
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        handleChoice(false);
      }
    });

    // Bấm ESC để hủy
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        document.removeEventListener('keydown', handleKeyDown);
        handleChoice(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
  });
};

/**
 * Hiển thị Modal tùy chỉnh với giao diện HTML do phía ngoài tự dựng
 * @param {Object} options - Cấu hình Custom Modal
 * @param {string} options.contentHTML - HTML hiển thị bên trong Modal Card
 * @param {boolean} [options.closeOnOverlayClick=true] - Cho phép bấm ra ngoài để đóng không
 * @returns {Object} Trả về đối tượng chứa element modal và hàm đóng modal thủ công
 */
export const showCustomModal = ({ contentHTML = '', closeOnOverlayClick = true }) => {
  const container = getOrCreateModalContainer();

  const modalElement = document.createElement('div');
  modalElement.className = 'modal-overlay active';
  modalElement.innerHTML = `
    <div class="modal-card modal-custom-card">
      <button class="modal-close-btn" aria-label="Đóng">&times;</button>
      <div class="modal-body">
        ${contentHTML}
      </div>
    </div>
  `;

  container.appendChild(modalElement);
  toggleBodyScroll(true);

  const closeBtn = modalElement.querySelector('.modal-close-btn');

  const closeSelf = () => closeModal(modalElement);

  closeBtn.addEventListener('click', closeSelf);

  if (closeOnOverlayClick) {
    modalElement.addEventListener('click', (e) => {
      if (e.target === modalElement) closeSelf();
    });
  }

  return {
    modalElement,
    close: closeSelf
  };
};

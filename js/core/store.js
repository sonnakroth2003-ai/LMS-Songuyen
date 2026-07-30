/**
 * @file store.js
 * @description Quản lý trạng thái ứng dụng theo mô hình tập trung (Global State & Pub-Sub Pattern).
 */

class AppStore {
  constructor() {
    // Trạng thái gốc của ứng dụng
    this.state = {
      currentUser: null,       // Thông tin user hiện tại (uid, email, role, fullName, code, ...)
      isAuthenticated: false,  // Trạng thái đăng nhập
      isLoading: false,        // Trạng thái đang tải toàn cục
      courseData: null,        // Dữ liệu nội dung khóa học (được load từ course-data-seed hoặc course-service)
      studentProgress: {},     // Tiến độ các đảo của học sinh hiện tại { ISLAND_1: { isCompleted, score, ... } }
      teacherStudentsList: [], // Danh sách học sinh (dành cho màn hình giáo viên)
      ui: {
        activeModal: null,     // Modal đang mở
        sidebarOpen: false     // Trạng thái sidebar trên thiết bị di động
      }
    };

    // Danh sách các hàm lắng nghe sự kiện thay đổi state (Listeners)
    this.listeners = [];
  }

  /**
  * Lấy toàn bộ hoặc một phần state hiện tại (trả về bản sao an toàn)
  * @param {string} [key] - Tên thuộc tính cần lấy (nếu có)
  * @returns {any}
  */
  getState(key) {
    if (key) {
      return this.state[key];
    }
    // Trả về bản sao nông (shallow copy) để tránh mutate trực tiếp bên ngoài
    return { ...this.state };
  }

  /**
  * Cập nhật trạng thái ứng dụng và thông báo cho các listener
  * @param {Object} partialState - Đối tượng chứa các state cần thay đổi
  */
  setState(partialState) {
    this.state = {
      ...this.state,
      ...partialState
    };

    // Gọi tất cả các hàm đã đăng ký để báo hiệu state đã đổi
    this.notifyListeners();
  }

  /**
  * Đăng ký một hàm callback để lắng nghe khi state thay đổi
  * @param {Function} listener - Hàm callback nhận vào (newState, oldState)
  * @returns {Function} Hàm hủy đăng ký (unsubscribe)
  */
  subscribe(listener) {
    if (typeof listener !== 'function') return () => {};

    this.listeners.push(listener);

    // Trả về hàm hủy đăng ký
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
  * Thông báo cho tất cả listener
  */
  notifyListeners() {
    const currentState = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(currentState);
      } catch (error) {
        console.error('Lỗi thực thi listener trong store:', error);
      }
    });
  }

  // ==================== C CÁC ACTIONS TIỆN ÍCH ====================

  /**
   * Cập nhật thông tin người dùng sau khi đăng nhập thành công
   * @param {Object|null} user 
   */
  setCurrentUser(user) {
    this.setState({
      currentUser: user,
      isAuthenticated: Boolean(user)
    });
  }

  /**
   * Cập nhật tiến độ học tập của học sinh
   * @param {Object} progressData 
   */
  setStudentProgress(progressData) {
    this.setState({
      studentProgress: progressData || {}
    });
  }

  /**
   * Cập nhật tiến độ của một đảo cụ thể
   * @param {string} islandKey 
   * @param {Object} islandData 
   */
  updateIslandProgress(islandKey, islandData) {
    const currentProgress = { ...this.state.studentProgress };
    currentProgress[islandKey] = {
      ...(currentProgress[islandKey] || {}),
      ...islandData
    };
    this.setState({ studentProgress: currentProgress });
  }

  /**
   * Cập nhật cấu trúc khóa học
   * @param {Object} course 
   */
  setCourseData(course) {
    this.setState({ courseData: course });
  }

  /**
   * Cập nhật danh sách học sinh (dành cho giáo viên)
   * @param {Array} list 
   */
  setTeacherStudentsList(list) {
    this.setState({ teacherStudentsList: list || [] });
  }

  /**
   * Đặt lại toàn bộ store về trạng thái ban đầu (khi đăng xuất)
   */
  resetStore() {
    this.setState({
      currentUser: null,
      isAuthenticated: false,
      isLoading: false,
      courseData: null,
      studentProgress: {},
      teacherStudentsList: [],
      ui: {
        activeModal: null,
        sidebarOpen: false
      }
    });
  }
}

// Khởi tạo một instance duy nhất (Singleton Pattern) dùng chung toàn ứng dụng
export const store = new AppStore();

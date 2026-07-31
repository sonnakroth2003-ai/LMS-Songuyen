/**
 * @file constants.js
 * @description Định nghĩa các hằng số dùng chung trong toàn bộ hệ thống LMS.
 */

// ==========================================================
// 1. VAI TRÒ NGƯỜI DÙNG (USER ROLES)
// ==========================================================
export const ROLES = Object.freeze({
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin'
});

// ==========================================================
// 2. TRẠNG THÁI BÀI HỌC VÀ ĐẢO KHÁM PHÁ (LESSON & ISLAND STATES)
// ==========================================================
export const LESSON_STATUS = Object.freeze({
  LOCKED: 'LOCKED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED'
});

export const ISLAND_STATUS = Object.freeze({
  LOCKED: 'LOCKED',
  UNLOCKED: 'UNLOCKED',
  COMPLETED: 'COMPLETED'
});

// ==========================================================
// 3. THANG ĐIỂM VÀ XẾP LOẠI CHỨNG NHẬN (CERTIFICATE & SCORING)
// ==========================================================
export const SCORE_THRESHOLDS = Object.freeze({
  EXCELLENT: 9.0, // ĐTB >= 9.0: Xuất sắc
  GOOD: 8.0,      // ĐTB >= 8.0: Giỏi
  FAIR: 6.5       // ĐTB >= 6.5: Khá
});

export const ACADEMIC_RANK = Object.freeze({
  EXCELLENT: {
    key: 'EXCELLENT',
    label: 'Xuất sắc',
    minScore: 9.0,
    badgeColor: '#8b5cf6'
  },
  GOOD: {
    key: 'GOOD',
    label: 'Giỏi',
    minScore: 8.0,
    badgeColor: '#10b981'
  },
  FAIR: {
    key: 'FAIR',
    label: 'Khá',
    minScore: 6.5,
    badgeColor: '#3b82f6'
  },
  NOT_QUALIFIED: {
    key: 'NOT_QUALIFIED',
    label: 'Chưa đạt',
    minScore: 0,
    badgeColor: '#6b7280'
  }
});

// ==========================================================
// 4. QUY TẮC BÀI TRẮC NGHIỆM ĐẢO (QUIZ CONFIG)
// ==========================================================
export const QUIZ_CONFIG = Object.freeze({
  QUESTIONS_PER_ISLAND: 5,
  MAX_SCORE: 10,
  TIME_LIMIT_MINUTES: 15
});

// ==========================================================
// 4.5. DỮ LIỆU ĐẢO (ISLANDS DATA)
// ==========================================================
export const ISLANDS = Object.freeze([
  { id: 'island-1', name: 'Đảo Số Nguyên', description: 'Chinh phục tập hợp số nguyên', icon: '🏝️' },
  { id: 'island-2', name: 'Đảo Phân Số', description: 'Khám phá thế giới phân số', icon: '⛵' }
]);

// ==========================================================
// 5. ĐƯỜNG DẪN ĐIỀU HƯỚNG (ROUTES)
// ==========================================================
export const ROUTES = Object.freeze({
  LOGIN: '#/login',
  STUDENT_DASHBOARD: '#/student/dashboard',
  LESSON_DETAIL: '#/student/lesson',
  CERTIFICATE: '#/student/certificate',
  TEACHER_DASHBOARD: '#/teacher/dashboard'
});

// ==========================================================
// 6. TÊN CÁC COLLECTION TRÊN FIRESTORE (FIRESTORE COLLECTIONS)
// ==========================================================
export const DB_COLLECTIONS = Object.freeze({
  USERS: 'users',
  CLASSES: 'classes',
  COURSES: 'courses',
  LESSONS: 'lessons',
  ISLANDS: 'islands',
  QUESTIONS: 'questions',
  STUDENT_PROGRESS: 'student_progress',
  STUDENT_ATTEMPTS: 'student_attempts',
  CERTIFICATES: 'certificates'
});

// ==========================================================
// 7. THÔNG BÁO HỆ THỐNG (SYSTEM MESSAGES)
// ==========================================================
export const MESSAGES = Object.freeze({
  AUTH: {
    LOGIN_SUCCESS: 'Đăng nhập thành công!',
    LOGIN_FAILED: 'Email hoặc mật khẩu không chính xác.',
    UNAUTHORIZED: 'Bạn không có quyền truy cập vào trang này.',
    SESSION_EXPIRED: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.'
  },
  QUIZ: {
    SUBMIT_SUCCESS: 'Nộp bài thành công!',
    MUST_ANSWER_ALL: 'Vui lòng trả lời đầy đủ tất cả các câu hỏi trước khi nộp bài.'
  },
  CERTIFICATE: {
    NOT_ELIGIBLE: 'Bạn chưa đủ điều kiện nhận giấy chứng nhận. Điểm trung bình cần đạt tối thiểu 6.5.'
  },
  EXPORT: {
    SUCCESS: 'Xuất dữ liệu danh sách học sinh ra file Excel thành công!'
  }
});

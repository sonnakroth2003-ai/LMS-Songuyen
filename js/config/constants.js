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
// 2. TRẠNG THÁI BÀI HỌC VÀ ĐẢO (LESSON & ISLAND STATES)
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
// 3. THANG ĐIỂM VÀ XẾP LOẠI CHỨNG NHẬN (SCORING)
// ==========================================================
export const SCORE_THRESHOLDS = Object.freeze({
  EXCELLENT: 9.0,
  GOOD: 8.0,
  FAIR: 6.5
});

export const ACADEMIC_RANK = Object.freeze({
  EXCELLENT: { key: 'EXCELLENT', label: 'Xuất sắc', minScore: 9.0, badgeColor: '#8b5cf6' },
  GOOD: { key: 'GOOD', label: 'Giỏi', minScore: 8.0, badgeColor: '#10b981' },
  FAIR: { key: 'FAIR', label: 'Khá', minScore: 6.5, badgeColor: '#3b82f6' },
  NOT_QUALIFIED: { key: 'NOT_QUALIFIED', label: 'Chưa đạt', minScore: 0, badgeColor: '#6b7280' }
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
// 5. DỮ LIỆU ĐẢO (ISLANDS DATA)
// ==========================================================
export const ISLANDS = Object.freeze({
  ISLAND_1: { id: 'ISLAND_1', name: 'Đảo Tập Hợp', description: 'Chinh phục số tự nhiên', icon: '🏝️' },
  ISLAND_2: { id: 'ISLAND_2', name: 'Đảo Chia Hết', description: 'Tìm hiểu số nguyên tố', icon: '⛵' },
  ISLAND_3: { id: 'ISLAND_3', name: 'Đảo Số Nguyên', description: 'Khám phá tập Z', icon: '🏔️' }
});

// ==========================================================
// 6. ĐƯỜNG DẪN ĐIỀU HƯỚNG (ROUTES)
// ==========================================================
export const ROUTES = Object.freeze({
  LOGIN: '#/login',
  STUDENT_DASHBOARD: '#/student-dashboard',
  LESSON_DETAIL: '#/lesson',
  CERTIFICATE: '#/certificate',
  TEACHER_DASHBOARD: '#/teacher-dashboard'
});

// ==========================================================
// 7. COLLECTION FIRESTORE (DATABASE)
// ==========================================================
export const DB_COLLECTIONS = Object.freeze({
  USERS: 'users',
  STUDENT_PROGRESS: 'student_progress',
  CERTIFICATES: 'certificates'
});

// ==========================================================
// 8. THÔNG BÁO HỆ THỐNG (SYSTEM MESSAGES)
// ==========================================================
export const MESSAGES = Object.freeze({
  AUTH: {
    LOGIN_SUCCESS: 'Đăng nhập thành công!',
    LOGIN_FAILED: 'Thông tin tài khoản không chính xác.',
  },
  QUIZ: {
    SUBMIT_SUCCESS: 'Nộp bài thành công!',
    MUST_ANSWER_ALL: 'Vui lòng hoàn thành đủ các câu hỏi.'
  },
  CERTIFICATE: {
    NOT_ELIGIBLE: 'Chưa đủ điều kiện nhận chứng nhận (ĐTB cần >= 6.5).'
  }
});

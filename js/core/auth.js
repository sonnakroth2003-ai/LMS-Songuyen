import { ROLES, MESSAGES } from '../config/constants.js';

let currentUserProfile = null;

// TÀI KHOẢN GIÁO VIÊN CỐ ĐỊNH (Bạn có thể đổi tùy ý)
const TEACHER_CREDENTIALS = {
  email: 'giaovien@dkt.com',
  password: '123'
};

/**
 * Đăng nhập xử lý cho cả Học sinh (tên) và Giáo viên (email/pass)
 */
export const login = async (username, password, role) => {
  try {
    if (role === 'teacher') {
      // 1. Logic Giáo viên
      if (username === TEACHER_CREDENTIALS.email && password === TEACHER_CREDENTIALS.password) {
        currentUserProfile = {
          uid: 'teacher_admin_01',
          email: username,
          role: ROLES.TEACHER,
          fullName: 'Giáo viên Quản trị'
        };
        return currentUserProfile;
      }
      throw new Error('Sai tài khoản hoặc mật khẩu Giáo viên!');
    } else {
      // 2. Logic Học sinh (Chỉ cần tên là vào học)
      if (!username || username.length < 2) {
        throw new Error('Vui lòng nhập tên học sinh hợp lệ!');
      }
      
      // Tạo profile học sinh dựa trên tên
      currentUserProfile = {
        uid: `student_${username.toLowerCase().replace(/\s/g, '_')}`,
        email: `${username.toLowerCase()}@student.dkt`,
        role: ROLES.STUDENT,
        fullName: username
      };
      
      // Lưu vào localStorage để lần sau vào lại web vẫn nhớ tên
      localStorage.setItem('dkt_student_name', username);
      
      return currentUserProfile;
    }
  } catch (error) {
    console.error('[Auth Service] Login error:', error);
    throw error;
  }
};

export const loginUser = login;

export const logoutUser = async () => {
  currentUserProfile = null;
  localStorage.removeItem('dkt_student_name');
};

export const logout = logoutUser;

export const getCurrentUser = () => currentUserProfile;

export const isTeacher = () => currentUserProfile?.role === ROLES.TEACHER;

export const isStudent = () => currentUserProfile?.role === ROLES.STUDENT;

/**
 * Tự động đăng nhập lại nếu là học sinh đã từng vào web
 */
export const checkAuthStatus = async () => {
  const savedStudent = localStorage.getItem('dkt_student_name');
  if (savedStudent) {
    currentUserProfile = {
      uid: `student_${savedStudent.toLowerCase().replace(/\s/g, '_')}`,
      email: `${savedStudent.toLowerCase()}@student.dkt`,
      role: ROLES.STUDENT,
      fullName: savedStudent
    };
  }
  return currentUserProfile;
};

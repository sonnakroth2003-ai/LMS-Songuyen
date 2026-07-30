/**
 * @file teacher-service.js
 * @description Dịch vụ quản lý lớp học, truy xuất tiến độ học sinh và báo cáo dành cho Giáo viên.
 */

import { calculateAverageScore, getAcademicRank } from './scoring-service.js';
import { ISLANDS } from '../config/constants.js';

/**
 * Mock data danh sách học sinh dùng khi chưa kết nối Firestore thực tế
 */
const MOCK_STUDENTS_LIST = [
  {
    uid: 'STUDENT_001',
    studentCode: 'HS601',
    fullName: 'Nguyen Van An',
    role: 'student',
    progress: {
      islands: {
        ISLAND_1: { isCompleted: true, score: 9, completedAt: '2026-03-10' },
        ISLAND_2: { isCompleted: true, score: 8, completedAt: '2026-03-15' },
        ISLAND_3: { isCompleted: true, score: 10, completedAt: '2026-03-20' },
        ISLAND_4: { isCompleted: true, score: 8.5, completedAt: '2026-03-25' },
        ISLAND_5: { isCompleted: true, score: 9, completedAt: '2026-03-28' }
      }
    }
  },
  {
    uid: 'STUDENT_002',
    studentCode: 'HS602',
    fullName: 'Tran Thi Binh',
    role: 'student',
    progress: {
      islands: {
        ISLAND_1: { isCompleted: true, score: 7, completedAt: '2026-03-12' },
        ISLAND_2: { isCompleted: true, score: 6.5, completedAt: '2026-03-18' },
        ISLAND_3: { isCompleted: false, score: 4, isUnlocked: true }
      }
    }
  },
  {
    uid: 'STUDENT_003',
    studentCode: 'HS603',
    fullName: 'Le Hoang Cường',
    role: 'student',
    progress: {
      islands: {
        ISLAND_1: { isCompleted: true, score: 10, completedAt: '2026-03-11' },
        ISLAND_2: { isCompleted: true, score: 9.5, completedAt: '2026-03-16' },
        ISLAND_3: { isCompleted: true, score: 9, completedAt: '2026-03-22' }
      }
    }
  },
  {
    uid: 'STUDENT_004',
    studentCode: 'HS604',
    fullName: 'Pham Minh Dung',
    role: 'student',
    progress: {
      islands: {
        ISLAND_1: { isCompleted: false, isUnlocked: true, score: 0 }
      }
    }
  }
];

/**
 * Lấy danh sách toàn bộ học sinh cùng tiến độ học tập chi tiết
 * @returns {Promise<Array>} Danh sách học sinh đã kèm tiến độ
 */
export const getAllStudentsProgress = async () => {
  try {
    // TODO: Khi kết nối Firebase Firestore thực tế, query collection 'users' (role='student') 
    // và join/map dữ liệu từ collection 'student_progress'.
    
    // Hiện tại trả về Mock Data chuẩn cấu trúc
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(MOCK_STUDENTS_LIST);
      }, 300);
    });
  } catch (error) {
    console.error('[TeacherService] Lỗi khi tải danh sách học sinh:', error);
    throw new Error('Không thể kết nối đến dữ liệu lớp học.');
  }
};

/**
 * Lấy thông tin chi tiết và tiến độ làm bài của 1 học sinh cụ thể
 * @param {string} studentId - UID của học sinh
 * @returns {Promise<Object|null>} Thông tin học sinh kèm tiến độ
 */
export const getStudentDetailProgress = async (studentId) => {
  try {
    if (!studentId) return null;

    const allStudents = await getAllStudentsProgress();
    const student = allStudents.find((st) => st.uid === studentId || st.studentCode === studentId);

    if (!student) {
      console.warn(`[TeacherService] Không tìm thấy học sinh ID: ${studentId}`);
      return null;
    }

    // Tính toán thêm chỉ số tổng hợp
    const islandsData = student.progress?.islands || {};
    const scores = Object.values(islandsData)
      .map((item) => item?.score)
      .filter((s) => typeof s === 'number');

    const avgScore = calculateAverageScore ? calculateAverageScore(scores) : 0;
    const rank = getAcademicRank ? getAcademicRank(avgScore) : { label: 'Chưa xếp loại' };

    return {
      ...student,
      summary: {
        averageScore: avgScore,
        academicRank: rank,
        completedIslandsCount: Object.keys(islandsData).filter((k) => islandsData[k]?.isCompleted).length,
        totalIslands: Object.keys(ISLANDS || {}).length || 5
      }
    };
  } catch (error) {
    console.error(`[TeacherService] Lỗi khi lấy chi tiết học sinh ID ${studentId}:`, error);
    return null;
  }
};

/**
 * Cập nhật thủ công trạng thái hoặc mở khóa đảo cho học sinh (Tính năng Giáo viên can thiệp)
 * @param {string} studentId - UID học sinh
 * @param {string} islandId - ID Đảo cần mở khóa/cập nhật
 * @param {Object} updateData - Dữ liệu cập nhật { isUnlocked, isCompleted, score }
 * @returns {Promise<boolean>} Trạng thái cập nhật thành công hay thất bại
 */
export const overrideStudentProgress = async (studentId, islandId, updateData = {}) => {
  try {
    console.log(`[TeacherService] Cập nhật tiến độ cho HS ${studentId} tại ${islandId}:`, updateData);
    
    // Trong môi trường Firestore thực tế:
    // await updateDoc(doc(db, 'student_progress', studentId), { [`islands.${islandId}`]: updateData });

    const targetStudent = MOCK_STUDENTS_LIST.find((st) => st.uid === studentId);
    if (targetStudent) {
      if (!targetStudent.progress.islands[islandId]) {
        targetStudent.progress.islands[islandId] = {};
      }
      Object.assign(targetStudent.progress.islands[islandId], updateData);
      return true;
    }

    return false;
  } catch (error) {
    console.error('[TeacherService] Lỗi khi cập nhật tiến độ học sinh:', error);
    return false;
  }
};

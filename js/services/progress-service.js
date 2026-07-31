/**
 * @file progress-service.js
 * @description Dịch vụ quản lý tiến độ học tập (Mock bằng LocalStorage để chạy test)
 */

import { ISLAND_STATUS, LESSON_STATUS } from '../config/constants.js';

// Khởi tạo dữ liệu mẫu nếu chưa có trong LocalStorage
const getMockData = (studentId) => {
  const saved = localStorage.getItem(`dkt_progress_${studentId}`);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Lỗi parse dữ liệu progress:", e);
    }
  }

  return {
    studentId,
    islands: {
      island_1: { status: ISLAND_STATUS.UNLOCKED, score: 0, completedAt: null },
      island_2: { status: ISLAND_STATUS.LOCKED, score: 0, completedAt: null },
      island_3: { status: ISLAND_STATUS.LOCKED, score: 0, completedAt: null }
    },
    lessons: {},
    updatedAt: new Date().toISOString()
  };
};

export const getStudentProgress = async (studentId) => {
  try {
    if (!studentId) throw new Error('Student ID không hợp lệ.');
    return getMockData(studentId);
  } catch (error) {
    console.error('[Progress Service] Lỗi khi lấy tiến độ:', error);
    throw error;
  }
};

export const updateLessonProgress = async (studentId, lessonId, status = LESSON_STATUS.COMPLETED) => {
  const data = getMockData(studentId);
  data.lessons[lessonId] = { status, updatedAt: new Date().toISOString() };
  data.updatedAt = new Date().toISOString();
  localStorage.setItem(`dkt_progress_${studentId}`, JSON.stringify(data));
};

export const saveQuizAttemptAndProgress = async (studentId, islandId, score, answers = []) => {
  const data = getMockData(studentId);
  // Chuẩn hóa islandId để đảm bảo khớp với key trong object (ví dụ: 'ISLAND_1' -> 'island_1')
  const cleanIslandId = islandId.toLowerCase().replace('-', '_');
  let islands = data.islands;

  const currentIsland = islands[cleanIslandId] || { score: 0, status: ISLAND_STATUS.UNLOCKED };
  const bestScore = Math.max(currentIsland.score || 0, score);
  const isPassed = score >= 5.0;
  
  islands[cleanIslandId] = {
    ...currentIsland,
    score: bestScore,
    status: isPassed ? ISLAND_STATUS.COMPLETED : ISLAND_STATUS.UNLOCKED,
    completedAt: isPassed ? new Date().toISOString() : currentIsland.completedAt
  };

  // Logic tự động mở khóa đảo tiếp theo
  if (isPassed) {
    if (cleanIslandId === 'island_1') islands['island_2'] = { ...islands['island_2'], status: ISLAND_STATUS.UNLOCKED };
    if (cleanIslandId === 'island_2') islands['island_3'] = { ...islands['island_3'], status: ISLAND_STATUS.UNLOCKED };
  }

  data.updatedAt = new Date().toISOString();
  localStorage.setItem(`dkt_progress_${studentId}`, JSON.stringify(data));
  return { success: true, bestScore, isPassed, islands };
};

export const getStudentAttemptsByIsland = async (studentId, islandId) => {
  return []; // Mock lịch sử làm bài rỗng
};

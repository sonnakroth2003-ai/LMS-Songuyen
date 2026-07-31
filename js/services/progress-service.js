/**
 * @file progress-service.js
 * @description Dịch vụ quản lý tiến độ học tập (Mock bằng LocalStorage để chạy test)
 */

import { ISLAND_STATUS, LESSON_STATUS } from '../config/constants.js';

// Khởi tạo dữ liệu mẫu nếu chưa có trong LocalStorage
const getMockData = (studentId) => {
  const saved = localStorage.getItem(`dkt_progress_${studentId}`);
  if (saved) return JSON.parse(saved);

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
  let islands = data.islands;

  const currentIsland = islands[islandId] || { score: 0, status: ISLAND_STATUS.UNLOCKED };
  const bestScore = Math.max(currentIsland.score || 0, score);
  const isPassed = score >= 5.0;
  
  islands[islandId] = {
    ...currentIsland,
    score: bestScore,
    status: isPassed ? ISLAND_STATUS.COMPLETED : ISLAND_STATUS.UNLOCKED,
    completedAt: isPassed ? new Date().toISOString() : currentIsland.completedAt
  };

  if (isPassed) {
    if (islandId === 'island_1') islands['island_2'] = { ...islands['island_2'], status: ISLAND_STATUS.UNLOCKED };
    if (islandId === 'island_2') islands['island_3'] = { ...islands['island_3'], status: ISLAND_STATUS.UNLOCKED };
  }

  localStorage.setItem(`dkt_progress_${studentId}`, JSON.stringify(data));
  return { success: true, bestScore, isPassed, islands };
};

export const getStudentAttemptsByIsland = async (studentId, islandId) => {
  return []; // Mock lịch sử làm bài rỗng
};

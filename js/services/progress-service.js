/**
 * @file progress-service.js
 * @description Quản lý lưu trữ và cập nhật tiến độ học tập của học sinh.
 * Đã tích hợp các hằng số hệ thống để đảm bảo tính đồng bộ.
 */

import { ISLAND_STATUS, ISLANDS } from '../config/constants.js';

/**
 * Lấy dữ liệu tiến độ của học sinh từ LocalStorage
 */
export const getStudentProgress = (studentId) => {
  const data = localStorage.getItem(`dkt_progress_${studentId}`);
  if (data) {
    return JSON.parse(data);
  }
  
  // Tạo cấu trúc mặc định: Đảo 1 luôn mở khóa khi bắt đầu
  return {
    studentId,
    islands: {
      island_1: { score: 0, status: ISLAND_STATUS.UNLOCKED }
    },
    updatedAt: new Date().toISOString()
  };
};

/**
 * Lưu kết quả làm bài và cập nhật tiến độ
 */
export const saveQuizAttemptAndProgress = async (studentId, islandId, score) => {
  try {
    const data = getStudentProgress(studentId);
    const cleanIslandId = islandId.toLowerCase().replace('-', '_');
    
    // Đảm bảo object islands tồn tại
    if (!data.islands) data.islands = {};
    
    const currentIsland = data.islands[cleanIslandId] || { score: 0, status: ISLAND_STATUS.UNLOCKED };
    const bestScore = Math.max(currentIsland.score || 0, score);
    const isPassed = score >= 5.0; // Ngưỡng đạt bài thi
    
    // Cập nhật trạng thái đảo hiện tại
    data.islands[cleanIslandId] = {
      ...currentIsland,
      score: bestScore,
      status: isPassed ? ISLAND_STATUS.COMPLETED : ISLAND_STATUS.UNLOCKED,
      completedAt: isPassed ? new Date().toISOString() : currentIsland.completedAt
    };

    // Mở khóa đảo tiếp theo nếu đã hoàn thành đảo hiện tại
    const islandKeys = Object.keys(ISLANDS); // ['ISLAND_1', 'ISLAND_2', 'ISLAND_3']
    const currentIndex = islandKeys.findIndex(key => key.toLowerCase() === cleanIslandId);
    
    if (isPassed && currentIndex !== -1 && currentIndex < islandKeys.length - 1) {
      const nextIslandKey = islandKeys[currentIndex + 1].toLowerCase();
      if (!data.islands[nextIslandKey]) {
        data.islands[nextIslandKey] = { score: 0, status: ISLAND_STATUS.UNLOCKED };
      }
    }

    data.updatedAt = new Date().toISOString();
    
    // Lưu lại vào LocalStorage
    localStorage.setItem(`dkt_progress_${studentId}`, JSON.stringify(data));
    
    return { 
      success: true, 
      bestScore, 
      isPassed, 
      islands: data.islands 
    };
  } catch (error) {
    console.error('[ProgressService] Lỗi khi lưu tiến độ:', error);
    throw error;
  }
};

/**
 * Lấy lịch sử làm bài (Placeholder - có thể mở rộng với Firestore sau này)
 */
export const getStudentAttemptsByIsland = async (studentId, islandId) => {
  return []; 
};

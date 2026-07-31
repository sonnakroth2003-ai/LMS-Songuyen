/**
 * @file progress-service.js
 * @description Quản lý lưu trữ và cập nhật tiến độ học tập của học sinh.
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
    
    if (!data.islands) data.islands = {};
    
    // Lấy dữ liệu cũ hoặc mặc định
    const currentIsland = data.islands[cleanIslandId] || { score: 0, status: ISLAND_STATUS.UNLOCKED };
    
    // TÍNH TOÁN LẠI ĐIỂM CAO NHẤT: Luôn lấy giá trị lớn nhất giữa điểm cũ và điểm mới
    const bestScore = Math.max(currentIsland.score || 0, score);
    const isPassed = score >= 5.0; 
    
    // Cập nhật đảo hiện tại với điểm tốt nhất mới
    data.islands[cleanIslandId] = {
      ...currentIsland,
      score: bestScore, // Lưu điểm cao nhất
      status: (isPassed || currentIsland.status === ISLAND_STATUS.COMPLETED) 
               ? ISLAND_STATUS.COMPLETED 
               : ISLAND_STATUS.UNLOCKED,
      completedAt: (isPassed && !currentIsland.completedAt) ? new Date().toISOString() : currentIsland.completedAt
    };

    // Mở khóa đảo tiếp theo nếu đã hoàn thành
    const islandKeys = Object.keys(ISLANDS);
    const currentIndex = islandKeys.findIndex(key => key.toLowerCase() === cleanIslandId);
    
    if (isPassed && currentIndex !== -1 && currentIndex < islandKeys.length - 1) {
      const nextIslandKey = islandKeys[currentIndex + 1].toLowerCase();
      if (!data.islands[nextIslandKey]) {
        data.islands[nextIslandKey] = { score: 0, status: ISLAND_STATUS.UNLOCKED };
      }
    }

    data.updatedAt = new Date().toISOString();
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

/**
 * @file progress-service.js
 * @description Quản lý lưu trữ và cập nhật tiến độ học tập của học sinh.
 */

import { ISLAND_STATUS, ISLANDS } from '../config/constants.js';

export const getStudentProgress = (studentId) => {
  const data = localStorage.getItem(`dkt_progress_${studentId}`);
  if (data) {
    return JSON.parse(data);
  }
  
  return {
    studentId,
    islands: {
      ISLAND_1: { score: 0, status: ISLAND_STATUS.UNLOCKED }
    },
    updatedAt: new Date().toISOString()
  };
};

export const saveQuizAttemptAndProgress = async (studentId, islandId, score) => {
  try {
    const data = getStudentProgress(studentId);
    
    const normalizedIslandId = islandId.toUpperCase().replace('-', '_');
    if (!data.islands) data.islands = {};
    
    const currentIsland = data.islands[normalizedIslandId] || { score: 0, status: ISLAND_STATUS.UNLOCKED };
    
    const bestScore = Math.max(currentIsland.score || 0, score);
    const isPassed = score >= 5.0; 
    
    data.islands[normalizedIslandId] = {
      ...currentIsland,
      score: bestScore,
      status: (isPassed || currentIsland.status === ISLAND_STATUS.COMPLETED) 
               ? ISLAND_STATUS.COMPLETED 
               : ISLAND_STATUS.UNLOCKED,
      completedAt: (isPassed && !currentIsland.completedAt) ? new Date().toISOString() : currentIsland.completedAt
    };

    // Đảm bảo lấy danh sách ID đảo theo đúng thứ tự nếu có thể, hoặc dùng Object.keys
    const islandKeys = ['ISLAND_1', 'ISLAND_2', 'ISLAND_3']; 
    const currentIndex = islandKeys.indexOf(normalizedIslandId);
    
    if (isPassed && currentIndex !== -1 && currentIndex < islandKeys.length - 1) {
      const nextIslandKey = islandKeys[currentIndex + 1];
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

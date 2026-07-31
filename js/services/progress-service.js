/**
 * @file progress-service.js
 * @description Quản lý lưu trữ và cập nhật tiến độ học tập của học sinh.
 */

// Định nghĩa các trạng thái đảo
const ISLAND_STATUS = {
  LOCKED: 'LOCKED',
  UNLOCKED: 'UNLOCKED',
  COMPLETED: 'COMPLETED'
};

/**
 * Lấy dữ liệu tiến độ của học sinh từ LocalStorage
 */
export const getStudentProgress = (studentId) => {
  const data = localStorage.getItem(`dkt_progress_${studentId}`);
  if (data) {
    return JSON.parse(data);
  }
  // Nếu chưa có, tạo cấu trúc mặc định với Đảo 1 mở khóa
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
    const isPassed = score >= 5.0;
    
    // Cập nhật thông tin đảo hiện tại
    data.islands[cleanIslandId] = {
      ...currentIsland,
      score: bestScore,
      status: isPassed ? ISLAND_STATUS.COMPLETED : ISLAND_STATUS.UNLOCKED,
      completedAt: isPassed ? new Date().toISOString() : currentIsland.completedAt
    };

    // Mở khóa đảo tiếp theo nếu đã qua bài
    if (isPassed) {
      if (cleanIslandId === 'island_1') {
        data.islands['island_2'] = data.islands['island_2'] || { score: 0, status: ISLAND_STATUS.UNLOCKED };
      }
      if (cleanIslandId === 'island_2') {
        data.islands['island_3'] = data.islands['island_3'] || { score: 0, status: ISLAND_STATUS.UNLOCKED };
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
 * Lấy lịch sử làm bài (Mock)
 */
export const getStudentAttemptsByIsland = async (studentId, islandId) => {
  return []; 
};

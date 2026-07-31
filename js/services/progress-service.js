/**
 * Lấy dữ liệu tiến độ của học sinh từ LocalStorage
 */
const getMockData = (studentId) => {
  const data = localStorage.getItem(`dkt_progress_${studentId}`);
  if (data) {
    return JSON.parse(data);
  }
  // Nếu chưa có, tạo cấu trúc mặc định
  return {
    studentId,
    islands: {},
    updatedAt: new Date().toISOString()
  };
};

export const saveQuizAttemptAndProgress = async (studentId, islandId, score, answers = []) => {
  try {
    const data = getMockData(studentId);
    const cleanIslandId = islandId.toLowerCase().replace('-', '_');
    
    // Đảm bảo object islands tồn tại
    if (!data.islands) data.islands = {};
    
    const currentIsland = data.islands[cleanIslandId] || { score: 0, status: 'UNLOCKED' };
    const bestScore = Math.max(currentIsland.score || 0, score);
    const isPassed = score >= 5.0;
    
    // Cập nhật thông tin đảo
    data.islands[cleanIslandId] = {
      ...currentIsland,
      score: bestScore,
      status: isPassed ? 'COMPLETED' : 'UNLOCKED',
      completedAt: isPassed ? new Date().toISOString() : currentIsland.completedAt
    };

    // Mở khóa đảo tiếp theo nếu đã qua bài
    if (isPassed) {
      if (cleanIslandId === 'island_1') data.islands['island_2'] = { ...data.islands['island_2'], status: 'UNLOCKED' };
      if (cleanIslandId === 'island_2') data.islands['island_3'] = { ...data.islands['island_3'], status: 'UNLOCKED' };
    }

    data.updatedAt = new Date().toISOString();
    
    // Lưu lại vào LocalStorage
    localStorage.setItem(`dkt_progress_${studentId}`, JSON.stringify(data));
    
    return { success: true, bestScore, isPassed, islands: data.islands };
  } catch (error) {
    console.error('[ProgressService] Lỗi khi lưu tiến độ:', error);
    throw error;
  }
};
  const bestScore = Math.max(currentIsland.score || 0, score);
  const isPassed = score >= 5.0;
  
  islands[cleanIslandId] = {
    ...currentIsland,
    score: bestScore,
    status: isPassed ? ISLAND_STATUS.COMPLETED : ISLAND_STATUS.UNLOCKED,
    completedAt: isPassed ? new Date().toISOString() : currentIsland.completedAt
  };

  if (isPassed) {
    if (cleanIslandId === 'island_1') islands['island_2'] = { ...islands['island_2'], status: ISLAND_STATUS.UNLOCKED };
    if (cleanIslandId === 'island_2') islands['island_3'] = { ...islands['island_3'], status: ISLAND_STATUS.UNLOCKED };
  }

  data.updatedAt = new Date().toISOString();
  // Đảm bảo dữ liệu được ghi xong trước khi trả về kết quả
  localStorage.setItem(`dkt_progress_${studentId}`, JSON.stringify(data));
  
  // Trả về dữ liệu để đảm bảo UI nhận được cập nhật mới nhất
  return { success: true, bestScore, isPassed, islands };
};

export const getStudentAttemptsByIsland = async (studentId, islandId) => {
  return []; // Mock lịch sử làm bài rỗng
};

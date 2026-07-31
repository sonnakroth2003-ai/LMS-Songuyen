import { ISLAND_STATUS } from '../config/constants.js';

export const getStudentProgress = (studentId) => {
  const data = localStorage.getItem(`dkt_progress_${studentId}`);
  return data ? JSON.parse(data) : {
    studentId,
    islands: { ISLAND_1: { score: 0, status: ISLAND_STATUS.UNLOCKED } }
  };
};

export const saveQuizAttemptAndProgress = async (studentId, islandId, score) => {
  const data = getStudentProgress(studentId);
  const islandKey = islandId.toUpperCase(); // Đảm bảo key trùng khớp
  
  data.islands[islandKey] = {
    ...data.islands[islandKey],
    score: Math.max(data.islands[islandKey]?.score || 0, score),
    status: score >= 5 ? ISLAND_STATUS.COMPLETED : ISLAND_STATUS.UNLOCKED
  };

  // Mở khóa đảo tiếp theo nếu qua bài
  if (score >= 5) {
    const islandKeys = ['ISLAND_1', 'ISLAND_2', 'ISLAND_3'];
    const idx = islandKeys.indexOf(islandKey);
    if (idx !== -1 && idx < islandKeys.length - 1) {
      const nextKey = islandKeys[idx + 1];
      if (!data.islands[nextKey] || data.islands[nextKey].status === ISLAND_STATUS.LOCKED) {
        data.islands[nextKey] = { score: 0, status: ISLAND_STATUS.UNLOCKED };
      }
    }
  }

  localStorage.setItem(`dkt_progress_${studentId}`, JSON.stringify(data));
  return { success: true, isPassed: score >= 5, islands: data.islands };
};

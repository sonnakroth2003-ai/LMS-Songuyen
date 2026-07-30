/**
 * @file progress-service.js
 * @description Dịch vụ quản lý, lưu trữ và đồng bộ tiến độ học tập của học sinh trên Firestore.
 */

// Đã cập nhật đường dẫn import sang CDN chuẩn của Firebase
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  query, 
  where, 
  serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

import { db } from '../core/firebase-init.js';
import { DB_COLLECTIONS, LESSON_STATUS, ISLAND_STATUS } from '../config/constants.js';

/**
 * Lấy thông tin tiến độ học tập của học sinh từ Firestore
 * @param {string} studentId - UID của học sinh
 * @returns {Promise<Object>} Đối tượng chứa tiến độ các đảo và bài học
 */
export const getStudentProgress = async (studentId) => {
  try {
    if (!studentId) throw new Error('Student ID không hợp lệ.');

    const progressRef = doc(db, DB_COLLECTIONS.STUDENT_PROGRESS, studentId);
    const progressSnap = await getDoc(progressRef);

    if (progressSnap.exists()) {
      return progressSnap.data();
    } else {
      // Khởi tạo tiến độ mặc định nếu học sinh chưa có dữ liệu trên Firestore
      const defaultProgress = {
        studentId,
        islands: {
          island_1: { status: ISLAND_STATUS.UNLOCKED, score: 0, completedAt: null },
          island_2: { status: ISLAND_STATUS.LOCKED, score: 0, completedAt: null },
          island_3: { status: ISLAND_STATUS.LOCKED, score: 0, completedAt: null }
        },
        lessons: {},
        updatedAt: serverTimestamp()
      };

      await setDoc(progressRef, defaultProgress);
      return defaultProgress;
    }
  } catch (error) {
    console.error('[Progress Service] Lỗi khi lấy tiến độ học tập:', error);
    throw error;
  }
};

/**
 * Cập nhật trạng thái hoàn thành của một bài học
 */
export const updateLessonProgress = async (studentId, lessonId, status = LESSON_STATUS.COMPLETED) => {
  try {
    const progressRef = doc(db, DB_COLLECTIONS.STUDENT_PROGRESS, studentId);
    
    await updateDoc(progressRef, {
      [`lessons.${lessonId}`]: {
        status,
        updatedAt: new Date().toISOString()
      },
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('[Progress Service] Lỗi khi cập nhật tiến độ bài học:', error);
    throw error;
  }
};

/**
 * Lưu kết quả bài làm quiz của đảo và cập nhật tiến độ
 */
export const saveQuizAttemptAndProgress = async (studentId, islandId, score, answers = []) => {
  try {
    // 1. Lưu lịch sử lượt làm bài vào collection 'student_attempts'
    const attemptRef = doc(collection(db, DB_COLLECTIONS.STUDENT_ATTEMPTS));
    const attemptData = {
      id: attemptRef.id,
      studentId,
      islandId,
      score,
      answers,
      submittedAt: serverTimestamp()
    };
    await setDoc(attemptRef, attemptData);

    // 2. Lấy tiến độ hiện tại
    const progressRef = doc(db, DB_COLLECTIONS.STUDENT_PROGRESS, studentId);
    const progressSnap = await getDoc(progressRef);
    
    let currentProgress = progressSnap.exists() ? progressSnap.data() : { islands: {} };
    let islands = currentProgress.islands || {};

    const currentIsland = islands[islandId] || { score: 0, status: ISLAND_STATUS.UNLOCKED };
    const bestScore = Math.max(currentIsland.score || 0, score);
    
    const isPassed = score >= 5.0;
    const newIslandStatus = isPassed ? ISLAND_STATUS.COMPLETED : ISLAND_STATUS.UNLOCKED;

    islands[islandId] = {
      ...currentIsland,
      score: bestScore,
      status: newIslandStatus,
      completedAt: isPassed ? new Date().toISOString() : currentIsland.completedAt || null
    };

    // 3. Logic mở khóa đảo tiếp theo
    if (isPassed) {
      if (islandId === 'island_1' && islands['island_2']?.status === ISLAND_STATUS.LOCKED) {
        islands['island_2'] = { ...islands['island_2'], status: ISLAND_STATUS.UNLOCKED };
      } else if (islandId === 'island_2' && islands['island_3']?.status === ISLAND_STATUS.LOCKED) {
        islands['island_3'] = { ...islands['island_3'], status: ISLAND_STATUS.UNLOCKED };
      }
    }

    // 4. Cập nhật Firestore
    await setDoc(progressRef, {
      studentId,
      islands,
      lessons: currentProgress.lessons || {},
      updatedAt: serverTimestamp()
    }, { merge: true });

    return { success: true, bestScore, isPassed, islands };
  } catch (error) {
    console.error('[Progress Service] Lỗi khi lưu kết quả quiz:', error);
    throw error;
  }
};

/**
 * Lấy lịch sử các lần làm bài trắc nghiệm
 */
export const getStudentAttemptsByIsland = async (studentId, islandId) => {
  try {
    const attemptsRef = collection(db, DB_COLLECTIONS.STUDENT_ATTEMPTS);
    const q = query(
      attemptsRef, 
      where('studentId', '==', studentId), 
      where('islandId', '==', islandId)
    );
    
    const querySnapshot = await getDocs(q);
    const attempts = [];
    querySnapshot.forEach((docSnap) => {
      attempts.push({ id: docSnap.id, ...docSnap.data() });
    });

    return attempts;
  } catch (error) {
    console.error('[Progress Service] Lỗi khi lấy lịch sử làm bài:', error);
    return [];
  }
};


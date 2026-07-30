/**
 * @file quiz-service.js
 * @description Dịch vụ quản lý ngân hàng câu hỏi, xáo trộn đề thi và xử lý nộp bài trắc nghiệm.
 */

// Đã cập nhật đường dẫn import sang CDN chuẩn của Firebase
import { 
  collection, 
  getDocs, 
  query, 
  where 
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

import { db } from '../core/firebase-init.js';
import { DB_COLLECTIONS, QUIZ_CONFIG, MESSAGES } from '../config/constants.js';
import { calculateQuizScore } from './scoring-service.js';
import { saveQuizAttemptAndProgress } from './progress-service.js';

/**
 * Thuật toán xáo trộn mảng ngẫu nhiên (Fisher-Yates Shuffle)
 */
const shuffleArray = (array = []) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Lấy danh sách câu hỏi trắc nghiệm của một Đảo khám phá từ Firestore
 */
export const getQuestionsByIsland = async (islandId, randomize = true) => {
  try {
    if (!islandId) throw new Error('Island ID không hợp lệ.');

    const questionsRef = collection(db, DB_COLLECTIONS.QUESTIONS);
    const q = query(questionsRef, where('islandId', '==', islandId));
    const querySnapshot = await getDocs(q);

    const rawQuestions = [];
    querySnapshot.forEach((docSnap) => {
      rawQuestions.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });

    let questionsList = rawQuestions.length > 0 ? rawQuestions : getMockQuestionsByIsland(islandId);

    if (randomize) {
      questionsList = shuffleArray(questionsList);
    }

    const limit = QUIZ_CONFIG.QUESTIONS_PER_ISLAND || 3;
    return questionsList.slice(0, limit);
  } catch (error) {
    console.error('[Quiz Service] Lỗi khi lấy danh sách câu hỏi:', error);
    return getMockQuestionsByIsland(islandId).slice(0, QUIZ_CONFIG.QUESTIONS_PER_ISLAND);
  }
};

/**
 * Xử lý nộp bài làm trắc nghiệm của học sinh
 */
export const submitQuizAttempt = async (studentId, islandId, userAnswers = [], originalQuestions = []) => {
  try {
    if (!studentId || !islandId) {
      throw new Error('Thông tin nộp bài không đầy đủ.');
    }

    if (!userAnswers || userAnswers.length === 0) {
      throw new Error(MESSAGES.QUIZ.MUST_ANSWER_ALL);
    }

    // 1. Tính toán điểm số sử dụng scoring-service
    const scoreResult = calculateQuizScore(userAnswers, originalQuestions);

    // 2. Lưu kết quả bài làm và cập nhật tiến độ
    const progressResult = await saveQuizAttemptAndProgress(
      studentId,
      islandId,
      scoreResult.score,
      userAnswers
    );

    return {
      success: true,
      message: MESSAGES.QUIZ.SUBMIT_SUCCESS,
      score: scoreResult.score,
      correctCount: scoreResult.correctCount,
      totalQuestions: scoreResult.totalQuestions,
      percentage: scoreResult.percentage,
      isPassed: progressResult.isPassed,
      bestScore: progressResult.bestScore,
      islands: progressResult.islands
    };
  } catch (error) {
    console.error('[Quiz Service] Lỗi khi xử lý nộp bài quiz:', error);
    throw error;
  }
};

/**
 * Dữ liệu giả định (Mock Data) câu hỏi phục vụ kiểm thử
 */
const getMockQuestionsByIsland = (islandId) => {
  const mockDatabase = {
    island_1: [
      { id: 'q1_1', islandId: 'island_1', content: 'Tập hợp các số nguyên bao gồm?', options: ['Âm, Dương', 'Âm, 0, Dương', '0, Dương', 'Âm, 0'], correctOption: 1 },
      { id: 'q1_2', islandId: 'island_1', content: 'Kết quả (-15) + (-25) là?', options: ['-40', '40', '-10', '10'], correctOption: 0 },
      { id: 'q1_3', islandId: 'island_1', content: 'Số đối của -18 là?', options: ['-18', '18', '0', '1/18'], correctOption: 1 }
    ],
    island_2: [
      { id: 'q2_1', islandId: 'island_2', content: 'Kết quả (-5) . 8 là?', options: ['40', '-40', '-13', '3'], correctOption: 1 },
      { id: 'q2_2', islandId: 'island_2', content: 'Khi bỏ dấu ngoặc -(a - b + c) ta được:', options: ['-a - b + c', '-a + b - c', '-a - b - c', 'a - b + c'], correctOption: 1 },
      { id: 'q2_3', islandId: 'island_2', content: 'Tìm x biết: x + 10 = -5', options: ['15', '5', '-15', '-5'], correctOption: 2 }
    ],
    island_3: [
      { id: 'q3_1', islandId: 'island_3', content: 'Ước của -6 là?', options: ['{-1,-2,-3,-6}', '{1,2,3,6}', '{-1,1,-2,2,-3,3,-6,6}', '{0,...}'], correctOption: 2 },
      { id: 'q3_2', islandId: 'island_3', content: 'Hình nào có trục đối xứng?', options: ['Tam giác', 'Hình tròn', 'Hình thang', 'Bình hành'], correctOption: 1 },
      { id: 'q3_3', islandId: 'island_3', content: 'Nhiệt độ -3°C tăng 5°C thành?', options: ['-8°C', '8°C', '2°C', '-2°C'], correctOption: 2 }
    ]
  };
  return mockDatabase[islandId] || mockDatabase.island_1;
};
```eof

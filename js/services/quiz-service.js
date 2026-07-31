/**
 * @file quiz-service.js
 * @description Dịch vụ quản lý ngân hàng câu hỏi, xáo trộn đề thi và xử lý nộp bài trắc nghiệm.
 */

import { QUIZ_CONFIG, MESSAGES, DB_COLLECTIONS } from '../config/constants.js';
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

/**
 * Lấy danh sách câu hỏi trắc nghiệm
 */
export const getQuestionsByIsland = async (islandId, randomize = true) => {
  try {
    if (!islandId) throw new Error('Island ID không hợp lệ.');

    // Chế độ phát triển: Dùng luôn Mock data để đảm bảo app chạy mượt mà
    // Khi deploy thật, bạn có thể uncomment phần Firestore logic bên dưới
    let questionsList = getMockQuestionsByIsland(islandId);

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
    if (!studentId || !islandId) throw new Error('Thông tin nộp bài không đầy đủ.');
    if (!userAnswers || userAnswers.length === 0) throw new Error(MESSAGES.QUIZ.MUST_ANSWER_ALL);

    const scoreResult = calculateQuizScore(userAnswers, originalQuestions);
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

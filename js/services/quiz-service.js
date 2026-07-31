/**
 * @file quiz-service.js
 * @description Dịch vụ quản lý ngân hàng câu hỏi, xáo trộn đề thi và xử lý nộp bài trắc nghiệm.
 */

import { QUIZ_CONFIG, MESSAGES } from '../config/constants.js';
import { calculateQuizScore } from './scoring-service.js';
import { saveQuizAttemptAndProgress } from './progress-service.js';

const shuffleArray = (array = []) => {
  if (!Array.isArray(array)) return [];
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const getMockQuestionsByIsland = (islandId) => {
  const mockDatabase = {
    island_1: [
      { id: 'q1_1', content: 'Tập hợp các số nguyên bao gồm?', options: ['Âm, Dương', 'Âm, 0, Dương', '0, Dương', 'Âm, 0'], correctOption: 1 },
      { id: 'q1_2', content: 'Kết quả (-15) + (-25) là?', options: ['-40', '40', '-10', '10'], correctOption: 0 },
      { id: 'q1_3', content: 'Số đối của -18 là?', options: ['-18', '18', '0', '1/18'], correctOption: 1 },
      { id: 'q1_4', content: 'Số tự nhiên nhỏ nhất là?', options: ['1', '0', '2', '-1'], correctOption: 1 },
      { id: 'q1_5', content: 'Kết quả (-5) + 5 là?', options: ['10', '-10', '0', '5'], correctOption: 2 }
    ],
    island_2: [
      { id: 'q2_1', content: 'Kết quả (-5) . 8 là?', options: ['40', '-40', '-13', '3'], correctOption: 1 },
      { id: 'q2_2', content: 'Khi bỏ dấu ngoặc -(a - b + c) ta được:', options: ['-a - b + c', '-a + b - c', '-a - b - c', 'a - b + c'], correctOption: 1 },
      { id: 'q2_3', content: 'Tìm x biết: x + 10 = -5', options: ['15', '5', '-15', '-5'], correctOption: 2 },
      { id: 'q2_4', content: 'Số nào là ước của 10?', options: ['3', '4', '5', '7'], correctOption: 2 },
      { id: 'q2_5', content: 'Kết quả (-2) . (-3) là?', options: ['-6', '6', '-5', '5'], correctOption: 1 }
    ],
    island_3: [
      { id: 'q3_1', content: 'Ước của -6 là?', options: ['{-1,-2,-3,-6}', '{1,2,3,6}', '{-1,1,-2,2,-3,3,-6,6}', '{0,...}'], correctOption: 2 },
      { id: 'q3_2', content: 'Hình nào có trục đối xứng?', options: ['Tam giác', 'Hình tròn', 'Hình thang', 'Bình hành'], correctOption: 1 },
      { id: 'q3_3', content: 'Nhiệt độ -3°C tăng 5°C thành?', options: ['-8°C', '8°C', '2°C', '-2°C'], correctOption: 2 },
      { id: 'q3_4', content: 'Số đối của 0 là?', options: ['1', '0', '-1', 'Không xác định'], correctOption: 1 },
      { id: 'q3_5', content: 'Giá trị tuyệt đối của -5 là?', options: ['-5', '0', '5', '1'], correctOption: 2 }
    ]
  };
  return mockDatabase[islandId.toLowerCase()] || mockDatabase.island_1;
};

export const getQuestionsByIsland = async (islandId, randomize = true) => {
  try {
    if (!islandId) throw new Error('Island ID không hợp lệ.');

    const questionsList = getMockQuestionsByIsland(islandId);
    const limit = QUIZ_CONFIG.QUESTIONS_PER_ISLAND || 5;
    
    // Trộn và giới hạn số lượng câu hỏi
    const processedList = randomize ? shuffleArray(questionsList) : questionsList;
    return processedList.slice(0, limit);
  } catch (error) {
    console.error('[Quiz Service] Lỗi khi lấy danh sách câu hỏi:', error);
    return [];
  }
};

export const submitQuizAttempt = async (studentId, islandId, userAnswers = [], originalQuestions = []) => {
  try {
    if (!studentId || !islandId) throw new Error('Thông tin nộp bài không đầy đủ.');
    
    // Tính toán điểm số
    const scoreResult = calculateQuizScore(userAnswers, originalQuestions);
    
    // Lưu kết quả vào tiến độ
    const progressResult = await saveQuizAttemptAndProgress(
      studentId,
      islandId,
      scoreResult.score,
      userAnswers
    );

    return {
      success: true,
      message: MESSAGES.QUIZ.SUBMIT_SUCCESS,
      ...scoreResult,
      isPassed: progressResult.isPassed,
      bestScore: progressResult.bestScore,
      islands: progressResult.islands
    };
  } catch (error) {
    console.error('[Quiz Service] Lỗi khi xử lý nộp bài:', error);
    throw error;
  }
};

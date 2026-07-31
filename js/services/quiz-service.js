/**
 * @file quiz-service.js
 * @description Dịch vụ quản lý ngân hàng câu hỏi, xáo trộn đề thi và xử lý nộp bài trắc nghiệm.
 */

import { QUIZ_CONFIG, MESSAGES } from '../config/constants.js';
import { calculateQuizScore } from './scoring-service.js';
import { saveQuizAttemptAndProgress } from './progress-service.js';
import { getQuizQuestionsByLessonId } from './course-service.js';

const shuffleArray = (array = []) => {
  if (!Array.isArray(array)) return [];
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const getQuestionsByIsland = async (islandId, randomize = true) => {
  try {
    if (!islandId) throw new Error('Island ID không hợp lệ.');

    // Thay vì dùng mock cứng, ta gọi thẳng qua course-service để đảm bảo tính đồng nhất
    const questionsList = await getQuizQuestionsByLessonId(islandId);
    
    if (!questionsList || questionsList.length === 0) {
      console.warn(`[Quiz Service] Không tìm thấy câu hỏi cho đảo: ${islandId}`);
      return [];
    }

    const limit = QUIZ_CONFIG.QUESTIONS_PER_ISLAND || 5;
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

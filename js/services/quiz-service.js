/**
 * @file quiz-service.js
 * @description Dịch vụ quản lý ngân hàng câu hỏi, xáo trộn đề thi và xử lý nộp bài trắc nghiệm.
 */

import { 
  collection, 
  getDocs, 
  query, 
  where 
} from 'firebase/firestore';
import { db } from '../core/firebase-init.js';
import { DB_COLLECTIONS, QUIZ_CONFIG, MESSAGES } from '../config/constants.js';
import { calculateQuizScore } from './scoring-service.js';
import { saveQuizAttemptAndProgress } from './progress-service.js';

/**
 * Thuật toán xáo trộn mảng ngẫu nhiên (Fisher-Yates Shuffle)
 * @param {Array} array 
 * @returns {Array} Mảng mới đã được xáo trộn
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
 * @param {string} islandId - ID của đảo (e.g., 'island_1')
 * @param {boolean} randomize - Có xáo trộn thứ tự câu hỏi không (mặc định: true)
 * @returns {Promise<Array>} Danh sách câu hỏi trắc nghiệm
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

    // Nếu không có dữ liệu trên Firestore (MOCK FALLBACK cho quá trình phát triển)
    let questionsList = rawQuestions.length > 0 ? rawQuestions : getMockQuestionsByIsland(islandId);

    // Xáo trộn danh sách câu hỏi nếu chọn randomize
    if (randomize) {
      questionsList = shuffleArray(questionsList);
    }

    // Giới hạn số câu hỏi theo cấu hình QUIZ_CONFIG.QUESTIONS_PER_ISLAND
    const limit = QUIZ_CONFIG.QUESTIONS_PER_ISLAND || 3;
    return questionsList.slice(0, limit);
  } catch (error) {
    console.error('[Quiz Service] Lỗi khi lấy danh sách câu hỏi:', error);
    // Fallback sang dữ liệu mẫu nếu kết nối db có lỗi
    return getMockQuestionsByIsland(islandId).slice(0, QUIZ_CONFIG.QUESTIONS_PER_ISLAND);
  }
};

/**
 * Xử lý nộp bài làm trắc nghiệm của học sinh
 * @param {string} studentId - UID của học sinh
 * @param {string} islandId - ID của đảo
 * @param {Array<{questionId: string, selectedOption: number}>} userAnswers - Danh sách đáp án học sinh chọn
 * @param {Array} originalQuestions - Danh sách câu hỏi ban đầu (chứa đáp án đúng)
 * @returns {Promise<Object>} Kết quả chấm điểm và tiến độ học tập mới
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

    // 2. Lưu kết quả bài làm và cập nhật tiến độ học sinh qua progress-service
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
 * Dữ liệu giả định (Mock Data) câu hỏi Chương 3: Số Nguyên (Toán 6) phục vụ kiểm thử
 * @param {string} islandId 
 * @returns {Array}
 */
const getMockQuestionsByIsland = (islandId) => {
  const mockDatabase = {
    island_1: [
      {
        id: 'q1_1',
        islandId: 'island_1',
        content: 'Tập hợp các số nguyên bao gồm những thành phần nào?',
        options: [
          'Số nguyên âm và số nguyên dương',
          'Số nguyên âm, số 0 và số nguyên dương',
          'Số 0 và số nguyên dương',
          'Số nguyên âm và số 0'
        ],
        correctOption: 1,
        explanation: 'Tập hợp số nguyên Z bao gồm các số nguyên âm, số 0 và các số nguyên dương.'
      },
      {
        id: 'q1_2',
        islandId: 'island_1',
        content: 'Kết quả của phép tính (-15) + (-25) là:',
        options: ['-40', '40', '-10', '10'],
        correctOption: 0,
        explanation: 'Muốn cộng hai số nguyên âm, ta cộng hai số đối của chúng rồi thêm dấu (-) đằng trước: -(15 + 25) = -40.'
      },
      {
        id: 'q1_3',
        islandId: 'island_1',
        content: 'Số đối của số -18 là bao nhiêu?',
        options: ['-18', '18', '0', '1/18'],
        correctOption: 1,
        explanation: 'Số đối của số nguyên a là -a. Do đó số đối của -18 là -(-18) = 18.'
      }
    ],
    island_2: [
      {
        id: 'q2_1',
        islandId: 'island_2',
        content: 'Kết quả của phép tính (-5) . 8 là:',
        options: ['40', '-40', '-13', '3']  ,
        correctOption: 1,
        explanation: 'Tích của hai số nguyên khác dấu luôn là một số nguyên âm: -(5 . 8) = -40.'
      },
      {
        id: 'q2_2',
        islandId: 'island_2',
        content: 'Khi bỏ dấu ngoặc có dấu "-" đằng trước: -(a - b + c) ta được:',
        options: ['-a - b + c', '-a + b - c', '-a - b - c', 'a - b + c'],
        correctOption: 1,
        explanation: 'Quy tắc dấu ngoặc: Khi bỏ dấu ngoặc có dấu (-) đằng trước, ta phải đổi dấu tất cả các số hạng trong ngoặc.'
      },
      {
        id: 'q2_3',
        islandId: 'island_2',
        content: 'Tìm x biết: x + 10 = -5',
        options: ['x = 15', 'x = 5', 'x = -15', 'x = -5'],
        correctOption: 2,
        explanation: 'x = -5 - 10 = -15.'
      }
    ],
    island_3: [
      {
        id: 'q3_1',
        islandId: 'island_3',
        content: 'Tất cả các ước của số nguyên -6 là:',
        options: [
          '{-1, -2, -3, -6}',
          '{1, 2, 3, 6}',
          '{-1, 1, -2, 2, -3, 3, -6, 6}',
          '{0, -1, 1, -2, 2, -3, 3, -6, 6}'
        ],
        correctOption: 2,
        explanation: 'Ước của -6 bao gồm cả các số nguyên âm và số nguyên dương chia hết cho -6.'
      },
      {
        id: 'q3_2',
        islandId: 'island_3',
        content: 'Hình nào dưới đây có trục đối xứng?',
        options: ['Hình tam giác thường', 'Hình tròn', 'Hình thang vuông', 'Hình bình hành không phải hình chữ nhật'],
        correctOption: 1,
        explanation: 'Hình tròn có vô số trục đối xứng (mọi đường thẳng đi qua tâm).'
      },
      {
        id: 'q3_3',
        islandId: 'island_3',
        content: 'Một nhiệt độ ban đầu là -3°C, sau đó tăng lên 5°C. Nhiệt độ mới là bao nhiêu?',
        options: ['-8°C', '8°C', '2°C', '-2°C'],
        correctOption: 2,
        explanation: 'Nhiệt độ mới = -3 + 5 = 2°C.'
      }
    ]
  };

  return mockDatabase[islandId] || mockDatabase.island_1;
};

/**
 * @file scoring-service.js
 * @description Dịch vụ tính toán điểm số, quy đổi thang điểm và xếp loại học lực.
 */

import { SCORE_THRESHOLDS, ACADEMIC_RANK, QUIZ_CONFIG } from '../config/constants.js';

/**
 * Tính điểm cho bài làm trắc nghiệm dựa trên số câu trả lời đúng
 * @param {Array<{questionId: string, selectedOption: number|string}>} userAnswers - Danh sách câu trả lời học sinh đã chọn
 * @param {Array<{id: string, correctOption: number|string}>} correctQuestions - Danh sách câu hỏi kèm đáp án đúng
 * @returns {{ score: number, correctCount: number, totalQuestions: number, percentage: number }}
 */
export const calculateQuizScore = (userAnswers = [], correctQuestions = []) => {
  if (!correctQuestions || correctQuestions.length === 0) {
    return { score: 0, correctCount: 0, totalQuestions: 0, percentage: 0 };
  }

  const totalQuestions = correctQuestions.length;
  let correctCount = 0;

  // Bản đồ hóa đáp án đúng theo questionId để tra cứu O(1)
  const answerMap = new Map();
  correctQuestions.forEach(q => {
    answerMap.set(String(q.id), q.correctOption);
  });

  // Đếm số câu trả lời đúng
  userAnswers.forEach(ans => {
    const correctAnswer = answerMap.get(String(ans.questionId));
    if (correctAnswer !== undefined && String(ans.selectedOption) === String(correctAnswer)) {
      correctCount++;
    }
  });

  // Quy đổi về thang điểm QUIZ_CONFIG.MAX_SCORE (mặc định 10)
  const score = Number(((correctCount / totalQuestions) * QUIZ_CONFIG.MAX_SCORE).toFixed(1));
  const percentage = Math.round((correctCount / totalQuestions) * 100);

  return {
    score,
    correctCount,
    totalQuestions,
    percentage
  };
};

/**
 * Tính điểm trung bình (GPA) từ danh sách điểm của các đảo khám phá
 * @param {Array<number>} scores - Danh sách điểm số các bài làm đảo
 * @returns {number} Điểm trung bình làm tròn 1 chữ số thập phân
 */
export const calculateAverageScore = (scores = []) => {
  const validScores = scores.filter(s => typeof s === 'number' && !isNaN(s));
  if (validScores.length === 0) return 0;

  const sum = validScores.reduce((acc, curr) => acc + curr, 0);
  return Number((sum / validScores.length).toFixed(1));
};

/**
 * Xác định xếp loại học lực dựa trên điểm số trung bình
 * @param {number} averageScore - Điểm trung bình (Thang điểm 10)
 * @returns {Object} Đối tượng chứa thông tin xếp loại (key, label, badgeColor)
 */
export const getAcademicRank = (averageScore = 0) => {
  const score = Number(averageScore);

  if (score >= SCORE_THRESHOLDS.EXCELLENT) {
    return ACADEMIC_RANK.EXCELLENT;
  }
  if (score >= SCORE_THRESHOLDS.GOOD) {
    return ACADEMIC_RANK.GOOD;
  }
  if (score >= SCORE_THRESHOLDS.FAIR) {
    return ACADEMIC_RANK.FAIR;
  }
  return ACADEMIC_RANK.NOT_QUALIFIED;
};

/**
 * Kiểm tra học sinh có đủ điều kiện nhận giấy chứng nhận không (ĐTB >= 6.5)
 * @param {number} averageScore - Điểm trung bình tích lũy
 * @returns {boolean}
 */
export const isEligibleForCertificate = (averageScore = 0) => {
  return Number(averageScore) >= SCORE_THRESHOLDS.FAIR;
};

/**
 * Tạo thẻ HTML Badge hiển thị xếp loại học lực với màu sắc tương ứng
 * @param {number} averageScore - Điểm trung bình
 * @returns {string} Chuỗi HTML đại diện cho badge
 */
export const renderRankBadge = (averageScore = 0) => {
  const rank = getAcademicRank(averageScore);
  return `
    <span class="rank-badge" style="background-color: ${rank.badgeColor}; color: #ffffff; padding: 0.25rem 0.75rem; border-radius: 9999px; font-weight: 600; font-size: 0.875rem; display: inline-block;">
      ${rank.label}
    </span>
  `;
};

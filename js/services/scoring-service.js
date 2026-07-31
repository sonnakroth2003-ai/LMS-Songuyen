/**
 * @file scoring-service.js
 * @description Dịch vụ tính toán điểm số, quy đổi thang điểm và xếp loại học lực.
 */

import { SCORE_THRESHOLDS, ACADEMIC_RANK, QUIZ_CONFIG } from '../config/constants.js';

/**
 * Tính điểm cho bài làm trắc nghiệm dựa trên số câu trả lời đúng
 * @param {Array} userAnswers - Đáp án học sinh chọn [{questionId, selectedOption}, ...]
 * @param {Array} correctQuestions - Đáp án đúng [{id, correctOption}, ...]
 * @returns {Object} { score, correctCount, totalQuestions, percentage }
 */
export const calculateQuizScore = (userAnswers = [], correctQuestions = []) => {
  if (!correctQuestions || correctQuestions.length === 0) {
    return { score: 0, correctCount: 0, totalQuestions: 0, percentage: 0 };
  }

  const totalQuestions = correctQuestions.length;
  let correctCount = 0;

  // Sử dụng Map để tối ưu hiệu suất tra cứu đáp án đúng
  const answerMap = new Map();
  correctQuestions.forEach(q => {
    answerMap.set(String(q.id), String(q.correctOption));
  });

  // So sánh đáp án người dùng với đáp án đúng
  userAnswers.forEach(ans => {
    if (answerMap.get(String(ans.questionId)) === String(ans.selectedOption)) {
      correctCount++;
    }
  });

  // Quy đổi điểm sang thang 10
  const score = parseFloat(((correctCount / totalQuestions) * QUIZ_CONFIG.MAX_SCORE).toFixed(1));
  const percentage = Math.round((correctCount / totalQuestions) * 100);

  return {
    score,
    correctCount,
    totalQuestions,
    percentage
  };
};

/**
 * Tính điểm trung bình (GPA) từ danh sách điểm số
 */
export const calculateAverageScore = (scores = []) => {
  const validScores = scores.filter(s => typeof s === 'number' && !isNaN(s));
  if (validScores.length === 0) return 0;

  const sum = validScores.reduce((acc, curr) => acc + curr, 0);
  return parseFloat((sum / validScores.length).toFixed(1));
};

/**
 * Xác định xếp loại học lực dựa trên điểm trung bình
 */
export const getAcademicRank = (averageScore = 0) => {
  const score = parseFloat(averageScore);

  if (score >= SCORE_THRESHOLDS.EXCELLENT) return ACADEMIC_RANK.EXCELLENT;
  if (score >= SCORE_THRESHOLDS.GOOD) return ACADEMIC_RANK.GOOD;
  if (score >= SCORE_THRESHOLDS.FAIR) return ACADEMIC_RANK.FAIR;
  
  return ACADEMIC_RANK.NOT_QUALIFIED;
};

/**
 * Kiểm tra điều kiện cấp chứng nhận
 */
export const isEligibleForCertificate = (averageScore = 0) => {
  return parseFloat(averageScore) >= SCORE_THRESHOLDS.FAIR;
};

/**
 * Tạo thẻ HTML Badge hiển thị xếp loại học lực
 */
export const renderRankBadge = (averageScore = 0) => {
  const rank = getAcademicRank(averageScore);
  return `
    <span class="rank-badge" style="background-color: ${rank.badgeColor}; color: #ffffff; padding: 0.25rem 0.75rem; border-radius: 9999px; font-weight: 600; font-size: 0.875rem; display: inline-block;">
      ${rank.label}
    </span>
  `;
};

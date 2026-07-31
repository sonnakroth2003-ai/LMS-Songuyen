/**
 * @file course-service.js
 * @description Dịch vụ truy vấn dữ liệu khóa học, Đảo Tri Thức và danh sách câu hỏi kiểm tra.
 */

import { ISLANDS } from '../config/constants.js';

/**
 * Dữ liệu nội bộ cho các Đảo Tri Thức (Toán 6 - Chương trình 2018)
 */
const MOCK_LESSONS_DATA = {
  ISLAND_1: {
    id: 'ISLAND_1',
    category: 'Đảo 1 - Chương 1',
    title: 'Đảo Tập Hợp & Số Tự Nhiên',
    description: 'Khám phá khái niệm tập hợp, các phép tính cơ bản trong tập hợp số tự nhiên.',
    summary: 'Nắm vững phần tử của tập hợp, tập hợp con và thứ tự thực hiện các phép tính.',
    contentHtml: `
      <div class="lesson-content">
        <p class="lead">Tập hợp là một khái niệm cơ bản trong Toán học.</p>
        <h5 class="fw-bold text-primary mt-4">1. Khái niệm tập hợp</h5>
        <p>Ví dụ: Tập hợp $A$ các số tự nhiên nhỏ hơn 5: $A = \{0; 1; 2; 3; 4\}$.</p>
        <h5 class="fw-bold text-primary mt-4">2. Thứ tự thực hiện phép tính</h5>
        <p><strong>Lũy thừa $\rightarrow$ Nhân và chia $\rightarrow$ Cộng và trừ</strong>.</p>
      </div>
    `,
    examples: [
      { question: 'Viết tập hợp $B = \{x \in \mathbb{N} \mid 2 < x \le 6\}$', solution: '$B = \{3; 4; 5; 6\}$.' }
    ],
    questions: [
      { id: 'q1', content: 'Cho $M = \{2; 3; 5; 7\}$. Khẳng định đúng?', options: ['4 thuộc M', '5 thuộc M', '7 không thuộc M', '0 thuộc M'], correctAnswer: 1, explanation: 'Số 5 có trong M.' },
      { id: 'q2', content: 'Kết quả của $3^2 \cdot 2 + 4$ là?', options: ['22', '24', '18', '30'], correctAnswer: 0, explanation: '$9 \cdot 2 + 4 = 22$.' }
    ]
  },
  ISLAND_2: {
    id: 'ISLAND_2',
    category: 'Đảo 2 - Chương 2',
    title: 'Đảo Tính Chia Hết & Số Nguyên Tố',
    description: 'Chinh phục dấu hiệu chia hết cho 2, 3, 5, 9 và số nguyên tố.',
    summary: 'Số nguyên tố, hợp số, UCLN và BCNN.',
    contentHtml: `<div class="lesson-content"><p>Tìm hiểu về tính chia hết và số nguyên tố.</p></div>`,
    examples: [],
    questions: [
      { id: 'q1', content: 'Số nào là số nguyên tố?', options: ['9', '15', '17', '21'], correctAnswer: 2, explanation: '17 chỉ có ước là 1 và 17.' }
    ]
  },
  ISLAND_3: {
    id: 'ISLAND_3',
    category: 'Đảo 3 - Chương 3',
    title: 'Đảo Số Nguyên & Các Phép Tính',
    description: 'Làm quen với tập hợp số nguyên Z và quy tắc dấu.',
    summary: 'Số nguyên âm, số nguyên dương, quy tắc bỏ dấu ngoặc.',
    contentHtml: `<p>Tập hợp số nguyên bao gồm các số nguyên âm, số 0 và các số nguyên dương.</p>`,
    examples: [],
    questions: [
      { id: 'q1', content: 'Kết quả của $(-15) + 20$ là:', options: ['-35', '-5', '5', '35'], correctAnswer: 2, explanation: '$20 - 15 = 5$.' }
    ]
  }
};

/**
 * Lấy danh sách tất cả các Đảo Tri Thức / Bài học
 */
export const getAllLessons = async () => {
  return Object.values(MOCK_LESSONS_DATA);
};

/**
 * Lấy thông tin chi tiết bài học theo ID
 */
export const getLessonById = async (lessonId) => {
  try {
    if (!lessonId) return null;
    return MOCK_LESSONS_DATA[lessonId] || null;
  } catch (error) {
    console.error(`[CourseService] Lỗi khi lấy bài học ID ${lessonId}:`, error);
    return null;
  }
};

/**
 * Lấy danh sách câu hỏi kiểm tra cho bài học/đảo
 */
export const getQuizQuestionsByLessonId = async (lessonId) => {
  const lesson = await getLessonById(lessonId);
  return lesson?.questions || [];
};

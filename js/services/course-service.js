/**
 * @file course-service.js
 * @description Dịch vụ truy vấn dữ liệu khóa học, Đảo Tri Thức và danh sách câu hỏi kiểm tra.
 */

import { ISLANDS } from '../config/constants.js';

/**
 * Dữ liệu Mock mặc định cho các Đảo Tri Thức (Toán 6 - Chương trình 2018)
 * Sử dụng khi không có dữ liệu trả về từ Firestore.
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
        <p class="lead">Tập hợp là một khái niệm cơ bản trong Toán học. Một tập hợp bao gồm các phần tử xác định.</p>
        <h5 class="fw-bold text-primary mt-4">1. Khái niệm tập hợp</h5>
        <p>Ví dụ: Tập hợp $A$ các số tự nhiên nhỏ hơn 5 được viết là: $A = \{0; 1; 2; 3; 4\}$.</p>
        <ul>
          <li>Ký hiệu $1 \in A$ (1 thuộc A).</li>
          <li>Ký hiệu $5 \notin A$ (5 không thuộc A).</li>
        </ul>
        <h5 class="fw-bold text-primary mt-4">2. Thứ tự thực hiện phép tính</h5>
        <p>Đối với biểu thức không có dấu ngoặc: <strong>Lũy thừa $\rightarrow$ Nhân và chia $\rightarrow$ Cộng và trừ</strong>.</p>
        <p>Đối với biểu thức có dấu ngoặc: <strong>( ) $\rightarrow$ [ ] $\rightarrow$ { }</strong>.</p>
      </div>
    `,
    examples: [
      {
        question: 'Cho tập hợp $B = \{x \in \mathbb{N} \mid 2 < x \le 6\}$. Hãy viết tập hợp $B$ bằng cách liệt kê các phần tử.',
        solution: 'Tập hợp $B$ gồm các số tự nhiên lớn hơn 2 và nhỏ hơn hoặc bằng 6. Do đó: $B = \{3; 4; 5; 6\}$.'
      },
      {
        question: 'Tính giá trị biểu thức: $100 - (2^3 \cdot 5 + 10)$.',
        solution: 'Thực hiện phép tính trong ngoặc trước: $2^3 \cdot 5 = 8 \cdot 5 = 40$. Khi đó ngoặc có giá trị $40 + 10 = 50$. Kết quả: $100 - 50 = 50$.'
      }
    ],
    questions: [
      {
        id: 'q1',
        content: 'Cho tập hợp $M = \{2; 3; 5; 7\}$. Khẳng định nào sau đây là DÙNG?',
        options: ['A. $4 \in M$', 'B. $5 \in M$', 'C. $7 \notin M$', 'D. $0 \in M$'],
        correctAnswer: 1, // B
        explanation: 'Số 5 có mặt trong tập hợp M nên $5 \in M$ là khẳng định đúng.'
      },
      {
        id: 'q2',
        content: 'Kết quả của phép tính $3^2 \cdot 2 + 4$ là bao nhiêu?',
        options: ['A. 22', 'B. 24', 'C. 18', 'D. 30'],
        correctAnswer: 0, // A
        explanation: '$3^2 \cdot 2 + 4 = 9 \cdot 2 + 4 = 18 + 4 = 22$.'
      },
      {
        id: 'q3',
        content: 'Số tự nhiên nhỏ nhất có 3 chữ số khác nhau là:',
        options: ['A. 100', 'B. 101', 'C. 102', 'D. 123'],
        correctAnswer: 2, // C
        explanation: 'Số tự nhiên nhỏ nhất có 3 chữ số khác nhau là 102.'
      }
    ]
  },
  ISLAND_2: {
    id: 'ISLAND_2',
    category: 'Đảo 2 - Chương 2',
    title: 'Đảo Tính Chia Hết & Số Nguyên Tố',
    description: 'Chinh phục dấu hiệu chia hết cho 2, 3, 5, 9 và cách phân tích một số ra thừa số nguyên tố.',
    summary: 'Hiểu về số nguyên tố, hợp số, UCLN và BCNN.',
    contentHtml: `
      <div class="lesson-content">
        <p class="lead">Tính chia hết là nền tảng quan trọng để giải các bài toán số học nâng cao.</p>
        <h5 class="fw-bold text-primary mt-4">1. Dấu hiệu chia hết</h5>
        <ul>
          <li><strong>Chia hết cho 2 và 5:</strong> Dựa vào chữ số tận cùng (tận cùng là 0, 2, 4, 6, 8 chia hết cho 2; tận cùng là 0, 5 chia hết cho 5).</li>
          <li><strong>Chia hết cho 3 và 9:</strong> Dựa vào tổng các chữ số.</li>
        </ul>
        <h5 class="fw-bold text-primary mt-4">2. Số nguyên tố & Hợp số</h5>
        <p><strong>Số nguyên tố</strong> là số tự nhiên lớn hơn 1, chỉ có 2 ước là 1 và chính nó (VD: 2, 3, 5, 7, 11...).</p>
      </div>
    `,
    examples: [
      {
        question: 'Trong các số sau, số nào chia hết cho cả 2 và 3: 12, 15, 20, 25?',
        solution: 'Số chia hết cho cả 2 và 3 phải là số chẵn và có tổng chữ số chia hết cho 3. Trong các số trên, chỉ có 12 là số chẵn và $1+2=3$ (chia hết cho 3).'
      }
    ],
    questions: [
      {
        id: 'q1',
        content: 'Số nào sau đây là số nguyên tố?',
        options: ['A. 9', 'B. 15', 'C. 17', 'D. 21'],
        correctAnswer: 2, // C
        explanation: '17 chỉ có 2 ước là 1 và 17 nên 17 là số nguyên tố.'
      },
      {
        id: 'q2',
        content: 'Ước chung lớn nhất (ƯCLN) của 12 và 18 là:',
        options: ['A. 2', 'B. 3', 'C. 6', 'D. 36'],
        correctAnswer: 2, // C
        explanation: 'Các ước chung của 12 và 18 là {1; 2; 3; 6}. Do đó ƯCLN(12, 18) = 6.'
      }
    ]
  },
  ISLAND_3: {
    id: 'ISLAND_3',
    category: 'Đảo 3 - Chương 3',
    title: 'Đảo Số Nguyên & Các Phép Tính',
    description: 'Làm quen với tập hợp số nguyên Z, quy tắc dấu và thực hiện phép tính trên số nguyên.',
    summary: 'Số nguyên âm, số nguyên dương, quy tắc chuyển tế và bỏ dấu ngoặc.',
    contentHtml: `<p class="lead">Tập hợp số nguyên bao gồm các số nguyên âm, số 0 và các số nguyên dương.</p>`,
    examples: [],
    questions: [
      {
        id: 'q1',
        content: 'Kết quả của phép tính $(-15) + 20$ là:',
        options: ['A. -35', 'B. -5', 'C. 5', 'D. 35'],
        correctAnswer: 2, // C
        explanation: '$(-15) + 20 = 20 - 15 = 5$.'
      }
    ]
  }
};

/**
 * Lấy danh sách tất cả các Đảo Tri Thức / Bài học
 * @returns {Promise<Array>} Danh sách các bài học
 */
export const getAllLessons = async () => {
  try {
    // Nếu có dữ liệu từ constants
    if (ISLANDS && Object.keys(ISLANDS).length > 0) {
      return Object.keys(ISLANDS).map((key) => {
        const item = ISLANDS[key];
        const mockDetail = MOCK_LESSONS_DATA[key] || {};
        return {
          id: key,
          ...item,
          ...mockDetail
        };
      });
    }
    return Object.values(MOCK_LESSONS_DATA);
  } catch (error) {
    console.error('[CourseService] Lỗi khi lấy danh sách bài học:', error);
    return Object.values(MOCK_LESSONS_DATA);
  }
};

/**
 * Lấy thông tin chi tiết bài học theo ID
 * @param {string} lessonId - ID của bài học / đảo (VD: 'ISLAND_1')
 * @returns {Promise<Object|null>} Dữ liệu chi tiết bài học
 */
export const getLessonById = async (lessonId) => {
  try {
    if (!lessonId) return null;

    // Ưu tiên lấy từ Mock Data hoặc hợp nhất với ISLANDS config
    const mockLesson = MOCK_LESSONS_DATA[lessonId];
    const configLesson = ISLANDS ? ISLANDS[lessonId] : null;

    if (!mockLesson && !configLesson) {
      console.warn(`[CourseService] Không tìm thấy bài học với ID: ${lessonId}`);
      return null;
    }

    return {
      id: lessonId,
      title: configLesson?.name || mockLesson?.title || `Bài học ${lessonId}`,
      description: configLesson?.description || mockLesson?.description || '',
      category: mockLesson?.category || 'Đảo Tri Thức',
      summary: mockLesson?.summary || '',
      contentHtml: mockLesson?.contentHtml || `<p>Nội dung đang được cập nhật...</p>`,
      examples: mockLesson?.examples || [],
      questions: mockLesson?.questions || []
    };
  } catch (error) {
    console.error(`[CourseService] Lỗi khi lấy bài học ID ${lessonId}:`, error);
    return null;
  }
};

/**
 * Lấy danh sách câu hỏi kiểm tra cho bài học/đảo
 * @param {string} lessonId - ID bài học
 * @returns {Promise<Array>} Danh sách câu hỏi
 */
export const getQuizQuestionsByLessonId = async (lessonId) => {
  const lesson = await getLessonById(lessonId);
  return lesson?.questions || [];
};

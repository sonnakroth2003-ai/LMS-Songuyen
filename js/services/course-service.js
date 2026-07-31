const MOCK_LESSONS_DATA = {
  ISLAND_1: {
    id: 'ISLAND_1',
    category: 'Đảo 1 - Chương 1',
    title: 'Đảo Tập Hợp & Số Tự Nhiên',
    description: 'Khám phá khái niệm tập hợp, các phép tính cơ bản trong tập hợp số tự nhiên.',
    contentHtml: `
      <div class="lesson-content">
        <h5>1. Tập hợp là gì?</h5>
        <p>Tập hợp là một nhóm các đối tượng (gọi là phần tử) có cùng tính chất. Ví dụ: A = {1; 2; 3; 4}.</p>
        <h5>2. Các phép tính cơ bản</h5>
        <p>Trong tập hợp số tự nhiên, chúng ta có các phép tính: Cộng, Trừ, Nhân, Chia và Lũy thừa.</p>
        <p><em>Lưu ý:</em> Phép nhân và phép cộng có tính chất giao hoán và kết hợp.</p>
      </div>`,
    questions: [
      { id: 'q1', content: 'Số 5 thuộc tập hợp M = {2; 3; 5; 7} không?', options: ['Không thuộc', 'Thuộc', 'Là tập con', 'Không xác định'], correctOption: 1 },
      { id: 'q2', content: 'Số tự nhiên nhỏ nhất là số nào?', options: ['1', '0', '2', '10'], correctOption: 1 },
      { id: 'q3', content: 'Kết quả của 2 + 3 là?', options: ['4', '6', '5', '7'], correctOption: 2 },
      { id: 'q4', content: 'Tập hợp các số tự nhiên N được ký hiệu là?', options: ['{0; 1; 2; ...}', '{1; 2; 3; ...}', '{...; -1; 0; 1; ...}', '{0; 1; 2}'], correctOption: 0 },
      { id: 'q5', content: 'Tính 10 - 3 bằng bao nhiêu?', options: ['6', '8', '7', '9'], correctOption: 2 }
    ]
  },
  ISLAND_2: {
    id: 'ISLAND_2',
    category: 'Đảo 2 - Chương 2',
    title: 'Đảo Tính Chia Hết',
    description: 'Tìm hiểu về tính chia hết và số nguyên tố.',
    contentHtml: `
      <div class="lesson-content">
        <h5>1. Tính chia hết</h5>
        <p>Số a chia hết cho số b (b khác 0) nếu có số tự nhiên k sao cho a = b.k.</p>
        <h5>2. Số nguyên tố</h5>
        <p>Số nguyên tố là số tự nhiên lớn hơn 1, chỉ có hai ước là 1 và chính nó.</p>
      </div>`,
    questions: [
      { id: 'q2_1', content: 'Số nào sau đây là số nguyên tố?', options: ['4', '6', '7', '9'], correctOption: 2 },
      { id: 'q2_2', content: 'Ước của 6 là?', options: ['{1, 2, 3, 6}', '{1, 3, 6}', '{2, 3, 6}', '{1, 2, 6}'], correctOption: 0 },
      { id: 'q2_3', content: 'Số nào chia hết cho cả 2 và 5?', options: ['12', '15', '20', '22'], correctOption: 2 },
      { id: 'q2_4', content: 'Kết quả phân tích số 12 ra thừa số nguyên tố là?', options: ['2.6', '3.4', '2^2.3', '2.2.2'], correctOption: 2 },
      { id: 'q2_5', content: 'Số 1 có phải số nguyên tố không?', options: ['Có', 'Không', 'Là hợp số', 'Không xác định'], correctOption: 1 }
    ]
  },
  ISLAND_3: {
    id: 'ISLAND_3',
    category: 'Đảo 3 - Chương 3',
    title: 'Đảo Số Nguyên',
    description: 'Làm quen với tập hợp số nguyên Z.',
    contentHtml: `
      <div class="lesson-content">
        <h5>1. Tập hợp số nguyên Z</h5>
        <p>Z = {... -3, -2, -1, 0, 1, 2, 3 ...}. Bao gồm số nguyên âm, số 0 và số nguyên dương.</p>
        <h5>2. Thứ tự trong Z</h5>
        <p>Trên trục số, số nằm bên phải lớn hơn số nằm bên trái.</p>
      </div>`,
    questions: [
      { id: 'q3_1', content: 'Số nào nhỏ hơn -5?', options: ['-4', '-6', '0', '5'], correctOption: 1 },
      { id: 'q3_2', content: 'Kết quả của (-5) + (-3) là?', options: ['2', '-2', '8', '-8'], correctOption: 3 },
      { id: 'q3_3', content: 'Số đối của 10 là?', options: ['-10', '10', '0', '1/10'], correctOption: 0 },
      { id: 'q3_4', content: 'Kết quả của (-2) - (-5) là?', options: ['-7', '3', '-3', '7'], correctOption: 1 },
      { id: 'q3_5', content: 'Giá trị tuyệt đối của -7 là?', options: ['-7', '0', '7', '1'], correctOption: 2 }
    ]
  }
};

export const getAllLessons = async () => Object.values(MOCK_LESSONS_DATA);

export const getLessonById = async (lessonId) => {
  if (!lessonId) return null;
  const cleanId = lessonId.toUpperCase().replace('-', '_');
  const finalId = cleanId.startsWith('ISLAND_') ? cleanId : `ISLAND_${cleanId}`;
  return MOCK_LESSONS_DATA[finalId] || null;
};

export const getQuizQuestionsByLessonId = async (lessonId) => {
  const lesson = await getLessonById(lessonId);
  return lesson?.questions || [];
};

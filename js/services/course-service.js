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
    contentHtml: '<div class="lesson-content"><p>Nội dung đang được cập nhật bởi Giáo viên...</p></div>',
    questions: []
  },
  ISLAND_3: {
    id: 'ISLAND_3',
    category: 'Đảo 3 - Chương 3',
    title: 'Đảo Số Nguyên',
    description: 'Làm quen với tập hợp số nguyên Z.',
    contentHtml: '<div class="lesson-content"><p>Nội dung đang được cập nhật bởi Giáo viên...</p></div>',
    questions: []
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

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
      { id: 'q1', content: 'Số 5 thuộc M = {2; 3; 5; 7}?', options: ['Sai', 'Đúng'], correctAnswer: 1, explanation: 'Số 5 có trong M.' }
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

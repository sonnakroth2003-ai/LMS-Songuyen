/**
 * @file formatters.js
 * @description Các hàm tiện ích định dạng dữ liệu (Điểm số, Thời gian, Tên, Chuỗi).
 */

/**
 * Định dạng điểm số hiển thị (Ví dụ: 8.33333 -> "8.3", 10 -> "10")
 * @param {number|string} score - Điểm số cần định dạng
 * @param {number} decimals - Số chữ số thập phân tối đa (mặc định 1)
 * @returns {string} Điểm số đã định dạng
 */
export const formatScore = (score, decimals = 1) => {
  const num = Number(score);
  if (isNaN(num)) return '--';
  
  // Nếu là số nguyên thì giữ nguyên, nếu số thập phân thì làm tròn
  return Number.isInteger(num) ? `${num}` : num.toFixed(decimals);
};

/**
 * Định dạng ngày tháng năm sang tiếng Việt (Ví dụ: "30/07/2026")
 * @param {Date|string|number|Object} dateInput - Dữ liệu ngày đầu vào (Date object, timestamp, hoặc Firestore Timestamp)
 * @returns {string} Chuỗi ngày tháng đã định dạng DD/MM/YYYY
 */
export const formatDate = (dateInput) => {
  if (!dateInput) return '--/--/----';

  let dateObj;

  // Xử lý trường hợp Firestore Timestamp object (có hàm toDate)
  if (dateInput && typeof dateInput.toDate === 'function') {
    dateObj = dateInput.toDate();
  } else if (dateInput instanceof Date) {
    dateObj = dateInput;
  } else {
    dateObj = new Date(dateInput);
  }

  if (isNaN(dateObj.getTime())) return '--/--/----';

  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();

  return `${day}/${month}/${year}`;
};

/**
 * Định dạng ngày giờ chi tiết (Ví dụ: "14:30 - 30/07/2026")
 * @param {Date|string|number|Object} dateInput - Dữ liệu ngày đầu vào
 * @returns {string} Chuỗi ngày giờ HH:mm - DD/MM/YYYY
 */
export const formatDateTime = (dateInput) => {
  if (!dateInput) return '--:-- - --/--/----';

  let dateObj;
  if (dateInput && typeof dateInput.toDate === 'function') {
    dateObj = dateInput.toDate();
  } else if (dateInput instanceof Date) {
    dateObj = dateInput;
  } else {
    dateObj = new Date(dateInput);
  }

  if (isNaN(dateObj.getTime())) return '--:-- - --/--/----';

  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();

  return `${hours}:${minutes} - ${day}/${month}/${year}`;
};

/**
 * Định dạng giây thành chuỗi Phút:Giây dùng cho đồng hồ làm bài (Ví dụ: 125 -> "02:05")
 * @param {number} totalSeconds - Số giây còn lại
 * @returns {string} Chuỗi MM:SS
 */
export const formatTimer = (totalSeconds) => {
  const seconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  const formattedMins = String(mins).padStart(2, '0');
  const formattedSecs = String(secs).padStart(2, '0');

  return `${formattedMins}:${formattedSecs}`;
};

/**
 * Định dạng chuẩn hóa Tên người dùng (Viết hoa chữ cái đầu mỗi từ)
 * @param {string} name - Tên nguyên bản
 * @returns {string} Tên đã chuẩn hóa (VD: "nguyen van an" -> "Nguyen Van An")
 */
export const formatCapitalizeName = (name) => {
  if (!name || typeof name !== 'string') return '';

  return name
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Định dạng phần trăm tiến độ (Ví dụ: 0.75 -> "75%")
 * @param {number} ratio - Tỷ lệ từ 0 đến 1
 * @returns {string} Chuỗi %
 */
export const formatPercentage = (ratio) => {
  const val = Number(ratio);
  if (isNaN(val)) return '0%';
  const percent = Math.min(100, Math.max(0, Math.round(val * 100)));
  return `${percent}%`;
};

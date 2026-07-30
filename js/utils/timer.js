/**
 * @file timer.js
 * @description Class & Utilities quản lý đồng hồ đếm ngược cho bài thi / trắc nghiệm.
 */

import { formatTimer } from './formatters.js';

export class QuizTimer {
  /**
   * Tạo một bộ đếm ngược cho bài thi
   * @param {Object} config - Cấu hình bộ đếm
   * @param {number} config.durationInSeconds - Tổng thời gian làm bài (tính bằng giây)
   * @param {Function} [config.onTick] - Callback gọi mỗi giây, nhận vào { remainingSeconds, formattedTime }
   * @param {Function} [config.onTimeUp] - Callback tự động gọi khi hết giờ
   * @param {Function} [config.onWarning] - Callback gọi khi thời gian còn lại chạm ngưỡng cảnh báo (mặc định dưới 60s)
   * @param {number} [config.warningThreshold=60] - Ngưỡng giây cảnh báo
   */
  constructor({ durationInSeconds = 900, onTick = null, onTimeUp = null, onWarning = null, warningThreshold = 60 }) {
    this.duration = Math.max(0, Math.floor(durationInSeconds));
    this.remainingSeconds = this.duration;
    this.onTick = onTick;
    this.onTimeUp = onTimeUp;
    this.onWarning = onWarning;
    this.warningThreshold = warningThreshold;

    this.timerId = null;
    this.isRunning = false;
    this.isWarningTriggered = false;
  }

  /**
   * Bắt đầu đếm ngược
   */
  start() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.emitTick(); // Phát sự kiện hiển thị giây đầu tiên ngay lập tức

    this.timerId = setInterval(() => {
      this.remainingSeconds--;

      // Kiểm tra ngưỡng cảnh báo sắp hết giờ
      if (
        this.remainingSeconds <= this.warningThreshold &&
        !this.isWarningTriggered &&
        typeof this.onWarning === 'function'
      ) {
        this.isWarningTriggered = true;
        this.onWarning(this.remainingSeconds);
      }

      // Phát thông báo tick thời gian
      this.emitTick();

      // Hết giờ
      if (this.remainingSeconds <= 0) {
        this.stop();
        if (typeof this.onTimeUp === 'function') {
          this.onTimeUp();
        }
      }
    }, 1000);
  }

  /**
   * Phát dữ liệu thời gian cập nhật ra callback UI
   */
  emitTick() {
    if (typeof this.onTick === 'function') {
      this.onTick({
        remainingSeconds: this.remainingSeconds,
        formattedTime: formatTimer(this.remainingSeconds),
        percentage: this.duration > 0 ? (this.remainingSeconds / this.duration) * 100 : 0
      });
    }
  }

  /**
   * Tạm dừng đếm ngược
   */
  pause() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.isRunning = false;
  }

  /**
   * Tiếp tục đếm ngược
   */
  resume() {
    if (!this.isRunning && this.remainingSeconds > 0) {
      this.start();
    }
  }

  /**
   * Dừng hẳn và dọn dẹp bộ đếm
   */
  stop() {
    this.pause();
    this.remainingSeconds = 0;
  }

  /**
   * Đặt lại bộ đếm về thời gian ban đầu
   */
  reset() {
    this.stop();
    this.remainingSeconds = this.duration;
    this.isWarningTriggered = false;
  }
}

/**
 * Hàm Helper nhanh để tạo đếm ngược đơn giản
 * @param {number} minutes - Số phút
 * @param {Function} onTick - Callback mỗi giây
 * @param {Function} onTimeUp - Callback hết giờ
 * @returns {QuizTimer} Đối tượng bộ đếm
 */
export const createQuizTimer = (minutes, onTick, onTimeUp) => {
  const seconds = (minutes || 15) * 60;
  const timer = new QuizTimer({
    durationInSeconds: seconds,
    onTick,
    onTimeUp
  });
  return timer;
};

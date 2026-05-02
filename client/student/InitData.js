/**
 * FILE: InitData.js
 * Nhiệm vụ: Khởi tạo các cấu trúc dữ liệu dựa trên metadata từ StorageManager
 */

const DataInitializer = {
    /**
     * Khởi tạo mảng đáp án dựa trên cấu hình trong StorageManager
     * @returns {Array} - Mảng đáp án rỗng [ "", "", ... ]
     */
    initAnswersFromStorage() {
        // 1. Lấy totalQuestions từ StorageManager
        // Nếu chưa có (mặc định là 0), mảng sẽ rỗng
        const total = StorageManager.examData.totalQuestions || 0;

        // 2. Kiểm tra xem đã có đáp án cũ chưa (để tránh ghi đè nếu đang làm dở)
        const existing = StorageManager.examData.finalAnswers;
        if (existing && existing.length === total + 1) {
            console.log(`[DataInitializer] Sử dụng lại ${total} đáp án hiện có.`);
            return existing;
        }

        // 3. Tạo mới mảng rỗng (Index 0 bỏ trống, bắt đầu từ 1)
        // Dùng .fill("") để tránh lỗi empty slots khi xử lý mảng
        const newAnswers = new Array(total + 1).fill("");
        
        console.log(`[DataInitializer] Đã tạo mảng rỗng cho ${total} câu hỏi.`);
        
        // Cập nhật ngược lại vào examData nếu cần đồng bộ ngay
        StorageManager.examData.finalAnswers = newAnswers;
        
        return newAnswers;
    },

    /**
     * Reset hoàn toàn dữ liệu về trạng thái rỗng dựa trên cấu hình hiện tại
     */
    resetAnswers() {
        const total = StorageManager.examData.totalQuestions || 0;
        StorageManager.examData.finalAnswers = new Array(total + 1).fill("");
        StorageManager.saveMeta();
    }
};
/**
 * 1. Định nghĩa các mã loại cố định
 */
const QuestionTypeKeys = {
    ESSAY: 'essay',           // Gộp Tự luận & Trả lời ngắn
    TRUE_FALSE: 'true_false', // Đúng/Sai
    LISTENING: 'listening'    // Loại nghe (Chỉ có audio, không đáp án)
};

/**
 * 2. Bộ ánh xạ: Map text hiển thị trên UI (trong thẻ span của label) sang Key hệ thống
 */
const UI_TYPE_MAP = {
    "Tự luận": QuestionTypeKeys.ESSAY,
    "Đúng/Sai": QuestionTypeKeys.TRUE_FALSE,
    "Nghe": QuestionTypeKeys.LISTENING
};

/**
 * 3. Hàm lấy Key hệ thống từ Label UI
 */
function getSystemType(uiLabel) {
    // Nếu không tìm thấy trong Map, mặc định trả về ESSAY
    return UI_TYPE_MAP[uiLabel] || QuestionTypeKeys.ESSAY;
}
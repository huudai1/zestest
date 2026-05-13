const Receiver = {
    /**
     * Chuẩn hóa mọi phản hồi từ Server về một định dạng duy nhất.
     */
    processResponse: function(result) {
        console.log("📥 [Receiver]: Đang kiểm tra gói dữ liệu...");

        // 1. Kiểm tra lỗi hệ thống hoặc Server báo ERROR
        if (!result || result.status === "ERROR") {
            const errorMsg = result?.message || "Lỗi hệ thống hoặc mất kết nối";
            this.logError(errorMsg);
            return { 
                success: false, 
                status: "ERROR", 
                message: errorMsg,
                id: null 
            };
        }

        // 2. Trích xuất thông minh:
        // Ưu tiên lấy user_id (khi INIT), nếu không có thì lấy exam_id (khi CREATE_QUIZ)
        const extractedId = result.user_id || result.exam_id || result.id;

        const standardized = {
            success: result.status === "SUCCESS", 
            id: extractedId ? String(extractedId) : "undefined_id", 
            type_user: String(result.type_user || "GUEST"),
            status: String(result.status).toUpperCase(),
            message: result.message || "",
            data: result.data || {} // Chứa các thông tin bổ sung như link, meta...
        };

        console.log(`✅ [Receiver]: Tiếp nhận thành công ID: ${standardized.id} [${standardized.status}]`);
        
        return standardized;
    },

    logError: function(msg) {
        console.error("❌ [Receiver Error]:", msg);
    }
};

window.Receiver = Receiver;
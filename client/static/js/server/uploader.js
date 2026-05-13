/**
 * FILE: uploader.js
 * Chịu trách nhiệm đăng ký đề thi và upload file zip lên server.
 */
const ZestUploader = {
    get API_ENDPOINT() {
        const base = (window.CONFIG && window.CONFIG.BASE_URL) ? window.CONFIG.BASE_URL : "";
        return `${base}/api/exams/upload-package`;
    },

    async sendToServer(blob, examId, examName, configJson = "{}") {
        console.log("📡 [Uploader] Bắt đầu quy trình gửi đề thi lên Server...");

        // --- 1. CƠ CHẾ ĐỢI ĐỊNH DANH ---
        let userId = "";
        let retry = 0;

        // Đợi tối đa 2 giây (20 lần x 100ms) để initIdentity lưu xong ID
        while (retry < 20) {
            userId = ClientInternal.getExistingId();
            // Nếu ID sạch (có giá trị và không phải rác) thì đi tiếp
            if (userId && userId !== "new_user" && userId !== "undefined") break;

            await new Promise(r => setTimeout(r, 100));
            retry++;
        }

        if (!userId) {
            console.error("❌ [Uploader] Không tìm thấy User ID sau khi đợi.");
            alert("Hệ thống chưa nhận diện được bạn. Vui lòng F5 trang web!");
            return null;
        }

        // --- 2. BƯỚC ĐĂNG KÝ (CREATE_QUIZ) QUA SendRQ ---
        try {
            console.log(`📁 [Uploader] Đang yêu cầu Server đặt chỗ cho Exam: ${examId}`);
            const initRaw = await window.SendRQ(userId, USER_ACTIONS.CREATE_QUIZ, {
                exam_id: examId,
                exam_name: examName
            });

            const initResponse = Receiver.processResponse(initRaw);

            if (!initResponse.success) {
                console.error("❌ [Uploader] Server từ chối khởi tạo:", initResponse.message);
                if (initResponse.message.includes('đầy slot') && typeof ModalUI !== 'undefined') {
                    ModalUI.renderSorryQuotaModal(initResponse.message);
                } else {
                    alert(`Lỗi: ${initResponse.message}`);
                }
                throw new Error("Khởi tạo thất bại: " + initResponse.message);
            }

            console.log("✅ [Uploader] Server đã đặt chỗ thành công thông qua SendRQ.");
        } catch (err) {
            console.error("💥 [Uploader] Lỗi hệ thống khi gọi SendRQ:", err);
            throw err;
        }

        // --- 3. BƯỚC UPLOAD FILE ---
        const formData = new FormData();
        formData.append('exam_package', blob, `${examName}.zip`);
        formData.append('exam_id', examId);
        formData.append('user_id', userId);
        formData.append('exam_name', examName);
        formData.append('config_json', configJson);
        formData.append('timestamp', Date.now());

        try {
            console.log("🚀 [Uploader] Đang đẩy gói binary .zip lên...");

            const response = await fetch(this.API_ENDPOINT, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                let errorMsg = `Server Error (${response.status})`;
                try {
                    const errData = await response.json();
                    if (errData && errData.message) errorMsg = errData.message;
                } catch (e) {
                    try { const txt = await response.text(); if (txt) errorMsg = txt; } catch (e2) { }
                }
                throw new Error(errorMsg);
            }

            const result = await response.json();

            // --- 4. LƯU LẠI KẾT QUẢ ---
            if (typeof StorageManager !== 'undefined') {
                await StorageManager.saveUploadResult({
                    examId,
                    examName,
                    serverPath: result.path || null,
                    uploadedAt: Date.now(),
                });
            }

            console.log("🎉 [Uploader] Hoàn tất toàn bộ quy trình!");
            return result;

        } catch (error) {
            console.error("❌ [Uploader] Lỗi upload binary:", error.message);
            if (error.message.includes('đầy slot') && typeof ModalUI !== 'undefined') {
                ModalUI.renderSorryQuotaModal(error.message);
            }
            throw error;
        }
    }
};

window.ZestUploader = ZestUploader;
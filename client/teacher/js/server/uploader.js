/**
 * FILE: uploader.js
 * Chịu trách nhiệm đăng ký đề thi và upload file zip lên server.
 */
const ZestUploader = {
    API_ENDPOINT: '/api/exams/upload-package',

    async sendToServer(blob, examId, examName) {
        console.log("📡 [Uploader] Bắt đầu quy trình gửi đề thi lên Server...");

        // --- 1. LẤY ĐỊNH DANH NGƯỜI DÙNG ---
        const userId = ClientInternal.getExistingId(); 

        if (!userId) {
            console.error("❌ [Uploader] Không tìm thấy User ID.");
            alert("Phiên làm việc đã hết hạn. Vui lòng F5 trang web!");
            return null;
        }

        // --- 2. BƯỚC ĐĂNG KÝ (CREATE_QUIZ) QUA SendRQ ---
        // Phải gọi bước này để Server check Quota và tạo folder packages/<examId>
        try {
            console.log(`📁 [Uploader] Đang yêu cầu Server đặt chỗ cho Exam: ${examId}`);
            
            // Dùng SendRQ theo chuẩn của ông: (userId, action, extraData)
            // Lưu ý: examId được đưa vào extraData (payload trên server)
            const initRaw = await window.SendRQ(userId, GUEST_ACTIONS.CREATE_QUIZ, {
                exam_id: examId,
                exam_name: examName
            });

            // Sử dụng bộ xử lý Receiver của ông để bóc tách response
            const initResponse = Receiver.processResponse(initRaw);
            
            if (!initResponse.success) {
                console.error("❌ [Uploader] Server từ chối khởi tạo:", initResponse.message);
                alert(`Lỗi: ${initResponse.message}`);
                throw new Error("Khởi tạo thất bại: " + initResponse.message);
            }
            
            console.log("✅ [Uploader] Server đã đặt chỗ thành công thông qua SendRQ.");
        } catch (err) {
            console.error("💥 [Uploader] Lỗi hệ thống khi gọi SendRQ:", err);
            throw err;
        }

        // --- 3. BƯỚC UPLOAD FILE (Giữ nguyên fetch vì đây là gửi FormData/Binary) ---
        // Lưu ý: SendRQ của ông gửi JSON, nên việc gửi FILE (.zip) vẫn phải dùng fetch + FormData
        const formData = new FormData();
        formData.append('exam_package', blob, `${examName}.zip`);
        formData.append('exam_id',   examId);
        formData.append('user_id',   userId); 
        formData.append('exam_name', examName);
        formData.append('timestamp', Date.now());

        try {
            console.log("🚀 [Uploader] Đang đẩy gói binary .zip lên...");
            
            const response = await fetch(this.API_ENDPOINT, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                if (response.status === 400) {
                    console.warn("⚠️ Folder không tồn tại hoặc ID lệch. Server trả về 400.");
                }
                throw new Error(`Server Error (${response.status}): ${errorText}`);
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
            throw error;
        }
    }
};
/**
 * FILE: step3_handler.js
 * Cải tiến: Tự động bỏ qua chờ Audio nếu không cần thiết, đồng bộ DB trước khi Pack.
 */

const Step3_Handler = {
    _isAudioReady: false,

    init() {
        this._isAudioReady = false;
        // Lắng nghe sự kiện audio đã được xử lý xong từ Worker/Converter
        window.addEventListener('zestest:audio-ready', () => {
            console.log("🔔 [Step3] Nhận tín hiệu Audio Ready");
            this._isAudioReady = true;
        }, { once: true });
    },
    
    async finishTest() {
        console.log("--- [START FINALIZING & PACKAGING] ---");

        // 1. ĐỒNG BỘ DỮ LIỆU LẦN CUỐI
        // Load lại meta mới nhất từ DB để đảm bảo không bị mất câu hỏi vừa nhập
        const data = await StorageManager.loadMeta(); 
        const total = parseInt(data.totalQuestions);

        if (isNaN(total) || total <= 0) {
            alert("Lỗi: Tổng số câu hỏi không hợp lệ!");
            return false;
        }

        // 2. KIỂM TRA ĐÁP ÁN TRỐNG
        let missingQuestions = [];
        for (let i = 1; i <= total; i++) {
            const ans = data.finalAnswers[i];
            if (ans === null || ans === undefined || (typeof ans === 'string' && ans.trim() === "")) {
                missingQuestions.push(i);
            }
        }

        if (missingQuestions.length > 0) {
            if (!confirm(`Bạn còn ${missingQuestions.length} câu chưa nhập đáp án. Vẫn tiếp tục đóng gói chứ?`)) return false;
        }

        // 3. KHỞI TẠO QUY TRÌNH XỬ LÝ (UI/UX)
        const overlay = document.getElementById('processing-overlay');
        const statusText = document.getElementById('process-status');

        try {
            // Cập nhật trạng thái đề thi
            data.status = "completed"; 
            data.lastModified = Date.now();
            await StorageManager.saveMeta(); 

            // Hiện giao diện Matrix/Processing
            if (overlay) overlay.style.display = 'flex';
            if (statusText) statusText.textContent = "ĐANG KHỞI TẠO...";
            
            // Chạy hiệu ứng Log Terminal
            const logPromise = TerminalMagic.start('log-container');

            // 4. ĐỢI AUDIO VÀ HIỆU ỨNG (Parallel)
            // Không còn bị kẹt 30s nếu không có Audio
            await Promise.all([
                logPromise,
                this.waitForAudio()
            ]);

            // 5. ĐÓNG GÓI VÀ TẢI LÊN
            if (statusText) statusText.textContent = "ĐANG ĐÓNG GÓI & TẢI LÊN...";
            
            // build() giờ đây sẽ chạy cực nhanh vì ta đã đồng bộ meta phía trên
            const uploadResult = await ZestPackager.build();

            if (uploadResult && uploadResult.status === "SUCCESS") {
                if (statusText) statusText.textContent = "HOÀN TẤT!";
                await new Promise(r => setTimeout(r, 800));

                // 6. CHUYỂN TRANG (SPA)
                this.clearBuildProcess();
                
                if (overlay) overlay.style.display = 'none';

                // Lưu flag để Dashboard biết cần hiện Modal chúc mừng
                localStorage.setItem('zestest_last_status', 'success');

                if (typeof showPage === 'function') {
                    showPage('dashboard-page');
                } else {
                    window.location.href = '/?status=success';
                }
            } else {
                throw new Error(uploadResult?.message || "Upload thất bại");
            }

        } catch (error){
            console.error("💥 Lỗi hoàn tất:", error);
            alert("Quá trình xử lý thất bại: " + error.message);
            if (overlay) overlay.style.display = 'none';
            return false;
        }
    },

    /**
     * Logic chờ Audio thông minh: 
     * Nếu đề không có phần nghe, trả về true ngay lập tức.
     */
    async waitForAudio() {
        const data = StorageManager.examData;
        // Kiểm tra xem trong các section có cái nào là loại audio không
        const hasAudioRequired = Object.values(data.sections || {}).some(sec => sec.type === 'audio' || sec.audio);

        if (!hasAudioRequired || this._isAudioReady) {
            console.log("✅ [Step3] Bỏ qua chờ Audio (Không yêu cầu hoặc đã xong).");
            return true;
        }

        console.log("⏳ [Step3] Đang đợi tín hiệu Audio Ready...");
        return new Promise(resolve => {
            const handler = () => { 
                clearTimeout(timer); 
                console.log("🎵 [Step3] Audio đã khớp, tiếp tục...");
                resolve(true); 
            };

            window.addEventListener('zestest:audio-ready', handler, { once: true });

            // Timeout phòng vệ: Không để người dùng đợi quá lâu nếu có lỗi Converter
            const timer = setTimeout(() => {
                window.removeEventListener('zestest:audio-ready', handler);
                console.warn("⚠️ [Step3] Audio timeout - Đóng gói không có tiếng.");
                resolve(true);
            }, 15000); // Giảm xuống 15s cho đỡ sốt ruột
        });
    },

    clearBuildProcess() {
        if (typeof SessionManager !== 'undefined') {
            SessionManager.clearSession();
            SessionManager.clearModalDraft();
        }
    }
};

// Global access cho các nút bấm từ HTML
window.finishTest = () => Step3_Handler.finishTest();
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

            try {
                const uploadResult = await ZestPackager.build();

                if (uploadResult && uploadResult.status === "SUCCESS") {
                    if (statusText) statusText.textContent = "HOÀN TẤT!";
                    await new Promise(r => setTimeout(r, 800));

                    // 6. CHUYỂN TRANG (SPA)
                    if (overlay) overlay.style.display = 'none';

                    localStorage.setItem('zestest_last_status', 'success');
                    if (typeof showPage === 'function') {
                        showPage('dashboard-page');
                    } else {
                        window.location.href = '/?status=success';
                    }
                } else {
                    throw new Error(uploadResult?.message || "Lỗi server");
                }
            } catch (uploadError) {
                console.error("🚀 Upload thất bại:", uploadError);
                if (statusText) statusText.textContent = "LỖI KẾT NỐI!";

                const retry = confirm("Không thể tải lên Server (có thể do mất mạng). \n\nBạn có muốn TẢI FILE .zestest VỀ MÁY để gửi thủ công không?");
                if (retry) {
                    // Gọi hàm export ZIP thủ công từ Packager
                    if (window.ZestPackager && typeof window.ZestPackager.downloadLocal === 'function') {
                        await window.ZestPackager.downloadLocal();
                        if (overlay) overlay.style.display = 'none';
                        return true;
                    }
                }
                if (overlay) overlay.style.display = 'none';
            }

        } catch (error) {
            console.error("💥 Lỗi hệ thống:", error);
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
        const hasAudioRequired = Object.values(data.sections || {}).some(sec => sec.type === 'audio' || sec.audio);
        const statusText = document.getElementById('process-status');

        if (!hasAudioRequired) return true;

        // Nếu đã xong từ trước
        if (window.AudioProcessor && !window.AudioProcessor.isProcessing && this._isAudioReady) {
            return true;
        }

        console.log("⏳ [Step3] Đang đợi Audio xử lý xong dưới nền...");
        if (statusText) statusText.innerHTML = `⏳ Đang đợi tối ưu âm thanh...<br><small style="font-size: 11px; color: #94a3b8;">(Vui lòng không đóng trang)</small>`;

        return new Promise(resolve => {
            const checkInterval = setInterval(() => {
                if (window.AudioProcessor && !window.AudioProcessor.isProcessing) {
                    clearInterval(checkInterval);
                    console.log("🎵 [Step3] Audio đã xong!");
                    resolve(true);
                }
            }, 500);

            // Timeout phòng vệ 60s (Audio có thể nặng)
            setTimeout(() => {
                clearInterval(checkInterval);
                resolve(true);
            }, 60000);
        });
    },

    async clearBuildProcess() {
        if (typeof StorageManager !== 'undefined') {
            await StorageManager.clearAll();
            StorageManager.createNewExamData();
        }
        if (typeof SessionManager !== 'undefined') {
            SessionManager.clearAll();
        }
        if (typeof Step1Handler !== 'undefined') {
            Step1Handler.clearAll();
        }
    }
};

// Global access cho các nút bấm từ HTML
window.finishTest = () => Step3_Handler.finishTest();
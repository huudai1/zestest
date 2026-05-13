/**
 * FILE: step1_handler.js
 * Nhiệm vụ: Xử lý dữ liệu đầu vào (File & Meta), quản lý Cache vân tay (Fingerprint).
 */
const Step1Handler = {
    // --- 1. QUẢN LÝ FILE ---
    selectedFile: null,
    tempFileInfo: null,

    clearAll() {
        this.selectedFile = null;
        this.tempFileInfo = null;
        const inputs = document.querySelectorAll('#step1 .input-line');
        inputs.forEach(input => input.value = "");
        const uploadZone = document.querySelector('.upload-zone');
        if (uploadZone) {
            uploadZone.innerHTML = `<span>Nhấn để chọn file đề thi (PDF, DOCX, Ảnh)</span>`;
        }
    },

    /**
     * Hàm chọn file - Chỉ xử lý chọn file và lưu vân tay tạm thời
     */
    selectFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = ".pdf,.docx,.jpg,.jpeg,.png,.webp";
        input.onchange = (e) => {
            if (e.target.files.length > 0) {
                const file = e.target.files[0];
                this.selectedFile = file;

                // Lưu vân tay (fingerprint) để so sánh cache
                this.tempFileInfo = {
                    name: file.name,
                    size: file.size,
                    lastModified: file.lastModified
                };

                const zone = document.querySelector('.upload-zone');
                if (zone) {
                    zone.innerHTML = `
                        <div style="color: #2ecc71; font-weight: bold;">
                            ✅ ${file.name}
                            <br><span style="font-size: 11px; color: #888;">Nhấn để chọn lại</span>
                        </div>`;
                }
            }
        };
        input.click();
    },

    /**
     * Hàm Validation và Kích hoạt xử lý
     */
    async validateAndProcess() {
        console.log("🚀 [Step1] Bắt đầu Validate & Process...");
        const inputs = document.querySelectorAll('#step1 .input-line');
        const name = inputs[0]?.value?.trim() || "";
        const total = parseInt(inputs[1]?.value || "0");
        const duration = parseInt(inputs[2]?.value || "0");

        const userId = ClientInternal.getExistingId();
        const isGuest = userId.startsWith('gst_');

        // 1. Chặn số câu hỏi cho GUEST
        // NÂNG HẠN MỨC TẠM THỜI CHO MIE
        if (isGuest && total > 200) {
            this.showLimitModal("Số lượng câu hỏi", "100", "Hãy đăng ký để nâng hạn mức lên 300 câu!");
            return false;
        }

        // Validation cơ bản
        if (!this.selectedFile) { alert("Vui lòng chọn file đề thi!"); return false; }
        if (!name) { alert("Vui lòng nhập tên bộ đề!"); return false; }
        if (isNaN(total) || total <= 0) { alert("Số lượng câu hỏi không hợp lệ!"); return false; }
        if (isNaN(duration) || duration <= 0) { alert("Thời gian làm bài không hợp lệ!"); return false; }

        // 2. Chặn số trang PDF cho GUEST (Check qua InputClassifier nếu có thể hoặc chặn sau khi process)
        // Lưu ý: Logic check số trang thực tế sẽ nằm trong handleProcess sau khi parse xong.

        return await this.handleProcess(name, total, duration);
    },

    showLimitModal(feature, limit, message) {
        if (typeof ModalUI !== 'undefined' && ModalUI.renderSorryQuotaModal) {
            const content = `Hạn mức ${feature} cho Guest là <b>${limit}</b>. <br>${message}`;
            ModalUI.renderSorryQuotaModal(content);
        } else {
            alert(`Giới hạn: ${feature} (${limit}). ${message}`);
        }
    },

    /**
     * Logic xử lý chính: So khớp Cache -> Nén WebP -> Lưu trữ
     */
    async handleProcess(name, total, duration) {
        const overlay = document.getElementById('processing-overlay');
        if (overlay) overlay.style.display = "flex";

        // Khởi chạy log Terminal ngay lập tức
        if (typeof TerminalMagic !== 'undefined') {
            TerminalMagic.start('log-container', 'webp');
        }

        try {
            // 1. KIỂM TRA CACHE
            const oldMeta = await StorageManager.loadMeta();
            const isSameFile = oldMeta &&
                oldMeta.sourceFile &&
                oldMeta.sourceFile.name === this.tempFileInfo.name &&
                oldMeta.sourceFile.size === this.tempFileInfo.size &&
                oldMeta.sourceFile.lastModified === this.tempFileInfo.lastModified;

            const oldImages = await StorageManager.getWebP();
            let processedImages = [];

            if (isSameFile && oldImages && oldImages.length > 0) {
                console.log("⚡ [Cache Hit]");
                processedImages = oldImages;
            } else {
                console.log("🛠️ [Engine Start]");
                if (typeof InputClassifier !== 'undefined') {
                    // KIỂM TRA AN TOÀN: Tránh lỗi selectedFile null
                    if (!this.selectedFile) {
                        alert("Lỗi: Không tìm thấy file nguồn. Vui lòng chọn lại file!");
                        return;
                    }
                    processedImages = await InputClassifier.classifyAndProcess(this.selectedFile);
                } else {
                    processedImages = [this.selectedFile];
                }
                StorageManager.examData.sections = {};
            }

            // 2. CẬP NHẬT METADATA
            StorageManager.examData.name = name;
            StorageManager.examData.totalQuestions = total;
            StorageManager.examData.duration = duration;
            StorageManager.examData.sourceFile = this.tempFileInfo;

            // 3. LƯU XUỐNG DISK
            await StorageManager.saveWebP(processedImages);
            await StorageManager.saveMeta();

            // Đợi thêm một chút để user kịp đọc log cuối (tăng trải nghiệm)
            await new Promise(r => setTimeout(r, 800));
            return true;

        } catch (err) {
            console.error(err);
            if (err.isLimitError) {
                this.showLimitModal(err.feature, err.limit, err.messageDetail);
            } else {
                alert("Lỗi khi xử lý file: " + err.message);
            }
            return false;
        } finally {
            if (overlay) overlay.style.display = "none";
        }
    }
};

// Khởi tạo sự kiện chọn file (nút Next đã được Navigation quản lý)
document.addEventListener("DOMContentLoaded", () => {
    const uploadZone = document.querySelector('.upload-zone');
    if (uploadZone) {
        uploadZone.onclick = () => Step1Handler.selectFile();
    }
});
/**
 * FILE: input_classifier.js
 * Nhiệm vụ: Phân loại và ép mọi đầu vào về mảng ảnh WebP
 */

const InputClassifier = {
    // 1. Danh sách định dạng hỗ trợ
    TYPES: {
        PDF: 'application/pdf',
        DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        IMAGE: ['image/jpeg', 'image/png', 'image/webp', 'image/bmp']
    },

    // 2. Hàm xử lý chính
    async classifyAndProcess(file) {
        if (!file) throw new Error("Bạn đang chưa chọn file nào!");

        console.log(`[Classifier] Bắt đầu xử lý: ${file.name} | Type: ${file.type}`);

        const fileName = file.name.toLowerCase();
        const mimeType = file.type;

        // --- NHÁNH 1: PDF ---
        if (mimeType === this.TYPES.PDF || fileName.endsWith('.pdf')) {
            console.log("-> Hướng: PDF rã trang sang WebP");
            if (typeof processPdfToWebp !== 'function') throw new Error("Thiếu file pdf_processor.js");
            return await processPdfToWebp(file); 
        }

        // --- NHÁNH 2: DOCX ---
        if (mimeType === this.TYPES.DOCX || fileName.endsWith('.docx')) {
            console.log("-> Hướng: Docx render HTML rồi chụp WebP");
            if (typeof processDocxToWebp !== 'function') throw new Error("Thiếu file docx_processor.js");
            return await processDocxToWebp(file);
        }

        // --- NHÁNH 3: IMAGE ---
        const isImage = this.TYPES.IMAGE.includes(mimeType) || 
                        ['.jpg', '.jpeg', '.png', '.webp', '.bmp'].some(ext => fileName.endsWith(ext));

        if (isImage) {
            console.log("-> Hướng: Ảnh đơn sang WebP nén");
            if (typeof processImageToWebp !== 'function') throw new Error("Thiếu file image_processor.js");
            return await processImageToWebp(file);
        }

        throw new Error(`Định dạng file "${file.name}" chưa được hỗ trợ ạ! (Hỗ trợ: PDF, DOCX, JPG, PNG)`);
    }
};
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

        console.log(`[Classifier] Bắt đầu xử lý: ${file.name}`);

        // --- NHÁNH 1: PDF TO WEBP ---
        if (file.type === this.TYPES.PDF) {
            console.log("-> Hướng: PDF rã trang sang WebP");
            if (typeof processPdfToWebp !== 'function') throw new Error("Thiếu file pdf_processor.js");
            return await processPdfToWebp(file); 
        }

        // --- NHÁNH 2: DOCX TO WEBP ---
        if (file.type === this.TYPES.DOCX) {
            console.log("-> Hướng: Docx render HTML rồi chụp WebP");
            if (typeof processDocxToWebp !== 'function') throw new Error("Thiếu file docx_processor.js");
            // File Word sau khi xử lý cũng trả về mảng [Blob]
            return await processDocxToWebp(file);
        }

        // --- NHÁNH 3: IMAGE TO WEBP ---
        if (this.TYPES.IMAGE.includes(file.type)) {
            console.log("-> Hướng: Ảnh đơn sang WebP nén");
            if (typeof processImageToWebp !== 'function') throw new Error("Thiếu file image_processor.js");
            // Ảnh đơn cũng trả về mảng 1 phần tử [Blob] để đồng bộ
            return await processImageToWebp(file);
        }

        throw new Error("Định dạng này chưa được hỗ trợ ạ!");
    }
};
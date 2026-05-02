/**
 * FILE: pdf_processor.js
 * Nhiệm vụ: Chuyển đổi PDF sang mảng WebP Blobs
 * Tối ưu: Chống Warning Canvas2D, Re-use Canvas, Memory Management
 */

// --- 1. MONKEYPATCH: CHIÊU CHẶN ĐẦU HỆ THỐNG ---
// Ép tất cả Canvas (kể cả của thư viện PDF.js) dùng willReadFrequently
(function() {
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type, attributes) {
        if (type === '2d') {
            attributes = attributes || {};
            attributes.willReadFrequently = true;
        }
        return originalGetContext.call(this, type, attributes);
    };
})();

const PdfProcessor = {
    /**
     * Hàm chính xử lý file PDF
     */
    async process(file) {
        console.log("--- [PDF Engine] Bắt đầu xử lý file... ---");
        
        // Cấu hình Worker (Dùng bản ổn định)
        if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }

        try {
            const arrayBuffer = await file.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument({ 
                data: arrayBuffer,
                disableRange: true, // Tối ưu cho file local
                disableStream: true 
            });
            
            const pdf = await loadingTask.promise;
            const numPages = pdf.numPages;
            const webpBlobs = [];

            // --- 2. TỐI ƯU BỘ NHỚ: DÙNG DUY NHẤT 1 CANVAS ---
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d'); // Đã được auto-fix attribute ở trên

            for (let i = 1; i <= numPages; i++) {
                const page = await pdf.getPage(i);
                
                // Scale 1.5 là "điểm vàng": Đủ nét để đọc chữ, đủ nhẹ để không tràn RAM
                const viewport = page.getViewport({ scale: 1.0 });

                canvas.height = viewport.height;
                canvas.width = viewport.width;

                // Vẽ trang lên Canvas
                await page.render({ 
                    canvasContext: context, 
                    viewport: viewport 
                }).promise;

                // Chuyển sang WebP với chất lượng 0.5 (Dung lượng siêu nhỏ cho Zestest)
                const blob = await new Promise(resolve => 
                    canvas.toBlob(resolve, 'image/webp', 0.5)
                );
                
                webpBlobs.push(blob);

                // Dọn dẹp page cũ và context cũ để tránh rác RAM
                page.cleanup(); 
                context.clearRect(0, 0, canvas.width, canvas.height);
                
                if (i % 10 === 0 || i === numPages) {
                    console.log(`[PDF Engine] Progress: ${i}/${numPages} trang...`);
                }
            }

            // Giải phóng Canvas sau khi xong
            canvas.width = 0;
            canvas.height = 0;
            
            console.log(`✅ [PDF Engine] Xử lý xong ${numPages} trang.`);
            return webpBlobs;

        } catch (error) {
            console.error("❌ [PDF Engine] Lỗi:", error);
            throw error;
        }
    }
};

// Xuất ra window để InputClassifier gọi
window.processPdfToWebp = (file) => PdfProcessor.process(file);
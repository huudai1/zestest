async function processImageToWebp(file) {
    try {
        // Dùng ImageBitmap giúp giải nén ảnh ở luồng nền, mượt hơn
        const bitmap = await createImageBitmap(file);
        const canvas = document.createElement('canvas');
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(bitmap, 0, 0);

        const blob = await new Promise(resolve => 
            canvas.toBlob(resolve, 'image/webp', 0.8)
        );

        // Giải phóng bộ nhớ
        bitmap.close();
        canvas.width = 0; canvas.height = 0;

        return [blob]; // Trả về mảng 1 phần tử
    } catch (err) {
        console.error("Lỗi xử lý ảnh:", err);
        throw err;
    }
}
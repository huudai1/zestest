const ZestPackager = {
    async build() {
        console.time("⏱️ Tổng thời gian đóng gói");

        // 1. Lấy dữ liệu song song
        const [meta, audioBlob, webpImages] = await Promise.all([
            StorageManager.loadMeta(),
            StorageManager.getAudio(),
            StorageManager.getWebP()
        ]);

        const examId = meta.id;
        if (!examId) throw new Error("Không tìm thấy ID đề thi!");

        const zip = new JSZip();

        // 2. Lọc bỏ rác trước khi Stringify
        // Tạo một bản sao meta sạch, không chứa dữ liệu nhị phân rác
        const cleanMeta = JSON.parse(JSON.stringify(meta));
        
        // CẢNH BÁO: Nếu meta vẫn nặng, lỗi nằm ở khâu lưu trữ dữ liệu vào sections
        zip.file("manifest.json", JSON.stringify(cleanMeta, null, 2));

        // 3. Audio
        if (audioBlob instanceof Blob) {
            zip.file("audio_track.mp3", audioBlob);
        }

        // 4. Images (Sử dụng Blob/File trực tiếp)
        if (Array.isArray(webpImages)) {
            const imgFolder = zip.folder("images");
            for (const img of webpImages) {
                // Ưu tiên dùng Blob để JSZip không phải xử lý chuỗi
                const imageData = img.blob || img.data || img;
                imgFolder.file(img.name, imageData);
            }
        }

        console.log("⚡ Đang tạo Blob ZIP (STORE mode)...");
        
        const zipBlob = await zip.generateAsync({
            type: "blob",
            compression: "STORE" // Tuyệt đối không dùng DEFLATE nếu muốn nhanh
        });

        console.timeEnd("⏱️ Tổng thời gian đóng gói");
        console.log(`📦 Kích thước file: ${(zipBlob.size / 1024 / 1024).toFixed(2)} MB`);

        const packageName = `${(meta.name || "exam").replace(/\s+/g, '_')}_${examId}`;
        return await ZestUploader.sendToServer(zipBlob, examId, packageName);
    }
};
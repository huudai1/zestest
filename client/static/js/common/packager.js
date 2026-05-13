const ZestPackager = {
    async build() {
        console.time("⏱️ Tổng thời gian đóng gói");

        // 1. Lấy dữ liệu song song
        const [meta, audioBlob, webpImages] = await Promise.all([
            StorageManager.loadMeta(),
            StorageManager.getAudio(),
            StorageManager.getWebP()
        ]);

        // LẤY ID TỪ SESSION THAY VÌ META
        const examId = window.SessionManager ? SessionManager.getExamId() : ("Zest_" + Date.now());
        if (!examId) throw new Error("Không tìm thấy ID phiên làm việc!");

        const zip = new JSZip();
        
        // 2. Lọc bỏ rác trước khi Stringify
        const cleanMeta = JSON.parse(JSON.stringify(meta));
        // Đảm bảo không có ID bên trong file manifest
        delete cleanMeta.id; 
        
        zip.file("manifest.json", JSON.stringify(cleanMeta, null, 2));

        // ... (phần cũ) ...
        if (audioBlob instanceof Blob) {
            zip.file("audio_track.mp3", audioBlob);
        }

        if (Array.isArray(webpImages)) {
            const imgFolder = zip.folder("images");
            webpImages.forEach((img, index) => {
                const imageData = img.blob || img.data || img;
                const imgName = img.name || `${index + 1}.webp`;
                imgFolder.file(imgName, imageData);
            });
        }

        const zipBlob = await zip.generateAsync({ type: "blob", compression: "STORE" });
        const cleanName = (meta.name || "De_Thi").replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\u00C0-\u1EF9]/g, '');
        const combinedId = `${examId}__${cleanName}`;

        return await ZestUploader.sendToServer(zipBlob, combinedId, meta.name || "Untitled", JSON.stringify(cleanMeta));
    },

    /**
     * TẢI FILE THỦ CÔNG (OFFLINE FALLBACK)
     */
    async downloadLocal() {
        const [meta, audioBlob, webpImages] = await Promise.all([
            StorageManager.loadMeta(),
            StorageManager.getAudio(),
            StorageManager.getWebP()
        ]);

        const zip = new JSZip();
        // Không lưu ID vào manifest khi tải về
        const cleanMeta = JSON.parse(JSON.stringify(meta));
        delete cleanMeta.id;
        
        zip.file("manifest.json", JSON.stringify(cleanMeta, null, 2));
        if (audioBlob) zip.file("audio_track.mp3", audioBlob);
        
        if (Array.isArray(webpImages)) {
            const imgFolder = zip.folder("images");
            webpImages.forEach((img, index) => {
                const imageData = img.blob || img.data || img;
                const imgName = img.name || `${index + 1}.webp`;
                imgFolder.file(imgName, imageData);
            });
        }

        const zipBlob = await zip.generateAsync({ type: "blob", compression: "STORE" });
        
        // TẢI VỀ: Chỉ lấy tên đề thi, không kèm ID
        const cleanName = (meta.name || "De_Thi").replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\u00C0-\u1EF9]/g, '');
        const fileName = `${cleanName}.zestest`;

        const link = document.createElement('a');
        link.href = URL.createObjectURL(zipBlob);
        link.download = fileName;
        link.click();
        
        console.log("💾 Đã tải file về máy:", fileName);
    }
};
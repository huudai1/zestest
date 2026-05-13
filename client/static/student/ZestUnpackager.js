const ZestUnpackager = {
    /**
     * Giải nén gói đề từ Blob/ArrayBuffer
     * @param {Blob|ArrayBuffer} zipData 
     * @returns {Object} { meta, audioUrl, images }
     */
    async unpack(zipData) {
        console.time("⏱️ Thời gian giải nén");
        const zip = new JSZip();
        const contents = await zip.loadAsync(zipData);
        
        let result = {
            meta: null,
            audioUrl: null,
            images: [] // Danh sách URL tạm thời (Blob URL)
        };

        // 1. Giải nén manifest.json hoặc config.json (Hỗ trợ cả đề cũ và mới)
        const manifestFile = contents.file("manifest.json") || contents.file("config.json");
        if (manifestFile) {
            const metaText = await manifestFile.async("string");
            result.meta = JSON.parse(metaText);
        } else {
            throw new Error("Không tìm thấy file cấu hình (manifest.json) trong gói đề!");
        }

        // 2. Giải nén Audio (Nếu có)
        const audioFile = contents.file("audio_track.mp3");
        if (audioFile) {
            result.audioBlob = await audioFile.async("blob");
            result.audioUrl = URL.createObjectURL(result.audioBlob);
        }

        // 3. Giải nén Images (Thư mục images/)
        const imageFolder = contents.folder("images");
        const imageFiles = [];
        
        // Duyệt qua tất cả file trong folder images
        imageFolder.forEach((relativePath, file) => {
            if (!file.dir) {
                imageFiles.push(file);
            }
        });

        // Sắp xếp lại tên ảnh theo thứ tự alpha-beta để hiển thị đúng trang
        imageFiles.sort((a, b) => a.name.localeCompare(b.name, undefined, {numeric: true}));

        // Giải nén ảnh song song để tăng tốc
        result.imageBlobs = [];
        result.images = await Promise.all(imageFiles.map(async (file) => {
            const imgBlob = await file.async("blob");
            result.imageBlobs.push(imgBlob);
            return {
                name: file.name,
                url: URL.createObjectURL(imgBlob)
            };
        }));

        console.timeEnd("⏱️ Thời gian giải nén");
        return result;
    },

    /**
     * Dọn dẹp bộ nhớ (Cực kỳ quan trọng để không bị tràn RAM trình duyệt)
     * @param {Object} unpackedData 
     */
    revoke(unpackedData) {
        if (unpackedData.audioUrl) URL.revokeObjectURL(unpackedData.audioUrl);
        unpackedData.images.forEach(img => URL.revokeObjectURL(img.url));
        console.log("♻️ Đã dọn dẹp bộ nhớ Blob URL");
    }
};
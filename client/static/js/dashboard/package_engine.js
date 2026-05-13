window.PackageEngine = {
    async download(data) {
        try {
            const zip = new JSZip();
            
            const audioBlob = await StorageManager.getAudio();
            const webpImages = await StorageManager.getWebP();

            zip.file("config.json", JSON.stringify(data));
            
            if (audioBlob) zip.file("assets/audio_main.mp3", audioBlob);
            
            if (Array.isArray(webpImages)) {
                webpImages.forEach((img, i) => {
                    const blob = img.blob || img;
                    zip.file(`assets/page_${i + 1}.webp`, blob);
                });
            }

            const content = await zip.generateAsync({
                type: "blob", 
                compression: "DEFLATE",
                compressionOptions: { level: 6 }
            });

            // Tối ưu tên file: Chỉ lấy tên đề thi, bỏ qua ID (Zest_...) nếu có
            let examName = "de_thi";
            if (data && data.name) {
                // Nếu tên có dạng ID__Tên (Zest_123__Test) thì chỉ lấy phần "Test"
                const parts = data.name.split('__');
                examName = parts.length > 1 ? parts[1] : data.name;
                examName = examName.trim().replace(/[\\/:*?"<>|]/g, "_");
            }
            
            const fileName = `${examName}.zestest`;

            // Ép kiểu Blob về octet-stream để trình duyệt không tự đổi đuôi sang .zip
            const forcedBlob = new Blob([content], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(forcedBlob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            return true;
        } catch (e) {
            console.error("Lỗi đóng gói:", e);
            alert("Lỗi khi đóng gói file .zestest!");
            return false;
        }
    }
};
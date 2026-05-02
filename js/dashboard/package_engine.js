const PackageEngine = {
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

            // Tên file = tên đề, làm sạch ký tự đặc biệt để tránh lỗi hệ điều hành
            const examName = (data.name || "de_thi").trim().replace(/[\\/:*?"<>|]/g, "_");
            const fileName = `${examName}.zestest`;

            const url = URL.createObjectURL(content);
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
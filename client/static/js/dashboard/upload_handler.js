/**
 * FILE: js/dashboard/upload_handler.js
 * Quản lý logic khôi phục đề thi từ file .zestest
 */
window.UploadHandler = {
    initUploadZone() {
        const zone = document.getElementById('dashboard-upload-zone');
        const input = document.getElementById('hidden-zestest-input');
        if (!zone || !input || zone.getAttribute('data-init')) return;

        zone.setAttribute('data-init', 'true');
        zone.onclick = () => input.click();

        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) this.handleZestestUpload(file);
        };

        zone.ondragover = (e) => {
            e.preventDefault();
            zone.style.borderColor = "var(--color-primary)";
            zone.style.background = "rgba(0, 149, 255, 0.1)";
        };

        zone.ondragleave = () => {
            zone.style.borderColor = "rgba(255,255,255,0.2)";
            zone.style.background = "";
        };

        zone.ondrop = (e) => {
            e.preventDefault();
            zone.style.borderColor = "rgba(255,255,255,0.2)";
            zone.style.background = "";
            const file = e.dataTransfer.files[0];
            if (file) this.handleZestestUpload(file);
        };
    },

    async handleZestestUpload(file) {
        if (!file.name.endsWith('.zestest')) {
            alert("Vui lòng chọn đúng file có đuôi .zestest");
            return;
        }

        const bannerText = document.getElementById('banner-text');
        const originalText = bannerText?.innerText || "";
        if (bannerText) bannerText.innerText = "⏳ Đang phân tích file...";

        try {
            if (bannerText) bannerText.innerText = "🎫 Đang đăng ký ID mới...";
            const userId = ClientInternal.getExistingId();
            const idRaw = await SendRQ(userId, "GEN_EXAM_ID");
            const idRes = Receiver.processResponse(idRaw);

            if (!idRes.success || !idRes.data?.exam_id) {
                throw new Error("Không thể lấy ID đề thi mới từ Server.");
            }

            const newExamId = idRes.data.exam_id;
            const fileName = file.name.replace('.zestest', '');
            const cleanName = fileName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\u00C0-\u1EF9]/g, '');
            const combinedId = `${newExamId}__${cleanName}`;

            if (bannerText) bannerText.innerText = "🚀 Đang khôi phục lên server...";

            const zipBlob = new Blob([file], { type: "application/zip" });

            let configJson = "{}";
            try {
                if (typeof JSZip !== 'undefined') {
                    const zip = new JSZip();
                    const contents = await zip.loadAsync(file);
                    const configFile = contents.file("config.json") || contents.file("manifest.json");
                    if (configFile) configJson = await configFile.async("string");
                }
            } catch (e) { console.warn("Không đọc được config trong file, dùng mặc định."); }

            const result = await ZestUploader.sendToServer(zipBlob, combinedId, fileName, configJson);

            if (result && result.success) {
                if (bannerText) bannerText.innerText = "✅ Khôi phục thành công!";
                setTimeout(() => {
                    if (bannerText) bannerText.innerText = originalText;
                    DashboardManager.refreshQuota();
                    if (window.DashboardRender) window.DashboardRender.render();
                }, 2000);
            } else {
                throw new Error(result.message || "Lỗi khi tải lên server");
            }
        } catch (err) {
            console.error("Lỗi khôi phục:", err);
            if (!err.message.includes('đầy slot')) {
                alert("Lỗi khôi phục: " + err.message);
            }
            if (bannerText) bannerText.innerText = originalText;
        }
    }
};

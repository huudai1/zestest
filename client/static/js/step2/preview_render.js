async function renderPreviewStep2() {
    const previewBox = document.querySelector('.preview-box');
    if (!previewBox) return;

    previewBox.innerHTML = '<div class="loading-text">Đang chuẩn bị bản xem trước...</div>';

    try {
        const images = await StorageManager.getWebP();

        if (!images || images.length === 0) {
            previewBox.innerHTML = '<div class="error-text">Không tìm thấy dữ liệu hình ảnh.</div>';
            return;
        }

        previewBox.innerHTML = ""; 

        images.forEach((fileData) => {
            const img = document.createElement('img');
            const imageUrl = URL.createObjectURL(fileData);

            img.src = imageUrl;
            img.className = "preview-img-item";
            img.loading = "lazy"; 
            
            // ÉP KIỂU TRÀN VIỀN BẰNG STYLE TRỰC TIẾP
            Object.assign(img.style, {
                width: "100%",
                height: "auto",
                display: "block",
                pointerEvents: "none", // Để click xuyên qua ảnh vào preview-box
                margin: "0",
                padding: "0"
            });

            img.onload = () => URL.revokeObjectURL(imageUrl);
            previewBox.appendChild(img);
        });

        // Thiết lập lại sự kiện toggle (chỉ một lần)
        setupPreviewToggle();

        console.log(`[Step 2] Đã render ${images.length} trang tràn viền.`);

    } catch (error) {
        console.error("Lỗi khi render preview:", error);
        previewBox.innerHTML = '<div class="error-text">Lỗi hiển thị file.</div>';
    }
}

function setupPreviewToggle() {
    const previewBox = document.querySelector('.preview-box');
    if (!previewBox || previewBox.dataset.toggleSet === "true") return;

    previewBox.addEventListener('click', function() {
        this.classList.toggle('show-scroll');
        
        if (this.classList.contains('show-scroll')) {
            clearTimeout(this.scrollTimeout);
            this.scrollTimeout = setTimeout(() => {
                this.classList.remove('show-scroll');
            }, 3000); 
        }
    });

    // Đánh dấu để không add event listener nhiều lần khi render lại
    previewBox.dataset.toggleSet = "true";
}
async function processDocxToWebp(file) {
    const tempContainer = document.createElement('div');
    Object.assign(tempContainer.style, {
        width: "210mm",
        padding: "0",
        position: "absolute",
        left: "-9999px",
        background: "white"
    });
    document.body.appendChild(tempContainer);

    try {
        const arrayBuffer = await file.arrayBuffer();

        // Render docx
        await docx.renderAsync(arrayBuffer, tempContainer);

        // 1. XÓA VÙNG XÁM (giữ lại nội dung trắng)
        const wrapper = tempContainer.querySelector('.docx-wrapper');
        if (wrapper) {
            wrapper.style.backgroundColor = 'white';
            wrapper.style.padding = '0';
            wrapper.style.margin = '0';
            wrapper.style.boxShadow = 'none';
        }

        // 2. XỬ LÝ ẢNH (Quan trọng để không bị mất hình)
        const images = Array.from(tempContainer.getElementsByTagName('img'));

        const imagePromises = images.map(async (img) => {
            if (img.src.startsWith('blob:')) {
                try {
                    const response = await fetch(img.src);
                    const blob = await response.blob();

                    const dataUrl = await new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result);
                        reader.readAsDataURL(blob);
                    });

                    // Nếu là định dạng lạ (text/plain), thử ép kiểu về image/png 
                    // vì đôi khi blob của docx-preview bị nhận diện nhầm mime-type
                    let finalSrc = dataUrl;
                    if (dataUrl.startsWith('data:text/plain')) {
                        finalSrc = dataUrl.replace('data:text/plain', 'data:image/png');
                    }

                    // Chờ ảnh load thực sự vào DOM
                    await new Promise((resolve) => {
                        img.onload = resolve;
                        img.onerror = resolve; // Tiếp tục kể cả lỗi để không treo máy
                        img.src = finalSrc;
                    });
                } catch (e) {
                    console.error("Không thể chuyển đổi ảnh:", e);
                }
            }
        });

        await Promise.all(imagePromises);

        // Chờ thêm một chút để render ổn định hoàn toàn
        await new Promise(r => setTimeout(r, 500));

        // 3. CHỤP ẢNH
        const canvas = await html2canvas(tempContainer, {
            scale: 2,
            useCORS: true,
            allowTaint: true, // Cho phép vẽ cả ảnh có thể vi phạm bảo mật nhẹ
            backgroundColor: "#ffffff",
            logging: false
        });

        const webpBlob = await new Promise(resolve =>
            canvas.toBlob(resolve, 'image/webp', 0.9) // Tăng chất lượng lên 0.9
        );

        document.body.removeChild(tempContainer);
        return [webpBlob];

    } catch (error) {
        if (tempContainer.parentNode) document.body.removeChild(tempContainer);
        throw error;
    }
}
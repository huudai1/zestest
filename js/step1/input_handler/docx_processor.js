async function processDocxToWebp(file) {
    const tempContainer = document.createElement('div');
    // Giả lập style để render chuẩn nhất
    Object.assign(tempContainer.style, {
        width: "210mm",
        padding: "0", // Thường docx-preview đã có padding nội bộ
        position: "absolute",
        left: "-9999px",
        background: "white"
    });
    document.body.appendChild(tempContainer);

    try {
        const arrayBuffer = await file.arrayBuffer();
        await docx.renderAsync(arrayBuffer, tempContainer);

        // Chờ một chút để các hình ảnh bên trong docx load kịp
        await new Promise(r => setTimeout(r, 100));

        const canvas = await html2canvas(tempContainer, {
            scale: 2, // Tăng scale lên 2 cho văn bản rõ nét
            useCORS: true,
            backgroundColor: "#ffffff"
        });

        const webpBlob = await new Promise(resolve => 
            canvas.toBlob(resolve, 'image/webp', 0.8)
        );

        document.body.removeChild(tempContainer);
        return [webpBlob]; // Luôn trả về mảng

    } catch (error) {
        if (tempContainer.parentNode) document.body.removeChild(tempContainer);
        throw error;
    }
}
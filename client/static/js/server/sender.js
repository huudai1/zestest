// sender.js
window.sendRequest = async function(requestBody, url) {
    console.log(`📤 [Sender]: Đang chuyển hàng đến ${url}...`);
    try {
        const response = await fetch(url, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify(requestBody),
        });
        if (!response.ok) {
            try {
                const errData = await response.json();
                if (errData && errData.message) return errData;
            } catch (e) {}
            return { status: "SERVER_REJECTED", message: `Lỗi Server: ${response.status}` };
        }
        return await response.json();
    } catch (error) {
        console.error("❌ [Sender Error]:", error);
        return { status: "OFFLINE", message: "Lỗi kết nối vật lý." };
    }
}
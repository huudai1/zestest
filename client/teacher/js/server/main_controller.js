document.addEventListener('DOMContentLoaded', async () => {
    // --- 1. Hàm tự động chạy khi load trang ---
    const initIdentity = async () => {
    let currentId = ClientInternal.getExistingId();
    const isValidId = currentId && currentId !== "null" && currentId !== "undefined";

    if (isValidId) {
        console.log("🔍 Đang xác thực định danh cũ:", currentId);
        try {
            // Gửi lệnh CHECK_TURN hoặc một lệnh VERIFY để check folder trên server
            const raw = await SendRQ(currentId, GUEST_ACTIONS.CHECK_TURN);
            const res = Receiver.processResponse(raw);

            if (res.success) {
                console.log("👋 Chào mừng trở lại:", currentId);
                return; // ID vẫn ngon, không làm gì thêm
            } else {
                console.warn("⚠️ ID cũ không còn hợp lệ trên Server. Đang cấp mới...");
            }
        } catch (err) {
            console.error("❌ Lỗi khi xác thực ID:", err);
            // Nếu lỗi mạng thì tạm thời cho dùng tiếp hoặc dừng lại tùy bạn
        }
    }

    // Nếu không có ID hoặc ID đã chết -> Xin mới
    console.log("🆕 Khởi tạo định danh mới...");
    try {
        const rawResponse = await SendRQ(null, GUEST_ACTIONS.INIT);
        const response = Receiver.processResponse(rawResponse);
        if (response.success) {
            ClientInternal.saveIdentity(response.id);
            console.log("✅ Đã cấp ID mới:", response.id);
        }
    } catch (err) {
        console.error("💥 Lỗi khởi tạo định danh:", err);
    }
};

    initIdentity();

    // --- 2. Logic cho nút bấm ---
    const btn = document.getElementById('CheckIdTurn');
    if (btn) {
        btn.onclick = async () => {
            ClientInternal.setLoading('CheckIdTurn', true, "⏳ Đang kết nối...");
            try {
                const currentId = ClientInternal.getExistingId();
                const action = currentId ? GUEST_ACTIONS.CHECK_TURN : GUEST_ACTIONS.INIT;
                const rawResponse = await SendRQ(currentId || null, action);
                const response = Receiver.processResponse(rawResponse);

                if (response.success) {
                    // SỬA Ở ĐÂY: Dùng response.id
                    ClientInternal.saveIdentity(response.id);
                    alert("Định danh hiện tại: " + response.id);
                } else {
                    alert(response.message);
                }
            } catch (err) {
                alert("Kết nối thất bại.");
            } finally {
                ClientInternal.setLoading('CheckIdTurn', false);
            }
        };
    }
});
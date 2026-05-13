document.addEventListener('DOMContentLoaded', async () => {
    // --- 1. Hàm tự động chạy khi load trang ---
    const initIdentity = async () => {
        // Đợi Firebase Auth xác định trạng thái (đã đăng nhập hay chưa)
        console.log("⏳ Đang đợi Auth xác định trạng thái...");
        
        // Đợi tối đa 2s để window.authReady xuất hiện (tránh treo nếu script auth lỗi)
        let retry = 0;
        while (!window.authReady && retry < 20) {
            await new Promise(r => setTimeout(r, 100));
            retry++;
        }

        if (window.authReady) {
            const user = await window.authReady;
            if (user) {
                console.log("👤 [Main] Đã có User Google (" + user.email + "), bỏ qua khởi tạo Guest.");
                // Cập nhật ID nội bộ sang UID Google nếu cần
                if (window.ClientInternal) window.ClientInternal.saveIdentity(user.uid);
                return; 
            }
        }

        let currentId = ClientInternal.getExistingId();
        const isValidId = currentId && currentId !== "null" && currentId !== "undefined";

        if (isValidId) {
            // KIỂM TRA SESSION CACHE: Nếu trong tab này đã check rồi thì bỏ qua
            if (sessionStorage.getItem('zest_id_verified') === currentId) {
                console.log("🚀 [Main] ID đã được xác thực trong phiên này, bỏ qua CHECK_TURN.");
                return;
            }

            console.log("🔍 Đang xác thực định danh cũ:", currentId);
            try {
                const raw = await SendRQ(currentId, USER_ACTIONS.CHECK_TURN);
                const res = Receiver.processResponse(raw);

                if (res.success) {
                    console.log("👋 Chào mừng trở lại:", res.id);
                    ClientInternal.saveIdentity(res.id); 
                    // Lưu vào session để không check lại ở trang sau
                    sessionStorage.setItem('zest_id_verified', res.id);
                    return; 
                } else {
                    console.warn("⚠️ ID cũ không hợp lệ hoặc hết hạn. Đang cấp mới...");
                }
            } catch (err) {
                console.error("❌ Lỗi khi xác thực ID:", err);
            }
        }

        console.log("🆕 Khởi tạo định danh mới từ Server...");
        try {
            const rawResponse = await SendRQ(null, USER_ACTIONS.INIT);
            const response = Receiver.processResponse(rawResponse);
            
            // SỬA TẠI ĐÂY: Dùng response.id thay vì response.user_id
            if (response.success && response.id && response.id !== "undefined_id") {
                ClientInternal.saveIdentity(response.id);
                sessionStorage.setItem('zest_id_verified', response.id);
                console.log("✅ Đã nhận ID mới từ Server:", response.id);
            }
        } catch (err) {
            console.error("💥 Lỗi khởi tạo định danh:", err);
        }
    };


    // Chạy khởi tạo
    initIdentity();

    // --- 2. Logic cho nút bấm ---
    const btn = document.getElementById('CheckIdTurn');
    if (btn) {
        btn.onclick = async () => {
            ClientInternal.setLoading('CheckIdTurn', true, "⏳ Đang kiểm tra...");
            try {
                const currentId = ClientInternal.getExistingId();
                // Nếu chưa có ID thì INIT, có rồi thì CHECK_TURN
                const action = currentId ? USER_ACTIONS.CHECK_TURN : USER_ACTIONS.INIT;
                
                const rawResponse = await SendRQ(currentId || null, action);
                const response = Receiver.processResponse(rawResponse);

                if (response.success) {
                    // SỬA TẠI ĐÂY: Dùng response.id
                    ClientInternal.saveIdentity(response.id);
                    alert("Định danh của bạn: " + response.id);
                } else {
                    alert("Thông báo: " + (response.message || "Không xác định"));
                }
            } catch (err) {
                alert("Lỗi: Không thể kết nối tới máy chủ.");
            } finally {
                ClientInternal.setLoading('CheckIdTurn', false);
            }
        };
    }
});
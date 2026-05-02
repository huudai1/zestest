/**
 * CLIENT INTERNAL ACTIONS
 * Tổng hợp các thao tác xử lý LocalStorage, Cookie và Giao diện tại máy khách.
 */
const ClientInternal = {

    // --- 1. QUẢN LÝ ĐỊNH DANH (ID) ---

    /**
     * Lấy ID hiện có từ Cookie hoặc LocalStorage (Ưu tiên Cookie)
     */
    getExistingId: function () {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; user_id=`);
        let id = "";

        if (parts.length === 2) {
            id = parts.pop().split(';').shift();
        } else {
            id = localStorage.getItem('user_id');
        }

        // CỰC KỲ QUAN TRỌNG: Loại bỏ chuỗi "undefined" hoặc "null" do lưu nhầm
        if (id === "undefined" || id === "null" || !id) {
            return "";
        }
        return id;
    },

    /**
     * Lưu ID vào cả LocalStorage và Cookie (hạn 24h)
     */
    saveIdentity: function (id) {
        if (!id) return;
        // Lưu LocalStorage kèm timestamp để check expired nếu cần
        localStorage.setItem('user_id', String(id));
        localStorage.setItem('user_id_timestamp', Date.now().toString());

        // Lưu Cookie (hạn 24h = 86400s)
        document.cookie = `user_id=${id}; path=/; max-age=86400; SameSite=Lax`;
    },

    /**
     * Xóa sạch định danh
     */
    clearIdentity: function () {
        localStorage.removeItem('user_id');
        localStorage.removeItem('user_id_timestamp');
        document.cookie = "user_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    },

    // --- 2. QUẢN LÝ TRẠNG THÁI GIAO DIỆN (UI) ---

    /**
     * Điều khiển trạng thái Loading của nút bấm
     */
    setLoading: (btnId, isLoading, text = "⏳ Processing...") => {
        const btn = document.getElementById(btnId);
        if (!btn) return;

        if (isLoading) {
            // Lưu lại text cũ để khi xong thì khôi phục
            if (!btn.getAttribute('data-original-text')) {
                btn.setAttribute('data-original-text', btn.innerText);
            }
            btn.disabled = true;
            btn.innerText = text;
        } else {
            btn.disabled = false;
            btn.innerText = btn.getAttribute('data-original-text') || "Create";
        }
    },

    // --- 3. KIỂM TRA LOGIC NHANH ---

    /**
     * Check nhanh xem ID ở máy khách đã quá hạn chưa (mặc định 24h)
     */
    isExpiredLocal: (hours = 24) => {
        const time = localStorage.getItem('user_id_timestamp');
        if (!time) return true;
        const elapsed = Date.now() - parseInt(time);
        return elapsed > (hours * 3600 * 1000);
    }
};

window.ClientInternal = ClientInternal;
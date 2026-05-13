const ServerComm = {

    /**
     * Lấy định danh người dùng. 
     * Nếu chưa có hoặc ID cũ không hợp lệ, sẽ tự động xin ID mới từ Server.
     */
    getGuestIdentity: async function() {
        let currentId = ClientInternal.getExistingId();

        // Trường hợp 1: Hoàn toàn chưa có ID trong LocalStorage
        if (!currentId) {
            return await this.requestNewIdentity();
        }

        // Trường hợp 2: Có ID rồi, nhưng nên verify với Server (CHECK_TURN)
        console.log("🆔 [ServerComm]: Kiểm tra ID hiện tại:", currentId);
        const check = await this.checkTurnStatus(currentId);

        if (check.success) {
            return currentId;
        } else {
            console.warn("⚠️ [ServerComm]: ID cũ không hợp lệ. Đang xin cấp mới...");
            return await this.requestNewIdentity();
        }
    },

    /**
     * Hàm phụ trợ để gọi hành động INIT
     */
    requestNewIdentity: async function() {
        console.log("🎫 [ServerComm]: Đang yêu cầu Server cấp ID mới...");
        try {
            const rawResponse = await SendRQ(null, APP_MODULE.ACTIONS.INIT);
            const response    = Receiver.processResponse(rawResponse);

            // SỬA TẠI ĐÂY: Dùng response.id
            if (response.success && response.id && response.id !== "undefined_id") {
                const newId = response.id;
                ClientInternal.saveIdentity(newId);
                console.log("✅ [ServerComm]: Đã cấp và lưu ID mới:", newId);
                return newId;
            } else {
                console.error("❌ [ServerComm]: Server từ chối cấp ID:", response.message);
                return null;
            }
        } catch (err) {
            console.error("💥 [ServerComm]: Lỗi kết nối khi xin ID:", err);
            return null;
        }
    },

    /**
     * Kiểm tra trạng thái lượt dùng/quota của ID
     */
    checkTurnStatus: async function(userId) {
        if (!userId) return { success: false, message: "Thiếu ID để kiểm tra" };
        
        try {
            const rawResponse = await SendRQ(userId, APP_MODULE.ACTIONS.CHECK_TURN);
            return Receiver.processResponse(rawResponse);
        } catch (err) {
            return { success: false, message: "Lỗi kết nối Server" };
        }
    }
};

window.ServerComm = ServerComm;
const ServerComm = {

    getGuestIdentity: async function() {
        let guestId = ClientInternal.getExistingId();

        if (!guestId) {
            console.log("🎫 [ServerComm]: Chưa có ID, đang yêu cầu cấp mới...");
            const rawResponse = await SendRQ(null, GUEST_MODULE.ACTIONS.INIT);
            const response    = Receiver.processResponse(rawResponse);

            if (response.success) {
                guestId = response.user_id; // khớp với ServerResponse schema
                ClientInternal.saveIdentity(guestId);
                console.log("✅ [ServerComm]: Đã cấp và lưu ID mới:", guestId);
            } else {
                console.error("❌ [ServerComm]: Lỗi xin ID:", response.message);
                return null;
            }
        } else {
            console.log("🆔 [ServerComm]: Đã có ID:", guestId);
        }

        return guestId;
    },

    checkTurnStatus: async function(guestId) {
        if (!guestId) return { success: false, message: "Thiếu ID để kiểm tra" };
        const rawResponse = await SendRQ(guestId, GUEST_MODULE.ACTIONS.CHECK_TURN); // sửa .CHECK → .CHECK_TURN
        return Receiver.processResponse(rawResponse);
    }
};

window.ServerComm = ServerComm;
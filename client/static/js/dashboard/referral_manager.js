/**
 * FILE: js/dashboard/referral_manager.js
 * Quản lý logic Gift Key (Referral đã bị gỡ bỏ theo yêu cầu của USER)
 */
window.ReferralManager = {
    async redeemGiftKey() {
        const input = document.getElementById('gift-key-input');
        if (!input) return;
        const key = input.value.trim().toUpperCase();
        if (!key) return alert("Vui lòng nhập mã!");

        const userId = IdentityManager.getUserId();
        const isGuest = !userId || userId.startsWith('gst_');

        if (isGuest) {
            const confirmLogin = confirm("🔑 Bạn cần Đăng nhập để kích hoạt mã quà tặng.\n\nHệ thống cần xác định tài khoản để cộng ngày PRO. Đăng nhập ngay?");
            if (confirmLogin) {
                if (typeof window.loginGoogle === 'function') window.loginGoogle();
            }
            return;
        }

        const btn = event.target;
        const originalText = btn.innerText;

        btn.innerText = "⌛ ĐANG KIỂM TRA...";
        btn.disabled = true;

        try {
            const raw = await SendRQ(userId, "REDEEM_KEY", { key: key });
            const res = Receiver.processResponse(raw);

            if (res.success) {
                alert("🎉 Chúc mừng! Bạn đã kích hoạt thành công mã PRO.");
                input.value = "";
                DashboardManager.toggleGiftKeyModal();
                DashboardManager.refreshQuota();
            } else {
                alert("❌ Lỗi: " + (res.message || "Mã không hợp lệ hoặc đã hết hạn."));
            }
        } catch (err) {
            alert("❌ Lỗi kết nối server.");
        } finally {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    },

    // Các hàm referral cũ để trống để tránh lỗi nếu còn chỗ nào gọi
    handleReferralFlow() { console.log("Referral flow disabled."); },
    loadMyReferralCode() { },
    copyReferralCode() { }
};

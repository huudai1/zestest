/**
 * FILE: js/auth/identity_manager.js
 * Quản lý định danh người dùng (ID) và Phân hạng (Tier) đồng bộ giữa Local và Server.
 */
const IdentityManager = {
    _userId: null,
    _tier: 'GUEST',

    init() {
        // Ưu tiên lấy từ LocalStorage nếu có
        const cached = localStorage.getItem('user');
        if (cached) {
            try {
                const userData = JSON.parse(cached);
                this._userId = userData.uid || userData.id;
                this._tier = userData.tier || 'GUEST';
            } catch (e) {
                console.warn("⚠️ [IdentityManager] Cache hỏng, đang reset...");
                localStorage.removeItem('user');
            }
        }

        // Nếu chưa có ID (Guest mới), ClientInternal sẽ tạo một cái gst_xxx
        if (!this._userId && window.ClientInternal) {
            this._userId = window.ClientInternal.getExistingId();
        }

        console.log(`🆔 [IdentityManager] Ready: ID=${this._userId} | Tier=${this._tier}`);
    },

    getUserId() {
        return this._userId || (window.ClientInternal ? window.ClientInternal.getExistingId() : null);
    },

    setUserId(id) {
        this._userId = id;
    },

    getTier() {
        return this._tier;
    },

    setTier(tier) {
        console.log(`🏷️ [IdentityManager] Phân hạng mới: ${tier}`);
        this._tier = tier;
        // Cập nhật vào cache
        const cached = localStorage.getItem('user');
        if (cached) {
            const userData = JSON.parse(cached);
            userData.tier = tier;
            localStorage.setItem('user', JSON.stringify(userData));
        }
    }
};

// Khởi tạo ngay lập tức
IdentityManager.init();
window.IdentityManager = IdentityManager;

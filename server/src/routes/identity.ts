import { Hono } from 'hono';
import { Bindings, ActionType, UserTier, TIER_LIMITS } from '../types';

export const identityRoutes = new Hono<{ Bindings: Bindings }>();

// Helper xác định Tier dựa vào ID nội suy
export const getUserTier = (userId: string): UserTier => {
    // MỞ KHÓA TẠM THỜI CHO CỘNG ĐỒNG MIE TRẢI NGHIỆM
    return UserTier.GUEST;
};

// 3. API Đồng bộ Guest -> User (Khi Login Firebase)
identityRoutes.post('/sync', async (c) => {
    console.log("🔄 [API] Kiểm tra/Đồng bộ User...");
    try {
        const body = await c.req.json<{ old_id: string, new_id: string, email: string }>();
        const { old_id, new_id, email } = body;

        // 1. Ghi vào bảng (Upsert): Nếu chưa có thì chèn mới, nếu có rồi thì chỉ cập nhật email
        await c.env.DB.prepare(
            `INSERT INTO users (id, tier, email, created_at) 
             VALUES (?, ?, ?, ?)
             ON CONFLICT(id) DO UPDATE SET email = excluded.email`
        ).bind(new_id, UserTier.USER_FREE, email, Date.now()).run();

        // 2. Di chuyển dữ liệu từ Guest sang User chính thức (nếu có)
        let migrated = false;
        if (old_id && old_id.startsWith('gst_')) {
            await c.env.DB.prepare(
                `UPDATE exams SET owner_id = ? WHERE owner_id = ?`
            ).bind(new_id, old_id).run();

            await c.env.DB.prepare(`DELETE FROM users WHERE id = ?`).bind(old_id).run();
            migrated = true;
            console.log(`✨ [API] Đã di dời dữ liệu từ ${old_id} sang ${new_id}`);
        } else {
            console.log(`🏠 [API] Đã ghi nhận đăng nhập từ: ${email}`);
        }

        // 3. Lấy lại thông tin user từ DB để trả về Frontend
        const user = await c.env.DB.prepare(
            `SELECT * FROM users WHERE id = ?`
        ).bind(new_id).first<{ id: string, tier: string, email: string }>();

        return c.json({
            success: true,
            migrated: migrated,
            user: { 
                uid: user?.id || new_id, 
                tier: user?.tier || UserTier.USER_FREE, 
                email: user?.email || email 
            }
        });
    } catch (error: any) {
        console.error("❌ [API] Lỗi đồng bộ:", error);
        return c.json({ success: false, message: error.message }, 500);
    }
});

// Hàm xử lý các Action liên quan đến Identity (được gọi từ /api/action)
export const handleIdentityAction = async (c: any, item: any, bodyId: string) => {
    let resultData: any = null;

    // A. Khởi tạo ID mới
    if (item.action === ActionType.USER_INIT) {
        const finalId = bodyId || `gst_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        const tier = getUserTier(finalId);
        await c.env.DB.prepare(
            `INSERT OR IGNORE INTO users (id, tier, created_at) VALUES (?, ?, ?)`
        ).bind(finalId, tier, Date.now()).run();
        resultData = { id: finalId, tier: tier };
    }
    // B. Kiểm tra ID cũ (Kèm Check Expiry & Quota)
    else if (item.action === ActionType.CHECK_TURN) {
        const user = await c.env.DB.prepare(`SELECT * FROM users WHERE id = ?`)
            .bind(bodyId).first<any>();

        let currentTier = getUserTier(bodyId);
        let expiresAt = 0;
        let activeCount = 0;

        if (user) {
            currentTier = user.tier;
            expiresAt = user.tier_expires_at || 0;
            if (expiresAt > 0 && expiresAt < Date.now()) {
                currentTier = "USER_FREE";
                await c.env.DB.prepare(`UPDATE users SET tier = ?, tier_expires_at = 0 WHERE id = ?`)
                    .bind(currentTier, user.id).run();
            }

            // Đếm số đề đang hoạt động
            const activeCountRes = await c.env.DB.prepare(
                `SELECT COUNT(*) as count FROM exams WHERE owner_id = ? AND status = 'ACTIVE'`
            ).bind(bodyId).first<{ count: number }>();
            activeCount = activeCountRes ? activeCountRes.count : 0;
        }

        const limit = TIER_LIMITS[currentTier as keyof typeof TIER_LIMITS] || TIER_LIMITS.GUEST;

        let globalTotal = 0;
        try {
            const globalStats = await c.env.DB.prepare(
                "SELECT value_int FROM platform_metadata WHERE `key` = 'global_total_exams'"
            ).first<{ value_int: number }>();
            if (globalStats) globalTotal = globalStats.value_int;
        } catch (e) {
            console.warn("⚠️ [Stats] Chưa có bảng metadata hoặc lỗi query:", e);
        }

        resultData = {
            id: bodyId,
            tier: currentTier,
            expires_at: expiresAt,
            active_count: activeCount,
            max_active_exams: limit.max_active_exams,
            global_total_exams: globalTotal
        };
    }
    // F. Kích hoạt quà tặng (Upgrade lên GIFT_PRO + Cộng dồn)
    else if (item.action === ActionType.ACTIVATE_GIFT) {
        const user = await c.env.DB.prepare(`SELECT * FROM users WHERE id = ?`).bind(bodyId).first<any>();

        const GIFT_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 ngày
        let newExpiry = Date.now() + GIFT_DURATION;

        if (user) {
            const currentExpiry = user.tier_expires_at || 0;
            if (user.tier === "GIFT_PRO" && currentExpiry > Date.now()) {
                newExpiry = currentExpiry + GIFT_DURATION;
            }

            try {
                await c.env.DB.prepare(`UPDATE users SET tier = 'GIFT_PRO', tier_expires_at = ? WHERE id = ?`)
                    .bind(newExpiry, bodyId).run();
                resultData = { success: true, tier: "GIFT_PRO", expires_at: newExpiry };
                console.log(`🎁 [Gift] User ${bodyId} đã nhận/cộng dồn quà tặng. Hết hạn mới: ${new Date(newExpiry).toISOString()}`);
            } catch (e) {
                console.error("❌ Lỗi kích hoạt Gift (Có thể thiếu cột DB):", e);
                resultData = { success: false, message: "Server gặp lỗi khi nâng cấp. Captain vui lòng kiểm tra DB!" };
            }
        } else {
            resultData = { success: false, message: "Bạn chưa đăng ký tài khoản." };
        }
    }

    return resultData;
};

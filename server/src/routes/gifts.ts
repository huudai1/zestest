import { Context } from 'hono';
import { Bindings, ActionType, UserIdentityRequest } from '../types';

export const handleGiftAction = async (c: Context<{ Bindings: Bindings }>, item: UserIdentityRequest, bodyId: string) => {
    let resultData: any = { success: false, message: "Hành động không xác định." };

    // 1. REDEEM_KEY (Mã quà tặng thủ công)
    if (item.action === ActionType.REDEEM_KEY) {
        const keyString = item.payload?.key?.trim();
        if (!keyString) return { success: false, message: "Vui lòng nhập mã quà tặng." };

        const keyData = await c.env.DB.prepare(
            "SELECT * FROM gift_keys WHERE key_code = ? AND status = 'ACTIVE' AND uses_left > 0"
        ).bind(keyString).first<any>();

        if (!keyData) return { success: false, message: "Mã quà không hợp lệ hoặc đã hết lượt." };

        const user = await c.env.DB.prepare(`SELECT * FROM users WHERE id = ?`).bind(bodyId).first<any>();
        if (!user) return { success: false, message: "Bạn chưa đăng ký tài khoản." };

        const durationMs = (keyData.duration_days || 7) * 24 * 60 * 60 * 1000;
        const currentExpiry = user.tier_expires_at || 0;
        const newExpiry = Math.max(Date.now(), currentExpiry) + durationMs;

        try {
            await c.env.DB.prepare("UPDATE gift_keys SET uses_left = uses_left - 1 WHERE key_code = ?")
                .bind(keyString).run();
            await c.env.DB.prepare(`UPDATE users SET tier = 'GIFT_PRO', tier_expires_at = ? WHERE id = ?`)
                .bind(newExpiry, bodyId).run();

            console.log(`✨ [Redeem] User ${bodyId} sử dụng Key: ${keyString}`);
            return { success: true, tier: "GIFT_PRO", expires_at: newExpiry };
        } catch (e: any) {
            return { success: false, message: e.message };
        }
    }

    // 2. Các hành động khác đã bị loại bỏ
    return resultData;
};

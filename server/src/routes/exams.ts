import { Hono } from 'hono';
import { Bindings, ActionType, UserTier, TIER_LIMITS } from '../types';
import { SupabaseStorage, R2Storage } from '../services/storage';
import { cleanupExpiredExams } from '../services/cleanup';
import { checkUserIdValid } from '../middlewares/guard';
import { getUserTier } from './identity';

export const examsRoutes = new Hono<{ Bindings: Bindings }>();

// 4. API Upload File Zip lên Supabase & Lưu D1
examsRoutes.post('/upload-package', async (c) => {
    try {
        const formData = await c.req.parseBody();
        const user_id = formData['user_id'] as string;

        // --- 1. CHẶN ID RÁC (BLACK-BOX PROTECTION) ---
        const idCheck = checkUserIdValid(user_id);
        if (!idCheck.valid) {
            console.error(`❌ [API] Chặn upload vì ID không hợp lệ: "${user_id}"`);
            return c.json({ success: false, message: idCheck.message }, 400);
        }

        console.log(`📤 [API] Bắt đầu xử lý upload cho User: ${user_id}`);

        const file = formData['exam_package'] as File;
        const client_exam_id = formData['exam_id'] as string;
        const exam_name = formData['exam_name'] as string || "Untitled Exam";
        const config_json = formData['config_json'] as string || "{}";

        if (!file) return c.json({ success: false, message: 'Thiếu file đề thi.' }, 400);

        // --- 2. XÁC ĐỊNH TIER & KIỂM TRA QUOTA ---
        let tier = getUserTier(user_id);

        const userQuery = await c.env.DB.prepare(`SELECT tier, tier_expires_at FROM users WHERE id = ?`)
            .bind(user_id)
            .first<{ tier: string, tier_expires_at: number }>();

        if (userQuery) tier = userQuery.tier as UserTier;
        const limit = TIER_LIMITS[tier as keyof typeof TIER_LIMITS] || TIER_LIMITS.GUEST;

        const { count } = await c.env.DB.prepare(
            `SELECT COUNT(*) as count FROM exams WHERE owner_id = ? AND (status = 'ACTIVE' OR status = 'CLOSED')`
        ).bind(user_id).first<{ count: number }>() || { count: 0 };

        if (count >= limit.max_active_exams) {
            console.log(`⚠️ [Quota] User ${user_id} đầy kho (${count}/${limit.max_active_exams})`);
            return c.json({
                message: `Bạn đã đầy slot, rất thông cảm vì giới hạn này để đảm bảo ai cũng được dùng ạ. Bạn hãy xóa 1 đề cũ để tải đề mới lên nhé!`
            }, 403);
        }

        // --- 3. ĐĂNG KÝ USER & LƯU TRỮ ---
        await c.env.DB.prepare(
            `INSERT OR IGNORE INTO users (id, tier, created_at) VALUES (?, ?, ?)`
        ).bind(user_id, tier, Date.now()).run();

        const exam_id = client_exam_id || crypto.randomUUID();

        let expires_at = Date.now() + (limit.ttl_hours * 60 * 60 * 1000);
        if (userQuery && userQuery.tier_expires_at > 0) {
            expires_at = userQuery.tier_expires_at;
        }

        const storage = new R2Storage(c.env.R2_BUCKET);
        const filePath = `${user_id}/${exam_id}.zip`;
        const publicUrl = await storage.upload(file, filePath);

        await c.env.DB.prepare(
            `INSERT INTO exams (id, owner_id, exam_name, storage_url, config_json, status, expires_at, created_at) 
             VALUES (?, ?, ?, ?, ?, 'ACTIVE', ?, ?)`
        ).bind(exam_id, user_id, exam_name, publicUrl, config_json, expires_at, Date.now()).run();

        try {
            await c.env.DB.prepare(
                "UPDATE users SET total_exams_created = total_exams_created + 1 WHERE id = ?"
            ).bind(user_id).run();

            await c.env.DB.prepare(
                "UPDATE platform_metadata SET value_int = value_int + 1 WHERE `key` = 'global_total_exams'"
            ).run();
        } catch (statsError) {
            console.warn("⚠️ [Stats Update] Không thể cập nhật thống kê (có thể thiếu bảng/cột):", statsError);
        }

        console.log(`✅ [API] Hoàn tất: ${exam_id} | Chủ sở hữu: ${user_id}`);
        return c.json({
            status: 'SUCCESS',
            success: true,
            exam_id,
            path: publicUrl,
            expires_at
        });

    } catch (error: any) {
        console.error("❌ [API] Lỗi upload:", error);
        return c.json({ success: false, message: error.message }, 500);
    }
});

// 4.5 API Xóa Đề Thi
examsRoutes.delete('/:exam_id', async (c) => {
    const exam_id = c.req.param('exam_id');
    const user_id = c.req.header('X-User-ID');

    if (!user_id) return c.json({ success: false, message: 'Thiếu X-User-ID header' }, 401);

    console.log(`🗑️ [API] Yêu cầu xóa đề thi ${exam_id} từ user ${user_id}...`);

    try {
        const exam = await c.env.DB.prepare(
            `SELECT owner_id FROM exams WHERE id = ? AND (status = 'ACTIVE' OR status = 'CLOSED')`
        ).bind(exam_id).first<{ owner_id: string }>();

        if (!exam) return c.json({ success: false, message: 'Đề thi không tồn tại hoặc đã bị xóa.' }, 404);
        if (exam.owner_id !== user_id) return c.json({ success: false, message: 'Bạn không có quyền xóa đề này.' }, 403);

        const storage = new R2Storage(c.env.R2_BUCKET);
        const filePath = `${user_id}/${exam_id}.zip`;

        await storage.delete(filePath);

        await c.env.DB.prepare(
            `DELETE FROM exams WHERE id = ?`
        ).bind(exam_id).run();

        console.log(`✅ [API] Đã xóa đề thi ${exam_id} thành công.`);
        return c.json({ success: true });
    } catch (error: any) {
        console.error("❌ [API] Lỗi khi xóa đề thi:", error);
        return c.json({ success: false, message: error.message }, 500);
    }
});

// 4.6 API Lấy danh sách đề thi (Kèm Lazy Cleanup)
examsRoutes.get('/', async (c) => {
    const user_id = c.req.header('X-User-ID');
    if (!user_id) return c.json({ success: false, message: 'Thiếu X-User-ID header' }, 401);

    try {
        const cleanedCount = await cleanupExpiredExams(c.env, user_id);
        if (cleanedCount > 0) {
            console.log(`🧹 [Cleanup] Đã dọn dẹp ${cleanedCount} đề hết hạn của ${user_id}`);
        }

        const exams = await c.env.DB.prepare(
            `SELECT id, exam_name as name, storage_url as url, status, max_attempts, created_at, expires_at FROM exams WHERE owner_id = ? AND (status = 'ACTIVE' OR status = 'CLOSED') ORDER BY created_at DESC`
        ).bind(user_id).all();

        return c.json({ success: true, exams: exams.results });
    } catch (error: any) {
        console.error("❌ [API] Lỗi khi lấy và dọn dẹp đề thi:", error);
        return c.json({ success: false, message: error.message }, 500);
    }
});

// 4.7 API Thay đổi trạng thái đề thi
examsRoutes.post('/:exam_id/status', async (c) => {
    const exam_id = c.req.param('exam_id');
    const user_id = c.req.header('X-User-ID');
    const { status } = await c.req.json<{ status: string }>();

    if (!user_id) return c.json({ success: false, message: 'Thiếu X-User-ID header' }, 401);
    if (!['ACTIVE', 'CLOSED'].includes(status)) return c.json({ success: false, message: 'Trạng thái không hợp lệ' }, 400);

    try {
        const exam = await c.env.DB.prepare(
            `SELECT owner_id FROM exams WHERE id = ?`
        ).bind(exam_id).first<{ owner_id: string }>();

        if (!exam) return c.json({ success: false, message: 'Đề thi không tồn tại.' }, 404);
        if (exam.owner_id !== user_id) return c.json({ success: false, message: 'Bạn không có quyền chỉnh sửa đề này.' }, 403);

        await c.env.DB.prepare(
            `UPDATE exams SET status = ? WHERE id = ?`
        ).bind(status, exam_id).run();

        console.log(`✅ [API] Đã cập nhật trạng thái đề thi ${exam_id} thành ${status}.`);
        return c.json({ success: true });
    } catch (error: any) {
        console.error("❌ [API] Lỗi khi cập nhật trạng thái:", error);
        return c.json({ success: false, message: error.message }, 500);
    }
});

// 4.8 API Cập nhật cài đặt đề thi (max_attempts, ...)
examsRoutes.post('/:exam_id/settings', async (c) => {
    const exam_id = c.req.param('exam_id');
    const user_id = c.req.header('X-User-ID');
    const { max_attempts } = await c.req.json<{ max_attempts: number }>();

    if (!user_id) return c.json({ success: false, message: 'Thiếu X-User-ID header' }, 401);

    try {
        const exam = await c.env.DB.prepare(
            `SELECT owner_id FROM exams WHERE id = ?`
        ).bind(exam_id).first<{ owner_id: string }>();

        if (!exam) return c.json({ success: false, message: 'Đề thi không tồn tại.' }, 404);
        if (exam.owner_id !== user_id) return c.json({ success: false, message: 'Bạn không có quyền chỉnh sửa đề này.' }, 403);

        await c.env.DB.prepare(
            `UPDATE exams SET max_attempts = ? WHERE id = ?`
        ).bind(max_attempts || 1, exam_id).run();

        console.log(`✅ [API] Đã cập nhật cài đặt đề thi ${exam_id}: max_attempts=${max_attempts}.`);
        return c.json({ success: true });
    } catch (error: any) {
        console.error("❌ [API] Lỗi khi cập nhật cài đặt:", error);
        return c.json({ success: false, message: error.message }, 500);
    }
});

// Logic cho các Action thuộc nhóm Exams (được gọi từ /api/action)
export const handleExamAction = async (c: any, item: any, bodyId: string) => {
    let resultData: any = null;

    if (item.action === ActionType.CREATE_QUIZ) {
        let tier = getUserTier(bodyId);
        const userQuery = await c.env.DB.prepare(`SELECT * FROM users WHERE id = ?`).bind(bodyId).first<any>();

        if (userQuery) {
            tier = userQuery.tier as UserTier;
            const expiresAt = userQuery.tier_expires_at || 0;
            if (expiresAt > 0 && expiresAt < Date.now()) {
                tier = UserTier.USER_FREE;
                try {
                    await c.env.DB.prepare(`UPDATE users SET tier = ?, tier_expires_at = 0 WHERE id = ?`)
                        .bind(tier, bodyId).run();
                } catch (e) { console.error("⚠️ Không thể update expiry:", e); }
            }
        }

        const limit = TIER_LIMITS[tier as keyof typeof TIER_LIMITS] || TIER_LIMITS.GUEST;
        const activeCountRes = await c.env.DB.prepare(
            `SELECT COUNT(*) as count FROM exams WHERE owner_id = ? AND (status = 'ACTIVE' OR status = 'CLOSED')`
        ).bind(bodyId).first<{ count: number }>();
        const activeCount = activeCountRes ? activeCountRes.count : 0;

        if (activeCount >= limit.max_active_exams) {
            return {
                error: true,
                status: 'ERROR',
                message: `Bạn đã đầy slot, rất thông cảm vì giới hạn này để đảm bảo ai cũng được dùng ạ. Bạn hãy xóa 1 đề cũ để tải đề mới lên nhé!`,
                timestamp: Date.now()
            };
        } else {
            resultData = { success: true, exam_id: item.payload?.exam_id };
        }
    }
    else if (item.action === ActionType.GEN_LINK) {
        resultData = { link: `/static/student/index.html?exam=${item.payload?.exam_id}` };
    }
    else if (item.action === ActionType.GEN_EXAM_ID) {
        const newExamId = `Zest_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
        resultData = { exam_id: newExamId };
    }

    return resultData;
};

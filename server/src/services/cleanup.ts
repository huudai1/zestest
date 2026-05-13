import { Bindings } from '../types';
import { R2Storage } from './storage';

/**
 * Dọn dẹp các đề thi đã hết hạn.
 * Nếu truyền owner_id, nó sẽ chỉ kiểm tra của người dùng đó (Lazy Cleanup).
 * Nếu không truyền owner_id, nó sẽ quét toàn bộ hệ thống (Cron Job).
 */
export const cleanupExpiredExams = async (env: Bindings, owner_id?: string) => {
    const now = Date.now();
    let expiredExams;

    try {
        if (owner_id) {
            expiredExams = await env.DB.prepare(
                `SELECT id, owner_id FROM exams WHERE owner_id = ? AND status = 'ACTIVE' AND expires_at < ?`
            ).bind(owner_id, now).all<{ id: string, owner_id: string }>();
        } else {
            expiredExams = await env.DB.prepare(
                `SELECT id, owner_id FROM exams WHERE expires_at < ? AND status = 'ACTIVE'`
            ).bind(now).all<{ id: string, owner_id: string }>();
        }

        if (!expiredExams.results || expiredExams.results.length === 0) {
            return 0;
        }

        const storage = new R2Storage(env.R2_BUCKET);

        for (const exam of expiredExams.results) {
            const filePath = `${exam.owner_id}/${exam.id}.zip`;
            // Xóa file trên Supabase
            await storage.delete(filePath).catch(e => console.warn(`⚠️ Lỗi xóa file ${filePath}:`, e));

            if (owner_id) {
                // Với Lazy Cleanup, cập nhật trạng thái thành EXPIRED
                await env.DB.prepare(`UPDATE exams SET status = 'EXPIRED' WHERE id = ?`).bind(exam.id).run();
            } else {
                // Với Cron Job, xóa hẳn khỏi D1
                await env.DB.prepare(`DELETE FROM exams WHERE id = ?`).bind(exam.id).run();
            }
        }

        return expiredExams.results.length;
    } catch (error) {
        console.error("❌ Lỗi trong quá trình dọn dẹp đề thi:", error);
        return 0;
    }
};

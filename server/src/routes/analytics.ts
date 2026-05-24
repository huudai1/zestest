import { Context } from 'hono';
import { Bindings } from '../types';

export async function getAnalytics(c: Context<{ Bindings: Bindings }>) {
    const teacherId = c.req.query('teacher_id');
    const examId = c.req.query('exam_id'); // Optional filter

    if (!teacherId) {
        return c.json({ success: false, message: 'Missing teacher_id' }, 400);
    }

    try {
        let query = `
            SELECT r.id, r.exam_id, e.exam_name, r.student_name, r.student_uid, r.score, r.total_correct, r.total_questions, r.warning_count, r.created_at, r.teacher_comment
            FROM exam_results r
            JOIN exams e ON r.exam_id = e.id
            WHERE e.owner_id = ?
        `;
        const params: string[] = [teacherId];

        if (examId && examId !== 'all') {
            query += ` AND r.exam_id = ?`;
            params.push(examId);
        }

        query += ` ORDER BY r.created_at DESC LIMIT 500`;

        // Chú ý: Cần thêm cột student_uid và teacher_comment vào bảng exam_results trong D1 nếu chưa có
        const results = await c.env.DB.prepare(query).bind(...params).all();

        return c.json({ success: true, data: results.results });
    } catch (error: any) {
        console.error("Lỗi lấy analytics:", error);
        return c.json({ success: false, message: error.message }, 500);
    }
}

export async function addTeacherComment(c: Context<{ Bindings: Bindings }>) {
    try {
        const body = await c.req.json<{ result_id: number, comment: string }>();
        await c.env.DB.prepare(`UPDATE exam_results SET teacher_comment = ? WHERE id = ?`)
            .bind(body.comment, body.result_id).run();
        
        return c.json({ success: true });
    } catch (error: any) {
        return c.json({ success: false, message: error.message }, 500);
    }
}

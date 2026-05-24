import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { ActionType, UserIdentityRequest, Bindings } from './types'
import { cleanupExpiredExams } from './services/cleanup'
import { ExamRoom } from './do/ExamRoom'
import { identityRoutes, handleIdentityAction } from './routes/identity'
import { examsRoutes, handleExamAction } from './routes/exams'
import { handleGiftAction } from './routes/gifts'
import { getAnalytics, addTeacherComment } from './routes/analytics'
import { saveBranding, getBrandingBySubdomain, uploadBrandingImage, getBrandingByTeacherId } from './routes/branding'

const app = new Hono<{ Bindings: Bindings }>()

// 1. CORS & Security
app.use('*', cors())
app.use('*', async (c, next) => {
    await next()
    const path = c.req.path
    if (path.includes('/editor') || path.includes('/process-video')) {
        c.res.headers.set("Cross-Origin-Opener-Policy", "same-origin-allow-popups")
        c.res.headers.set("Cross-Origin-Embedder-Policy", "credentialless")
    }
})

// 1.5 Subdomain Redirect Gatekeeper (Bắt buộc phải ở trên cùng)
app.use('*', async (c, next) => {
    const host = c.req.header('host') || '';
    const url = new URL(c.req.url);
    const path = url.pathname;
    
    // Log để debug (xem trong Cloudflare Dashboard)
    console.log(`🌐 [Routing] Host: ${host} | Path: ${path}`);

    // Nếu là subdomain của zestest.com (và không phải bản thân zestest.com)
    if (host.includes('.zestest.com') && !host.startsWith('zestest.com') && !host.includes('workers.dev')) {
        // Nếu truy cập trang chủ của subdomain
        if (path === '/' || path === '/index.html') {
            console.log(`🔀 [Redirect] Chuyển hướng ${host} về trang Student`);
            return c.redirect('/static/student/index.html');
        }
    }
    await next();
})

// 2. Health check
app.get('/api/stats', (c) => c.text('OK'))

// 3. Đăng ký các module Router
app.route('/api/users', identityRoutes)
app.route('/api/exams', examsRoutes)

// API Analytics
app.get('/api/analytics', getAnalytics)
app.post('/api/analytics/comment', addTeacherComment)

// API Branding
app.post('/api/branding', saveBranding)
app.get('/api/branding/:subdomain', getBrandingBySubdomain)
app.get('/api/branding/teacher/:teacher_id', getBrandingByTeacherId)
app.post('/api/branding/upload', uploadBrandingImage)

// 4. Các API Public & Results (Không yêu cầu X-User-ID)
app.get('/api/public/exam/:exam_id', async (c) => {
    const exam_id = c.req.param('exam_id');
    try {
        const exam = await c.env.DB.prepare(
            `SELECT e.id, e.exam_name as name, e.storage_url as url, e.status, e.max_attempts, e.require_login,
                    COALESCE(u.tier, 'GUEST') as owner_tier
             FROM exams e
             LEFT JOIN users u ON e.owner_id = u.id
             WHERE e.id = ? AND (e.status = 'ACTIVE' OR e.status = 'CLOSED')`
        ).bind(exam_id).first<{ id: string, name: string, url: string, status: string, max_attempts: number, require_login: number, owner_tier: string }>();

        if (!exam) return c.json({ success: false, message: 'Đề thi không tồn tại hoặc đã bị khóa.' }, 404);

        return c.json({ success: true, exam });
    } catch (error: any) {
        return c.json({ success: false, message: error.message }, 500);
    }
});

app.get('/api/exam/results/:exam_id', async (c) => {
    const exam_id = c.req.param('exam_id');
    try {
        const results = await c.env.DB.prepare(
            `SELECT student_name, score, total_correct, total_questions, warning_count, created_at 
             FROM exam_results WHERE exam_id = ? ORDER BY created_at DESC`
        ).bind(exam_id).all();
        
        return c.json({ success: true, results: results.results });
    } catch (error: any) {
        return c.json({ success: false, message: error.message }, 500);
    }
});

app.post('/api/exam/submit', async (c) => {
    try {
        const body = await c.req.json<{ 
            exam_id: string, 
            student_name: string, 
            score: number,
            total_correct: number,
            total_questions: number,
            warning_count: number,
            answers: any 
        }>();
        
        const { exam_id, student_name, score, total_correct, total_questions, warning_count, answers } = body;
        
        // KIỂM TRA TRẠNG THÁI PHÒNG THI (End Room)
        const exam = await c.env.DB.prepare(`SELECT status FROM exams WHERE id = ?`)
            .bind(exam_id).first<{ status: string }>();
        
        if (exam && exam.status === 'CLOSED') {
            console.log(`🚫 [Submit Denied] Đề ${exam_id} đã đóng. Học sinh [${student_name}] nộp muộn.`);
            return c.json({ success: false, message: 'SUBMIT_LATE', error: 'Phòng thi đã đóng, bạn đã nộp bài muộn.' }, 403);
        }

        console.log(`🏆 [D1] Ghi nhận kết quả: Học sinh [${student_name}] - Điểm: [${score}] - Cảnh báo: [${warning_count}] tại đề [${exam_id}]`);

        await c.env.DB.prepare(
            `INSERT INTO exam_results (exam_id, student_name, score, total_correct, total_questions, warning_count, answers_json, created_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
            exam_id, 
            student_name, 
            score, 
            total_correct, 
            total_questions, 
            warning_count,
            JSON.stringify(answers), 
            Date.now()
        ).run();

        return c.json({ success: true });
    } catch (error: any) {
        console.error("❌ [API] Lỗi nộp bài:", error);
        return c.json({ success: false, message: error.message }, 500);
    }
});

// 5. API Điều phối các Action (Dispatcher)
app.post('/api/action', async (c) => {
    const body = await c.req.json<UserIdentityRequest>()

    if (!body.id && body.action !== ActionType.USER_INIT) {
        return c.json({
            status: 'ERROR',
            message: 'Thiếu định danh người dùng (User ID).',
            timestamp: Date.now()
        }, 401);
    }

    const actions = (body.action === "BATCH" && Array.isArray(body.payload?.actions)) 
                    ? body.payload.actions 
                    : [body];

    const results: any[] = [];

    for (const item of actions) {
        let resultData: any = null;
        const bodyId = body.id || '';

        // Phân loại Action cho Identity Module
        if ([ActionType.USER_INIT, ActionType.CHECK_TURN, ActionType.ACTIVATE_GIFT].includes(item.action)) {
            resultData = await handleIdentityAction(c, item, bodyId);
        }
        // Phân loại Action cho Exams Module
        else if ([ActionType.CREATE_QUIZ, ActionType.GEN_LINK, ActionType.GEN_EXAM_ID].includes(item.action)) {
            resultData = await handleExamAction(c, item, bodyId);
            
            if (resultData && resultData.error) {
                 return c.json({ 
                    status: resultData.status, 
                    message: resultData.message,
                    timestamp: resultData.timestamp
                }, 403);
            }
        }
        // Phân loại Action cho Gifts Module (Key quà, Mã mời)
        else if ([ActionType.REDEEM_KEY, ActionType.REDEEM_REFERRAL, ActionType.GET_MY_REFERRAL].includes(item.action)) {
            resultData = await handleGiftAction(c, item, bodyId);
        }

        // Nếu Action thất bại (success === false), trả về lỗi ngay lập tức thay vì bọc trong SUCCESS
        if (resultData && resultData.success === false) {
            return c.json({
                status: 'ERROR',
                message: resultData.message || 'Thao tác thất bại.',
                timestamp: Date.now()
            }, 400);
        }

        results.push({ action: item.action, data: resultData });
    }

    const isBatch = body.action === "BATCH";
    
    return c.json({
        user_id: body.id,
        id: isBatch ? body.id : results[0]?.data?.id,
        data: isBatch ? null : results[0]?.data,
        status: "SUCCESS",
        results: results,
        timestamp: Date.now()
    });
});

// 6. Route WebSocket kết nối vào Durable Object
app.get('/api/room/:examId', async (c) => {
    const examId = c.req.param('examId');
    
    try {
        // Kiểm tra xem đề thi có tồn tại và thuộc sở hữu của tài khoản Premium hay không
        const exam = await c.env.DB.prepare(
            `SELECT u.tier, u.tier_expires_at FROM exams e
             JOIN users u ON e.owner_id = u.id
             WHERE e.id = ?`
        ).bind(examId).first<{ tier: string, tier_expires_at: number }>();

        if (!exam) {
            console.log(`⚠️ [DO Block] Kết nối thất bại. Đề thi [${examId}] không tồn tại.`);
            return c.json({ success: false, message: 'Đề thi không tồn tại hoặc đã bị khóa.' }, 404);
        }

        let tier = exam.tier;
        const expiresAt = exam.tier_expires_at || 0;

        // Nếu hết hạn premium, tự động hạ cấp xuống USER_FREE
        if (expiresAt > 0 && Date.now() > expiresAt) {
            tier = 'USER_FREE';
        }

        // Các Premium tier được phép sử dụng Durable Object proctoring
        const isPremium = ['GIFT_PRO', 'PREMIUM_1', 'PREMIUM_2', 'PREMIUM_3', 'ADMIN'].includes(tier);

        if (!isPremium) {
            console.log(`🚫 [DO Block] Từ chối kết nối WebSocket vào đề [${examId}]. Tier chủ sở hữu: [${tier}].`);
            return c.json({ 
                success: false, 
                message: 'Tính năng giám sát thi thời gian thực yêu cầu tài khoản Premium.' 
            }, 403);
        }

        console.log(`✅ [DO Allow] Thiết lập WebSocket vào đề [${examId}]. Tier chủ sở hữu: [${tier}].`);
        const id = c.env.MONITOR_ROOM.idFromName(examId);
        const room = c.env.MONITOR_ROOM.get(id);
        return room.fetch(c.req.raw);
    } catch (error: any) {
        console.error("❌ [DO Connection Error] Lỗi kiểm tra bảo mật:", error);
        return c.json({ success: false, message: 'Lỗi máy chủ nội bộ.' }, 500);
    }
});

// 6.5 Phục vụ file từ R2 (CDN nội bộ)
app.get('/cdn/:path{.+}', async (c) => {
    const path = c.req.param('path');
    const object = await c.env.R2_BUCKET.get(path);

    if (!object) return c.text('Not Found', 404);

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');

    return new Response(object.body, { headers });
});

// 7. Export ứng dụng & Cron Job
export default {
    fetch: app.fetch,
    async scheduled(event: any, env: Bindings, ctx: any) {
        ctx.waitUntil((async () => {
            console.log("🕒 [Cron] Bắt đầu tiến trình dọn rác...");
            const deletedCount = await cleanupExpiredExams(env);
            if (deletedCount > 0) {
                console.log(`✅ [Cron] Đã dọn dẹp xong ${deletedCount} đề thi.`);
            } else {
                console.log("✨ [Cron] Không có rác cần dọn.");
            }
        })());
    }
}

export { ExamRoom }

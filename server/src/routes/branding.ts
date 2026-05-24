import { Context } from 'hono';
import { Bindings } from '../types';

export async function saveBranding(c: Context<{ Bindings: Bindings }>) {
    try {
        const body = await c.req.json<{
            teacher_id: string;
            subdomain: string;
            primary_color: string;
            logo_url: string;
        }>();

        if (!body.teacher_id || !body.subdomain) {
            return c.json({ success: false, message: 'Thiếu dữ liệu bắt buộc.' }, 400);
        }

        // Cần tạo bảng teacher_branding trong D1 nếu chưa có
        // CREATE TABLE IF NOT EXISTS teacher_branding (teacher_id TEXT PRIMARY KEY, subdomain TEXT UNIQUE, primary_color TEXT, logo_url TEXT);

        await c.env.DB.prepare(
            `INSERT INTO teacher_branding (teacher_id, subdomain, primary_color, logo_url) 
             VALUES (?, ?, ?, ?)
             ON CONFLICT(teacher_id) DO UPDATE SET 
             subdomain = excluded.subdomain,
             primary_color = excluded.primary_color,
             logo_url = excluded.logo_url`
        ).bind(body.teacher_id, body.subdomain, body.primary_color, body.logo_url).run();

        return c.json({ success: true, message: 'Lưu cấu hình Branding thành công.' });
    } catch (error: any) {
        console.error("Lỗi lưu Branding:", error);
        return c.json({ success: false, message: error.message }, 500);
    }
}

export async function getBrandingBySubdomain(c: Context<{ Bindings: Bindings }>) {
    const subdomain = c.req.param('subdomain');
    try {
        const branding = await c.env.DB.prepare(
            `SELECT teacher_id, subdomain, primary_color, logo_url FROM teacher_branding WHERE subdomain = ?`
        ).bind(subdomain).first();

        if (!branding) {
            return c.json({ success: false, message: 'Không tìm thấy cấu hình thương hiệu.' }, 404);
        }

        return c.json({ success: true, data: branding });
    } catch (error: any) {
        return c.json({ success: false, message: error.message }, 500);
    }
}

// Hàm upload ảnh lên R2 Bucket
export async function uploadBrandingImage(c: Context<{ Bindings: Bindings }>) {
    try {
        const teacherId = c.req.header('X-Teacher-ID');
        if (!teacherId) return c.json({ success: false, message: 'Unauthorized' }, 401);

        const body = await c.req.parseBody();
        const file = body['file'] as File;

        if (!file) return c.json({ success: false, message: 'Missing file' }, 400);

        const ext = file.name.split('.').pop() || 'webp';
        const key = `branding/${teacherId}/logo_${Date.now()}.${ext}`;

        await c.env.R2_BUCKET.put(key, await file.arrayBuffer(), {
            httpMetadata: { contentType: file.type }
        });

        const url = `/cdn/${key}`; // Sử dụng endpoint CDN nội bộ đã có ở index.ts

        return c.json({ success: true, url });
    } catch (error: any) {
        return c.json({ success: false, message: error.message }, 500);
    }
}

export async function getBrandingByTeacherId(c: Context<{ Bindings: Bindings }>) {
    const teacher_id = c.req.param('teacher_id');
    try {
        const branding = await c.env.DB.prepare(
            `SELECT teacher_id, subdomain, primary_color, logo_url FROM teacher_branding WHERE teacher_id = ?`
        ).bind(teacher_id).first();

        return c.json({ success: true, data: branding });
    } catch (error: any) {
        return c.json({ success: false, message: error.message }, 500);
    }
}

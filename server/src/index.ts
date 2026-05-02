import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { ActionType, ServerResponse, UserIdentityRequest } from './types'

type Bindings = {
    DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// 1. Thay thế CORS Middleware
app.use('*', cors())

// 2. Thay thế Security Headers cho ffmpeg
app.use('*', async (c, next) => {
    await next()
    const path = c.req.path
    if (path.includes('/editor') || path.includes('/process-video')) {
        c.res.headers.set("Cross-Origin-Opener-Policy", "same-origin")
        c.res.headers.set("Cross-Origin-Embedder-Policy", "require-corp")
    }
})

// 3. Thay thế Router API
app.post('/api/action', async (c) => {
    const body = await c.req.json<UserIdentityRequest>()
    
    // Giả lập logic xử lý Action
    let response: ServerResponse = {
        user_id: body.id || 'new_user',
        status: 'SUCCESS',
        timestamp: Date.now()
    }

    return c.json(response)
})

// 4. Thay thế Cron Job dọn rác
export default {
    fetch: app.fetch,
    async scheduled(event: any, env: Bindings, ctx: any) {
        ctx.waitUntil((async () => {
            console.log("🕒 Đang dọn rác tự động...")
            // Viết lệnh SQL xóa dữ liệu ở đây
        })())
    }
}

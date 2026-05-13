/*! coi-serviceworker v0.1.7 - MIT License */
if (typeof window === 'undefined') {
    self.addEventListener("install", () => self.skipWaiting());
    self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

    self.addEventListener("fetch", (event) => {
        const url = new URL(event.request.url);
        
        // BỎ QUA CÁC LINK EXTERNAL KHÔNG QUAN TRỌNG ĐỂ TRÁNH LỖI CONSOLE
        if (url.hostname.includes('cloudflareinsights.com')) {
            return; 
        }

        if (event.request.cache === "only-if-cached" && event.request.mode !== "same-origin") {
            return;
        }

        event.respondWith(
            fetch(event.request).then((response) => {
                if (response.status === 0) return response;

                const url = new URL(event.request.url);
                // NẾU LÀ CỬA SỔ ĐĂNG NHẬP HOẶC ĐĂNG XUẤT -> KHÔNG GẮN HEADER BẢO MẬT ĐỂ FIREBASE HOẠT ĐỘNG
                if (url.searchParams.has('login') || url.searchParams.has('logout')) {
                    return new Response(response.body, {
                        status: response.status,
                        statusText: response.statusText,
                        headers: response.headers,
                    });
                }

                const newHeaders = new Headers(response.headers);
                newHeaders.set("Cross-Origin-Embedder-Policy", "credentialless");
                newHeaders.set("Cross-Origin-Opener-Policy", "same-origin");

                return new Response(response.body, {
                    status: response.status,
                    statusText: response.statusText,
                    headers: newHeaders,
                });
            }).catch((e) => console.error(e))
        );
    });
} else {
    // Logic đăng ký tại main thread
    if (!window.crossOriginIsolated) {
        // Đăng ký file chính nó làm Service Worker
        navigator.serviceWorker.register('/coi-serviceworker.js', { scope: '/' }).then((registration) => {
            registration.addEventListener("updatefound", () => {
                const url = new URL(window.location.href);
                if (!url.searchParams.has('login') && !url.searchParams.has('logout')) {
                    location.reload();
                }
            });
            if (registration.active && !navigator.serviceWorker.controller) {
                const url = new URL(window.location.href);
                if (!url.searchParams.has('login') && !url.searchParams.has('logout')) {
                    location.reload();
                }
            }
        }, (err) => {   });
    }
}

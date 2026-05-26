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

                // FIX: Response with null body status (204, 205, 304) cannot have body
                const isNullBodyStatus = [204, 205, 304].includes(response.status);
                
                return new Response(isNullBodyStatus ? null : response.body, {
                    status: response.status,
                    statusText: response.statusText,
                    headers: newHeaders,
                });
            }).catch((e) => {
                // Chỉ log cảnh báo nếu request thuộc chính origin của app (tránh ô nhiễm console bởi adblock chặn link ngoài)
                if (url.origin === self.location.origin) {
                    console.warn("COI Worker Same-Origin Fetch Fallback:", e.message || e);
                }
                return fetch(event.request); // Fallback to original fetch
            })
        );
    });
} else {
    // Logic đăng ký tại main thread
    if (!window.crossOriginIsolated) {
        // Đăng ký file chính nó làm Service Worker
        navigator.serviceWorker.register('/coi-serviceworker.js', { scope: '/' }).then((registration) => {
            const isAppPage = window.location.pathname.includes('dashboard') || 
                              window.location.pathname.includes('step') ||
                              window.location.search.includes('start=true');

            if (!isAppPage) return; // Không làm phiền trang chủ hoặc trang tĩnh

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

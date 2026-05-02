import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import {
    getAuth,
    signInWithPopup,
    GoogleAuthProvider,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";

console.log("🔥 [Auth] Module loaded");

// --- Configuration ---
const firebaseConfig = {
    apiKey: "AIzaSyDOZqrYPVqBo6Hd3Ma7Jpnr79JaQ7Kv3OE",
    authDomain: "zestest-5cf6c.firebaseapp.com",
    projectId: "zestest-5cf6c",
    storageBucket: "zestest-5cf6c.firebasestorage.app",
    messagingSenderId: "1055246294188",
    appId: "1:1055246294188:web:867710909b31beccd41309"
};

// --- Initialize Firebase ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

console.log("🔥 [Auth] Firebase initialized");

// --- Lấy BASE_URL an toàn ---
function getBaseUrl() {
    // Ưu tiên window.CONFIG nếu đã được set bởi guest_action_types.js
    if (window.CONFIG && window.CONFIG.BASE_URL) {
        return window.CONFIG.BASE_URL;
    }
    // Fallback: tự suy từ origin (works khi FastAPI serve cùng host)
    return window.location.origin;
}

// --- Auth Actions ---

async function loginGoogle() {
    console.log("🔐 [Auth] Bắt đầu đăng nhập Google (Popup)...");
    try {
        const result = await signInWithPopup(auth, provider);
        console.log("✅ [Auth] Popup đăng nhập thành công:", result.user.email);
        // onAuthStateChanged sẽ tự fire sau khi popup đóng
    } catch (err) {
        if (err.code === 'auth/popup-closed-by-user') {
            console.log("ℹ️ [Auth] Người dùng đóng popup");
        } else if (err.code === 'auth/popup-blocked') {
            console.error("❌ [Auth] Popup bị chặn bởi trình duyệt — hãy cho phép popup cho trang này");
            alert("Trình duyệt đang chặn popup đăng nhập.\nVui lòng cho phép popup cho trang này và thử lại.");
        } else {
            console.error("❌ [Auth] Lỗi đăng nhập:", err.code, err.message);
        }
    }
}

async function logoutGoogle() {
    console.log("🚪 [Auth] Đăng xuất...");
    try {
        await signOut(auth);
        localStorage.removeItem('user');
        AuthUI.update(null);
        console.log("✅ [Auth] Đã đăng xuất");
    } catch (err) {
        console.error("❌ [Auth] Lỗi đăng xuất:", err);
    }
}

// --- Expose ra window để HTML onclick="" vẫn gọi được (ES module scope bị isolated) ---
window.loginGoogle = loginGoogle;
window.logoutGoogle = logoutGoogle;

// --- UI Logic ---
const AuthUI = {
    update(user) {
        const badge = document.querySelector('.badge[data-i18n="user"]');
        const btnRegister = document.querySelector('.btn-register');

        if (user) {
            console.log("👤 [Auth] UI update — logged in as:", user.name || user.email);
            if (badge) badge.textContent = user.name || user.email;
            if (btnRegister) {
                btnRegister.textContent = "Đăng xuất";
                btnRegister.onclick = logoutGoogle;
            }
        } else {
            console.log("👤 [Auth] UI update — not logged in");
            if (badge) badge.textContent = "Guest";
            if (btnRegister) {
                btnRegister.textContent = "Đăng nhập";
                btnRegister.onclick = loginGoogle;
            }
        }
    }
};

// --- Auth State Observer ---
onAuthStateChanged(auth, async (user) => {
    console.log("🔄 [Auth] onAuthStateChanged fired, user:", user ? user.email : "null");

    if (user) {
        let cached = localStorage.getItem('user');

        if (!cached) {
            console.log("📡 [Auth] Đồng bộ với backend...");
            try {
                const token   = await user.getIdToken();
                const baseUrl  = getBaseUrl();
                // Gửi kèm guest_id để server migrate folder nếu cần
                const guestId  = window.ClientInternal?.getExistingId() || "";
                console.log("📡 [Auth] Gọi:", `${baseUrl}/auth/login`, "| guest_id:", guestId || "(none)");

                const res = await fetch(`${baseUrl}/auth/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token, guest_id: guestId })
                });

                if (!res.ok) {
                    const errText = await res.text();
                    throw new Error(`Backend login failed (${res.status}): ${errText}`);
                }

                const data = await res.json();
                localStorage.setItem('user', JSON.stringify(data));

                // Ghi đè cookie/localStorage: thay gst_xxx bằng Google UID
                if (window.ClientInternal) {
                    window.ClientInternal.saveIdentity(data.uid);
                    console.log("🔑 [Auth] Working ID đã đổi sang:", data.uid,
                                data.migrated ? "(migrated from guest)" : "(new folder)");
                }

                console.log("✅ [Auth] Đồng bộ thành công:", data);
                AuthUI.update(data);
            } catch (e) {
                console.error("❌ [Auth] Lỗi đồng bộ server:", e);
                // Fallback: hiển thị từ Firebase nếu server lỗi
                AuthUI.update({ name: user.displayName || user.email });
            }
        } else {
            console.log("💾 [Auth] Dùng cache:", cached);
            AuthUI.update(JSON.parse(cached));
        }
    } else {
        AuthUI.update(null);
    }
});

// Gán sự kiện ban đầu cho nút bấm
const initBtn = document.querySelector('.btn-register');
if (initBtn) {
    initBtn.onclick = loginGoogle;
    console.log("🔗 [Auth] Đã gán onclick cho .btn-register");
} else {
    console.warn("⚠️ [Auth] Không tìm thấy .btn-register trong DOM");
}
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import {
    getAuth,
    signInWithRedirect,
    getRedirectResult,
    signInWithPopup,
    GoogleAuthProvider,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";

console.log("🔥 [Auth] Module loaded");

// --- Kiểm tra xem đây có phải là chế độ Xác thực hoặc Đăng xuất (An toàn không COOP) ---
const IS_AUTH_MODE = new URLSearchParams(window.location.search).has('login');
const IS_LOGOUT_MODE = new URLSearchParams(window.location.search).has('logout');

if (IS_AUTH_MODE) {
    document.body.innerHTML = `
        <div style="display:flex; flex-direction:column; justify-content:center; align-items:center; height:100vh; font-family:sans-serif; background:#f8f9fa;">
            <div style="width: 40px; height: 40px; border: 4px solid #0095ff; border-top: 4px solid transparent; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px;"></div>
            <h3 style="color:#333;">Đang đồng bộ tài khoản...</h3>
            <p style="color:#666; font-size:14px;">Hệ thống sẽ tự động chuyển hướng trong giây lát.</p>
            <style>@keyframes spin { 100% { transform: rotate(360deg); } }</style>
        </div>
    `;
} else if (IS_LOGOUT_MODE) {
    document.body.innerHTML = `
        <div style="display:flex; flex-direction:column; justify-content:center; align-items:center; height:100vh; font-family:sans-serif; background:#f8f9fa;">
            <div style="width: 40px; height: 40px; border: 4px solid #d93025; border-top: 4px solid transparent; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px;"></div>
            <h3 style="color:#333;">Đang đăng xuất an toàn...</h3>
            <style>@keyframes spin { 100% { transform: rotate(360deg); } }</style>
        </div>
    `;
}

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
// ÉP BUỘC GOOGLE LUÔN HIỂN THỊ BẢNG CHỌN TÀI KHOẢN (Tránh kẹt tài khoản cũ)
provider.setCustomParameters({ prompt: 'select_account' });

console.log("🔥 [Auth] Firebase initialized");

let resolveAuth;
window.authReady = new Promise(res => resolveAuth = res);
let isFirstAuthCheck = true;

// --- Lấy BASE_URL an toàn ---
function getBaseUrl() {
    if (window.CONFIG && window.CONFIG.BASE_URL) {
        return window.CONFIG.BASE_URL;
    }
    return window.location.origin;
}

// --- Auth Actions ---
async function loginGoogle() {
    console.log("🔐 [Auth] Chuyển sang vùng Xác thực An toàn (Không Popup)...");
    window.location.href = window.location.origin + '/?login=1';
}

async function logoutGoogle() {
    console.log("🚪 [Auth] Chuyển sang vùng Đăng xuất An toàn...");
    // Phải chuyển sang vùng không bị cô lập mới có thể Đăng xuất Firebase thành công
    window.location.href = window.location.origin + '/?logout=1';
}

// --- Expose ra window để các script khác có thể dùng ---
window.loginGoogle = loginGoogle;
window.logoutGoogle = logoutGoogle;

// Cung cấp hàm xóa identity cho hệ thống
if (window.ClientInternal) {
    window.ClientInternal.clearIdentity = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('working_id');
        document.cookie = "working_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    };
}

// --- UI Logic ---
const AuthUI = {
    update(user) {
        const btnRegister = document.querySelector('.btn-register');
        const btnLogout = document.querySelector('.btn-logout');

        if (user) {
            if (btnRegister) btnRegister.style.display = 'none';
            if (btnLogout) btnLogout.style.display = 'block';
        } else {
            if (btnRegister) {
                btnRegister.style.display = 'block';
                btnRegister.textContent = "Đăng nhập";
                btnRegister.onclick = loginGoogle;
            }
            if (btnLogout) btnLogout.style.display = 'none';
        }
    }
};

// --- Auth State Observer ---
let isSyncing = false;

// --- DÀNH CHO VÙNG XÁC THỰC AN TOÀN ---
if (IS_AUTH_MODE) {
    document.body.innerHTML = `
        <div style="display:flex; flex-direction:column; justify-content:center; align-items:center; height:100vh; font-family:sans-serif; background:#f8f9fa;">
            <h2 style="color:#333; margin-bottom: 20px;">Zestest - Xác thực An toàn</h2>
            <button id="btn-safe-login" style="padding: 14px 28px; font-size: 16px; background: #4285F4; color: white; border: none; border-radius: 8px; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 10px;">
                <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#FFF" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill-rule="evenodd" fill-opacity="1"></path></svg>
                Đăng nhập với Google
            </button>
            <p style="color:#666; font-size:13px; margin-top: 15px;">Đảm bảo kết nối ổn định 100%</p>
        </div>
    `;

    document.getElementById('btn-safe-login').onclick = async () => {
        const btn = document.getElementById('btn-safe-login');
        btn.textContent = "Đang kết nối...";
        btn.disabled = true;
        try {
            await signInWithPopup(auth, provider);
        } catch (err) {
            btn.textContent = "Thử lại";
            btn.disabled = false;
            alert("Lỗi đăng nhập: " + err.message);
        }
    };

    onAuthStateChanged(auth, async (user) => {
        if (!user || isSyncing) return;
        isSyncing = true;
        
        document.body.innerHTML = `
            <div style="display:flex; flex-direction:column; justify-content:center; align-items:center; height:100vh; font-family:sans-serif; background:#f8f9fa;">
                <div style="width: 40px; height: 40px; border: 4px solid #0095ff; border-top: 4px solid transparent; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px;"></div>
                <h3 style="color:#333;">Đang thiết lập hệ thống...</h3>
                <style>@keyframes spin { 100% { transform: rotate(360deg); } }</style>
            </div>
        `;

        try {
            const token = await user.getIdToken(true);
            const guestId = localStorage.getItem('working_id') || "";
            
            const res = await fetch(`${getBaseUrl()}/api/users/sync`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ old_id: guestId, new_id: user.uid, email: user.email, token: token })
            });
            
            if (res.ok) {
                const data = await res.json();
                const userData = data.user;
                userData.name = user.displayName || user.email;
                
                localStorage.setItem('user', JSON.stringify(userData));
                
                if (window.ClientInternal) {
                    window.ClientInternal.saveIdentity(userData.uid);
                } else {
                    localStorage.setItem('working_id', userData.uid);
                    document.cookie = "working_id=" + userData.uid + "; path=/; max-age=31536000";
                }

                window.location.href = window.location.origin + '/';
            } else {
                document.body.innerHTML = `<h3 style="color:red; text-align:center;">Lỗi Đồng Bộ Server</h3>`;
                isSyncing = false;
            }
        } catch (e) {
            document.body.innerHTML = `<h3 style="color:red; text-align:center;">Lỗi mạng: ${e.message}</h3>`;
            isSyncing = false;
        }
    });

} else if (IS_LOGOUT_MODE) {
    // --- DÀNH CHO VÙNG ĐĂNG XUẤT AN TOÀN ---
    signOut(auth).then(async () => {
        if (window.StorageManager && window.StorageManager.wipeAllData) {
            await window.StorageManager.wipeAllData();
        }
        if (window.SessionManager && window.SessionManager.clearAll) {
            window.SessionManager.clearAll();
        }
        
        localStorage.clear();
        sessionStorage.clear();
        
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i];
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        }
        
        window.location.href = window.location.origin + '/';
    }).catch(err => {
        console.error("Lỗi đăng xuất:", err);
        window.location.href = window.location.origin + '/';
    });

} else {
    // --- DÀNH CHO TRANG CHỦ ---
    const checkLocalCache = () => {
        const cached = localStorage.getItem('user');
        if (cached) {
            AuthUI.update(JSON.parse(cached));
        } else {
            AuthUI.update(null);
        }
        
        if (window.DashboardRender && typeof window.DashboardRender.render === 'function') {
            window.DashboardRender.render();
            if (window.DashboardManager) {
                window.DashboardManager.refreshQuota();
                if (typeof window.DashboardManager.checkFinalStatus === 'function') {
                    window.DashboardManager.checkFinalStatus();
                }
            }
        }
        
        if (isFirstAuthCheck) {
            isFirstAuthCheck = false;
            resolveAuth(cached ? JSON.parse(cached) : null);
        }
    };

    checkLocalCache();
}

const initBtn = document.querySelector('.btn-register');
if (initBtn && !IS_AUTH_MODE && !IS_LOGOUT_MODE) {
    const cached = localStorage.getItem('user');
    initBtn.onclick = cached ? logoutGoogle : loginGoogle;
}
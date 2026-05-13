/**
 * FILE: security_student.js
 * Nhiệm vụ: Bảo mật phòng thi, chống gian lận (Full-screen, Chặn phím tắt, Chống chuyển tab)
 */

const SecurityManager = {
    warningCount: 0,
    maxWarnings: 3,
    isFullscreen: false,
    isActive: false,

    init() {
        console.log("🛡️ SecurityManager: Đang thiết lập hệ thống bảo mật...");
        this.bindEvents();
    },

    activate() {
        this.isActive = true;
        
        // PHỤC HỒI: Kiểm tra xem đã có số lần vi phạm cũ chưa (trường hợp F5)
        if (window.SessionManager) {
            this.warningCount = SessionManager.getWarnCount();
        } else {
            this.warningCount = 0;
        }

        window.warningCount = this.warningCount;
        const warnDisplay = document.getElementById('warn-count');
        if (warnDisplay) warnDisplay.innerText = this.warningCount;
        
        console.log(`🛡️ SecurityManager: Hệ thống ĐÃ KÍCH HOẠT. (Cảnh báo hiện tại: ${this.warningCount})`);
    },

    bindEvents() {
        // 1. Chặn chuột phải
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            // console.warn("🛡️ Chuột phải bị vô hiệu hóa để bảo mật.");
        });

        // 2. Chặn phím tắt
        document.addEventListener('keydown', (e) => {
            // Chặn F12
            if (e.key === 'F12') {
                this.prevent(e);
            }
            // Chặn Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (DevTools)
            if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) {
                this.prevent(e);
            }
            // Chặn Ctrl+U (View Source)
            if (e.ctrlKey && e.key === 'u') {
                this.prevent(e);
            }
            // Chặn Ctrl+S (Save Page)
            if (e.ctrlKey && e.key === 's') {
                this.prevent(e);
            }
            // Chặn Ctrl+P (Print)
            if (e.ctrlKey && e.key === 'p') {
                this.prevent(e);
            }
        });

        // 3. Theo dõi chuyển Tab / Rời trình duyệt
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.handleViolation("Rời khỏi trang thi");
            }
        });

        window.addEventListener('blur', () => {
            this.handleViolation("Rời khỏi cửa sổ trình duyệt");
        });
    },

    prevent(e) {
        e.preventDefault();
        e.stopPropagation();
        // console.warn("🛡️ Hành động bị chặn do chính sách bảo mật phòng thi.");
    },

    /**
     * Ép chế độ toàn màn hình
     * Phải được gọi từ một sự kiện Click của người dùng
     */
    async requestFullscreen() {
        try {
            const elem = document.documentElement;
            if (elem.requestFullscreen) {
                await elem.requestFullscreen();
            } else if (elem.webkitRequestFullscreen) { /* Safari */
                await elem.webkitRequestFullscreen();
            } else if (elem.msRequestFullscreen) { /* IE11 */
                await elem.msRequestFullscreen();
            }
            this.isFullscreen = true;
            console.log("🛡️ Đã vào chế độ Toàn màn hình.");
        } catch (err) {
            console.warn("🛡️ Không thể kích hoạt toàn màn hình:", err);
        }
    },

    handleViolation(reason) {
        // 1. Chỉ ghi nhận khi hệ thống đã kích hoạt và đang ở trang Quiz
        if (!this.isActive) return;
        
        // 2. Chặn vòng lặp: Nếu đang hiện Modal cảnh báo rồi thì không làm gì thêm
        const modal = document.getElementById('securityModal');
        if (modal && modal.style.display === 'flex') return;

        const quizPage = document.getElementById('page-quiz');
        if (!quizPage || quizPage.style.display === 'none') return;

        this.warningCount++;
        console.warn(`🛡️ Cảnh báo vi phạm (${this.warningCount}): ${reason}`);

        // 3. Hiển thị Modal tùy chỉnh (Thay cho alert để không mất focus vòng lặp)
        if (modal) {
            const msgElem = document.getElementById('security-msg');
            if (msgElem) {
                const t = (typeof I18n !== 'undefined') ? (k) => I18n.t(k) : (k) => k;
                msgElem.innerText = `${t('stu_violation_msg')}${reason}${t('stu_violation_suffix')}`;
            }
            modal.style.display = 'flex';
        }

        // 4. Cập nhật số lần vi phạm lên Header
        const warnDisplay = document.getElementById('warn-count');
        if (warnDisplay) warnDisplay.innerText = this.warningCount;

        // 5. LƯU TRỮ: Dùng SessionManager để không bị mất khi F5
        window.warningCount = this.warningCount;
        if (window.SessionManager) {
            SessionManager.setWarnCount(this.warningCount);
        }
    },

    closeViolationModal() {
        const modal = document.getElementById('securityModal');
        if (modal) modal.style.display = 'none';
        
        // Buộc quay lại Fullscreen
        this.requestFullscreen();
    },

    deactivate() {
        this.isActive = false;
        console.log("🛡️ SecurityManager: Hệ thống giám sát ĐÃ TẠM DỪNG.");
    }
};

// Khởi tạo ngay
SecurityManager.init();
window.SecurityManager = SecurityManager;

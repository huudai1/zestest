/**
 * FILE: js/dashboard/dashboard_manager.js
 * Quản lý chính (Orchestrator) logic dashboard
 */
window.DashboardManager = {

    // 0. KHỞI TẠO DASHBOARD
    async init() {
        console.log("--- DASHBOARD MANAGER INIT ---");
        try {
            await this.refreshQuota(); // Đồng bộ Quota Bar ngay khi vào
            await this.loadExams();    // Tải và hiển thị danh sách đề thi
            
            this.initSearch(); // Khởi tạo thanh tìm kiếm
            
            if (window.UploadHandler) UploadHandler.initUploadZone();
            if (window.ReferralManager) ReferralManager.handleReferralFlow();
            
            this.checkFinalStatus();
        } catch (e) {
            console.error("Lỗi init dashboard:", e);
        }
    },

    initSearch() {
        const searchBar = document.getElementById('exam-search-bar');
        if (searchBar) {
            searchBar.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }
    },

    handleSearch(query) {
        if (!this.cachedExams) return;
        
        const q = query.toLowerCase().trim();
        const filtered = this.cachedExams.filter(exam => {
            const name = (exam.name || "").toLowerCase();
            // Nếu có ID dạng __Name thì cũng tìm theo Name
            let idName = "";
            if (exam.id.includes('__')) {
                idName = exam.id.split('__')[1].replace(/_/g, ' ').toLowerCase();
            }
            return name.includes(q) || idName.includes(q);
        });

        if (window.DashboardRender) {
            DashboardRender.renderExamList(filtered);
        }
    },

    // 1. TẢI DỮ LIỆU
    async loadExams() {
        console.log("📂 [Dashboard] Đang tải danh sách đề thi...");
        const userId = IdentityManager.getUserId();
        if (!userId) return;

        try {
            const base = (window.CONFIG && window.CONFIG.BASE_URL) ? window.CONFIG.BASE_URL : "";
            const response = await fetch(`${base}/api/exams`, {
                headers: { 'X-User-ID': userId }
            });
            const data = await response.json();
            
            if (data.success && window.DashboardRender) {
                this.cachedExams = data.exams || [];
                
                // Re-apply search if exists
                const searchBar = document.getElementById('exam-search-bar');
                const query = searchBar ? searchBar.value : "";
                if (query) {
                    this.handleSearch(query);
                } else {
                    DashboardRender.renderExamList(this.cachedExams);
                }
            } else {
                this.cachedExams = [];
                console.warn("⚠️ Không thể tải danh sách đề:", data.message || "Unknown error");
                if (window.DashboardRender) DashboardRender.renderEmptyState(document.getElementById('exam-container'));
            }
        } catch (err) {
            console.error("❌ Lỗi kết nối server khi tải đề:", err);
        }
    },

    async refreshQuota() {
        const userId = IdentityManager.getUserId();
        if (!userId) return;

        try {
            const checkRaw = await SendRQ(userId, 'CHECK_TURN');
            const checkRes = Receiver.processResponse(checkRaw);
            if (checkRes.success && checkRes.data) {
                const data = checkRes.data;
                if (window.DashboardRender) DashboardRender.updateQuotaUI(data);
                IdentityManager.setTier(data.tier);
            }
        } catch (err) {
            console.error("❌ Lỗi đồng bộ Quota:", err);
        }
    },

    // 2. THAO TÁC VỚI ĐỀ THI
    async downloadExam(url, name, btn) {
        if (!btn) return;
        const originalText = btn.innerText;
        btn.innerText = "⏳...";
        btn.disabled = true;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Không thể tải file từ server");
            
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            
            let fileName = name;
            if (!fileName.toLowerCase().endsWith('.zestest')) {
                fileName += '.zestest';
            }
            
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(downloadUrl);
            a.remove();
            
            btn.innerText = "✅";
        } catch (err) {
            console.error("❌ Lỗi tải đề:", err);
            alert("Lỗi khi tải đề thi. Vui lòng thử lại sau.");
            btn.innerText = "❌";
        } finally {
            setTimeout(() => {
                btn.innerText = originalText;
                btn.disabled = false;
            }, 2000);
        }
    },

    async deleteExam(examId) {
        if (!confirm("Bạn có chắc chắn muốn xóa đề thi này? Hành động này không thể hoàn tác.")) return;

        const userId = IdentityManager.getUserId();
        try {
            const base = (window.CONFIG && window.CONFIG.BASE_URL) ? window.CONFIG.BASE_URL : "";
            const response = await fetch(`${base}/api/exams/${examId}`, {
                method: 'DELETE',
                headers: { 'X-User-ID': userId }
            });
            const data = await response.json();
            
            if (data.success) {
                await this.loadExams();
                await this.refreshQuota();
            } else {
                alert("Lỗi khi xóa đề: " + (data.message || "Không rõ nguyên nhân"));
            }
        } catch (err) {
            console.error("❌ Lỗi xóa đề:", err);
            alert("Lỗi kết nối khi xóa đề thi.");
        }
    },

    // 3. TRẠNG THÁI HOÀN THÀNH (Sau khi tạo xong)
    async checkFinalStatus() {
        const isSuccess = localStorage.getItem('zestest_last_status') === 'success';
        if (isSuccess) {
            const data = await StorageManager.loadMeta();
            if (data && window.DashboardUI) {
                DashboardUI.showSuccessModal(data);
                localStorage.removeItem('zestest_last_status');
            }
        }
    },

    // 4. ĐIỀU HƯỚNG
    logout() {
        if (typeof window.logoutGoogle === 'function') {
            window.logoutGoogle();
        } else {
            localStorage.clear();
            window.location.href = '/';
        }
    },

    // 5. CÁC HÀM BRIDGE (Để HTML cũ vẫn gọi được)
    toggleContactModal() {
        const modal = document.getElementById('contactModal');
        if (modal) {
            const isVisible = modal.style.display === 'flex';
            modal.style.display = isVisible ? 'none' : 'flex';
        }
    },

    toggleGiftKeyModal() {
        const modal = document.getElementById('giftKeyModal');
        if (modal) {
            const isVisible = modal.style.display === 'flex';
            modal.style.display = isVisible ? 'none' : 'flex';
            if (!isVisible) {
                const input = document.getElementById('gift-key-input');
                if (input) input.focus();
                
                const pendingRef = localStorage.getItem('pending_ref');
                if (pendingRef && input) input.value = pendingRef;
            }
        }
    },

    // Bridge methods for legacy HTML calls
    copyReferralCode() { if (window.ReferralManager) ReferralManager.copyReferralCode(); },
    redeemGiftKey() { if (window.ReferralManager) ReferralManager.redeemGiftKey(); },
    showPremiumModal() { if (window.DashboardUI) DashboardUI.showPremiumModal(); },
    goToCreate() { if (window.ExamWizardLogic) ExamWizardLogic.goToCreate(); }
};

// EXPOSE GLOBAL CHO HTML
window.toggleContactModal = () => DashboardManager.toggleContactModal();
window.toggleGiftKeyModal = () => DashboardManager.toggleGiftKeyModal();
window.redeemGiftKey = () => window.ReferralManager?.redeemGiftKey();
window.copyReferralCode = () => window.ReferralManager?.copyReferralCode();
window.goToCreate = () => window.ExamWizardLogic?.goToCreate();
window.closeModal = () => window.DashboardUI?.closeModal();
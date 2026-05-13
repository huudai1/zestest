/**
 * FILE: js/dashboard/exam_wizard_logic.js
 * Quản lý logic điều hướng và khởi tạo quy trình tạo đề mới
 */
window.ExamWizardLogic = {
    async goToCreate() {
        const btnCreate = document.querySelector('.btn-create');
        const originalText = btnCreate ? btnCreate.innerText : "Create";

        if (typeof SessionManager !== 'undefined') {
            SessionManager.clearAll();
        }

        if (btnCreate) {
            btnCreate.disabled = true;
            btnCreate.innerText = "⏳ Checking...";
        }

        try {
            const userId = ClientInternal.getExistingId();
            const checkRaw = await SendRQ(userId, "CREATE_QUIZ", { check_only: true });
            const checkRes = Receiver.processResponse(checkRaw);

            if (!checkRes.success) {
                DashboardUI.showQuotaModal(checkRes.message);
                return;
            }

            const data = await StorageManager.loadMeta();
            if (data && data.status === "processing") {
                const confirmContinue = confirm("Hệ thống thấy bạn đang có một đề làm dở. Bạn có muốn TIẾP TỤC không?\n(Nếu chọn Hủy, đề đang làm dở sẽ bị xóa sạch)");
                if (confirmContinue) {
                    this.switchToCreatePage();
                    return;
                }
            }

            const newExamId = checkRes.data?.exam_id || `Zest_${Date.now()}`;
            if (window.SessionManager) {
                SessionManager.setExamId(newExamId);
            }

            await this.forceClearAndStartNew();

        } catch (err) {
            console.error("Lỗi khởi tạo:", err);
            alert("Lỗi kết nối Server. Vui lòng thử lại!");
        } finally {
            if (btnCreate) {
                btnCreate.disabled = false;
                btnCreate.innerText = originalText;
            }
        }
    },

    async forceClearAndStartNew() {
        await StorageManager.clearAll();
        if (typeof SessionManager !== 'undefined') {
            SessionManager.clearSession();
            SessionManager.clearModalDraft();
        }
        if (typeof Step1Handler !== 'undefined') {
            Step1Handler.clearAll();
        }
        StorageManager.createNewExamData();
        this.switchToCreatePage();
    },

    switchToCreatePage() {
        if (typeof showPage === 'function') {
            showPage('create-steps-page');
        } else {
            const dashboard = document.getElementById('dashboard-page');
            const createPage = document.getElementById('create-steps-page');
            if (dashboard) dashboard.style.display = 'none';
            if (createPage) createPage.style.display = 'grid';
        }

        document.querySelectorAll('.step-page').forEach(p => p.classList.remove('active'));
        const step1 = document.getElementById('step1');
        if (step1) step1.classList.add('active');

        window.scrollTo(0, 0);
    }
};

/**
 * FILE: js/session_manager.js
 */
const SessionManager = {
    KEYS: {
        STEP: "zest_current_step",
        MODAL: "zest_active_modal"
    },

    setStep(step) {
        localStorage.setItem(this.KEYS.STEP, step);
    },

    getStep() {
        return parseInt(localStorage.getItem(this.KEYS.STEP)) || 1;
    },

    // Lưu ID của modal đang mở (ví dụ: 'typeSelectionModal')
    setActiveModal(modalId) {
        localStorage.setItem(this.KEYS.MODAL, modalId || "");
    },

    getActiveModal() {
        return localStorage.getItem(this.KEYS.MODAL);
    },

    clearSession() {
        localStorage.removeItem(this.KEYS.STEP);
        localStorage.removeItem(this.KEYS.MODAL);
    },

    getModalDraft() {
        const data = localStorage.getItem("zest_modal_draft");
        return data ? JSON.parse(data) : null;
    },
    
    clearModalDraft() {
        localStorage.removeItem("zest_modal_draft");
    },

    // Quản lý ID Đề thi hiện tại (Dành cho Giáo viên)
    setExamId(id) {
        sessionStorage.setItem("zest_current_exam_id", id || "");
    },

    getExamId() {
        return sessionStorage.getItem("zest_current_exam_id");
    },

    // Hàm tổng quát xóa sạch session
    clearAll() {
        this.clearSession();
        this.clearModalDraft();
        sessionStorage.removeItem("zest_current_exam_id");
        sessionStorage.removeItem("zest_warn_count");
    },

    // Quản lý số lần vi phạm (Học sinh)
    setWarnCount(count) {
        sessionStorage.setItem("zest_warn_count", count);
    },
    getWarnCount() {
        return parseInt(sessionStorage.getItem("zest_warn_count")) || 0;
    }
};
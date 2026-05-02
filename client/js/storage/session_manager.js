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
    // Thêm vào SessionManager
saveModalDraft(data) {
    localStorage.setItem("zest_modal_draft", JSON.stringify(data));
},
getModalDraft() {
    const data = localStorage.getItem("zest_modal_draft");
    return data ? JSON.parse(data) : null;
},
clearModalDraft() {
    localStorage.removeItem("zest_modal_draft");
}
};
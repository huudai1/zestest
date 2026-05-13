/**
 * FILE: summary_manager.js
 * Nhiệm vụ: Hiển thị kết quả sau khi nộp bài
 */

const SummaryManager = {
    render() {
        const raw = sessionStorage.getItem("zestest_result");
        if (!raw) return;

        const results = JSON.parse(raw);

        // Đổ dữ liệu vào UI
        const t = (typeof I18n !== 'undefined') ? (k) => I18n.t(k) : (k) => k;
        document.getElementById('summary-total').innerText = `${t('stu_label_total')}: ${results.total}`;
        document.getElementById('summary-correct').innerText = `${t('stu_label_correct')}: ${results.correct}`;
        document.getElementById('summary-warn').innerText = `${t('stu_label_warn')}: ${results.warn}`;
        document.getElementById('summary-score').innerText = results.score;
    },

    viewDetails() {
        // Chuyển sang trang chi tiết (nếu có)
        if (window.DetailManager && typeof window.DetailManager.render === 'function') {
            window.DetailManager.render();
            showPage('page-detail');
        } else {
            alert(typeof I18n !== 'undefined' ? I18n.t('stu_alert_dev_detail') : 'Detailed review is under development.');
        }
    }
};

window.SummaryManager = SummaryManager;

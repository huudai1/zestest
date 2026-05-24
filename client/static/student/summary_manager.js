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
        document.getElementById('summary-total').innerText = results.total;
        document.getElementById('summary-correct').innerText = results.correct;
        document.getElementById('summary-warn').innerText = results.warn;
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

/**
 * FILE: submit_handler.js
 * Nhiệm vụ: Chấm điểm và chuyển hướng kết quả
 */

const SubmitHandler = {
    calculate() {
        const data = StorageManager.examData;
        if (!data || !data.finalAnswers || !data.stu_answer) {
            return { correct: 0, total: 0, score: "0.0", warn: 0 };
        }

        const final = data.finalAnswers; 
        const student = data.stu_answer;
        const total = data.totalQuestions || 0;

        let correct = 0;
        for (let i = 1; i <= total; i++) {
            if (student[i] && final[i]) {
                if (String(student[i]).trim().toUpperCase() === String(final[i]).trim().toUpperCase()) {
                    correct++;
                }
            }
        }

        return {
            correct: correct,
            total: total,
            score: total > 0 ? ((correct / total) * 10).toFixed(1) : "0.0",
            warn: (window.SessionManager ? SessionManager.getWarnCount() : (window.warningCount || 0))
        };
    },

    handleSubmission() {
        // Mở Modal xác nhận nộp bài (thay cho confirm)
        const modal = document.getElementById('submitConfirmModal');
        if (modal) modal.style.display = 'flex';
    },

    closeConfirm() {
        const modal = document.getElementById('submitConfirmModal');
        if (modal) modal.style.display = 'none';
    },

    async confirmSubmission() {
        this.closeConfirm();
        
        // TẮT AUDIO NẾU ĐANG PHÁT
        if (window.AudioController && typeof window.AudioController.collapse === 'function') {
            AudioController.collapse();
        }

        // TẠM DỪNG BẢO MẬT: Để không bị detect rời trang khi chuyển Summary
        if (window.SecurityManager) {
            SecurityManager.deactivate();
        }

        const results = this.calculate();
        
        // Cất kết quả vào sessionStorage để hiển thị ở Summary page
        sessionStorage.setItem("zestest_result", JSON.stringify(results));
        
        // Báo cáo NỘP BÀI cho Giáo viên qua WebSocket
        if (window.examWs && window.examWs.readyState === WebSocket.OPEN) {
            window.examWs.send(JSON.stringify({
                type: 'STUDENT_UPDATE',
                student: { 
                    id: window.studentId, 
                    name: sessionStorage.getItem('stu_name'), 
                    progress: `${typeof I18n !== 'undefined' ? I18n.t('stu_btn_submit') : 'Nộp'} (${results.score}đ)`,
                    status: 'submitted'
                }
            }));
            setTimeout(() => { window.examWs.close(); }, 1000);
        }

        // LƯU KẾT QUẢ VÀO DATABASE (D1)
        const params = new URLSearchParams(window.location.search);
        const examId = params.get('exam');
        
        if (examId) {
            const apiBase = (window.location.hostname === 'zestest.com' || window.location.hostname === 'localhost') ? '' : 'https://zestest.com';
            
            try {
                const res = await fetch(`${apiBase}/api/exam/submit`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        exam_id: examId,
                        student_name: sessionStorage.getItem('stu_name'),
                        score: parseFloat(results.score),
                        total_correct: results.correct,
                        total_questions: results.total,
                        warning_count: results.warn || 0,
                        answers: StorageManager.examData.stu_answer
                    })
                });

                const data = await res.json();
                
                if (data.success) {
                    console.log("✅ Nộp bài thành công. Đang lưu trạng thái...");
                    // CHỈ ĐÁNH DẤU, KHÔNG XÓA HẾT ẢNH
                    if (window.StorageManager) {
                        StorageManager.examData.isSubmitted = true;
                        await StorageManager.saveMeta();
                    }
                } else {
                    if (data.message === 'SUBMIT_LATE') {
                        alert(typeof I18n !== 'undefined' ? I18n.t('stu_alert_submit_late') : '⚠️ BẠN ĐÃ NỘP MUỘN');
                    } else {
                        alert((typeof I18n !== 'undefined' ? I18n.t('stu_alert_submit_err') : '⚠️ Lỗi nộp bài: ') + (data.message || (typeof I18n !== 'undefined' ? I18n.t('yes') : 'Không xác định')));
                    }
                    // KHÔNG XÓA DATA KHI LỖI để học sinh còn giữ bằng chứng
                }
            } catch (err) {
                console.error("Lưu kết quả thất bại:", err);
                alert(typeof I18n !== 'undefined' ? I18n.t('stu_alert_no_network') : '⚠️ Không thể kết nối máy chủ.');
                // KHÔNG XÓA DATA KHI MẤT MẠNG
            }
        }

        // Chuyển trang (Vẫn chuyển trang để học sinh thấy điểm của mình từ sessionStorage)
        if (window.SummaryManager && typeof window.SummaryManager.render === 'function') {
            window.SummaryManager.render();
            if (typeof window.showPage === 'function') {
                window.showPage('page-summary');
            }
        } else {
            console.error("SummaryManager not found!");
            alert((typeof I18n !== 'undefined' ? I18n.t('stu_alert_done_score') : 'Điểm của bạn: ') + results.score);
        }
    }
};

window.SubmitHandler = SubmitHandler;
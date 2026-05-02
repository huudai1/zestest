/**
 * FILE: submit_handler.js
 * Nhiệm vụ: Chấm điểm và chuyển hướng kết quả
 */

const SubmitHandler = {
    // Không cần hàm init() phức tạp nữa, tí nữa mình gán thẳng vào button
    
    calculate() {
        const final = StorageManager.examData.finalAnswers; 
        const student = StorageManager.examData.stu_answer;
        const total = StorageManager.examData.totalQuestions;

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
            score: ((correct / total) * 10).toFixed(1),
            warn: window.warningCount || 0 // Đảm bảo ông có biến này để đếm thoát tab
        };
    },

    async handleSubmission() {
        // Confirm cho chắc vì nộp là hết sửa
        if (!confirm("Bạn có chắc chắn muốn nộp bài?")) return;

        const results = this.calculate();
        
        // Cất kết quả vào sessionStorage
        sessionStorage.setItem("zestest_result", JSON.stringify(results));

        // Lưu bản cuối vào DB
        await StorageManager.saveMeta();

        // Chuyển trang
        SummaryManager.render(); // đổ data vào trước
        showPage('page-summary');
    }
};
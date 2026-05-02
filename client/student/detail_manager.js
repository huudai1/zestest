/**
 * FILE: detail_manager.js
 * Nhiệm vụ: Quản lý Modal danh sách câu hỏi
 */
var DetailManager = {
    openModal() {
        const modal = document.getElementById('gridModal');
        const grid = document.getElementById('questionGrid');
        if (!modal || !grid) return console.error("Thiếu HTML cho Grid Modal");

        this.renderGrid(grid);
        modal.style.display = 'flex';
    },

    async renderQuestion(index) {
        console.log("Xem chi tiết câu: " + index);
        
        // Cập nhật số câu hiển thị trên UI
        const qNumView = document.getElementById('d-qnum');
        if (qNumView) qNumView.innerText = index;

        // Tự động load ảnh WebP vào vùng xem chi tiết (isDetail = true)
        if (typeof RenderManager !== 'undefined') {
            await RenderManager.initView(true); 
        }
        
        this.renderInteraction(index);
    },

    closeModal() {
        const modal = document.getElementById('gridModal');
        if (modal) modal.style.display = 'none';
    },

    renderGrid(container) {
        container.innerHTML = '';
        const data = StorageManager.examData;
        const total = data.totalQuestions || 0;
        const student = data.stu_answer || {};
        const final = data.finalAnswers || {};

        for (let i = 1; i <= total; i++) {
            const item = document.createElement('div');
            item.className = 'grid-item';
            
            // Logic hiển thị trạng thái: Đã làm / Đúng / Sai
            // Nếu là trang xem kết quả (Summary) thì hiện đúng sai, trang đang làm thì hiện đã làm
            const isAnswered = student[i] && student[i].trim() !== "";
            
            if (isAnswered) {
                item.classList.add('done');
                // Nếu muốn hiện đúng/sai (khi đã nộp bài)
                if (final[i]) {
                    const isCorrect = String(student[i]).toUpperCase() === String(final[i]).toUpperCase();
                    item.classList.add(isCorrect ? 'correct' : 'wrong');
                    item.innerHTML = `${i}<i>${isCorrect ? '✓' : '✕'}</i>`;
                } else {
                    item.innerHTML = i;
                }
            } else {
                item.classList.add('empty');
                item.innerHTML = `${i}<i>!</i>`;
            }

            item.onclick = () => {
                this.jumpToQuestion(i);
                this.closeModal();
            };
            container.appendChild(item);
        }
    },

jumpToQuestion(index) {
        if (typeof QuizController !== 'undefined') {
            if (QuizController.swiper) {
                QuizController.swiper.slideTo(index - 1);
            } else if (QuizController.renderQuestion) {
                QuizController.renderQuestion(index);
            }
        }
        // Nếu đang ở trang xem chi tiết kết quả thì gọi render lại
        if (document.getElementById('page-detail').style.display === 'block') {
            this.renderQuestion(index);
        }
    },

renderInteraction(index) {
        const stuBox = document.getElementById('d-stu-answers');
        const correctBox = document.getElementById('d-correct-answers');
        if (!stuBox || !correctBox) return;

        const data = StorageManager.examData;
        const stuAns = data.stu_answer[index] || " ";
        const correctAns = data.finalAnswers[index] || " ";

        // Render vòng tròn đáp án (Thêm class correct/wrong để đổi màu)
        const isCorrect = String(stuAns).toUpperCase() === String(correctAns).toUpperCase();
        
        stuBox.innerHTML = `<div class="opt-circle ${isCorrect ? 'correct' : 'wrong'}">${stuAns}</div>`;
        correctBox.innerHTML = `<div class="opt-circle correct">${correctAns}</div>`;
    }
};

// Đóng modal khi click ra ngoài
window.onclick = function(event) {
    const modal = document.getElementById('gridModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
};
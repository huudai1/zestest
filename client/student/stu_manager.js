const StuManager = {
    flags: new Set(),

    // Truyền qNum tùy chọn. Nếu không truyền (như lúc bấm trên mobile header), lấy currentQuestion
    toggleFlag(qNum) {
        const targetQ = qNum || QuizController.currentQuestion;

        if (this.flags.has(targetQ)) {
            this.flags.delete(targetQ);
        } else {
            this.flags.add(targetQ);
        }
        
        // Cập nhật lại màu sắc cho các nút
        this.syncFlagUI(targetQ);
    },

syncFlagUI(qNum) {
        const isFlagged = this.flags.has(qNum);

        // 1. Cập nhật nút trên Header (Mobile)
        if (qNum === QuizController.currentQuestion) {
            const headerBtn = document.getElementById('btn-flag');
            if (headerBtn) {
                headerBtn.style.opacity = isFlagged ? '1' : '0.5';
            }
        }

        // 2. Cập nhật nút nhỏ tại Sidebar (PC)
        const localBtn = document.getElementById(`local-flag-${qNum}`);
        if (localBtn) {
            if (isFlagged) {
                localBtn.classList.add('active');
            } else {
                localBtn.classList.remove('active');
            }
        }

        // 3. Đổi màu "vàng hẳn" cho Block trên PC
        const pcBlock = document.querySelector(`.pc-question-block[data-qindex="${qNum}"]`);
        if (pcBlock) {
            if (isFlagged) {
                pcBlock.classList.add('flagged-block');
            } else {
                pcBlock.classList.remove('flagged-block');
            }
        }

        // 4. THÊM MỚI: Đổi màu "vàng khè" cho Slide chứa đáp án ABCD (Mobile)
        const swiperSlide = document.querySelector(`.swiper-slide[data-qindex="${qNum}"]`);
        if (swiperSlide) {
            if (isFlagged) {
                swiperSlide.classList.add('flagged-slide');
            } else {
                swiperSlide.classList.remove('flagged-slide');
            }
        }
    },

    openModal() {
        const modal = document.getElementById('gridModal');
        const grid = document.getElementById('questionGrid');
        if (!modal || !grid) return;

        const total = QuizController.totalQuestions;
        const stuAnswers = StorageManager.examData.stu_answer || [];
        
        let html = '';
        for (let i = 1; i <= total; i++) {
            const hasValue = stuAnswers[i] && stuAnswers[i].trim() !== "";
            const isFlagged = this.flags.has(i);

            // Ưu tiên màu vàng nếu có nghi vấn, sau đó mới đến xanh lá
            let statusClass = 'pending';
            if (isFlagged) {
                statusClass = 'flagging';
            } else if (hasValue) {
                statusClass = 'done';
            }

            html += `
                <div class="grid-item ${statusClass}" onclick="StuManager.goToQuestion(${i})">
                    ${i}
                </div>`;
        }

        grid.innerHTML = html;
        modal.style.display = 'flex';
    },

    closeModal() {
        document.getElementById('gridModal').style.display = 'none';
    },

    goToQuestion(qNum) {
        if (QuizController.isPC) {
            const block = document.querySelector(`.pc-question-block[data-qindex="${qNum}"]`);
            if (block) block.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (QuizController.swiper) {
            QuizController.swiper.slideTo(qNum - 1);
        }
        this.closeModal();
    }
};

// Cập nhật lại UI nút flag mỗi khi chuyển câu
// Thêm dòng này vào cuối hàm updateUI(qNum) trong QuizController:
// if (typeof StuManager !== 'undefined') {
//    document.getElementById('btn-flag').style.opacity = StuManager.flags.has(qNum) ? '1' : '0.5';
// }
/**
 * FILE: detail_manager.js
 * Nhiệm vụ: Hiển thị chi tiết từng câu hỏi (Đáp án học sinh vs Đáp án đúng)
 */

const DetailManager = {
    currentIndex: 1,

    async render() {
        console.log("DetailManager: Khởi tạo trang chi tiết...");
        
        // 1. Nạp ảnh WebP vào viewer-window
        if (typeof RenderManager !== 'undefined') {
            // Sửa selector trong RenderManager hoặc đổi HTML cho khớp
            // Ở đây ta gọi initView với isDetail = true
            await RenderManager.initView(true);
        }

        // 2. Bắt đầu hiển thị từ câu 1
        this.renderQuestion(1);
    },

    renderQuestion(index) {
        this.currentIndex = index;
        const data = StorageManager.examData;
        const total = data.totalQuestions || 0;

        if (index < 1 || index > total) return;

        // Cập nhật số câu
        const qInfo = document.getElementById('detail-q-info');
        if (qInfo) qInfo.innerText = `Q: ${index} / ${total}`;

        // Cập nhật bảng tương tác (ABCD / TF / Essay)
        this.renderInteraction(index);

        // Cuộn viewer đến đúng trang ảnh (nếu cần - hiện tại PhotoSwipe xử lý zoom)
        // Nếu Captain muốn tự động cuộn ảnh, ta có thể thêm logic ở đây
    },

    renderInteraction(index) {
        const data = StorageManager.examData;
        const stuAns = (data.stu_answer[index] || "").trim().toUpperCase();
        const finalAns = (data.finalAnswers[index] || "").trim().toUpperCase();

        // 1. Xác định loại câu hỏi (Dựa vào đáp án mẫu)
        const isTF = (finalAns === "TRUE" || finalAns === "FALSE");
        const isEssay = (finalAns.length > 1 && !isTF); // Tạm coi là tự luận nếu đáp án dài

        const choiceSection = document.getElementById('detail-choice-section');
        const tfSection = document.getElementById('detail-tf-section');
        const essaySection = document.getElementById('detail-essay-section');

        // Ẩn tất cả trước
        [choiceSection, tfSection, essaySection].forEach(s => { if(s) s.style.display = 'none'; });

        if (isEssay) {
            if (essaySection) {
                essaySection.style.display = 'block';
                document.getElementById('detail-essay-content').innerText = finalAns;
            }
        } else if (isTF) {
            if (tfSection) {
                tfSection.style.display = 'flex';
                const stuBox = document.getElementById('detail-tf-stu');
                const finalBox = document.getElementById('detail-tf-final');
                
                const t = (typeof I18n !== 'undefined') ? (k) => I18n.t(k) : (k) => k;
                stuBox.innerText = `${t('stu_tf_you')}: ${stuAns || "N/A"}`;
                finalBox.innerText = `${t('stu_tf_answer')}: ${finalAns}`;
                
                stuBox.className = `tf-box ${stuAns === finalAns ? 'correct' : 'wrong'}`;
            }
        } else {
            // Trắc nghiệm ABCD
            if (choiceSection) {
                choiceSection.style.display = 'block';
                this.highlightOptions('detail-stu-options', stuAns, finalAns, true);
                this.highlightOptions('detail-final-options', finalAns, finalAns, false);
            }
        }
    },

    highlightOptions(containerId, selected, correct, isStudent) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const boxes = container.querySelectorAll('.opt-box');
        boxes.forEach(box => {
            const opt = box.getAttribute('data-opt');
            box.style.opacity = "0.3";
            box.style.border = "none";
            box.style.boxShadow = "none";

            if (opt === selected) {
                box.style.opacity = "1";
                if (isStudent) {
                    // Nếu học sinh chọn: Đúng thì xanh, sai thì đỏ
                    box.style.background = (selected === correct) ? "#2e7d32" : "#c62828";
                    box.style.boxShadow = "0 0 10px " + ((selected === correct) ? "#2e7d32" : "#c62828");
                } else {
                    // Dòng đáp án đúng: Luôn xanh
                    box.style.background = "#2e7d32";
                }
            } else {
                // Reset màu mặc định cho các nút không chọn
                box.style.background = "#333";
            }
        });
    },

    openModal() {
        const modal = document.getElementById('gridModal');
        const grid = document.getElementById('questionGrid');
        if (modal && grid) {
            this.renderGrid(grid);
            modal.style.display = 'flex';
        }
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
            
            const stuAns = (student[i] || "").trim().toUpperCase();
            const finalAns = (final[i] || "").trim().toUpperCase();
            const isAnswered = stuAns !== "";
            const isCorrect = stuAns === finalAns;

            if (!isAnswered) {
                item.classList.add('empty');
                item.innerHTML = `${i}<i>!</i>`;
            } else {
                item.classList.add(isCorrect ? 'correct' : 'wrong');
                item.innerHTML = `${i}<i>${isCorrect ? '✓' : '✕'}</i>`;
            }

            item.onclick = () => {
                this.renderQuestion(i);
                this.closeModal();
            };
            container.appendChild(item);
        }
    }
};

window.DetailManager = DetailManager;
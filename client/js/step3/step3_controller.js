const ABCD_Controller = {
    editingInfo: { qNum: null, type: null },

    /**
     * Khi bấm vào 1 câu ở Step 3: Nạp dữ liệu vào generalModal của Step 2
     */
    quickEdit: function(qNum, type, currentVal) {
        this.editingInfo = { qNum, type };

        // 1. Tạo nội dung sửa (Sử dụng style answer-row của Step 2)
        const contentHtml = `
            <div class="answer-row" style="border-bottom: none; justify-content: center;">
                <div class="input-wrapper" style="width: 100%;">
                    ${Step2ModalLogic.getAnswerInputHtml(type, qNum, currentVal)}
                </div>
            </div>`;

        // 2. Tạo Footer dùng style nút của Step 2
        const footerHtml = `
            <button class="btn-cancel" onclick="closeQuickModal()">Hủy</button>
            <button class="btn-done" onclick="saveQuickData('${type}')">Cập nhật</button>`;

        // 3. Gọi hàm hiển thị của Step 2
        Step2ModalLogic.setupModal({
            title: `Chỉnh sửa câu ${qNum}`,
            showRange: false,
            showAudio: false,
            showMaster: false,
            contentHtml: contentHtml,
            footerHtml: footerHtml,
            typeKey: type
        });
    },

    /**
     * Hàm lưu dữ liệu từ generalModal
     */
    saveQuickData: async function(type) {
        const { qNum } = this.editingInfo;
        let newVal = "";

        // Lấy giá trị từ các input/radio đã render
        if (type === 'abcd' || type === 'listening' || type === 'true_false') {
            const selected = document.querySelector(`input[name="ans_${qNum}"]:checked`);
            newVal = selected ? selected.value : "";
        } else {
            const input = document.querySelector(`input[name="ans_${qNum}"]`);
            newVal = input ? input.value : "";
        }

        if (qNum !== null) {
            await this.updateStorage(qNum, newVal.trim().toUpperCase());
            this.closeQuickModal();
        }
    },

    updateStorage: async function(qNum, newVal) {
        const data = StorageManager.examData;
        for (let id in data.sections) {
            const sec = data.sections[id];
            if (qNum >= sec.range[0] && qNum <= sec.range[1]) {
                sec.answers[qNum - sec.range[0]] = newVal;
                break;
            }
        }
        await StorageManager.saveMeta();
        // Render lại cái lưới Step 3 phía dưới
        if (typeof ABCD_ReadRange !== 'undefined') ABCD_ReadRange.renderInputs();
        if (window.showToast) showToast(`Đã lưu câu ${qNum}`);
    },

    closeQuickModal: function() {
        // Tắt cái generalModal của Step 2
        document.getElementById('generalModal').style.display = 'none';
        if (typeof SessionManager !== 'undefined') SessionManager.setActiveModal(null);
    }
};

// Gán global để HTML onclick nhận diện được
window.saveQuickData = (type) => ABCD_Controller.saveQuickData(type);
window.closeQuickModal = () => ABCD_Controller.closeQuickModal();
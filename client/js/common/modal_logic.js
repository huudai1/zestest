const Step2ModalLogic = {
    editingId: null,

    setupModal({ title, showRange, showAudio, isAudioReq, showMaster, contentHtml, footerHtml, typeKey }) {
        const modal = document.getElementById('generalModal');
        // Diamond style (Khung tím) cho phần Nghe
        modal.querySelector('.modal-box').className = 'modal-box diamond-style';
        
        document.getElementById('general-modal-title').innerText = title;
        document.getElementById('range-input-section').style.display = showRange ? 'flex' : 'none';
        
        // --- XỬ LÝ AUDIO (LUÔN HIỆN NHƯNG PHÂN LOẠI REQ) ---
        const audioSection = document.getElementById('audio-setup-section');
        audioSection.style.display = showAudio ? 'block' : 'none';
        if (showAudio) {
            const badge = document.getElementById('audio-badge');
            const dropzone = document.getElementById('audio-dropzone');
            const statusText = dropzone.querySelector('.file-status');

        if (isAudioReq) {
            badge.className = 'badge-req'; 
            badge.innerText = I18n.t('mandatory'); // <-- Dùng I18n
            dropzone.classList.add('req-zone');
        } else {
            badge.className = 'badge-opt'; 
            badge.innerText = I18n.t('optional'); // <-- Dùng I18n
            dropzone.classList.remove('req-zone');
        }
        // Dịch luôn placeholder vùng tải file
        if (statusText) statusText.innerText = I18n.t('audio_placeholder');
        }

        // --- XỬ LÝ MASTER INPUT ---
        // --- XỬ LÝ MASTER INPUT ---
        const masterArea = document.getElementById('master-input-section');
        masterArea.style.display = showMaster ? 'block' : 'none';

        if (showMaster) {
        const masterInput = document.getElementById('modal-master-input');
    
        // Reset giá trị cũ khi mở modal
        masterInput.value = ""; 

        masterInput.oninput = (e) => {
        // Lấy dải câu hỏi từ các ô input ẩn hoặc biến trạng thái
        const from = parseInt(document.getElementById('input-from').value);
        const to = parseInt(document.getElementById('input-to').value);
        
        if (typeof distributeMasterToRows === "function") {
            distributeMasterToRows(e.target.value, from, to, typeKey);
        }
    };
}

        document.getElementById('dynamic-rows-container').innerHTML = contentHtml;
        document.getElementById('general-modal-footer').innerHTML = footerHtml;
        modal.style.display = 'flex';
    },

    openTypeModal() {
        this.editingId = null;
        const typeGridHtml = `
        <div class="type-grid">
            <label class="type-option"><input type="radio" name="type" value="abcd" checked> <span data-i18n="abcd">ABCD</span></label>
            <label class="type-option"><input type="radio" name="type" value="listening"> <span data-i18n="listening">Nghe</span></label>
            <label class="type-option"><input type="radio" name="type" value="true_false"> <span data-i18n="true_false">Đúng/Sai</span></label>
            <label class="type-option"><input type="radio" name="type" value="essay"> <span data-i18n="essay">Tự luận</span></label>
        </div>`;
        const footer = `
            <button class="btn-cancel" onclick="Step2ModalLogic.closeAllModals()" data-i18n="cancel">Hủy</button>
            <button class="btn-next" onclick="Step2ModalLogic.handleNextStep()" data-i18n="next">Tiếp →</button>`;

        this.setupModal({
            title: I18n.t('setup_title'),
            showRange: true, showAudio: false, showMaster: false,
            contentHtml: typeGridHtml, footerHtml: footer
        });
    },

handleNextStep() {
    const fromQ = parseInt(document.getElementById('input-from').value);
    const toQ = parseInt(document.getElementById('input-to').value);
    const selectedRadio = document.querySelector('input[name="type"]:checked');

    if (!fromQ || !toQ) return alert(I18n.t('alert_range'));
    if (!selectedRadio) return alert(I18n.t('alert_type'));

    // GỌI VALIDATE: Truyền Object Map và editingId
    const validation = RangeValidator.validate(
        fromQ, 
        toQ, 
        StorageManager.examData.sections, 
        this.editingId
    );

    if (!validation.isValid) {
        alert(validation.message);
        return; 
    }

    const typeKey = selectedRadio.value;
    this.openEditor(typeKey, [fromQ, toQ]);
},

openEditor(typeKey, range, answers = []) {
    const [from, to] = range;
    let html = "";
    const prevFileInput = document.getElementById('audio-file-input');
    if (prevFileInput) prevFileInput.value = "";
    const prevDropzone = document.getElementById('audio-dropzone');
    if (prevDropzone) {
        prevDropzone.classList.remove('has-file');
        const s = prevDropzone.querySelector('.file-status');
        if (s) s.textContent = I18n.t('audio_placeholder');
    }
    for (let i = from; i <= to; i++) {
        const val = answers[i - from] || "";
        html += `<div class="answer-row">
                    <span class="q-num">${I18n.t('question_label')} ${i}:</span> 
                    <div class="input-wrapper">${this.getAnswerInputHtml(typeKey, i, val)}</div>
                </div>`;
    }

    // Kiểm tra chế độ Edit
    const isEdit = this.editingId !== null;

    // Tận dụng class CSS của bạn và thêm style trực tiếp để xử lý flex/ẩn hiện
    const footer = `
        <div style="display: flex; gap: 12px; width: 100%;">
            ${!isEdit ? 
                `<button class="btn-cancel" onclick="Step2ModalLogic.openTypeModal()" data-i18n="prev">
                    ← Quay lại
                 </button>` : ''
            }
            
            <button class="btn-cancel" 
                    style="border-color: #ff4d4f; color: #ff4d4f;" 
                    onclick="Step2ModalLogic.closeAllModals()" data-i18n="cancel">
                Hủy bỏ
            </button>

            <button class="btn-done" onclick="Step2ModalLogic.save('${typeKey}')" data-i18n="done">
                Hoàn tất
            </button>
        </div>`;
        const titlePrefix = isEdit ? I18n.t('edit') : I18n.t('setup_title');
    this.setupModal({
       title: `${titlePrefix}: ${typeKey.toUpperCase()}`,
        showRange: false,
        showAudio: true,
        isAudioReq: typeKey === 'listening', 
        showMaster: typeKey !== 'essay',
        contentHtml: html, 
        footerHtml: footer, 
        typeKey: typeKey
    });
},

  getAnswerInputHtml(type, qNum, val) {
    if (type === 'abcd' || type === 'listening') {
        // Thêm thẻ bọc abcd-bubble-group ở đây
        const bubbles = ['A', 'B', 'C', 'D'].map(c => `
            <label class="choice-bubble">
                <input type="radio" name="ans_${qNum}" value="${c}" ${val === c ? 'checked' : ''}>
                <span>${c}</span>
            </label>
        `).join('');
        return `<div class="abcd-bubble-group">${bubbles}</div>`;
    }
    
    if (type === 'true_false') {
    // Lấy nhãn hiển thị từ I18n, ví dụ: "T,F" hoặc "Đ,S"
    const labels = I18n.t('tf_labels').split(','); 
    // Giá trị lưu trữ (value) nên giữ nguyên 'T', 'F' để logic backend/database không bị loạn
    const values = ['T', 'F']; 

    const bubbles = values.map((valItem, index) => `
        <label class="choice-bubble">
            <input type="radio" name="ans_${qNum}" value="${valItem}" ${val === valItem ? 'checked' : ''}>
            <span>${labels[index]}</span>
        </label>
    `).join('');
    
    return `<div class="tf-group">${bubbles}</div>`;
}
    
    return `<input type="text" 
               class="quick-text-input" 
               name="ans_${qNum}" 
               value="${val}" 
               placeholder="${I18n.t('question_label')} ${qNum}..." 
               autocomplete="off">`;
},

    closeAllModals() {
        document.getElementById('generalModal').style.display = 'none';
        document.getElementById('cancelModal').style.display = 'none';
        if (typeof SessionManager !== 'undefined') SessionManager.setActiveModal(null);
    },

    async save(typeKey) {
        const fromQ = parseInt(document.getElementById('input-from').value);
        const toQ = parseInt(document.getElementById('input-to').value);

        const validation = RangeValidator.validate(
        fromQ, 
        toQ, 
        StorageManager.examData.sections, 
        this.editingId
    );
    if (!validation.isValid) return alert(validation.message);
        
        // Kiểm tra file Audio nếu là loại Listening
        const fileInput = document.getElementById('audio-file-input');
        const file = fileInput?.files[0];
        let oldAudio = this.editingId ? StorageManager.examData.sections[this.editingId]?.audio : null;

        if (typeKey === 'listening' && !file && !oldAudio) {
            alert("⚠️ Phần thi Nghe bắt buộc phải có file Audio!");
            return;
        }

        let answers = [];
        for (let i = fromQ; i <= toQ; i++) {
            const radio = document.querySelector(`input[name="ans_${i}"]:checked`);
            const text = document.querySelector(`input[name="ans_${i}"][type="text"]`);
            answers.push(radio ? radio.value : (text ? text.value.trim().toUpperCase() : ""));
        }

        let audioName = oldAudio;
        if (file) {
            audioName = `audio_${Date.now()}.mp3`;
            AudioProcessor.processToZestestStandard(file);
        }

        const sectionId = this.editingId || `range_${fromQ}_${toQ}`;
        await StorageManager.setSection(sectionId, {
            range: [fromQ, toQ], type: typeKey, answers, audio: audioName
        });

        this.closeAllModals();
        if (typeof renderRangeList === "function") renderRangeList();
    }
};

window.saveQuickData = (type) => Step2ModalLogic.save(type);
window.closeQuickModal = () => Step2ModalLogic.closeAllModals();
window.openTypeModal = () => Step2ModalLogic.openTypeModal();

/**
 * Logic hiển thị Modal xác nhận hủy bỏ (Cancel Modal)
 */
window.openCancelModal = function() {
    const cancelModal = document.getElementById('cancelModal');
    if (cancelModal) {
        cancelModal.style.display = 'flex';
        // Nếu có SessionManager, đánh dấu đang mở modal hủy
        if (typeof SessionManager !== 'undefined') {
            SessionManager.setActiveModal('cancel');
        }
    }
};

/**
 * Logic xác nhận hủy thực sự (Xóa data và về Dashboard)
 */
window.confirmCancel = function() {
    // 1. Đóng tất cả modal đang mở
    Step2ModalLogic.closeAllModals();

    // 2. Gọi hàm điều phối của SPA (đã viết trong index.html)
    if (typeof Navigation !== 'undefined' && typeof Navigation.show === 'function') {
        // Nếu dùng object Navigation
        Navigation.show('page-dashboard');
    } else if (typeof window.showPage === 'function') {
        // Nếu dùng hàm showPage trực tiếp trong index.html
        window.showPage('dashboard-page');
    } else {
        // Phương án cuối cùng: Tự ẩn hiện bằng DOM
        document.getElementById('create-steps-page').style.display = 'none';
        document.getElementById('dashboard-page').style.display = 'block';
    }
    
    console.log("🚩 [System] Đã hủy phiên tạo đề và quay về Dashboard.");
};

window.updateFileName = function(input) {
    const dropzone = input.closest('.audio-dropzone');
    const statusEl = dropzone?.querySelector('.file-status');
    if (!statusEl) return;
    if (input.files && input.files[0]) {
        statusEl.textContent = "✅ " + input.files[0].name;
        dropzone.classList.add('has-file');
    } else {
        statusEl.textContent = I18n.t('audio_placeholder');
        dropzone.classList.remove('has-file');
    }
};
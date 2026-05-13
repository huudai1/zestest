window.ModalLogic = {
    // ========================================================================
    // A. DASHBOARD MODALS LOGIC
    // ========================================================================
    wsMonitor: null,

    async openShareModal(examId) {
        const userId = ClientInternal.getExistingId();
        const raw = await SendRQ(userId, 'GEN_LINK', {
            user_id: userId,
            exam_id: examId
        });

        const res = Receiver.processResponse(raw);
        const overlay = ModalUI.createOverlay();
        if (!res.success) {
            overlay.innerHTML = `<div style="background:white;padding:20px;border-radius:10px;">Lỗi: ${res.message}</div>`;
            return;
        }

        const base = (window.CONFIG && window.CONFIG.BASE_URL) ? window.CONFIG.BASE_URL : window.location.origin;
        const link = base + res.data.link;
        ModalUI.renderShareModal(overlay, link);

        this.initShareModalEvents(link, examId);
    },

    initShareModalEvents(link, examId) {
        const btnCopy = document.getElementById('btnCopyLink');
        if (btnCopy) {
            btnCopy.onclick = async function () {
                await navigator.clipboard.writeText(link);
                const original = this.innerHTML;
                this.innerHTML = "✅ Xong!";
                this.style.filter = "hue-rotate(90deg)";
                setTimeout(() => {
                    this.innerHTML = original;
                    this.style.filter = "none";
                }, 2000);
            };
        }

        const slider = document.getElementById('studentSlider');
        const label = document.getElementById('limitLabel');
        if (slider && label) {
            slider.oninput = function () { label.innerText = this.value; };
        }

        const btnClose = document.getElementById('btnCloseShare');
        if (btnClose) {
            btnClose.onclick = () => {
                if (this.wsMonitor) {
                    this.wsMonitor.close();
                    this.wsMonitor = null;
                }
                ModalUI.closeAll();
            };
        }

        this.initMonitorWebSocket(examId);
    },

    initMonitorWebSocket(examId) {
        const userJson = localStorage.getItem('user');
        const userData = userJson ? JSON.parse(userJson) : null;
        const tier = userData?.tier || 'GUEST';

        const allowedTiers = ['GUEST', 'USER_FREE', 'PREMIUM_1', 'PREMIUM_2', 'PREMIUM_3', 'GIFT_PRO', 'ADMIN'];

        if (!allowedTiers.includes(tier)) {
            console.warn("⚠️ [Monitor] Tài khoản Free không được dùng tính năng Realtime.");
            ModalUI.renderUpgradePrompt();
            return;
        }

        const wsUrl = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsHost = (window.CONFIG && window.CONFIG.BASE_URL) 
            ? new URL(window.CONFIG.BASE_URL).host 
            : window.location.host;
        this.wsMonitor = new WebSocket(`${wsUrl}//${wsHost}/api/room/${examId}`);

        this.wsMonitor.onopen = () => {
            console.log("🟢 [Monitor] Đã kết nối vào Phòng thi!");
            this.wsMonitor.send(JSON.stringify({ type: 'TEACHER_JOIN' }));
        };

        this.wsMonitor.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'SYNC_STUDENTS') {
                    ModalUI.updateStudentGrid(data.students);
                }
            } catch (err) {
                console.error("❌ [Monitor] Parse error:", err);
            }
        };

        this.wsMonitor.onclose = () => {
            console.log("🔴 [Monitor] Đã ngắt kết nối");
        };
    },

    openPremiumModal() {
        const userId = ClientInternal.getExistingId();
        const overlay = ModalUI.createOverlay();

        const bankConfig = {
            bankId: "MB",
            accountNo: "0383344686",
            accountName: "HUYNH HUU DAI",
            amount: 50000,
            description: `ZESTEST PREM ${userId}`
        };

        const qrUrl = `https://img.vietqr.io/image/${bankConfig.bankId}-${bankConfig.accountNo}-compact2.png?amount=${bankConfig.amount}&addInfo=${encodeURIComponent(bankConfig.description)}&accountName=${encodeURIComponent(bankConfig.accountName)}`;

        ModalUI.renderPremiumModal(overlay, bankConfig, qrUrl);

        document.getElementById('btnPaymentDone').onclick = () => {
            alert("Cảm ơn Captain! Hệ thống đang kiểm tra giao dịch của bạn.");
            ModalUI.closeAll();
        };
        document.getElementById('btnCancelPayment').onclick = () => ModalUI.closeAll();
    },

    openQuotaModal(message) {
        const tier = IdentityManager.getTier();
        const isGuest = tier === 'GUEST';

        let title = isGuest ? "Đăng nhập để tiếp tục" : "Bạn đã hết lượt tạo đề";
        let content = isGuest
            ? "Hạng GUEST hiện tại chỉ hỗ trợ tối đa 1 đề thi để thử nghiệm. Bạn đăng nhập ngay để nhận thêm nhiều slot và lưu trữ đề thi lâu dài nhé! ❤️"
            : "Hệ thống rất tiếc vì tài khoản của bạn đã hết slot lưu trữ. Để đảm bảo mọi người đều có trải nghiệm mượt mà và duy trì chi phí máy chủ, bạn vui lòng xóa bớt đề cũ hoặc nâng cấp PRO để mở rộng kho lưu trữ nhé! ❤️";

        let btnText = isGuest ? "Đăng nhập ngay" : "Nâng cấp Premium";
        let btnAction = isGuest ? "window.location.href='/login'" : "ModalUI.closeAll(); if(window.DashboardUI) DashboardUI.showPremiumModal()";
        let btnBg = isGuest ? "var(--primary-blue)" : "#fbbf24";
        let btnColor = isGuest ? "#fff" : "#000";

        ModalUI.renderQuotaModal(isGuest, title, content, btnAction, btnText, btnBg, btnColor);
    },

    async openStatsModal(examId) {
        const overlay = ModalUI.createOverlay();
        ModalUI.renderStatsModal(overlay);

        const closeBtn = document.getElementById('btnCloseStats');
        if (closeBtn) {
            closeBtn.onclick = () => {
                ModalUI.closeAll();
            };
        }

        overlay.onclick = (e) => {
            if (e.target === overlay) ModalUI.closeAll();
        };

        try {
            const base = (window.CONFIG && window.CONFIG.BASE_URL) ? window.CONFIG.BASE_URL : "";
            const res = await fetch(`${base}/api/exam/results/${examId}`);
            const data = await res.json();

            if (!data.success || !data.results || data.results.length === 0) {
                ModalUI.renderStatsContent([], 0, 0, 0);
                return;
            }

            const results = data.results;
            const avg = (results.reduce((s, r) => s + r.score, 0) / results.length).toFixed(1);
            const high = results.filter(r => r.score >= 8).length;
            const warnTotal = results.reduce((s, r) => s + (r.warning_count || 0), 0);

            ModalUI.renderStatsContent(results, avg, high, warnTotal);
        } catch (err) {
            console.error(err);
            const content = document.getElementById('statsContent');
            if (content) content.innerHTML = `<div style="color: #ef4444;">Lỗi tải dữ liệu.</div>`;
        }
    },

    openSuccessModal(data) {
        const overlay = ModalUI.createOverlay();
        ModalUI.renderSuccessModal(overlay, data);

        document.getElementById('btnDownloadNow').onclick = async function () {
            this.disabled = true;
            this.innerHTML = "⌛ Đang nén file...";
            const success = await PackageEngine.download(data);
            if (success) {
                this.innerHTML = "✅ Đã xong!";
                if (typeof SessionManager !== 'undefined') SessionManager.clearAll();
                if (typeof Step1Handler !== 'undefined') Step1Handler.clearAll();
                setTimeout(() => ModalUI.closeAll(), 1500);
            } else {
                this.disabled = false;
                this.innerHTML = "TẢI FILE (.zestest)";
            }
        };

        document.getElementById('btnSkip').onclick = () => {
            ModalUI.closeAll();
            if (typeof SessionManager !== 'undefined') SessionManager.clearAll();
            if (typeof Step1Handler !== 'undefined') Step1Handler.clearAll();
        };
    },

    // ========================================================================
    // B. CREATION MODALS LOGIC (Tạo đề - Step 2)
    // ========================================================================
    editingId: null,

    openTypeModal(shouldReset = false) {
        this.editingId = null;

        if (shouldReset) {
            const fromInp = document.getElementById('input-from');
            const toInp = document.getElementById('input-to');
            if (fromInp) fromInp.value = "";
            if (toInp) toInp.value = "";
        }

        const typeGridHtml = ModalUI.getTypeGridHtml();
        const footer = `
            <button class="btn-cancel" onclick="ModalLogic.closeAllModals()" data-i18n="cancel">Hủy</button>
            <button class="btn-next" onclick="ModalLogic.handleNextStep()" data-i18n="next">Tiếp →</button>`;

        ModalUI.setupGeneralModal({
            title: I18n.t('setup_title'),
            showRange: true, showAudio: false, showMaster: false,
            contentHtml: typeGridHtml, footerHtml: footer, typeKey: null
        });
    },

    handleNextStep() {
        const fromQ = parseInt(document.getElementById('input-from').value);
        const toQ = parseInt(document.getElementById('input-to').value);
        const selectedRadio = document.querySelector('input[name="type"]:checked');

        if (!fromQ || !toQ) return alert(I18n.t('alert_range'));
        if (!selectedRadio) return alert(I18n.t('alert_type'));

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
            if (s) {
                s.innerHTML = (typeof I18n !== 'undefined') ? I18n.t('audio_placeholder') : "Nhấn vào đây để tải file (.mp3, .wav)";
            }
        }
        for (let i = from; i <= to; i++) {
            const val = answers[i - from] || "";
            html += `<div class="answer-row">
                    <span class="q-num">${I18n.t('question_label')} ${i}:</span> 
                    <div class="input-wrapper">${ModalUI.getAnswerInputHtml(typeKey, i, val)}</div>
                </div>`;
        }

        const isEdit = this.editingId !== null;

        const footer = `
        <div style="display: flex; gap: 12px; width: 100%;">
            ${!isEdit ?
                `<button class="btn-cancel" onclick="ModalLogic.openTypeModal(false)" data-i18n="prev">
                    ← Quay lại
                 </button>` : ''
            }
            <button class="btn-cancel" 
                    style="border-color: #ff4d4f; color: #ff4d4f;" 
                    onclick="ModalLogic.closeAllModals()" data-i18n="cancel">
                Hủy bỏ
            </button>
            <button class="btn-done" onclick="ModalLogic.save('${typeKey}')" data-i18n="done">
                Hoàn tất
            </button>
        </div>`;
        
        const titlePrefix = isEdit ? I18n.t('edit') : I18n.t('setup_title');
        
        let userId = "";
        try {
            if (typeof ClientInternal !== 'undefined') userId = ClientInternal.getExistingId();
        } catch (e) { }
        const isGuest = userId.startsWith('gst_');

        ModalUI.setupGeneralModal({
            title: `${titlePrefix}: ${typeKey.toUpperCase()}`,
            showRange: false,
            showAudio: true,
            isAudioReq: typeKey === 'listening',
            showMaster: typeKey !== 'essay',
            contentHtml: html,
            footerHtml: footer,
            typeKey: typeKey,
            isGuest: isGuest
        });
    },

    closeAllModals() {
        ModalUI.closeAll();
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

        // === FIX: Normalize range lệch trước khi lưu ===
        // Nếu user nhập range lệch (VD: 101-200) nhưng tổng câu chỉ có 100,
        // tự động dịch về đúng range (1-100) để finalAnswers khớp với học sinh.
        let finalFrom = fromQ;
        let finalTo = toQ;
        const totalQ = parseInt(StorageManager.examData.totalQuestions) || 0;
        const rangeCount = (toQ - fromQ) + 1;
        if (totalQ > 0 && fromQ > totalQ && rangeCount <= totalQ) {
            const offset = fromQ - 1;
            finalFrom = fromQ - offset; // = 1
            finalTo = toQ - offset;     // = rangeCount
            console.log(`[Save] Range lệch ${fromQ}-${toQ} → normalize thành ${finalFrom}-${finalTo}`);
        }

        let audioName = oldAudio;
        if (file) {
            audioName = `audio_${Date.now()}.mp3`;
            AudioProcessor.processToZestestStandard(file).catch(err => {
                console.error("❌ [Background Audio] Lỗi:", err);
            });

            if (window.showToast) {
                window.showToast("🎵 Đang tối ưu âm thanh dưới nền...");
            }
        }

        const sectionId = this.editingId || `range_${finalFrom}_${finalTo}`;
        await StorageManager.setSection(sectionId, {
            range: [finalFrom, finalTo], type: typeKey, answers, audio: audioName
        });

        this.closeAllModals();
        if (typeof renderRangeList === "function") renderRangeList();
    },

    // ------------------------------------------------------------------------
    // C. CÁC MODAL HỆ THỐNG KHÁC (Cancel, Gift)
    // ------------------------------------------------------------------------
    openCancelModal() {
        const cancelModal = document.getElementById('cancelModal');
        if (cancelModal) {
            cancelModal.style.display = 'flex';
            if (typeof SessionManager !== 'undefined') {
                SessionManager.setActiveModal('cancel');
            }
        }
    },

    confirmCancel() {
        this.closeAllModals();
        if (typeof Navigation !== 'undefined' && typeof Navigation.show === 'function') {
            Navigation.show('page-dashboard');
        } else if (typeof window.showPage === 'function') {
            window.showPage('dashboard-page');
        } else {
            document.getElementById('create-steps-page').style.display = 'none';
            document.getElementById('dashboard-page').style.display = 'block';
        }
        console.log("🚩 [System] Đã hủy phiên tạo đề và quay về Dashboard.");
    },

    async showGiftModal(file) {
        const overlay = document.querySelector('.modal-overlay');
        if (!overlay) return;

        ModalUI.renderGiftModal(overlay, file);

        document.getElementById('btn-accept-gift').onclick = async () => {
            const btn = document.getElementById('btn-accept-gift');
            btn.innerText = "⏳ ĐANG KÍCH HOẠT...";
            btn.disabled = true;

            const userId = ClientInternal.getExistingId();
            try {
                const raw = await SendRQ(userId, "ACTIVATE_GIFT");
                const res = Receiver.processResponse(raw);
                if (res.status === "SUCCESS") {
                    alert("✨ Chúc mừng! Bạn đã được nâng cấp lên GIFT PRO trong 3 ngày.");
                    overlay.style.display = 'none';
                    const input = document.getElementById('audio-file-input');
                    if (input) {
                        input.setAttribute('data-gift-unlocked', 'true');
                        this.updateFileName(input);
                    }
                } else {
                    alert(res.message || "Không thể nhận quà lúc này.");
                    overlay.style.display = 'none';
                }
            } catch (err) {
                console.error(err);
                overlay.style.display = 'none';
            }
        };
    },

    updateFileName(input) {
        console.log("📂 [Audio] File selection changed. Input:", input);
        if (!input) return;

        const dropzone = document.getElementById('audio-dropzone');
        const statusEl = dropzone?.querySelector('.file-status');
        if (!statusEl || !dropzone) {
            console.error("❌ [Audio] Could not find dropzone or statusEl");
            return;
        }

        if (input.files && input.files[0]) {
            const file = input.files[0];
            const MAX_SIZE = 60 * 1024 * 1024;

            if (file.size > MAX_SIZE && !input.getAttribute('data-gift-unlocked')) {
                this.showGiftModal(file);
                return;
            }

            console.log("✅ [Audio] File accepted:", file.name);
            ModalUI.updateAudioDropzoneUI(dropzone, statusEl, file);
        } else {
            ModalUI.updateAudioDropzoneUI(dropzone, statusEl, null);
        }
    },

    // Bridge for Step 3 Quick Edit
    getAnswerInputHtml(type, qNum, val) {
        return ModalUI.getAnswerInputHtml(type, qNum, val);
    },
    setupModal(config) {
        return ModalUI.setupGeneralModal(config);
    }
};

// ========================================================================
// D. ALIAS VÀ GẮN SỰ KIỆN GLOBAL
// ========================================================================
// Alias cho các file cũ đang gọi Step2ModalLogic
window.Step2ModalLogic = window.ModalLogic;

// Gắn các hàm gọi trực tiếp từ HTML
window.closeModal = () => ModalLogic.closeAllModals();
window.openTypeModal = () => ModalLogic.openTypeModal();
window.openCancelModal = () => ModalLogic.openCancelModal();
window.confirmCancel = () => ModalLogic.confirmCancel();
window.updateFileName = (input) => ModalLogic.updateFileName(input);
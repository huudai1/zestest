window.DashboardRender = {
    async render() {
        if (window.DashboardManager) await DashboardManager.loadExams();
    },

    renderExamList(exams) {
        const container = document.getElementById('exam-container');
        if (!container) return;

        container.innerHTML = '';

        if (!exams || exams.length === 0) {
            this.renderEmptyState(container);
            return;
        }

        const now = Date.now();
        const activeExams = exams.filter(e => now <= e.expires_at);
        const expiredCount = exams.length - activeExams.length;

        if (expiredCount > 0) {
            const notify = document.createElement('div');
            notify.style = "background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); padding: 12px; border-radius: 12px; margin-bottom: 20px; font-size: 13px; color: #f87171; display: flex; align-items: center; gap: 10px;";
            notify.innerHTML = `
                <span>⚠️</span>
                <div>
                    <b>${expiredCount}${typeof I18n !== 'undefined' ? I18n.t('expired_notice_prefix') : ' đề thi đã hết hạn'}</b>${typeof I18n !== 'undefined' ? I18n.t('expired_notice_suffix') : ' và được ẩn đi.'} 
                    Bạn có thể khôi phục bằng cách ném file <b>.zestest</b> vào vùng phía trên.
                </div>
            `;
            container.appendChild(notify);
        }

        if (activeExams.length === 0 && expiredCount > 0) {
            return;
        }

        activeExams.forEach(exam => {
            const card = document.createElement('div');
            card.className = 'exam-card';
            card.setAttribute('data-expires', exam.expires_at);

            let displayName = exam.name || "Untitled Exam";
            if (exam.id.includes('__')) {
                displayName = exam.id.split('__')[1].replace(/_/g, ' ');
            }

            card.innerHTML = `
                <div class="exam-header">
                    <div class="exam-title">${displayName}</div>
                    <div class="exam-time">${typeof I18n !== 'undefined' ? I18n.t('card_time_counting') : '⏱ Đang tính...'}</div>
                </div>
                <div class="btn-group" style="display: flex; gap: 6px;">
                    <button class="btn-action btn-share" style="flex: 2; font-weight: 800;" onclick="DashboardRender.showShareModal('${exam.id}', '${exam.status || 'ACTIVE'}', ${exam.max_attempts || 1})">${typeof I18n !== 'undefined' ? I18n.t('card_share') : 'Giao bài'}</button>
                    <button class="btn-action" style="flex: 1; background: #8b5cf6; color: white;" onclick="DashboardRender.showStatsModal('${exam.id}')">${typeof I18n !== 'undefined' ? I18n.t('card_info') : 'Info'}</button>
                    <button class="btn-action btn-download" style="flex: 1; background: #3b82f6; color: white;" onclick="DashboardManager.downloadExam('${exam.url}', '${exam.name || displayName}', this)">${typeof I18n !== 'undefined' ? I18n.t('card_download') : 'Tải'}</button>
                    <button class="btn-action btn-delete" style="flex: 0.8;" onclick="DashboardManager.deleteExam('${exam.id}')">${typeof I18n !== 'undefined' ? I18n.t('card_delete') : 'Del'}</button>
                </div>`;
            container.appendChild(card);
        });

        this.startGlobalCountdown();
    },

    updateQuotaUI(data) {
        const nameEl = document.getElementById('user-tier-name');
        const subtextEl = document.getElementById('user-tier-subtext');

        if (nameEl) {
            const cached = localStorage.getItem('user');
            const userData = cached ? JSON.parse(cached) : null;
            nameEl.innerText = userData ? (userData.name || userData.email.split('@')[0]) : "Guest";
        }

        if (subtextEl) {
            const tier = data.tier || 'GUEST';
            const isPremium = tier.includes('PREMIUM') || tier.includes('PRO');
            subtextEl.innerText = isPremium ? "Gia hạn" : "Upgrade";
        }

        const tier = data.tier || 'GUEST';
        const isPremium = tier.includes('PREMIUM') || tier.includes('PRO');
        const btnAnalytics = document.getElementById('btn-analytics');
        const btnBranding = document.getElementById('btn-branding');
        if (btnAnalytics) btnAnalytics.style.display = isPremium ? 'flex' : 'none';
        if (btnBranding) btnBranding.style.display = 'flex';

        const quotaText = document.getElementById('quota-text-main');
        const quotaFill = document.getElementById('quota-fill-main');
        if (quotaText) quotaText.innerText = `${data.active_count} / ${data.max_active_exams}`;
        if (quotaFill) {
            const percent = Math.min((data.active_count / data.max_active_exams) * 100, 100);
            quotaFill.style.width = percent + '%';
            if (percent >= 100) quotaFill.style.background = 'var(--danger-red)';
            else quotaFill.style.background = 'linear-gradient(to right, var(--primary-blue), #00d2ff)';
        }

        const globalTotalEl = document.getElementById('global-total-count');
        if (globalTotalEl && data.global_total_exams !== undefined) {
            globalTotalEl.innerText = data.global_total_exams.toLocaleString();
        }
    },

    startGlobalCountdown() {
        if (this.timerInterval) clearInterval(this.timerInterval);

        const updateTimers = () => {
            const now = Date.now();
            const timerElements = document.querySelectorAll('.exam-time');

            timerElements.forEach(el => {
                const card = el.closest('.exam-card');
                if (!card) return;

                const expiresAt = parseInt(card.getAttribute('data-expires'));
                const remains = expiresAt - now;

                if (remains <= 0) {
                    const expiredLabel = typeof I18n !== 'undefined' ? I18n.t('card_expired') : '🔴 Hết hạn';
                    el.innerHTML = `<span style="color: #ef4444;">${expiredLabel}</span>`;
                    card.style.opacity = '0.5';
                    card.style.pointerEvents = 'none';
                    setTimeout(() => {
                        if (window.DashboardManager) {
                            DashboardManager.loadExams();
                            DashboardManager.refreshQuota();
                        }
                    }, 2000);
                } else {
                    const hours = Math.floor(remains / 3600000);
                    const mins = Math.floor((remains % 3600000) / 60000);
                    const secs = Math.floor((remains % 60000) / 1000);

                    const prefix = typeof I18n !== 'undefined' ? I18n.t('card_time_left') : 'Còn lại';
                    el.innerHTML = `⏱ ${prefix}: <b style="color: var(--color-primary); font-family: 'JetBrains Mono', monospace;">${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}</b>`;
                }
            });
        };

        updateTimers();
        this.timerInterval = setInterval(updateTimers, 1000);
    },

    renderEmptyState(container) {
        const t = typeof I18n !== 'undefined' ? (k) => I18n.t(k) : (k) => k;
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📁</div>
                <p>${t('empty_state_title')}</p>
                <span>${t('empty_state_sub')}</span>
            </div>`;
    },

    updateUploadStatus(text) {
        const bannerText = document.getElementById('banner-text');
        if (bannerText) bannerText.innerText = text;
    },

    // --- PHẦN KIỂM SOÁT BÀI THI (REALTIME) ---
    async showShareModal(examId, currentStatus = 'ACTIVE', maxAttempts = 1) {
        const userId = ClientInternal.getExistingId();
        const raw = await SendRQ(userId, 'GEN_LINK', {
            user_id: userId,
            exam_id: examId
        });

        const res = Receiver.processResponse(raw);
        const overlay = DashboardUI.createModalOverlay();

        if (!res.success) {
            DashboardUI.showError(overlay, res.message);
            return;
        }

        const link = window.location.origin + res.data.link;
        const t = typeof I18n !== 'undefined' ? (k) => I18n.t(k) : (k) => k;

        overlay.innerHTML = `
            <div style="max-width: 900px; margin: 0 auto; width: 100%; animation: modalPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px;">
                    <h2 style="margin: 0; font-size: 28px; font-weight: 800; background: linear-gradient(to right, var(--color-primary), #a29bfe); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${t('share_title')}</h2>
                    <button id="btnCloseShare" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; padding: 10px 22px; border-radius: 12px; cursor: pointer; font-weight: 600; transition: 0.3s;">${t('share_close')}</button>
                </div>

                <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); padding: 30px; border-radius: 24px; margin-bottom: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
                    <p style="margin: 0 0 12px 0; font-size: 14px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">${t('share_link_label')}</p>
                    <div style="display: flex; gap: 15px;">
                        <input type="text" id="shareLinkInput" value="${link}" readonly 
                            style="flex: 1; background: #000; border: 1px solid #1e293b; color: var(--color-primary); padding: 16px; border-radius: 14px; font-family: 'JetBrains Mono', monospace; font-size: 15px; outline: none; box-shadow: inset 0 2px 4px rgba(0,0,0,0.5);">
                        <button id="btnCopyLink" style="padding: 0 35px; background: linear-gradient(135deg, #0095ff 0%, #0070f3 100%); color: #fff; font-weight: 800; border-radius: 14px; cursor: pointer; border: none; box-shadow: 0 4px 15px rgba(0, 149, 255, 0.3); transition: 0.3s;">${t('share_copy')}</button>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin-bottom: 25px;">
                    <!-- NÚT KẾT THÚC / MỞ LẠI -->
                    <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); padding: 20px; border-radius: 24px; display: flex; align-items: center; justify-content: space-between; gap: 15px;">
                        <div>
                            <h4 style="margin: 0; color: #fff; font-size: 14px;">${t('share_status_label')}</h4>
                            <p style="margin: 3px 0 0 0; font-size: 12px; color: #64748b;">
                                ${currentStatus === 'ACTIVE' ? t('share_status_open') : t('share_status_closed')}
                            </p>
                        </div>
                        <button id="btnToggleStatus" 
                                style="padding: 10px 20px; border-radius: 12px; border: none; font-weight: 800; cursor: pointer; transition: 0.3s; font-size: 13px;
                                    ${currentStatus === 'ACTIVE'
                                        ? 'background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2);'
                                        : 'background: rgba(34, 197, 94, 0.1); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.2);'}">
                            ${currentStatus === 'ACTIVE' ? t('share_btn_stop') : t('share_btn_open')}
                        </button>
                    </div>

                    <!-- CÀI ĐẶT SỐ LẦN LÀM -->
                    <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); padding: 20px; border-radius: 24px; display: flex; align-items: center; justify-content: space-between; gap: 15px;">
                        <div>
                            <h4 style="margin: 0; color: #fff; font-size: 14px;">${t('share_max_attempts')}</h4>
                            <p style="margin: 3px 0 0 0; font-size: 12px; color: #64748b;">${t('share_per_student')}</p>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <input type="number" id="inputMaxAttempts" value="${maxAttempts}" min="1" max="100"
                                style="width: 60px; background: #000; border: 1px solid #1e293b; color: var(--color-primary); padding: 10px; border-radius: 10px; text-align: center; font-weight: 800; font-family: 'JetBrains Mono', monospace; outline: none;">
                            <button id="btnSaveSettings" style="background: rgba(59, 130, 246, 0.1); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.2); padding: 10px; border-radius: 10px; cursor: pointer; font-size: 12px; font-weight: 800;">${t('share_btn_save')}</button>
                        </div>
                    </div>

                    <!-- YÊU CẦU ĐĂNG NHẬP -->
                    <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); padding: 20px; border-radius: 24px; display: flex; align-items: center; justify-content: space-between; gap: 15px;">
                        <div>
                            <h4 style="margin: 0; color: #fff; font-size: 14px;">Định danh Học sinh</h4>
                            <p style="margin: 3px 0 0 0; font-size: 12px; color: #f1c40f; font-weight: 700;">PRO Feature</p>
                        </div>
                        <button id="btnRequireLogin" data-state="off"
                                style="padding: 10px 20px; border-radius: 12px; border: none; font-weight: 800; cursor: pointer; transition: 0.3s; font-size: 13px;
                                       background: rgba(255, 255, 255, 0.1); color: #94a3b8; border: 1px solid rgba(255,255,255,0.2);">
                            TẮT
                        </button>
                    </div>
                </div>
                
                <div id="reopenNotice" style="display: none; background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2); padding: 15px; border-radius: 16px; margin-bottom: 25px; color: #60a5fa; font-size: 13px; align-items: center; gap: 10px;">
                    <span>ℹ️</span>
                    <div><b>${t('share_reopen_notice')}</b> ${t('share_reopen_desc')}</div>
                </div>

                <div>
                    <h3 style="color: #94a3b8; font-size: 16px; margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
                        ${t('share_doing')} <span id="studentCount" style="background: linear-gradient(135deg, #0095ff, #0070f3); color: #fff; font-size: 12px; font-weight: 800; padding: 3px 10px; border-radius: 20px; box-shadow: 0 4px 10px rgba(0, 149, 255, 0.2);">0</span>
                    </h3>
                    <div id="studentGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 15px; max-height: 350px; overflow-y: auto; padding-right: 10px;">
                        <div style="grid-column: 1/-1; text-align: center; padding: 80px; color: #475569; border: 2px dashed rgba(255,255,255,0.05); border-radius: 30px; font-weight: 500;">
                            Hệ thống đã sẵn sàng. Đợi học sinh join...
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.initShareModalEvents(link, examId, currentStatus, maxAttempts);
    },

    initShareModalEvents(link, examId, currentStatus, maxAttempts) {
        const btnCopy = document.getElementById('btnCopyLink');
        if (btnCopy) {
            btnCopy.onclick = async function () {
                try {
                    await navigator.clipboard.writeText(link);
                    const originalText = this.innerText;
                    this.innerText = typeof I18n !== 'undefined' ? I18n.t('share_copy_done') : '✅ Xong!';
                    this.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                    setTimeout(() => {
                        this.innerText = originalText;
                        this.style.background = 'linear-gradient(135deg, #0095ff 0%, #0070f3 100%)';
                    }, 2000);
                } catch (err) {
                    console.error('Failed to copy text: ', err);
                }
            };
        }

        const btnRequireLogin = document.getElementById('btnRequireLogin');
        if (btnRequireLogin) {
            btnRequireLogin.onclick = async () => {
                const isOff = btnRequireLogin.getAttribute('data-state') === 'off';
                const newState = isOff ? 'on' : 'off';
                
                // Cập nhật UI trước cho mượt
                if (isOff) {
                    btnRequireLogin.setAttribute('data-state', 'on');
                    btnRequireLogin.innerText = 'BẬT';
                    btnRequireLogin.style.background = 'rgba(241, 196, 15, 0.1)';
                    btnRequireLogin.style.color = '#f1c40f';
                    btnRequireLogin.style.border = '1px solid rgba(241, 196, 15, 0.3)';
                } else {
                    btnRequireLogin.setAttribute('data-state', 'off');
                    btnRequireLogin.innerText = 'TẮT';
                    btnRequireLogin.style.background = 'rgba(255, 255, 255, 0.1)';
                    btnRequireLogin.style.color = '#94a3b8';
                    btnRequireLogin.style.border = '1px solid rgba(255, 255, 255, 0.2)';
                }
                
                // Gọi API lưu trạng thái
                try {
                    const res = await fetch(`/api/exams/${examId}/settings`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-User-ID': ClientInternal.getExistingId()
                        },
                        body: JSON.stringify({ require_login: isOff })
                    });
                    const data = await res.json();
                    if (!data.success) {
                        alert("Lỗi lưu cài đặt: " + data.message);
                    }
                } catch (e) {
                    console.error("Lỗi cập nhật require_login", e);
                }
            };
        }

        const btnClose = document.getElementById('btnCloseShare');
        if (btnClose) {
            btnClose.onclick = () => {
                if (this.wsMonitor) {
                    this.wsMonitor.close();
                    this.wsMonitor = null;
                }
                DashboardUI.closeModal();
            };
        }

        const btnToggle = document.getElementById('btnToggleStatus');
        if (btnToggle) {
            btnToggle.onclick = async () => {
                const newStatus = currentStatus === 'ACTIVE' ? 'CLOSED' : 'ACTIVE';
                const t2 = typeof I18n !== 'undefined' ? (k) => I18n.t(k) : (k) => k;
                const confirmMsg = newStatus === 'CLOSED'
                    ? t2('share_confirm_stop')
                    : t2('share_confirm_open');

                if (!confirm(confirmMsg)) return;

                const originalText = btnToggle.innerText;
                btnToggle.innerText = "⏳...";
                btnToggle.disabled = true;

                try {
                    const userId = ClientInternal.getExistingId();
                    const base = (window.CONFIG && window.CONFIG.BASE_URL) ? window.CONFIG.BASE_URL : "";
                    const response = await fetch(`${base}/api/exams/${examId}/status`, {
                        method: 'POST',
                        headers: {
                            'X-User-ID': userId,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ status: newStatus })
                    });
                    const data = await response.json();
                    if (data.success) {
                        if (newStatus === 'ACTIVE') {
                            const notice = document.getElementById('reopenNotice');
                            if (notice) notice.style.display = 'flex';
                        }
                        // Refresh modal
                        setTimeout(() => this.showShareModal(examId, newStatus, maxAttempts), 500);
                        // Refresh dashboard background
                        if (window.DashboardManager) DashboardManager.loadExams();
                    } else {
                        alert(t2('share_err_toggle') + ' ' + data.message);
                        btnToggle.innerText = originalText;
                        btnToggle.disabled = false;
                    }
                } catch (err) {
                    console.error(err);
                    alert(t2('share_err_connect'));
                    btnToggle.innerText = originalText;
                    btnToggle.disabled = false;
                }
            };
        }

        const btnSave = document.getElementById('btnSaveSettings');
        if (btnSave) {
            btnSave.onclick = async () => {
                const input = document.getElementById('inputMaxAttempts');
                const t3 = typeof I18n !== 'undefined' ? (k) => I18n.t(k) : (k) => k;
                const val = parseInt(input.value);
                if (isNaN(val) || val < 1) return alert(t3('share_err_attempts'));

                btnSave.innerText = "⏳";
                btnSave.disabled = true;

                try {
                    const userId = ClientInternal.getExistingId();
                    const base = (window.CONFIG && window.CONFIG.BASE_URL) ? window.CONFIG.BASE_URL : "";
                    const response = await fetch(`${base}/api/exams/${examId}/settings`, {
                        method: 'POST',
                        headers: { 
                            'X-User-ID': userId,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ max_attempts: val })
                    });
                    const data = await response.json();
                    if (data.success) {
                        btnSave.innerText = "✅";
                        setTimeout(() => {
                            btnSave.innerText = t3('share_btn_save');
                            btnSave.disabled = false;
                        }, 2000);
                        if (window.DashboardManager) DashboardManager.loadExams();
                    } else {
                        alert(t3('share_err_toggle') + ' ' + data.message);
                        btnSave.innerText = t3('share_btn_save');
                        btnSave.disabled = false;
                    }
                } catch (err) {
                    console.error(err);
                    alert(t3('share_err_connect'));
                    btnSave.innerText = t3('share_btn_save');
                    btnSave.disabled = false;
                }
            };
        }

        this.initMonitorWebSocket(examId);
    },

    initMonitorWebSocket(examId) {
        const userJson = localStorage.getItem('user');
        const userData = userJson ? JSON.parse(userJson) : null;
        const tier = userData?.tier || 'GUEST';

        // CHỈ CHO PHÉP PREMIUM / PRO / ADMIN SỬ DỤNG REALTIME
        const allowedTiers = ['PREMIUM_1', 'PREMIUM_2', 'PREMIUM_3', 'GIFT_PRO', 'ADMIN'];

        if (!allowedTiers.includes(tier)) {
            this.showUpgradePrompt();
            return;
        }

        const wsUrl = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsHost = window.location.host;
        this.wsMonitor = new WebSocket(`${wsUrl}//${wsHost}/api/room/${examId}`);

        this.wsMonitor.onopen = () => {
            console.log("🟢 [Monitor] Đã kết nối vào Phòng thi!");
            this.wsMonitor.send(JSON.stringify({ type: 'TEACHER_JOIN' }));
        };

        this.wsMonitor.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'SYNC_STUDENTS') {
                    this.updateStudentGrid(data.students);
                }
            } catch (err) {
                console.error("❌ [Monitor] Parse error:", err);
            }
        };

        this.wsMonitor.onclose = () => {
            console.log("🔴 [Monitor] Đã ngắt kết nối");
        };
    },

    showUpgradePrompt() {
        const grid = document.getElementById('studentGrid');
        if (!grid) return;
        const t = typeof I18n !== 'undefined' ? (k) => I18n.t(k) : (k) => k;

        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px 20px; background: linear-gradient(135deg, rgba(251, 191, 36, 0.05) 0%, rgba(245, 158, 11, 0.05) 100%); border: 1px dashed #fbbf24; border-radius: 24px;">
                <div style="font-size: 40px; margin-bottom: 15px;">☕</div>
                <h4 style="color: #fbbf24; margin: 0 0 10px 0; font-size: 18px;">${t('room_pro_required_title')}</h4>
                <p style="color: #94a3b8; font-size: 13px; line-height: 1.6; margin-bottom: 20px;">${t('room_pro_required_desc')}</p>
                <button onclick="DashboardUI.showPremiumModal()" style="padding: 10px 25px; background: #fbbf24; color: #000; border: none; border-radius: 10px; font-weight: 800; cursor: pointer; transition: 0.3s;">${t('room_pro_btn_contact')}</button>
            </div>
        `;
    },

    updateStudentGrid(students) {
        const grid = document.getElementById('studentGrid');
        const count = document.getElementById('studentCount');
        if (!grid || !count) return;

        const t = typeof I18n !== 'undefined' ? (k) => I18n.t(k) : (k) => k;
        count.innerText = students.length;

        if (students.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 80px; color: #475569; border: 2px dashed rgba(255,255,255,0.05); border-radius: 30px; font-weight: 500;">${t('room_waiting')}</div>`;
            return;
        }

        grid.innerHTML = '';
        students.forEach(st => {
            const color = st.status === 'online' ? '#22c55e' : '#64748b';
            const item = document.createElement('div');
            item.className = 'student-monitor-item';
            Object.assign(item.style, {
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)',
                padding: '15px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: '0.2s',
                position: 'relative'
            });

            item.innerHTML = `
                <div style="width: 10px; height: 10px; border-radius: 50%; background: ${color}; box-shadow: 0 0 10px ${color}80;"></div>
                <div style="flex: 1; overflow: hidden;">
                    <div style="color: #fff; font-weight: 600; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${st.name || t('room_student_anon')}</div>
                    <div style="color: #94a3b8; font-size: 12px; margin-top: 4px;">${t('room_progress_label')}: <b style="color: #38bdf8;">${st.progress || '0%'}</b></div>
                </div>
                <button class="btn-kick" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: #ef4444; color: white; border: none; width: 28px; height: 28px; border-radius: 8px; font-size: 14px; cursor: pointer; display: none; align-items: center; justify-content: center; transition: 0.2s;">
                    ✕
                </button>
            `;

            item.onmouseenter = () => {
                item.style.background = 'rgba(239, 68, 68, 0.05)';
                item.style.borderColor = 'rgba(239, 68, 68, 0.2)';
                item.querySelector('.btn-kick').style.display = 'flex';
            };
            item.onmouseleave = () => {
                item.style.background = 'rgba(255,255,255,0.03)';
                item.style.borderColor = 'rgba(255,255,255,0.05)';
                item.querySelector('.btn-kick').style.display = 'none';
            };

            item.querySelector('.btn-kick').onclick = () => this.kickStudent(st.id, st.name);

            grid.appendChild(item);
        });
    },

    kickStudent(studentId, name) {
        const t = typeof I18n !== 'undefined' ? (k) => I18n.t(k) : (k) => k;
        const msg = `${t('room_kick_confirm')} "${name}"?`;
        if (!confirm(msg)) return;

        if (this.wsMonitor && this.wsMonitor.readyState === WebSocket.OPEN) {
            this.wsMonitor.send(JSON.stringify({
                type: 'KICK_STUDENT',
                studentId: studentId
            }));
            console.log(`📡 [Monitor] Đã gửi lệnh kick học sinh: ${studentId}`);
        }
    },

    async showStatsModal(examId) {
        const overlay = DashboardUI.createModalOverlay();
        const t = typeof I18n !== 'undefined' ? (k) => I18n.t(k) : (k) => k;
        overlay.innerHTML = `
            <div style="max-width: 850px; margin: 0 auto; width: 100%; animation: modalPop 0.4s ease;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                    <h2 style="margin: 0; font-size: 24px; font-weight: 800; color: #fff;">📊 ${t('stats_title')}</h2>
                    <div style="display: flex; gap: 10px;">
                        <button id="btnExportStats" style="display: none; background: #22c55e; border: none; color: #fff; padding: 8px 20px; border-radius: 10px; cursor: pointer; font-weight: 700; font-size: 13px;">📥 ${t('stats_export')}</button>
                        <button id="btnCloseStats" style="background: rgba(255,255,255,0.05); border: none; color: #94a3b8; padding: 8px 20px; border-radius: 10px; cursor: pointer;">${t('close')}</button>
                    </div>
                </div>
                <div id="statsContent" style="min-height: 300px; display: flex; align-items: center; justify-content: center;">
                    <div class="loader"></div>
                </div>
            </div>
        `;

        const closeBtn = document.getElementById('btnCloseStats');
        if (closeBtn) closeBtn.onclick = () => DashboardUI.closeModal();

        overlay.onclick = (e) => {
            if (e.target === overlay) DashboardUI.closeModal();
        };

        try {
            const res = await fetch(`/api/exam/results/${examId}`);
            const data = await res.json();
            const content = document.getElementById('statsContent');

            if (!data.success || !data.results || data.results.length === 0) {
                content.innerHTML = `<div style="text-align: center; color: #64748b;">${t('stats_no_results')}</div>`;
                return;
            }

            const results = data.results;
            const avg = (results.reduce((s, r) => s + r.score, 0) / results.length).toFixed(1);
            const high = results.filter(r => r.score >= 8).length;
            const warnTotal = results.reduce((s, r) => s + (r.warning_count || 0), 0);

            content.innerHTML = `
                <div style="width: 100%;">
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px;">
                        <div style="background: rgba(255,255,255,0.03); padding: 20px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); text-align: center;">
                            <div style="color: #64748b; font-size: 12px; margin-bottom: 5px;">${t('stats_submissions')}</div>
                            <div style="font-size: 24px; font-weight: 800; color: #fff;">${results.length}</div>
                        </div>
                        <div style="background: rgba(255,255,255,0.03); padding: 20px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); text-align: center;">
                            <div style="color: #64748b; font-size: 12px; margin-bottom: 5px;">${t('stats_avg_score')}</div>
                            <div style="font-size: 24px; font-weight: 800; color: #8b5cf6;">${avg}</div>
                        </div>
                        <div style="background: rgba(255,255,255,0.03); padding: 20px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); text-align: center;">
                            <div style="color: #64748b; font-size: 12px; margin-bottom: 5px;">${t('stats_high_score')}</div>
                            <div style="font-size: 24px; font-weight: 800; color: #22c55e;">${high}</div>
                        </div>
                        <div style="background: rgba(255,255,255,0.03); padding: 20px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); text-align: center;">
                            <div style="color: #64748b; font-size: 12px; margin-bottom: 5px;">${t('stats_total_warn')}</div>
                            <div style="font-size: 24px; font-weight: 800; color: #ef4444;">${warnTotal}</div>
                        </div>
                    </div>

                    <div style="background: rgba(0,0,0,0.2); border-radius: 20px; overflow: hidden; border: 1px solid rgba(255,255,255,0.05);">
                        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                            <thead style="background: rgba(255,255,255,0.05);">
                                <tr style="color: #94a3b8; text-align: left;">
                                    <th style="padding: 15px 20px;">${t('stats_col_student')}</th>
                                    <th style="padding: 15px 20px;">${t('stats_col_score')}</th>
                                    <th style="padding: 15px 20px;">${t('stats_col_correct')}</th>
                                    <th style="padding: 15px 20px;">${t('stats_col_warn')}</th>
                                    <th style="padding: 15px 20px;">${t('stats_col_time')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${results.map(r => `
                                    <tr style="border-top: 1px solid rgba(255,255,255,0.03); color: #e2e8f0;">
                                        <td style="padding: 15px 20px; font-weight: 600;">${r.student_name}</td>
                                        <td style="padding: 15px 20px;"><b style="color: ${r.score >= 5 ? '#22c55e' : '#ef4444'}">${r.score.toFixed(1)}</b></td>
                                        <td style="padding: 15px 20px;">${r.total_correct}/${r.total_questions}</td>
                                        <td style="padding: 15px 20px; color: ${r.warning_count > 0 ? '#f59e0b' : '#64748b'}">${r.warning_count || 0} ` + t('stats_times') + `</td>
                                        <td style="padding: 15px 20px; color: #64748b; font-size: 12px;">${new Date(r.created_at).toLocaleString(typeof I18n !== 'undefined' && I18n.locale === 'vi' ? 'vi-VN' : 'en-US')}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;

            // Show and init export button
            const btnExport = document.getElementById('btnExportStats');
            if (btnExport) {
                btnExport.style.display = 'block';
                btnExport.onclick = () => this.exportStatsToExcel(examId, results);
            }
        } catch (err) {
            console.error(err);
            document.getElementById('statsContent').innerHTML = `<div style="color: #ef4444;">` + t('stats_load_error') + `</div>`;
        }
    },

    exportStatsToExcel(examId, results) {
        if (!results || results.length === 0) return;
        const t = typeof I18n !== 'undefined' ? (k) => I18n.t(k) : (k) => k;

        // Create HTML table for Excel (preserves UTF-8 and formatting better than CSV)
        let html = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
            <head><meta charset="utf-8"></head>
            <body>
                <table border="1">
                    <tr style="background-color: #8b5cf6; color: white; font-weight: bold;">
                        <th>${t('stats_col_student')}</th>
                        <th>${t('stats_col_score')}</th>
                        <th>${t('stats_col_correct')}</th>
                        <th>${t('stats_col_warn')}</th>
                        <th>${t('stats_col_time')}</th>
                    </tr>
        `;

        results.forEach(r => {
            html += `
                <tr>
                    <td>${r.student_name}</td>
                    <td>${r.score.toFixed(1)}</td>
                    <td>${r.total_correct}/${r.total_questions}</td>
                    <td>${r.warning_count || 0}</td>
                    <td>${new Date(r.created_at).toLocaleString()}</td>
                </tr>
            `;
        });

        html += `</table></body></html>`;

        const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        let fileName = examId;
        if (examId.includes('__')) {
            fileName = examId.split('__')[1];
        }
        a.download = `${fileName}.xls`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
};

// Re-render exam cards khi doi ngon ngu
window.addEventListener('languageChanged', () => {
    if (window.DashboardManager && typeof DashboardManager.loadExams === 'function') {
        DashboardManager.loadExams();
    }
});


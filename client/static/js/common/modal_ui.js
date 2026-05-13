window.ModalUI = {
    // ------------------------------------------------------------------------
    // 1. UTILS (Khởi tạo và đóng Modal)
    // ------------------------------------------------------------------------
    createOverlay() {
        let overlay = document.getElementById('dynamicModalOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'dynamicModalOverlay';
            document.body.appendChild(overlay);
        }
        Object.assign(overlay.style, {
            display: 'flex',
            position: 'fixed',
            top: '0', left: '0',
            width: '100vw', height: '100vh',
            background: 'rgba(10, 10, 10, 0.8)',
            backdropFilter: 'blur(15px)',
            zIndex: '100000',
            flexDirection: 'column',
            padding: '40px 20px',
            overflowY: 'auto',
            textAlign: 'center'
        });
        return overlay;
    },

    closeAll() {
        const dynamicOverlay = document.getElementById('dynamicModalOverlay');
        const staticOverlay = document.querySelector('#page-dashboard .modal-overlay') || document.querySelector('.modal-overlay');
        const generalModal = document.getElementById('generalModal');
        const cancelModal = document.getElementById('cancelModal');
        const quotaModal = document.getElementById('quotaModal');

        if (dynamicOverlay) {
            dynamicOverlay.style.display = 'none';
            dynamicOverlay.innerHTML = '';
        }
        if (staticOverlay) {
            staticOverlay.style.display = 'none';
            staticOverlay.style.backdropFilter = 'none';
        }
        if (generalModal) generalModal.style.display = 'none';
        if (cancelModal) cancelModal.style.display = 'none';
        if (quotaModal) quotaModal.remove();

        if (typeof SessionManager !== 'undefined') SessionManager.setActiveModal(null);
    },

    // ------------------------------------------------------------------------
    // 2. DASHBOARD MODALS UI
    // ------------------------------------------------------------------------
    renderShareModal(overlay, link) {
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
                        <button id="btnCopyLink" style="padding: 0 35px; background: linear-gradient(135deg, #0095ff 0%, #0070f3 100%); color: #fff; font-weight: 800; border-radius: 14px; cursor: pointer; border: none; box-shadow: 0 4px 15px rgba(0, 149, 255, 0.3); transition: 0.3s;">
                            ${t('share_copy')}
                        </button>
                    </div>
                </div>

                <div style="margin-bottom: 30px;">
                    <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); padding: 25px; border-radius: 24px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                            <h4 style="margin: 0; color: #fff; font-size: 16px;">${t('share_student_limit')}</h4>
                            <span id="limitLabel" style="background: linear-gradient(to right, #0095ff, #00d2ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 900; font-size: 22px;">50</span>
                        </div>
                        <input type="range" id="studentSlider" min="10" max="200" step="10" value="50" 
                            style="width: 100%; accent-color: var(--color-primary); cursor: pointer;">
                    </div>
                </div>

                <div>
                    <h3 style="color: #94a3b8; font-size: 16px; margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
                        ${t('share_doing')} <span id="studentCount" style="background: linear-gradient(135deg, #0095ff, #0070f3); color: #fff; font-size: 12px; font-weight: 800; padding: 3px 10px; border-radius: 20px; box-shadow: 0 4px 10px rgba(0, 149, 255, 0.2);">0</span>
                    </h3>
                    <div id="studentGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; max-height: 250px; overflow-y: auto; padding-right: 10px;">
                        <div style="grid-column: 1/-1; text-align: center; padding: 80px; color: #475569; border: 2px dashed rgba(255,255,255,0.05); border-radius: 30px; font-weight: 500;">
                            ${t('room_waiting')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    updateStudentGrid(students) {
        const t = typeof I18n !== 'undefined' ? (k) => I18n.t(k) : (k) => k;
        const grid = document.getElementById('studentGrid');
        const count = document.getElementById('studentCount');
        if (!grid || !count) return;

        count.innerText = students.length;

        if (students.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 80px; color: #475569; border: 2px dashed rgba(255,255,255,0.05); border-radius: 30px; font-weight: 500;">
                    ${t('room_waiting')}
                </div>`;
            return;
        }

        let html = "";
        students.forEach(st => {
            const color = st.status === 'online' ? '#22c55e' : '#64748b';
            html += `
                <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 15px; border-radius: 16px; display: flex; align-items: center; gap: 12px; transition: 0.2s;">
                    <div style="width: 10px; height: 10px; border-radius: 50%; background: ${color}; box-shadow: 0 0 10px ${color}80;"></div>
                    <div style="flex: 1; overflow: hidden;">
                        <div style="color: #fff; font-weight: 600; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${st.name || t('room_student_anon')}</div>
                        <div style="color: #94a3b8; font-size: 12px; margin-top: 4px;">${t('room_progress_label')}: <b style="color: #38bdf8;">${st.progress || '0%'}</b></div>
                    </div>
                </div>
            `;
        });
        grid.innerHTML = html;
    },

    renderUpgradePrompt() {
        const t = typeof I18n !== 'undefined' ? (k) => I18n.t(k) : (k) => k;
        const grid = document.getElementById('studentGrid');
        if (!grid) return;

        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px 20px; background: linear-gradient(135deg, rgba(251, 191, 36, 0.05) 0%, rgba(245, 158, 11, 0.05) 100%); border: 1px dashed #fbbf24; border-radius: 24px;">
                <div style="font-size: 40px; margin-bottom: 15px;">👑</div>
                <h4 style="color: #fbbf24; margin: 0 0 10px 0; font-size: 18px;">${t('room_pro_required_title')}</h4>
                <p style="color: #94a3b8; font-size: 13px; line-height: 1.6; margin-bottom: 20px;">
                    ${t('room_pro_required_desc')}
                </p>
                <button onclick="window.location.href='/#pricing'" style="padding: 10px 25px; background: #fbbf24; color: #000; border: none; border-radius: 10px; font-weight: 800; cursor: pointer; transition: 0.3s;">
                    ${t('room_pro_btn_contact')}
                </button>
            </div>
        `;
    },

    renderPremiumModal(overlay, bankConfig, qrUrl) {
        const t = typeof I18n !== 'undefined' ? (k) => I18n.t(k) : (k) => k;
        overlay.innerHTML = `
            <div class="modal-box" style="padding: 30px; max-width: 450px; text-align: center; background: #0f172a; border: 1px solid rgba(251, 191, 36, 0.2); border-radius: 28px; box-shadow: 0 25px 60px rgba(0,0,0,0.6); animation: modalPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);">
                <h2 style="margin-top:0; font-size: 26px; font-weight: 800; background: linear-gradient(to right, #fbbf24, #f59e0b); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${t('pro_modal_title')}</h2>
                <p style="color: #94a3b8; font-size: 14px; margin-bottom: 25px;">${t('pro_modal_sub')}</p>
                
                <div id="premium-features-list" style="text-align: left; background: rgba(255,255,255,0.03); padding: 20px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 25px;">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 15px;">
                        <span style="font-size: 20px;">👁️</span>
                        <div>
                            <div style="color: #fff; font-weight: 700; font-size: 14px;">${t('pro_feat1_title')}</div>
                            <div style="color: #64748b; font-size: 12px;">${t('pro_feat1_sub')}</div>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 15px;">
                        <span style="font-size: 20px;">📁</span>
                        <div>
                            <div style="color: #fff; font-weight: 700; font-size: 14px;">${t('pro_feat2_title')}</div>
                            <div style="color: #64748b; font-size: 12px;">${t('pro_feat2_sub')}</div>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 15px;">
                        <span style="font-size: 20px;">⏳</span>
                        <div>
                            <div style="color: #fff; font-weight: 700; font-size: 14px;">${t('pro_feat3_title')}</div>
                            <div style="color: #64748b; font-size: 12px;">${t('pro_feat3_sub')}</div>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="font-size: 20px;">👥</span>
                        <div>
                            <div style="color: #fff; font-weight: 700; font-size: 14px;">${t('pro_feat4_title')}</div>
                            <div style="color: #64748b; font-size: 12px;">${t('pro_feat4_sub')}</div>
                        </div>
                    </div>
                </div>

                <div id="payment-step" style="display: none;">
                    <div style="background: rgba(251, 191, 36, 0.05); padding: 25px; border-radius: 24px; border: 1px dashed #fbbf24; margin: 20px 0; text-align: center;">
                         <div style="font-size: 40px; margin-bottom: 15px;">🚧</div>
                         <h4 style="color: #fbbf24; margin-bottom: 10px; font-size: 18px;">${t('pro_maintenance_title')}</h4>
                         <p style="color: #94a3b8; font-size: 13px; line-height: 1.6;">${t('pro_maintenance_desc')}</p>
                    </div>
                    <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                        <a href="https://zalo.me/0961416095" target="_blank" style="flex: 1; padding: 14px; background: #0068ff; color: #fff; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 14px; text-align: center;">${t('pro_btn_zalo')}</a>
                        <a href="https://www.facebook.com/share/g/1BqahgKoqA/" target="_blank" style="flex: 1; padding: 14px; background: #1877f2; color: #fff; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 14px; text-align: center;">${t('pro_btn_community')}</a>
                    </div>
                </div>

                <button id="btnShowPayment" style="width: 100%; padding: 16px; background: #fbbf24; color: #000; border: none; border-radius: 12px; font-weight: 800; cursor: pointer; transition: 0.3s;">${t('pro_btn_upgrade')}</button>
                <button id="btnCancelPayment" style="margin-top: 15px; background: transparent; border: none; color: #64748b; cursor: pointer; font-size: 14px;">${t('pro_btn_later')}</button>
            </div>
        `;

        // Logic chuyển bước
        const btnShow = overlay.querySelector('#btnShowPayment');
        const paymentStep = overlay.querySelector('#payment-step');
        const featuresList = overlay.querySelector('#premium-features-list');
        const btnCancel = overlay.querySelector('#btnCancelPayment');

        if (btnShow && paymentStep) {
            btnShow.onclick = () => {
                btnShow.style.display = 'none';
                featuresList.style.display = 'none';
                paymentStep.style.display = 'block';
                if (btnCancel) btnCancel.innerText = t('pro_btn_back');
            };
        }

        overlay.style.display = 'flex';
        overlay.style.backdropFilter = 'blur(15px)';
    },

    renderQuotaModal(isGuest, title, content, btnAction, btnText, btnBg, btnColor) {
        const t = typeof I18n !== 'undefined' ? (k) => I18n.t(k) : (k) => k;
        const modalHtml = `
            <div id="quotaModal" class="modal-overlay" style="display:flex; z-index: 100001; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); align-items: center; justify-content: center; backdrop-filter: blur(8px);">
                <div class="modal-box" style="max-width: 400px; text-align: center; padding: 30px; border-radius: 24px; background: #0f172a; border: 1px solid rgba(255,255,255,0.05);">
                    <div style="font-size: 50px; margin-bottom: 15px;">${isGuest ? '🔐' : '👑'}</div>
                    <h2 style="margin-bottom: 10px; font-size: 22px; color: #fff;">${title}</h2>
                    <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin-bottom: 25px;">${content}</p>
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        <button onclick="${btnAction}" class="btn-done" style="width: 100%; padding: 14px; background: ${btnBg}; color: ${btnColor}; border: none; border-radius: 12px; font-weight: 800; cursor: pointer; transition: 0.3s;">${btnText}</button>
                        <button onclick="ModalUI.closeAll()" style="background: transparent; border: none; color: #64748b; cursor: pointer; font-size: 13px; font-weight: 600;">${t('quota_btn_later')}</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    renderSorryQuotaModal(content) {
        const t = typeof I18n !== 'undefined' ? (k) => I18n.t(k) : (k) => k;
        const modalHtml = `
            <div id="quotaModal" class="modal-overlay" style="display:flex; z-index: 100001; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); align-items: center; justify-content: center; backdrop-filter: blur(8px);">
                <div class="modal-box" style="max-width: 400px; text-align: center; padding: 35px; border-radius: 30px; background: #0f172a; border: 1px solid rgba(255,255,255,0.05); animation: modalPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);">
                    <div style="font-size: 60px; margin-bottom: 20px;">😥</div>
                    <h2 style="margin-bottom: 12px; font-size: 24px; color: #fff; font-weight: 800;">${t('sorry_title')}</h2>
                    <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin-bottom: 30px;">${content}</p>
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        <button onclick="ModalUI.closeAll()" style="width: 100%; padding: 16px; background: #fbbf24; color: #000; border: none; border-radius: 14px; font-weight: 800; cursor: pointer; transition: 0.3s; box-shadow: 0 4px 15px rgba(251, 191, 36, 0.2);">${t('sorry_understood')}</button>
                        <button onclick="ModalUI.closeAll(); if(window.DashboardUI) DashboardUI.showPremiumModal()" style="background: transparent; border: none; color: #64748b; cursor: pointer; font-size: 13px; font-weight: 600; text-decoration: underline;">${t('sorry_upgrade_link')}</button>
                    </div>
                </div>
            </div>
        `;
        const old = document.getElementById('quotaModal');
        if (old) old.remove();
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    renderStatsModal(overlay) {
        overlay.innerHTML = `
            <div style="max-width: 850px; margin: 0 auto; width: 100%; animation: modalPop 0.4s ease;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                    <h2 style="margin: 0; font-size: 24px; font-weight: 800; color: #fff;">📊 Thống kê kết quả</h2>
                    <button id="btnCloseStats" style="background: rgba(255,255,255,0.05); border: none; color: #94a3b8; padding: 8px 20px; border-radius: 10px; cursor: pointer;">Đóng</button>
                </div>
                <div id="statsContent" style="min-height: 300px; display: flex; align-items: center; justify-content: center;">
                    <div class="loader"></div>
                </div>
            </div>
        `;
    },

    renderStatsContent(results, avg, high, warnTotal) {
        const content = document.getElementById('statsContent');
        if (!content) return;

        if (results.length === 0) {
            content.innerHTML = `<div style="text-align: center; color: #64748b;">Chưa có học sinh nào nộp bài.</div>`;
            return;
        }

        content.innerHTML = `
            <div style="width: 100%;">
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px;">
                    <div style="background: rgba(255,255,255,0.03); padding: 20px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); text-align: center;">
                        <div style="color: #64748b; font-size: 12px; margin-bottom: 5px;">Số bài nộp</div>
                        <div style="font-size: 24px; font-weight: 800; color: #fff;">${results.length}</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.03); padding: 20px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); text-align: center;">
                        <div style="color: #64748b; font-size: 12px; margin-bottom: 5px;">Điểm trung bình</div>
                        <div style="font-size: 24px; font-weight: 800; color: #8b5cf6;">${avg}</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.03); padding: 20px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); text-align: center;">
                        <div style="color: #64748b; font-size: 12px; margin-bottom: 5px;">Giỏi (>= 8)</div>
                        <div style="font-size: 24px; font-weight: 800; color: #22c55e;">${high}</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.03); padding: 20px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); text-align: center;">
                        <div style="color: #64748b; font-size: 12px; margin-bottom: 5px;">Tổng cảnh báo</div>
                        <div style="font-size: 24px; font-weight: 800; color: #ef4444;">${warnTotal}</div>
                    </div>
                </div>

                <div style="background: rgba(0,0,0,0.2); border-radius: 20px; overflow: hidden; border: 1px solid rgba(255,255,255,0.05);">
                    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                        <thead style="background: rgba(255,255,255,0.05);">
                            <tr style="color: #94a3b8; text-align: left;">
                                <th style="padding: 15px 20px;">Học sinh</th>
                                <th style="padding: 15px 20px;">Điểm</th>
                                <th style="padding: 15px 20px;">Đúng</th>
                                <th style="padding: 15px 20px;">Cảnh báo</th>
                                <th style="padding: 15px 20px;">Thời gian</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${results.map(r => `
                                <tr style="border-top: 1px solid rgba(255,255,255,0.03); color: #e2e8f0;">
                                    <td style="padding: 15px 20px; font-weight: 600;">${r.student_name}</td>
                                    <td style="padding: 15px 20px;"><b style="color: ${r.score >= 5 ? '#22c55e' : '#ef4444'}">${r.score.toFixed(1)}</b></td>
                                    <td style="padding: 15px 20px;">${r.total_correct}/${r.total_questions}</td>
                                    <td style="padding: 15px 20px; color: ${r.warning_count > 0 ? '#f59e0b' : '#64748b'}">${r.warning_count || 0} lần</td>
                                    <td style="padding: 15px 20px; color: #64748b; font-size: 12px;">${new Date(r.created_at).toLocaleString('vi-VN')}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    renderSuccessModal(overlay, data) {
        overlay.innerHTML = `
            <div class="modal-box" style="padding: 35px; max-width: 380px; text-align: center; border: 1px solid rgba(0, 149, 255, 0.2); background: var(--bg-modal, #0f172a); border-radius: 28px; box-shadow: 0 25px 60px rgba(0,0,0,0.4); animation: modalPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);">
                <div style="font-size: 60px; margin-bottom: 20px; filter: drop-shadow(0 10px 15px rgba(0,0,0,0.2));">✨</div>
                <h3 style="margin-bottom: 15px; font-size: 22px; font-weight: 800; background: linear-gradient(to right, #0095ff, #a29bfe); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Hoàn tất xuất sắc!</h3>
                
                <div style="text-align: left; font-size: 14px; color: #94a3b8; background: rgba(255,255,255,0.02); padding: 20px; border-radius: 18px; margin-bottom: 25px; border: 1px solid rgba(255,255,255,0.05);">
                    <p style="margin: 0 0 8px 0;">📂 Đề: <b style="color: #0026ffff;">${data.name || 'Chưa đặt tên'}</b></p>
                    <p style="margin: 0;">🚀 Trạng thái: <span style="color: #22c55e; font-weight: 700;">Đã chuẩn hóa</span></p>
                    <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.05); margin: 15px 0;">
                    <p style="color: #ef4444; font-size: 11px; font-style: italic;">* Tải file ngay để lưu trữ vĩnh viễn trên máy.</p>
                </div>

                <button id="btnDownloadNow" style="width: 100%; padding: 16px; font-size: 16px; background: linear-gradient(135deg, #0095ff 0%, #0070f3 100%); border: none; color: #fff; font-weight: 800; border-radius: 14px; cursor: pointer; box-shadow: 0 8px 20px rgba(0, 149, 255, 0.3); transition: 0.3s;">
                    TẢI FILE (.zestest)
                </button>
                <button id="btnSkip" style="margin-top: 18px; background: transparent; border: none; color: #64748b; cursor: pointer; font-size: 14px; font-weight: 600; transition: 0.2s;">
                    Quay lại Dashboard
                </button>
            </div>
        `;
        overlay.style.display = 'flex';
        overlay.style.backdropFilter = 'blur(8px)';
    },

    // ------------------------------------------------------------------------
    // 3. CREATION MODALS UI (Tạo đề)
    // ------------------------------------------------------------------------
    setupGeneralModal({ title, showRange, showAudio, isAudioReq, showMaster, contentHtml, footerHtml, typeKey, isGuest }) {
        const modal = document.getElementById('generalModal');
        modal.querySelector('.modal-box').className = 'modal-box diamond-style';

        document.getElementById('general-modal-title').innerText = title;
        document.getElementById('range-input-section').style.display = showRange ? 'flex' : 'none';

        const audioSection = document.getElementById('audio-setup-section');
        audioSection.style.display = showAudio ? 'block' : 'none';
        if (showAudio) {
            const badge = document.getElementById('audio-badge');
            const dropzone = document.getElementById('audio-dropzone');
            const statusText = dropzone.querySelector('.file-status');

            if (isGuest) {
                dropzone.classList.add('locked-zone');
                if (statusText) statusText.innerHTML = `<span style="color: #f87171; font-weight: 800;">🔒 ĐĂNG NHẬP ĐỂ DÙNG AUDIO</span>`;
                badge.style.display = 'none';
                dropzone.onclick = () => {
                    if (window.loginGoogle) window.loginGoogle();
                };
            } else {
                dropzone.classList.remove('locked-zone');
                dropzone.onclick = () => document.getElementById('audio-file-input').click();
                badge.style.display = 'inline-block';
                if (isAudioReq) {
                    badge.className = 'badge-req';
                    badge.innerText = I18n.t('mandatory');
                    dropzone.classList.add('req-zone');
                } else {
                    badge.className = 'badge-opt';
                    badge.innerText = I18n.t('optional');
                    dropzone.classList.remove('req-zone');
                }
                if (statusText) statusText.innerText = I18n.t('audio_placeholder');
            }
        }

        const masterArea = document.getElementById('master-input-section');
        masterArea.style.display = showMaster ? 'block' : 'none';

        if (showMaster) {
            const masterInput = document.getElementById('modal-master-input');
            masterInput.value = "";
            masterInput.oninput = (e) => {
                const from = parseInt(document.getElementById('input-from').value);
                const to = parseInt(document.getElementById('input-to').value);
                if (typeof distributeMasterToRows === "function") {
                    distributeMasterToRows(e.target.value, from, to, typeKey);
                }
            };
        }

        const footer = document.getElementById('general-modal-footer');
        if (footer) {
            footer.style.display = 'flex';
            footer.innerHTML = footerHtml || '';
        }

        const container = document.getElementById('dynamic-rows-container');
        if (container) {
            container.style.display = 'block';
            container.innerHTML = contentHtml || '';
        }
        modal.style.display = 'flex';
    },

    getTypeGridHtml() {
        return `
        <div class="type-grid">
            <label class="type-option"><input type="radio" name="type" value="abcd" checked> <span data-i18n="abcd">ABCD</span></label>
            <label class="type-option"><input type="radio" name="type" value="listening"> <span data-i18n="listening">Nghe</span></label>
            <label class="type-option"><input type="radio" name="type" value="true_false"> <span data-i18n="true_false">Đúng/Sai</span></label>
            <label class="type-option"><input type="radio" name="type" value="essay"> <span data-i18n="essay">Trả Lời Ngắn</span></label>
        </div>`;
    },

    getAnswerInputHtml(type, qNum, val) {
        if (type === 'abcd' || type === 'listening') {
            const bubbles = ['A', 'B', 'C', 'D'].map(c => `
            <label class="choice-bubble">
                <input type="radio" name="ans_${qNum}" value="${c}" ${val === c ? 'checked' : ''}>
                <span>${c}</span>
            </label>
        `).join('');
            return `<div class="abcd-bubble-group">${bubbles}</div>`;
        }

        if (type === 'true_false') {
            const labels = I18n.t('tf_labels').split(',');
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

    renderGiftModal(overlay, file) {
        overlay.innerHTML = `
            <div class="modal-box" style="padding: 40px; max-width: 450px; text-align: center; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border: 2px solid #fbbf24; border-radius: 30px; box-shadow: 0 0 30px rgba(251, 191, 36, 0.3); animation: modalPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);">
                <div style="font-size: 60px; margin-bottom: 20px;">🎁</div>
                <h2 style="color: #fbbf24; margin-bottom: 15px; font-weight: 900;">QUÀ TẶNG BẤT NGỜ!</h2>
                <p style="color: #e2e8f0; font-size: 15px; line-height: 1.6; margin-bottom: 25px;">
                    Dung lượng file của bạn (<b>${(file.size / 1024 / 1024).toFixed(1)}MB</b>) vượt quá hạn mức miễn phí. 
                    <br><br>
                    Nhưng vì bạn là người dùng tiềm năng, Zestest tặng bạn gói <b>GIFT PRO</b>: 
                    <br>✅ <b>Mở khóa Audio nặng</b>
                    <br>✅ <b>Lưu trữ đề thi 3 ngày</b> (thay vì 24h)
                </p>
                <button id="btn-accept-gift" style="width: 100%; padding: 16px; background: #fbbf24; color: #000; border: none; border-radius: 15px; font-weight: 900; cursor: pointer; font-size: 16px; transition: 0.3s;">
                    NHẬN QUÀ & TIẾP TỤC 🚀
                </button>
            </div>
        `;
        overlay.style.display = 'flex';
    },

    updateAudioDropzoneUI(dropzone, statusEl, file) {
        if (file) {
            dropzone.classList.add('has-file');
            statusEl.removeAttribute('data-i18n');
            statusEl.innerHTML = `
                <div style="font-size: 28px; margin-bottom: 5px;">✅</div>
                <div style="color: #166534; font-weight: 800; font-size: 15px; word-break: break-all; padding: 0 10px;">${file.name}</div>
                <div style="color: #15803d; font-size: 11px; margin-top: 5px;">Đã nhận file Audio - Nhấn để đổi</div>
            `;
        } else {
            dropzone.classList.remove('has-file');
            statusEl.setAttribute('data-i18n', 'audio_placeholder');
            const placeholder = (typeof I18n !== 'undefined') ? I18n.t('audio_placeholder') : "Nhấn vào đây để tải file (.mp3, .wav)";
            statusEl.innerHTML = placeholder;
        }
    }
};

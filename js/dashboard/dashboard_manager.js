/**
 * FILE: js/dashboard/dashboard_manager.js
 * Quản lý logic điều hướng và trạng thái hoàn tất đề thi (Giao diện Premium Update)
 */
const DashboardManager = {
    
    // 1. Kiểm tra trạng thái hoàn thành
    async checkFinalStatus() {
        const isSuccess = localStorage.getItem('zestest_last_status') === 'success';
        if (isSuccess) {
            const data = await StorageManager.loadMeta();
            if (!data) return;
            this.showSuccessModal(data);
            localStorage.removeItem('zestest_last_status');
        }
    },

    async showShareModal(examId) {
        const userId = ClientInternal.getExistingId();
        const raw = await SendRQ(userId, 'GEN_LINK', { 
            user_id: userId, 
            exam_id: examId 
        });
        
        const res = Receiver.processResponse(raw);
        const overlay = document.querySelector('.modal-overlay');
        if (!overlay) return;

        if (!res.success) {
            this.showError(overlay, res.message);
            return;
        }

        const link = res.data.link;

        // BIẾN OVERLAY THÀNH FULL-SCREEN VỚI BLUR NHẸ
        Object.assign(overlay.style, {
            display: 'flex',
            position: 'fixed',
            top: '0', left: '0',
            width: '100vw', height: '100vh',
            background: 'rgba(10, 10, 10, 0.8)',
            backdropFilter: 'blur(12px)',
            zIndex: '1000',
            flexDirection: 'column',
            padding: '40px 20px',
            overflowY: 'auto'
        });

        overlay.innerHTML = `
            <div style="max-width: 900px; margin: 0 auto; width: 100%; animation: modalPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);">
                <!-- HEADER & CLOSE -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px;">
                    <h2 style="margin: 0; font-size: 28px; font-weight: 800; background: linear-gradient(to right, var(--color-primary), #a29bfe); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">🚀 Quản lý phòng thi</h2>
                    <button id="btnCloseShare" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; padding: 10px 22px; border-radius: 12px; cursor: pointer; font-weight: 600; transition: 0.3s;">Đóng (Esc)</button>
                </div>

                <!-- PHẦN 1: LINK SAO CHÉP -->
                <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); padding: 30px; border-radius: 24px; margin-bottom: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
                    <p style="margin: 0 0 12px 0; font-size: 14px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Link chia sẻ cho học sinh</p>
                    <div style="display: flex; gap: 15px;">
                        <input type="text" id="shareLinkInput" value="${link}" readonly 
                            style="flex: 1; background: #000; border: 1px solid #1e293b; color: var(--color-primary); padding: 16px; border-radius: 14px; font-family: 'JetBrains Mono', monospace; font-size: 15px; outline: none; box-shadow: inset 0 2px 4px rgba(0,0,0,0.5);">
                        <button id="btnCopyLink" style="padding: 0 35px; background: linear-gradient(135deg, #0095ff 0%, #0070f3 100%); color: #fff; font-weight: 800; border-radius: 14px; cursor: pointer; border: none; box-shadow: 0 4px 15px rgba(0, 149, 255, 0.3); transition: 0.3s;">
                            📋 Sao chép
                        </button>
                    </div>
                </div>

                <!-- PHẦN 2: SETTINGS -->
                <div style="display: grid; grid-template-columns: 1fr 1.5fr; gap: 20px; margin-bottom: 40px;">
                    <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); padding: 25px; border-radius: 24px; display: flex; align-items: center; justify-content: space-between;">
                        <div>
                            <h4 style="margin: 0; color: #fff; font-size: 16px;">Chống gian lận</h4>
                            <p style="margin: 4px 0 0; font-size: 12px; color: #64748b;">Khóa tab & chặn Copy/Paste</p>
                        </div>
                        <label class="switch-ui">
                            <input type="checkbox" id="antiCheatToggle">
                            <span class="slider-ui"></span>
                        </label>
                    </div>

                    <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); padding: 25px; border-radius: 24px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                            <h4 style="margin: 0; color: #fff; font-size: 16px;">Giới hạn học sinh</h4>
                            <span id="limitLabel" style="background: linear-gradient(to right, #0095ff, #00d2ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 900; font-size: 22px;">50</span>
                        </div>
                        <input type="range" id="studentSlider" min="10" max="200" step="10" value="50" 
                            style="width: 100%; accent-color: var(--color-primary); cursor: pointer;">
                    </div>
                </div>

                <!-- PHẦN 3: DANH SÁCH -->
                <div>
                    <h3 style="color: #94a3b8; font-size: 16px; margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
                        👥 Đang làm bài <span id="studentCount" style="background: linear-gradient(135deg, #0095ff, #0070f3); color: #fff; font-size: 12px; font-weight: 800; padding: 3px 10px; border-radius: 20px; box-shadow: 0 4px 10px rgba(0, 149, 255, 0.2);">0</span>
                    </h3>
                    <div id="studentGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px;">
                        <div style="grid-column: 1/-1; text-align: center; padding: 80px; color: #475569; border: 2px dashed rgba(255,255,255,0.05); border-radius: 30px; font-weight: 500;">
                            Hệ thống đã sẵn sàng. Đợi học sinh join...
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.initShareModalEvents(link);
    },

    initShareModalEvents(link) {
        const btnCopy = document.getElementById('btnCopyLink');
        btnCopy.onclick = async function() {
            await navigator.clipboard.writeText(link);
            const original = this.innerHTML;
            this.innerHTML = "✅ Xong!";
            this.style.filter = "hue-rotate(90deg)"; // Chuyển sang màu xanh lá nhẹ
            setTimeout(() => {
                this.innerHTML = original;
                this.style.filter = "none";
            }, 2000);
        };

        const slider = document.getElementById('studentSlider');
        const label = document.getElementById('limitLabel');
        slider.oninput = function() { label.innerText = this.value; };

        document.getElementById('antiCheatToggle').onchange = function() {
            console.log(`[Zestest] Anti-cheat: ${this.checked}`);
        };

        document.getElementById('btnCloseShare').onclick = () => this.closeModal();
    },

    // 2. MODAL THÀNH CÔNG (Sau khi tạo xong đề)
    showSuccessModal(data) {
        const overlay = document.querySelector('#page-dashboard .modal-overlay') || document.querySelector('.modal-overlay');
        if (!overlay) return;

        overlay.innerHTML = `
            <div class="modal-box" style="padding: 35px; max-width: 380px; text-align: center; border: 1px solid rgba(0, 149, 255, 0.2); background: var(--bg-modal); border-radius: 28px; box-shadow: 0 25px 60px rgba(0,0,0,0.4); animation: modalPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);">
                <div style="font-size: 60px; margin-bottom: 20px; filter: drop-shadow(0 10px 15px rgba(0,0,0,0.2));">✨</div>
                <h3 style="margin-bottom: 15px; font-size: 22px; font-weight: 800; background: linear-gradient(to right, #0095ff, #a29bfe); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Hoàn tất xuất sắc!</h3>
                
                <div style="text-align: left; font-size: 14px; color: #94a3b8; background: rgba(255,255,255,0.02); padding: 20px; border-radius: 18px; margin-bottom: 25px; border: 1px solid rgba(255,255,255,0.05);">
                    <p style="margin: 0 0 8px 0;">📂 Đề: <b style="color: #fff;">${data.name || 'Chưa đặt tên'}</b></p>
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

        document.getElementById('btnDownloadNow').onclick = async function() {
            this.disabled = true;
            this.innerHTML = "⌛ Đang nén file...";
            const success = await PackageEngine.download(data);
            if (success) {
                this.innerHTML = "✅ Đã xong!";
                setTimeout(() => DashboardManager.closeModal(), 1500);
            } else {
                this.disabled = false;
                this.innerHTML = "TẢI FILE (.zestest)";
            }
        };

        document.getElementById('btnSkip').onclick = () => this.closeModal();
    },

    closeModal() {
        const overlay = document.querySelector('#page-dashboard .modal-overlay') || document.querySelector('.modal-overlay');
        if (overlay) {
            overlay.style.display = 'none';
            overlay.style.backdropFilter = 'none';
        }
    },

    // Các hàm điều hướng giữ nguyên logic của Đại
    async goToCreate() {
        const data = await StorageManager.loadMeta();
        if (data && data.status === "processing") {
            const confirmContinue = confirm("Bạn có muốn TIẾP TỤC làm đề đang dở không?");
            if (confirmContinue) {
                this.switchToCreatePage();
                return;
            }
        }
        await this.forceClearAndStartNew();
    },

    async forceClearAndStartNew() {
        await StorageManager.clearAll();
        if (typeof SessionManager !== 'undefined') {
            SessionManager.clearSession();
            SessionManager.clearModalDraft();
        }
        StorageManager.createNewExamData();
        this.switchToCreatePage();
    },

    switchToCreatePage() {
        if (typeof showPage === 'function') {
            showPage('create-steps-page');
        } else if (typeof Navigation !== 'undefined' && Navigation.show) {
            Navigation.show('page-create-steps');
        } else {
            document.getElementById('dashboard-page').style.display = 'none';
            document.getElementById('create-steps-page').style.display = 'block';
        }
    },

    renderStudents(list) {
        const grid = document.getElementById('studentGrid');
        const count = document.getElementById('studentCount');
        if (!grid || !list) return;

        count.innerText = list.length;
        if (list.length === 0) return;

        grid.innerHTML = list.map(student => `
            <div class="student-card" style="background: rgba(255,255,255,0.02); padding: 18px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); transition: 0.3s; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                    <div style="width: 10px; height: 10px; border-radius: 50%; background: ${student.online ? '#22c55e' : '#ef4444'}; box-shadow: 0 0 10px ${student.online ? '#22c55e' : '#ef4444'};"></div>
                    <strong style="color: #fff; font-size: 15px;">${student.name}</strong>
                </div>
                <div style="font-size: 13px; color: #64748b;">
                    Hoàn thành: <span style="color: var(--color-primary); font-weight: 800;">${student.progress}%</span>
                </div>
            </div>
        `).join('');
    }
};
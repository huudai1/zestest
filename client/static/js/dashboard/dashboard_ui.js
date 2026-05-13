/**
 * FILE: js/dashboard/dashboard_ui.js
 * Quản lý các thành phần giao diện động (Modals, Notifications, Overlays)
 */
window.DashboardUI = {
    createModalOverlay() {
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

    closeModal() {
        const dynamicOverlay = document.getElementById('dynamicModalOverlay');
        const staticOverlay = document.querySelector('#page-dashboard .modal-overlay') || document.querySelector('.modal-overlay');

        if (dynamicOverlay) {
            dynamicOverlay.style.display = 'none';
            dynamicOverlay.innerHTML = '';
        }
        if (staticOverlay) {
            staticOverlay.style.display = 'none';
            staticOverlay.style.backdropFilter = 'none';
        }
        
        // Dọn dẹp modal quota nếu có
        const quotaModal = document.getElementById('quotaModal');
        if (quotaModal) quotaModal.remove();
    },

    showSuccessModal(data) {
        const overlay = document.querySelector('#page-dashboard .modal-overlay') || document.querySelector('.modal-overlay');
        if (!overlay) return;

        overlay.innerHTML = `
            <div class="modal-box" style="padding: 35px; max-width: 380px; text-align: center; border: 1px solid rgba(0, 149, 255, 0.2); background: var(--bg-modal); border-radius: 28px; box-shadow: 0 25px 60px rgba(0,0,0,0.4); animation: modalPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);">
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

        document.getElementById('btnDownloadNow').onclick = async function () {
            this.disabled = true;
            this.innerHTML = "⌛ Đang nén file...";
            const success = await PackageEngine.download(data);
            if (success) {
                this.innerHTML = "✅ Đã xong!";
                if (typeof SessionManager !== 'undefined') SessionManager.clearAll();
                if (typeof Step1Handler !== 'undefined') Step1Handler.clearAll();
                setTimeout(() => DashboardUI.closeModal(), 1500);
            } else {
                this.disabled = false;
                this.innerHTML = "TẢI FILE (.zestest)";
            }
        };

        document.getElementById('btnSkip').onclick = () => {
            this.closeModal();
            if (typeof SessionManager !== 'undefined') SessionManager.clearAll();
            if (typeof Step1Handler !== 'undefined') Step1Handler.clearAll();
        };
    },

    showQuotaModal(message) {
        const tier = IdentityManager.getTier();
        const isGuest = tier === 'GUEST';

        let title = isGuest ? "Đăng nhập để tiếp tục" : "Bạn đã hết lượt tạo đề";
        let content = isGuest
            ? "Hạng GUEST hiện tại chỉ hỗ trợ tối đa 1 đề thi để thử nghiệm. Bạn đăng nhập ngay để nhận thêm nhiều slot và lưu trữ đề thi lâu dài nhé! ❤️"
            : "Hệ thống rất tiếc vì tài khoản của bạn đã hết slot lưu trữ. Để đảm bảo mọi người đều có trải nghiệm mượt mà và duy trì chi phí máy chủ, bạn vui lòng xóa bớt đề cũ hoặc nâng cấp PRO để mở rộng kho lưu trữ nhé! ❤️";

        let btnText = isGuest ? "Đăng nhập ngay" : "Nâng cấp Premium";
        let btnAction = isGuest ? "window.location.href='/login'" : "ModalUI.closeAll(); DashboardUI.showPremiumModal()";
        let btnBg = isGuest ? "var(--primary-blue)" : "#fbbf24";
        let btnColor = isGuest ? "#fff" : "#000";

        const modalHtml = `
            <div id="quotaModal" class="modal-overlay" style="display:flex; z-index: 100001;">
                <div class="modal-box" style="max-width: 400px; text-align: center; padding: 30px; border-radius: 24px; background: #0f172a; border: 1px solid rgba(255,255,255,0.05);">
                    <div style="font-size: 50px; margin-bottom: 15px;">${isGuest ? '🔐' : '👑'}</div>
                    <h2 style="margin-bottom: 10px; font-size: 22px; color: #fff;">${title}</h2>
                    <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin-bottom: 25px;">${content}</p>
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        <button onclick="${btnAction}" class="btn-done" style="width: 100%; padding: 14px; background: ${btnBg}; color: ${btnColor}; border: none; border-radius: 12px; font-weight: 800; cursor: pointer; transition: 0.3s;">${btnText}</button>
                        <button onclick="document.getElementById('quotaModal').remove()" style="background: transparent; border: none; color: #64748b; cursor: pointer; font-size: 13px; font-weight: 600;">Để sau</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    async showPremiumModal() {
        const userId = IdentityManager.getUserId();
        const bankConfig = {
            amount: 99000,
            description: `ZESTEST PRO ${userId}`
        };
        const qrUrl = `https://img.vietqr.io/image/MB-0359874495-compact2.png?amount=${bankConfig.amount}&addInfo=${encodeURIComponent(bankConfig.description)}`;

        if (typeof ModalUI !== 'undefined') {
            const overlay = ModalUI.createOverlay();
            ModalUI.renderPremiumModal(overlay, bankConfig, qrUrl);

            const btnDone = document.getElementById('btnPaymentDone');
            const btnCancel = document.getElementById('btnCancelPayment');

            if (btnDone) {
                btnDone.onclick = () => {
                    alert("Cảm ơn Captain! Hệ thống đang kiểm tra giao dịch của bạn. Vui lòng đợi trong giây lát.");
                    ModalUI.closeAll();
                };
            }
            if (btnCancel) btnCancel.onclick = () => ModalUI.closeAll();
        } else {
            alert("Tính năng Nâng cấp đang được bảo trì. Vui lòng thử lại sau!");
        }
    },

    showError(overlay, message) {
        if (!overlay) return;
        overlay.innerHTML = `
            <div style="color: #ef4444; padding: 40px;">
                <h3>❌ Lỗi</h3>
                <p>${message}</p>
                <button onclick="DashboardUI.closeModal()" style="margin-top: 20px; padding: 10px 20px; border-radius: 8px; border: none; background: #334155; color: white; cursor: pointer;">Đóng</button>
            </div>
        `;
    }
};

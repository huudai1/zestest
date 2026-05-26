const DashboardAnalytics = {
    openModal() {
        const modal = document.getElementById('analyticsModal');
        if (!modal) return;
        
        // Render content
        this.renderContent();
        
        modal.style.display = 'flex';
    },

    closeModal() {
        const modal = document.getElementById('analyticsModal');
        if (modal) modal.style.display = 'none';
    },

    renderContent() {
        const content = document.getElementById('analytics-content');
        if (!content) return;

        content.innerHTML = `
            <div class="analytics-tabs">
                <button class="tab-btn active" onclick="DashboardAnalytics.switchTab('history', event)">Lịch sử Thi</button>
                <button class="tab-btn" onclick="DashboardAnalytics.switchTab('export', event)">Xuất Điểm (Excel)</button>
            </div>
            
            <div id="analytics-history" class="analytics-section">
                <div class="filter-bar">
                    <input type="text" class="form-input search-input" placeholder="🔍 Tìm học sinh, email...">
                    <select class="form-input filter-select">
                        <option>Tất cả thời gian</option>
                        <option>Tháng này</option>
                    </select>
                </div>
                <div class="empty-state">
                    <div class="empty-icon">📊</div>
                    <p>Chưa có dữ liệu</p>
                    <span>Chia sẻ đề và yêu cầu học sinh đăng nhập để hệ thống theo dõi lịch sử.</span>
                </div>
            </div>

            <div id="analytics-export" class="analytics-section" style="display: none;">
                <p style="color: var(--text-sub); margin-bottom: 15px; font-size: 14px;">Chọn bộ lọc để tải xuống dữ liệu một cách gọn gàng nhất.</p>
                
                <div class="form-group">
                    <label class="form-label">Chọn Đề Thi</label>
                    <select class="form-input" id="export-exam-select">
                        <option value="all">Tất cả đề đang mở</option>
                    </select>
                </div>
                
                <button class="btn-action primary" style="width: 100%; margin-top: 20px;" onclick="DashboardAnalytics.exportExcel(this)">
                    ⬇️ Tải Xuống Excel
                </button>
            </div>
        `;

        this.loadHistoryData();
    },

    async loadHistoryData() {
        const historyContainer = document.getElementById('analytics-history');
        if (!historyContainer) return;

        try {
            const teacherId = window.IdentityManager ? window.IdentityManager.getUserId() : null;

            if (!teacherId) throw new Error("Chưa đăng nhập.");

            const res = await fetch(`/api/analytics?teacher_id=${teacherId}`);
            const data = await res.json();

            if (data.success && data.data.length > 0) {
                let html = '<div class="history-list" style="max-height: 400px; overflow-y: auto; margin-top: 15px;">';
                data.data.forEach(item => {
                    const date = new Date(item.created_at).toLocaleString('vi-VN');
                    html += `
                        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 15px; border-radius: 12px; margin-bottom: 10px;">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                                <div>
                                    <h4 style="margin: 0 0 5px 0; color: #fff; font-size: 15px;">${item.student_name} <span style="font-size: 12px; color: #94a3b8; font-weight: normal;">(${item.student_uid || 'Khách'})</span></h4>
                                    <p style="margin: 0; color: #64748b; font-size: 12px;">Đề: ${item.exam_name} • ${date}</p>
                                </div>
                                <div style="text-align: right;">
                                    <div style="font-size: 18px; font-weight: 800; color: ${item.score >= 50 ? '#10b981' : '#ef4444'}">${item.score} đ</div>
                                    <div style="font-size: 11px; color: #94a3b8;">${item.total_correct}/${item.total_questions} đúng</div>
                                </div>
                            </div>
                            <div style="margin-top: 10px; font-size: 13px;">
                                <input type="text" class="form-input" placeholder="Nhận xét của giáo viên..." value="${item.teacher_comment || ''}"
                                    onblur="DashboardAnalytics.saveComment(${item.id}, this.value)" style="padding: 8px; font-size: 12px; background: rgba(0,0,0,0.2);">
                            </div>
                        </div>
                    `;
                });
                html += '</div>';

                // Thay thế empty state bằng danh sách
                const emptyState = historyContainer.querySelector('.empty-state');
                if (emptyState) emptyState.remove();
                historyContainer.insertAdjacentHTML('beforeend', html);
                
                // Lưu dữ liệu để dùng cho Export
                this.historyData = data.data;
            }
        } catch (e) {
            console.error("Lỗi tải lịch sử:", e);
        }
    },

    async saveComment(resultId, comment) {
        try {
            await fetch('/api/analytics/comment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ result_id: resultId, comment: comment })
            });
        } catch (e) {
            console.error("Lỗi lưu nhận xét:", e);
        }
    },

    exportExcel(btn) {
        if (!this.historyData || this.historyData.length === 0) {
            alert("Không có dữ liệu để xuất.");
            return;
        }

        btn.innerText = "⏳ Đang xuất...";
        
        let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
        csvContent += "Tên Học Sinh,Tài khoản,Tên Đề,Điểm,Số câu đúng,Cảnh báo gian lận,Thời gian nộp,Nhận xét\n";

        this.historyData.forEach(item => {
            const date = new Date(item.created_at).toLocaleString('vi-VN');
            const row = [
                `"${item.student_name}"`,
                `"${item.student_uid || 'Khách'}"`,
                `"${item.exam_name}"`,
                item.score,
                `"${item.total_correct}/${item.total_questions}"`,
                item.warning_count,
                `"${date}"`,
                `"${item.teacher_comment || ''}"`
            ].join(',');
            csvContent += row + "\r\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Zestest_Analytics_${new Date().getTime()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        btn.innerText = "✅ Đã tải xuống!";
        setTimeout(() => { btn.innerText = "⬇️ Tải Xuống Excel"; }, 2000);
    },

    switchTab(tabId, event) {
        document.querySelectorAll('#analytics-content .analytics-section').forEach(el => el.style.display = 'none');
        document.querySelectorAll('#analytics-content .tab-btn').forEach(el => el.classList.remove('active'));
        
        document.getElementById(`analytics-${tabId}`).style.display = 'block';
        if (event) {
            event.currentTarget.classList.add('active');
        }
    }
};

const ExamCard = {
    async render() {
        const container = document.getElementById('exam-container');
        if (!container) return;

        const data = await StorageManager.loadMeta();
        container.innerHTML = '';

        if (!data || !data.name) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📁</div>
                    <p>Chưa có đề thi nào được tạo</p>
                    <span>Bấm "Create" phía trên để bắt đầu ngay nhé!</span>
                </div>`;
            return;
        }

        const card = document.createElement('div');
        card.className = 'exam-card';
        const timeDisplay = data.duration ? `${data.duration} phút` : "Chưa đặt";
        card.innerHTML = `
            <div class="exam-header">
                <div class="exam-title">${data.name}</div>
                <div class="exam-time">⏱ ${timeDisplay}</div>
            </div>
            <div class="btn-group">
                <button class="btn-action btn-share" 
    onclick="DashboardManager.showShareModal('${data.id}')">
    Giao bài
</button>
                <button class="btn-action">Sửa</button>
                <button class="btn-action">Info</button>
                <button class="btn-action btn-delete">Del</button>
            </div>`;
        container.appendChild(card);
    }
};
/**
 * FILE: step2_card_render.js
 * Nhiệm vụ: Render danh sách Card từ Object Sections trong Storage
 */
const Step2CardRender = {
    /**
     * Vẽ lại toàn bộ danh sách Card trong #main-type-list
     */
    renderRangeList() {
    const container = document.getElementById('main-type-list');
    if (!container) return;

    const sectionsEntries = Object.entries(StorageManager.examData.sections || {});
    container.innerHTML = '';

    if (sectionsEntries.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding: 30px 10px; background: rgba(255,255,255,0.02); border-radius: 12px; border: 1px dashed #333;">
                <p style="color:#666; font-size:13px; margin:0;">Chưa có loại câu hỏi bổ sung.</p>
            </div>`;
        return;
    }

    sectionsEntries.forEach(([sectionId, data]) => {
        const card = document.createElement('div');
        card.className = 'type-card'; 
        
        const displayType = this._getFriendlyName(data.type);
        const [fromQ, toQ] = data.range;

        card.innerHTML = `
            <div class="card-info">
                <div class="card-title">${displayType}</div>
                <div class="card-range">Câu ${fromQ} - ${toQ}</div>
                ${data.audio ? '<div class="card-audio-tag">🎧 Đã tải Audio</div>' : ''}
            </div>
            <div class="card-actions">
                <button class="btn-card-edit" onclick="Step2CardLogic.editRange('${sectionId}')">Sửa</button>
                <button class="btn-card-delete" onclick="Step2CardLogic.deleteRange('${sectionId}')">Xóa</button>
            </div>
        `;
        container.appendChild(card);
    });
},

    /**
     * Chuyển key hệ thống thành tên tiếng Việt dễ hiểu
     */
    _getFriendlyName(typeKey) {
        const mapping = {
            'abcd': 'Trắc nghiệm ABCD',
            'true_false': 'Đúng / Sai',
            'input': 'Điền đáp án',
            'listening': 'Phần Nghe'
        };
        return mapping[typeKey] || typeKey.toUpperCase();
    }
};

// Gán hàm vào window để các file khác (navigation.js) gọi được
window.renderRangeList = () => Step2CardRender.renderRangeList();
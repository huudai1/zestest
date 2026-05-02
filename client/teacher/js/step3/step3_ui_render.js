const ABCD_ReadRange = {
    renderInputs: function() {
        const container = document.getElementById('abcd-fields-container');
        const data = StorageManager.examData;
        if (!data || !container) return;

        container.innerHTML = '';
        let itemsHTML = '<div class="final-preview-grid">';
        const sections = Object.values(data.sections).sort((a, b) => a.range[0] - b.range[0]);

        sections.forEach(sec => {
            sec.answers.forEach((ans, index) => {
                const qNum = sec.range[0] + index;
                const isEssay = (sec.type === 'essay' || sec.type === 'short_answer');
                const typeClass = isEssay ? 'item-essay' : (sec.type === 'true_false' ? 'true_false' : 'abcd');
                const typeIcon = sec.type === 'listening' ? '<i class="fas fa-headphones"></i>' : '';
                
                // Xử lý chuỗi để truyền vào onclick an toàn
                const safeAns = (ans || "").toString().replace(/'/g, "\\'");

                itemsHTML += `
                    <div class="q-box ${typeClass}" 
                         onclick="ABCD_Controller.quickEdit(${qNum}, '${sec.type}', '${safeAns}')">
                        <div class="q-info">Câu ${qNum} ${typeIcon}</div>
                        <div class="q-value">${ans || '?'}</div>
                    </div>`;
            });
        });

        container.innerHTML = itemsHTML + '</div>';
    }
};
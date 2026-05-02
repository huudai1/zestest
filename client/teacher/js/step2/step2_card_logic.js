const Step2CardLogic = {
    async deleteRange(sectionId) {
        if (confirm("Bạn có chắc chắn muốn xóa vùng câu hỏi này?")) {
            await StorageManager.removeSection(sectionId);
            if (typeof renderRangeList === "function") renderRangeList();
        }
    },



    editRange(sectionId) {
        const section = StorageManager.examData.sections[sectionId];
        if (!section) return;

        Step2ModalLogic.editingId = sectionId;
        
        // Đổ ngược range vào input chính để logic save đồng bộ
        document.getElementById('input-from').value = section.range[0];
        document.getElementById('input-to').value = section.range[1];

        Step2ModalLogic.openEditor(section.type, section.range, section.answers);
    }
};
/**
 * Phân phối dữ liệu từ ô Master xuống các hàng đáp án bên dưới
 */
window.distributeMasterToRows = function(rawText, from, to, type) {
    if (!rawText) return;

    const totalInRange = (to - from) + 1;
    let parsedData = [];

    if (type === 'abcd' || type === 'listening') {
        parsedData = UniversalNormalizer.parse(rawText, totalInRange);
    } else if (type === 'true_false') {
        parsedData = UniversalNormalizer.parseTrueFalse(rawText, totalInRange);
    } else if (type === 'essay') {
        parsedData = UniversalNormalizer.parseEssay(rawText, totalInRange);
    }

    parsedData.forEach((val, index) => {
        const currentQNum = from + index;
        if (!val) return;

        if (type === 'abcd' || type === 'listening') {
            const radio = document.querySelector(`input[name="ans_${currentQNum}"][value="${val}"]`);
            if (radio) radio.checked = true;
        } 
        else if (type === 'true_false') {
            // T/F thường lưu value là "T" hoặc "F"
            const radio = document.querySelector(`input[name="ans_${currentQNum}"][value="${val}"]`);
            if (radio) {
                radio.checked = true;
            } else {
                // Dự phòng nếu value trên UI của ông là "True"/"False" thay vì "T"/"F"
                const fullVal = (val === 'T') ? "True" : "False";
                const radioFull = document.querySelector(`input[name="ans_${currentQNum}"][value="${fullVal}"]`);
                if (radioFull) radioFull.checked = true;
            }
        } 
        else {
            const input = document.querySelector(`input[name="ans_${currentQNum}"]`);
            if (input) input.value = val;
        }
    });

    console.log(`⚡ [Master Input] Đã phân phối cho loại ${type}.`);
};
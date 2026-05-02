const RangeValidator = {
    validate: function(from, to, existingSections = {}, excludeId = null) {
        if (typeof SessionManager !== 'undefined' && SessionManager.getStep() === 3) {
            from = parseInt(from);
            to = parseInt(to);
            if (isNaN(from) || isNaN(to)) return { isValid: false, message: "Vui lòng nhập đầy đủ số câu!" };
            if (from <= 0 || to <= 0) return { isValid: false, message: "Số câu phải lớn hơn 0!" };
            if (from > to) return { isValid: false, message: "Câu bắt đầu không được lớn hơn câu kết thúc!" };
        return { isValid: true };
        }
        // 1. Ép kiểu số để tránh so sánh chuỗi
        from = parseInt(from);
        to = parseInt(to);

        if (isNaN(from) || isNaN(to)) {
            return { isValid: false, message: "Vui lòng nhập đầy đủ số câu!" };
        }
        if (from <= 0 || to <= 0) {
            return { isValid: false, message: "Số câu phải lớn hơn 0!" };
        }
        if (from > to) {
            return { isValid: false, message: "Câu bắt đầu không được lớn hơn câu kết thúc!" };
        }

        // 2. Chuyển đổi Object Map thành Array để lặp
        // Nếu truyền vào Object, ta lấy entries để có cả ID và Data
        const sectionsEntries = Object.entries(existingSections);

        for (const [id, section] of sectionsEntries) {
            // KIỂM TRA LOẠI TRỪ: Nếu ID trùng với editingId thì bỏ qua không check trùng
            if (excludeId && id === excludeId) {
                continue;
            }

            const [exFrom, exTo] = section.range;

            // Thuật toán Overlap chuẩn: (StartA <= EndB) && (EndA >= StartB)
            if (from <= exTo && to >= exFrom) {
                const typeLabel = (section.type || "N/A").toUpperCase();
                return { 
                    isValid: false, 
                    message: `Vùng ${from}-${to} bị trùng lấn với "${typeLabel}" (${exFrom}-${exTo})!` 
                };
            }
        }

        return { isValid: true };
    }
};
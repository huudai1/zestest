const UniversalNormalizer = {
    parse: function(rawText, total = 0) {
        const cleaned = TypeChecker.clean(rawText);
        if (!cleaned) return [];

        // BƯỚC 1: Tìm các cặp Số + Chữ (ví dụ: 101A, 11B)
        // Regex: (\d+) là nhóm số, ([A-D]) là nhóm chữ cái đáp án
        const pairRegex = /(\d+)([A-D])/g;
        const matches = [...cleaned.matchAll(pairRegex)];

        // BƯỚC 2: Kiểm tra tính hợp lệ và Xử lý Fallback (Chỉ có chữ cái)
        if (matches.length === 0) {
            console.log("[Normalizer] Không tìm thấy cặp Số-Chữ. Thử tìm chuỗi chữ cái liên tục...");
            const simpleLetters = cleaned.match(/[A-D]/g);
            if (simpleLetters && simpleLetters.length > 0) {
                let result = total > 0 ? new Array(total).fill("") : [];
                simpleLetters.forEach((letter, index) => {
                    if (total === 0 || index < total) {
                        result[index] = letter;
                    }
                });
                console.log(`[Normalizer] Đã nhận diện ${simpleLetters.length} đáp án theo thứ tự.`);
                return result;
            }
            console.warn("[Normalizer] Không tìm thấy đáp án hợp lệ.");
            return [];
        }

        // BƯỚC 3: Trích xuất và Sắp xếp theo số gốc
        let pairs = matches.map(m => ({
            originalNum: parseInt(m[1]),
            ans: m[2]
        }));

        pairs.sort((a, b) => a.originalNum - b.originalNum);

        // BƯỚC 4: Đổi số và đổ vào mảng kết quả
        let result = total > 0 ? new Array(total).fill("") : [];
        let mappingLog = [];

        // Tính toán offset nếu dải số bắt đầu vượt quá tổng số câu
        let offset = 0;
        if (total > 0 && pairs.length > 0 && pairs[0].originalNum > total) {
            offset = pairs[0].originalNum - 1;
            console.log(`[Normalizer] Dải đáp án vượt quá tổng số câu (${total}). Áp dụng offset: -${offset}`);
        }

        pairs.forEach(pair => {
            let newNum;
            if (offset > 0) {
                // Áp dụng offset để dời về bắt đầu từ 1
                newNum = pair.originalNum - offset;
            } else {
                // Logic cũ nếu không có offset (ví dụ 101 -> 1)
                newNum = pair.originalNum % 100 === 0 ? 100 : pair.originalNum % 100;
            }
            
            if (total === 0 || newNum <= total) {
                result[newNum - 1] = pair.ans;
                mappingLog.push(`${pair.originalNum}${pair.ans} -> ${newNum}${pair.ans}`);
            }
        });

        console.log("[Normalizer] Kết quả định danh:", mappingLog.join(", "));
        return result;
    }
};
const UniversalNormalizer = {
    parse: function(rawText, total = 0) {
        const cleaned = TypeChecker.clean(rawText);
        if (!cleaned) return [];

        // BƯỚC 1: Tìm các cặp Số + Chữ (ví dụ: 101A, 11B)
        // Regex: (\d+) là nhóm số, ([A-D]) là nhóm chữ cái đáp án
        const pairRegex = /(\d+)([A-D])/g;
        const matches = [...cleaned.matchAll(pairRegex)];

        // BƯỚC 2: Kiểm tra tính hợp lệ
        // Nếu không bắt được cặp nào (kiểu ABCDD... hoặc 12345...ABCD) => Hủy
        if (matches.length === 0) {
            console.warn("[Normalizer] Dữ liệu không có cặp Số-Chữ rõ ràng. Huỷ bỏ.");
            return [];
        }

        // BƯỚC 3: Trích xuất và Sắp xếp theo số gốc
        let pairs = matches.map(m => ({
            originalNum: parseInt(m[1]),
            ans: m[2]
        }));

        pairs.sort((a, b) => a.originalNum - b.originalNum);

        // BƯỚC 4: Đổi số và đổ vào mảng kết quả
        // Logic đổi số: Lấy số gốc % 100 (Ví dụ 101 -> 1, 205 -> 5) 
        // Hoặc nếu ông muốn 101, 103, 111 thành 1, 3, 11 thì dùng logic này:
        let result = total > 0 ? new Array(total).fill("") : [];
        let mappingLog = [];

        pairs.forEach(pair => {
            // Đổi số: 101 -> 1, 111 -> 11
            const newNum = pair.originalNum % 100 === 0 ? 100 : pair.originalNum % 100;
            
            if (total === 0 || newNum <= total) {
                result[newNum - 1] = pair.ans;
                mappingLog.push(`${pair.originalNum}${pair.ans} -> ${newNum}${pair.ans}`);
            }
        });

        console.log("[Normalizer] Kết quả định danh:", mappingLog.join(", "));
        return result;
    }
};
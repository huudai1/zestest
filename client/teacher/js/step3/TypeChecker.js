const TypeChecker = {
    clean: function(rawText) {
        if (!rawText) return "";
        // Loại bỏ sạch sành sanh, chỉ giữ lại A-Z và 0-9
        return rawText.replace(/[^0-9A-Za-z]/g, "").toUpperCase();
    }
};
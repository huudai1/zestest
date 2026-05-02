const TerminalMagic = {
    // Log dành cho Step 1 (Xử lý file đầu vào)
    webp_logs: [
        "analyzing_structure",  // Sẽ map qua I18n sau
        "init_security_hash",
        "compressing_webp",
        "optimizing_layers",
        "caching_metadata"
    ],
    
    // Log dành cho Step 3 (Đóng gói .zestest)
    zestest_logs: [
        "sorting_sections",
        "encoding_audio",
        "generating_zestest_file",
        "finalizing_package"
    ],

    async start(containerId, logType = 'webp') {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = "";
        const targetLogs = logType === 'webp' ? this.webp_logs : this.zestest_logs;
        
        for (let key of targetLogs) {
            const line = document.createElement("div");
            line.className = "log-line";
            
            // Sử dụng I18n để lấy text theo ngôn ngữ
            line.innerHTML = `<span class="log-cursor">></span> ${I18n.t(key)}`;
            
            container.appendChild(line);
            container.scrollTop = container.scrollHeight;
            
            // Hiệu ứng delay tạo cảm giác tính toán
            await new Promise(r => setTimeout(r, 300 + Math.random() * 400));
        }
    }
};
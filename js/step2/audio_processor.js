/**
 * FILE: js/audio_processor.js
 * Nhiệm vụ: Xử lý nén âm thanh đa nhân (Parallel Processing) chuẩn Zestest
 */
const AudioProcessor = {
    pool: [],
    isLoaded: false,
    isLoading: false,
    numWorkers: 2, // Số lượng nhân chạy song song

    // Khởi tạo các nhân FFmpeg (Pre-load)
    async init() {
        if (this.isLoaded || this.isLoading) return;
        this.isLoading = true;

        // Kiểm tra quyền SharedArrayBuffer (Cần cho đa luồng)
        if (!window.SharedArrayBuffer) {
            console.error("❌ [Audio Engine] COOP/COEP chưa được bật. Không thể chạy đa nhân!");
            this.isLoading = false;
            return;
        }

        try {
            const { createFFmpeg } = FFmpeg;
            const corePath = 'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js';

            console.log(`⏳ [Audio Engine] Đang nạp ${this.numWorkers} nhân xử lý...`);
            
            const loaders = [];
            for (let i = 0; i < this.numWorkers; i++) {
                const f = createFFmpeg({ 
                    log: false, 
                    corePath: corePath 
                });
                loaders.push(f.load().then(() => f));
            }

            this.pool = await Promise.all(loaders);
            this.isLoaded = true;
            this.isLoading = false;
            console.log("🚀 [Audio Engine] Multi-core Ready!");
        } catch (error) {
            console.error("❌ [Audio Engine] Init Failed:", error);
            this.isLoading = false;
        }
    },

    /**
     * Hàm nén file siêu tốc bằng kỹ thuật Chunking & Parallel
     * @param {File} file - File audio gốc từ input
     */
    async processToZestestStandard(file) {
        if (!this.isLoaded) await this.init();
        if (this.pool.length === 0) throw new Error("FFmpeg Engine not initialized");

        console.log(`--- [Audio Engine] Bắt đầu tối ưu: ${file.name} ---`);
        
        // 1. Chia nhỏ file (Chunking) - Mỗi đoạn 4MB
        const CHUNK_SIZE = 4 * 1024 * 1024;
        const chunks = [];
        for (let i = 0; i < file.size; i += CHUNK_SIZE) {
            chunks.push({ 
                id: chunks.length, 
                blob: file.slice(i, i + CHUNK_SIZE) 
            });
        }

        const queue = [...chunks];
        const taskMap = new Map();
        const total = chunks.length;
        let finished = 0;

        // 2. Hàm thực thi của từng Worker
        const runWorker = async (ffmpeg, workerId) => {
            while (queue.length > 0) {
                const task = queue.shift();
                const inName = `raw_${task.id}`;
                const outName = `part_${task.id}.mp3`;

                try {
                    const data = new Uint8Array(await task.blob.arrayBuffer());
                    ffmpeg.FS('writeFile', inName, data);

                    // Nén từng đoạn: 16kHz, Mono, 24k
                    await ffmpeg.run('-i', inName, '-ac', '1', '-ar', '16000', '-b:a', '24k', outName);
                    
                    const result = ffmpeg.FS('readFile', outName);
                    taskMap.set(task.id, { name: outName, data: result });

                    // Giải phóng RAM ngay cho Worker
                    ffmpeg.FS('unlink', inName);
                    finished++;
                    console.log(`[Luồng ${workerId}] Xong đoạn ${finished}/${total}`);
                } catch (err) {
                    console.error(`[Luồng ${workerId}] Lỗi đoạn ${task.id}:`, err);
                }
            }
        };

        // 3. Kích hoạt tất cả nhân chạy song song
        await Promise.all(this.pool.map((ffmpeg, i) => runWorker(ffmpeg, i + 1)));

        // 4. Hợp nhất (Merge) các đoạn đã nén
        console.log("--- [Audio Engine] Đang hợp nhất dữ liệu... ---");
        const main = this.pool[0];
        const concatList = [];

        for (let i = 0; i < total; i++) {
            const item = taskMap.get(i);
            main.FS('writeFile', item.name, item.data);
            concatList.push(`file '${item.name}'`);
        }

        main.FS('writeFile', 'list.txt', concatList.join('\n'));
        
        // Dùng lệnh concat với copy stream (siêu nhanh vì không phải nén lại lần 2)
        await main.run('-f', 'concat', '-safe', '0', '-i', 'list.txt', '-c', 'copy', 'final.mp3');

        // Thay đoạn cuối của processToZestestStandard()

        const finalData = main.FS('readFile', 'final.mp3');
        const finalBlob = new Blob([finalData.buffer], { type: 'audio/mp3' });

// Dọn rác
        for (let i = 0; i < total; i++) {
        try { main.FS('unlink', `part_${i}.mp3`); } catch(e) {}
        }
        main.FS('unlink', 'list.txt');
        main.FS('unlink', 'final.mp3');

    console.log(`✅ [Audio Engine] Hoàn tất! Size: ${(finalBlob.size / 1024).toFixed(2)} KB`);

// Lưu vào DB TRƯỚC, rồi mới báo xong
await StorageManager.saveAudio(finalBlob);
console.log("💾 [Audio Engine] Đã lưu audio vào IndexedDB.");

window.dispatchEvent(new CustomEvent('zestest:audio-ready', { 
    detail: { blob: finalBlob } 
}));

return finalBlob;
    }
};

// Xuất ra window để các file js khác gọi được
window.AudioProcessor = AudioProcessor;
const StorageManager = {
    _db: null,
    DB_NAME: "Zest_Storage",
    STORE_NAME: "main_storage",
    KEYS: {
        AUDIO: "current_audio_file",
        WEBP: "current_webp_images",
        META: "current_exam_meta"
    },
    DB_VERSION: 1,

    examData: {
        id: "Zest_" + Date.now(),
        version: 2,
        status: "processing",     // TRẠNG THÁI: idle (mới), processing (đang làm), completed (đã xong)
        name: "",
        duration: 0,
        totalQuestions: 0,
        lastModified: Date.now(),
        sourceFile: { name: "", size: 0, lastModified: 0 },
        sections: {},
        finalAnswers: [],
        stu_answer: []
    },

    // Hàm khởi tạo đề mới (Dùng khi xác nhận xóa cũ làm mới)
    createNewExamData() {
        this.examData = {
            id: "Zest_" + Date.now(),
            version: 2,
            status: "processing",
            name: "",
            duration: 0,
            totalQuestions: 0,
            lastModified: Date.now(),
            sourceFile: { name: "", size: 0, lastModified: 0 },
            sections: {},
            finalAnswers: [],
            stu_answer: []
        };
    },

    // --- CƠ CHẾ DATABASE (INDEXEDDB) ---
    async _openDB() {
        // Nếu đã mở rồi thì trả về luôn, không mở lại nữa
        if (this._db) return this._db;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(this.STORE_NAME)) {
                    db.createObjectStore(this.STORE_NAME);
                }
            };
            request.onsuccess = (e) => {
                this._db = e.target.result; // Lưu lại kết nối vào biến cache
                resolve(this._db);
            };
            request.onerror = () => reject("IndexedDB Error");
        });
    },

    // --- HÀM TỔNG HỢP ĐÁP ÁN GỐC (AUTOMATION) ---
    /**
     * Tự động quét các section và phẳng hóa đáp án gốc vào finalAnswers
     */
    _syncFinalAnswers() {
        const total = this.examData.totalQuestions || 0;
        // Khởi tạo mảng đáp án gốc (Index 0 bỏ trống)
        const flatList = new Array(total + 1).fill(null);
        
        Object.values(this.examData.sections).forEach(sec => {
            if (!sec.range || !sec.answers) return;
            const [start, end] = sec.range;
            let answerIdx = 0;
            for (let i = start; i <= end; i++) {
                if (i <= total) {
                    flatList[i] = sec.answers[answerIdx] || null;
                }
                answerIdx++;
            }
        });
        this.examData.finalAnswers = flatList;
    },

    // --- QUẢN LÝ THÔNG TIN CHUNG ---
    async updateExamInfo(info = {}) {
        if (info.name !== undefined) this.examData.name = info.name;
        if (info.duration !== undefined) this.examData.duration = parseInt(info.duration) || 0;
        if (info.totalQuestions !== undefined) this.examData.totalQuestions = parseInt(info.totalQuestions) || 0;
        
        await this.saveMeta();
    },

    // --- QUẢN LÝ FILE (AUDIO / WEBP) ---
    async _saveFile(key, data) {
        const db = await this._openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.STORE_NAME, "readwrite");
            tx.objectStore(this.STORE_NAME).put(data, key);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(`Lỗi lưu key: ${key}`);
        });
    },

    async _getFile(key) {
        const db = await this._openDB();
        return new Promise((resolve) => {
            const request = db.transaction(this.STORE_NAME, "readonly")
                              .objectStore(this.STORE_NAME).get(key);
            request.onsuccess = () => resolve(request.result);
        });
    },

    async saveAudio(blob) { return this._saveFile(this.KEYS.AUDIO, blob); },
    async getAudio() { return this._getFile(this.KEYS.AUDIO); },
    
    async saveWebP(data) { return this._saveFile(this.KEYS.WEBP, data); },
    async getWebP() { return this._getFile(this.KEYS.WEBP); },

    // --- QUẢN LÝ METADATA & SECTIONS ---
    async saveMeta() {
        this.examData.lastModified = Date.now();
        this._syncFinalAnswers(); // Luôn đồng bộ đáp án gốc trước khi lưu xuống DB
        
        const db = await this._openDB();
        return new Promise((resolve) => {
            const tx = db.transaction(this.STORE_NAME, "readwrite");
            tx.objectStore(this.STORE_NAME).put(this.examData, this.KEYS.META);
            tx.oncomplete = () => resolve();
        });
    },

    async loadMeta() {
        const data = await this._getFile(this.KEYS.META);
        if (data) {
            data.duration = parseInt(data.duration) || 0;
            data.totalQuestions = parseInt(data.totalQuestions) || 0;
            this.examData = data;
        }
        return this.examData;
    },

    async saveUploadResult(result) {
    this.examData.uploadResult = {
        examId:     result.examId,
        examName:   result.examName,
        serverPath: result.serverPath || null,
        uploadedAt: result.uploadedAt || Date.now(),
    };
    await this.saveMeta();
},

    /**
     * Cập nhật dữ liệu cho một Section (Phần thi)
     */
    async setSection(id, config) {
    // Ép kiểu cứng, không metadata, không rawText thừa thãi
    this.examData.sections[id] = {
        range: Array.isArray(config.range) ? config.range : [0, 0],
        type: config.type || "abcd",
        answers: Array.isArray(config.answers) ? config.answers : [],
        audio: config.audio || null
    };
    
    await this.saveMeta();
},

    async removeSection(id) {
        if (this.examData.sections[id]) {
            delete this.examData.sections[id];
            await this.saveMeta();
        }
    },

    async clearAll() {
        const db = await this._openDB();
        const tx = db.transaction(this.STORE_NAME, "readwrite");
        tx.objectStore(this.STORE_NAME).clear();
        return new Promise((resolve) => {
            tx.oncomplete = () => resolve();
        });
    },

    async resetStudentAnswers() {
        const total = parseInt(this.examData.totalQuestions) || 0;
        
        // Tạo mảng mới: [null, null, null...] với độ dài total + 1
        this.examData.stu_answer = new Array(total + 1).fill(null);
        
        console.log(`[Storage] Đã khởi tạo lại mảng bài làm (${total} câu).`);
        
        // Lưu lại vào IndexedDB để đảm bảo trạng thái sạch
        await this.saveMeta();
    }
};

// Khởi tạo tự động khi nạp file
StorageManager.loadMeta();
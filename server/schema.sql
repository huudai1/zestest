-- Bảng Users: Lưu thông tin Guest và User đã login
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    tier TEXT NOT NULL DEFAULT 'GUEST',
    email TEXT,
    total_exams_created INTEGER DEFAULT 0,
    tier_expires_at INTEGER DEFAULT 0, 
    created_at INTEGER NOT NULL
);

-- Bảng Exams: Lưu thông tin đề thi
CREATE TABLE IF NOT EXISTS exams (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL,
    exam_name TEXT NOT NULL,
    storage_url TEXT NOT NULL,
    config_json TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    max_attempts INTEGER DEFAULT 1,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Bảng Exam Results: Lưu điểm số chính thức của học sinh
CREATE TABLE IF NOT EXISTS exam_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exam_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    score REAL NOT NULL,
    total_correct INTEGER,
    total_questions INTEGER,
    warning_count INTEGER DEFAULT 0,
    answers_json TEXT,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_results_exam_id ON exam_results(exam_id);

-- Bảng Metadata: Lưu các thông số tổng quát toàn hệ thống
CREATE TABLE IF NOT EXISTS platform_metadata (
    key TEXT PRIMARY KEY,
    value_int INTEGER DEFAULT 0,
    value_text TEXT
);

-- Khởi tạo giá trị mặc định cho tổng số đề toàn server
INSERT OR IGNORE INTO platform_metadata (key, value_int) VALUES ('global_total_exams', 0);

-- Bảng Gift Keys
CREATE TABLE IF NOT EXISTS gift_keys (
    key_code TEXT PRIMARY KEY,
    uses_left INTEGER DEFAULT 1,
    duration_days INTEGER DEFAULT 7,
    status TEXT DEFAULT 'ACTIVE',
    created_at INTEGER NOT NULL
);

-- Referral Columns
ALTER TABLE users ADD COLUMN referral_code TEXT;
ALTER TABLE users ADD COLUMN referred_by TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);

-- Analytics Columns
ALTER TABLE exam_results ADD COLUMN student_uid TEXT;
ALTER TABLE exam_results ADD COLUMN teacher_comment TEXT;

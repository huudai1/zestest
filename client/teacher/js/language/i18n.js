const translations = {
    vi: {
        // Common
        step: "Bước",
        next: "Tiếp →",
        prev: "← Trước",
        done: "Xong",
        edit: "Sửa",
        cancel: "Hủy",
        close: "Đóng",
        search: "Tìm kiếm...",

        mandatory: "Bắt buộc",
        optional: "Tùy chọn",
        alert_range: "Vui lòng nhập phạm vi câu hỏi!",
        alert_type: "Vui lòng chọn loại câu hỏi!",
        alert_audio: "⚠️ Phần thi Nghe bắt buộc phải có file Audio!",
        confirm_cancel_msg: "Bạn muốn hủy tạo?",
        
        // Dashboard
        all_exams: "Tất cả đề thi",
        create_btn: "Tạo đề mới",
        total_exams: "Tổng số đề",
        guest: "Khách",
        register: "Đăng ký",
        contact_title: "Liên hệ Zestest",
        contact_desc: "Gặp khó khăn khi tạo đề? Kết nối ngay với mình nhé!",
        light: "SÁNG",
        dark: "TỐI",

        // Step 1
        exam_name: "Tên bài thi",
        exam_placeholder: "Nhập tên bài thi...",
        q_count: "Số lượng câu hỏi",
        duration: "Thời gian làm bài (Phút)",
        upload_title: "Tải đề bài lên",
        upload_sub: "PDF, Word hoặc Hình ảnh",
        
        // Step 2 Intro Modal
        intro_title: "💡 Hướng dẫn Bước 2",
        intro_desc: "Bước này dùng để chia phần cho đề thi:",
        intro_li_listening: "Đề có phần NGHE: Bấm '+' để tải Audio.",
        intro_li_tf: "Đề có Đúng/Sai, Trả lời ngắn: Bấm '+' để khai báo.",
        intro_li_abcd: "Đề có trắc nghiệm ABCD: Bấm '+' để khai báo.",
        intro_highlight: "✅ Đề chỉ có ABCD: Nhấn Tiếp → để qua luôn Bước 3.",
        done_intro: "Đã hiểu",
        turn_off_next_time: "Không hiện lại lần sau",

        // Step 2 & Modals
        add_type: "Thêm loại câu hỏi khác (nếu có)",
        setup_title: "Thiết lập",
        audio_upload: "🎵 Tải file Audio",
        audio_placeholder: "Nhấn vào đây để tải file (.mp3, .wav)",
        quick_input: "⚡ NHẬP NHANH",
        quick_placeholder: "Ví dụ: 1A 2B 3C...",
        
        // Step 3
        check_title: "Bước 3: Kiểm tra",
        instruction_s3: "Bấm vào từng câu để chỉnh sửa nhanh đáp án",
        
        // Modal & Status
        confirm_cancel: "Bạn muốn hủy tạo?",
        yes: "CÓ",
        no: "KHÔNG",
        process: "Đang chuẩn bị dữ liệu...",

        question_label: "Câu",
        tf_labels: "Đ,S",

        from: "Từ",
        to: "Đến",

        abcd:"ABCD",
        listening: "NGHE",
        true_false: "ĐÚNG/SAI",
        essay:"TỰ LUẬN",

        // WebP Logs
    analyzing_structure: "Phân tích cấu trúc file...",
    init_security_hash: "Khởi tạo mã chống sao chép...",
    compressing_webp: "Nén ảnh chuẩn WebP (Tối ưu 60%)...",
    optimizing_layers: "Tối ưu lớp hiển thị...",
    caching_metadata: "Ghi nhớ vân tay file đề...",
    
    // Zestest Logs
    sorting_sections: "Sắp xếp các phần thi...",
    encoding_audio: "Chuẩn hóa âm thanh đầu ra...",
    generating_zestest_file: "Chuyển đổi sang định dạng .zestest...",
    finalizing_package: "Đóng gói dữ liệu hoàn tất!"
    },
    en: {
        // Common
        step: "Step",
        next: "Next →",
        prev: "← Prev",
        done: "Finish",
        edit: "Edit",
        cancel: "Cancel",
        close: "Close",
        search: "Search...",
        mandatory: "Mandatory",
        optional: "Optional",
        alert_range: "Please enter question range!",
        alert_type: "Please select a question type!",
        alert_audio: "⚠️ Listening section requires an audio file!",
        confirm_cancel_msg: "Do you want to cancel?",

        // Dashboard
        all_exams: "All Exams",
        create_btn: "Create",
        total_exams: "Total Exams",
        guest: "Guest",
        register: "Register",
        contact_title: "Contact Zestest",
        contact_desc: "Need help? Contact me now!",
        light: "LIGHT",
        dark: "DARK",

        // Step 1
        exam_name: "Exam Name",
        exam_placeholder: "Enter exam name...",
        q_count: "Number of questions",
        duration: "Duration (Minutes)",
        upload_title: "Upload Exam",
        upload_sub: "PDF, Word or Images",

        // Step 2 Intro Modal
        intro_title: "💡 Step 2 Guide",
        intro_desc: "Use this step to divide your exam into sections:",
        intro_li_listening: "LISTENING: Click '+' to upload audio.",
        intro_li_tf: "T/F, Short Answer: Click '+' to declare.",
        intro_li_abcd: "Multiple Choice: Click '+' to declare.",
        intro_highlight: "✅ ABCD Only: Just click Next → to go to Step 3.",
        done_intro: "Got it",
        turn_off_next_time: "Don't show again",

        // Step 2 & Modals
        add_type: "Add other question types",
        setup_title: "Settings",
        audio_upload: "🎵 Upload Audio",
        audio_placeholder: "Click here to upload (.mp3, .wav)",
        quick_input: "⚡ QUICK INPUT",
        quick_placeholder: "Ex: 1A 2B 3C...",

        // Step 3
        check_title: "Step 3: Review",
        instruction_s3: "Click on each question to edit the answer",

        // Modal & Status
        confirm_cancel: "Do you want to cancel?",
        yes: "YES",
        no: "NO",
        process: "Preparing data...",

        tf_labels: "T,F",
        question_label: "Question",

        from: "From",
        to: "To",

        abcd:"ABCD",
        listening: "LISTENING",
        true_false: "TRUE/FALSE",
        essay:"ESSAY",

        analyzing_structure: "Analyzing file structure...",
    init_security_hash: "Initializing anti-copy hash...",
    compressing_webp: "Compressing WebP (60% Optimized)...",
    optimizing_layers: "Optimizing display layers...",
    caching_metadata: "Caching file fingerprint...",
    
    sorting_sections: "Sorting exam sections...",
    encoding_audio: "Encoding audio standard...",
    generating_zestest_file: "Converting to .zestest format...",
    finalizing_package: "Package finalized!"
    }
};

const I18n = {
    locale: localStorage.getItem('zestest_lang') || 'vi',

    t(key) {
        return translations[this.locale][key] || key;
    },

    setLocale(lang) {
        this.locale = lang;
        localStorage.setItem('zestest_lang', lang);
        this.apply();
        // Phát sự kiện để các script khác biết ngôn ngữ đã đổi
        window.dispatchEvent(new Event('languageChanged'));
    },

    apply() {
        // Dịch các text thông thường
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.innerText = this.t(key);
        });

        // Dịch các placeholder của input
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.placeholder = this.t(key);
        });
    }
};

// Hàm đóng mở menu
function toggleLangMenu() {
    document.getElementById("lang-content").classList.toggle("show");
}

// Đóng menu nếu bấm ra ngoài
window.onclick = function(event) {
    if (!event.target.closest('.lang-dropdown')) {
        const dropdowns = document.getElementsByClassName("lang-dropdown-content");
        for (let i = 0; i < dropdowns.length; i++) {
            if (dropdowns[i].classList.contains('show')) {
                dropdowns[i].classList.remove('show');
            }
        }
    }
}

// Cập nhật lại hàm setLocale để đổi cờ trên nút chính
const originalSetLocale = I18n.setLocale;
I18n.setLocale = function(lang) {
    // Gọi hàm gốc
    originalSetLocale.call(I18n, lang);
    
    // Cập nhật giao diện nút
    const flags = { vi: '🇻🇳', en: '🇺🇸', jp: '🇯🇵' };
    const codes = { vi: 'VI', en: 'EN', jp: 'JP' };
    
    document.getElementById('current-lang-flag').innerText = flags[lang];
    document.getElementById('current-lang-code').innerText = codes[lang];
    
    // Đóng menu sau khi chọn
    document.getElementById("lang-content").classList.remove("show");
};

// Tự động chạy khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', () => I18n.apply());
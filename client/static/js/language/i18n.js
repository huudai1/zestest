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
        add_type: "Thêm loại câu hỏi",
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
        abcd: "ABCD",
        listening: "NGHE",
        true_false: "ĐÚNG/SAI",
        essay: "TỰ LUẬN",

        // WebP Logs
        analyzing_structure: "Phân tích cấu trúc file...",
        init_security_hash: "Khởi tạo mã chống sao chép...",
        compressing_webp: "Nén ảnh chuẩn WebP (Tối ưu 60%)...",
        optimizing_layers: "Tối ưu lớp hiển thị...",
        caching_metadata: "Ghi nhớ vân tay file đề...",
        sorting_sections: "Sắp xếp các phần thi...",
        encoding_audio: "Chuẩn hóa âm thanh đầu ra...",
        generating_zestest_file: "Chuyển đổi sang định dạng .zestest...",
        finalizing_package: "Đóng gói dữ liệu hoàn tất!",

        // Student – Splash
        stu_splash_welcome: "Chào mừng bạn đến với",
        stu_splash_welcome_back: "Chào mừng bạn trở lại!",
        stu_splash_welcome_new: "Xin chào!",

        // Student – Lobby
        stu_lobby_banner: "Chào mừng bạn! Vui lòng nhập tên để vào thi.",
        stu_name_placeholder: "Nhập Họ Tên của bạn...",
        stu_lobby_questions: "Câu hỏi",
        stu_exam_loading: "Đang tải tên đề...",
        stu_room_closed_title: "🛑 PHÒNG THI ĐÃ ĐÓNG",
        stu_room_closed_desc: "Giáo viên đã kết thúc phiên thi này. Bạn không thể nộp bài được nữa.",
        stu_btn_continue: "TIẾP TỤC",
        stu_btn_view_result: "XEM LẠI KẾT QUẢ",
        stu_btn_reset: "LÀM LẠI TỪ ĐẦU",

        // Student – Tutorial
        stu_tutorial_title: "Hướng dẫn nhanh",
        stu_tutorial_swipe: "Vuốt ngang để chuyển câu hỏi nhanh chóng.",
        stu_tutorial_tap: "Chạm vào viền trái/phải để lật trang nhanh.",
        stu_tutorial_folder: "Bấm biểu tượng thư mục để xem toàn bộ danh sách.",
        stu_tutorial_timer: "Hệ thống tự động nộp bài khi hết thời gian.",
        stu_unpack_loading: "(Đang chuẩn bị dữ liệu thi...)",
        stu_btn_understood: "TÔI ĐÃ HIỂU",
        stu_lobby_loading: "Đang tải...",

        // Student – Countdown
        stu_countdown_ready: "Sẵn sàng chưa?",
        stu_countdown_wish: "Chúc bạn thi thật tốt!",
        stu_btn_submit: "Nộp",

        // Student – Summary Page
        stu_summary_title: "KẾT QUẢ",
        stu_summary_total: "Tổng",
        stu_summary_correct: "Đúng",
        stu_summary_warn: "Cảnh báo",
        stu_summary_stats: "Thống kê chi tiết",
        stu_summary_chart_wip: "[Biểu đồ đang phát triển]",
        stu_btn_redo: "Làm lại",
        stu_btn_detail: "Xem chi tiết",

        // Student – Detail Page
        stu_detail_back: "Quay lại",
        stu_detail_list: "Danh sách tổng quát",
        stu_detail_exit: "Thoát",
        stu_detail_loading: "Đang tải hình ảnh...",
        stu_detail_your_ans: "Bạn chọn:",
        stu_detail_correct_ans: "Đáp án:",
        stu_detail_essay_label: "Đáp án chi tiết:",

        // Student – Security Modal
        stu_security_title: "CẢNH BÁO VI PHẠM",
        stu_security_msg: "Bạn vừa rời khỏi phòng thi!",
        stu_security_sub: "Hành động này đã được ghi lại. Vui lòng quay lại toàn màn hình để tiếp tục.",
        stu_security_btn: "TÔI ĐÃ HIỂU & QUAY LẠI",

        // Student – Submit Modal
        stu_submit_title: "XÁC NHẬN NỘP BÀI",
        stu_submit_confirm: "Bạn có chắc chắn muốn nộp bài và kết thúc kỳ thi không?",
        stu_submit_cancel: "HỦY",
        stu_submit_ok: "NỘP BÀI",

        // Student – Grid Modal
        stu_grid_title: "DANH SÁCH CÂU HỎI",
        stu_legend_done: "Đã làm",
        stu_legend_flag: "Nghi vấn",
        stu_legend_pending: "Chưa làm",

        // Student – JS alerts
        stu_alert_submit_late: "⚠️ BẠN ĐÃ NỘP MUỘN: Giáo viên đã đóng phòng thi này. Kết quả của bạn đã được lưu lại trong máy, bạn có thể chụp màn hình lại để minh chứng với giáo viên.",
        stu_alert_submit_err: "⚠️ Lỗi nộp bài: ",
        stu_alert_no_network: "⚠️ Không thể kết nối với máy chủ. Đáp án đã được lưu tại máy bạn, vui lòng không tắt trình duyệt và thử nộp lại sau hoặc báo giáo viên.",
        stu_alert_done_score: "Đã nộp bài xong! Điểm của bạn: ",
        stu_alert_dev_detail: "Tính năng xem chi tiết đang được phát triển.",
        stu_label_total: "Tổng",
        stu_label_correct: "Đúng",
        stu_label_warn: "Vi phạm",
        stu_tf_you: "BẠN",
        stu_tf_answer: "ĐÁP ÁN",
        stu_violation_msg: "Cảnh báo: Bạn vừa ",
        stu_violation_suffix: "!",
        stu_img_error: "Không có dữ liệu ảnh đề thi.",
        stu_splash_setup: "Đang thiết lập môi trường...",

        // Dashboard splash
        splash_connecting: "Đang kết nối server Zestest...",
        splash_checking: "Kiểm tra danh sách câu hỏi...",
        splash_init: "Đang khởi tạo...",
        splash_ready: "Sẵn sàng! Đang vào dashboard...",
        splash_welcome_back: "Chào mừng trở lại",
        splash_hello: "Xin chào",
        btn_logout: "Logout",
        btn_register: "Đăng ký",
        banner_restore: "📂 Thả file .zestest vào đây để khôi phục đề",
        community_label: "✨ Cộng đồng đã tạo",
        community_count_suffix: " đề thi",
        community_join: "Tham gia ngay 👥",
        tooltip_support: "Hỗ trợ Zestest",
        tooltip_gift: "Quà tặng & Mời bạn",
        gift_title: "🎁 Nhập mã quà tặng",
        gift_desc: "Nhập mã PRO của bạn để kích hoạt tính năng cao cấp.",
        gift_placeholder: "MÃ QUÀ TẶNG",
        gift_activate: "KÍCH HOẠT KEY",
        loading_processing: "Đang xử lý dữ liệu...",
        expired_notice_prefix: " đề thi đã hết hạn",
        expired_notice_suffix: " và được ẩn đi. Bạn có thể khôi phục bằng cách ném file .zestest vào vùng phía trên.",

        // Exam card buttons
        card_share: "Giao bài",
        card_info: "Điểm",
        card_download: "Tải",
        card_delete: "Del",
        card_time_counting: "⏱ Đang tính...",
        card_time_left: "Còn lại",
        card_expired: "🔴 Hết hạn",

        // Empty state
        empty_state_title: "Chưa có đề thi nào khả dụng",
        empty_state_sub: "Bấm \"Create\" phía trên hoặc thả file .zestest để bắt đầu!",
        stats_title: "Thống kê kết quả",
        stats_export: "Xuất Excel",

        // Landing Page (obsolete duplicate cleaned)
        stats_no_results: "Chưa có học sinh nào nộp bài.",
        stats_submissions: "Số bài nộp",
        stats_avg_score: "Điểm trung bình",
        stats_high_score: "Giỏi (>= 8)",
        stats_total_warn: "Tổng cảnh báo",
        stats_col_student: "Học sinh",
        stats_col_score: "Điểm",
        stats_col_correct: "Đúng",
        stats_col_warn: "Cảnh báo",
        stats_col_time: "Thời gian",
        stats_times: "lần",
        stats_load_error: "Lỗi tải dữ liệu.",

        // Lobby – attempt tracking
        lobby_submitted_title: "BẠN ĐÃ NỘP BÀI NÀY",
        lobby_submitted_desc: "Bạn có thể xem lại kết quả hoặc chọn làm lại từ đầu.",
        lobby_btn_review: "XEM LẠI KẺT QUẢ",
        lobby_btn_redo_count: "LÀM LẠI TỪ ĐẦU",
        lobby_btn_no_attempt: "HẺT LƯỢT LÀM",
        lobby_attempt_max: "Tối đa",
        lobby_attempt_times: "lần",
        lobby_confirm_redo: "Bạn có chắc chắn muốn làm lại không?",

        // PRO modal
        pro_modal_title: "👑 Mở khóa Zestest PRO",
        pro_modal_sub: "Nâng cấp để trải nghiệm đầy đủ sức mạnh của hệ thống.",
        pro_feat1_title: "Theo dõi thời gian thực",
        pro_feat1_sub: "Xem học sinh đang làm gì, tiến độ ra sao ngay lúc này.",
        pro_feat2_title: "Tăng giới hạn tạo đề",
        pro_feat2_sub: "Hạn mức lên tới 50 đề cho tài khoản PRO.",
        pro_feat3_title: "Tăng thời gian lưu trữ",
        pro_feat3_sub: "Đề thi được lưu trữ lên tới 30 ngày (thay vì 4h/24h).",
        pro_feat4_title: "Không giới hạn học sinh",
        pro_feat4_sub: "Phòng thi hỗ trợ tới 100 học sinh làm bài cùng lúc.",
        pro_maintenance_title: "Tính năng đang bảo trì",
        pro_maintenance_desc: "Hiện tại hệ thống thanh toán tự động chưa sẵn sàng.",
        pro_btn_zalo: "Nhắn Zalo Admin",
        pro_btn_community: "Cộng đồng",
        pro_btn_upgrade: "TÔI MUỐN NÂNG CẤP",
        pro_btn_later: "Để sau",
        pro_btn_back: "Quay lại",
        room_pro_required_title: "Tính năng cần phí duy trì hệ thống",
        room_pro_required_desc: "Hệ thống giám sát Realtime tiêu tốn rất nhiều tài nguyên Server.",
        room_pro_btn_contact: "Liên hệ admin",
        room_waiting: "Hệ thống đã sẵn sàng. Đợi học sinh join...",
        room_student_anon: "Học sinh ẩn danh",
        room_progress_label: "Tiến độ",
        room_kick_confirm: "Bạn có chắc muốn mời học sinh ra khỏi phòng thi?",
        share_title: "🚀 Quản lý phòng thi",
        share_close: "Đóng (Esc)",
        share_link_label: "Link chia sẻ cho học sinh",
        share_copy: "📋 Sao chép",
        share_copy_done: "✅ Xong!",
        share_status_label: "Trạng thái",
        share_status_open: "Đang mở",
        share_status_closed: "Đang đóng",
        share_btn_stop: "🛑 Dừng",
        share_btn_open: "🔓 Mở",
        share_max_attempts: "Số lần làm tối đa",
        share_per_student: "Mỗi học sinh",
        share_btn_save: "Lưu",
        share_reopen_notice: "Vừa mở lại phòng:",
        share_reopen_desc: "Bạn hãy nhắc học sinh Reload trang thi nhé!",
        share_doing: "👥 Đang làm bài",
        share_student_limit: "Giới hạn học sinh",
        share_confirm_stop: "Kết thúc phòng thi?",
        share_confirm_open: "Mở lại phòng thi?",
        share_err_toggle: "Lỗi:",
        share_err_connect: "Lỗi kết nối server.",
        share_err_attempts: "Số lần làm phải >= 1",
        share_saved: "Lưu",

        // Landing Page
        lp_hero_title: "Sở hữu Cổng thi & <span>Lớp học trực tuyến</span> mang tên bạn",
        lp_hero_desc: "Số hóa đề thi giấy thành đề online trong chớp mắt. Tạo phòng thi riêng biệt, quản lý lớp học và chấm điểm tự động mà không cần cài đặt phức tạp.",
        lp_btn_start: "BẮT ĐẦU NGAY",
        lp_btn_learn: "TÌM HIỂU THÊM",
        lp_feat_title: "Nền tảng chuyên nghiệp",
        lp_feat_fast_title: "Số hóa đề thi siêu tốc",
        lp_feat_fast_desc: "Biến 200 câu TOEIC thành đề online trong 1 chốc. Không còn tốn chi phí in ấn đề giấy hay mất hàng giờ để nhập liệu thủ công.",
        lp_feat_ui_title: "Tự chủ thương hiệu",
        lp_feat_ui_desc: "Tùy chỉnh Logo, tên thương hiệu và nhận diện cá nhân. Chuyên nghiệp hóa hình ảnh trong mắt học sinh.",
        lp_feat_web_title: "Số hóa toàn diện",
        lp_feat_web_desc: "Tự động hóa quy trình tạo đề, chấm bài và quản lý kết quả tập trung trên một website duy nhất.",
        lp_why_title: "Tại sao nên chọn Zestest?",
        lp_why_cost_title: "Chi phí cực thấp",
        lp_why_cost_desc: "Thay vì bỏ ra hàng chục triệu xây dựng web, bạn chỉ tốn vài cốc cafe mỗi tháng để có hệ thống chuyên nghiệp.",
        lp_why_install_title: "Không cần cài đặt",
        lp_why_install_desc: "Sử dụng ngay trên trình duyệt, không tốn dung lượng máy, không lo virus.",
        lp_why_cross_title: "Đa nền tảng",
        lp_why_cross_desc: "Hoạt động hoàn hảo trên Windows, Mac, iPad, Android và cả Điện thoại.",
        lp_privacy: "Chính sách bảo mật",
        lp_terms: "Điều khoản sử dụng",
        lp_cookie_msg: "Zestest sử dụng bộ nhớ trình duyệt để tối ưu trải nghiệm của bạn. Bằng cách sử dụng trang web, bạn đồng ý với chính sách của chúng tôi.",
        lp_cookie_accept: "Đã hiểu"
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
        abcd: "ABCD",
        listening: "LISTENING",
        true_false: "TRUE/FALSE",
        essay: "ESSAY",

        analyzing_structure: "Analyzing file structure...",
        init_security_hash: "Initializing anti-copy hash...",
        compressing_webp: "Compressing WebP (60% Optimized)...",
        optimizing_layers: "Optimizing display layers...",
        caching_metadata: "Caching file fingerprint...",
        sorting_sections: "Sorting exam sections...",
        encoding_audio: "Encoding audio standard...",
        generating_zestest_file: "Converting to .zestest format...",
        finalizing_package: "Package finalized!",

        // Student – Splash
        stu_splash_welcome: "Welcome to",
        stu_splash_welcome_back: "Welcome back!",
        stu_splash_welcome_new: "Hello!",

        // Student – Lobby
        stu_lobby_banner: "Welcome! Please enter your name to start the exam.",
        stu_name_placeholder: "Enter your full name...",
        stu_lobby_questions: "Questions",
        stu_exam_loading: "Loading exam...",
        stu_room_closed_title: "🛑 EXAM ROOM CLOSED",
        stu_room_closed_desc: "The teacher has ended this exam session. You can no longer submit.",
        stu_btn_continue: "CONTINUE",
        stu_btn_view_result: "VIEW RESULTS",
        stu_btn_reset: "RETAKE EXAM",

        // Student – Tutorial
        stu_tutorial_title: "Quick Guide",
        stu_tutorial_swipe: "Swipe horizontally to navigate questions quickly.",
        stu_tutorial_tap: "Tap the left/right edge to flip pages fast.",
        stu_tutorial_folder: "Tap the folder icon to see the full question list.",
        stu_tutorial_timer: "The system auto-submits when time runs out.",
        stu_unpack_loading: "(Preparing exam data...)",
        stu_btn_understood: "I UNDERSTAND",

        // Student – Countdown
        stu_countdown_ready: "Are you ready?",
        stu_countdown_wish: "Good luck on your exam!",
        stu_btn_submit: "Submit",

        // Student – Summary Page
        stu_summary_total: "Total",
        stu_summary_correct: "Correct",
        stu_summary_warn: "Warnings",
        stu_summary_stats: "Detailed Statistics",
        stu_summary_chart_wip: "[Chart in development]",
        stu_btn_redo: "Retake",
        stu_btn_detail: "View Details",
        stu_summary_title: "RESULTS",
        stu_lobby_loading: "Loading...",

        // Student – Detail Page
        stu_detail_back: "Back",
        stu_detail_list: "Question Overview",
        stu_detail_exit: "Exit",
        stu_detail_loading: "Loading images...",
        stu_detail_your_ans: "Your answer:",
        stu_detail_correct_ans: "Correct answer:",
        stu_detail_essay_label: "Detailed answer:",

        // Student – Security Modal
        stu_security_title: "SECURITY VIOLATION",
        stu_security_msg: "You left the exam room!",
        stu_security_sub: "This action has been recorded. Please return to fullscreen to continue.",
        stu_security_btn: "I UNDERSTAND & RETURN",

        // Student – Submit Modal
        stu_submit_title: "CONFIRM SUBMISSION",
        stu_submit_confirm: "Are you sure you want to submit and end the exam?",
        stu_submit_cancel: "CANCEL",
        stu_submit_ok: "SUBMIT",

        // Student – Grid Modal
        stu_grid_title: "QUESTION LIST",
        stu_legend_done: "Answered",
        stu_legend_flag: "Flagged",
        stu_legend_pending: "Unanswered",

        // Student – JS alerts
        stu_alert_submit_late: "⚠️ LATE SUBMISSION: The teacher has closed this exam room. Your answers are saved locally — you can screenshot them as proof for the teacher.",
        stu_alert_submit_err: "⚠️ Submission error: ",
        stu_alert_no_network: "⚠️ Cannot connect to server. Your answers are saved locally. Do not close the browser — try submitting again later or notify your teacher.",
        stu_alert_done_score: "Submitted! Your score: ",
        stu_alert_dev_detail: "Detailed review is still under development.",
        stu_label_total: "Total",
        stu_label_correct: "Correct",
        stu_label_warn: "Violations",
        stu_tf_you: "YOU",
        stu_tf_answer: "ANSWER",
        stu_violation_msg: "Warning: You just ",
        stu_violation_suffix: "!",
        stu_img_error: "No exam image data found.",
        stu_splash_setup: "Setting up environment...",

        // Dashboard splash
        splash_connecting: "Connecting to Zestest server...",
        splash_checking: "Checking question list...",
        splash_init: "Initializing...",
        splash_ready: "Ready! Loading dashboard...",
        splash_welcome_back: "Welcome back",
        splash_hello: "Hello",
        btn_logout: "Logout",
        btn_register: "Register",
        banner_restore: "📂 Drop .zestest file here to restore",
        community_label: "✨ Community has created",
        community_count_suffix: " exams",
        community_join: "Join now 👥",
        tooltip_support: "Zestest Support",
        tooltip_gift: "Gifts & Referrals",
        gift_title: "🎁 Enter gift code",
        gift_desc: "Enter your PRO code to activate premium features.",
        gift_placeholder: "GIFT CODE",
        gift_activate: "ACTIVATE KEY",
        loading_processing: "Processing data...",
        expired_notice_prefix: " exam(s) expired",
        expired_notice_suffix: " and hidden. Restore by dropping the .zestest file above.",

        // Exam card buttons
        card_share: "Share",
        card_info: "Score",
        card_download: "Download",
        card_delete: "Del",
        card_time_counting: "⏱ Counting...",
        card_time_left: "Time left",
        card_expired: "🔴 Expired",

        // Empty state
        empty_state_title: "No exams available",
        empty_state_sub: "Click \"Create\" above or drop a .zestest file to get started!",
        stats_title: "Results Statistics",
        stats_export: "Export Excel",

        // Landing Page (obsolete duplicate cleaned)
        stats_no_results: "No students have submitted yet.",
        stats_submissions: "Submissions",
        stats_avg_score: "Average Score",
        stats_high_score: "Excellent (>= 8)",
        stats_total_warn: "Total Warnings",
        stats_col_student: "Student",
        stats_col_score: "Score",
        stats_col_correct: "Correct",
        stats_col_warn: "Warnings",
        stats_col_time: "Time",
        stats_times: "time(s)",
        stats_load_error: "Failed to load data.",

        // Lobby – attempt tracking
        lobby_submitted_title: "YOU HAVE ALREADY SUBMITTED",
        lobby_submitted_desc: "You can review your results or choose to retake from the beginning.",
        lobby_btn_review: "VIEW RESULTS",
        lobby_btn_redo_count: "RETAKE",
        lobby_btn_no_attempt: "NO ATTEMPTS LEFT",
        lobby_attempt_max: "Max",
        lobby_attempt_times: "attempt(s)",
        lobby_confirm_redo: "Are you sure you want to retake?",

        // PRO modal
        pro_modal_title: "👑 Unlock Zestest PRO",
        pro_modal_sub: "Upgrade to experience the full power of the system.",
        pro_feat1_title: "Real-time Monitoring",
        pro_feat1_sub: "See what students are doing and their progress right now.",
        pro_feat2_title: "More Exam Slots",
        pro_feat2_sub: "Up to 50 exams for PRO accounts.",
        pro_feat3_title: "Extended Storage Time",
        pro_feat3_sub: "Exams stored up to 30 days (instead of 4h/24h).",
        pro_feat4_title: "Unlimited Students",
        pro_feat4_sub: "Exam rooms support up to 100 students simultaneously.",
        pro_maintenance_title: "Feature under maintenance",
        pro_maintenance_desc: "The automated payment system is not ready yet.",
        pro_btn_zalo: "Message Zalo Admin",
        pro_btn_community: "Community",
        pro_btn_upgrade: "I WANT TO UPGRADE",
        pro_btn_later: "Maybe later",
        pro_btn_back: "Go back",
        room_pro_required_title: "Feature requires maintenance fee",
        room_pro_required_desc: "The Realtime monitoring system consumes server resources.",
        room_pro_btn_contact: "Contact admin",
        room_waiting: "System ready. Waiting for students...",
        room_student_anon: "Anonymous student",
        room_progress_label: "Progress",
        room_kick_confirm: "Remove this student?",
        share_title: "🚀 Exam Room Management",
        share_close: "Close (Esc)",
        share_link_label: "Student share link",
        share_copy: "📋 Copy",
        share_copy_done: "✅ Copied!",
        share_status_label: "Status",
        share_status_open: "Open",
        share_status_closed: "Closed",
        share_btn_stop: "🛑 Stop",
        share_btn_open: "🔓 Open",
        share_max_attempts: "Max attempts",
        share_per_student: "Per student",
        share_btn_save: "Save",
        share_reopen_notice: "Room reopened:",
        share_reopen_desc: "Remind students to Reload!",
        share_doing: "👥 Doing exam",
        share_student_limit: "Student limit",
        share_confirm_stop: "End the exam room?",
        share_confirm_open: "Reopen the exam room?",
        share_err_toggle: "Error:",
        share_err_connect: "Server error.",
        share_err_attempts: "Max attempts must be >= 1",
        share_saved: "Save",

        // Landing Page
        lp_hero_title: "Own your Online Exam Portal & <span>Virtual Classroom</span>",
        lp_hero_desc: "Digitize paper exams into online tests in a blink. Create private exam rooms, manage classes and automate grading with zero installation hassle.",
        lp_btn_start: "GET STARTED",
        lp_btn_learn: "LEARN MORE",
        lp_feat_title: "Professional Platform",
        lp_feat_fast_title: "Super-Fast Exam Digitization",
        lp_feat_fast_desc: "Turn 200 TOEIC questions into an online exam in a snap. Say goodbye to printing costs and hours of manual data entry.",
        lp_feat_ui_title: "Brand Independence",
        lp_feat_ui_desc: "Customize your Logo, brand name, and personal identity. Professionalize your image in the eyes of students.",
        lp_feat_web_title: "Total Digitization",
        lp_feat_web_desc: "Automate the process of creating exams, grading, and centralized result management on a single website.",
        lp_why_title: "Why choose Zestest?",
        lp_why_cost_title: "Low Cost",
        lp_why_cost_desc: "Instead of spending millions on web building, you only spend a few cups of coffee a month for a professional system.",
        lp_why_install_title: "No Installation",
        lp_why_install_desc: "Use right on the browser, no disk space required, no virus worries.",
        lp_why_cross_title: "Multi-platform",
        lp_why_cross_desc: "Works perfectly on Windows, Mac, iPad, Android, and even mobile phones.",
        lp_privacy: "Privacy Policy",
        lp_terms: "Terms of Use",
        lp_cookie_msg: "Zestest uses browser storage to optimize your experience. By using the website, you agree to our policies.",
        lp_cookie_accept: "Got it"
    }
};

const I18n = {
    locale: 'vi', // Mặc định

    init() {
        const saved = localStorage.getItem('zestest_lang');
        if (saved && translations[saved]) {
            this.locale = saved;
        } else {
            // Tự động nhận diện theo vùng (navigator.language)
            const browserLang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
            if (browserLang.includes('vi')) {
                this.locale = 'vi';
            } else {
                this.locale = 'en';
            }
            localStorage.setItem('zestest_lang', this.locale);
        }
        this.apply();
        this.updateUI(this.locale);
    },

    t(key) {
        const langObj = translations[this.locale] || translations['en'] || translations['vi'] || {};
        return langObj[key] || key;
    },

    setLocale(lang) {
        if (!translations[lang]) lang = 'en';
        this.locale = lang;
        localStorage.setItem('zestest_lang', lang);
        this.apply();
        this.updateUI(lang);
        window.dispatchEvent(new Event('languageChanged'));
    },

    apply() {
        // Dịch các text thông thường (Dùng innerHTML để hỗ trợ các tag như <span>)
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = this.t(key);
            if (translation.includes('<')) {
                el.innerHTML = translation;
            } else {
                el.innerText = translation;
            }
        });

        // Dịch các placeholder của input
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.placeholder = this.t(key);
        });
    },

    updateUI(lang) {
        const flags = { vi: '🇻🇳', en: '🇺🇸' };
        const codes = { vi: 'VI', en: 'EN' };
        
        document.querySelectorAll('.current-lang-flag').forEach(el => {
            el.innerText = flags[lang] || flags['vi'];
        });
        document.querySelectorAll('.current-lang-code').forEach(el => {
            el.innerText = codes[lang] || codes['vi'];
        });
        
        document.querySelectorAll('.lang-dropdown-content').forEach(el => {
            el.classList.remove("show");
        });
    }
};

// Hàm đóng mở menu
function toggleLangMenu(btn) {
    // Nếu không truyền btn (từ code cũ), tìm cái đầu tiên
    if (!btn) {
        const el = document.querySelector(".lang-dropdown-content");
        if (el) el.classList.toggle("show");
        return;
    }
    const dropdown = btn.closest('.lang-dropdown');
    const content = dropdown.querySelector('.lang-dropdown-content');
    if (content) content.classList.toggle("show");
}

// Đóng menu nếu bấm ra ngoài
window.onclick = function (event) {
    if (!event.target.closest('.lang-dropdown')) {
        const dropdowns = document.getElementsByClassName("lang-dropdown-content");
        for (let i = 0; i < dropdowns.length; i++) {
            if (dropdowns[i].classList.contains('show')) {
                dropdowns[i].classList.remove('show');
            }
        }
    }
};

// Tự động chạy khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', () => I18n.init());

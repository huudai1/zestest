const USER_TYPES = {
    GUEST:   "GUEST",
    USER_FREE: "USER_FREE", // Thêm để đồng bộ với logic Tier của server
    PREMIUM: "PREMIUM",
    STUDENT: "STUDENT",
    ADMIN:   "ADMIN"
};

const USER_ACTIONS = {
    INIT:        "USER_INIT",   // Đổi từ GUEST_INIT sang USER_INIT
    CREATE_QUIZ: "CREATE_QUIZ",
    CHECK_TURN:  "CHECK_TURN",
    GEN_LINK:    "GEN_LINK",
    REDEEM_KEY:  "REDEEM_KEY",
    REDEEM_REFERRAL: "REDEEM_REFERRAL",
    GET_MY_REFERRAL: "GET_MY_REFERRAL",
    CHECK_INVITER: "CHECK_INVITER"
};

const SERVER_STATUS = {
    SUCCESS: "SUCCESS",
    ERROR:   "ERROR",
};

const APP_MODULE = {            // Đổi tên module cho bao quát hơn
    TYPES:   USER_TYPES,
    ACTIONS: USER_ACTIONS,
    STATUS:  SERVER_STATUS
};

// Cấu hình URL hệ thống
const CONFIG = {
    // Tự động nhận diện domain để tránh lỗi CORS khi test trên workers.dev
    BASE_URL: (window.location.hostname === 'zestest.com' || window.location.hostname === 'localhost') ? '' : 'https://zestest.com'
};

// Xuất ra global window
window.CONFIG       = CONFIG;
window.APP_MODULE   = APP_MODULE;
window.USER_TYPES   = USER_TYPES;
window.USER_ACTIONS = USER_ACTIONS; // Đã đổi tên
window.SERVER_STATUS = SERVER_STATUS;
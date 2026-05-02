const USER_TYPES = {
    GUEST:   "GUEST",
    PREMIUM: "PREMIUM",
    STUDENT: "STUDENT",
    ADMIN:   "ADMIN"
};

const GUEST_ACTIONS = {
    INIT:        "GUEST_INIT",
    CREATE_QUIZ: "CREATE_QUIZ",
    CHECK_TURN:  "CHECK_TURN",
    GEN_LINK:    "GEN_LINK"     // thêm luôn cho đồng bộ với server
};

const SERVER_STATUS = {
    SUCCESS: "SUCCESS",
    ERROR:   "ERROR",
};

const GUEST_MODULE = {
    TYPES:   USER_TYPES,
    ACTIONS: GUEST_ACTIONS,
    STATUS:  SERVER_STATUS
};
// Đổi URL ở đây 1 lần là xong toàn bộ
const CONFIG = {
    BASE_URL: "http://127.0.0.1:8000"  // → đổi thành "https://zestest.com" khi deploy
};

window.CONFIG = CONFIG;
window.GUEST_MODULE   = GUEST_MODULE;
window.USER_TYPES     = USER_TYPES;
window.GUEST_ACTIONS  = GUEST_ACTIONS;
window.SERVER_STATUS  = SERVER_STATUS;
// src/types.ts

export enum UserType {
    GUEST = "GUEST",
    PREMIUM = "PREMIUM",
    STUDENT = "STUDENT",
    ADMIN = "ADMIN"
}

export enum UserTier {
    GUEST = "GUEST",
    USER_FREE = "USER_FREE", // Đã login Firebase
    GIFT_PRO = "GIFT_PRO",   // Tier quà tặng (3 ngày)
    PREMIUM_1 = "PREMIUM_1",
    PREMIUM_2 = "PREMIUM_2",
    PREMIUM_3 = "PREMIUM_3",
    ADMIN = "ADMIN"
}

export const TIER_LIMITS = {
    GUEST: { max_active_exams: 5, ttl_hours: 4, max_students: 50 },
    USER_FREE: { max_active_exams: 10, ttl_hours: 24, max_students: 50 },
    GIFT_PRO: { max_active_exams: 15, ttl_hours: 72, max_students: 50 },
    PREMIUM_1: { max_active_exams: 20, ttl_hours: 720, max_students: 100 },
    PREMIUM_2: { max_active_exams: 100, ttl_hours: 720, max_students: 100 },
    PREMIUM_3: { max_active_exams: 200, ttl_hours: 720, max_students: 100 }
};

export enum ActionType {
    USER_INIT = "USER_INIT",   // Khớp với USER_ACTIONS.INIT ở Frontend
    CHECK_TURN = "CHECK_TURN",  // Khớp với USER_ACTIONS.CHECK_TURN
    CREATE_QUIZ = "CREATE_QUIZ",
    UPLOAD_ZIP = "UPLOAD_ZIP",
    GEN_LINK = "GEN_LINK",
    GEN_EXAM_ID = "GEN_EXAM_ID",
    ACTIVATE_GIFT = "ACTIVATE_GIFT",
    REDEEM_KEY = "REDEEM_KEY",
    REDEEM_REFERRAL = "REDEEM_REFERRAL",
    GET_MY_REFERRAL = "GET_MY_REFERRAL",
    CHECK_INVITER = "CHECK_INVITER"
}

export interface UserIdentityRequest {
    id?: string; // Firebase UID hoặc GST_ID
    type_user: UserType;
    exam_id?: string;
    action: ActionType;
    payload?: Record<string, any>;
}

export interface ServerResponse {
    user_id: string;
    exam_id?: string;
    status: "SUCCESS" | "ERROR";
    message?: string;
    data?: any;
    timestamp: number;
}

export type Bindings = {
    DB: D1Database;
    R2_BUCKET: R2Bucket;
    MONITOR_ROOM: DurableObjectNamespace;
};
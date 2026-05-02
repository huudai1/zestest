// src/types.ts

export enum UserType {
  GUEST = "GUEST",
  PREMIUM = "PREMIUM",
  STUDENT = "STUDENT",
  ADMIN = "ADMIN"
}

export enum ActionType {
  GUEST_INIT  = "GUEST_INIT",
  CHECK_TURN  = "CHECK_TURN",
  CREATE_QUIZ = "CREATE_QUIZ",
  UPLOAD_ZIP  = "UPLOAD_ZIP",
  GEN_LINK    = "GEN_LINK"
}

export interface ServerResponse {
  user_id: string;
  exam_id?: string;
  status: "SUCCESS" | "ERROR";
  message?: string;
  data?: any;
  timestamp: number;
}
// ====================
// 邮件数据模型类型
// ====================

export interface Email {
  id: number;
  messageId: string | null;
  fromAddress: string | null;
  fromName: string | null;
  toAddress: string | null;
  recipient: string | null;
  title: string | null;
  bodyText: string | null;
  bodyHtml: string | null;
  sentAt: string | null;
  receivedAt: string | null;
  emailType: ExtractResultType;
  emailResult: string | null;
  emailResultText: string | null;
  emailError: string | null;
  readStatus: number;
}

export type NewEmail = Omit<Email, 'id'>;

// ====================
// 邮件提取结果类型
// ====================

export type ExtractResultType =
  | 'internal_link'
  | 'auth_link'
  | 'auth_code'
  | 'service_link'
  | 'subscription_link'
  | 'other_link'
  | 'none';

export interface ExtractResult {
  type: ExtractResultType;
  result: string;
  result_text: string;
}

export const DEFAULT_EXTRACT_RESULT: ExtractResult = {
  type: 'none',
  result: '',
  result_text: '',
};

// ====================
// 邮件发送相关类型
// ====================

export interface SendEmailRequest {
  to: string;
  subject: string;
  body: string;
  htmlBody?: string;
  fromName?: string;
}

export interface EmailAccount {
  id: string;
  email: string;
  imapHost: string;
  imapPort: number;
  smtpHost: string;
  smtpPort: number;
  username: string;
  password: string;
  isDefault: boolean;
  createdAt: string;
}

export interface SendEmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface EmailAccountConfig {
  email: string;
  imapHost: string;
  imapPort: number;
  smtpHost: string;
  smtpPort: number;
  username: string;
  password: string;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

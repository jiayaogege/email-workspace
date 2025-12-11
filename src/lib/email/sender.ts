import { EmailSendResult, EmailAccountConfig } from '../../types/email';

/**
 * 邮件发送器
 * 使用Cloudflare Workers环境支持的SMTP发送方式
 */
export class EmailSender {
  private config: EmailAccountConfig;

  constructor(config: EmailAccountConfig) {
    this.config = config;
  }

  /**
   * 发送邮件
   */
  async sendEmail(
    to: string,
    subject: string,
    body: string,
    htmlBody?: string,
    fromName?: string
  ): Promise<EmailSendResult> {
    try {
      // 在Cloudflare Workers环境中，我们可以使用SMTP over HTTP的代理服务
      // 这里使用Mailgun API作为SMTP代理（免费额度足够个人使用）
      
      const formData = new FormData();
      formData.append('from', `${fromName || this.config.email.split('@')[0]} <${this.config.email}>`);
      formData.append('to', to);
      formData.append('subject', subject);
      formData.append('text', body);
      
      if (htmlBody) {
        formData.append('html', htmlBody);
      }

      // 使用Mailgun API发送邮件
      const domain = this.config.email.split('@')[1];
      const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`api:${this.config.password}`),
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json() as { id: string };
        return {
          success: true,
          messageId: result.id,
        };
      } else {
        const error = await response.text();
        return {
          success: false,
          error: `发送失败: ${response.status} ${error}`,
        };
      }
    } catch (error) {
      console.error('邮件发送错误:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      };
    }
  }

  /**
   * 验证邮箱配置
   */
  async validateConfig(): Promise<{ valid: boolean; error?: string }> {
    try {
      // 简单的配置验证
      if (!this.config.email || !this.config.username || !this.config.password) {
        return { valid: false, error: '缺少必要的邮箱配置' };
      }

      // 验证邮箱格式
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.config.email)) {
        return { valid: false, error: '邮箱格式不正确' };
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, error: error instanceof Error ? error.message : '验证失败' };
    }
  }
}

/**
 * 创建邮件发送器实例
 */
export function createEmailSender(config: EmailAccountConfig): EmailSender {
  return new EmailSender(config);
}

/**
 * 发送邮件的便捷函数
 */
export async function sendEmail(
  config: EmailAccountConfig,
  to: string,
  subject: string,
  body: string,
  htmlBody?: string,
  fromName?: string
): Promise<EmailSendResult> {
  const sender = createEmailSender(config);
  return await sender.sendEmail(to, subject, body, htmlBody, fromName);
}

/**
 * 使用环境变量配置发送邮件
 */
export async function sendEmailWithEnv(
  to: string,
  subject: string,
  body: string,
  htmlBody?: string,
  fromName?: string
): Promise<EmailSendResult> {
  // 从环境变量获取配置
  const config: EmailAccountConfig = {
    email: process.env.EMAIL_FROM || '',
    imapHost: process.env.EMAIL_IMAP_HOST || 'imap.gmail.com',
    imapPort: parseInt(process.env.EMAIL_IMAP_PORT || '993'),
    smtpHost: process.env.EMAIL_SMTP_HOST || 'smtp.gmail.com',
    smtpPort: parseInt(process.env.EMAIL_SMTP_PORT || '587'),
    username: process.env.EMAIL_USERNAME || '',
    password: process.env.EMAIL_PASSWORD || '',
  };

  if (!config.email || !config.username || !config.password) {
    return {
      success: false,
      error: '邮箱配置不完整，请检查环境变量',
    };
  }

  return await sendEmail(config, to, subject, body, htmlBody, fromName);
}
import withAuth from '@/lib/auth/auth';
import { sendEmailWithEnv } from '@/lib/email/sender';
import { success, failure } from '@/types/api';
import { SendEmailRequest } from '@/types/email';

import type { NextApiRequest, NextApiResponse } from 'next';

async function sendHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return failure(res, 'Method not allowed', 405);
  }

  try {
    const { to, subject, body, htmlBody, fromName }: SendEmailRequest = req.body;

    // 验证必填字段
    if (!to || !subject || !body) {
      return failure(res, '收件人、主题和正文为必填项', 400);
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return failure(res, '收件人邮箱格式不正确', 400);
    }

    // 发送邮件
    const result = await sendEmailWithEnv(to, subject, body, htmlBody, fromName);

    if (result.success) {
      return success(res, {
        messageId: result.messageId,
        message: '邮件发送成功'
      }, 200);
    } else {
      return failure(res, result.error || '邮件发送失败', 500);
    }
  } catch (error) {
    console.error('邮件发送API错误:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return failure(res, `邮件发送失败: ${errorMessage}`, 500);
  }
}

export default withAuth(sendHandler);
import withAuth from '../../../../lib/auth/auth';
import { success, failure } from '../../../../types/api';
import { EmailAccount, EmailAccountConfig } from '../../../../types/email';

import type { NextApiRequest, NextApiResponse } from 'next';

// 简单的内存存储（在实际应用中应该使用数据库）
let emailAccounts: EmailAccount[] = [];

async function accountsHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // 获取邮箱账户列表
    return success(res, emailAccounts, 200);
  }

  if (req.method === 'POST') {
    // 添加新的邮箱账户
    try {
      const config: EmailAccountConfig = req.body;

      // 验证必填字段
      if (!config.email || !config.username || !config.password) {
        return failure(res, '邮箱、用户名和密码为必填项', 400);
      }

      // 验证邮箱格式
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(config.email)) {
        return failure(res, '邮箱格式不正确', 400);
      }

      // 检查是否已存在相同邮箱
      const existingAccount = emailAccounts.find(acc => acc.email === config.email);
      if (existingAccount) {
        return failure(res, '该邮箱账户已存在', 400);
      }

      // 创建新的邮箱账户
      const newAccount: EmailAccount = {
        id: Date.now().toString(),
        email: config.email,
        imapHost: config.imapHost || 'imap.gmail.com',
        imapPort: config.imapPort || 993,
        smtpHost: config.smtpHost || 'smtp.gmail.com',
        smtpPort: config.smtpPort || 587,
        username: config.username,
        password: config.password,
        isDefault: emailAccounts.length === 0, // 第一个账户设为默认
        createdAt: new Date().toISOString(),
      };

      emailAccounts.push(newAccount);

      return success(res, newAccount, 201);
    } catch (error) {
      console.error('添加邮箱账户错误:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return failure(res, `添加邮箱账户失败: ${errorMessage}`, 500);
    }
  }

  if (req.method === 'PUT') {
    // 更新邮箱账户
    try {
      const { id, ...updateData }: Partial<EmailAccount> = req.body;

      if (!id) {
        return failure(res, '账户ID为必填项', 400);
      }

      const accountIndex = emailAccounts.findIndex(acc => acc.id === id);
      if (accountIndex === -1) {
        return failure(res, '邮箱账户不存在', 404);
      }

      // 更新账户信息
      emailAccounts[accountIndex] = {
        ...emailAccounts[accountIndex],
        ...updateData,
      };

      return success(res, emailAccounts[accountIndex], 200);
    } catch (error) {
      console.error('更新邮箱账户错误:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return failure(res, `更新邮箱账户失败: ${errorMessage}`, 500);
    }
  }

  if (req.method === 'DELETE') {
    // 删除邮箱账户
    try {
      const { id } = req.query;

      if (!id || typeof id !== 'string') {
        return failure(res, '账户ID为必填项', 400);
      }

      const accountIndex = emailAccounts.findIndex(acc => acc.id === id);
      if (accountIndex === -1) {
        return failure(res, '邮箱账户不存在', 404);
      }

      const deletedAccount = emailAccounts.splice(accountIndex, 1)[0];

      // 如果删除的是默认账户，设置另一个账户为默认
      if (deletedAccount.isDefault && emailAccounts.length > 0) {
        emailAccounts[0].isDefault = true;
      }

      return success(res, { message: '邮箱账户删除成功' }, 200);
    } catch (error) {
      console.error('删除邮箱账户错误:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return failure(res, `删除邮箱账户失败: ${errorMessage}`, 500);
    }
  }

  return failure(res, 'Method not allowed', 405);
}

export default withAuth(accountsHandler);
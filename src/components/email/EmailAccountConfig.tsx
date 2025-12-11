'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { EmailAccount } from '@/types/email';

interface EmailAccountConfigProps {
  onAccountAdded?: (account: EmailAccount) => void;
}

export function EmailAccountConfig({ onAccountAdded }: EmailAccountConfigProps) {
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    imapHost: 'imap.gmail.com',
    imapPort: 993,
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    username: '',
    password: '',
  });
  const { toast } = useToast();

  // 加载邮箱账户列表
  const loadAccounts = async () => {
    try {
      const response = await fetch('/api/email/accounts');
      const result = await response.json();
      
      if (result.success) {
        setAccounts(result.data || []);
      }
    } catch (error) {
      console.error('加载邮箱账户错误:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleAddAccount = async () => {
    if (!formData.email || !formData.username || !formData.password) {
      toast({
        title: '信息不完整',
        description: '请填写邮箱、用户名和密码',
        variant: 'destructive',
      });
      return;
    }

    setIsAdding(true);

    try {
      const response = await fetch('/api/email/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: '添加成功',
          description: '邮箱账户已成功添加',
        });
        
        setAccounts(prev => [...prev, result.data]);
        setFormData({
          email: '',
          imapHost: 'imap.gmail.com',
          imapPort: 993,
          smtpHost: 'smtp.gmail.com',
          smtpPort: 587,
          username: '',
          password: '',
        });
        setShowForm(false);
        
        onAccountAdded?.(result.data);
      } else {
        toast({
          title: '添加失败',
          description: result.error || '添加邮箱账户失败',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('添加邮箱账户错误:', error);
      toast({
        title: '添加失败',
        description: '网络错误，请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    try {
      const response = await fetch(`/api/email/accounts?id=${accountId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: '删除成功',
          description: '邮箱账户已删除',
        });
        
        setAccounts(prev => prev.filter(acc => acc.id !== accountId));
      } else {
        toast({
          title: '删除失败',
          description: result.error || '删除邮箱账户失败',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('删除邮箱账户错误:', error);
      toast({
        title: '删除失败',
        description: '网络错误，请稍后重试',
        variant: 'destructive',
      });
    }
  };

  const presetConfigs = {
    'gmail': {
      imapHost: 'imap.gmail.com',
      imapPort: 993,
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
    },
    'outlook': {
      imapHost: 'outlook.office365.com',
      imapPort: 993,
      smtpHost: 'smtp.office365.com',
      smtpPort: 587,
    },
    'qq': {
      imapHost: 'imap.qq.com',
      imapPort: 993,
      smtpHost: 'smtp.qq.com',
      smtpPort: 587,
    },
  };

  const detectProvider = (email: string) => {
    if (email.includes('gmail.com')) return 'gmail';
    if (email.includes('outlook.com') || email.includes('hotmail.com')) return 'outlook';
    if (email.includes('qq.com')) return 'qq';
    return null;
  };

  const handleEmailChange = (email: string) => {
    const provider = detectProvider(email);
    if (provider && presetConfigs[provider as keyof typeof presetConfigs]) {
      const config = presetConfigs[provider as keyof typeof presetConfigs];
      setFormData(prev => ({
        ...prev,
        email,
        ...config,
        username: email,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        email,
        username: email,
      }));
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">加载中...</div>;
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>邮箱账户配置</CardTitle>
        <CardDescription>
          配置用于发送邮件的邮箱账户
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 现有账户列表 */}
        {accounts.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-medium">已配置的邮箱账户</h3>
            {accounts.map((account) => (
              <div key={account.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{account.email}</div>
                  <div className="text-sm text-gray-500">
                    {account.isDefault && <span className="text-blue-600">默认账户</span>}
                    {!account.isDefault && '备用账户'}
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteAccount(account.id)}
                >
                  删除
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* 添加新账户表单 */}
        {showForm ? (
          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="text-lg font-medium">添加新邮箱账户</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">邮箱地址</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your-email@gmail.com"
                  value={formData.email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="username">用户名</Label>
                <Input
                  id="username"
                  placeholder="邮箱用户名"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">密码/应用密码</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="邮箱密码或应用密码"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="smtpHost">SMTP服务器</Label>
                <Input
                  id="smtpHost"
                  placeholder="smtp.gmail.com"
                  value={formData.smtpHost}
                  onChange={(e) => setFormData(prev => ({ ...prev, smtpHost: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="smtpPort">SMTP端口</Label>
                <Input
                  id="smtpPort"
                  type="number"
                  placeholder="587"
                  value={formData.smtpPort}
                  onChange={(e) => setFormData(prev => ({ ...prev, smtpPort: parseInt(e.target.value) || 587 }))}
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                取消
              </Button>
              <Button
                onClick={handleAddAccount}
                disabled={isAdding}
              >
                {isAdding ? '添加中...' : '添加账户'}
              </Button>
            </div>
          </div>
        ) : (
          <Button onClick={() => setShowForm(true)}>
            添加邮箱账户
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
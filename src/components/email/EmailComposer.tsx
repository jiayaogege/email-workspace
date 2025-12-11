'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

interface EmailComposerProps {
  onSend?: () => void;
  defaultTo?: string;
  defaultSubject?: string;
}

export function EmailComposer({ onSend, defaultTo = '', defaultSubject = '' }: EmailComposerProps) {
  const [to, setTo] = useState(defaultTo);
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const handleSend = async () => {
    if (!to || !subject || !body) {
      toast({
        title: '信息不完整',
        description: '请填写收件人、主题和正文',
        variant: 'destructive',
      });
      return;
    }

    setIsSending(true);

    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          subject,
          body,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: '发送成功',
          description: '邮件已成功发送',
        });
        
        // 清空表单
        setTo('');
        setSubject('');
        setBody('');
        
        onSend?.();
      } else {
        toast({
          title: '发送失败',
          description: result.error || '邮件发送失败',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('发送邮件错误:', error);
      toast({
        title: '发送失败',
        description: '网络错误，请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>发送邮件</CardTitle>
        <CardDescription>
          通过配置的邮箱账户发送邮件
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="to">收件人</Label>
          <Input
            id="to"
            type="email"
            placeholder="recipient@example.com"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="subject">主题</Label>
          <Input
            id="subject"
            placeholder="邮件主题"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="body">正文</Label>
          <Textarea
            id="body"
            placeholder="邮件正文内容"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={8}
            required
          />
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => {
              setTo('');
              setSubject('');
              setBody('');
            }}
          >
            清空
          </Button>
          <Button
            onClick={handleSend}
            disabled={isSending || !to || !subject || !body}
          >
            {isSending ? '发送中...' : '发送邮件'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
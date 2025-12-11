'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { ApiResponse } from '@/types/api';
import useTranslation from '@/lib/hooks/useTranslation';

interface EmailComposerProps {
  onSend?: () => void;
  onClose?: () => void;
  defaultTo?: string;
  defaultSubject?: string;
}

export default function EmailComposer({ onSend, onClose, defaultTo = '', defaultSubject = '' }: EmailComposerProps) {
  const { t } = useTranslation();
  const [to, setTo] = useState(defaultTo);
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const handleSend = async () => {
    if (!to || !subject || !body) {
      toast({
        title: t('incompleteInfo'),
        description: t('fillRequired'),
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

      const result = await response.json() as ApiResponse<null>;

      if (result.success) {
        toast({
          title: t('sendSuccess'),
          description: t('emailSentSuccess'),
        });
        
        // 清空表单
        setTo('');
        setSubject('');
        setBody('');
        
        onSend?.();
        onClose?.();
      } else {
        toast({
          title: t('sendFailed'),
          description: result.error || t('sendFailed'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('发送邮件错误:', error);
      toast({
        title: t('sendFailed'),
        description: t('networkError'),
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{t('composeEmail')}</CardTitle>
        <CardDescription>
          {t('composeEmailDesc')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="to">{t('recipient')}</Label>
          <Input
            id="to"
            type="email"
            placeholder={t('recipientPlaceholder')}
            value={to}
            onChange={(e) => setTo(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="subject">{t('subject')}</Label>
          <Input
            id="subject"
            placeholder={t('subjectPlaceholder')}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="body">{t('body')}</Label>
          <Textarea
            id="body"
            placeholder={t('bodyPlaceholder')}
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
              if (onClose) {
                onClose();
              } else {
                setTo('');
                setSubject('');
                setBody('');
              }
            }}
          >
            {t('cancel')}
          </Button>
          <Button
            onClick={handleSend}
            disabled={isSending || !to || !subject || !body}
          >
            {isSending ? t('sending') : t('sendEmail')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
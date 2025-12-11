"use client";

import { useState, useEffect } from "react";
import useTranslation from "@/lib/hooks/useTranslation";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { EmailAccountConfig } from "@/types/email";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AddEmailAccountDialogProps {
  onAccountAdded?: () => void;
}

const PRESETS = {
  gmail: {
    name: "Gmail",
    imapHost: "imap.gmail.com",
    imapPort: 993,
    smtpHost: "smtp.gmail.com",
    smtpPort: 587,
    domain: "gmail.com"
  },
  outlook: {
    name: "Outlook",
    imapHost: "outlook.office365.com",
    imapPort: 993,
    smtpHost: "smtp.office365.com",
    smtpPort: 587,
    domain: "outlook.com"
  },
  qq: {
    name: "QQ Mail",
    imapHost: "imap.qq.com",
    imapPort: 993,
    smtpHost: "smtp.qq.com",
    smtpPort: 465,
    domain: "qq.com"
  },
  "163": {
    name: "163 Mail",
    imapHost: "imap.163.com",
    imapPort: 993,
    smtpHost: "smtp.163.com",
    smtpPort: 465,
    domain: "163.com"
  },
  icloud: {
    name: "iCloud",
    imapHost: "imap.mail.me.com",
    imapPort: 993,
    smtpHost: "smtp.mail.me.com",
    smtpPort: 587,
    domain: "icloud.com"
  }
};

export function AddEmailAccountDialog({ onAccountAdded }: AddEmailAccountDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>("custom");
  
  const [formData, setFormData] = useState<EmailAccountConfig>({
    email: "",
    username: "",
    password: "",
    imapHost: "",
    imapPort: 993,
    smtpHost: "",
    smtpPort: 587,
  });

  // Auto-detect preset from email domain
  useEffect(() => {
    if (formData.email && selectedPreset === "custom") {
      const domain = formData.email.split("@")[1];
      if (domain) {
        const presetKey = Object.keys(PRESETS).find(key => 
          PRESETS[key as keyof typeof PRESETS].domain === domain
        );
        if (presetKey) {
          setSelectedPreset(presetKey);
          applyPreset(presetKey);
        }
      }
    }
  }, [formData.email, selectedPreset]);

  const applyPreset = (presetKey: string) => {
    if (presetKey === "custom") return;
    const preset = PRESETS[presetKey as keyof typeof PRESETS];
    setFormData(prev => ({
      ...prev,
      imapHost: preset.imapHost,
      imapPort: preset.imapPort,
      smtpHost: preset.smtpHost,
      smtpPort: preset.smtpPort,
    }));
  };

  const handlePresetChange = (value: string) => {
    setSelectedPreset(value);
    if (value !== "custom") {
      applyPreset(value);
    } else {
      setShowAdvanced(true);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "imapPort" || name === "smtpPort" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/email/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        throw new Error((error as any).message || t("addAccountFailed") || "Failed to add account");
      }

      toast({ 
        title: t("success"),
        description: t("addAccount") + " " + t("success"),
      });

      setOpen(false);
      setFormData({
        email: "",
        username: "",
        password: "",
        imapHost: "",
        imapPort: 993,
        smtpHost: "",
        smtpPort: 587,
      });
      setSelectedPreset("custom");
      setShowAdvanced(false);
      
      if (onAccountAdded) {
        onAccountAdded();
      }
    } catch (error) {
      toast({
        title: t("error"),
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          {t("addAccount")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl">{t("addAccount")}</DialogTitle>
            <DialogDescription className="pt-1.5">
              {t("addAccountDesc")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-5 py-6">
            {/* Service Provider Selection */}
            <div className="space-y-2">
              <Label htmlFor="provider" className="text-sm font-medium">
                {t("serviceProvider")}
              </Label>
              <Select value={selectedPreset} onValueChange={handlePresetChange}>
                <SelectTrigger id="provider">
                  <SelectValue placeholder={t("selectProvider")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">{t("custom")}</SelectItem>
                  {Object.entries(PRESETS).map(([key, preset]) => (
                    <SelectItem key={key} value={key}>{preset.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                {t("email")}
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@email.com"
                required
              />
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                {t("smtpUsername")}
              </Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder={t("smtpUsername")}
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                {t("password")}
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>

            {/* Advanced Settings Toggle */}
            <div className="flex items-center justify-center pt-2">
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {showAdvanced ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1.5" />
                    {t("hideAdvancedSettings") || "隐藏高级设置"}
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1.5" />
                    {t("advancedSettings")}
                  </>
                )}
              </Button>
            </div>
            
            {/* Advanced Settings */}
            {showAdvanced && (
              <div className="space-y-5 border rounded-lg p-5 bg-muted/30">
                {/* IMAP Settings */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <div className="font-semibold text-sm">{t("imapSettings")}</div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="imapHost" className="text-sm font-medium">
                      {t("host")}
                    </Label>
                    <Input
                      id="imapHost"
                      name="imapHost"
                      value={formData.imapHost}
                      onChange={handleChange}
                      placeholder="imap.example.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="imapPort" className="text-sm font-medium">
                      {t("port")}
                    </Label>
                    <Input
                      id="imapPort"
                      name="imapPort"
                      type="number"
                      value={formData.imapPort}
                      onChange={handleChange}
                      placeholder="993"
                    />
                  </div>
                </div>

                {/* SMTP Settings */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <div className="font-semibold text-sm">{t("smtpSettings")}</div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="smtpHost" className="text-sm font-medium">
                      {t("host")}
                    </Label>
                    <Input
                      id="smtpHost"
                      name="smtpHost"
                      value={formData.smtpHost}
                      onChange={handleChange}
                      placeholder="smtp.example.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="smtpPort" className="text-sm font-medium">
                      {t("port")}
                    </Label>
                    <Input
                      id="smtpPort"
                      name="smtpPort"
                      type="number"
                      value={formData.smtpPort}
                      onChange={handleChange}
                      placeholder="587"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t("detecting") : t("save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { EmailAccountConfig } from "@/types/email";
import { Plus } from "lucide-react";

interface AddEmailAccountDialogProps {
  onAccountAdded?: () => void;
}

export function AddEmailAccountDialog({ onAccountAdded }: AddEmailAccountDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<EmailAccountConfig>({
    email: "",
    username: "",
    password: "",
    imapHost: "",
    imapPort: 993,
    smtpHost: "",
    smtpPort: 587,
  });

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
        throw new Error((error as any).message || "Failed to add account");
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
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t("addAccount")}</DialogTitle>
            <DialogDescription>
              {t("fillRequired")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                {t("email")}
              </Label>
              <Input
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                {t("smtpUsername")}
              </Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                {t("password")}
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            
            <div className="col-span-4 mt-2 font-semibold">{t("imapSettings")}</div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="imapHost" className="text-right">
                {t("host") || "Host"}
              </Label>
              <Input
                id="imapHost"
                name="imapHost"
                value={formData.imapHost}
                onChange={handleChange}
                className="col-span-3"
                placeholder="imap.example.com"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="imapPort" className="text-right">
                {t("port") || "Port"}
              </Label>
              <Input
                id="imapPort"
                name="imapPort"
                type="number"
                value={formData.imapPort}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>

            <div className="col-span-4 mt-2 font-semibold">{t("smtpSettings")}</div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="smtpHost" className="text-right">
                {t("host") || "Host"}
              </Label>
              <Input
                id="smtpHost"
                name="smtpHost"
                value={formData.smtpHost}
                onChange={handleChange}
                className="col-span-3"
                placeholder="smtp.example.com"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="smtpPort" className="text-right">
                {t("port") || "Port"}
              </Label>
              <Input
                id="smtpPort"
                name="smtpPort"
                type="number"
                value={formData.smtpPort}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "..." : t("save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { EmailAccount } from "@/types/email";
import { ApiResponse } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Trash2, Mail } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import DeleteDialog from "@/components/common/DeleteDialog";
import { AddEmailAccountDialog } from "./AddEmailAccountDialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function EmailAccountList() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/email/accounts");
      if (res.ok) {
        const response = await res.json() as ApiResponse<EmailAccount[]>;
        setAccounts(response.data || []);
      }
    } catch (error) {
      console.error(error);
      toast({
        title: t("error"),
        description: "Failed to fetch accounts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [t, toast]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/email/accounts?id=${id}`, {
        method: "DELETE",
      });
      
      if (!res.ok) {
        throw new Error("Failed to delete account");
      }

      toast({
        title: t("success"),
        description: "Account deleted",
      });
      fetchAccounts();
    } catch {
      toast({
        title: t("error"),
        description: "Failed to delete account",
        variant: "destructive",
      });
    }
  };


  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="grid gap-1.5">
          <CardTitle>{t("emailAccounts")}</CardTitle>
          <CardDescription>
            {t("manageEmailAccounts") || "Manage your email accounts for sending and receiving emails."}
          </CardDescription>
        </div>
        <AddEmailAccountDialog onAccountAdded={fetchAccounts} />
      </CardHeader>
      <CardContent className="grid gap-4">
        {loading && <div className="text-sm text-muted-foreground">Loading...</div>}
        {!loading && accounts.length === 0 && (
          <div className="text-sm text-muted-foreground text-center py-4">
            {t("noAccounts") || "No email accounts added yet."}
          </div>
        )}
        <div className="grid gap-4">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="flex items-center justify-between space-x-4 rounded-md border p-4"
            >
              <div className="flex items-center space-x-4">
                <div className="rounded-full bg-primary/10 p-2">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {account.email}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {account.username}
                  </p>
                </div>
              </div>
              <DeleteDialog
                title={t("deleteAccount") || "Delete Account"}
                description={t("deleteAccountConfirm") || "Are you sure you want to delete this account?"}
                cancelText={t("cancel") || "Cancel"}
                confirmText={t("delete") || "Delete"}
                trigger={
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Trash2 className="h-4 w-4 text-destructive" />
                    <span className="sr-only">Delete</span>
                  </Button>
                }
                onConfirm={() => handleDelete(account.id)}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

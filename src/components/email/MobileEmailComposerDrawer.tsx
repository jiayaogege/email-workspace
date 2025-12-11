"use client";

import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import EmailComposer from "@/components/email/EmailComposer";
import useTranslation from "@/lib/hooks/useTranslation";
import useEmailStore from "@/lib/store/email";

interface MobileEmailComposerDrawerProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function MobileEmailComposerDrawer({ open, onOpenChange }: MobileEmailComposerDrawerProps) {
  const { t } = useTranslation();
  const setComposerOpen = useEmailStore((state) => state.setComposerOpen);

  return (
    <Drawer
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setComposerOpen(false);
        }
        onOpenChange?.(nextOpen);
      }}
    >
      <DrawerContent className="max-h-[92vh] md:hidden">
        <DrawerHeader className="hidden">
          <DrawerTitle>{t("composeEmail")}</DrawerTitle>
          <DrawerDescription>{t("composeEmailDesc")}</DrawerDescription>
        </DrawerHeader>
        <div className="h-[85vh] overflow-hidden p-4">
          <EmailComposer onClose={() => setComposerOpen(false)} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

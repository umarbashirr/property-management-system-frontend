import { useEffect } from "react";
import { IconLoader } from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDeleteTenant } from "@/features/tenants/hooks/useDeleteTenant";
import type { Tenant } from "@/features/tenants/types/tenants.types";

interface DeleteTenantDialogProps {
  tenant: Tenant | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteTenantDialog({ tenant, open, onOpenChange }: DeleteTenantDialogProps) {
  const { mutate, isPending, isSuccess, reset } = useDeleteTenant();

  useEffect(() => {
    if (isSuccess) {
      onOpenChange(false);
      reset();
    }
  }, [isSuccess, onOpenChange, reset]);

  function handleDelete() {
    if (!tenant) return;
    mutate(tenant.id);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete tenant</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">{tenant?.name}</span>? This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            {isPending && <IconLoader size={16} className="mr-2 animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

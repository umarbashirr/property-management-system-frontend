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
import { useDeactivateUser } from "@/features/users/hooks/useDeactivateUser";
import type { StaffUser } from "@/features/users/types/users.types";

interface DeactivateUserDialogProps {
  user: StaffUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeactivateUserDialog({ user, open, onOpenChange }: DeactivateUserDialogProps) {
  const { mutate, isPending, isSuccess, reset } = useDeactivateUser();

  useEffect(() => {
    if (isSuccess) {
      onOpenChange(false);
      reset();
    }
  }, [isSuccess, onOpenChange, reset]);

  function handleDeactivate() {
    if (!user) return;
    mutate(user.id);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deactivate staff member</DialogTitle>
          <DialogDescription>
            Are you sure you want to deactivate{" "}
            <span className="font-semibold text-foreground">
              {user?.firstName} {user?.lastName}
            </span>
            ? They will lose access to the system but their data will be preserved.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDeactivate} disabled={isPending}>
            {isPending && <IconLoader size={16} className="mr-2 animate-spin" />}
            Deactivate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

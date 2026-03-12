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
import { useDeletePlan } from "@/features/plans/hooks/useDeletePlan";
import type { Plan } from "@/features/plans/types/plans.types";

interface DeletePlanDialogProps {
  plan: Plan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeletePlanDialog({ plan, open, onOpenChange }: DeletePlanDialogProps) {
  const { mutate, isPending, isSuccess, reset } = useDeletePlan();

  useEffect(() => {
    if (isSuccess) {
      onOpenChange(false);
      reset();
    }
  }, [isSuccess, onOpenChange, reset]);

  function handleDelete() {
    if (!plan) return;
    mutate(plan.id);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete plan</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">{plan?.displayName}</span>?
            Tenants currently on this plan will need to be migrated first.
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

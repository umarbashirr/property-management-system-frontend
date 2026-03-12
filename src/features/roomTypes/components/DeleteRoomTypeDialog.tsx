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
import { useDeleteRoomType } from "@/features/roomTypes/hooks/useDeleteRoomType";
import type { RoomType } from "@/features/roomTypes/types/roomTypes.types";

interface DeleteRoomTypeDialogProps {
  propertyId: string;
  roomType: RoomType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteRoomTypeDialog({ propertyId, roomType, open, onOpenChange }: DeleteRoomTypeDialogProps) {
  const { mutate, isPending, isSuccess, reset } = useDeleteRoomType(propertyId);

  useEffect(() => {
    if (isSuccess) {
      onOpenChange(false);
      reset();
    }
  }, [isSuccess, onOpenChange, reset]);

  function handleDelete() {
    if (!roomType) return;
    mutate(roomType.id);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete room type</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">{roomType?.name}</span>? This action
            cannot be undone.
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

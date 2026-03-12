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
import { useDeleteRoom } from "@/features/rooms/hooks/useDeleteRoom";
import type { Room } from "@/features/rooms/types/rooms.types";

interface DeleteRoomDialogProps {
  propertyId: string;
  room: Room | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteRoomDialog({ propertyId, room, open, onOpenChange }: DeleteRoomDialogProps) {
  const { mutate, isPending, isSuccess, reset } = useDeleteRoom(propertyId);

  useEffect(() => {
    if (isSuccess) {
      onOpenChange(false);
      reset();
    }
  }, [isSuccess, onOpenChange, reset]);

  function handleDelete() {
    if (!room) return;
    mutate(room.id);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete room</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete room{" "}
            <span className="font-semibold text-foreground">{room?.roomNumber}</span>? This action
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

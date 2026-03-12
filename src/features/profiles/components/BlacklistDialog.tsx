import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useSetBlacklist } from "@/features/profiles/hooks/useSetBlacklist";
import type { Profile } from "@/features/profiles/types/profiles.types";

interface BlacklistDialogProps {
  profile: Profile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BlacklistDialog({ profile, open, onOpenChange }: BlacklistDialogProps) {
  const { mutate, isPending } = useSetBlacklist();
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const isBlacklisting = profile ? !profile.isBlacklisted : true;

  function handleOpenChange(next: boolean) {
    if (!next) {
      setReason("");
      setError("");
    }
    onOpenChange(next);
  }

  function handleSubmit() {
    if (!profile) return;

    if (isBlacklisting && !reason.trim()) {
      setError("Reason is required when blacklisting a profile");
      return;
    }

    mutate(
      {
        id: profile.id,
        dto: {
          isBlacklisted: isBlacklisting,
          ...(isBlacklisting ? { blacklistReason: reason.trim() } : {}),
        },
      },
      {
        onSuccess: () => {
          setReason("");
          setError("");
          onOpenChange(false);
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isBlacklisting ? "Blacklist profile" : "Remove blacklist"}
          </DialogTitle>
          <DialogDescription>
            {isBlacklisting ? (
              <>
                Blacklist{" "}
                <span className="font-semibold text-foreground">
                  {profile?.firstName} {profile?.lastName}
                </span>
                ? A reason is required.
              </>
            ) : (
              <>
                Remove blacklist status from{" "}
                <span className="font-semibold text-foreground">
                  {profile?.firstName} {profile?.lastName}
                </span>
                ?
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {isBlacklisting && (
          <div className="space-y-1.5">
            <Label htmlFor="blacklist-reason">
              Reason <span className="text-destructive">*</span>
            </Label>
            <Input
              id="blacklist-reason"
              placeholder="Enter blacklist reason…"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError("");
              }}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant={isBlacklisting ? "destructive" : "default"}
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending && <IconLoader size={16} className="mr-2 animate-spin" />}
            {isBlacklisting ? "Blacklist" : "Remove blacklist"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

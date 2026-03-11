import { IconLoader, IconLogout, IconUser } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useLogout } from "@/features/auth/hooks/useLogout";

export function Header() {
  const user = useAuthStore((s) => s.user);
  const { mutate: logout, isPending } = useLogout();

  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-6">
      <div />

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <IconUser size={16} />
            <span className="font-medium text-foreground">{user.role.replace("_", " ")}</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => logout()}
          disabled={isPending}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          {isPending ? (
            <IconLoader size={16} className="animate-spin" />
          ) : (
            <IconLogout size={16} />
          )}
          Sign out
        </Button>
      </div>
    </header>
  );
}

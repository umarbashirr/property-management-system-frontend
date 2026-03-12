import { cn } from "@/lib/utils";

interface PlanStatusBadgeProps {
  isActive: boolean;
}

export function PlanStatusBadge({ isActive }: PlanStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        isActive
          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
          : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800/50 dark:text-zinc-400"
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          isActive ? "bg-green-500" : "bg-zinc-400"
        )}
      />
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

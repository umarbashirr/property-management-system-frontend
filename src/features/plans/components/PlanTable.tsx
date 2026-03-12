import { useNavigate } from "react-router";
import { IconDots, IconEdit, IconTrash } from "@tabler/icons-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { PlanStatusBadge } from "@/features/plans/components/PlanStatusBadge";
import type { Plan } from "@/features/plans/types/plans.types";

function formatPrice(cents: number): string {
  if (cents === 0) return "Free";
  return `$${(cents / 100).toFixed(2)}`;
}

const dateFormatter = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" });

interface PlanTableProps {
  plans: Plan[];
  isLoading: boolean;
  onDeleteClick: (plan: Plan) => void;
}

function SkeletonRow() {
  return (
    <TableRow>
      {Array.from({ length: 7 }).map((_, i) => (
        <TableCell key={i}>
          <div className="h-4 rounded bg-muted animate-pulse" />
        </TableCell>
      ))}
    </TableRow>
  );
}

export function PlanTable({ plans, isLoading, onDeleteClick }: PlanTableProps) {
  const navigate = useNavigate();

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Plan</TableHead>
            <TableHead className="text-center">Properties</TableHead>
            <TableHead className="text-center">Rooms / Prop</TableHead>
            <TableHead className="text-center">Users</TableHead>
            <TableHead className="text-right">Monthly</TableHead>
            <TableHead className="text-right">Yearly</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
          ) : plans.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
                No plans found.
              </TableCell>
            </TableRow>
          ) : (
            plans.map((plan) => (
              <TableRow key={plan.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{plan.displayName}</p>
                    <p className="text-xs text-muted-foreground font-mono">{plan.name}</p>
                  </div>
                </TableCell>
                <TableCell className="text-center tabular-nums">
                  {plan.maxProperties}
                </TableCell>
                <TableCell className="text-center tabular-nums">
                  {plan.maxRoomsPerProperty}
                </TableCell>
                <TableCell className="text-center tabular-nums">
                  {plan.maxUsers}
                </TableCell>
                <TableCell className="text-right tabular-nums font-medium">
                  {formatPrice(plan.priceMonthly)}
                </TableCell>
                <TableCell className="text-right tabular-nums font-medium">
                  {formatPrice(plan.priceYearly)}
                </TableCell>
                <TableCell>
                  <PlanStatusBadge isActive={plan.isActive} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {dateFormatter.format(new Date(plan.createdAt))}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={<Button variant="ghost" size="icon" className="h-8 w-8" />}
                    >
                      <IconDots size={16} />
                      <span className="sr-only">Actions</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => navigate(`/super-admin/plans/${plan.id}`)}
                        className="gap-2"
                      >
                        <IconEdit size={16} />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDeleteClick(plan)}
                        className="gap-2 text-destructive focus:text-destructive"
                      >
                        <IconTrash size={16} />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

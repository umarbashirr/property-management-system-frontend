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
import { StatusBadge } from "@/features/tenants/components/StatusBadge";
import type { Tenant } from "@/features/tenants/types/tenants.types";

const dateFormatter = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" });

interface TenantTableProps {
  tenants: Tenant[];
  isLoading: boolean;
  onDeleteClick: (tenant: Tenant) => void;
}

function SkeletonRow() {
  return (
    <TableRow>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableCell key={i}>
          <div className="h-4 rounded bg-muted animate-pulse" />
        </TableCell>
      ))}
    </TableRow>
  );
}

export function TenantTable({ tenants, isLoading, onDeleteClick }: TenantTableProps) {
  const navigate = useNavigate();

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
          ) : tenants.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                No tenants found.
              </TableCell>
            </TableRow>
          ) : (
            tenants.map((tenant) => (
              <TableRow
                key={tenant.id}
                className="cursor-pointer"
                onClick={() => navigate(`/super-admin/tenants/${tenant.id}`)}
              >
                <TableCell className="font-medium">{tenant.name}</TableCell>
                <TableCell className="text-muted-foreground font-mono text-sm">
                  {tenant.slug}
                </TableCell>
                <TableCell>{tenant.plan.displayName}</TableCell>
                <TableCell>
                  <StatusBadge status={tenant.status} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {dateFormatter.format(new Date(tenant.createdAt))}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <IconDots size={16} />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => navigate(`/super-admin/tenants/${tenant.id}`)}
                        className="gap-2"
                      >
                        <IconEdit size={16} />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDeleteClick(tenant)}
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

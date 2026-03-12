import { useState, useEffect } from "react";
import { IconSearch } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/useDebounce";
import type { ListUsersQuery } from "@/features/users/types/users.types";

interface UserFiltersProps {
  filters: Partial<ListUsersQuery>;
  onFiltersChange: (filters: Partial<ListUsersQuery>) => void;
}

export function UserFilters({ filters, onFiltersChange }: UserFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search ?? "");
  const debouncedSearch = useDebounce(searchInput, 300);

  useEffect(() => {
    onFiltersChange({ ...filters, search: debouncedSearch || undefined, page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  function handleRoleChange(value: string | null) {
    onFiltersChange({
      ...filters,
      role: !value || value === "all" ? undefined : (value as ListUsersQuery["role"]),
      page: 1,
    });
  }

  function handleStatusChange(value: string | null) {
    onFiltersChange({
      ...filters,
      isActive: !value || value === "all" ? undefined : value === "active",
      page: 1,
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 max-w-xs">
        <IconSearch
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder="Search by name or email…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select value={filters.role ?? "all"} onValueChange={handleRoleChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="All roles" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" label="All roles">All roles</SelectItem>
          <SelectItem value="tenant_admin" label="Tenant Admin">Tenant Admin</SelectItem>
          <SelectItem value="property_manager" label="Property Manager">Property Manager</SelectItem>
          <SelectItem value="front_desk" label="Front Desk">Front Desk</SelectItem>
          <SelectItem value="housekeeping" label="Housekeeping">Housekeeping</SelectItem>
          <SelectItem value="accountant" label="Accountant">Accountant</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.isActive === undefined ? "all" : filters.isActive ? "active" : "inactive"}
        onValueChange={handleStatusChange}
      >
        <SelectTrigger className="w-36">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" label="All statuses">All statuses</SelectItem>
          <SelectItem value="active" label="Active">Active</SelectItem>
          <SelectItem value="inactive" label="Inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

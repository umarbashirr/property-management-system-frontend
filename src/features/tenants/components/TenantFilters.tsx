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
import type { ListTenantsQuery, TenantStatus } from "@/features/tenants/types/tenants.types";

interface TenantFiltersProps {
  filters: Partial<ListTenantsQuery>;
  onFiltersChange: (filters: Partial<ListTenantsQuery>) => void;
}

export function TenantFilters({ filters, onFiltersChange }: TenantFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search ?? "");
  const debouncedSearch = useDebounce(searchInput, 300);

  useEffect(() => {
    onFiltersChange({ ...filters, search: debouncedSearch || undefined, page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  function handleStatusChange(value: string) {
    onFiltersChange({
      ...filters,
      status: value === "all" ? undefined : (value as TenantStatus),
      page: 1,
    });
  }

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1 max-w-xs">
        <IconSearch
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder="Search by name or slug…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select
        value={filters.status ?? "all"}
        onValueChange={handleStatusChange}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" label="All statuses">All statuses</SelectItem>
          <SelectItem value="active" label="Active">Active</SelectItem>
          <SelectItem value="suspended" label="Suspended">Suspended</SelectItem>
          <SelectItem value="cancelled" label="Cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

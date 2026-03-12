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
import type { ListPlansQuery } from "@/features/plans/types/plans.types";

interface PlanFiltersProps {
  filters: Partial<ListPlansQuery>;
  onFiltersChange: (filters: Partial<ListPlansQuery>) => void;
}

export function PlanFilters({ filters, onFiltersChange }: PlanFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search ?? "");
  const debouncedSearch = useDebounce(searchInput, 300);

  useEffect(() => {
    onFiltersChange({ ...filters, search: debouncedSearch || undefined, page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  function handleStatusChange(value: string | null) {
    const v = value ?? "all";
    onFiltersChange({
      ...filters,
      isActive: v === "all" ? undefined : v === "active",
      page: 1,
    });
  }

  const currentStatus = filters.isActive === undefined
    ? "all"
    : filters.isActive
      ? "active"
      : "inactive";

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1 max-w-xs">
        <IconSearch
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder="Search by name…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select value={currentStatus} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder="All plans" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All plans</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

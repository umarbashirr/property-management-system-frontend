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
import type { ListPropertiesQuery } from "@/features/properties/types/properties.types";

interface PropertyFiltersProps {
  filters: Partial<ListPropertiesQuery>;
  onFiltersChange: (filters: Partial<ListPropertiesQuery>) => void;
}

export function PropertyFilters({ filters, onFiltersChange }: PropertyFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search ?? "");
  const debouncedSearch = useDebounce(searchInput, 300);

  useEffect(() => {
    onFiltersChange({ ...filters, search: debouncedSearch || undefined, page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  function handleStatusChange(value: string) {
    onFiltersChange({
      ...filters,
      isActive: value === "all" ? undefined : value === "active",
      page: 1,
    });
  }

  const activeValue =
    filters.isActive === undefined ? "all" : filters.isActive ? "active" : "inactive";

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

      <Select value={activeValue} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-40">
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

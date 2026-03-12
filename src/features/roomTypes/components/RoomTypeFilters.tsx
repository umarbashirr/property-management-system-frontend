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
import type { ListRoomTypesQuery } from "@/features/roomTypes/types/roomTypes.types";

interface RoomTypeFiltersProps {
  filters: Partial<ListRoomTypesQuery>;
  onFiltersChange: (filters: Partial<ListRoomTypesQuery>) => void;
}

export function RoomTypeFilters({ filters, onFiltersChange }: RoomTypeFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search ?? "");
  const debouncedSearch = useDebounce(searchInput, 300);

  useEffect(() => {
    onFiltersChange({ ...filters, search: debouncedSearch || undefined, page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  function handleStatusChange(value: string | null) {
    onFiltersChange({
      ...filters,
      isActive: !value || value === "all" ? undefined : value === "active",
      page: 1,
    });
  }

  function handleBedTypeChange(value: string | null) {
    onFiltersChange({
      ...filters,
      bedType: !value || value === "all" ? undefined : (value as ListRoomTypesQuery["bedType"]),
      page: 1,
    });
  }

  const activeValue =
    filters.isActive === undefined ? "all" : filters.isActive ? "active" : "inactive";

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="relative flex-1 min-w-48 max-w-xs">
        <IconSearch
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder="Search by name or code…"
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

      <Select value={filters.bedType ?? "all"} onValueChange={handleBedTypeChange}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="All bed types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" label="All bed types">All bed types</SelectItem>
          <SelectItem value="king" label="King">King</SelectItem>
          <SelectItem value="queen" label="Queen">Queen</SelectItem>
          <SelectItem value="twin" label="Twin">Twin</SelectItem>
          <SelectItem value="double" label="Double">Double</SelectItem>
          <SelectItem value="single" label="Single">Single</SelectItem>
          <SelectItem value="sofa_bed" label="Sofa bed">Sofa bed</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

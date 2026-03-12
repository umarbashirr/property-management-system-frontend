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
import { useRoomTypes } from "@/features/roomTypes/hooks/useRoomTypes";
import type { ListRoomsQuery } from "@/features/rooms/types/rooms.types";

interface RoomFiltersProps {
  propertyId: string;
  filters: Partial<ListRoomsQuery>;
  onFiltersChange: (filters: Partial<ListRoomsQuery>) => void;
}

export function RoomFilters({ propertyId, filters, onFiltersChange }: RoomFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search ?? "");
  const debouncedSearch = useDebounce(searchInput, 300);

  const { data: roomTypesData } = useRoomTypes(propertyId, { limit: 100, isActive: true });

  useEffect(() => {
    onFiltersChange({ ...filters, search: debouncedSearch || undefined, page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  function handleStatusChange(value: string | null) {
    onFiltersChange({
      ...filters,
      status: !value || value === "all" ? undefined : (value as ListRoomsQuery["status"]),
      page: 1,
    });
  }

  function handleRoomTypeChange(value: string | null) {
    onFiltersChange({
      ...filters,
      roomTypeId: !value || value === "all" ? undefined : value,
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
          placeholder="Search by room number…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select value={filters.status ?? "all"} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" label="All statuses">All statuses</SelectItem>
          <SelectItem value="available" label="Available">Available</SelectItem>
          <SelectItem value="occupied" label="Occupied">Occupied</SelectItem>
          <SelectItem value="dirty" label="Dirty">Dirty</SelectItem>
          <SelectItem value="maintenance" label="Maintenance">Maintenance</SelectItem>
          <SelectItem value="out_of_order" label="Out of Order">Out of Order</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.roomTypeId ?? "all"} onValueChange={handleRoomTypeChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="All room types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" label="All room types">All room types</SelectItem>
          {roomTypesData?.data.map((rt) => (
            <SelectItem key={rt.id} value={rt.id} label={rt.name}>
              {rt.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

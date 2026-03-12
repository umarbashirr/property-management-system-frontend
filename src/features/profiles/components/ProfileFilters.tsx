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
import type { ListProfilesQuery } from "@/features/profiles/types/profiles.types";

const typeItems = [
  { value: "all", label: "All Types" },
  { value: "individual", label: "Individual" },
  { value: "corporate", label: "Corporate" },
  { value: "travel_agent", label: "Travel Agent" },
];

const vipItems = [
  { value: "all", label: "All VIP" },
  { value: "yes", label: "VIP Only" },
  { value: "no", label: "Non-VIP" },
];

const blacklistItems = [
  { value: "all", label: "All" },
  { value: "yes", label: "Blacklisted" },
  { value: "no", label: "Not Blacklisted" },
];

const sourceItems = [
  { value: "all", label: "All Sources" },
  { value: "walk_in", label: "Walk-in" },
  { value: "direct", label: "Direct" },
  { value: "ota", label: "OTA" },
  { value: "corporate", label: "Corporate" },
  { value: "travel_agent", label: "Travel Agent" },
  { value: "referral", label: "Referral" },
];

interface ProfileFiltersProps {
  filters: Partial<ListProfilesQuery>;
  onFiltersChange: (filters: Partial<ListProfilesQuery>) => void;
}

export function ProfileFilters({ filters, onFiltersChange }: ProfileFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search ?? "");
  const debouncedSearch = useDebounce(searchInput, 300);

  useEffect(() => {
    onFiltersChange({ ...filters, search: debouncedSearch || undefined, page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  function handleTypeChange(value: string | null) {
    onFiltersChange({
      ...filters,
      type: !value || value === "all" ? undefined : (value as ListProfilesQuery["type"]),
      page: 1,
    });
  }

  function handleVipChange(value: string | null) {
    onFiltersChange({
      ...filters,
      isVip: !value || value === "all" ? undefined : value === "yes",
      page: 1,
    });
  }

  function handleBlacklistChange(value: string | null) {
    onFiltersChange({
      ...filters,
      isBlacklisted: !value || value === "all" ? undefined : value === "yes",
      page: 1,
    });
  }

  function handleSourceChange(value: string | null) {
    onFiltersChange({
      ...filters,
      source: !value || value === "all" ? undefined : (value as ListProfilesQuery["source"]),
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
          placeholder="Search by name, email, or phone…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select
        value={filters.type ?? "all"}
        onValueChange={handleTypeChange}
        items={typeItems}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent>
          {typeItems.map((item) => (
            <SelectItem key={item.value} value={item.value} label={item.label}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.isVip === undefined ? "all" : filters.isVip ? "yes" : "no"}
        onValueChange={handleVipChange}
        items={vipItems}
      >
        <SelectTrigger className="w-28">
          <SelectValue placeholder="VIP" />
        </SelectTrigger>
        <SelectContent>
          {vipItems.map((item) => (
            <SelectItem key={item.value} value={item.value} label={item.label}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.isBlacklisted === undefined ? "all" : filters.isBlacklisted ? "yes" : "no"}
        onValueChange={handleBlacklistChange}
        items={blacklistItems}
      >
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Blacklist" />
        </SelectTrigger>
        <SelectContent>
          {blacklistItems.map((item) => (
            <SelectItem key={item.value} value={item.value} label={item.label}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.source ?? "all"}
        onValueChange={handleSourceChange}
        items={sourceItems}
      >
        <SelectTrigger className="w-36">
          <SelectValue placeholder="All Sources" />
        </SelectTrigger>
        <SelectContent>
          {sourceItems.map((item) => (
            <SelectItem key={item.value} value={item.value} label={item.label}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

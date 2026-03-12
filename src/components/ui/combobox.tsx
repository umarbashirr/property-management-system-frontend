import * as React from "react";
import { createPortal } from "react-dom";
import { IconCheck, IconChevronDown, IconSearch } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ComboboxOption {
  value: string;
  label: string;
  /** Optional secondary text shown to the right */
  meta?: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  id?: string;
  /** Custom render for the trigger display when an option is selected */
  renderSelected?: (option: ComboboxOption | undefined) => React.ReactNode;
  /** Fixed width for the dropdown (overrides matching trigger width) */
  dropdownWidth?: number;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  emptyMessage = "No results found.",
  disabled = false,
  id,
  renderSelected,
  dropdownWidth,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);
  const [highlightIndex, setHighlightIndex] = React.useState(-1);
  const [dropdownStyle, setDropdownStyle] = React.useState<React.CSSProperties>({
    position: "fixed",
    visibility: "hidden",
  });

  const selectedOption = options.find((o) => o.value === value);

  const filtered = React.useMemo(() => {
    if (!search) return options;
    const lower = search.toLowerCase();
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(lower) ||
        o.value.toLowerCase().includes(lower) ||
        o.meta?.toLowerCase().includes(lower),
    );
  }, [options, search]);

  // Reset highlight when filtered list changes
  React.useEffect(() => {
    setHighlightIndex(-1);
  }, [filtered.length]);

  // Position the dropdown relative to the trigger
  React.useEffect(() => {
    if (!open || !triggerRef.current) return;

    function updatePosition() {
      const rect = triggerRef.current!.getBoundingClientRect();
      const dropdownHeight = dropdownRef.current?.offsetHeight ?? 280;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const gap = 4;

      // Flip upward if not enough room below but enough above
      const openAbove = spaceBelow < dropdownHeight + gap && spaceAbove > spaceBelow;

      const width = dropdownWidth ?? rect.width;
      // Right-align the dropdown to the trigger if dropdown is wider
      const left =
        dropdownWidth && dropdownWidth > rect.width
          ? rect.right - dropdownWidth
          : rect.left;

      setDropdownStyle({
        position: "fixed",
        left: Math.max(8, left), // keep 8px from viewport edge
        width,
        zIndex: 50,
        visibility: "visible",
        ...(openAbove
          ? { bottom: window.innerHeight - rect.top + gap }
          : { top: rect.bottom + gap }),
      });
    }

    updatePosition();

    // Reposition on scroll/resize
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open]);

  // Close on outside click
  React.useEffect(() => {
    if (!open) return;

    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Focus search input when opened
  React.useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      setSearch("");
      setDropdownStyle({ position: "fixed", visibility: "hidden" });
    }
  }, [open]);

  // Scroll highlighted item into view
  React.useEffect(() => {
    if (highlightIndex >= 0 && listRef.current) {
      const item = listRef.current.children[highlightIndex] as HTMLElement;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightIndex]);

  function handleSelect(optionValue: string) {
    onChange(optionValue);
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightIndex((i) => Math.min(i + 1, filtered.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightIndex >= 0 && filtered[highlightIndex]) {
          handleSelect(filtered[highlightIndex].value);
        }
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
    }
  }

  const dropdown = open
    ? createPortal(
        <div
          ref={dropdownRef}
          style={dropdownStyle}
          onKeyDown={handleKeyDown}
          className="rounded-lg border border-border bg-popover shadow-lg animate-in fade-in-0 zoom-in-95"
        >
          {/* Search */}
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <IconSearch size={14} className="shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          {/* Options list */}
          <ul
            ref={listRef}
            role="listbox"
            className="max-h-56 overflow-y-auto overscroll-contain p-1"
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </li>
            ) : (
              filtered.map((option, i) => (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={option.value === value}
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    i === highlightIndex && "bg-accent text-accent-foreground",
                    option.value === value && "font-medium",
                  )}
                >
                  <IconCheck
                    size={14}
                    className={cn(
                      "shrink-0",
                      option.value === value
                        ? "text-primary"
                        : "text-transparent",
                    )}
                  />
                  <span className="truncate">{option.label}</span>
                  {option.meta && (
                    <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                      {option.meta}
                    </span>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>,
        document.body,
      )
    : null;

  return (
    <div className="relative" onKeyDown={handleKeyDown}>
      {/* Trigger button */}
      <button
        ref={triggerRef}
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-2.5 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          "dark:bg-input/30",
          !selectedOption && "text-muted-foreground",
        )}
      >
        <span className="truncate">
          {renderSelected
            ? (renderSelected(selectedOption) ?? placeholder)
            : (selectedOption?.label ?? placeholder)}
        </span>
        <IconChevronDown
          size={14}
          className={cn(
            "shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {dropdown}
    </div>
  );
}

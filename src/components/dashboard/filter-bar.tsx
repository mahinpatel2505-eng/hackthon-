"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface FilterBarProps {
  categories: string[];
  locations: { id: string; name: string; type: string }[];
}

const DOCUMENT_TYPES = [
  { value: "RECEIPT", label: "Receipts" },
  { value: "DELIVERY", label: "Deliveries" },
  { value: "INTERNAL_TRANSFER", label: "Internal Transfers" },
  { value: "ADJUSTMENT", label: "Adjustments" },
];

const STATUSES = [
  { value: "DRAFT", label: "Draft" },
  { value: "VALIDATED", label: "Validated" },
  { value: "CANCELLED", label: "Cancelled" },
];

export function FilterBar({ categories, locations }: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentType = searchParams.get("type") ?? "";
  const currentStatus = searchParams.get("status") ?? "";
  const currentLocation = searchParams.get("location") ?? "";
  const currentCategory = searchParams.get("category") ?? "";

  const hasActiveFilters = currentType || currentStatus || currentLocation || currentCategory;

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clearFilters = useCallback(() => {
    router.push("/");
  }, [router]);

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-4 shadow-sm">
      <span className="text-sm font-semibold text-muted-foreground mr-1">Filters</span>

      <Select
        value={currentType || "all"}
        onValueChange={(v) => updateFilter("type", v ?? "")}
      >
        <SelectTrigger className="w-[180px] h-9" id="filter-document-type">
          <SelectValue placeholder="Document Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          {DOCUMENT_TYPES.map((t) => (
            <SelectItem key={t.value} value={t.value}>
              {t.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={currentStatus || "all"}
        onValueChange={(v) => updateFilter("status", v ?? "")}
      >
        <SelectTrigger className="w-[160px] h-9" id="filter-status">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          {STATUSES.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={currentLocation || "all"}
        onValueChange={(v) => updateFilter("location", v ?? "")}
      >
        <SelectTrigger className="w-[180px] h-9" id="filter-location">
          <SelectValue placeholder="Location" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Locations</SelectItem>
          {locations.map((l) => (
            <SelectItem key={l.id} value={l.id}>
              {l.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={currentCategory || "all"}
        onValueChange={(v) => updateFilter("category", v ?? "")}
      >
        <SelectTrigger className="w-[160px] h-9" id="filter-category">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="h-9 text-muted-foreground hover:text-foreground"
          id="clear-filters-button"
        >
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  icon?: React.ReactNode;
}

export function FilterDropdown({ label, options, selectedId, onSelect, icon }: FilterDropdownProps) {
  const selectedOption = options.find(opt => opt.id === selectedId);
  const activeFilters = selectedId ? 1 : 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2 h-11 rounded-full border-stone-200 dark:border-stone-800 relative"
        >
          {icon || <Filter className="w-4 h-4" />}
          <span>{selectedOption?.label || label}</span>
          {activeFilters > 0 && (
            <Badge className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-orange-500 text-white text-xs">
              {activeFilters}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onSelect(null)}
          className="flex items-center justify-between cursor-pointer"
        >
          <span>All</span>
          {!selectedId && <Check className="w-4 h-4 text-orange-500" />}
        </DropdownMenuItem>
        {options.map((option) => (
          <DropdownMenuItem
            key={option.id}
            onClick={() => onSelect(option.id)}
            className="flex items-center justify-between cursor-pointer"
          >
            <span>{option.label}</span>
            <div className="flex items-center gap-2">
              {option.count !== undefined && (
                <span className="text-xs text-stone-500">{option.count}</span>
              )}
              {selectedId === option.id && <Check className="w-4 h-4 text-orange-500" />}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

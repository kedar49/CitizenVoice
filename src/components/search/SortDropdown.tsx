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
import { ArrowUpDown, TrendingUp, Clock, Flame, Check } from "lucide-react";

export type SortOption = 'priority' | 'recent' | 'votes' | 'trending';

interface SortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

const SORT_OPTIONS: { id: SortOption; label: string; icon: any }[] = [
  { id: 'priority', label: 'Priority Score', icon: ArrowUpDown },
  { id: 'recent', label: 'Most Recent', icon: Clock },
  { id: 'votes', label: 'Most Votes', icon: Flame },
  { id: 'trending', label: 'Trending', icon: TrendingUp },
];

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  const selected = SORT_OPTIONS.find(opt => opt.id === value);
  const Icon = selected?.icon || ArrowUpDown;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2 h-11 rounded-full border-stone-200 dark:border-stone-800"
        >
          <Icon className="w-4 h-4" />
          <span className="hidden sm:inline">Sort: {selected?.label}</span>
          <span className="sm:hidden">Sort</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Sort By</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {SORT_OPTIONS.map((option) => {
          const OptionIcon = option.icon;
          return (
            <DropdownMenuItem
              key={option.id}
              onClick={() => onChange(option.id)}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <OptionIcon className="w-4 h-4" />
                <span>{option.label}</span>
              </div>
              {value === option.id && <Check className="w-4 h-4 text-orange-500" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

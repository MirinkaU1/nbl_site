"use client";

import type { ReactNode } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface NblSelectOption {
  value: string;
  label: string;
}

interface NblSelectProps {
  label?: string;
  ariaLabel?: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  options: NblSelectOption[];
  icon?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
}

export function NblSelect({
  label,
  ariaLabel,
  value,
  onValueChange,
  placeholder,
  options,
  icon,
  required = false,
  disabled = false,
  className,
  triggerClassName,
  contentClassName,
}: NblSelectProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && (
        <label className="text-xs font-black tracking-widest uppercase text-nbl-white flex items-center gap-1.5">
          {icon}
          <span>
            {label}
            {required ? " *" : ""}
          </span>
        </label>
      )}

      <Select
        value={value || undefined}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger
          aria-label={ariaLabel ?? label ?? placeholder}
          className={cn(
            "h-12 w-full rounded-xl border-nbl-border bg-nbl-surface text-nbl-white focus-visible:border-nbl-orange/60 focus-visible:ring-nbl-orange/20",
            triggerClassName,
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>

        <SelectContent
          className={cn(
            "border-nbl-border bg-nbl-surface text-nbl-white",
            contentClassName,
          )}
          position="popper"
        >
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="text-nbl-white focus:bg-nbl-surface-raised focus:text-nbl-orange"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

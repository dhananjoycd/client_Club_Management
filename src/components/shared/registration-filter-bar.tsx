"use client";

import { RegistrationFilter, registrationFilterOptions } from "@/lib/registration-display";
import { FilterChip } from "@/components/shared/filter-chip";

type RegistrationFilterBarProps = {
  value: RegistrationFilter;
  onChange: (value: RegistrationFilter) => void;
};

export function RegistrationFilterBar({ value, onChange }: RegistrationFilterBarProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {registrationFilterOptions.map((option) => (
        <FilterChip
          key={option.value}
          label={option.label}
          active={value === option.value}
          onClick={() => onChange(option.value)}
        />
      ))}
    </div>
  );
}

import React from 'react';

interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string; icon?: React.ReactNode }[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
}

export const SegmentedControl = <T extends string>({
  options,
  value,
  onChange,
  disabled,
}: SegmentedControlProps<T>) => {
  return (
    <div className={`flex items-center bg-forge-panel/50 rounded-md p-1 space-x-1 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => !disabled && onChange(option.value)}
          disabled={disabled}
          className={`flex-1 flex items-center justify-center gap-2 text-xs font-semibold py-1 px-2 rounded transition-colors duration-200
            ${value === option.value
              ? 'bg-forge-border text-forge-text-primary shadow'
              : 'text-forge-text-secondary hover:bg-forge-panel/50'
            }`}
        >
          {option.icon}
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  );
};
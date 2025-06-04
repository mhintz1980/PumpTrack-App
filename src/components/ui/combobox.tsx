
"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

interface ComboboxProps {
  options: { label: string; value: string }[];
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  disabled?: boolean;
  multiple?: boolean;
  allowCustomValue?: boolean; // To add new values not in options list
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyText = "No option found.",
  className,
  disabled = false,
  multiple = false,
  allowCustomValue = false,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(""); 
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);


  const getButtonLabel = () => {
    if (multiple) {
      const selectedValues = Array.isArray(value) ? value : [];
      if (selectedValues.length === 0) return placeholder;
      if (selectedValues.length === 1) {
        const selectedOption = options.find((option) => option.value === selectedValues[0]);
        return selectedOption?.label || selectedValues[0];
      }
      return `${selectedValues.length} selected`;
    } else {
      const selectedOption = options.find((option) => option.value === value);
      return selectedOption?.label || (typeof value === 'string' && value ? value : placeholder);
    }
  };

  const handleSelect = (optionValue: string) => {
    if (multiple) {
      const currentSelected = Array.isArray(value) ? [...value] : [];
      const index = currentSelected.indexOf(optionValue);
      if (index > -1) {
        currentSelected.splice(index, 1);
      } else {
        currentSelected.push(optionValue);
      }
      onChange(currentSelected);
      setInputValue(""); 
      // For multi-select, keep focus on input to keep popover open
      inputRef.current?.focus();
    } else {
      onChange(optionValue === value ? "" : optionValue); 
      setInputValue("");
      setOpen(false); 
    }
  };

  const handleCustomValueAdd = () => {
    if (allowCustomValue && inputValue.trim() !== "" && !options.some(opt => opt.value.toLowerCase() === inputValue.trim().toLowerCase())) {
      const newValue = inputValue.trim();
      if (multiple) {
        const currentSelected = Array.isArray(value) ? [...value] : [];
        if (!currentSelected.includes(newValue)) {
          onChange([...currentSelected, newValue]);
        }
        inputRef.current?.focus(); // Keep focus
      } else {
        onChange(newValue);
        setOpen(false); // Close popover if single select
      }
      setInputValue(""); 
    }
  };
  
  const removeSelectedItem = (itemToRemove: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent any default action
    e.stopPropagation(); // Prevent popover from toggling
    if (multiple && Array.isArray(value)) {
      onChange(value.filter(v => v !== itemToRemove));
    }
    // Do not close popover, allow further interaction
  };

  const displayedValue = getButtonLabel();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild ref={triggerRef}>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between h-10", (!value || (Array.isArray(value) && value.length === 0)) && "text-muted-foreground", className)}
          disabled={disabled}
        >
          <span className="truncate">
            {multiple && Array.isArray(value) && value.length > 0 ? (
              <div className="flex flex-wrap gap-1 items-center">
                {value.slice(0, 2).map(val => { 
                  const option = options.find(opt => opt.value === val);
                  return (
                    <Badge
                      key={val}
                      variant="secondary"
                      className="px-1.5 py-0.5 text-xs"
                    >
                      {option?.label || val}
                      <X
                        className="ml-1 h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={(e) => removeSelectedItem(val, e)}
                        aria-label={`Remove ${option?.label || val}`}
                      />
                    </Badge>
                  );
                })}
                {value.length > 2 && (
                  <Badge variant="outline" className="px-1.5 py-0.5 text-xs">
                    +{value.length - 2} more
                  </Badge>
                )}
              </div>
            ) : displayedValue}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[--radix-popover-trigger-width] p-0" 
        align="start"
        style={{ width: triggerRef.current?.offsetWidth ? `${triggerRef.current.offsetWidth}px` : 'auto' }}
        onOpenAutoFocus={(e) => {
          // Prevent default focus on PopoverContent itself, direct to input
          e.preventDefault();
          inputRef.current?.focus();
        }}
      >
        <Command>
          <CommandInput
            ref={inputRef}
            placeholder={searchPlaceholder}
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList>
            <CommandEmpty>
              {allowCustomValue && inputValue.trim() !== "" && !options.some(opt => opt.label.toLowerCase().includes(inputValue.toLowerCase()))
                ? (
                  <CommandItem
                    key="__custom_add__"
                    value={`add-${inputValue.trim()}`} 
                    onSelect={handleCustomValueAdd}
                  >
                    Add "{inputValue.trim()}"
                  </CommandItem>
                )
                : emptyText}
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label} 
                  onSelect={() => handleSelect(option.value)} 
                  className="flex items-center justify-between"
                >
                  <span className="truncate">{option.label}</span>
                  {multiple && Array.isArray(value) && value.includes(option.value) && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                  {!multiple && value === option.value && (
                     <Check className="h-4 w-4 text-primary" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

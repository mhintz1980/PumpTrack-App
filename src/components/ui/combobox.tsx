
"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

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

interface ComboboxProps {
  options: { label: string; value: string }[];
  value?: string | string[]; // Can be single string or array of strings for multi-select
  onChange: (value: string | string[]) => void; // Passes back string or array
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  disabled?: boolean;
  multiple?: boolean; // New prop for multi-select
  allowCustomValue?: boolean; // Retain existing prop
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
  allowCustomValue = false, // Retain existing prop
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("") // For custom value input

  const getButtonLabel = () => {
    if (multiple) {
      const selectedValues = Array.isArray(value) ? value : [];
      if (selectedValues.length === 0) return placeholder;
      if (selectedValues.length === 1) {
        const selectedOption = options.find((option) => option.value === selectedValues[0]);
        return selectedOption?.label || selectedValues[0]; // Fallback to value if label not found (e.g. custom)
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
      // Do not close popover for multi-select
    } else {
      onChange(optionValue === value ? "" : optionValue);
      setOpen(false);
    }
    setInputValue(""); // Reset input after selection
  };
  
  const handleCustomValueBlur = () => {
    if (allowCustomValue && inputValue.trim() !== "" && !options.some(opt => opt.value === inputValue.trim())) {
      if (multiple) {
        const currentSelected = Array.isArray(value) ? [...value] : [];
        if (!currentSelected.includes(inputValue.trim())) {
          onChange([...currentSelected, inputValue.trim()]);
        }
      } else {
        onChange(inputValue.trim());
      }
       // setOpen(false); // Optionally close popover after custom input
    }
  };


  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", (!value || (Array.isArray(value) && value.length === 0)) && "text-muted-foreground", className)}
          disabled={disabled}
        >
          <span className="truncate">
            {getButtonLabel()}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput 
            placeholder={searchPlaceholder}
            value={inputValue}
            onValueChange={setInputValue}
            onBlur={allowCustomValue && !multiple ? handleCustomValueBlur : undefined} // Blur for custom value only if not multi & allowCustom
          />
          <CommandList>
            <CommandEmpty>
              {allowCustomValue && inputValue.trim() !== "" && !options.some(opt => opt.label.toLowerCase().includes(inputValue.toLowerCase()))
                ? `Add "${inputValue.trim()}"` 
                : emptyText}
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label} // Search by label
                  onSelect={() => handleSelect(option.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      multiple
                        ? (Array.isArray(value) && value.includes(option.value) ? "opacity-100" : "opacity-0")
                        : (value === option.value ? "opacity-100" : "opacity-0")
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
              {allowCustomValue && inputValue.trim() !== "" && !options.some(opt => opt.label.toLowerCase() === inputValue.toLowerCase().trim()) && (
                 <CommandItem
                    key={inputValue.trim()}
                    value={inputValue.trim()}
                    onSelect={() => {
                        handleSelect(inputValue.trim());
                        if (!multiple) setOpen(false);
                    }}
                 >
                    <Check className={cn("mr-2 h-4 w-4", "opacity-0")} /> {/* Custom items are not 'checked' in the list initially */}
                    Add "{inputValue.trim()}"
                 </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

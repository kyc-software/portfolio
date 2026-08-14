import { Select } from "@base-ui/react/select";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

type SelectFieldProps = {
  value: string;
  onValueChange: (value: string) => void;
  options: readonly string[];
  ariaLabel: string;
  className?: string;
  contentClassName?: string;
};

function SelectField({
  value,
  onValueChange,
  options,
  ariaLabel,
  className,
  contentClassName,
}: SelectFieldProps) {
  return (
    <Select.Root
      value={value}
      onValueChange={(nextValue) => nextValue && onValueChange(nextValue)}
      items={options.map((option) => ({ label: option, value: option }))}
    >
      <Select.Trigger
        aria-label={ariaLabel}
        className={cn(
          "inline-flex cursor-pointer items-center justify-between gap-2 outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
          className,
        )}
      >
        <Select.Value />
        <Select.Icon>
          <ChevronDown className="size-3.5 opacity-65" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner
          sideOffset={5}
          alignItemWithTrigger={false}
          className="z-[100] outline-none"
        >
          <Select.Popup
            className={cn(
              "min-w-[var(--anchor-width)] origin-[var(--transform-origin)] rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-xl outline-none data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
              contentClassName,
            )}
          >
            <Select.List>
              {options.map((option) => (
                <Select.Item
                  key={option}
                  value={option}
                  className="grid cursor-default grid-cols-[1rem_1fr] items-center gap-2 whitespace-nowrap rounded-md px-2 py-1.5 text-sm outline-none select-none data-[highlighted]:bg-muted"
                >
                  <span className="grid size-4 place-items-center">
                    <Select.ItemIndicator>
                      <Check className="size-3.5" />
                    </Select.ItemIndicator>
                  </span>
                  <Select.ItemText>{option}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}

export { SelectField };

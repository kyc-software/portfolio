import { Button as ButtonPrimitive } from "@base-ui/react/button";

import { cn } from "@/lib/utils";

const base =
  "group/button inline-flex shrink-0 cursor-pointer items-center justify-center rounded-4xl border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";
const variants = {
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
  ghost:
    "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
} as const;
const sizes = {
  sm: "h-8 gap-1 px-3 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
  lg: "h-10 gap-1.5 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
  icon: "size-9",
  "icon-sm": "size-8",
  "icon-lg": "size-10",
} as const;

function Button({
  className,
  variant = "secondary",
  size = "sm",
  ...props
}: ButtonPrimitive.Props & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}

export { Button };

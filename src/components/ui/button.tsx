import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// shadcn/ui-style button, adapted to the CLPR tokens.
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full border font-medium transition-[background-color,border-color,color,box-shadow] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-[0_0_0_1px_rgb(255_255_255/0.1),0_8px_30px_-8px_rgb(157_139_255/0.55)] hover:bg-fg/90",
        secondary:
          "border-fg/10 bg-fg/5 text-fg backdrop-blur-md hover:border-fg/20 hover:bg-fg/9",
        ghost: "border-transparent text-fg/80 hover:bg-fg/6 hover:text-fg",
        outline: "border-fg/20 bg-transparent text-fg hover:border-fg/40 hover:bg-fg/6",
      },
      size: {
        default: "h-10 px-5 text-[0.9375rem]",
        sm: "h-8 px-3.5 text-[0.8125rem]",
        lg: "h-12 px-6 text-[0.9375rem]",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };

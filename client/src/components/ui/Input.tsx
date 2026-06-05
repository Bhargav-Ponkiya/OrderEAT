import { forwardRef, type InputHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

type Props = InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean };

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { className, invalid, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={twMerge(
        "h-10 w-full rounded-md border bg-white px-3 text-sm text-neutral-900 placeholder:text-neutral-400",
        "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500",
        invalid ? "border-red-500" : "border-neutral-300",
        className,
      )}
      {...rest}
    />
  );
});

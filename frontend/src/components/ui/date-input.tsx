import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface DateInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <input
          type="date"
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            "pr-10 cursor-pointer relative z-0",
            "hover:border-primary/50 transition-colors",
            // Hide default calendar icon completely and make the entire input clickable
            "[&::-webkit-calendar-picker-indicator]:opacity-0",
            "[&::-webkit-calendar-picker-indicator]:absolute",
            "[&::-webkit-calendar-picker-indicator]:inset-0",
            "[&::-webkit-calendar-picker-indicator]:w-full",
            "[&::-webkit-calendar-picker-indicator]:h-full",
            "[&::-webkit-calendar-picker-indicator]:cursor-pointer",
            "[&::-webkit-calendar-picker-indicator]:z-10",
            "[&::-webkit-inner-spin-button]:hidden",
            "[&::-webkit-clear-button]:hidden",
            className
          )}
          ref={ref}
          {...props}
        />
        <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/70 pointer-events-none z-5" />
      </div>
    )
  }
)
DateInput.displayName = "DateInput"

export { DateInput }

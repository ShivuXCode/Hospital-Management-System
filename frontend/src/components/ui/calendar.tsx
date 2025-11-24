import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4 rounded-xl border border-border bg-card shadow-soft", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-6 sm:space-y-0",
        month: "space-y-4 w-full",
        caption: "flex justify-center pt-1 relative items-center mb-1",
        caption_label: "text-base font-semibold text-foreground",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          "h-8 w-8 bg-transparent p-0 rounded-lg border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-inherit disabled:hover:border-border"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1 mt-2",
        head_row: "flex w-full",
        head_cell: "text-muted-foreground rounded-md w-full font-medium text-xs uppercase tracking-wider py-2",
        row: "flex w-full mt-1",
        cell: cn(
          "relative p-0 text-center focus-within:relative focus-within:z-20",
          "w-full h-10 sm:h-11",
          "[&:has([aria-selected].day-range-end)]:rounded-r-lg",
          "[&:has([aria-selected].day-outside)]:bg-primary/10",
          "[&:has([aria-selected])]:bg-primary/5",
          "first:[&:has([aria-selected])]:rounded-l-lg",
          "last:[&:has([aria-selected])]:rounded-r-lg"
        ),
        day: cn(
          "h-10 w-full sm:h-11 p-0 font-normal rounded-lg transition-all duration-200",
          "hover:bg-primary/10 hover:text-primary hover:shadow-sm hover:scale-105",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          "aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected: cn(
          "bg-primary text-primary-foreground font-semibold shadow-md",
          "hover:bg-primary hover:text-primary-foreground hover:shadow-lg",
          "focus:bg-primary focus:text-primary-foreground"
        ),
        day_today: cn(
          "bg-accent text-accent-foreground font-semibold border-2 border-primary/30",
          "hover:border-primary"
        ),
        day_outside: cn(
          "day-outside text-muted-foreground/40 opacity-50",
          "hover:text-muted-foreground/60 hover:bg-muted/30",
          "aria-selected:bg-primary/5 aria-selected:text-muted-foreground/60"
        ),
        day_disabled: "text-muted-foreground/30 opacity-50 line-through cursor-not-allowed hover:bg-transparent hover:scale-100",
        day_range_middle: cn(
          "aria-selected:bg-primary/10 aria-selected:text-primary",
          "hover:bg-primary/20"
        ),
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };

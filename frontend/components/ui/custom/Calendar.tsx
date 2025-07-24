"use client"

import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import { DayButton, DayPicker, getDefaultClassNames } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <div className="w-screen h-screen p-4 box-border">
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={cn(
          "bg-background group/calendar w-full h-full p-3 [--cell-size:--spacing(8)] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
          className
        )}
        captionLayout={captionLayout}
        formatters={{
          formatMonthDropdown: (date) =>
            date.toLocaleString("default", { month: "short" }),
          ...formatters,
        }}
        classNames={{
          root: cn("w-full h-full", defaultClassNames.root),
          months: cn("flex-1 flex flex-col md:flex-row", defaultClassNames.months),
          month: cn("flex flex-col flex-1", defaultClassNames.month),
          nav: cn("flex items-center justify-between", defaultClassNames.nav),
          button_previous: cn(
            buttonVariants({ variant: buttonVariant }),
            "p-2 aria-disabled:opacity-50",
            defaultClassNames.button_previous
          ),
          button_next: cn(
            buttonVariants({ variant: buttonVariant }),
            "p-2 aria-disabled:opacity-50",
            defaultClassNames.button_next
          ),
          month_caption: cn("flex items-center justify-center", defaultClassNames.month_caption),
          dropdowns: cn("flex items-center text-sm font-medium gap-1.5", defaultClassNames.dropdowns),
          dropdown_root: cn("relative border border-input rounded-md", defaultClassNames.dropdown_root),
          dropdown: cn("absolute bg-popover inset-0 opacity-0", defaultClassNames.dropdown),
          caption_label: cn("select-none font-medium text-sm", defaultClassNames.caption_label),
          table: "w-full border-collapse h-full",
          weekdays: cn("flex", defaultClassNames.weekdays),
          weekday: cn("text-muted-foreground font-normal text-sm flex-1", defaultClassNames.weekday),
          week: cn("flex w-full", defaultClassNames.week),
          week_number_header: cn("select-none", defaultClassNames.week_number_header),
          week_number: cn("text-sm text-muted-foreground", defaultClassNames.week_number),
          day: cn(
            "flex-1 text-center select-none aspect-square",
            defaultClassNames.day
          ),
          range_start: cn("rounded-l-md bg-accent", defaultClassNames.range_start),
          range_middle: cn("rounded-none", defaultClassNames.range_middle),
          range_end: cn("rounded-r-md bg-accent", defaultClassNames.range_end),
          today: cn("bg-accent text-accent-foreground rounded-md", defaultClassNames.today),
          outside: cn("text-muted-foreground", defaultClassNames.outside),
          disabled: cn("text-muted-foreground opacity-50", defaultClassNames.disabled),
          hidden: cn("invisible", defaultClassNames.hidden),
          ...classNames,
        }}
        components={{
          Root: ({ className, rootRef, ...props }) => (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn("w-full h-full", className)}
              {...props}
            />
          ),
          Chevron: ({ className, orientation, ...props }) => {
            if (orientation === "left") {
              return <ChevronLeftIcon className={cn("size-4", className)} {...props} />
            }
            if (orientation === "right") {
              return <ChevronRightIcon className={cn("size-4", className)} {...props} />
            }
            return <ChevronDownIcon className={cn("size-4", className)} {...props} />
          },
          DayButton: CalendarDayButton,
          WeekNumber: ({ children, ...props }) => (
            <td {...props}>
              <div className="flex items-center justify-center">{children}</div>
            </td>
          ),
          ...components,
        }}
        {...props}
      />
    </div>
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "w-full aspect-square",
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
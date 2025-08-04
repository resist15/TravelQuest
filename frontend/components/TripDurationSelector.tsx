import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { useState, useEffect, useRef } from "react"

type Props = {
  onDurationChange: (days: number) => void
  initialDays?: number // optional for edit support
}

export default function TripDurationSelector({ onDurationChange, initialDays }: Props) {
  const initialized = useRef(false)

  const [value, setValue] = useState("1")
  const [unit, setUnit] = useState("days")

  // Initialize state only once from initialDays
  useEffect(() => {
    if (!initialized.current && initialDays !== undefined) {
      initialized.current = true

      if (initialDays % 30 === 0) {
        setValue(String(initialDays / 30))
        setUnit("months")
      } else if (initialDays % 7 === 0) {
        setValue(String(initialDays / 7))
        setUnit("weeks")
      } else {
        setValue(String(initialDays))
        setUnit("days")
      }
    }
  }, [initialDays])

  // Notify parent of current total days
  useEffect(() => {
    const num = parseInt(value) || 0
    let days = num

    if (unit === "weeks") days = num * 7
    else if (unit === "months") days = num * 30

    onDurationChange(days)
  }, [value, unit, onDurationChange])

  return (
    <div className="space-y-2">
      <Label>Trip Duration</Label>
      <div className="flex gap-2">
        <Input
          type="number"
          min={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-24"
        />
        <Select value={unit} onValueChange={setUnit}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Unit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="days">Days</SelectItem>
            <SelectItem value="weeks">Weeks</SelectItem>
            <SelectItem value="months">Months</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

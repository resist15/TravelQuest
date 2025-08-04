import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { useState, useEffect } from "react"

type Props = {
  onDurationChange: (days: number) => void
}

export default function TripDurationSelector({ onDurationChange }: Props) {
  const [value, setValue] = useState("1")
  const [unit, setUnit] = useState("days")

  useEffect(() => {
    const num = parseInt(value) || 0
    let days = num

    if (unit === "weeks") days = num * 7
    if (unit === "months") days = num * 30 // approx

    onDurationChange(days)
  }, [value, unit])

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

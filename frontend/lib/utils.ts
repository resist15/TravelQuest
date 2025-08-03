import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(days: number): string {
    if (days < 7) {
        return `${days} day${days > 1 ? "s" : ""}`
    } else if (days % 7 === 0 && days < 30) {
        const weeks = days / 7
        return `${weeks} week${weeks > 1 ? "s" : ""}`
    } else if (days % 30 === 0) {
        const months = days / 30
        return `${months} month${months > 1 ? "s" : ""}`
    } else {
        return `${days} days`
    }
}
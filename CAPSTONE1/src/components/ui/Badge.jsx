import { cn } from "../../lib/cn"

export default function Badge({ variant = "default", className, children }) {
  const variants = {
    default: "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200",
    gray: "bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-200",
    green: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-200",
    red: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
  }
  return (
    <span className={cn("inline-flex items-center rounded-md px-2 py-1 text-xs font-medium", variants[variant], className)}>
      {children}
    </span>
  )
}

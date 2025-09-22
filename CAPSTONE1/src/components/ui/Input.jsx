import { cn } from "../../lib/cn"
import { forwardRef } from "react"

const Input = forwardRef(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        "block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm",
        "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
        className,
      )}
      {...props}
    />
  )
})

export default Input

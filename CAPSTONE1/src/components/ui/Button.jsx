import { cn } from "../../lib/cn"

export default function Button({
  as: Tag = "button",
  variant = "primary",
  size = "md",
  className,
  ...props
}) {
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
    secondary: "bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50",
    ghost: "bg-transparent text-indigo-700 hover:bg-indigo-50",
    destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  }
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-5 py-2.5 text-base",
  }
  return (
    <Tag
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium shadow-sm focus:outline-none focus:ring-2",
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        className,
      )}
      {...props}
    />
  )
}

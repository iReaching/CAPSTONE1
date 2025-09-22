import { cn } from "../../lib/cn"

export default function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl p-6 shadow-sm ring-1 ring-black/5",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children }) {
  return <div className={cn("mb-4", className)}>{children}</div>
}

export function CardTitle({ className, children }) {
  return <h3 className={cn("text-lg font-semibold text-gray-900", className)}>{children}</h3>
}

export function CardDescription({ className, children }) {
  return <p className={cn("mt-1.5 text-sm text-gray-600", className)}>{children}</p>
}

export function CardContent({ className, children }) {
  return <div className={cn("", className)}>{children}</div>
}

export function CardFooter({ className, children }) {
  return <div className={cn("mt-4", className)}>{children}</div>
}

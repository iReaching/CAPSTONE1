import { cn } from "../../lib/cn"

export default function Page({ title, description, actions, children, className }) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}>
      <div className="flex items-start justify-between">
        <div>
          {title && <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h1>}
          {description && <p className="mt-2 text-gray-600 max-w-2xl">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div className="mt-6">
        {children}
      </div>
    </div>
  )
}

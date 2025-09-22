import { cn } from "../../lib/cn"

export default function Table({ className, children }) {
  return (
    <div className={cn("overflow-x-auto bg-white rounded-xl ring-1 ring-black/5 shadow-sm", className)}>
      <table className="min-w-full divide-y divide-gray-200">
        {children}
      </table>
    </div>
  )
}

export function THead({ children }) {
  return <thead className="bg-gray-50">{children}</thead>
}

export function TR({ className, children }) {
  return <tr className={cn("", className)}>{children}</tr>
}

export function TH({ className, children }) {
  return (
    <th scope="col" className={cn("px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider", className)}>
      {children}
    </th>
  )
}

export function TBody({ children }) {
  return <tbody className="bg-white divide-y divide-gray-100">{children}</tbody>
}

export function TD({ className, children }) {
  return <td className={cn("px-4 py-3 text-sm text-gray-700", className)}>{children}</td>
}

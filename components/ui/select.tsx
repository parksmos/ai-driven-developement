import * as React from "react"
import { ChevronDown } from "lucide-react"

export interface ISelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: ISelectOption[];
  label?: string;
  error?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, label, error, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && <label className="text-sm font-medium leading-none">{label}</label>}
        <div className="relative">
          <select
            className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none pr-10 ${className}`}
            ref={ref}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-2.5 h-5 w-5 opacity-50" />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    )
  }
)
Select.displayName = "Select"

export { Select } 
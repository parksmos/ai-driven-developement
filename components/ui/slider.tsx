import * as React from "react"

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  showValue?: boolean;
  valuePrefix?: string;
  valueSuffix?: string;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ 
    className, 
    label, 
    min = 0, 
    max = 100, 
    step = 1, 
    showValue = false, 
    valuePrefix = "", 
    valueSuffix = "",
    value,
    ...props 
  }, ref) => {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          {label && (
            <label className="text-sm font-medium leading-none">
              {label}
            </label>
          )}
          {showValue && value !== undefined && (
            <span className="text-sm text-gray-500">
              {valuePrefix}{value}{valueSuffix}
            </span>
          )}
        </div>
        <input
          type="range"
          className={`w-full h-2 appearance-none bg-gray-200 rounded-lg cursor-pointer accent-blue-500 ${className}`}
          min={min}
          max={max}
          step={step}
          ref={ref}
          value={value}
          {...props}
        />
      </div>
    )
  }
)
Slider.displayName = "Slider"

export { Slider } 
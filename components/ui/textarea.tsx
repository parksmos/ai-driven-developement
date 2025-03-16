import * as React from "react"

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showCharCount?: boolean;
  maxLength?: number;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, showCharCount, maxLength, value, ...props }, ref) => {
    const valueLength = typeof value === 'string' ? value.length : 0;
    
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="text-sm font-medium leading-none">
            {label}
          </label>
        )}
        <textarea
          className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${error ? 'border-red-500 focus-visible:ring-red-500' : ''} ${className}`}
          ref={ref}
          value={value}
          maxLength={maxLength}
          {...props}
        />
        <div className="flex items-center justify-between">
          {(error || helperText) && (
            <p className={`text-sm ${error ? 'text-red-500' : 'text-gray-500'}`}>
              {error || helperText}
            </p>
          )}
          {showCharCount && maxLength && (
            <p className="text-sm text-gray-500 ml-auto">
              {valueLength}/{maxLength}
            </p>
          )}
        </div>
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea } 
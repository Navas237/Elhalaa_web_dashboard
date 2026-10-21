'use client'

import * as React from 'react'
import { Label } from './label'
import { Input } from './input'
import { cn } from '@/lib/utils'
import { Eye, EyeOff } from 'lucide-react'

interface FormInputProps extends React.ComponentProps<typeof Input> {
  label: string
  error?: string
  description?: string
  containerClassName?: string
  icon?: React.ReactNode
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, description, containerClassName, icon, type, id, className, dir = 'rtl', ...props }, ref) => {
    const generatedId = React.useId()
    const inputId = id || generatedId
    
    const [showPassword, setShowPassword] = React.useState(false)
    const isPassword = type === 'password'
    const currentType = isPassword ? (showPassword ? 'text' : 'password') : type

    // Determine padding based on icons and direction
    // If RTL, left side is pl, right side is pr
    // If LTR, left side is pl, right side is pr
    const hasIcon = !!icon
    const hasPasswordToggle = isPassword

    return (
      <div className={cn('space-y-2', containerClassName)}>
        <Label htmlFor={inputId} className={cn("text-sm font-semibold", error && "text-destructive")}>
          {label}
        </Label>
        
        <div className="relative group" dir={dir}>
          {/* Start Icon (Left side) */}
          {hasIcon && (
            <div className={cn(
              "absolute inset-y-0 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors",
              dir === 'ltr' ? "left-0 pl-3.5" : "right-0 pr-3.5"
            )}>
              {icon}
            </div>
          )}

          <Input
            id={inputId}
            ref={ref}
            type={currentType}
            aria-invalid={!!error}
            dir={dir}
            className={cn(
              "h-12 rounded-xl bg-muted/50 border-transparent transition-all",
              "focus-visible:bg-background focus-visible:border-primary/50",
              error && "border-destructive/50 bg-destructive/5 focus-visible:border-destructive focus-visible:ring-destructive/20",
              // Adjust padding based on icons
              dir === 'ltr' ? [
                hasIcon ? "pl-11" : "pl-4",
                hasPasswordToggle ? "pr-12" : "pr-4"
              ] : [
                hasIcon ? "pr-11" : "pr-4",
                hasPasswordToggle ? "pl-12" : "pl-4"
              ],
              isPassword && "font-medium tracking-wide",
              className
            )}
            {...props}
          />

          {/* End Icon (Password Toggle) */}
          {hasPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={cn(
                "absolute inset-y-0 flex items-center text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl",
                dir === 'ltr' ? "right-0 pr-3.5 pl-2" : "left-0 pl-3.5 pr-2"
              )}
              aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          )}
        </div>

        {description && !error && (
          <p className="text-[13px] text-muted-foreground">{description}</p>
        )}
        {error && (
          <p className="text-[13px] text-destructive font-medium animate-in slide-in-from-top-1 fade-in-0 duration-200">
            {error}
          </p>
        )}
      </div>
    )
  }
)
FormInput.displayName = 'FormInput'

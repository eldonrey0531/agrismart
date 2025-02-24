import * as React from "react"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/ui/icons"

interface TooltipContentBaseProps {
  className?: string
  children?: React.ReactNode
}

// Menu-style tooltip content
interface MenuTooltipProps extends TooltipContentBaseProps {
  items: {
    label: string
    icon?: keyof typeof Icons
    onClick: () => void
    disabled?: boolean
  }[]
}

export function MenuTooltipContent({ items, className }: MenuTooltipProps) {
  return (
    <div className={cn("min-w-[12rem] py-1.5", className)}>
      {items.map((item, index) => {
        const Icon = item.icon ? Icons[item.icon] : null
        return (
          <button
            key={index}
            onClick={item.onClick}
            disabled={item.disabled}
            className={cn(
              "w-full flex items-center px-3 py-1.5",
              "text-sm text-left",
              "hover:bg-accent hover:text-accent-foreground",
              "focus:bg-accent focus:text-accent-foreground focus:outline-none",
              "disabled:opacity-50 disabled:pointer-events-none"
            )}
          >
            {Icon && <Icon className="mr-2 h-4 w-4" />}
            {item.label}
          </button>
        )
      })}
    </div>
  )
}

// Info tooltip with icon
interface InfoTooltipProps extends TooltipContentBaseProps {
  title?: string
  description: string
  variant?: "info" | "warning" | "error"
}

export function InfoTooltipContent({ 
  title, 
  description, 
  variant = "info",
  className 
}: InfoTooltipProps) {
  const iconMap = {
    info: Icons.info,
    warning: Icons.alert,
    error: Icons.error
  }

  const Icon = iconMap[variant]

  const variantStyles = {
    info: "text-blue-500",
    warning: "text-yellow-500",
    error: "text-red-500"
  }[variant]

  return (
    <div className={cn("max-w-xs p-3 space-y-1.5", className)}>
      <div className="flex items-start gap-2">
        <Icon className={cn("h-4 w-4 mt-0.5", variantStyles)} />
        <div>
          {title && (
            <h4 className="font-medium text-sm">{title}</h4>
          )}
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    </div>
  )
}

// Loading state tooltip
interface LoadingTooltipProps extends TooltipContentBaseProps {
  text?: string
}

export function LoadingTooltipContent({ 
  text = "Loading...", 
  className 
}: LoadingTooltipProps) {
  return (
    <div className={cn("px-3 py-2 flex items-center gap-2", className)}>
      <Icons.spinner className="h-4 w-4 animate-spin" />
      <span className="text-sm">{text}</span>
    </div>
  )
}

// Preview tooltip with image
interface PreviewTooltipProps extends TooltipContentBaseProps {
  title: string
  imageSrc: string
  description?: string
}

export function PreviewTooltipContent({
  title,
  imageSrc,
  description,
  className
}: PreviewTooltipProps) {
  return (
    <div className={cn("max-w-xs overflow-hidden rounded-md", className)}>
      <div className="relative aspect-video">
        <img
          src={imageSrc}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-3 space-y-1 bg-popover">
        <h4 className="font-medium text-sm">{title}</h4>
        {description && (
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}

// Stats tooltip
interface StatsTooltipProps extends TooltipContentBaseProps {
  stats: {
    label: string
    value: string | number
    change?: number
    icon?: keyof typeof Icons
  }[]
}

export function StatsTooltipContent({ stats, className }: StatsTooltipProps) {
  return (
    <div className={cn("min-w-[12rem] p-3", className)}>
      <div className="space-y-2">
        {stats.map((stat, index) => {
          const Icon = stat.icon ? Icons[stat.icon] : null
          return (
            <div key={index} className="flex justify-between items-baseline">
              <div className="flex items-center gap-2">
                {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                <span className="text-xs text-muted-foreground">
                  {stat.label}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-medium text-sm">
                  {stat.value}
                </span>
                {stat.change !== undefined && (
                  <span className={cn(
                    "text-xs",
                    stat.change > 0 ? "text-green-500" : "text-red-500"
                  )}>
                    {stat.change > 0 ? '↑' : '↓'} {Math.abs(stat.change)}%
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
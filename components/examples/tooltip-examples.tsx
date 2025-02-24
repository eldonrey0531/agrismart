"use client"

import * as React from "react"
import { Icons } from "@/components/ui/icons"
import { InteractiveTooltip } from "@/components/ui/interactive-tooltip"
import { Tooltip } from "@/components/ui/tooltip"
import { 
  MenuTooltipContent, 
  InfoTooltipContent,
  LoadingTooltipContent,
  PreviewTooltipContent,
  StatsTooltipContent 
} from "@/components/ui/tooltip-content"
import { Button } from "@/components/ui/button"

export function TooltipExamples() {
  const [isLoading, setIsLoading] = React.useState(false)

  const handleLoad = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 2000)
  }

  return (
    <div className="p-8 space-y-8">
      {/* Basic Tooltips */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Basic Tooltips</h2>
        <div className="flex gap-4">
          <Tooltip content="Edit this item">
            <Button variant="outline" size="icon">
              <Icons.fileText className="h-4 w-4" />
            </Button>
          </Tooltip>

          <Tooltip 
            content="Delete permanently" 
            variant="error"
          >
            <Button variant="outline" size="icon">
              <Icons.trash className="h-4 w-4" />
            </Button>
          </Tooltip>
        </div>
      </section>

      {/* Interactive Menu Tooltip */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Menu Tooltip</h2>
        <InteractiveTooltip
          content={
            <MenuTooltipContent
              items={[
                { label: "Edit", icon: "fileText", onClick: () => {} },
                { label: "Duplicate", icon: "plus", onClick: () => {} },
                { label: "Delete", icon: "trash", onClick: () => {}, disabled: true },
              ]}
            />
          }
          sticky
          side="right"
          align="start"
          closeable
        >
          <Button variant="outline">Actions Menu</Button>
        </InteractiveTooltip>
      </section>

      {/* Info Tooltips */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Info Tooltips</h2>
        <div className="flex gap-4">
          <InteractiveTooltip
            content={
              <InfoTooltipContent
                title="Pro Feature"
                description="This feature is only available to pro users. Upgrade your account to access it."
                variant="info"
              />
            }
            side="top"
            align="center"
          >
            <Button variant="outline">Pro Features</Button>
          </InteractiveTooltip>

          <InteractiveTooltip
            content={
              <InfoTooltipContent
                title="Attention Required"
                description="Your account needs verification before proceeding."
                variant="warning"
              />
            }
            side="right"
            align="start"
          >
            <Button variant="outline">Warning Info</Button>
          </InteractiveTooltip>
        </div>
      </section>

      {/* Loading Tooltip */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Loading Tooltip</h2>
        <InteractiveTooltip
          content={
            <LoadingTooltipContent text="Processing your request..." />
          }
          open={isLoading}
          side="right"
          align="center"
        >
          <Button 
            variant="outline" 
            onClick={handleLoad}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Show Loading'}
          </Button>
        </InteractiveTooltip>
      </section>

      {/* Preview Tooltip */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Preview Tooltip</h2>
        <InteractiveTooltip
          content={
            <PreviewTooltipContent
              title="Mountain Landscape"
              imageSrc="https://images.unsplash.com/photo-1519681393784-d120267933ba"
              description="A beautiful mountain landscape at sunset"
            />
          }
          side="right"
          align="start"
          sticky
          closeable
        >
          <Button variant="outline">Show Preview</Button>
        </InteractiveTooltip>
      </section>

      {/* Stats Tooltip */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Stats Tooltip</h2>
        <InteractiveTooltip
          content={
            <StatsTooltipContent
              stats={[
                { label: "Revenue", value: "$12,345", change: 12, icon: "credit" },
                { label: "Users", value: "1,234", change: -5, icon: "user" },
                { label: "Orders", value: "345", change: 8, icon: "fileText" },
              ]}
            />
          }
          side="right"
          align="start"
          sticky
        >
          <Button variant="outline">View Stats</Button>
        </InteractiveTooltip>
      </section>
    </div>
  )
}
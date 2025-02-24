"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { 
  History, 
  Sprout, 
  Bug, 
  Zap, 
  Shield, 
  Leaf,
  TreePine 
} from "lucide-react";
import { cn } from "@/lib/utils";

type UpdateType = "major" | "minor" | "patch";
type ChangeType = "feature" | "improvement" | "fix" | "security";

interface UpdateChange {
  type: ChangeType;
  text: string;
}

interface Update {
  version: string;
  date: string;
  type: UpdateType;
  title: string;
  description: string;
  changes: UpdateChange[];
}

// Example update history data
const updates: Update[] = [
  {
    version: "1.2.0",
    date: "2025-02-15",
    type: "major",
    title: "Spring Growth Update",
    description: "Major features and improvements blooming",
    changes: [
      { type: "feature", text: "Added offline support for all dashboard features" },
      { type: "improvement", text: "Enhanced data synchronization efficiency" },
      { type: "security", text: "Strengthened data encryption protocols" },
      { type: "fix", text: "Resolved cache management issues" },
    ],
  },
  {
    version: "1.1.2",
    date: "2025-02-01",
    type: "patch",
    title: "Winter Maintenance",
    description: "Bug fixes and minor improvements",
    changes: [
      { type: "fix", text: "Fixed notification display on mobile devices" },
      { type: "improvement", text: "Optimized app loading performance" },
    ],
  },
  {
    version: "1.1.0",
    date: "2025-01-15",
    type: "minor",
    title: "New Year Growth",
    description: "New features sprouting",
    changes: [
      { type: "feature", text: "Introduced push notifications" },
      { type: "improvement", text: "Better offline data management" },
      { type: "security", text: "Updated security protocols" },
    ],
  },
];

interface UpdateHistoryProps {
  className?: string;
}

export function UpdateHistory({ className }: UpdateHistoryProps) {
  const [expandedVersion, setExpandedVersion] = useState<string | null>(null);

  const getChangeIcon = (type: ChangeType) => {
    switch (type) {
      case "feature":
        return <Sprout className="h-4 w-4 text-success" />;
      case "improvement":
        return <Leaf className="h-4 w-4 text-accent" />;
      case "fix":
        return <Bug className="h-4 w-4 text-destructive" />;
      case "security":
        return <Shield className="h-4 w-4 text-interactive" />;
      default:
        return <Zap className="h-4 w-4 text-warning" />;
    }
  };

  const getUpdateBadge = (type: UpdateType) => {
    switch (type) {
      case "major":
        return (
          <Badge variant="default" className="ml-2 bg-success hover:bg-success/80">
            Major Update
          </Badge>
        );
      case "minor":
        return (
          <Badge variant="default" className="ml-2 bg-accent hover:bg-accent/80">
            Feature Update
          </Badge>
        );
      case "patch":
        return (
          <Badge variant="secondary" className="ml-2">
            Patch
          </Badge>
        );
    }
  };

  return (
    <Card className={cn("border-border", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Update History
        </CardTitle>
        <CardDescription>
          Track the growth and improvements of AgriSmart
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Version Timeline */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />

          <Accordion
            type="single"
            value={expandedVersion ?? undefined}
            onValueChange={setExpandedVersion}
            className="space-y-4"
          >
            {updates.map((update) => (
              <AccordionItem
                key={update.version}
                value={update.version}
                className="border-none"
              >
                <AccordionTrigger className="hover:no-underline [&[data-state=open]>div]:bg-accent/10">
                  <div className="flex items-start gap-4 rounded-lg p-2 transition-colors hover:bg-accent/5">
                    {/* Version Icon */}
                    <div className="relative z-10">
                      <div className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-full border-2 border-border bg-background transition-colors",
                        "hover:border-accent group-hover:border-accent",
                        expandedVersion === update.version && "border-accent"
                      )}>
                        <TreePine className="h-6 w-6 text-accent" />
                      </div>
                    </div>

                    {/* Update Info */}
                    <div className="flex-1 pt-1">
                      <div className="flex items-center">
                        <h4 className="text-sm font-medium">
                          v{update.version}
                        </h4>
                        {getUpdateBadge(update.type)}
                      </div>
                      <p className="text-sm text-muted-text mt-1">
                        {update.title}
                      </p>
                      <time className="text-xs text-muted-text">
                        {new Date(update.date).toLocaleDateString()}
                      </time>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent>
                  <div className="ml-16 space-y-4">
                    <p className="text-sm text-muted-text">
                      {update.description}
                    </p>

                    {/* Changes List */}
                    <div className="space-y-2">
                      {update.changes.map((change, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-2 text-sm rounded-md p-2 hover:bg-accent/5 transition-colors"
                        >
                          {getChangeIcon(change.type)}
                          <span>{change.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </CardContent>
    </Card>
  );
}

export default UpdateHistory;
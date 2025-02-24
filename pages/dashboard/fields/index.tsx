'use client';

import { Icons } from '@/components/ui/icons';

export default function FieldsPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Fields Management</h2>
      </div>
      
      <div className="rounded-lg border bg-card p-8 text-card-foreground">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Icons.sprout className="h-12 w-12 text-muted-foreground" />
          <div className="text-center">
            <h3 className="text-lg font-semibold">No Fields Added Yet</h3>
            <p className="text-sm text-muted-foreground">
              Start by adding your first agricultural field
            </p>
          </div>
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
            <Icons.add className="mr-2 h-4 w-4" />
            Add Field
          </button>
        </div>
      </div>
    </div>
  );
}
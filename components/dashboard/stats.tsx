"use client";

import { Card } from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const data = [
  { name: 'Jan 1', connections: 4, messages: 3, listings: 2 },
  { name: 'Jan 2', connections: 3, messages: 4, listings: 3 },
  { name: 'Jan 3', connections: 5, messages: 2, listings: 4 },
  { name: 'Jan 4', connections: 6, messages: 5, listings: 3 },
  { name: 'Jan 5', connections: 4, messages: 6, listings: 2 },
  { name: 'Jan 6', connections: 7, messages: 4, listings: 5 },
  { name: 'Jan 7', connections: 8, messages: 3, listings: 6 },
];

export function DashboardStats() {
  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 10,
            left: 10,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="name"
            className="text-sm text-muted-foreground"
          />
          <YAxis 
            className="text-sm text-muted-foreground"
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid grid-cols-2 gap-2">
                      {payload.map((p) => (
                        <div key={p.dataKey} className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            {p.dataKey}
                          </span>
                          <span className="font-bold text-muted-foreground">
                            {p.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Line
            type="monotone"
            dataKey="connections"
            strokeWidth={2}
            activeDot={{
              r: 6,
              style: { fill: "var(--primary)", opacity: 0.8 },
            }}
            className="stroke-primary"
          />
          <Line
            type="monotone"
            dataKey="messages"
            strokeWidth={2}
            activeDot={{
              r: 6,
              style: { fill: "var(--secondary)", opacity: 0.8 },
            }}
            className="stroke-blue-500"
          />
          <Line
            type="monotone"
            dataKey="listings"
            strokeWidth={2}
            activeDot={{
              r: 6,
              style: { fill: "var(--accent)", opacity: 0.8 },
            }}
            className="stroke-green-500"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
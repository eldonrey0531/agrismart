'use client';

import { Icons } from '@/components/ui/icons';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ButtonWrapper } from '@/components/ui/button-wrapper';

const mockEvents = [
  {
    title: 'Planting Season Start',
    date: '2025-03-01',
    type: 'planting',
  },
  {
    title: 'Fertilizer Application',
    date: '2025-03-15',
    type: 'maintenance',
  },
  {
    title: 'Pest Control',
    date: '2025-03-30',
    type: 'maintenance',
  },
];

export default function CalendarPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Agricultural Calendar</h2>
        <ButtonWrapper variant="default">
          <Icons.add className="mr-2 h-4 w-4" />
          Add Event
        </ButtonWrapper>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>
              Your scheduled agricultural activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockEvents.map((event) => (
                <div
                  key={event.title}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(event.date).toLocaleDateString()}
                    </p>
                  </div>
                  <ButtonWrapper variant="outline" size="sm">
                    <Icons.edit className="mr-2 h-4 w-4" />
                    Edit
                  </ButtonWrapper>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Calendar Overview</CardTitle>
            <CardDescription>
              Monthly view of your activities
            </CardDescription>
          </CardHeader>
          <CardContent className="min-h-[300px] flex items-center justify-center">
            <div className="text-center">
              <Icons.calendar className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                Calendar integration coming soon
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seasonal Planning</CardTitle>
          <CardDescription>
            Plan your agricultural activities based on seasons
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8">
            <Icons.sprout className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              Seasonal planning features will be available soon
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
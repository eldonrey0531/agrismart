import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsiveLine } from '@nivo/line';
import { format } from 'date-fns';

interface TopItem {
  count: number;
  percentage?: number;
}

interface LocationItem extends TopItem {
  location: string;
}

interface DeviceItem extends TopItem {
  device: string;
}

interface TrendItem {
  date: string;
  successful: number;
  failed: number;
}

export function LocationAnalysis({ locations }: { locations: LocationItem[] }) {
  const total = locations.reduce((sum, item) => sum + item.count, 0);
  // Calculate percentages
  const locationsWithPercentage = locations.map(item => ({
    ...item,
    percentage: (item.count / total) * 100
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Login Locations</CardTitle>
        <CardDescription>Where users are logging in from</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {locationsWithPercentage.map(item => (
              <div key={item.location} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{item.location}</span>
                  <span className="font-medium">{item.count} logins</span>
                </div>
                <Progress value={item.percentage} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {item.percentage?.toFixed(1)}% of total logins
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export function DeviceAnalysis({ devices }: { devices: DeviceItem[] }) {
  const total = devices.reduce((sum, item) => sum + item.count, 0);
  const data = devices.map(item => ({
    device: item.device,
    logins: item.count,
    percentage: ((item.count / total) * 100).toFixed(1)
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Device Usage</CardTitle>
        <CardDescription>Types of devices used for login</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveBar
            data={data}
            keys={['logins']}
            indexBy="device"
            margin={{ top: 20, right: 20, bottom: 40, left: 40 }}
            padding={0.3}
            valueScale={{ type: 'linear' }}
            indexScale={{ type: 'band', round: true }}
            colors={{ scheme: 'nivo' }}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: -45,
            }}
            labelSkipWidth={12}
            labelSkipHeight={12}
            labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
            role="application"
            ariaLabel="Device usage chart"
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function LoginTrends({ trends }: { trends: TrendItem[] }) {
  const data = [
    {
      id: 'successful',
      data: trends.map(item => ({
        x: format(new Date(item.date), 'MMM dd'),
        y: item.successful
      }))
    },
    {
      id: 'failed',
      data: trends.map(item => ({
        x: format(new Date(item.date), 'MMM dd'),
        y: item.failed
      }))
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Login Trends</CardTitle>
        <CardDescription>Daily successful vs failed login attempts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveLine
            data={data}
            margin={{ top: 20, right: 20, bottom: 40, left: 40 }}
            xScale={{ type: 'point' }}
            yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
            curve="monotoneX"
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: -45,
            }}
            pointSize={6}
            pointColor={{ theme: 'background' }}
            pointBorderWidth={2}
            pointBorderColor={{ from: 'serieColor' }}
            enablePointLabel={false}
            enableArea={true}
            areaOpacity={0.1}
            useMesh={true}
            legends={[
              {
                anchor: 'top-right',
                direction: 'row',
                justify: false,
                translateX: 0,
                translateY: -20,
                itemsSpacing: 0,
                itemDirection: 'left-to-right',
                itemWidth: 80,
                itemHeight: 20,
                symbolSize: 12,
                symbolShape: 'circle'
              }
            ]}
          />
        </div>
      </CardContent>
    </Card>
  );
}
"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface OverviewProps {
  data: Array<{
    month: Date;
    total: number;
    completed: number;
    active: number;
  }>;
}

const chartConfig = {
  total: {
    label: "Totalt",
    color: "hsl(var(--primary))",
  },
  completed: {
    label: "Fullført",
    color: "hsl(var(--success))",
  },
  active: {
    label: "Aktive",
    color: "hsl(var(--warning))",
  },
} satisfies ChartConfig;

export function Overview({ data }: OverviewProps) {
  if (!data?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ordre statistikk</CardTitle>
          <CardDescription>Ingen data tilgjengelig</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[350px] items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Ingen ordre å vise for øyeblikket
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((item) => ({
    month: format(new Date(item.month), "MMMM", { locale: nb }),
    total: item.total,
    completed: item.completed,
    active: item.active,
  }));

  // Calculate trend
  const currentMonth = chartData[chartData.length - 1]?.total || 0;
  const previousMonth = chartData[chartData.length - 2]?.total || 0;
  const trend =
    previousMonth === 0
      ? 0
      : ((currentMonth - previousMonth) / previousMonth) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ordre statistikk</CardTitle>
        <CardDescription>
          {format(new Date(data[0].month), "MMMM yyyy", { locale: nb })} -{" "}
          {format(new Date(data[data.length - 1].month), "MMMM yyyy", {
            locale: nb,
          })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                bottom: 0,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar
                dataKey="total"
                fill="var(--primary)"
                radius={[4, 4, 0, 0]}
                className="fill-primary"
              >
                <LabelList
                  position="top"
                  offset={12}
                  className="fill-foreground"
                  fontSize={12}
                />
              </Bar>
              <Bar
                dataKey="completed"
                fill="var(--success)"
                radius={[4, 4, 0, 0]}
                className="fill-green-500"
              />
              <Bar
                dataKey="active"
                fill="var(--warning)"
                radius={[4, 4, 0, 0]}
                className="fill-orange-500"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          {trend > 0 ? (
            <>
              Økning på {trend.toFixed(1)}% denne måneden{" "}
              <TrendingUp className="h-4 w-4 text-green-500" />
            </>
          ) : trend < 0 ? (
            <>
              Nedgang på {Math.abs(trend).toFixed(1)}% denne måneden{" "}
              <TrendingDown className="h-4 w-4 text-red-500" />
            </>
          ) : (
            "Ingen endring denne måneden"
          )}
        </div>
        <div className="leading-none text-muted-foreground">
          Viser totalt antall ordre for de siste 12 månedene
        </div>
      </CardFooter>
    </Card>
  );
}

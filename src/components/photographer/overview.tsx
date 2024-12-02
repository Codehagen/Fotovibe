"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

const data = [
  {
    name: "Jan",
    total: Math.floor(Math.random() * 5000),
  },
  {
    name: "Feb",
    total: Math.floor(Math.random() * 5000),
  },
  {
    name: "Mar",
    total: Math.floor(Math.random() * 5000),
  },
  {
    name: "Apr",
    total: Math.floor(Math.random() * 5000),
  },
  {
    name: "Mai",
    total: Math.floor(Math.random() * 5000),
  },
  {
    name: "Jun",
    total: Math.floor(Math.random() * 5000),
  },
];

export function PhotographerOverview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Bar
          dataKey="total"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface BrandData {
  name: string;
  score: number;
  metrics?: {
    webMentions: number;
  };
}

interface BrandChartProps {
  data: BrandData[];
}

export const BrandChart = ({ data }: BrandChartProps) => {
  const chartColors = [
    'oklch(0.623 0.214 259.815)', // primary blue
    'oklch(0.746 0.16 232.661)',  // accent teal
    'oklch(0.696 0.17 162.48)',   // chart-3 green
    'oklch(0.795 0.184 86.047)',  // chart-4 yellow
    'oklch(0.705 0.213 47.604)',  // chart-5 orange
  ];

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ payload: BrandData }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-4 max-w-xs">
          <h3 className="font-semibold text-card-foreground mb-2">{label}</h3>
          <div className="space-y-1 text-sm">
            <p className="text-muted-foreground">
              Performance Score: <span className="font-medium text-card-foreground">{data.score}</span>
            </p>
            {data.metrics && (
              <p className="text-muted-foreground">
                Web Mentions: <span className="font-medium text-card-foreground">{data.metrics.webMentions.toLocaleString()}</span>
              </p>
            )}
            <p className="text-muted-foreground text-xs mt-2">
              * Scores based on mention frequency and prominence in web analysis
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
          <XAxis
            dataKey="name"
            stroke="var(--color-muted-foreground)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="var(--color-muted-foreground)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            label={{
              value: 'Visibility Score (1-100)',
              angle: -90,
              position: 'insideLeft',
              style: { textAnchor: 'middle', fill: 'var(--color-muted-foreground)' }
            }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }} />
          <Bar dataKey="score" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

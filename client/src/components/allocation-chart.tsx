import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface AllocationData {
  category: string;
  value: number;
  percentage: number;
}

interface AllocationChartProps {
  data: AllocationData[];
}

const COLORS = [
  'hsl(var(--primary))',      // Blue
  'hsl(var(--success))',      // Green  
  'hsl(var(--warning))',      // Yellow
  'hsl(var(--danger))',       // Red
  '#8B5CF6',                  // Purple
  '#06B6D4',                  // Cyan
];

export default function AllocationChart({ data }: AllocationChartProps) {
  const formatTooltip = (value: number, name: string) => {
    return [`₹${value.toLocaleString()}`, name];
  };

  const renderCustomizedLabel = (entry: any) => {
    return `${entry.percentage.toFixed(1)}%`;
  };

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={formatTooltip}
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value) => <span className="text-sm text-gray-600">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

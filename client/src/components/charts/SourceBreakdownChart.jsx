import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const PALETTE = ['#6E56CF', '#3B82F6', '#F5A623', '#10B981', '#EF4444', '#8A8D98', '#7C63DE', '#E879F9'];

export default function SourceBreakdownChart({ data }) {
  const chartData = Object.entries(data || {}).map(([source, count]) => ({ name: source, value: count }));
  if (!chartData.length) return <p className="text-sm text-ink-muted py-10 text-center">No source data yet.</p>;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
          {chartData.map((entry, i) => (
            <Cell key={entry.name} fill={PALETTE[i % PALETTE.length]} stroke="#0A0B0F" strokeWidth={2} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ background: '#13151A', border: '1px solid #22242C', borderRadius: 10, fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 11, color: '#8A8D98' }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

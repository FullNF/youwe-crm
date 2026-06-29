import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

const COLORS = {
  New: '#3B82F6',
  Contacted: '#3B82F6',
  'Follow-up': '#F5A623',
  'Ready to Visit': '#F5A623',
  'Visit Done': '#6E56CF',
  Negotiation: '#6E56CF',
  Won: '#10B981',
  Lost: '#EF4444',
  Hold: '#8A8D98',
};

export default function StageBreakdownChart({ data }) {
  const chartData = Object.entries(data || {}).map(([stage, count]) => ({ stage, count }));
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#22242C" vertical={false} />
        <XAxis dataKey="stage" tick={{ fill: '#5B5E6B', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#5B5E6B', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip contentStyle={{ background: '#13151A', border: '1px solid #22242C', borderRadius: 10, fontSize: 12 }} />
        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
          {chartData.map((entry) => (
            <Cell key={entry.stage} fill={COLORS[entry.stage] || '#6E56CF'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

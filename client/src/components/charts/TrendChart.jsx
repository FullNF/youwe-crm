import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function TrendChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6E56CF" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#6E56CF" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#22242C" vertical={false} />
        <XAxis dataKey="date" tick={{ fill: '#5B5E6B', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#5B5E6B', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{ background: '#13151A', border: '1px solid #22242C', borderRadius: 10, fontSize: 12 }}
          labelStyle={{ color: '#8A8D98' }}
        />
        <Area type="monotone" dataKey="count" stroke="#6E56CF" strokeWidth={2} fill="url(#trendFill)" name="New leads" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

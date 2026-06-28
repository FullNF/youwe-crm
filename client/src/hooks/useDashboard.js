import { useEffect, useState, useCallback } from 'react';
import api from '../lib/api';

export function useDashboard() {
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [summaryRes, trendRes] = await Promise.all([
      api.get('/dashboard/summary'),
      api.get('/dashboard/trend', { params: { granularity: 'daily', days: 14 } }),
    ]);
    setSummary(summaryRes.data.data);
    setTrend(trendRes.data.data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return { summary, trend, loading, refetch: load };
}

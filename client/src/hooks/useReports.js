import { useCallback, useEffect, useState } from 'react';
import api from '../lib/api';

export function useReports(range) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await api.get('/reports/full', { params: range });
    setReport(res.data.data);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(range)]);

  useEffect(() => { load(); }, [load]);

  const downloadExport = async (format) => {
    const res = await api.get(`/reports/export/${format}`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-export.${format === 'excel' ? 'xlsx' : format}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  return { report, loading, refetch: load, downloadExport };
}

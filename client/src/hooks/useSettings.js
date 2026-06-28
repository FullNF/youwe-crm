import { useCallback, useEffect, useState } from 'react';
import api from '../lib/api';

export function useSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await api.get('/settings');
    setSettings(res.data.data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async (key, value) => {
    await api.put('/settings', { key, value });
    load();
  };

  return { settings, loading, save, refetch: load };
}

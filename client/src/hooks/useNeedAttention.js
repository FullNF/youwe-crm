import { useCallback, useEffect, useState } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';

export function useNeedAttention() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await api.get('/need-attention');
    setItems(res.data.data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const resolve = async (leadRecordId, issueType) => {
    await api.post('/need-attention/resolve', { leadRecordId, issueType });
    toast.success('Marked as resolved');
    load();
  };

  const ignore = async (leadRecordId, issueType, reason) => {
    await api.post('/need-attention/ignore', { leadRecordId, issueType, reason });
    toast.success('Issue ignored');
    load();
  };

  const remindLater = async (leadRecordId, issueType, days) => {
    await api.post('/need-attention/remind-later', { leadRecordId, issueType, days });
    toast.success(`Will remind again in ${days} day(s)`);
    load();
  };

  return { items, loading, refetch: load, resolve, ignore, remindLater };
}

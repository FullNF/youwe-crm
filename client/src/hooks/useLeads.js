import { useCallback, useEffect, useState } from 'react';
import api from '../lib/api';

export function useLeads(params) {
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pageSize: 25, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/leads', { params });
      setData(res.data.data);
      setMeta(res.data.meta);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  return { leads: data, meta, loading, error, refetch: fetchLeads };
}

export async function createLead(payload) {
  const res = await api.post('/leads', payload);
  return res.data.data;
}

export async function updateLead(recordId, patch) {
  const res = await api.put(`/leads/${recordId}`, patch);
  return res.data.data;
}

export async function deleteLead(recordId) {
  const res = await api.delete(`/leads/${recordId}`);
  return res.data.data;
}

export async function addRemark(recordId, note) {
  const res = await api.post(`/leads/${recordId}/remarks`, { note });
  return res.data.data;
}

export async function getLead(recordId) {
  const res = await api.get(`/leads/${recordId}`);
  return res.data.data;
}

export async function checkDuplicatePhone(phone, excludeRecordId) {
  const res = await api.get('/leads/check-duplicate', { params: { phone, excludeRecordId } });
  return res.data.data;
}

import { useCallback, useEffect, useState } from 'react';
import api from '../lib/api';

export function useProperties(params) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/properties', { params });
      setProperties(res.data.data);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)]);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);

  return { properties, loading, refetch: fetchProperties };
}

export function useLocations() {
  const [locations, setLocations] = useState([]);
  useEffect(() => {
    api.get('/properties/locations').then((res) => setLocations(res.data.data)).catch(() => {});
  }, []);
  return locations;
}

export async function getProperty(id) {
  const res = await api.get(`/properties/${id}`);
  return res.data.data;
}

export async function createProperty(payload) {
  const res = await api.post('/properties', payload);
  return res.data.data;
}

export async function updateProperty(id, patch) {
  const res = await api.put(`/properties/${id}`, patch);
  return res.data.data;
}

export async function deleteProperty(id) {
  const res = await api.delete(`/properties/${id}`);
  return res.data.data;
}

export async function addPropertyMedia(propertyId, payload) {
  const res = await api.post(`/properties/${propertyId}/media`, payload);
  return res.data.data;
}

export async function deletePropertyMedia(propertyId, mediaId) {
  const res = await api.delete(`/properties/${propertyId}/media/${mediaId}`);
  return res.data.data;
}

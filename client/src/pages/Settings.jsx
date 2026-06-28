import { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, Shield, Users, ListChecks, Image, Bell, BellOff } from 'lucide-react';
import Topbar from '../components/layout/Topbar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../hooks/useSettings';
import api from '../lib/api';
import { useEffect } from 'react';
import { isPushSupported, getPushStatus, enablePushNotifications, disablePushNotifications } from '../lib/push';

function ManageUsers() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Employee');

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data.data);
    } catch {
      // not admin / not loaded
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (isAdmin) load(); else setLoading(false); }, [isAdmin]);

  const addUser = async () => {
    if (!email.trim()) return;
    await api.post('/users', { email: email.trim(), name: name.trim() || email, role });
    toast.success('User added');
    setEmail(''); setName('');
    load();
  };

  const removeUser = async (userEmail) => {
    await api.delete(`/users/${encodeURIComponent(userEmail)}`);
    toast.success('User removed');
    load();
  };

  if (!isAdmin) {
    return <p className="text-sm text-ink-muted">Only Admins can manage users.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <Input placeholder="email@youwegroup.com" value={email} onChange={(e) => setEmail(e.target.value)} className="sm:col-span-2" />
        <Input placeholder="Name (optional)" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="flex gap-2">
          <Select value={role} onChange={(e) => setRole(e.target.value)} options={['Admin', 'Employee']} placeholder="Role" />
        </div>
      </div>
      <Button onClick={addUser}><Plus size={14} /> Add User</Button>

      <div className="divide-y divide-surface-border mt-4">
        {loading && <Skeleton className="h-10 w-full" />}
        {!loading && users.map((u) => (
          <div key={u.email} className="flex items-center justify-between py-2.5">
            <div>
              <p className="text-sm text-ink">{u.name} <span className="text-ink-faint">· {u.email}</span></p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={u.role === 'Admin' ? 'accent' : 'neutral'}>{u.role}</Badge>
              <button onClick={() => removeUser(u.email)} className="p-1.5 rounded-md text-ink-muted hover:text-danger hover:bg-danger/10">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DropdownEditor({ title, settingKey, settings, save }) {
  const [newValue, setNewValue] = useState('');
  const values = settings?.[settingKey] || [];

  const addValue = async () => {
    if (!newValue.trim() || values.includes(newValue.trim())) return;
    await save(settingKey, [...values, newValue.trim()]);
    setNewValue('');
  };

  const removeValue = async (val) => {
    await save(settingKey, values.filter((v) => v !== val));
  };

  return (
    <div>
      <p className="text-sm font-medium text-ink mb-2">{title}</p>
      <div className="flex flex-wrap gap-1.5 mb-2.5">
        {values.map((v) => (
          <Badge key={v} variant="neutral" className="gap-1.5">
            {v}
            <button onClick={() => removeValue(v)} className="text-ink-faint hover:text-danger">×</button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={newValue} onChange={(e) => setNewValue(e.target.value)} placeholder="Add value..." className="input-base flex-1" onKeyDown={(e) => e.key === 'Enter' && addValue()} />
        <Button variant="secondary" onClick={addValue}><Plus size={14} /></Button>
      </div>
    </div>
  );
}

function NotificationsCard() {
  const [status, setStatus] = useState('checking');
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    if (!isPushSupported()) return setStatus('unsupported');
    setStatus(await getPushStatus());
  };

  useEffect(() => { refresh(); }, []);

  const handleEnable = async () => {
    setBusy(true);
    try {
      await enablePushNotifications();
      toast.success("Notifications on! You'll get an alert on new leads and stage changes.");
      await refresh();
    } catch (err) {
      toast.error(err.message || 'Could not enable notifications.');
    } finally {
      setBusy(false);
    }
  };

  const handleDisable = async () => {
    setBusy(true);
    try {
      await disablePushNotifications();
      toast.success('Notifications turned off on this device.');
      await refresh();
    } finally {
      setBusy(false);
      refresh();
    }
  };

  return (
    <Card>
      <div className="flex items-center gap-2 mb-3">
        <Bell size={16} className="text-accent" />
        <h2 className="text-sm font-semibold text-ink">Notifications</h2>
      </div>
      <p className="text-sm text-ink-muted mb-4">
        Get a real notification on this device whenever a new lead is added or a lead's stage changes
        (e.g. "New &gt; Contacted (Vineet)"). Tapping a notification opens that lead directly.
      </p>

      {status === 'unsupported' && (
        <p className="text-sm text-ink-faint">Your browser doesn't support push notifications.</p>
      )}
      {status === 'denied' && (
        <p className="text-sm text-amber">
          Notifications are blocked for this site in your browser settings. Enable them from your browser's site settings, then reload this page.
        </p>
      )}
      {status === 'not-subscribed' && (
        <Button onClick={handleEnable} loading={busy}><Bell size={14} /> Enable notifications on this device</Button>
      )}
      {status === 'subscribed' && (
        <div className="flex items-center gap-3">
          <Badge variant="success">Enabled on this device</Badge>
          <Button variant="ghost" onClick={handleDisable} loading={busy}><BellOff size={14} /> Turn off</Button>
        </div>
      )}
    </Card>
  );
}

export default function Settings() {
  const { settings, loading, save } = useSettings();

  return (
    <>
      <Topbar title="Settings" />
      <div className="p-4 sm:p-6 space-y-5 animate-fadeIn max-w-4xl">
        <NotificationsCard />

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Shield size={16} className="text-accent" />
            <h2 className="text-sm font-semibold text-ink">Manage Users</h2>
          </div>
          <ManageUsers />
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <ListChecks size={16} className="text-accent" />
            <h2 className="text-sm font-semibold text-ink">Manage Dropdown Values</h2>
          </div>
          {loading ? <Skeleton className="h-32 w-full" /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <DropdownEditor title="Lead Sources" settingKey="dropdown_leadSource" settings={settings} save={save} />
              <DropdownEditor title="Configurations" settingKey="dropdown_configuration" settings={settings} save={save} />
              <DropdownEditor title="Property Conditions" settingKey="dropdown_propertyCondition" settings={settings} save={save} />
              <DropdownEditor title="Customer Types" settingKey="dropdown_custType" settings={settings} save={save} />
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Image size={16} className="text-accent" />
            <h2 className="text-sm font-semibold text-ink">Company Branding</h2>
          </div>
          <Input
            label="Company Logo URL"
            defaultValue={settings?.company_logo_url}
            onBlur={(e) => save('company_logo_url', e.target.value)}
            placeholder="https://..."
          />
        </Card>
      </div>
    </>
  );
}

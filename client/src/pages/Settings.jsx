import { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, Shield, Users, ListChecks, Image as ImageIcon, Bell, BellOff, Send, X } from 'lucide-react';
import Topbar from '../components/layout/Topbar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../hooks/useSettings';
import api from '../lib/api';
import { useEffect } from 'react';
import { isPushSupported, getPushStatus, enablePushNotifications, disablePushNotifications } from '../lib/push';
import { uploadNotificationImage } from '../lib/upload';

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

      {status === 'ios-needs-install' && (
        <div className="text-sm text-ink-muted space-y-1">
          <p className="text-amber font-medium">On iPhone/iPad, Apple requires installing this as an app first:</p>
          <ol className="list-decimal list-inside space-y-0.5">
            <li>Tap the <strong>Share</strong> icon in Safari (square with an arrow)</li>
            <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
            <li>Open YouWe CRM from the new icon on your Home Screen</li>
            <li>Come back to this Settings page and tap Enable</li>
          </ol>
        </div>
      )}
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

function CustomNotificationComposer() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file.');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSend = async () => {
    if (!title.trim() && !body.trim()) {
      toast.error('Write a title or a message first.');
      return;
    }
    setSending(true);
    try {
      let imageUrl;
      if (imageFile) {
        setUploading(true);
        imageUrl = await uploadNotificationImage(imageFile);
        setUploading(false);
      }

      const res = await api.post('/notifications/test', {
        title: title.trim() || 'YouWe CRM',
        body: body.trim() || ' ',
        image: imageUrl,
      });

      const { sent, total } = res.data.data;
      toast.success(`Sent to ${sent}/${total} device(s) with notifications enabled.`);
      setTitle('');
      setBody('');
      clearImage();
    } catch (err) {
      // Upload failures come straight from Cloudinary, not our API, so the
      // global axios interceptor never sees them - show this one explicitly.
      if (!err.response) {
        toast.error(err.message || 'Could not upload the photo.');
      }
      // API errors (e.g. notifications/test failing) already get a toast
      // from the axios interceptor.
    } finally {
      setSending(false);
      setUploading(false);
    }
  };

  return (
    <Card>
      <div className="flex items-center gap-2 mb-3">
        <Send size={16} className="text-accent" />
        <h2 className="text-sm font-semibold text-ink">Send Custom Notification</h2>
      </div>
      <p className="text-sm text-ink-muted mb-4">
        Manually push a notification to every device that has notifications enabled - an announcement,
        a reminder, anything you want the team to see right now. Photo is optional.
      </p>

      <div className="space-y-3">
        <Input label="Title" placeholder="e.g. Team Meeting at 5 PM" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea
          label="Message"
          placeholder="What should it say?"
          rows={3}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />

        <div>
          <label className="block text-xs font-medium text-ink-muted mb-1.5">Photo (optional)</label>
          {imagePreview ? (
            <div className="relative inline-block">
              <img src={imagePreview} alt="Notification preview" className="h-28 w-auto rounded-lg border border-surface-border object-cover" />
              <button
                onClick={clearImage}
                className="absolute -top-2 -right-2 bg-danger text-white rounded-full p-1 shadow-glow-danger"
                title="Remove photo"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <label className="inline-flex items-center gap-2 input-base cursor-pointer text-ink-muted w-fit px-4 hover:border-accent/40 transition-colors">
              <ImageIcon size={14} /> Choose photo
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
          )}
        </div>

        <Button onClick={handleSend} loading={sending || uploading}>
          <Send size={14} /> {uploading ? 'Uploading photo...' : 'Send to everyone'}
        </Button>
      </div>
    </Card>
  );
}

export default function Settings() {
  const { settings, loading, save } = useSettings();
  const { isAdmin } = useAuth();

  return (
    <>
      <Topbar title="Settings" />
      <div className="p-4 sm:p-6 space-y-5 animate-fadeIn max-w-4xl">
        <NotificationsCard />

        {isAdmin && <CustomNotificationComposer />}

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
            <ImageIcon size={16} className="text-accent" />
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

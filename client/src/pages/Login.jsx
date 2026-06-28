import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Building2, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function Login() {
  const { firebaseUser, loading, loginWithEmail, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  if (!loading && firebaseUser) return <Navigate to="/" replace />;

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await loginWithEmail(data.email, data.password);
      navigate('/');
    } catch (err) {
      toast.error('Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  const onGoogle = async () => {
    setSubmitting(true);
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err) {
      toast.error('Google sign-in failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-base flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center mb-3">
            <Building2 size={22} className="text-white" />
          </div>
          <h1 className="text-lg font-semibold text-ink">YouWe CRM</h1>
          <p className="text-sm text-ink-muted">Sign in to manage your leads</p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@youwegroup.com"
              required
              error={errors.email?.message}
              {...register('email', { required: 'Email is required' })}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              required
              error={errors.password?.message}
              {...register('password', { required: 'Password is required' })}
            />
            <Button type="submit" className="w-full" loading={submitting}>Sign in</Button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="h-px bg-surface-border flex-1" />
            <span className="text-xs text-ink-faint">or</span>
            <div className="h-px bg-surface-border flex-1" />
          </div>

          <Button variant="secondary" className="w-full" onClick={onGoogle} disabled={submitting}>
            Continue with Google
          </Button>
        </div>

        <p className="text-center text-xs text-ink-faint mt-5">
          Access is managed by your Admin. Contact them if you can't sign in.
        </p>
      </div>
    </div>
  );
}

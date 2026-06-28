import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
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
    <div className="min-h-screen bg-base flex items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient floating neon blobs - slow, subtle, purely decorative */}
      <div className="absolute top-[-10%] left-[10%] w-72 h-72 bg-accent/25 rounded-full blur-[100px] animate-float pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[8%] w-80 h-80 bg-info/20 rounded-full blur-[110px] animate-floatSlow pointer-events-none" />
      <div className="absolute top-[30%] right-[25%] w-56 h-56 bg-success/10 rounded-full blur-[90px] animate-float pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-sm relative z-10"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center mb-3 shadow-glow-accent">
            <Building2 size={22} className="text-white" />
          </div>
          <h1 className="text-lg font-semibold text-ink">YouWe CRM</h1>
          <p className="text-sm text-ink-muted">Sign in to manage your leads</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.12 }}
          className="glass rounded-card shadow-popover p-6"
        >
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
        </motion.div>

        <p className="text-center text-xs text-ink-faint mt-5">
          Access is managed by your Admin. Contact them if you can't sign in.
        </p>
      </motion.div>
    </div>
  );
}

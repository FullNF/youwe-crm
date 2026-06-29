import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import AmbientBackground from '../components/ui/AmbientBackground';

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
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <AmbientBackground />

      {/* A few extra small floating glass orbs near the card for that "liquid glass" feel */}
      <motion.div
        animate={{ y: [0, -14, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="hidden sm:block absolute top-[18%] left-[28%] w-16 h-16 rounded-full bg-accent/10 dark:bg-white/10 backdrop-blur-md border border-black/10 dark:border-white/20 pointer-events-none"
      />
      <motion.div
        animate={{ y: [0, 16, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        className="hidden sm:block absolute bottom-[20%] right-[30%] w-10 h-10 rounded-full bg-accent/20 backdrop-blur-md border border-black/10 dark:border-white/15 pointer-events-none"
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-sm relative z-10"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.05, type: 'spring', bounce: 0.35 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="w-[4.5rem] h-[4.5rem] rounded-2xl bg-white flex items-center justify-center mb-4 shadow-glow-accent p-2.5 ring-1 ring-black/10">
            <img src="/logo.png" alt="YouWe Group" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-xl font-semibold text-ink tracking-tight">YouWe CRM</h1>
          <p className="text-sm text-ink-muted mt-1">Sign in to manage your leads</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15 }}
          className="glass rounded-card shadow-popover p-7"
          style={{ backdropFilter: 'blur(28px) saturate(160%)', WebkitBackdropFilter: 'blur(28px) saturate(160%)' }}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              icon={Mail}
              placeholder="you@youwegroup.com"
              required
              error={errors.email?.message}
              {...register('email', { required: 'Email is required' })}
            />
            <Input
              label="Password"
              type="password"
              icon={Lock}
              placeholder="••••••••"
              required
              error={errors.password?.message}
              {...register('password', { required: 'Password is required' })}
            />
            <Button type="submit" className="w-full" loading={submitting}>Sign in</Button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="h-px bg-black/10 dark:bg-white/10 flex-1" />
            <span className="text-xs text-ink-faint">or</span>
            <div className="h-px bg-black/10 dark:bg-white/10 flex-1" />
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

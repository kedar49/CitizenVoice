"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/providers/AuthProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Loader2, Eye, EyeOff, Mail, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signInWithEmail, signUpWithEmail } = useAuth();
  const router = useRouter();

  // Password strength calculation
  const getPasswordStrength = () => {
    if (password.length === 0) return { strength: 0, label: '', color: '' };
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (password.length >= 10) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 10;

    if (strength < 50) return { strength, label: 'Weak', color: 'bg-red-500' };
    if (strength < 75) return { strength, label: 'Medium', color: 'bg-amber-500' };
    return { strength, label: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = mode === 'signup' ? getPasswordStrength() : null;

  // Email validation
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { error } = mode === 'signin' 
        ? await signInWithEmail(email, password)
        : await signUpWithEmail(email, password);
      
      if (error) {
        // User-friendly error messages
        if (error.message.includes('Invalid login credentials')) {
          setError('Incorrect email or password');
        } else if (error.message.includes('User already registered')) {
          setError('This email is already registered. Please sign in instead.');
        } else if (error.message.includes('Email not confirmed')) {
          setError('Please check your email and confirm your account first');
        } else {
          setError(error.message);
        }
      } else {
        if (mode === 'signup') {
          setError('');
          // Show success message
          alert('Account created! Please check your email to confirm your account.');
        } else {
          router.push('/');
        }
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 p-4">
      {/* Animated background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 -left-20 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative max-w-md w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-slate-200/50 dark:border-slate-700/50"
      >
        {/* Logo/Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6, delay: 0.2 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/50">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-accent-600 dark:from-primary-400 dark:to-accent-400 mb-2">
            {mode === 'signup' ? 'Join Parliament Cloud' : 'Welcome Back'}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {mode === 'signup'
              ? 'Your voice matters. Create your account today.'
              : 'Sign in to make your voice heard'}
          </p>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div>
            <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 font-medium">
              Email Address
            </Label>
            <div className="relative mt-2">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10 h-12 border-slate-300 dark:border-slate-600 focus:border-primary-500 dark:focus:border-primary-400 transition-colors"
                disabled={loading}
              />
              {email && isValidEmail(email) && (
                <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
              )}
              {email && !isValidEmail(email) && (
                <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
              )}
            </div>
          </div>

          {/* Password Field */}
          <div>
            <Label htmlFor="password" className="text-slate-700 dark:text-slate-300 font-medium">
              Password
            </Label>
            <div className="relative mt-2">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="pl-10 pr-10 h-12 border-slate-300 dark:border-slate-600 focus:border-primary-500 dark:focus:border-primary-400 transition-colors"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {mode === 'signup' && password && passwordStrength && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-2 space-y-1"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-400">Password strength:</span>
                  <span className={`font-medium ${
                    passwordStrength.label === 'Weak' ? 'text-red-600' :
                    passwordStrength.label === 'Medium' ? 'text-amber-600' :
                    'text-green-600'
                  }`}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${passwordStrength.strength}%` }}
                    transition={{ duration: 0.3 }}
                    className={`h-full ${passwordStrength.color}`}
                  />
                </div>
              </motion.div>
            )}
            
            {mode === 'signup' && (
              <p className="text-xs text-slate-500 mt-1">
                Use 6+ characters with letters, numbers & symbols
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-12 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white font-semibold shadow-lg shadow-primary-500/30 hover:shadow-primary-600/40 transition-all"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {mode === 'signup' ? 'Creating account...' : 'Signing in...'}
              </>
            ) : (
              mode === 'signup' ? 'Create Account' : 'Sign In'
            )}
          </Button>
        </form>

        {/* Toggle Sign In/Sign Up */}
        <div className="mt-8 text-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300 dark:border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white/90 dark:bg-slate-900/90 text-slate-500">
                {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}
              </span>
            </div>
          </div>
          
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setMode(mode === 'signup' ? 'signin' : 'signup');
              setError('');
            }}
            className="mt-4 text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
            disabled={loading}
          >
            {mode === 'signup' ? 'Sign in instead' : 'Create new account'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

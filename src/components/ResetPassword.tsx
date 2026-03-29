import React, { useState, useEffect } from 'react';
import { updatePassword } from '../services/auth';
import { supabase } from '../supabaseClient';
import { motion } from 'motion/react';
import { Lock, Loader2, AlertCircle, CheckCircle2, ArrowLeft, ShieldCheck } from 'lucide-react';

interface ResetPasswordProps {
  onSuccess: () => void;
  onBack: () => void;
}

export default function ResetPassword({ onSuccess, onBack }: ResetPasswordProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    console.log('ResetPassword: Component mounted');
    console.log('ResetPassword: URL Hash', window.location.hash);
    
    // Supabase automatically handles the session from the hash fragment
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('ResetPassword: Session check', session);
      if (!session) {
        setError('Invalid or expired reset link. Please request a new one.');
      }
    };
    checkSession();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    console.log('ResetPassword: Attempting password update');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      await updatePassword(password);
      console.log('ResetPassword: Password updated successfully');
      setSuccess('Password updated successfully! Redirecting to login...');
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err: any) {
      console.error('ResetPassword: Update error', err.message);
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-et-gray flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="flex items-center space-x-2">
          <img 
            src="https://economictimes.indiatimes.com/photo/msid-74451948,quality-100/et-logo.jpg" 
            alt="ET Logo" 
            className="h-8 md:h-10"
            referrerPolicy="no-referrer"
          />
          <div className="h-6 w-[1px] bg-gray-300 mx-2"></div>
          <span className="font-serif font-bold text-xl tracking-tight text-et-dark">Money Mentor</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white p-10 rounded-2xl shadow-2xl border border-gray-100"
        >
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-et-dark font-serif mb-2">Reset Your Password</h2>
            <p className="text-gray-500 text-sm">Enter your new secure password below.</p>
          </div>

          <form onSubmit={handleReset} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-et-red focus:ring-1 focus:ring-et-red outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-et-red focus:ring-1 focus:ring-et-red outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-et-red bg-red-50 p-3 rounded-lg text-sm border border-red-100">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg text-sm border border-green-100">
                <CheckCircle2 size={18} />
                <span>{success}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-et-red text-white font-bold py-4 rounded-xl hover:bg-opacity-90 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 shadow-lg shadow-red-100"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <ShieldCheck size={20} />
                  <span>Reset Password</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-100 text-center">
            <button 
              onClick={onBack}
              className="flex items-center justify-center space-x-2 text-sm font-bold text-gray-500 hover:text-et-red transition-colors mx-auto"
            >
              <ArrowLeft size={16} />
              <span>Back to Login</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { signUp, signIn, forgotPassword, updatePassword } from '../services/auth';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, UserPlus, Loader2, AlertCircle, CheckCircle2, ArrowLeft, Mail, Lock, User, Phone, Sparkles, ChevronRight, ShieldCheck } from 'lucide-react';

type AuthState = 'LOGIN' | 'SIGNUP' | 'FORGOT_PASSWORD' | 'UPDATE_PASSWORD';

interface AuthProps {
  onAuthSuccess: () => void;
  initialState?: AuthState;
}

export default function Auth({ onAuthSuccess, initialState = 'LOGIN' }: AuthProps) {
  const [state, setState] = useState<AuthState>(initialState);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    setSuccess(null);
  }, [state]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (state === 'LOGIN') {
        const data = await signIn(email, password);
        console.log('Auth: Login success', data);
        onAuthSuccess();
      } else if (state === 'SIGNUP') {
        if (password.length < 6) throw new Error('Password must be at least 6 characters');
        
        console.log('Auth: Attempting signup');
        const data = await signUp(email, password, fullName, phone);
        console.log('Auth: Signup response', data);

        if (data.session) {
          // If session exists, user is logged in immediately (email confirmation is disabled)
          console.log('Auth: Immediate login after signup');
          setSuccess('Account created! Logging you in...');
          setTimeout(() => onAuthSuccess(), 1500);
        } else if (data.user) {
          // If user exists but no session, email confirmation is required
          console.warn('Auth: Signup successful but no session. Email confirmation may be required.');
          setSuccess('Signup successful! Please check your email to verify your account.');
        }
      } else if (state === 'FORGOT_PASSWORD') {
        await forgotPassword(email);
        setSuccess('Password reset link sent to your email.');
      } else if (state === 'UPDATE_PASSWORD') {
        if (password.length < 6) throw new Error('Password must be at least 6 characters');
        await updatePassword(password);
        setSuccess('Password updated successfully! You can now log in.');
        setTimeout(() => setState('LOGIN'), 2000);
      }
    } catch (err: any) {
      console.error('Auth: Error in handleAuth', err);
      
      const message = err.message || '';
      
      if (message.includes('email rate limit exceeded')) {
        setError('Too many attempts. Please use "Enter Guest Mode" to bypass this limit or try again in 10 minutes.');
      } else if (message.includes('Invalid login credentials')) {
        setError('Incorrect email or password. If you haven\'t signed up yet, please create an account first.');
      } else if (message.includes('User already registered')) {
        setError('This email is already registered. Please sign in instead.');
      } else {
        setError(message || 'An error occurred during authentication');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => (
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
      <div className="flex items-center space-x-4">
        <button className="text-sm font-bold text-gray-600 hover:text-et-red transition-colors hidden md:block">Need Help?</button>
        {state !== 'LOGIN' && (
          <button 
            onClick={() => setState('LOGIN')}
            className="bg-et-red text-white px-6 py-2 rounded font-bold text-sm hover:bg-opacity-90 transition-all"
          >
            Login
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {renderHeader()}

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left: Hero Section */}
        <div className="md:w-3/5 p-8 md:p-16 flex flex-col justify-center bg-white relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-6">
                <span className="bg-et-red text-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm inline-block">
                  Become Financially Smarter
                </span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-serif font-bold text-et-dark leading-[1.1] mb-6">
                Your AI <br />
                Financial Buddy
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg mb-10 font-sans">
                Plan smarter, invest better, and secure your future with AI-powered financial guidance tailored just for you.
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <button 
                  onClick={() => setState('SIGNUP')}
                  className="bg-et-red text-white px-10 py-4 rounded-lg font-bold text-lg hover:bg-opacity-95 transition-all shadow-xl shadow-red-100 flex items-center space-x-3 group"
                >
                  <span>Get your Financial Plan</span>
                  <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
                
                <div className="flex items-center space-x-4 text-sm font-bold text-gray-400">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                        <img src={`https://picsum.photos/seed/user${i}/32/32`} alt="User" referrerPolicy="no-referrer" />
                      </div>
                    ))}
                  </div>
                  <span>Joined by 10k+ users</span>
                </div>
              </div>

              <div className="mt-16 pt-8 border-t border-gray-100 flex items-center space-x-8 opacity-50 grayscale">
                <img src="https://economictimes.indiatimes.com/photo/msid-74451948,quality-100/et-logo.jpg" alt="Partner" className="h-6" referrerPolicy="no-referrer" />
                <span className="font-serif font-bold text-lg text-et-dark">ET Prime</span>
                <span className="font-serif font-bold text-lg text-et-dark">Wealth</span>
              </div>
            </motion.div>
          </div>

          {/* Subtle Background Decoration */}
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-et-red/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/4 right-0 w-64 h-64 bg-gray-100 rounded-full blur-3xl"></div>
        </div>

        {/* Right: Auth Form */}
        <div className="md:w-2/5 flex items-center justify-center p-8 bg-gray-50/50">
          <motion.div
            key={state}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white p-10 rounded-2xl shadow-2xl border border-gray-100"
          >
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-et-dark font-serif mb-2">
                {state === 'LOGIN' && 'Sign In'}
                {state === 'SIGNUP' && 'Create Account'}
                {state === 'FORGOT_PASSWORD' && 'Reset Password'}
                {state === 'UPDATE_PASSWORD' && 'New Password'}
              </h2>
              <p className="text-gray-500 text-sm">
                {state === 'LOGIN' && 'Access your premium financial dashboard'}
                {state === 'SIGNUP' && 'Secure your financial future with AI'}
                {state === 'FORGOT_PASSWORD' && 'Enter your email to receive a reset link'}
                {state === 'UPDATE_PASSWORD' && 'Enter your new secure password'}
              </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-5">
              <AnimatePresence mode="wait">
                {state === 'SIGNUP' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-5"
                  >
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-et-red focus:ring-1 focus:ring-et-red outline-none transition-all"
                          placeholder="John Doe"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Mobile Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-et-red focus:ring-1 focus:ring-et-red outline-none transition-all"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {state !== 'UPDATE_PASSWORD' && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-et-red focus:ring-1 focus:ring-et-red outline-none transition-all"
                      placeholder="name@company.com"
                    />
                  </div>
                </div>
              )}

              {state !== 'FORGOT_PASSWORD' && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
                    {state === 'LOGIN' && (
                      <button 
                        type="button"
                        onClick={() => setState('FORGOT_PASSWORD')}
                        className="text-xs font-bold text-et-red hover:underline"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
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
              )}

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
                    {state === 'LOGIN' && <LogIn size={20} />}
                    {state === 'SIGNUP' && <UserPlus size={20} />}
                    {state === 'FORGOT_PASSWORD' && <Mail size={20} />}
                    {state === 'UPDATE_PASSWORD' && <ShieldCheck size={20} />}
                    <span>
                      {state === 'LOGIN' && 'Sign In'}
                      {state === 'SIGNUP' && 'Create Account'}
                      {state === 'FORGOT_PASSWORD' && 'Send Reset Link'}
                      {state === 'UPDATE_PASSWORD' && 'Update Password'}
                    </span>
                  </>
                )}
              </button>

              {state === 'LOGIN' && (
                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500 font-bold tracking-widest">OR</span>
                  </div>
                </div>
              )}

              {state === 'LOGIN' && (
                <button
                  type="button"
                  onClick={() => {
                    console.log('Auth: Entering Guest Mode');
                    onAuthSuccess();
                  }}
                  className="w-full bg-white text-et-dark border-2 border-et-dark font-bold py-4 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center space-x-2 shadow-sm"
                >
                  <Sparkles size={20} className="text-et-red" />
                  <span>Enter Guest Mode</span>
                </button>
              )}
            </form>

            <div className="mt-8 pt-8 border-t border-gray-100 text-center">
              {state === 'LOGIN' ? (
                <p className="text-sm text-gray-500">
                  Don't have an account?{' '}
                  <button 
                    onClick={() => setState('SIGNUP')}
                    className="text-et-red font-bold hover:underline"
                  >
                    Sign Up Free
                  </button>
                </p>
              ) : (
                <button 
                  onClick={() => setState('LOGIN')}
                  className="flex items-center justify-center space-x-2 text-sm font-bold text-gray-500 hover:text-et-red transition-colors mx-auto"
                >
                  <ArrowLeft size={16} />
                  <span>Back to Login</span>
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

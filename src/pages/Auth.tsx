import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, Loader2, Lock, Mail, User, LayoutDashboard, ShieldCheck, ArrowRight, Github, Chrome } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { auth } from '../redux/features/userSlice';
import type { RootState, AppDispatch } from '../redux/store';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const user = useSelector((state: RootState) => state.user);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    if (user.isLoggedIn) {
      navigate('/chat');
    }
  }, [user.isLoggedIn, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Use auth action with register flag
    dispatch(auth({ ...formData, register: !isLogin }));
  };

  useEffect(() => {
    const rawData = localStorage.getItem('app_preferences');
    if (rawData) {
      const storedUser = JSON.parse(rawData);
      if (storedUser.isLoggedIn) {
        navigate('/chat');
      }
    }
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-[var(--color1)] text-[var(--color4)] font-body flex items-center justify-center relative overflow-hidden">

      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[var(--color3)]/10 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
        <div className="absolute top-[20%] right-[20%] w-[300px] h-[300px] bg-[var(--color3)]/5 rounded-full blur-[80px]"></div>
      </div>

      <div className="w-full max-w-[1000px] min-h-[600px] bg-[var(--glass-bg)] backdrop-blur-2xl rounded-3xl border border-[var(--border)] shadow-2xl flex overflow-hidden relative z-10 animate-fade-in-up mx-4">

        {/* Left Section - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative bg-[var(--color1)]/50">

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[var(--color3)] flex items-center justify-center text-white shadow-lg shadow-[var(--color3)]/30">
                <LayoutDashboard size={20} />
              </div>
              <span className="text-xl font-bold tracking-tight">Lysis AI</span>
            </div>

            <h2 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-linear-to-r from-[var(--color4)] to-[var(--muted)]">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-[var(--muted)] text-sm">
              {isLogin ? 'Enter your credentials to access your workspace.' : 'Get started with your intelligent assistant today.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] w-5 h-5 group-focus-within:text-(--color3) transition-colors" />
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  className="w-full bg-[var(--color2)] border border-[var(--border)] rounded-xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:border-(--color3) focus:ring-1 focus:ring-(--color3) transition-all placeholder-[var(--muted)] text-[var(--color4)]"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] w-5 h-5 group-focus-within:text-(--color3) transition-colors" />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                className="w-full bg-[var(--color2)] border border-[var(--border)] rounded-xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:border-(--color3) focus:ring-1 focus:ring-(--color3) transition-all placeholder-[var(--muted)] text-[var(--color4)]"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] w-5 h-5 group-focus-within:text-(--color3) transition-colors" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                className="w-full bg-[var(--color2)] border border-[var(--border)] rounded-xl py-3.5 pl-12 pr-12 text-sm focus:outline-none focus:border-(--color3) focus:ring-1 focus:ring-(--color3) transition-all placeholder-[var(--muted)] text-[var(--color4)]"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-(--color3) transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={user.isLoading}
              className="w-full bg-[var(--color3)] text-white font-medium py-3.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-[var(--color3)]/25 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {user.isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  <span className="relative z-10">{isLogin ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-[var(--border)]"></div>
            <span className="text-xs text-[var(--muted)] uppercase tracking-wider">Or continue with</span>
            <div className="h-px flex-1 bg-[var(--border)]"></div>
          </div>

          <div className="flex gap-4 mt-6">
            <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-[var(--border)] hover:bg-(--surface-hover) transition-all text-sm font-medium text-[var(--color4)] cursor-pointer">
              <Github size={18} /> Github
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-[var(--border)] hover:bg-(--surface-hover) transition-all text-sm font-medium text-[var(--color4)] cursor-pointer">
              <Chrome size={18} /> Google
            </button>
          </div>

          <p className="mt-8 text-center text-sm text-[var(--muted)]">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-[var(--color3)] font-semibold hover:underline"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>

          <div className="mt-auto pt-6 flex items-center justify-center text-xs text-[var(--muted)] gap-2">
            <ShieldCheck size={14} className="text-[var(--color3)]" />
            <span>Secure Encrypted Connection</span>
          </div>

        </div>

        {/* Right Section - Decorative/Info (Hidden on Mobile) */}
        <div className="hidden md:flex w-1/2 bg-[var(--surface-hover)] items-center justify-center p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-[var(--color3)]/20 to-transparent"></div>

          <div className="relative z-10 max-w-sm">
            <div className="mb-8 inline-flex p-3 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)] shadow-lg backdrop-blur-md">
              <LayoutDashboard size={32} className="text-[var(--color3)]" />
            </div>
            <h2 className="text-4xl font-bold mb-6 text-[var(--color4)] leading-tight">
              Unlock the power of <span className="text-[var(--color3)]">Intelligent AI</span>
            </h2>
            <p className="text-[var(--muted)] text-lg leading-relaxed mb-8">
              Experience a seamless workflow with advanced reasoning, code analysis, and real-time collaboration tools designed for professionals.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--border)] backdrop-blur-sm">
                <div className="w-10 h-10 rounded-full bg-[var(--color3)]/10 flex items-center justify-center text-[var(--color3)]">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--color4)]">Enterprise Security</h4>
                  <p className="text-xs text-[var(--muted)]">Your data is encrypted and safe.</p>
                </div>
              </div>
              {/* Add more feature blocks if needed */}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Auth;
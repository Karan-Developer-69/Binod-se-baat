import React, { use, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail, Lock, User, ArrowRight,
  Github, Chrome, ShieldCheck, Eye, EyeOff, LayoutDashboard
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { auth } from '../redux/features/userSlice';

const Auth: React.FC = () => {

  const dispath = useDispatch();
  const user = useSelector(state=>state?.user)
  const navigate = useNavigate();
  
  useEffect(()=>{
    if (user.isLoggedIn){
      navigate('/chat');
    }
  },[user])

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  

  const handleAction = (e: React.FormEvent) => {
    e.preventDefault();

    let profile = user;

    if (!isLogin) {
      // Signup Mode: Overwrite with new data
      profile = {
        ...profile,
        name: formData.name || 'New User',
        email: formData.email,
        bio: 'Just joined!', 
      };
      console.log('prrofile',profile)
      dispath(auth({ ...formData, register: true }));
    } else {
      const user = localStorage.getItem('app_preferences') ? JSON.parse(localStorage.getItem('app_preferences')) : {};
      console.log('prrofile',{ ...formData})
      dispath(auth({ ...formData, register: false, user }));
    }

    // Simulate API delay
    const btn = e.currentTarget.querySelector('button[type="submit"]');
    if (btn) btn.innerHTML = 'Authenticating...';

    if(user.isLoading){
      setTimeout(() => {
        navigate('/chat');
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-[var(--color1)] text-[var(--color4)]">

      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[var(--color3)]/10 blur-[120px] rounded-full"></div>

      <div className="w-full max-w-[1000px] grid lg:grid-cols-2 glass-card rounded-3xl overflow-hidden shadow-2xl z-10">

        {/* Left Side: Brand (Visible on Desktop) */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-[var(--color3)]/5 relative overflow-hidden">
          <div className="flex items-center gap-3 z-10">
            <div className="bg-[var(--color3)] p-2 rounded-lg text-white">
              <LayoutDashboard size={24} />
            </div>
            <span className="text-xl font-bold font-heading tracking-tight">NexUI</span>
          </div>

          <div className="relative z-10">
            <h2 className="text-4xl font-bold font-heading mb-6 leading-tight">
              Build faster with <br />
              <span className="text-[var(--color3)]">Intelligence.</span>
            </h2>
            <p className="text-[var(--muted)] text-base max-w-sm">
              The professional platform for developers. streamlining your workflow with advanced AI integration.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-[var(--muted)]">
            <div className="flex items-center gap-2"><ShieldCheck size={14} className="text-[var(--color3)]" /> Enterprise Grade</div>
            <div>SOC2 Compliant</div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center bg-[var(--glass-bg)]">

          <div className="mb-8">
            <h1 className="text-2xl font-bold font-heading mb-2">
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h1>
            <p className="text-sm text-[var(--muted)]">
              {isLogin ? 'Enter your credentials to access your workspace.' : 'Get started with your free developer account today.'}
            </p>
          </div>

          <form onSubmit={handleAction} className="space-y-5">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--color4)] ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 text-[var(--muted)]" size={18} />
                  <input
                    name='name'
                    onChange={e => handleChange(e)}
                    type="text"
                    placeholder="Jane Doe"
                    className="w-full premium-input rounded-xl py-3 pl-11 pr-4 text-sm"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--color4)] ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-[var(--muted)]" size={18} />
                <input
                  onChange={e => handleChange(e)}
                  type="email"
                  name='email'
                  placeholder="name@company.com"
                  className="w-full premium-input rounded-xl py-3 pl-11 pr-4 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--color4)] ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-[var(--muted)]" size={18} />
                <input
                  onChange={e => handleChange(e)}
                  name='password'
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full premium-input rounded-xl py-3 pl-11 pr-12 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-[var(--muted)] hover:text-[var(--color3)] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="flex justify-end">
                <button type="button" className="text-xs font-medium text-[var(--color3)] hover:opacity-80">Forgot password?</button>
              </div>
            )}

            <button className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-2 text-sm shadow-lg">
              {isLogin ? 'Sign In' : 'Create Account'} <ArrowRight size={18} />
            </button>
          </form>

          {/* Social Auth */}
          <div className="mt-8">
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--border)]"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-[var(--color1)] text-[var(--muted)]">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 bg-[var(--color2)] border border-[var(--border)] py-2.5 rounded-xl hover:bg-[var(--surface-hover)] transition-all text-xs font-medium">
                <Github size={16} /> GitHub
              </button>
              <button className="flex items-center justify-center gap-2 bg-[var(--color2)] border border-[var(--border)] py-2.5 rounded-xl hover:bg-[var(--surface-hover)] transition-all text-xs font-medium">
                <Chrome size={16} /> Google
              </button>
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-[var(--muted)]">
            {isLogin ? "New to the platform?" : "Already have an account?"}{' '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-[var(--color3)] font-semibold hover:underline"
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
export default Auth;
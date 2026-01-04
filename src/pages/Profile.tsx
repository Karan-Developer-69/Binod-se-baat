import React, { useState, useEffect, useRef } from 'react';
import {
  User, Mail, ArrowLeft,
  LogOut, Camera, Save, CheckCircle2
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout, setUser } from '../redux/features/userSlice';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {

  const fileInputRef = useRef<HTMLInputElement>(null);

  const dispatch = useDispatch();
  const user = useSelector((state)=>state?.user);

  const navigate = useNavigate();

  // Lazy Initialize State from LocalStorage
  const [profile, setLocalProfile] = useState({});

  const theme = useSelector(state => state?.user?.theme || 'light');
  

  const handleLogout = () => {
    localStorage.setItem('app_preferences',JSON.stringify({...user, isLoggedIn:false}));
    dispatch(logout())
    navigate('/')
  };



  const [isDark, setIsDark] = useState(() => theme === 'dark');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(()=>{
    setLocalProfile(user)
  },[user])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalProfile({ ...profile, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const saveSettings = () => {
    const updatedProfile = { ...profile, theme: isDark ? 'dark' : 'light' };
    dispatch(setUser(updatedProfile));
    localStorage.setItem('app_preferences', JSON.stringify(updatedProfile));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="min-h-screen w-full bg-[var(--color1)] text-[var(--color4)] flex flex-col items-center p-6 md:p-12 transition-colors duration-300">

      {/* Navbar */}
      <div className="w-full max-w-5xl flex items-center justify-between mb-10">
        <button onClick={() => window.history.back()} className="flex items-center gap-2 text-[var(--muted)] hover:text-[var(--color4)] transition-colors text-sm font-medium">
          <ArrowLeft size={18} /> Back
        </button>
        <h1 className="text-xl font-heading font-bold">Settings</h1>
      </div>

      <div className="w-full max-w-5xl grid lg:grid-cols-3 gap-8">

        {/* Sidebar: Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card rounded-3xl p-8 flex flex-col items-center text-center">

            <div className="relative group mb-6">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[var(--color2)] shadow-xl">
                {profile.image ? (
                  <img src={profile.image} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[var(--color2)] flex items-center justify-center text-4xl font-bold text-[var(--muted)]">
                    {profile.name?.charAt(0)}
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-[var(--color3)] text-white p-2.5 rounded-full shadow-lg hover:bg-opacity-90 transition-all"
              >
                <Camera size={16} />
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            </div>

            <h2 className="text-xl font-bold font-heading mb-1">{profile.name}</h2>
            <p className="text-sm text-[var(--muted)] mb-6">{profile.email}</p>

            <div className="w-full border-t border-[var(--border)] my-6"></div>

            {/* Theme Toggle */}
            <div className="w-full flex items-center justify-between">
              <span className="text-sm font-medium">Dark Mode</span>
              <button
                onClick={() => setIsDark(!isDark)}
                className={`w-12 h-7 rounded-full p-1 flex items-center transition-colors duration-300 ${isDark ? 'bg-[var(--color3)]' : 'bg-[var(--border)]'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${isDark ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content: Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-3xl p-8 md:p-10">
            <h2 className="text-2xl font-bold font-heading mb-8">Account Details</h2>

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--muted)]">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 text-[var(--muted)]" size={18} />
                    <input
                      type="text"
                      value={profile.name}
                        onChange={(e) => setLocalProfile({ ...profile, name: e.target.value })}
                      className="w-full premium-input rounded-xl py-3 pl-12 pr-4 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--muted)]">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 text-[var(--muted)]" size={18} />
                    <input
                      type="email"
                      value={profile.email}
                      className="w-full premium-input rounded-xl py-3 pl-12 pr-4 text-sm opacity-60 cursor-not-allowed"
                      disabled
                    />
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-[var(--border)]">
                <h3 className="text-lg font-semibold mb-6">Security</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--muted)]">Current Password</label>
                    <input type="password" placeholder="••••••••" className="w-full premium-input rounded-xl py-3 px-4 text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--muted)]">New Password</label>
                    <input type="password" placeholder="New Password" className="w-full premium-input rounded-xl py-3 px-4 text-sm" />
                  </div>
                </div>
              </div>

              <div className="pt-10 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <button
                  onClick={saveSettings}
                  className="btn-primary px-8 py-3 rounded-xl flex items-center gap-2 shadow-lg"
                >
                  {isSaved ? <CheckCircle2 size={18} /> : <Save size={18} />}
                  {isSaved ? 'Saved' : 'Save Changes'}
                </button>

                <button
                  className="flex items-center gap-2 text-sm text-[var(--muted)] hover:text-red-500 transition-colors"
                  onClick={handleLogout}
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
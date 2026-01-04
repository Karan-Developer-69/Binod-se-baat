import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight, Sparkles, Cpu, ShieldCheck, Globe2, Command, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../redux/features/userSlice';

const Home: React.FC = () => {

  const [isloggedIn,theme] = useSelector(state => [state?.user.isLoggedIn,state?.user.theme]);
  const dispatch = useDispatch();
  const [isDark, setIsDark] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(()=>{
    const result = ()=>{
      if(theme==='dark'){
      return true
      }
      return false
    }
    setIsDark(result)
  },[theme])

  // 1. Scroll-Reveal Logic
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  // 2. Prevent scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'auto';
  }, [isMenuOpen]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className={`min-h-screen theme-transition font-grotesk overflow-x-hidden ${
      isDark ? 'bg-[#061E29] text-[#F3F4F4]' : 'bg-[#F3F4F4] text-[#061E29]'
    }`}>
      
      {/* --- FIXED NAVIGATION --- */}
      <nav className={`fixed w-full z-[100] theme-transition transition-all duration-500 ${
        scrolled ? 'py-4 premium-glass shadow-2xl' : 'py-8'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2 group z-[110]">
            <div className="bg-[#5F9598] p-1.5 rounded-lg">
              <Command size={24} className={isDark ? 'text-[#061E29]' : 'text-white'} strokeWidth={3} />
            </div>
            <span className="font-anton text-2xl tracking-widest uppercase italic">Lysis</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-10">
            {['Engine', 'Security', 'About'].map((link) => (
              <a key={link} href={`#${link}`} className="text-[10px] font-bold tracking-[0.3em] uppercase hover:text-[#5F9598] transition-colors">
                {link}
              </a>
            ))}
            <button onClick={() => dispatch(setUser({theme:!isMenuOpen}))} className="p-2 rounded-full hover:bg-black/10 transition-colors">
              {isDark ? <Sun size={20} className="text-[#5F9598]" /> : <Moon size={20} className="text-[#1D546D]" />}
            </button>{!isloggedIn ?
            <Link to={'/auth'} className="bg-[#5F9598] text-[#061E29] px-8 py-2.5 rounded-full font-anton text-sm tracking-widest hover:scale-110 active:scale-95 transition-all">
              LOGIN
            </Link> :
            <Link to={'/chat'} className="bg-[#5F9598] text-[#061E29] px-8 py-2.5 rounded-full font-anton text-sm tracking-widest hover:scale-110 active:scale-95 transition-all">
              CHAT
            </Link>}
          </div>

          {/* Mobile Menu Toggle (Z-Index Fixed) */}
          <button className="md:hidden z-[110] p-2" onClick={toggleMenu}>
            {isMenuOpen ? <X size={32} /> : <Menu size={32} className="text-[#5F9598]" />}
          </button>
        </div>

        {/* --- MOBILE DRAWER --- */}
        <div className={`fixed inset-0 ${isDark ? 'bg-[#061E29] text-[#F3F4F4]' : 'bg-[#F3F4F4] text-[#061E29]'} transition-all duration-500 md:hidden flex flex-col items-center justify-center space-y-8 z-[105] ${
          isMenuOpen ? 'opacity-100 visible translate-y-0 translate-x-0' : 'opacity-0 invisible pointer-events-none -translate-y-[100%] translate-x-[50%]'
        }`}>
          {['Engine', 'Security', 'About'].map((link) => (
            <a key={link} href="#" onClick={toggleMenu} className="font-anton text-5xl  uppercase tracking-tighter">
              {link}
            </a>
          ))}
          <button onClick={() => { setIsDark(!isDark); toggleMenu(); }} className="text-[#5F9598] flex items-center gap-2 font-bold tracking-widest uppercase text-sm">
            {isDark ? <Sun size={24} /> : <Moon size={24} />} Toggle Theme
          </button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 px-6">
        <div className="max-w-6xl mx-auto text-center relative z-10 reveal">
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-[#5F9598]/30 mb-10">
            <Sparkles size={16} className="text-[#5F9598] animate-pulse" />
            <span className="text-[10px] font-black tracking-[0.4em] uppercase opacity-70">Empowering Intelligence</span>
          </div>

          <h1 className="text-7xl md:text-[140px] font-anton leading-[0.8] mb-10 uppercase tracking-tighter">
            Lysis <span className="text-[#5F9598]">AI</span> <br /> 
            Beyond Logic.
          </h1>

          <p className={`max-w-2xl mx-auto text-lg md:text-2xl font-light leading-relaxed mb-14 opacity-80`}>
            A neural powerhouse built to solve, create, and adapt. The future of communication is here.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button className="w-full sm:w-auto bg-[#5F9598] text-[#061E29] px-14 py-6 rounded-2xl font-anton text-2xl tracking-widest hover:translate-y-[-8px] transition-all shadow-2xl shadow-[#5F9598]/20">
              START CHAT
            </button>
            <button className="flex items-center gap-2 font-bold text-sm tracking-widest uppercase opacity-60 hover:opacity-100 transition-opacity">
              Explore Tech <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* --- FEATURES WITH REVEAL --- */}
      <section id="Engine" className="py-24 px-6 bg-black/5">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">
          {[
            { icon: <Cpu />, title: "Neural Core", desc: "Proprietary Lysis-V4 engine for zero latency." },
            { icon: <ShieldCheck />, title: "Privacy First", desc: "Your data is encrypted and never sold." },
            { icon: <Globe2 />, title: "Universal", desc: "Native support for 150+ languages." }
          ].map((feat, i) => (
            <div key={i} className={`reveal p-12 rounded-[40px] border theme-transition group transition-all duration-700 ${
              isDark ? 'bg-[#1D546D]/10 border-white/5 hover:bg-[#1D546D]/20' : 'bg-white border-gray-100 shadow-xl'
            }`} style={{ transitionDelay: `${i * 150}ms` }}>
              <div className="w-16 h-16 rounded-2xl bg-[#5F9598]/20 text-[#5F9598] flex items-center justify-center mb-8 group-hover:rotate-12 transition-transform">
                {feat.icon}
              </div>
              <h3 className="text-3xl font-anton uppercase mb-4 tracking-wide">{feat.title}</h3>
              <p className="opacity-70 text-lg leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-32 px-6">
        <div className={`max-w-6xl mx-auto reveal rounded-[50px] p-12 md:p-24 text-center border transition-all ${
          isDark ? 'bg-[#1D546D]/20 border-white/5' : 'bg-[#1D546D] text-white'
        }`}>
          <h2 className="text-5xl md:text-8xl font-anton uppercase mb-10 leading-none"> Ready to scale <br /> your <span className="text-[#5F9598]">minds?</span></h2>
          <button className="bg-[#F3F4F4] text-[#061E29] px-12 py-5 rounded-2xl font-anton text-xl tracking-widest hover:scale-105 transition-transform">
            GET STARTED NOW
          </button>
        </div>
      </section>

      <footer className="py-20 px-6 border-t border-black/5 text-center opacity-40">
        <span className="font-anton text-xl tracking-widest uppercase italic mb-4 block">LYSIS</span>
        <p className="text-[10px] font-bold tracking-[0.3em] uppercase italic">© 2026 LYSIS NEURAL SYSTEMS INC. ALL RIGHTS RESERVED.</p>
      </footer>
    </div>
  );
};

export default Home;
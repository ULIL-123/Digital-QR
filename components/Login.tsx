
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { LockClosedIcon, UserIcon, IdentificationIcon } from '@heroicons/react/24/outline';

const CreativeLogo = ({ size = "w-40 h-40", url, shortName }: { size?: string, url?: string, shortName: string }) => (
  <div className={`${size} relative z-40 mb-6 group perspective-1000`}>
    <style>{`
      @keyframes login-neon-glow {
        0%, 100% { filter: drop-shadow(0 0 15px #00f2ff) brightness(1); }
        50% { filter: drop-shadow(0 0 45px #ff00ff) brightness(1.6); }
      }
      @keyframes core-rotate-tech {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      .animate-login-neon-glow { animation: login-neon-glow 3s ease-in-out infinite; }
      .animate-core-rotate-tech { animation: core-rotate-tech 15s linear infinite; }
    `}</style>
    
    <div className="w-full h-full flex items-center justify-center relative">
        <div className="absolute inset-0 bg-cyan-400/10 rounded-full blur-3xl group-hover:bg-cyan-400/20 transition-all duration-700"></div>
        {url ? (
            <img src={url} className="w-full h-full object-contain filter drop-shadow-[0_0_30px_rgba(0,242,255,0.6)]" alt="App Logo" />
        ) : (
            <svg viewBox="0 0 120 120" className="w-full h-full animate-login-neon-glow transform transition-all duration-700 group-hover:scale-105">
                <defs>
                    <linearGradient id="neonLoginGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#00f2ff" />
                        <stop offset="50%" stopColor="#ccff00" />
                        <stop offset="100%" stopColor="#ff00ff" />
                    </linearGradient>
                </defs>
                
                <circle cx="60" cy="60" r="58" fill="none" stroke="url(#neonLoginGrad)" strokeWidth="0.5" strokeDasharray="4 12" className="animate-core-rotate-tech opacity-60" />
                
                <path d="M60 10 L105 32 V88 L60 110 L15 88 V32 Z" fill="#020617" stroke="url(#neonLoginGrad)" strokeWidth="6" strokeLinejoin="round" />
                
                <g stroke="url(#neonLoginGrad)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none">
                  <path d="M40 40 V80 H75 M68 40 V92" />
                  <path d="M68 40 Q95 40 95 66 Q95 92 68 92" stroke="#00f2ff" />
                </g>

                <rect x="36" y="60" width="48" height="14" rx="3" fill="#020617" stroke="#ccff00" strokeWidth="1" />
                <text x="60" y="70" textAnchor="middle" fill="#00f2ff" fontSize="7" fontWeight="950" className="uppercase tracking-[0.1em]">
                  DIGITAL
                </text>
            </svg>
        )}
    </div>
  </div>
);

const RobotMascot = () => (
  <div className="relative w-16 h-16 mb-[-10px] z-50 animate-float opacity-90">
    <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
      <ellipse cx="100" cy="185" rx="45" ry="8" fill="black" opacity="0.15" />
      <rect x="60" y="80" width="80" height="70" rx="18" fill="#1e1b4b" />
      <rect x="70" y="90" width="60" height="50" rx="12" fill="#4338ca" />
      <rect x="55" y="25" width="90" height="70" rx="30" fill="#1e1b4b" />
      <rect x="65" y="35" width="70" height="50" rx="20" fill="#020617" />
      <circle cx="85" cy="60" r="7" fill="#22d3ee" className="animate-pulse" />
      <circle cx="115" cy="60" r="7" fill="#22d3ee" className="animate-pulse" />
      <circle cx="100" cy="10" r="6" fill="#f43f5e" className="animate-bounce" />
    </svg>
  </div>
);

interface LoginProps {
  onParentAccess?: (nis: string) => boolean;
}

const Login: React.FC<LoginProps> = ({ onParentAccess }) => {
  const [activeTab, setActiveTab] = useState<'admin' | 'parent'>('admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [nis, setNis] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { generalSettings } = useData();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    setTimeout(() => {
      if (activeTab === 'admin') {
        const result = login(username, password);
        if (result.success) {
          // Context takes care of redirecting
        } else {
          if (result.error === 'username') {
            setError('Username Admin tidak terdaftar.');
          } else if (result.error === 'password') {
            setError('Security Key (Password) salah.');
          } else {
            setError('Akses ditolak. Silakan coba lagi.');
          }
        }
      } else {
        if (!nis.trim()) {
          setError('Silakan masukkan NIS.');
        } else if (onParentAccess?.(nis)) {
          // Context takes care of state
        } else {
          setError(`Data NIS "${nis}" tidak ditemukan.`);
        }
      }
      setIsLoading(false);
    }, 800);
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-end items-center p-4 font-sans relative overflow-hidden">
      
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-15px); } }
        .animate-float { animation: float 5s ease-in-out infinite; }
        .text-glow-neon { text-shadow: 0 0 15px #00f2ff, 0 0 30px #ff00ff; }
        .glass-dark { background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); }
      `}</style>

      <div className="absolute inset-0 z-0 opacity-[0.1]" style={{ backgroundImage: 'linear-gradient(#00f2ff 1px, transparent 1px), linear-gradient(90deg, #00f2ff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>

      <div className="glass-dark rounded-[3.5rem] shadow-[0_0_80px_rgba(0,0,0,0.6)] w-full max-w-sm animate-fade-in relative overflow-hidden flex flex-col z-10 mb-6 sm:mb-12">
        
        <div className="bg-gradient-to-b from-slate-900/60 to-transparent pt-14 pb-4 px-6 text-center relative overflow-hidden flex flex-col items-center justify-end">
            
            <CreativeLogo url={generalSettings.appLogoUrl} shortName={generalSettings.shortName} />
            <RobotMascot />

            <div className="relative z-20 flex flex-col items-center mt-8">
                <h1 className="text-4xl font-black tracking-[0.1em] leading-none text-white font-['Black_Ops_One'] mb-2 text-glow-neon">
                  HADIRKU<span className="text-cyan-400">{generalSettings.shortName}</span>
                </h1>
                <div className="flex items-center gap-3 mb-3">
                    <div className="h-[2px] w-8 bg-cyan-400 shadow-[0_0_8px_#00f2ff]"></div>
                    <span className="text-sm font-black tracking-[0.5em] text-cyan-400 uppercase italic">
                        E-ABSENCE
                    </span>
                    <div className="h-[2px] w-8 bg-cyan-400 shadow-[0_0_8px_#00f2ff]"></div>
                </div>
                <h3 className="text-xs font-bold tracking-[0.2em] text-white/40 uppercase">
                  {generalSettings.schoolName}
                </h3>
            </div>
        </div>

        <div className="flex p-2 bg-black/40 mx-8 rounded-2xl border border-white/5 mb-4">
            <button 
                onClick={() => {setActiveTab('admin'); setError('');}}
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'admin' ? 'bg-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(0,242,255,0.4)]' : 'text-white/30 hover:text-white'}`}
            >
                ADMIN ACCESS
            </button>
            <button 
                onClick={() => {setActiveTab('parent'); setError('');}}
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'parent' ? 'bg-lime-400 text-slate-950 shadow-[0_0_20px_rgba(204,255,0,0.4)]' : 'text-white/30 hover:text-white'}`}
            >
                PARENT PORTAL
            </button>
        </div>

        <div className="p-10 pt-4 pb-12">
            <form onSubmit={handleSubmit} className="space-y-6">
            {activeTab === 'admin' ? (
                <>
                <div>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <UserIcon className="h-5 w-5 text-white/20 group-focus-within:text-cyan-400 transition-colors" />
                        </div>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="block w-full pl-12 pr-4 py-4 border border-white/10 rounded-2xl focus:ring-2 focus:ring-cyan-400/20 focus:border-cyan-400 bg-black/30 backdrop-blur-md transition-all text-sm font-bold text-white placeholder-white/10"
                            placeholder="USERNAME"
                        />
                    </div>
                </div>

                <div>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <LockClosedIcon className="h-5 w-5 text-white/20 group-focus-within:text-cyan-400 transition-colors" />
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full pl-12 pr-4 py-4 border border-white/10 rounded-2xl focus:ring-2 focus:ring-cyan-400/20 focus:border-cyan-400 bg-black/30 backdrop-blur-md transition-all text-sm font-bold text-white placeholder-white/10"
                            placeholder="SECURITY KEY"
                        />
                    </div>
                </div>
                </>
            ) : (
                <div>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <IdentificationIcon className="h-5 w-5 text-white/20 group-focus-within:text-lime-400 transition-colors" />
                        </div>
                        <input
                            type="text"
                            value={nis}
                            onChange={(e) => setNis(e.target.value)}
                            className="block w-full pl-12 pr-4 py-4 border border-white/10 rounded-2xl focus:ring-2 focus:ring-lime-400/20 focus:border-lime-400 bg-black/30 backdrop-blur-md transition-all text-sm font-bold text-white placeholder-white/10"
                            placeholder="INPUT NIS / ROLL NUMBER"
                        />
                    </div>
                    <p className="text-[9px] font-bold text-white/20 uppercase mt-4 text-center tracking-[0.2em] leading-relaxed">Pantau riwayat kehadiran siswa secara real-time melalui portal orang tua.</p>
                </div>
            )}
            
            {error && <div className="text-rose-400 text-[10px] bg-rose-400/10 p-3 rounded-xl border border-rose-400/20 font-bold text-center animate-pulse">{error}</div>}

            <div className="space-y-6">
                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full flex justify-center items-center py-5 rounded-2xl shadow-2xl text-xs font-black tracking-[0.4em] text-slate-950 transition-all duration-300 transform active:scale-[0.96] ${activeTab === 'admin' ? 'bg-cyan-400 hover:bg-white' : 'bg-lime-400 hover:bg-white'}`}
                >
                    {isLoading ? 'VERIFYING...' : activeTab === 'admin' ? 'AUTHORIZE LOGIN' : 'ACCESS HISTORY'}
                </button>

                <div className="text-center space-y-1 overflow-hidden px-2 flex flex-col items-center">
                    <p className="text-[10px] font-black tracking-[0.4em] text-[#ff8a65] uppercase -mr-[0.4em]">
                        BRANDING SCHOOL
                    </p>
                    <h4 className="text-[28px] font-black tracking-[0.5em] text-cyan-400 uppercase -mr-[0.5em] leading-tight">
                        CREDIBLE
                    </h4>
                    <p className="text-[8px] sm:text-[8.5px] font-bold tracking-[0.12em] text-white/30 uppercase whitespace-nowrap leading-relaxed">
                        {generalSettings.tagline}
                    </p>
                </div>
            </div>
            </form>
        </div>

        <div className="bg-black/50 p-8 text-center border-t border-white/5 space-y-1">
            <p className="text-[9px] font-black text-white/30 tracking-[0.3em] uppercase">
                Digital Infrastructure
            </p>
            <p className="text-[8px] font-black text-white/20 tracking-[0.2em] uppercase">
                © SDN 4 KRONGGEN
            </p>
            <p className="text-[8px] font-black text-white/10 tracking-[0.2em] uppercase">
                2026
            </p>
            <div className="flex items-center justify-center gap-3 pt-3">
                <div className="h-[0.5px] w-8 bg-white/5"></div>
                <div className="w-1 h-1 rounded-full bg-cyan-400/10"></div>
                <div className="h-[0.5px] w-8 bg-white/5"></div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

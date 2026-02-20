
import React, { useState, useEffect } from 'react';
import { DataProvider, useData } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './components/Dashboard';
import StudentManagement from './components/StudentManagement';
import AttendanceScanner from './components/AttendanceScanner';
import AttendanceReport from './components/AttendanceReport';
import Settings from './components/Settings';
import Login from './components/Login';
import ParentDashboard from './components/ParentDashboard';
import { CameraIcon, UsersIcon, ChartBarIcon, HomeIcon, Cog6ToothIcon, ArrowLeftOnRectangleIcon, BellIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

type Page = 'dashboard' | 'students' | 'scanner' | 'reports' | 'settings';

const AppLogo = ({ url, shortName }: { url?: string, shortName?: string }) => {
  if (url) return <img src={url} className="w-full h-full object-contain rounded-lg" alt="App Logo" />;
  return (
    <div className="w-full h-full relative group">
      <style>{`
        @keyframes logo-4d-neon {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 10px #00f2ff); }
          50% { transform: scale(1.06); filter: drop-shadow(0 0 25px #ff00ff); }
        }
        .animate-logo-4d-neon { animation: logo-4d-neon 3s ease-in-out infinite; }
      `}</style>
      <svg viewBox="0 0 120 120" className="w-full h-full animate-logo-4d-neon">
        <defs>
          <linearGradient id="neon4DLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f2ff" />
            <stop offset="50%" stopColor="#ccff00" />
            <stop offset="100%" stopColor="#ff00ff" />
          </linearGradient>
        </defs>
        
        {/* Hex Shield Frame */}
        <path d="M60 10 L100 32 V88 L60 110 L20 88 V32 Z" fill="#020617" stroke="url(#neon4DLogoGrad)" strokeWidth="4" />
        
        {/* Isometric 4D Core */}
        <path d="M45 40 V75 H75 M68 40 V85" stroke="url(#neon4DLogoGrad)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M68 40 Q88 40 88 62 Q88 85 68 85" stroke="#00f2ff" strokeWidth="6" strokeLinecap="round" fill="none" />

        {/* Embedded DIGITAL badge */}
        <rect x="44" y="58" width="32" height="10" rx="2" fill="#020617" stroke="#ccff00" strokeWidth="0.5" />
        <text x="60" y="65" textAnchor="middle" fill="#00f2ff" fontSize="4" fontWeight="900" letterSpacing="0.2">DIGITAL</text>
      </svg>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const { generalSettings, students } = useData();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [parentStudentId, setParentStudentId] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleParentAccess = (nis: string) => {
    const student = students.find(s => s.rollNumber === nis);
    if (student) {
      setParentStudentId(student.id);
      return true;
    }
    return false;
  };

  if (parentStudentId) {
    return (
      <ParentDashboard 
        studentId={parentStudentId} 
        onLogout={() => setParentStudentId(null)} 
      />
    );
  }

  if (!isAuthenticated) return <Login onParentAccess={handleParentAccess} />;

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard setCurrentPage={setCurrentPage} />;
      case 'students': return <StudentManagement />;
      case 'scanner': return <AttendanceScanner />;
      case 'reports': return <AttendanceReport />;
      case 'settings': return <Settings />;
      default: return <Dashboard setCurrentPage={setCurrentPage} />;
    }
  };

  const NavItem = ({ page, label, icon }: { page: Page, label: string, icon: React.ReactNode }) => (
    <button
      onClick={() => setCurrentPage(page)}
      className={`group flex flex-col lg:flex-row items-center lg:gap-4 w-full p-3 lg:px-6 lg:py-4 transition-all duration-300 relative ${currentPage === page ? 'text-slate-950 lg:bg-slate-900/5 lg:rounded-2xl font-black' : 'text-slate-400 hover:text-slate-600'}`}
    >
      <div className={`transition-all duration-300 ${currentPage === page && !isDesktop ? 'bg-cyan-400 p-2.5 rounded-2xl text-slate-950 shadow-lg shadow-cyan-400/20 -translate-y-1' : 'group-hover:scale-110'}`}>
        {icon}
      </div>
      <span className="text-[9px] lg:text-[11px] uppercase tracking-[0.2em] mt-1.5 lg:mt-0 lg:font-bold">{label}</span>
      {currentPage === page && isDesktop && (
        <div className="hidden lg:block absolute left-0 w-1.5 h-6 bg-cyan-400 rounded-r-full shadow-[2px_0_10px_rgba(34,211,238,0.4)]"></div>
      )}
    </button>
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden font-sans">
      {/* Encryption Banner - Topmost Element */}
      <div className="bg-slate-950 py-1.5 flex items-center justify-center gap-2 border-b border-white/5 relative z-[60] shrink-0">
        <ShieldCheckIcon className="w-3 h-3 text-cyan-400 animate-pulse" />
        <span className="text-[8px] lg:text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 text-center">
          Encrypted System Management Portal
        </span>
      </div>

      <div className="flex flex-grow h-full bg-slate-50 text-slate-900 overflow-hidden relative">
        <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-cyan-500 rounded-full blur-[100px]"></div>
          <div className="absolute top-1/2 -right-24 w-80 h-80 bg-indigo-500 rounded-full blur-[100px]"></div>
        </div>

        {isDesktop && (
          <aside className="w-80 bg-white border-r border-slate-100 flex flex-col p-8 z-50 shadow-[20px_0_40px_rgba(0,0,0,0.01)] relative">
            <div className="flex items-center gap-4 mb-12 px-2">
              <div className="w-14 h-14 bg-slate-900 rounded-[1.2rem] p-2 shadow-2xl shadow-indigo-950/20 transform hover:rotate-6 transition-transform">
                <AppLogo url={generalSettings.appLogoUrl} shortName={generalSettings.shortName} />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tighter leading-none text-slate-900 uppercase">HADIRKU <span className="text-cyan-500">{generalSettings.shortName}</span></h1>
                <p className="text-[9px] font-black text-slate-400 tracking-[0.3em] uppercase mt-1">Digital Portal</p>
              </div>
            </div>

            <nav className="flex-grow space-y-2">
              <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-6 mb-4">Main Menu</div>
              <NavItem page="dashboard" label="Beranda" icon={<HomeIcon className="w-6 h-6" />} />
              <NavItem page="students" label="Database" icon={<UsersIcon className="w-6 h-6" />} />
              <NavItem page="scanner" label="Scan Absensi" icon={<CameraIcon className="w-6 h-6" />} />
              <NavItem page="reports" label="Laporan" icon={<ChartBarIcon className="w-6 h-6" />} />
              
              <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-6 mt-10 mb-4">Preference</div>
              <NavItem page="settings" label="System" icon={<Cog6ToothIcon className="w-6 h-6" />} />
            </nav>

            <div className="mt-auto space-y-4">
              <button onClick={() => logout()} className="flex items-center gap-4 w-full p-5 rounded-2xl text-slate-400 hover:text-rose-500 hover:bg-rose-50/50 transition-all font-black text-xs uppercase tracking-[0.2em] border border-transparent hover:border-rose-100">
                <ArrowLeftOnRectangleIcon className="w-6 h-6" /> Keluar
              </button>
            </div>
          </aside>
        )}

        <div className="flex-grow flex flex-col overflow-hidden relative z-10">
          <header className="px-6 py-5 lg:px-12 lg:py-8 flex justify-between items-center bg-white/50 backdrop-blur-md lg:bg-transparent border-b border-slate-100 lg:border-none">
            <div>
              {!isDesktop && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-900 rounded-xl p-1.5 shadow-xl">
                    <AppLogo url={generalSettings.appLogoUrl} shortName={generalSettings.shortName} />
                  </div>
                  <div>
                      <h2 className="text-[15px] font-black text-slate-900 leading-none">HADIRKU {generalSettings.shortName}</h2>
                      <p className="text-[8px] font-black text-cyan-500 tracking-[0.2em] uppercase">E-Absence Mobile</p>
                  </div>
                </div>
              )}
              {isDesktop && (
                <div className="animate-fade-in">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight capitalize">{currentPage} Panel</h2>
                    <p className="text-sm font-medium text-slate-400 mt-1">Managing {generalSettings.schoolName} digital presence.</p>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <button className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 hover:text-cyan-500 transition-all relative">
                  <BellIcon className="w-6 h-6" />
                  <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
              </button>
              {!isDesktop && (
                <button onClick={() => logout()} className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 border border-rose-100 shadow-sm">
                    <ArrowLeftOnRectangleIcon className="w-6 h-6" />
                </button>
              )}
            </div>
          </header>

          <main className="flex-grow overflow-y-auto p-4 lg:p-12 lg:pt-0 scrollbar-hide">
            <div className="max-w-6xl mx-auto animate-fade-in-up">
              {renderPage()}
            </div>
          </main>

          {!isDesktop && (
            <div className="px-4 pb-6 absolute bottom-0 left-0 right-0 z-50">
              <nav className="bg-white/90 backdrop-blur-2xl border border-slate-200/50 px-6 flex justify-between items-center h-20 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
                  <NavItem page="dashboard" label="Home" icon={<HomeIcon className="w-6 h-6" />} />
                  <NavItem page="students" label="Siswa" icon={<UsersIcon className="w-6 h-6" />} />
                  
                  <div className="relative -top-10">
                    <button 
                      onClick={() => setCurrentPage('scanner')} 
                      className="flex items-center justify-center w-18 h-18 bg-slate-900 rounded-[2rem] shadow-2xl shadow-slate-400 border-[6px] border-white transform active:scale-90 transition-transform group"
                    >
                      <CameraIcon className="w-8 h-8 text-cyan-400 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>

                  <NavItem page="reports" label="Report" icon={<ChartBarIcon className="w-6 h-6" />} />
                  <NavItem page="settings" label="System" icon={<Cog6ToothIcon className="w-6 h-6" />} />
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <DataProvider>
      <AppContent />
    </DataProvider>
  </AuthProvider>
);

export default App;

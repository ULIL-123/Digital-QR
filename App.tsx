import React, { useState, useEffect, useRef } from 'react';
import { DataProvider, useData } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './components/Dashboard';
import StudentManagement from './components/StudentManagement';
import AttendanceScanner from './components/AttendanceScanner';
import AttendanceReport from './components/AttendanceReport';
import Settings from './components/Settings';
import Login from './components/Login';
import ParentDashboard from './components/ParentDashboard';
import { 
  CameraIcon, 
  UsersIcon, 
  ChartBarIcon, 
  HomeIcon, 
  Cog6ToothIcon, 
  ArrowLeftOnRectangleIcon, 
  BellIcon, 
  ShieldCheckIcon, 
  CloudArrowUpIcon, 
  ArrowPathIcon, 
  ChevronLeftIcon,
  ChevronRightIcon,
  Bars3BottomLeftIcon,
  PowerIcon
} from '@heroicons/react/24/outline';

type Page = 'dashboard' | 'students' | 'scanner' | 'reports' | 'settings';

const AppLogo = ({ url, shortName }: { url?: string, shortName?: string }) => {
  if (url) return <img src={url} className="w-full h-full object-contain rounded-lg shadow-sm" alt="Logo" />;
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
        
        <path d="M60 10 L100 32 V88 L60 110 L20 88 V32 Z" fill="#020617" stroke="url(#neon4DLogoGrad)" strokeWidth="4" />
        <path d="M45 40 V75 H75 M68 40 V85" stroke="url(#neon4DLogoGrad)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M68 40 Q88 40 88 62 Q88 85 68 85" stroke="#00f2ff" strokeWidth="6" strokeLinecap="round" fill="none" />
        <rect x="44" y="58" width="32" height="10" rx="2" fill="#020617" stroke="#ccff00" strokeWidth="0.5" />
        <text x="60" y="65" textAnchor="middle" fill="#00f2ff" fontSize="4" fontWeight="900" letterSpacing="0.2">DIGITAL</text>
      </svg>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const { generalSettings, students, isSyncing, unsyncedCount } = useData();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [parentStudentId, setParentStudentId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('resize', handleResize);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
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

  const NavItem = ({ page, label, icon, activeColor }: { page: Page, label: string, icon: React.ReactNode, activeColor: string }) => (
    <button
      onClick={() => setCurrentPage(page)}
      className={`group flex flex-col lg:flex-row items-center lg:gap-4 w-full p-3 lg:px-4 lg:py-4 transition-all duration-300 relative ${
        currentPage === page 
          ? `text-slate-950 lg:bg-white lg:shadow-md lg:rounded-2xl font-black` 
          : 'text-slate-400 hover:text-slate-600'
      }`}
    >
      <div className={`transition-all duration-300 ${
        currentPage === page 
          ? `${activeColor} p-2.5 rounded-2xl text-white shadow-lg -translate-y-1` 
          : 'group-hover:scale-110'
      }`}>
        {icon}
      </div>
      {!isSidebarCollapsed && (
        <span className="text-[9px] lg:text-[11px] uppercase tracking-[0.2em] mt-1.5 lg:mt-0 lg:font-bold whitespace-nowrap animate-fade-in">
          {label}
        </span>
      )}
      {currentPage === page && isDesktop && !isSidebarCollapsed && (
        <div className={`hidden lg:block absolute left-0 w-1.5 h-6 ${activeColor} rounded-r-full`}></div>
      )}
    </button>
  );

  return (
    <div className="flex flex-col h-dvh min-h-dvh overflow-hidden font-sans">
      <div className="bg-slate-950 py-1.5 flex items-center justify-center gap-4 border-b border-white/5 relative z-[60] shrink-0 overflow-hidden no-print">
        <div className="flex items-center gap-2">
            <ShieldCheckIcon className="w-3 h-3 text-neon-blue animate-pulse" />
            <span className="text-[8px] lg:text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 text-center">
              Encrypted System Management Portal
            </span>
        </div>
        
        <div className="hidden sm:flex items-center gap-3 px-3 py-0.5 bg-white/5 rounded-full border border-white/10 ml-4">
             {isSyncing ? (
                 <div className="flex items-center gap-2">
                     <ArrowPathIcon className="w-2.5 h-2.5 text-neon-blue animate-spin" />
                     <span className="text-[8px] font-black text-neon-blue uppercase tracking-widest">Syncing Data...</span>
                 </div>
             ) : (
                 <div className="flex items-center gap-2">
                     <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`}></div>
                     <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{isOnline ? 'Connected' : 'Offline Mode'}</span>
                 </div>
             )}
             
             {unsyncedCount > 0 && (
                 <div className="flex items-center gap-1.5 pl-2 border-l border-white/10">
                     <CloudArrowUpIcon className="w-2.5 h-2.5 text-amber-500" />
                     <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">{unsyncedCount} Pending</span>
                 </div>
             )}
        </div>
      </div>

      <div className="flex flex-grow h-full bg-slate-50 text-slate-900 overflow-hidden relative print:block">
        <div className="fixed inset-0 pointer-events-none opacity-[0.05] z-0 overflow-hidden no-print">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-neon-blue rounded-full blur-[100px]"></div>
          <div className="absolute top-1/2 -right-24 w-80 h-80 bg-neon-pink rounded-full blur-[100px]"></div>
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-neon-green rounded-full blur-[100px]"></div>
        </div>

        {isDesktop && (
          <aside className={`${isSidebarCollapsed ? 'w-24' : 'w-72'} bg-white border-r border-slate-100 flex flex-col p-6 z-50 shadow-xl transition-all duration-500 ease-in-out relative overflow-hidden no-print`}>
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="absolute top-6 -right-3 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-neon-blue transition-colors z-[60]"
              title={isSidebarCollapsed ? "Show Bar" : "Hide Bar"}
            >
              {isSidebarCollapsed ? <ChevronRightIcon className="w-4 h-4" /> : <ChevronLeftIcon className="w-4 h-4" />}
            </button>

            <div className={`flex items-center gap-4 mb-10 px-2 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
              <div className="w-12 h-12 bg-slate-900 rounded-2xl p-2 shadow-xl shrink-0">
                <AppLogo url={generalSettings.appLogoUrl} shortName={generalSettings.shortName} />
              </div>
              {!isSidebarCollapsed && (
                <div className="animate-fade-in overflow-hidden">
                  <h1 className="text-base font-black tracking-tighter leading-none text-slate-900 uppercase">HADIRKU <span className="text-neon-blue">{generalSettings.shortName}</span></h1>
                  <p className="text-[8px] font-black text-slate-400 tracking-[0.2em] uppercase mt-1">Digital Portal</p>
                </div>
              )}
            </div>

            <nav className="flex-grow space-y-4">
              <div className={`text-[9px] font-black text-slate-300 uppercase tracking-widest mb-4 ${isSidebarCollapsed ? 'text-center' : 'px-4'}`}>
                {isSidebarCollapsed ? '•••' : 'Main Menu'}
              </div>
              
              <NavItem page="dashboard" label="Beranda" icon={<HomeIcon className="w-6 h-6" />} activeColor="bg-blue-500" />
              <NavItem page="students" label="Database" icon={<UsersIcon className="w-6 h-6" />} activeColor="bg-emerald-500" />
              <NavItem page="scanner" label="Scan Absensi" icon={<CameraIcon className="w-6 h-6" />} activeColor="bg-rose-500" />
              <NavItem page="reports" label="Laporan" icon={<ChartBarIcon className="w-6 h-6" />} activeColor="bg-amber-500" />
              
              <div className={`text-[9px] font-black text-slate-300 uppercase tracking-widest mt-10 mb-4 ${isSidebarCollapsed ? 'text-center' : 'px-4'}`}>
                {isSidebarCollapsed ? '•••' : 'Preference'}
              </div>
              <NavItem page="settings" label="System" icon={<Cog6ToothIcon className="w-6 h-6" />} activeColor="bg-purple-500" />
            </nav>

            <div className="mt-auto pt-6 border-t border-slate-50">
              <button 
                onClick={() => logout()} 
                className={`group flex items-center gap-4 w-full p-4 rounded-2xl transition-all duration-300 font-black text-[10px] uppercase tracking-widest ${isSidebarCollapsed ? 'justify-center' : ''} text-rose-400 hover:text-white hover:bg-rose-500 hover:shadow-lg hover:shadow-rose-500/20 active:scale-95`}
              >
                <div className="p-1 rounded-lg group-hover:rotate-12 transition-transform">
                  <PowerIcon className="w-6 h-6" />
                </div>
                {!isSidebarCollapsed && <span className="animate-fade-in">EXIT SYSTEM</span>}
              </button>
              
              {!isSidebarCollapsed && (
                <div className="mt-4 text-center animate-fade-in">
                  <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em]">© SDN 4 KRONGGEN</p>
                </div>
              )}
            </div>
          </aside>
        )}

        <div className="flex-grow flex flex-col overflow-hidden relative z-10 print:block">
          <header className="px-6 py-4 lg:px-10 lg:py-6 flex justify-between items-center bg-white/70 backdrop-blur-xl border-b border-slate-100 shadow-sm no-print">
            <div>
              {!isDesktop && (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-slate-900 rounded-xl p-1.5 shadow-xl">
                    <AppLogo url={generalSettings.appLogoUrl} shortName={generalSettings.shortName} />
                  </div>
                  <div>
                      <h2 className="text-[15px] font-black text-slate-900 leading-none">HADIRKU {generalSettings.shortName}</h2>
                      <p className="text-[7px] font-black text-neon-blue tracking-[0.2em] uppercase">E-Absence Mobile</p>
                  </div>
                </div>
              )}
              {isDesktop && (
                <div className="animate-fade-in flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-xl">
                      <Bars3BottomLeftIcon className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900 tracking-tight capitalize leading-none">{currentPage} Panel</h2>
                      <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-1">Digital Infrastructure</p>
                    </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              {isDesktop && (unsyncedCount > 0 || isSyncing) && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100 shadow-sm animate-fade-in">
                      {isSyncing ? (
                          <ArrowPathIcon className="w-4 h-4 text-neon-blue animate-spin" />
                      ) : (
                          <CloudArrowUpIcon className="w-4 h-4 text-amber-500" />
                      )}
                      <div className="text-left hidden sm:block">
                          <p className="text-[8px] font-black text-slate-900 uppercase leading-none">{isSyncing ? 'Syncing' : 'Offline'}</p>
                          <p className="text-[7px] font-bold text-slate-400 uppercase leading-none mt-1">{unsyncedCount} records</p>
                      </div>
                  </div>
              )}

              {isDesktop && (
                <button 
                  onClick={() => logout()}
                  className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 border border-rose-100 shadow-sm flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all transform hover:scale-110 active:scale-90 group"
                  title="Logout / Exit"
                >
                  <ArrowLeftOnRectangleIcon className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                </button>
              )}

              <button className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 hover:text-neon-blue transition-all relative group">
                  <BellIcon className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-neon-pink rounded-full border-2 border-white animate-pulse"></span>
              </button>
              
              {!isDesktop && (
                <button onClick={() => logout()} className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 border border-rose-100 shadow-sm animate-pulse-fast">
                    <PowerIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          </header>

          <main className="flex-grow overflow-y-auto p-4 lg:p-8 scrollbar-hide print:overflow-visible print:p-0 relative">
            <div className="max-w-6xl mx-auto animate-fade-in-up print:max-w-none print:transform-none pb-24 lg:pb-8">
              {renderPage()}
            </div>
          </main>

          {!isDesktop && (
            <div className="px-4 pb-6 absolute bottom-0 left-0 right-0 z-50 no-print">
              <nav className="bg-white/90 backdrop-blur-2xl border border-slate-200/50 px-6 flex justify-between items-center h-18 rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.1)]">
                  <NavItem page="dashboard" label="Home" icon={<HomeIcon className="w-5 h-5" />} activeColor="bg-blue-500" />
                  <NavItem page="students" label="Siswa" icon={<UsersIcon className="w-5 h-5" />} activeColor="bg-emerald-500" />
                  
                  <div className="relative -top-6">
                    <button 
                      onClick={() => setCurrentPage('scanner')} 
                      className="flex items-center justify-center w-14 h-14 bg-slate-900 rounded-2xl shadow-2xl border-4 border-white transform active:scale-90 transition-transform group"
                    >
                      <CameraIcon className="w-6 h-6 text-neon-blue group-hover:scale-110 transition-transform" />
                    </button>
                  </div>

                  <NavItem page="reports" label="Report" icon={<ChartBarIcon className="w-5 h-5" />} activeColor="bg-amber-500" />
                  <NavItem page="settings" label="System" icon={<Cog6ToothIcon className="w-5 h-5" />} activeColor="bg-purple-500" />
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

import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowDownTrayIcon, 
  ArrowUpTrayIcon,
  CloudArrowUpIcon, 
  TrashIcon, 
  ShieldCheckIcon, 
  IdentificationIcon, 
  PhotoIcon, 
  ChatBubbleLeftRightIcon, 
  PaperAirplaneIcon, 
  EyeIcon, 
  EyeSlashIcon, 
  LockClosedIcon, 
  SparklesIcon, 
  MegaphoneIcon, 
  PrinterIcon, 
  PaintBrushIcon, 
  UserGroupIcon,
  CircleStackIcon,
  ArrowPathIcon,
  BuildingLibraryIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ServerStackIcon,
  ArrowDownCircleIcon,
  ArrowUpCircleIcon,
  GlobeAltIcon,
  AcademicCapIcon,
  RectangleGroupIcon,
  LinkIcon,
  CpuChipIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { Teacher } from '../types';

const Settings: React.FC = () => {
  const { 
    apiConfig, setApiConfig,
    generalSettings, setGeneralSettings, 
    exportDatabase, importDatabase, 
    backupToCloud, restoreFromCloud,
    syncToHub, pullFromHub,
    backupToDrive, restoreFromDrive,
    clearAllAttendance, testNotification, 
    sendAnnouncement
  } = useData();
  const { updateCredentials } = useAuth();
  
  // School Info State
  const [schoolName, setSchoolName] = useState(generalSettings.schoolName);
  const [tagline, setTagline] = useState(generalSettings.tagline);
  const [schoolLogoUrl, setSchoolLogoUrl] = useState(generalSettings.schoolLogoUrl);
  const [appLogoUrl, setAppLogoUrl] = useState(generalSettings.appLogoUrl);
  const [govtLogoUrl, setGovtLogoUrl] = useState(generalSettings.govtLogoUrl);

  const [principalName, setPrincipalName] = useState(generalSettings.principalName || '');
  const [principalNip, setPrincipalNip] = useState(generalSettings.principalNip || '');
  
  const [teacher1, setTeacher1] = useState<Teacher>(generalSettings.teacher1 || { name: '', nip: '' });
  const [teacher2, setTeacher2] = useState<Teacher>(generalSettings.teacher2 || { name: '', nip: '' });
  const [teacher3, setTeacher3] = useState<Teacher>(generalSettings.teacher3 || { name: '', nip: '' });
  const [teacher4, setTeacher4] = useState<Teacher>(generalSettings.teacher4 || { name: '', nip: '' });
  const [teacher5, setTeacher5] = useState<Teacher>(generalSettings.teacher5 || { name: '', nip: '' });
  const [teacher6, setTeacher6] = useState<Teacher>(generalSettings.teacher6 || { name: '', nip: '' });
  const [teacher7, setTeacher7] = useState<Teacher>(generalSettings.teacher7 || { name: '', nip: '' });
  const [teacher8, setTeacher8] = useState<Teacher>(generalSettings.teacher8 || { name: '', nip: '' });
  const [teacher9, setTeacher9] = useState<Teacher>(generalSettings.teacher9 || { name: '', nip: '' });
  const [teacher10, setTeacher10] = useState<Teacher>(generalSettings.teacher10 || { name: '', nip: '' });

  // Cloud State
  const [cloudUrl, setCloudUrl] = useState(apiConfig.baseUrl);
  const [cloudApiKey, setCloudApiKey] = useState(apiConfig.apiKey || '');
  const [isCloudLoading, setIsCloudLoading] = useState(false);

  // CloudDatabaseHub State
  const [hubUrl, setHubUrl] = useState(apiConfig.hubUrl || 'https://hub.hadirku-digital.com');
  const [hubToken, setHubToken] = useState(apiConfig.hubToken || '');
  const [autoHubSync, setAutoHubSync] = useState(apiConfig.autoHubSync || false);
  const [isHubLoading, setIsHubLoading] = useState(false);

  // Google Drive State
  const [googleClientId, setGoogleClientId] = useState(localStorage.getItem('google_drive_client_id') || '');
  const [googleApiKey, setGoogleApiKey] = useState(localStorage.getItem('google_drive_api_key') || '');
  const [isDriveLoading, setIsDriveLoading] = useState(false);

  // Gateway Notification State
  const [autoNotify, setAutoNotify] = useState(generalSettings.notifications?.autoNotify ?? false);
  const [notifyMethod, setNotifyMethod] = useState(generalSettings.notifications?.method ?? 'WhatsApp');
  const [waApiKey, setWaApiKey] = useState(generalSettings.notifications?.apiKey ?? '');
  const [waEndpoint, setWaEndpoint] = useState(generalSettings.notifications?.apiEndpoint ?? 'https://api.fonnte.com/send');
  const [showWaApiKey, setShowWaApiKey] = useState(false);

  // Printer State
  const [autoPrintSlip, setAutoPrintSlip] = useState(generalSettings.printer?.autoPrintSlip ?? false);
  const [slipTitle, setSlipTitle] = useState(generalSettings.printer?.slipTitle ?? 'BUKTI PRESENSI SISWA');
  const [printerType, setPrinterType] = useState(generalSettings.printer?.printerType ?? 'standard');

  // Time Settings State
  const [startAttendance, setStartAttendance] = useState(generalSettings.timeSettings?.startAttendance ?? '06:30');
  const [onTimeEnd, setOnTimeEnd] = useState(generalSettings.timeSettings?.onTimeEnd ?? '07:15');
  const [lateEndLimit, setLateEndLimit] = useState(generalSettings.timeSettings?.lateEndLimit ?? '09:00');
  const [returnEarlyStart, setReturnEarlyStart] = useState(generalSettings.timeSettings?.returnEarlyStart ?? '09:00');
  const [returnLimit, setReturnLimit] = useState(generalSettings.timeSettings?.returnLimit ?? '17:00');
  const [onTimePulangStart, setOnTimePulangStart] = useState(generalSettings.timeSettings?.onTimePulangStart ?? '12:10');
  const [onTimePulangStartClass12, setOnTimePulangStartClass12] = useState(generalSettings.timeSettings?.onTimePulangStartClass12 ?? '10:45');

  const [announcementMsg, setAnnouncementMsg] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [testStatus, setTestStatus] = useState<{status: 'idle' | 'loading' | 'success' | 'error', message: string}>({status: 'idle', message: ''});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const schoolLogoInputRef = useRef<HTMLInputElement>(null);
  const appLogoInputRef = useRef<HTMLInputElement>(null);
  const govtLogoInputRef = useRef<HTMLInputElement>(null);
  const teacherListRef = useRef<HTMLDivElement>(null);

  // SYNC EFFECT
  useEffect(() => {
    setSchoolName(generalSettings.schoolName);
    setTagline(generalSettings.tagline);
    setSchoolLogoUrl(generalSettings.schoolLogoUrl);
    setAppLogoUrl(generalSettings.appLogoUrl);
    setGovtLogoUrl(generalSettings.govtLogoUrl);
    setPrincipalName(generalSettings.principalName || '');
    setPrincipalNip(generalSettings.principalNip || '');
    setTeacher1(generalSettings.teacher1 || { name: '', nip: '' });
    setTeacher2(generalSettings.teacher2 || { name: '', nip: '' });
    setTeacher3(generalSettings.teacher3 || { name: '', nip: '' });
    setTeacher4(generalSettings.teacher4 || { name: '', nip: '' });
    setTeacher5(generalSettings.teacher5 || { name: '', nip: '' });
    setTeacher6(generalSettings.teacher6 || { name: '', nip: '' });
    setTeacher7(generalSettings.teacher7 || { name: '', nip: '' });
    setTeacher8(generalSettings.teacher8 || { name: '', nip: '' });
    setTeacher9(generalSettings.teacher9 || { name: '', nip: '' });
    setTeacher10(generalSettings.teacher10 || { name: '', nip: '' });
    
    // Notifications Sync
    setAutoNotify(generalSettings.notifications?.autoNotify ?? false);
    setNotifyMethod(generalSettings.notifications?.method ?? 'WhatsApp');
    setWaApiKey(generalSettings.notifications?.apiKey ?? '');
    setWaEndpoint(generalSettings.notifications?.apiEndpoint ?? 'https://api.fonnte.com/send');
    
    // Printer Sync
    setAutoPrintSlip(generalSettings.printer?.autoPrintSlip ?? false);
    setSlipTitle(generalSettings.printer?.slipTitle ?? 'BUKTI PRESENSI SISWA');
    setPrinterType(generalSettings.printer?.printerType ?? 'standard');

    // Time Settings Sync
    setStartAttendance(generalSettings.timeSettings?.startAttendance ?? '06:30');
    setOnTimeEnd(generalSettings.timeSettings?.onTimeEnd ?? '07:15');
    setLateEndLimit(generalSettings.timeSettings?.lateEndLimit ?? '09:00');
    setReturnEarlyStart(generalSettings.timeSettings?.returnEarlyStart ?? '09:00');
    setReturnLimit(generalSettings.timeSettings?.returnLimit ?? '17:00');
    setOnTimePulangStart(generalSettings.timeSettings?.onTimePulangStart ?? '12:10');
    setOnTimePulangStartClass12(generalSettings.timeSettings?.onTimePulangStartClass12 ?? '10:45');
  }, [generalSettings]);

  const saveAllSettings = (sectionLabel?: string) => {
    setGeneralSettings({
      ...generalSettings,
      schoolName,
      tagline,
      schoolLogoUrl,
      appLogoUrl,
      govtLogoUrl,
      principalName,
      principalNip,
      teacher1,
      teacher2,
      teacher3,
      teacher4,
      teacher5,
      teacher6,
      teacher7,
      teacher8,
      teacher9,
      teacher10,
      notifications: {
        autoNotify,
        method: notifyMethod,
        apiKey: waApiKey.trim(),
        apiEndpoint: waEndpoint.trim()
      },
      printer: {
        ...generalSettings.printer,
        autoPrintSlip,
        slipTitle,
        printerType: printerType as 'standard' | 'thermal'
      },
      timeSettings: {
        startAttendance,
        onTimeEnd,
        lateEndLimit,
        returnEarlyStart,
        returnLimit,
        onTimePulangStart,
        onTimePulangStartClass12
      }
    });

    setApiConfig({
      ...apiConfig,
      baseUrl: cloudUrl,
      apiKey: cloudApiKey,
      hubUrl: hubUrl,
      hubToken: hubToken,
      autoHubSync: autoHubSync
    });
    
    localStorage.setItem('google_drive_client_id', googleClientId);
    localStorage.setItem('google_drive_api_key', googleApiKey);

    alert(`Berhasil! Pengaturan ${sectionLabel || 'Sistem'} telah diperbarui.`);
  };

  const handlePushCloud = async () => {
    if (!window.confirm("Kirim seluruh database ke Cloud (APK Sync)?")) return;
    setIsCloudLoading(true);
    const result = await backupToCloud();
    setIsCloudLoading(false);
    alert(result.message);
  };

  const handlePullCloud = async () => {
    if (!window.confirm("Ambil data dari Cloud? Data lokal akan tertimpa.")) return;
    setIsCloudLoading(true);
    const result = await restoreFromCloud();
    setIsCloudLoading(false);
    alert(result.message);
  };

  const handleHubSync = async () => {
    if (!hubToken) return alert("Masukkan Hub Access Token terlebih dahulu.");
    setIsHubLoading(true);
    const result = await syncToHub();
    setIsHubLoading(false);
    alert(result.message);
  };

  const handleHubPull = async () => {
    if (!hubToken) return alert("Masukkan Hub Access Token terlebih dahulu.");
    if (!window.confirm("Ambil data dari Hub? Data lokal akan diganti.")) return;
    setIsHubLoading(true);
    const result = await pullFromHub();
    setIsHubLoading(false);
    alert(result.message);
  };

  const handlePushDrive = async () => {
    if (!googleClientId || !googleApiKey) return alert("Mohon lengkapi Client ID dan API Key Google Drive.");
    setIsDriveLoading(true);
    const result = await backupToDrive(googleClientId, googleApiKey);
    setIsDriveLoading(false);
    alert(result.message);
  };

  const handlePullDrive = async () => {
    if (!googleClientId || !googleApiKey) return alert("Mohon lengkapi Client ID dan API Key Google Drive.");
    if (!window.confirm("Restore data dari Google Drive? Data saat ini akan digantikan.")) return;
    setIsDriveLoading(true);
    const result = await restoreFromDrive(googleClientId, googleApiKey);
    setIsDriveLoading(false);
    alert(result.message);
  };

  const handleTestGateway = async () => {
    if (!waApiKey) return alert("Masukkan API Key/Token terlebih dahulu.");
    setTestStatus({ status: 'loading', message: 'Mencoba Koneksi...' });
    const result = await testNotification(notifyMethod, { apiKey: waApiKey, endpoint: waEndpoint });
    
    if (result.success) {
      setTestStatus({ status: 'success', message: result.message });
    } else {
      setTestStatus({ status: 'error', message: result.message });
      alert("Test Gagal: " + result.message);
    }

    setTimeout(() => setTestStatus({ status: 'idle', message: '' }), 3000);
  };

  const handleBroadcast = async () => {
    if (!announcementMsg.trim()) return alert("Masukkan isi pengumuman terlebih dahulu.");
    if (!window.confirm("Kirim pengumuman ini ke SELURUH orang tua siswa melalui WhatsApp?")) return;
    
    setIsBroadcasting(true);
    try {
      const result = await sendAnnouncement(announcementMsg);
      alert(`Broadcast Selesai!\nBerhasil: ${result.success}\nGagal: ${result.fail}`);
      setAnnouncementMsg('');
    } catch (err) {
      alert("Terjadi kesalahan saat mengirim broadcast.");
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (importDatabase(content)) {
          alert("Database berhasil dipulihkan!");
        } else {
          alert("File tidak valid.");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'school' | 'app' | 'govt') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (type === 'school') setSchoolLogoUrl(base64);
        else if (type === 'app') setAppLogoUrl(base64);
        else setGovtLogoUrl(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = (type: 'school' | 'app' | 'govt') => {
    const label = type === 'school' ? 'Logo Sekolah' : type === 'app' ? 'Ikon Aplikasi' : 'Logo Pemerintah';
    if (window.confirm(`Hapus ${label} kustom dan kembali ke setelan awal sistem?`)) {
      if (type === 'school') setSchoolLogoUrl(undefined);
      else if (type === 'app') setAppLogoUrl(undefined);
      else setGovtLogoUrl(undefined);
    }
  };

  const TeacherItem = ({ index, data, onChange }: { index: number, data: Teacher, onChange: (val: Teacher) => void }) => (
    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
        <div className="flex items-center gap-2 mb-1">
            <div className="w-5 h-5 bg-indigo-500 text-white rounded-full flex items-center justify-center text-[8px] font-black">{index}</div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Guru Kelas / Mata Pelajaran</span>
        </div>
        <input 
            type="text" 
            value={data.name} 
            onChange={e => onChange({ ...data, name: e.target.value })} 
            className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold outline-none focus:border-indigo-400" 
            placeholder="Nama Lengkap & Gelar" 
        />
        <input 
            type="text" 
            value={data.nip} 
            onChange={e => onChange({ ...data, nip: e.target.value })} 
            className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-mono font-bold outline-none focus:border-indigo-400" 
            placeholder="NIP (Opsional)" 
        />
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-up pb-32">
      <style>{`
        .setting-card-3d {
          transition: transform 0.4s ease, box-shadow 0.4s ease;
          transform-style: preserve-3d;
        }
        .setting-card-3d:hover {
          transform: translateY(-5px) rotateX(1deg);
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1);
        }
        .neon-border-indigo { border-color: rgba(99, 102, 241, 0.3); }
        .neon-glow-cyan { filter: drop-shadow(0 0 8px rgba(34, 211, 238, 0.4)); }
      `}</style>

      <div className="space-y-8">
        {/* Personnel Management */}
        <div className="bg-white p-8 lg:p-10 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col h-fit setting-card-3d">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                        <IdentificationIcon className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Manajemen Personel</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kepala Sekolah & 10 Guru</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => teacherListRef.current?.scrollBy({ top: -200, behavior: 'smooth' })} className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-indigo-500 hover:text-white transition-all"><ChevronUpIcon className="w-4 h-4" /></button>
                    <button onClick={() => teacherListRef.current?.scrollBy({ top: 200, behavior: 'smooth' })} className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-indigo-500 hover:text-white transition-all"><ChevronDownIcon className="w-4 h-4" /></button>
                </div>
            </div>

            <div className="space-y-6">
                <div className="p-6 bg-slate-900 rounded-[2.5rem] text-white space-y-4 shadow-xl shadow-slate-200">
                    <div className="flex items-center gap-3">
                        <AcademicCapIcon className="w-5 h-5 text-cyan-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Kepala Sekolah</span>
                    </div>
                    <div className="space-y-3">
                        <input 
                            type="text" 
                            value={principalName} 
                            onChange={e => setPrincipalName(e.target.value)} 
                            className="w-full bg-white/10 border border-white/10 rounded-xl p-3 text-sm font-bold placeholder:text-white/20 outline-none focus:border-cyan-400 transition-all" 
                            placeholder="Nama Kepala Sekolah" 
                        />
                        <input 
                            type="text" 
                            value={principalNip} 
                            onChange={e => setPrincipalNip(e.target.value)} 
                            className="w-full bg-white/10 border border-white/10 rounded-xl p-3 text-xs font-mono font-bold placeholder:text-white/20 outline-none focus:border-cyan-400 transition-all" 
                            placeholder="NIP Kepala Sekolah" 
                        />
                    </div>
                </div>

                <div 
                    ref={teacherListRef}
                    className="space-y-4 max-h-[400px] overflow-y-auto scrollbar-hide pr-2"
                >
                    <TeacherItem index={1} data={teacher1} onChange={setTeacher1} />
                    <TeacherItem index={2} data={teacher2} onChange={setTeacher2} />
                    <TeacherItem index={3} data={teacher3} onChange={setTeacher3} />
                    <TeacherItem index={4} data={teacher4} onChange={setTeacher4} />
                    <TeacherItem index={5} data={teacher5} onChange={setTeacher5} />
                    <TeacherItem index={6} data={teacher6} onChange={setTeacher6} />
                    <TeacherItem index={7} data={teacher7} onChange={setTeacher7} />
                    <TeacherItem index={8} data={teacher8} onChange={setTeacher8} />
                    <TeacherItem index={9} data={teacher9} onChange={setTeacher9} />
                    <TeacherItem index={10} data={teacher10} onChange={setTeacher10} />
                </div>
            </div>
            
            <button onClick={() => saveAllSettings('Data Personel')} className="mt-8 w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-[0.98] shadow-lg">SIMPAN DATA PERSONEL</button>
        </div>

        {/* Data Vault Lokal - NEW BACKUP FEATURE */}
        <div className="bg-white p-8 lg:p-10 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col h-fit setting-card-3d relative overflow-hidden group">
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-indigo-50 rounded-full opacity-40"></div>
            <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-600 shadow-sm border border-slate-100">
                    <CircleStackIcon className="w-8 h-8" />
                </div>
                <div>
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Data Vault Lokal</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Offline Database Backup</p>
                </div>
            </div>

            <div className="space-y-4">
                <p className="text-[10px] font-medium text-slate-500 leading-relaxed uppercase tracking-tight mb-4">
                    Amankan data absensi Anda dengan mengunduh salinan database ke penyimpanan internal secara manual (.JSON).
                </p>

                <div className="grid grid-cols-1 gap-3">
                    <button 
                        onClick={exportDatabase}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-black transition-all active:scale-95 shadow-lg"
                    >
                        <ArrowDownTrayIcon className="w-5 h-5" /> DOWNLOAD BACKUP (.JSON)
                    </button>
                    
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-50 transition-all active:scale-95"
                    >
                        <ArrowUpTrayIcon className="w-5 h-5" /> PULIHKAN DARI FILE
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImportFile} />
                </div>

                <div className="pt-4 mt-2 border-t border-slate-50">
                    <button 
                        onClick={clearAllAttendance}
                        className="w-full py-3 bg-rose-50 text-rose-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                        <TrashIcon className="w-4 h-4" /> RESET LOG ABSENSI
                    </button>
                </div>
            </div>
        </div>

        {/* CloudDatabaseHub Feature Panel */}
        <div className="bg-slate-950 p-8 lg:p-10 rounded-[3rem] shadow-2xl border border-white/5 flex flex-col h-fit setting-card-3d relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-cyan-400 border border-white/10 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                    <ServerStackIcon className="w-8 h-8" />
                </div>
                <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">CloudDatabaseHub</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Centralized Database Infrastructure</p>
                </div>
            </div>

            <div className="space-y-6 mb-8">
                <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">HUB ENDPOINT URL</label>
                    <div className="relative">
                        <GlobeAltIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                        <input 
                            type="text" 
                            value={hubUrl} 
                            onChange={e => setHubUrl(e.target.value)} 
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-10 text-xs font-mono font-bold text-white outline-none focus:border-cyan-400 transition-all" 
                            placeholder="https://hub.hadirku-digital.com" 
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">HUB ACCESS TOKEN</label>
                    <div className="relative">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                        <input 
                            type="password" 
                            value={hubToken} 
                            onChange={e => setHubToken(e.target.value)} 
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-10 text-xs font-mono font-bold text-white outline-none focus:border-cyan-400 transition-all" 
                            placeholder="X-HUB-ACCESS-TOKEN-2026" 
                        />
                    </div>
                </div>

                <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3">
                        <CpuChipIcon className="w-5 h-5 text-cyan-400" />
                        <div className="flex flex-col">
                            <span className="text-xs font-black text-white uppercase tracking-widest">Auto Hub Sync</span>
                            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Sinkronisasi Otomatis Berkala</span>
                        </div>
                    </div>
                    <button onClick={() => setAutoHubSync(!autoHubSync)} className={`w-12 h-6 rounded-full relative transition-all ${autoHubSync ? 'bg-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.5)]' : 'bg-white/10'}`}>
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${autoHubSync ? 'left-7' : 'left-1'}`}></div>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={handleHubSync}
                  disabled={isHubLoading}
                  className="flex items-center justify-center gap-3 py-4 bg-cyan-400 text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all active:scale-[0.98] shadow-lg shadow-cyan-400/20 disabled:opacity-50"
                >
                    <ArrowPathIcon className={`w-5 h-5 ${isHubLoading ? 'animate-spin' : ''}`} /> PUSH TO HUB
                </button>
                <button 
                  onClick={handleHubPull}
                  disabled={isHubLoading}
                  className="flex items-center justify-center gap-3 py-4 bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                    <RectangleGroupIcon className="w-5 h-5" /> PULL FROM HUB
                </button>
            </div>
            
            <button 
                onClick={() => saveAllSettings('CloudDatabaseHub')}
                className="mt-4 w-full py-3 bg-white/5 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] rounded-xl hover:text-cyan-400 transition-all"
            >
                SAVE HUB CONFIGURATION
            </button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Broadcast Center */}
        <div className="bg-white p-8 lg:p-10 rounded-[3rem] shadow-sm border border-purple-100 flex flex-col h-fit setting-card-3d relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-50 rounded-full opacity-50"></div>
            
            <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 shadow-sm">
                    <MegaphoneIcon className="w-8 h-8" />
                </div>
                <div>
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Broadcast Center</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kirim Pengumuman Massal (WA)</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">ISI PENGUMUMAN SEKOLAH</label>
                    <textarea 
                        value={announcementMsg}
                        onChange={(e) => setAnnouncementMsg(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] p-6 text-sm font-medium outline-none focus:border-purple-400 min-h-[150px] resize-none shadow-inner"
                        placeholder="Contoh: Diberitahukan kepada seluruh orang tua siswa bahwa besok kegiatan belajar mengajar diliburkan..."
                    />
                </div>
                
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
                    <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                        <ShieldCheckIcon className="w-4 h-4 text-amber-500" />
                    </div>
                    <p className="text-[9px] font-bold text-amber-700 leading-relaxed uppercase tracking-tight">
                        Catatan: Pesan akan dikirim ke seluruh siswa yang memiliki nomor WhatsApp orang tua. Proses ini membutuhkan waktu beberapa saat.
                    </p>
                </div>

                <button 
                    onClick={handleBroadcast}
                    disabled={isBroadcasting || !announcementMsg.trim()}
                    className={`w-full py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all shadow-xl active:scale-95 ${isBroadcasting ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700'}`}
                >
                    {isBroadcasting ? (
                        <>
                            <ArrowPathIcon className="w-5 h-5 animate-spin" />
                            SEDANG MENGIRIM...
                        </>
                    ) : (
                        <>
                            <PaperAirplaneIcon className="w-5 h-5" />
                            KIRIM KE SELURUH ORANG TUA
                        </>
                    )}
                </button>
            </div>
        </div>

        {/* Google Drive Backup Card */}
        <div className="bg-white p-8 lg:p-10 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col h-fit setting-card-3d relative overflow-hidden group">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100">
                    <CloudArrowUpIcon className="w-8 h-8" />
                </div>
                <div>
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Google Drive Backup</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Snapshot System to Drive</p>
                </div>
            </div>

            <div className="space-y-4 mb-6">
                <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Google Client ID</label>
                    <input 
                      type="text" 
                      value={googleClientId} 
                      onChange={e => setGoogleClientId(e.target.value)} 
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-mono font-bold outline-none focus:border-blue-400" 
                      placeholder="Enter Client ID"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">API Key</label>
                    <input 
                      type="password" 
                      value={googleApiKey} 
                      onChange={e => setGoogleApiKey(e.target.value)} 
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-mono font-bold outline-none focus:border-blue-400" 
                      placeholder="Enter API Key"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={handlePushDrive}
                  disabled={isDriveLoading}
                  className="flex items-center justify-center gap-2 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-[0.98] shadow-lg disabled:opacity-50"
                >
                    <ArrowUpCircleIcon className="w-5 h-5" /> {isDriveLoading ? 'UPLOADING...' : 'BACKUP TO DRIVE'}
                </button>
                <button 
                  onClick={handlePullDrive}
                  disabled={isDriveLoading}
                  className="flex items-center justify-center gap-2 py-4 bg-slate-100 text-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                    <ArrowDownCircleIcon className="w-5 h-5" /> {isDriveLoading ? 'RESTORING...' : 'RESTORE FROM DRIVE'}
                </button>
            </div>
        </div>

        {/* Notification Gateway Integration */}
        <div className="bg-white p-8 lg:p-10 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col h-fit setting-card-3d relative overflow-hidden group">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                        <ChatBubbleLeftRightIcon className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Gateway Notifikasi</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Automation Integration Panel</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={handleTestGateway} disabled={testStatus.status === 'loading'} className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-30">
                    <PaperAirplaneIcon className={`w-5 h-5 ${testStatus.status === 'loading' ? 'animate-bounce' : ''}`} />
                  </button>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Status Notifikasi Otomatis</span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Kirim WA ke Orang Tua saat Scan</span>
                    </div>
                    <button onClick={() => setAutoNotify(!autoNotify)} className={`w-12 h-6 rounded-full relative transition-all ${autoNotify ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`}>
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${autoNotify ? 'left-7' : 'left-1'}`}></div>
                    </button>
                </div>

                <div className="space-y-4 animate-fade-in">
                    <div className="flex gap-2">
                        {['WhatsApp', 'Telegram'].map(m => (
                            <button key={m} onClick={() => setNotifyMethod(m as any)} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${notifyMethod === m ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}>
                                {m}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-4 p-5 bg-slate-50 rounded-[2rem] border border-slate-100">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">API Key / Token Gateway (Wajib)</label>
                            <div className="relative">
                              <input 
                                type={showWaApiKey ? "text" : "password"} 
                                value={waApiKey} 
                                onChange={e => setWaApiKey(e.target.value)} 
                                className="w-full bg-white border border-slate-200 rounded-xl p-3 pr-12 text-xs font-mono font-bold outline-none focus:border-emerald-400 transition-all" 
                                placeholder="Masukkan token API di sini..." 
                              />
                              <button type="button" onClick={() => setShowWaApiKey(!showWaApiKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-emerald-500 transition-colors">
                                {showWaApiKey ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                              </button>
                            </div>
                        </div>
                        
                        {notifyMethod === 'WhatsApp' && (
                          <div className="space-y-1">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">API Endpoint URL</label>
                              <input type="text" value={waEndpoint} onChange={e => setWaEndpoint(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-mono font-bold outline-none focus:border-emerald-400" />
                              <p className="text-[8px] font-medium text-slate-400 italic">Default: https://api.fonnte.com/send</p>
                          </div>
                        )}
                    </div>
                </div>
                
                <button 
                  onClick={() => saveAllSettings('Konfigurasi Gateway')} 
                  className="w-full py-4 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-3"
                >
                  <ShieldCheckIcon className="w-5 h-5" /> SIMPAN KONFIGURASI GATEWAY
                </button>
            </div>
        </div>

        {/* Time Settings Panel */}
        <div className="bg-white p-8 lg:p-10 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col h-fit setting-card-3d">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600">
                    <ClockIcon className="w-8 h-8" />
                </div>
                <div>
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Pengaturan Waktu</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Jam Masuk & Pulang</p>
                </div>
            </div>

            <div className="space-y-5 mb-8">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Mulai Presensi Masuk</label>
                        <input 
                            type="time" 
                            value={startAttendance} 
                            onChange={e => setStartAttendance(e.target.value)} 
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm font-black outline-none focus:border-orange-400" 
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Batas Tepat Waktu</label>
                        <input 
                            type="time" 
                            value={onTimeEnd} 
                            onChange={e => setOnTimeEnd(e.target.value)} 
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm font-black outline-none focus:border-orange-400" 
                        />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Batas Akhir Presensi Masuk</label>
                    <input 
                        type="time" 
                        value={lateEndLimit} 
                        onChange={e => setLateEndLimit(e.target.value)} 
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm font-black outline-none focus:border-orange-400" 
                    />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Mulai Presensi Pulang</label>
                        <input 
                            type="time" 
                            value={returnEarlyStart} 
                            onChange={e => setReturnEarlyStart(e.target.value)} 
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm font-black outline-none focus:border-orange-400" 
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Batas Akhir Pulang</label>
                        <input 
                            type="time" 
                            value={returnLimit} 
                            onChange={e => setReturnLimit(e.target.value)} 
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm font-black outline-none focus:border-orange-400" 
                        />
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Jam Pulang Normal</label>
                        <input 
                            type="time" 
                            value={onTimePulangStart} 
                            onChange={e => setOnTimePulangStart(e.target.value)} 
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm font-black outline-none focus:border-orange-400" 
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Jam Pulang Kelas 1 & 2</label>
                        <input 
                            type="time" 
                            value={onTimePulangStartClass12} 
                            onChange={e => setOnTimePulangStartClass12(e.target.value)} 
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm font-black outline-none focus:border-orange-400" 
                        />
                    </div>
                </div>
            </div>
            
            <button onClick={() => saveAllSettings('Pengaturan Waktu')} className="w-full py-4 bg-orange-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg">SIMPAN PENGATURAN WAKTU</button>
        </div>

        {/* Branding Panel */}
        <div className="bg-white p-8 lg:p-10 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col h-fit setting-card-3d">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                    <PaintBrushIcon className="w-8 h-8" />
                </div>
                <div>
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Identitas Sekolah</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nama, Tagline & Logo</p>
                </div>
            </div>

            <div className="space-y-5 mb-8">
                <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Nama Instansi / Sekolah</label>
                    <input 
                        type="text" 
                        value={schoolName} 
                        onChange={e => setSchoolName(e.target.value)} 
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm font-black outline-none focus:border-indigo-400" 
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Tagline / Motto</label>
                    <input 
                        type="text" 
                        value={tagline} 
                        onChange={e => setTagline(e.target.value)} 
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-bold outline-none focus:border-indigo-400 italic" 
                    />
                </div>

                <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="space-y-3">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1 text-center block leading-tight">Logo Sekolah</label>
                        <div className="relative group aspect-square rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-all hover:border-indigo-400">
                            {schoolLogoUrl ? (
                                <img src={schoolLogoUrl} className="w-full h-full object-contain p-2" alt="Logo" />
                            ) : (
                                <PhotoIcon className="w-8 h-8 text-slate-200" />
                            )}
                            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                <button onClick={() => schoolLogoInputRef.current?.click()} className="p-1.5 bg-white rounded-lg text-slate-900 active:scale-95"><CloudArrowUpIcon className="w-4 h-4" /></button>
                                {schoolLogoUrl && <button onClick={() => removeLogo('school')} className="p-1.5 bg-rose-500 rounded-lg text-white active:scale-95"><TrashIcon className="w-4 h-4" /></button>}
                            </div>
                        </div>
                        <input type="file" ref={schoolLogoInputRef} className="hidden" accept="image/*" onChange={e => handleLogoUpload(e, 'school')} />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1 text-center block leading-tight">Ikon Aplikasi</label>
                        <div className="relative group aspect-square rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-all hover:border-cyan-400">
                            {appLogoUrl ? (
                                <img src={appLogoUrl} className="w-full h-full object-contain p-2" alt="Icon" />
                            ) : (
                                <SparklesIcon className="w-8 h-8 text-slate-200" />
                            )}
                            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                <button onClick={() => appLogoInputRef.current?.click()} className="p-1.5 bg-white rounded-lg text-slate-900 active:scale-95"><CloudArrowUpIcon className="w-4 h-4" /></button>
                                {appLogoUrl && <button onClick={() => removeLogo('app')} className="p-1.5 bg-rose-500 rounded-lg text-white active:scale-95"><TrashIcon className="w-4 h-4" /></button>}
                            </div>
                        </div>
                        <input type="file" ref={appLogoInputRef} className="hidden" accept="image/*" onChange={e => handleLogoUpload(e, 'app')} />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1 text-center block leading-tight">Logo Govt</label>
                        <div className="relative group aspect-square rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-all hover:border-amber-400">
                            {govtLogoUrl ? (
                                <img src={govtLogoUrl} className="w-full h-full object-contain p-2" alt="Govt" />
                            ) : (
                                <BuildingLibraryIcon className="w-8 h-8 text-slate-200" />
                            )}
                            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                <button onClick={() => govtLogoInputRef.current?.click()} className="p-1.5 bg-white rounded-lg text-slate-900 active:scale-95"><CloudArrowUpIcon className="w-4 h-4" /></button>
                                {govtLogoUrl && <button onClick={() => removeLogo('govt')} className="p-1.5 bg-rose-500 rounded-lg text-white active:scale-95"><TrashIcon className="w-4 h-4" /></button>}
                            </div>
                        </div>
                        <input type="file" ref={govtLogoInputRef} className="hidden" accept="image/*" onChange={e => handleLogoUpload(e, 'govt')} />
                    </div>
                </div>
            </div>
            
            <button onClick={() => saveAllSettings('Identitas Sekolah')} className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg">SIMPAN IDENTITAS</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;

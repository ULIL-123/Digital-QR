import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { AttendanceStatus } from '../types';
import { 
  ArrowLeftOnRectangleIcon, 
  CalendarIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  AcademicCapIcon, 
  UserCircleIcon, 
  IdentificationIcon, 
  ChartPieIcon,
  HandRaisedIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

interface ParentDashboardProps {
  studentId: string;
  onLogout: () => void;
}

const ParentDashboard: React.FC<ParentDashboardProps> = ({ studentId, onLogout }) => {
  const { students, attendance, generalSettings } = useData();

  const student = useMemo(() => students.find(s => s.id === studentId), [students, studentId]);
  
  const studentRecords = useMemo(() => {
    return attendance
      .filter(a => a.studentId === studentId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [attendance, studentId]);

  const stats = useMemo(() => {
    const present = studentRecords.filter(r => r.status === AttendanceStatus.Present).length;
    const sick = studentRecords.filter(r => r.status === AttendanceStatus.Sick).length;
    const permit = studentRecords.filter(r => r.status === AttendanceStatus.Permit).length;
    
    const effectivePresent = present + sick + permit;

    return {
      present: effectivePresent,
      total: studentRecords.length,
      rate: studentRecords.length > 0 ? Math.round((effectivePresent / studentRecords.length) * 100) : 0
    };
  }, [studentRecords]);

  if (!student) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans overflow-x-hidden">
      <header className="bg-slate-900 text-white p-6 lg:px-20 lg:py-10 relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/5 backdrop-blur-md rounded-2xl p-3 border border-white/10 shadow-2xl">
                    <AcademicCapIcon className="w-full h-full text-cyan-400" />
                </div>
                <div>
                    <h1 className="text-xl font-black tracking-tight leading-none uppercase">PORTAL <span className="text-cyan-400">ORANG TUA</span></h1>
                    <p className="text-[9px] font-black text-slate-400 tracking-[0.3em] uppercase mt-1">{generalSettings.schoolName}</p>
                </div>
            </div>
            <button onClick={onLogout} className="px-6 py-3 bg-white/5 hover:bg-rose-500/20 text-white border border-white/10 rounded-2xl flex items-center gap-3 transition-all font-black text-[10px] uppercase tracking-widest">
                <ArrowLeftOnRectangleIcon className="w-5 h-5 text-rose-500" /> KELUAR
            </button>
        </div>
      </header>

      <main className="flex-grow p-4 lg:p-12 max-w-5xl mx-auto w-full space-y-8 animate-fade-in-up">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 flex flex-col sm:flex-row gap-8 items-center sm:items-start group transition-all duration-500">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-[2.5rem] bg-slate-900 flex items-center justify-center text-cyan-400 border-4 border-white shadow-xl">
                    <span className="text-6xl font-black">{student.name.charAt(0)}</span>
                </div>
                <div className="text-center sm:text-left space-y-4 py-2 flex-grow">
                    <div>
                        <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest bg-cyan-50 px-3 py-1.5 rounded-full mb-2 inline-block">Data Siswa Terverifikasi</span>
                        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none uppercase">{student.name}</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Nomor Induk (NIS)</p>
                            <p className="text-sm font-black text-slate-800">{student.rollNumber}</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Kelas Aktif</p>
                            <p className="text-sm font-black text-slate-800">{student.className || '-'}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-2xl flex flex-col justify-between group overflow-hidden relative">
                <ChartPieIcon className="absolute top-4 right-4 w-20 h-20 text-white/5 transform rotate-12" />
                <div>
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-cyan-400 mb-6 flex items-center gap-2">Efektivitas Kehadiran</h3>
                    <span className="text-6xl font-black block leading-none mb-2">{stats.rate}%</span>
                    <p className="text-xs font-medium text-slate-400">Persentase dihitung termasuk keterangan Sakit & Ijin resmi.</p>
                </div>
                <div className="w-full h-3 bg-white/5 rounded-full mt-8 overflow-hidden">
                    <div className="h-full bg-cyan-400 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(34,211,238,0.5)]" style={{ width: `${stats.rate}%` }}></div>
                </div>
            </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 lg:p-12">
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                        <CalendarIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Riwayat Absensi</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real-time Data Log</p>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                {studentRecords.length > 0 ? studentRecords.map((record, idx) => (
                    <div key={idx} className="flex items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-white hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center gap-5">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                                record.status === AttendanceStatus.Present ? 'bg-emerald-50 text-emerald-600' : 
                                record.status === AttendanceStatus.Sick ? 'bg-amber-50 text-amber-600' :
                                record.status === AttendanceStatus.Permit ? 'bg-indigo-50 text-indigo-600' :
                                'bg-rose-50 text-rose-600'
                            }`}>
                                {record.status === AttendanceStatus.Present ? <CheckCircleIcon className="w-8 h-8" /> : 
                                 record.status === AttendanceStatus.Sick ? <HeartIcon className="w-8 h-8" /> :
                                 record.status === AttendanceStatus.Permit ? <HandRaisedIcon className="w-8 h-8" /> :
                                 <XCircleIcon className="w-8 h-8" />}
                            </div>
                            <div>
                                <p className="text-sm font-black text-slate-900 leading-none mb-1.5">{new Date(record.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                    {record.status === AttendanceStatus.Present ? `Jam: ${record.scanTime ? new Date(record.scanTime).toLocaleTimeString('id-ID') : 'Manual'}` : 'Keterangan Khusus'} 
                                    {record.minutesLate && record.minutesLate > 0 ? ` • Telat ${record.minutesLate}m` : ''}
                                </p>
                            </div>
                        </div>
                        <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase ${
                            record.status === AttendanceStatus.Present ? 'bg-emerald-100 text-emerald-700' : 
                            record.status === AttendanceStatus.Sick ? 'bg-amber-100 text-amber-700' :
                            record.status === AttendanceStatus.Permit ? 'bg-indigo-100 text-indigo-700' :
                            'bg-rose-100 text-rose-700'
                        }`}>
                            {record.status === AttendanceStatus.Present ? 'HADIR' : (record.status === AttendanceStatus.Sick ? 'SAKIT' : (record.status === AttendanceStatus.Permit ? 'IJIN' : 'ALFA'))}
                        </span>
                    </div>
                )) : <p className="text-center py-10 opacity-40">Belum ada riwayat tercatat</p>}
            </div>
        </div>
      </main>
    </div>
  );
};

export default ParentDashboard;
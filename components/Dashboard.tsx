
import React from 'react';
import { useData } from '../context/DataContext';
import { getTodayDateString } from '../utils/dateUtils';
import { CameraIcon, UsersIcon, ChartBarIcon, ArrowRightIcon, CheckCircleIcon, AcademicCapIcon, CalendarIcon, ServerIcon, SignalIcon, CircleStackIcon, ClockIcon, ArrowTrendingUpIcon, InformationCircleIcon, SunIcon, MoonIcon, ArrowRightEndOnRectangleIcon, StopIcon } from '@heroicons/react/24/outline';
import { AttendanceStatus } from '../types';
import PullToRefresh from './common/PullToRefresh';

const Dashboard: React.FC<{ setCurrentPage: (page: any) => void }> = ({ setCurrentPage }) => {
  const { getAttendanceForDate, students, attendance, apiConfig, generalSettings, manualSync } = useData();
  const today = getTodayDateString();
  const attendanceToday = getAttendanceForDate(today);

  const totalStudents = students.length;
  const presentCount = attendanceToday.filter(a => a.status === AttendanceStatus.Present).length;
  const onTimeCount = attendanceToday.filter(a => a.status === AttendanceStatus.Present && (a.minutesLate || 0) === 0).length;
  const lateCount = attendanceToday.filter(a => a.status === AttendanceStatus.Present && (a.minutesLate || 0) > 0).length;
  const absentCount = totalStudents - presentCount;
  
  const attendanceRate = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;
  const circumference = 2 * Math.PI * 40;

  return (
    <PullToRefresh onRefresh={manualSync}>
      <div className="space-y-8 pb-24">
        <style>{`
          .card-3d {
            transition: transform 0.5s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.5s ease;
            transform-style: preserve-3d;
          }
          .card-3d:hover {
            transform: translateY(-10px) rotateX(4deg) rotateY(-2deg);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
          }
          .inner-3d {
            transform: translateZ(30px);
          }
          .text-glow-cyan { text-shadow: 0 0 10px rgba(34, 211, 238, 0.4); }
          @keyframes pulse-ring {
            0% { transform: scale(0.8); opacity: 0.5; }
            100% { transform: scale(1.3); opacity: 0; }
          }
          .pulse-indicator {
            position: relative;
          }
          .pulse-indicator::after {
            content: '';
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            background: inherit;
            border-radius: inherit;
            animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
        `}</style>

        {/* Hero Section */}
        <div className="bg-slate-950 rounded-[3rem] p-8 lg:p-12 text-white relative overflow-hidden group shadow-2xl shadow-indigo-950/20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10 mb-6">
                      <CalendarIcon className="w-4 h-4 text-cyan-400" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-100">{today}</span>
                  </div>
                  <h1 className="text-4xl lg:text-6xl font-black tracking-tight mb-4 leading-none">
                      Intelligence <br/>
                      <span className="text-cyan-400 text-glow-cyan">Presence Portal.</span>
                  </h1>
                  <p className="text-slate-400 text-xs lg:text-sm font-medium max-w-lg leading-relaxed mb-8">
                      Sistem absensi cerdas berbasis biometrik digital. Pantau, kelola, dan automasi kehadiran siswa dalam satu genggaman secara real-time.
                  </p>
                  <div className="flex flex-wrap gap-4">
                      <button 
                          onClick={() => setCurrentPage('scanner')}
                          className="px-8 py-4 bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-cyan-400/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                      >
                          <CameraIcon className="w-5 h-5" />
                          LAUNCH SCANNER
                      </button>
                      <div className="px-6 py-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl flex items-center gap-4">
                          <div className={`w-2.5 h-2.5 rounded-full pulse-indicator ${apiConfig.enabled ? 'bg-cyan-400' : 'bg-slate-500'}`}></div>
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                              {apiConfig.enabled ? 'CLOUD SYNC ACTIVE' : 'LOCAL ENGINE'}
                          </span>
                      </div>
                  </div>
              </div>

              {/* 3D Visual Gauge in Hero */}
              <div className="hidden lg:flex relative w-72 h-72 items-center justify-center">
                  <div className="absolute inset-0 bg-cyan-400/10 rounded-full animate-pulse blur-3xl"></div>
                  <div className="card-3d relative w-full h-full bg-slate-900/50 backdrop-blur-xl rounded-[3.5rem] border border-white/10 flex items-center justify-center p-8 shadow-2xl">
                      <div className="inner-3d text-center relative">
                          <svg viewBox="0 0 100 100" className="w-48 h-48 transform -rotate-90">
                              <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                              <circle 
                                cx="50" cy="50" r="40" fill="transparent" 
                                stroke="#22d3ee" strokeWidth="8" strokeLinecap="round" 
                                strokeDasharray={circumference} 
                                strokeDashoffset={circumference - (attendanceRate / 100) * circumference}
                                className="transition-all duration-1000 ease-in-out"
                                style={{ filter: 'drop-shadow(0 0 8px #22d3ee)' }}
                              />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-5xl font-black text-white leading-none">{attendanceRate}%</span>
                              <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest mt-2">TODAY RATE</span>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
        </div>

        {/* 3D Analytics Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Total Students - Active Blue */}
            <div className="card-3d bg-white p-8 rounded-[3rem] border border-slate-100 relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-50 rounded-full opacity-50 inner-3d"></div>
                <div className="relative z-10 inner-3d">
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                        <AcademicCapIcon className="w-7 h-7" />
                    </div>
                    <span className="text-5xl font-black text-slate-900 block leading-none mb-2">{totalStudents}</span>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <UsersIcon className="w-3.5 h-3.5" /> Total Database
                    </p>
                </div>
            </div>

            {/* Present - Emerald Green */}
            <div className="card-3d bg-white p-8 rounded-[3rem] border border-slate-100 relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-50 rounded-full opacity-50 inner-3d"></div>
                <div className="relative z-10 inner-3d">
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                        <CheckCircleIcon className="w-7 h-7" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black text-slate-900 block leading-none mb-2">{presentCount}</span>
                        <span className="text-xs font-bold text-emerald-500"> total {totalStudents}</span>
                    </div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 pulse-indicator"></span> Hadir Hari Ini
                    </p>
                </div>
            </div>

            {/* On-Time vs Late - Dual Mode */}
            <div className="card-3d bg-slate-900 p-8 rounded-[3rem] relative overflow-hidden group/tile">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-transparent opacity-0 group-hover/tile:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10 inner-3d h-full flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-cyan-400 border border-white/10">
                            <ClockIcon className="w-6 h-6" />
                        </div>
                        <div className="text-right">
                            <span className="text-xs font-black text-cyan-400 block leading-none">{onTimeCount}</span>
                            <span className="text-[8px] font-bold text-slate-500 uppercase">Tepat</span>
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-2xl font-black text-white">{lateCount}</span>
                            <ArrowTrendingUpIcon className="w-5 h-5 text-amber-500" />
                        </div>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Terlambat Datang</p>
                    </div>
                </div>
            </div>

            {/* Absent - Rose Mode */}
            <div className="card-3d bg-rose-500 p-8 rounded-[3rem] text-white shadow-xl shadow-rose-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10 inner-3d h-full flex flex-col justify-between">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                        <SignalIcon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <span className="text-5xl font-black block leading-none mb-1">{absentCount}</span>
                        <p className="text-[11px] font-black text-rose-100 uppercase tracking-widest">Alfa Belum Scan</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Attendance Rules Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 card-3d bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50"></div>
                <div className="relative z-10 inner-3d">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 bg-cyan-50 rounded-2xl flex items-center justify-center text-cyan-600">
                            <ClockIcon className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Time Window Configuration</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Automatic Attendance Status Rules</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-4 p-5 bg-emerald-50 rounded-3xl border border-emerald-100 transition-all hover:shadow-lg hover:shadow-emerald-500/10">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                                <SunIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">06.30 - 07.15 WIB</p>
                                <p className="text-xs font-black text-slate-900 mt-0.5">HADIR MASUK TEPAT WAKTU</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-5 bg-amber-50 rounded-3xl border border-amber-100 transition-all hover:shadow-lg hover:shadow-amber-500/10">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-amber-600 shadow-sm shrink-0">
                                <ClockIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">07.16 - 09.00 WIB</p>
                                <p className="text-xs font-black text-slate-900 mt-0.5">DATANG TERLAMBAT</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-5 bg-rose-50 rounded-3xl border border-rose-100 transition-all hover:shadow-lg hover:shadow-rose-500/10">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-rose-600 shadow-sm shrink-0">
                                <ArrowRightEndOnRectangleIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">09.00 - (10.45/12.10) WIB</p>
                                <p className="text-xs font-black text-slate-900 mt-0.5">PULANG MENDAHULUI</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-5 bg-indigo-50 rounded-3xl border border-indigo-100 transition-all hover:shadow-lg hover:shadow-indigo-500/10">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
                                <MoonIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">10.45/12.10 - 17.00 WIB</p>
                                <p className="text-xs font-black text-slate-900 mt-0.5">PULANG TEPAT (KELAS 1-2 / 3-6)</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-6">
                <div className="card-3d bg-slate-950 p-8 rounded-[3.5rem] flex flex-col justify-center items-center text-center shadow-xl flex-grow group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="inner-3d relative z-10">
                        <div className="w-16 h-16 bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center text-cyan-400 mb-6 mx-auto border border-white/10">
                            <ChartBarIcon className="w-8 h-8" />
                        </div>
                        <h4 className="text-xl font-black text-white uppercase tracking-tight mb-2">Detailed Report</h4>
                        <p className="text-xs text-slate-400 mb-8 font-medium">Analisis rinci kehadiran harian dan bulanan.</p>
                        <button 
                            onClick={() => setCurrentPage('reports')}
                            className="w-full py-4 bg-cyan-400 text-slate-950 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-white transition-all shadow-lg shadow-cyan-400/20 active:scale-95"
                        >
                            BUKA LAPORAN
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Global Data Integrity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 card-3d bg-gradient-to-br from-indigo-600 to-indigo-800 p-10 rounded-[3.5rem] shadow-2xl text-white relative overflow-hidden group">
                <CircleStackIcon className="absolute -top-10 -right-10 w-64 h-64 text-white/5 transform rotate-12 transition-transform duration-1000 group-hover:rotate-0" />
                <div className="relative z-10 inner-3d">
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-8">
                        <ServerIcon className="w-4 h-4 text-cyan-300" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-cyan-50">Storage Integrity Level 100%</span>
                    </div>
                    <h3 className="text-3xl font-black uppercase tracking-tight mb-4">Arsip Digital Terpusat</h3>
                    <p className="text-indigo-100/70 text-sm font-medium leading-relaxed max-w-md mb-10">
                        Seluruh riwayat presensi tersimpan dengan enkripsi di database lokal. Pastikan untuk melakukan backup periodik untuk menjaga keamanan data.
                    </p>
                    <div className="flex items-center gap-8">
                        <div>
                            <span className="text-4xl font-black block leading-none mb-1 text-cyan-300">{attendance.length}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Total Rekaman</span>
                        </div>
                        <div className="w-[1px] h-10 bg-white/10"></div>
                        <div>
                            <span className="text-4xl font-black block leading-none mb-1 text-white">{students.length}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Siswa Aktif</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card-3d bg-white p-10 rounded-[3.5rem] border border-slate-100 flex flex-col justify-center items-center text-center shadow-sm relative overflow-hidden group">
                <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-indigo-50 rounded-full opacity-50 transition-all group-hover:scale-125"></div>
                <div className="inner-3d relative z-10">
                    <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 mb-6 mx-auto shadow-inner">
                        <SignalIcon className="w-10 h-10" />
                    </div>
                    <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">Hardware Sync</h4>
                    <p className="text-xs text-slate-400 mb-8 font-medium">Koneksi RFID QR Scanner External Aktif.</p>
                    <div className="flex items-center justify-center gap-3 px-6 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                         <div className={`w-2 h-2 rounded-full pulse-indicator ${apiConfig.enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                         <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Live Status</span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </PullToRefresh>
  );
};

export default Dashboard;


import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { getTodayDateString } from '../utils/dateUtils';
import { AttendanceStatus, Student } from '../types';
import { 
  ArrowDownTrayIcon, 
  MagnifyingGlassIcon, 
  ChevronDownIcon,
  ChartBarIcon,
  PrinterIcon,
  CheckBadgeIcon,
  ClockIcon,
  NoSymbolIcon,
  UserGroupIcon,
  SparklesIcon,
  HandRaisedIcon,
  HeartIcon,
  ArrowPathIcon as ResetIcon
} from '@heroicons/react/24/outline';
import { exportAttendanceToExcel, generateAttendanceReportPdf } from '../utils/export';
import PullToRefresh from './common/PullToRefresh';

export const handleManualNotify = (student: Student, status: AttendanceStatus, date: string, generalSettings: any, scanTime?: string, minutesLate?: number, isEarly?: boolean, isDeparture?: boolean) => {
    if (!student.parentContact) return;

    const config = generalSettings.notifications;
    const method = config?.method || 'WhatsApp';

    const dateStr = new Date(date + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    let message = isDeparture ? `🔔 *LAPORAN KEPULANGAN SISWA*` : `🔔 *LAPORAN KEHADIRAN SISWA*`;
    
    if (status === AttendanceStatus.Sick) {
        message = `🔔 *LAPORAN KETERANGAN SISWA* (SAKIT)`;
    } else if (status === AttendanceStatus.Permit) {
        message = `🔔 *LAPORAN KETERANGAN SISWA* (IJIN)`;
    }

    message += `\n\nAnanda: *${student.name}*\nNIS: ${student.rollNumber}\nKelas: ${student.className || '-'}\n\nStatus: *${status === AttendanceStatus.Present ? (isDeparture ? 'TELAH PULANG' : 'HADIR') : (status === AttendanceStatus.Sick ? 'SAKIT' : (status === AttendanceStatus.Permit ? 'IJIN' : 'ALFA'))}*\nTanggal: ${dateStr}`;
    
    if (status === AttendanceStatus.Present && scanTime) {
      const timeStr = new Date(scanTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      message += `\nJam: ${timeStr} WIB`;
      
      if (isDeparture) {
          if (isEarly) message += `\n⚠️ *KETERANGAN:* PULANG MENDAHULUI`;
          else message += `\n✅ *KETERANGAN:* PULANG TEPAT WAKTU`;
      } else {
          if (minutesLate && minutesLate > 0) message += `\n⏰ *STATUS:* DATANG TERLAMBAT (${minutesLate} menit)`;
          else message += `\n✅ *STATUS:* HADIR TEPAT WAKTU`;
      }
    }
    message += `\n\nSekolah: ${generalSettings.schoolName}\n_Hadirku Digital Portal_`;

    if (method === 'Telegram' && config?.apiKey) {
      fetch(`https://api.telegram.org/bot${config.apiKey}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: student.parentContact, text: message, parse_mode: 'Markdown' })
      }).then(res => res.ok ? alert('Notifikasi Telegram Terkirim!') : alert('Gagal mengirim Telegram.'));
    } else {
      const number = student.parentContact.replace(/\D/g, ''); 
      window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`, '_blank');
    }
};

const AttendanceReport: React.FC = () => {
  const { getAttendanceForDate, generalSettings, students, manualSync, setManualStatus } = useData();
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const attendanceData = getAttendanceForDate(selectedDate);
  
  const availableClasses = useMemo(() => {
    const classes = students.map(s => s.className || 'Tanpa Kelas');
    return Array.from(new Set(classes)).sort();
  }, [students]);

  const filteredData = useMemo(() => {
    return attendanceData.filter(a => {
      const matchesSearch = a.student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           a.student.rollNumber.includes(searchTerm);
      const matchesClass = selectedClass === 'all' || (a.student.className || 'Tanpa Kelas') === selectedClass;
      return matchesSearch && matchesClass;
    });
  }, [attendanceData, searchTerm, selectedClass]);

  const stats = useMemo(() => {
    const total = filteredData.length;
    const present = filteredData.filter(a => a.status === AttendanceStatus.Present).length;
    
    const onTimeArrivals = filteredData.filter(a => {
        if (a.status !== AttendanceStatus.Present || !a.scanTime) return false;
        const d = new Date(a.scanTime);
        const m = d.getHours() * 60 + d.getMinutes();
        return m >= 390 && m <= 435; // 06:30 - 07:15
    }).length;

    const lateArrivals = filteredData.filter(a => {
        if (a.status !== AttendanceStatus.Present || !a.scanTime) return false;
        const d = new Date(a.scanTime);
        const m = d.getHours() * 60 + d.getMinutes();
        return m >= 436 && m <= 540; // 07:16 - 09:00
    }).length;
    
    const absents = filteredData.filter(a => a.status === AttendanceStatus.Absent).length;
    const sickCount = filteredData.filter(a => a.status === AttendanceStatus.Sick).length;
    const permitCount = filteredData.filter(a => a.status === AttendanceStatus.Permit).length;

    return { total, present, onTimeArrivals, lateArrivals, absents, sickCount, permitCount };
  }, [filteredData]);

  const attendanceRate = stats.total > 0 ? Math.round(((stats.present + stats.sickCount + stats.permitCount) / stats.total) * 100) : 0;
  const circumference = 2 * Math.PI * 40;

  const handleExportExcel = () => {
      const dataToExport = filteredData.map(record => ({
          'Nama Siswa': record.student.name,
          'NIS': record.student.rollNumber,
          'Kelas': record.student.className || '-',
          'Tanggal': selectedDate,
          'Jam Masuk': record.scanTime ? new Date(record.scanTime).toLocaleTimeString('id-ID') : '-',
          'Jam Pulang': record.pulangTime ? new Date(record.pulangTime).toLocaleTimeString('id-ID') : '-',
          'Status': record.status === AttendanceStatus.Present ? 'Hadir' : (record.status === AttendanceStatus.Sick ? 'Sakit' : (record.status === AttendanceStatus.Permit ? 'Ijin' : 'Alfa'))
      }));
      exportAttendanceToExcel(dataToExport, `Laporan_Absensi_${selectedClass}_${selectedDate}`);
  };

  const handlePrintOfficialReport = async () => {
    if (filteredData.length === 0) return alert("Tidak ada data untuk dicetak.");
    setIsGenerating(true);
    try {
      await generateAttendanceReportPdf(filteredData, selectedDate, selectedClass, generalSettings);
    } catch (e) {
      alert("Gagal memproses laporan.");
    } finally {
      setIsGenerating(false);
    }
  };

  const parseTime = (timeStr: string, defaultMins: number) => {
    if (!timeStr) return defaultMins;
    const [h, m] = timeStr.split(':').map(Number);
    return (isNaN(h) || isNaN(m)) ? defaultMins : h * 60 + m;
  };

  const ts = generalSettings.timeSettings;
  const startAttendance = parseTime(ts?.startAttendance || '06:30', 6 * 60 + 30);
  const onTimeEnd = parseTime(ts?.onTimeEnd || '07:15', 7 * 60 + 15);
  const lateEndLimit = parseTime(ts?.lateEndLimit || '09:00', 9 * 60);

  const isEarlyDeparture = (student: Student, pulangTime?: string) => {
    if (!pulangTime) return false;
    const d = new Date(pulangTime);
    const m = d.getHours() * 60 + d.getMinutes();
    const isClass12 = student.className?.startsWith('1') || student.className?.startsWith('2');
    const onTimePulangStart = isClass12 
      ? parseTime(ts?.onTimePulangStartClass12 || '10:45', 10 * 60 + 45) 
      : parseTime(ts?.onTimePulangStart || '12:10', 12 * 60 + 10);
    return m < onTimePulangStart;
  };

  const getDetailedStatus = (record: any) => {
    if (record.status === AttendanceStatus.Absent) return "ALFA TANPA KETERANGAN";
    if (record.status === AttendanceStatus.Sick) return "SAKIT (DENGAN KETERANGAN)";
    if (record.status === AttendanceStatus.Permit) return "IJIN (DENGAN KETERANGAN)";
    
    let label = "HADIR";
    if (record.scanTime) {
      const d = new Date(record.scanTime);
      const m = d.getHours() * 60 + d.getMinutes();
      if (m >= startAttendance && m <= onTimeEnd) label = "HADIR (TEPAT WAKTU)";
      else if (m > onTimeEnd && m <= lateEndLimit) label = "HADIR (TERLAMBAT)";
      else label = "HADIR";
    }

    if (record.pulangTime) {
      const isEarly = isEarlyDeparture(record.student, record.pulangTime);
      if (isEarly) label += " & PULANG AWAL";
      else label += " & SUDAH PULANG";
    }
    
    return label;
  };

  return (
    <PullToRefresh onRefresh={manualSync}>
      <div className="space-y-10 pb-32 animate-fade-in">
        <style>{`
          .report-card-3d {
            transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.6s ease;
            transform-style: preserve-3d;
            perspective: 1000px;
          }
          .report-card-3d:hover {
            transform: translateY(-8px) rotateX(2deg) rotateY(-1deg);
            box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.15);
          }
          .inner-content-3d {
            transform: translateZ(25px);
          }
          .neon-glow-cyan { filter: drop-shadow(0 0 12px rgba(34, 211, 238, 0.7)); }
          .neon-glow-lime { filter: drop-shadow(0 0 12px rgba(132, 204, 22, 0.7)); }
          .neon-glow-rose { filter: drop-shadow(0 0 12px rgba(244, 63, 94, 0.7)); }
        `}</style>

        {/* Dynamic Navigation Header */}
        <div className="bg-slate-900 p-8 rounded-[3.5rem] shadow-2xl border border-white/5 flex flex-col xl:flex-row items-center justify-between gap-8 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-transparent to-indigo-500/10 opacity-50"></div>
            
            <div className="flex items-center gap-6 relative z-10 w-full xl:w-auto">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-[1.8rem] flex items-center justify-center text-white shadow-lg shadow-cyan-400/20 transform group-hover:rotate-12 transition-transform">
                    <ChartBarIcon className="w-9 h-9" />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight leading-none">Report <span className="text-cyan-400">Intelligence</span></h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Analytical Monitoring Hub</p>
                </div>
            </div>
            
            <div className="flex flex-wrap items-center justify-center xl:justify-end gap-4 relative z-10 w-full xl:w-auto">
                <div className="relative group/select">
                  <select 
                    value={selectedClass} 
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="appearance-none px-8 py-5 pr-14 bg-white/5 border border-white/10 rounded-[1.8rem] text-[11px] font-black text-white uppercase tracking-widest outline-none focus:border-cyan-400 focus:bg-white/10 transition-all backdrop-blur-md"
                  >
                      <option value="all">Seluruh Kelas</option>
                      {availableClasses.map(c => <option key={c} value={c} className="text-slate-950">{c}</option>)}
                  </select>
                  <ChevronDownIcon className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400 pointer-events-none" />
                </div>

                <div className="relative">
                  <input 
                    type="date" 
                    value={selectedDate} 
                    onChange={(e) => setSelectedDate(e.target.value)} 
                    className="px-8 py-5 bg-white/5 border border-white/10 rounded-[1.8rem] text-[11px] font-black text-white outline-none focus:border-cyan-400 focus:bg-white/10 transition-all backdrop-blur-md" 
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={handlePrintOfficialReport} 
                    disabled={isGenerating}
                    className={`px-8 py-5 bg-white text-slate-950 rounded-[1.8rem] font-black text-[11px] uppercase tracking-widest shadow-xl flex items-center gap-3 active:scale-95 transition-all hover:bg-cyan-400 ${isGenerating ? 'opacity-50 animate-pulse' : ''}`}
                  >
                      <PrinterIcon className="w-5 h-5" />
                      {isGenerating ? 'GENERATING...' : 'CETAK A4 RESMI'}
                  </button>

                  <button 
                    onClick={handleExportExcel} 
                    className="p-5 bg-emerald-500 text-white rounded-[1.8rem] shadow-lg shadow-emerald-500/20 hover:scale-110 active:scale-90 transition-all"
                    title="Export to Excel"
                  >
                      <ArrowDownTrayIcon className="w-6 h-6" />
                  </button>
                </div>
            </div>
        </div>

        {/* 3D Interactive Stats Dashboard */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* Visual Analytics Hub (Large Card) */}
            <div className="xl:col-span-5 report-card-3d bg-white p-12 rounded-[4rem] shadow-sm border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden group/chart">
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-slate-50 rounded-full group-hover/chart:scale-150 transition-transform duration-1000"></div>
                
                <div className="inner-content-3d relative flex flex-col items-center">
                    <div className="relative w-72 h-72 lg:w-80 lg:h-80 flex items-center justify-center">
                        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="10" />
                            <circle 
                                cx="50" cy="50" r="40" fill="transparent" 
                                stroke="url(#gradCyanNeon)" strokeWidth="10" strokeLinecap="round" 
                                strokeDasharray={circumference} 
                                strokeDashoffset={circumference - (attendanceRate / 100) * circumference}
                                className="transition-all duration-1000 ease-in-out neon-glow-cyan"
                            />
                            <defs>
                              <linearGradient id="gradCyanNeon" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#22d3ee" />
                                <stop offset="100%" stopColor="#0ea5e9" />
                              </linearGradient>
                            </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <div className="text-6xl font-black text-slate-900 leading-none">{attendanceRate}%</div>
                            <div className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.4em] mt-3">TOTAL EFFECTIVE RATE</div>
                        </div>
                    </div>
                    
                    <div className="mt-10 text-center">
                       <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">Daily Performance</h4>
                       <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Sistem Analitik SDN 4 Kronggen</p>
                    </div>
                </div>
            </div>

            {/* Bento Grid Stats Tiles */}
            <div className="xl:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Hadir Tepat */}
                <div className="report-card-3d bg-gradient-to-br from-emerald-500 to-emerald-700 p-8 rounded-[3rem] text-white shadow-xl shadow-emerald-500/10 relative overflow-hidden group/tile">
                    <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full group-hover/tile:scale-150 transition-transform duration-700"></div>
                    <div className="inner-content-3d relative z-10 flex flex-col justify-between h-full">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-10">
                            <CheckBadgeIcon className="w-8 h-8 text-white neon-glow-lime" />
                        </div>
                        <div>
                            <span className="text-5xl font-black block leading-none mb-2">{stats.present}</span>
                            <span className="text-[11px] font-black text-emerald-100 uppercase tracking-[0.3em]">SISWA HADIR</span>
                        </div>
                    </div>
                </div>

                {/* Ijin & Sakit */}
                <div className="report-card-3d bg-gradient-to-br from-indigo-500 to-indigo-700 p-8 rounded-[3rem] text-white shadow-xl shadow-indigo-500/10 relative overflow-hidden group/tile">
                    <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full group-hover/tile:scale-150 transition-transform duration-700"></div>
                    <div className="inner-content-3d relative z-10 flex flex-col justify-between h-full">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-10">
                            <HandRaisedIcon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <span className="text-5xl font-black block leading-none mb-2">{stats.sickCount + stats.permitCount}</span>
                            <span className="text-[11px] font-black text-indigo-100 uppercase tracking-[0.3em]">IJIN & SAKIT</span>
                        </div>
                    </div>
                </div>

                {/* Alfa Tanpa Ket */}
                <div className="report-card-3d bg-gradient-to-br from-rose-500 to-rose-700 p-8 rounded-[3rem] text-white shadow-xl shadow-rose-500/10 relative overflow-hidden group/tile">
                    <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full group-hover/tile:scale-150 transition-transform duration-700"></div>
                    <div className="inner-content-3d relative z-10 flex flex-col justify-between h-full">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-10">
                            <NoSymbolIcon className="w-8 h-8 text-white neon-glow-rose" />
                        </div>
                        <div>
                            <span className="text-5xl font-black block leading-none mb-2">{stats.absents}</span>
                            <span className="text-[11px] font-black text-rose-100 uppercase tracking-[0.3em]">ALFA TANPA KET.</span>
                        </div>
                    </div>
                </div>

                {/* Total Siswa */}
                <div className="report-card-3d bg-gradient-to-br from-slate-800 to-slate-950 p-8 rounded-[3rem] text-white shadow-xl relative overflow-hidden group/tile">
                    <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/5 rounded-full group-hover/tile:scale-150 transition-transform duration-700"></div>
                    <div className="inner-content-3d relative z-10 flex flex-col justify-between h-full">
                        <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-10">
                            <UserGroupIcon className="w-8 h-8 text-cyan-400" />
                        </div>
                        <div>
                            <span className="text-5xl font-black block leading-none mb-2">{stats.total}</span>
                            <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">TOTAL DATABASE</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Dynamic Search & Table Section */}
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="relative w-full md:max-w-md group">
                    <MagnifyingGlassIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-cyan-400 transition-colors" />
                    <input 
                      type="text" 
                      placeholder="Cari Nama Siswa atau NIS..." 
                      value={searchTerm} 
                      onChange={(e) => setSearchTerm(e.target.value)} 
                      className="w-full pl-16 pr-8 py-6 bg-white border border-slate-100 rounded-[2rem] text-sm font-bold outline-none shadow-sm transition-all focus:border-cyan-400 focus:shadow-xl focus:shadow-cyan-400/5" 
                    />
                </div>
                
                <div className="flex items-center gap-3 px-6 py-3 bg-cyan-50 border border-cyan-100 rounded-2xl">
                    <SparklesIcon className="w-5 h-5 text-cyan-600 animate-pulse" />
                    <span className="text-[10px] font-black text-cyan-600 uppercase tracking-widest">ENTRY KETERANGAN MANUAL AKTIF</span>
                </div>
            </div>

            <div className="bg-white rounded-[3.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[1000px]">
                      <thead>
                          <tr className="bg-slate-50">
                              <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Data Siswa</th>
                              <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Log Status</th>
                              <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Keterangan Detail</th>
                              <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Aksi Manual</th>
                              <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Integrasi WA</th>
                          </tr>
                      </thead>
                      <tbody>
                          {filteredData.map((record) => (
                              <tr key={record.student.id} className="border-t border-slate-50 group hover:bg-slate-50 transition-all">
                                  <td className="px-10 py-8">
                                      <div className="flex items-center gap-5">
                                          <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-cyan-400 font-black text-sm shadow-lg group-hover:scale-110 transition-transform">
                                              {record.student.name.charAt(0)}
                                          </div>
                                          <div>
                                              <p className="font-black text-slate-900 text-sm leading-none mb-1.5">{record.student.name}</p>
                                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">NIS: {record.student.rollNumber} • {record.student.className || '-'}</p>
                                          </div>
                                      </div>
                                  </td>
                                  <td className="px-10 py-8 text-center">
                                      <div className="flex flex-col items-center">
                                          <span className={`text-xs font-black px-3 py-1 rounded-lg ${
                                            record.status === AttendanceStatus.Present ? 'bg-emerald-50 text-emerald-600' :
                                            record.status === AttendanceStatus.Sick ? 'bg-amber-50 text-amber-600' :
                                            record.status === AttendanceStatus.Permit ? 'bg-indigo-50 text-indigo-600' :
                                            'bg-rose-50 text-rose-600'
                                          }`}>
                                              {record.status === AttendanceStatus.Present ? 'HADIR' : (record.status === AttendanceStatus.Sick ? 'SAKIT' : (record.status === AttendanceStatus.Permit ? 'IJIN' : 'ALFA'))}
                                          </span>
                                          {record.scanTime && <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">IN: {new Date(record.scanTime).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}</span>}
                                          {record.pulangTime && <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">OUT: {new Date(record.pulangTime).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}</span>}
                                      </div>
                                  </td>
                                  <td className="px-10 py-8">
                                      <span className={`inline-block px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm ${record.status === AttendanceStatus.Absent ? 'bg-rose-50 text-rose-500 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                                          {getDetailedStatus(record)}
                                      </span>
                                  </td>
                                  <td className="px-10 py-8 text-center">
                                      <div className="flex items-center justify-center gap-2">
                                          {record.status === AttendanceStatus.Absent ? (
                                              <>
                                                  <button 
                                                    onClick={() => setManualStatus(record.student.id, selectedDate, AttendanceStatus.Sick)}
                                                    className="p-3 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-500 hover:text-white transition-all shadow-sm group/btn"
                                                    title="Tandai Sakit"
                                                  >
                                                      <HeartIcon className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                                                  </button>
                                                  <button 
                                                    onClick={() => setManualStatus(record.student.id, selectedDate, AttendanceStatus.Permit)}
                                                    className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-500 hover:text-white transition-all shadow-sm group/btn"
                                                    title="Tandai Ijin"
                                                  >
                                                      <HandRaisedIcon className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                                                  </button>
                                              </>
                                          ) : (
                                              <button 
                                                onClick={() => {
                                                  if(window.confirm(`Hapus keterangan manual untuk ${record.student.name}?`)) {
                                                      setManualStatus(record.student.id, selectedDate, AttendanceStatus.Absent);
                                                  }
                                                }}
                                                className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-200 transition-all shadow-sm"
                                                title="Reset Status"
                                              >
                                                  <ResetIcon className="w-5 h-5" />
                                              </button>
                                          )}
                                      </div>
                                  </td>
                                  <td className="px-10 py-8 text-right">
                                      <div className="flex flex-col gap-2 items-end">
                                          {record.student.parentContact && (
                                              <button 
                                                onClick={() => handleManualNotify(record.student, record.status, selectedDate, generalSettings, record.scanTime, record.minutesLate, false, false)} 
                                                className="px-5 py-2 bg-emerald-100 text-emerald-700 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-sm active:scale-95"
                                              >
                                                  WA MASUK
                                              </button>
                                          )}
                                          {record.student.parentContact && record.pulangTime && (
                                              <button 
                                                onClick={() => {
                                                  const isEarly = isEarlyDeparture(record.student, record.pulangTime);
                                                  handleManualNotify(record.student, record.status, selectedDate, generalSettings, record.pulangTime, 0, isEarly, true);
                                                }} 
                                                className="px-5 py-2 bg-indigo-100 text-indigo-700 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all shadow-sm active:scale-95"
                                              >
                                                  WA PULANG
                                              </button>
                                          )}
                                      </div>
                                  </td>
                              </tr>
                            ))}
                      </tbody>
                  </table>
                </div>
            </div>
        </div>
      </div>
    </PullToRefresh>
  );
};

export default AttendanceReport;

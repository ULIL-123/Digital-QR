
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useData } from '../context/DataContext';
import { getTodayDateString } from '../utils/dateUtils';
import { CheckCircleIcon, XCircleIcon, CameraIcon, SignalIcon, ClockIcon, PrinterIcon, QrCodeIcon, UserIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import { printAttendanceSlip } from '../utils/print';
import { useHardwareScanner } from '../hooks/useHardwareScanner';

declare var Html5Qrcode: any;

const AttendanceScanner: React.FC = () => {
  const { markAttendance, generalSettings, students } = useData();
  const [scanResult, setScanResult] = useState<any>(null);
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [hardwarePulse, setHardwarePulse] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  const isProcessing = useRef(false);
  const scannerRef = useRef<any>(null);
  const cooldownInterval = useRef<any>(null);

  const triggerAbsensi = useCallback(async (id: string, method: 'QR' | 'RFID') => {
    if (isProcessing.current || cooldownTime > 0) return;
    
    isProcessing.current = true;
    setHardwarePulse(true);
    setTimeout(() => setHardwarePulse(false), 600);

    const today = getTodayDateString();
    const result = await markAttendance(id, today, method);

    if (typeof result === 'string') {
      setScanResult({ name: 'Akses Ditolak', status: 'error', message: result });
      startCooldown(2);
    } else if (result && result.student) {
      const typeLabel = result.type === 'Pulang' ? 'PULANG' : 'HADIR';
      const lateMsg = result.type === 'Hadir' 
        ? (result.late && result.late > 0 ? `Telat ${result.late} Menit` : `Tepat Waktu`)
        : `Berhasil`;
      
      const isLate = result.type === 'Hadir' && (result.late || 0) > 0;
      
      setScanResult({ 
        name: result.student.name, 
        status: 'success', 
        message: `${typeLabel} (${method}) - ${lateMsg}`,
        isLate: isLate,
        type: result.type,
        method: method,
        student: result.student,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });

      if (generalSettings.printer?.autoPrintSlip && result.record && result.type === 'Hadir') {
        printAttendanceSlip(result.student, result.record, generalSettings);
      }
      
      startCooldown(3); 
    } else {
      setScanResult({ name: 'ID Tidak Dikenal', status: 'error', message: 'Kartu/QR Tidak Terdaftar' });
      startCooldown(2);
    }

    isProcessing.current = false;
  }, [cooldownTime, markAttendance, generalSettings]);

  const startCooldown = (seconds: number) => {
    setCooldownTime(seconds);
    if (cooldownInterval.current) clearInterval(cooldownInterval.current);
    
    cooldownInterval.current = setInterval(() => {
      setCooldownTime((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownInterval.current);
          setScanResult(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useHardwareScanner((code) => {
    if (cooldownTime > 0) return;
    const matchedStudentByRfid = students.find(s => s.rfidTag === code);
    const determinedMethod = matchedStudentByRfid ? 'RFID' : 'QR';
    triggerAbsensi(code, determinedMethod);
  }, { 
    enabled: true, 
    ignoreInputs: true 
  });

  useEffect(() => {
    if (isScannerActive) {
      const startScanner = async () => {
        try {
          scannerRef.current = new Html5Qrcode("reader", { 
            verbose: false,
            formatsToSupport: [ 0, 5, 3, 8, 7, 6, 11 ] 
          });

          await scannerRef.current.start(
            { facingMode: "environment" },
            { 
              fps: 20,
              qrbox: (viewWidth: number, viewHeight: number) => {
                const width = Math.min(viewWidth, viewHeight) * 0.9;
                const height = Math.min(viewWidth, viewHeight) * 0.55; 
                return { width: width, height: height };
              },
              aspectRatio: 1.0
            },
            (decodedText: string) => {
              triggerAbsensi(decodedText, 'QR');
            },
            () => {} 
          );
        } catch (err) {
          setIsScannerActive(false);
          alert("Gagal mengakses kamera. Mohon izinkan akses kamera.");
        }
      };
      startScanner();
    }

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().then(() => scannerRef.current.clear()).catch(() => {});
      }
    };
  }, [isScannerActive, triggerAbsensi]);

  return (
    <div className="flex flex-col items-center gap-6 animate-fade-in-up pb-24">
      <div className="w-full max-w-2xl">
        <div className={`relative overflow-hidden bg-white rounded-[3rem] shadow-2xl border-4 transition-all duration-500 transform ${
          !scanResult ? 'border-slate-100 p-8 text-center' : 
          scanResult.status === 'success' 
            ? (scanResult.type === 'Pulang' ? 'border-emerald-400 scale-[1.02]' : (scanResult.isLate ? 'border-amber-400 scale-[1.02]' : 'border-indigo-400 scale-[1.02]')) 
            : 'border-rose-400 shake-animation'
        }`}>
          {!scanResult ? (
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-300 shadow-inner">
                <QrCodeIcon className="w-12 h-12" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">SISTEM SIAP PINDAI</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2 italic">Support: PANDA PRJ-220 & RFID Scanners</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 sm:p-8">
              <div className={`w-32 h-32 rounded-[2.5rem] flex items-center justify-center shrink-0 shadow-2xl relative overflow-hidden border-4 ${
                scanResult.status === 'success' ? 'border-white' : 'border-rose-50 bg-rose-500 text-white'
              }`}>
                {scanResult.status === 'success' ? (
                  <>
                    {scanResult.student?.profilePicture ? (
                      <img src={scanResult.student.profilePicture} className="w-full h-full object-cover" alt="Student" />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center font-black text-4xl text-white ${
                          scanResult.type === 'Pulang' ? 'bg-emerald-500' : (scanResult.isLate ? 'bg-amber-500' : 'bg-indigo-500')
                      }`}>
                        {scanResult.name.charAt(0)}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center animate-check-pop">
                      <CheckCircleIcon className="w-16 h-16 text-white drop-shadow-lg" />
                    </div>
                  </>
                ) : (
                  <div className="animate-error-pop">
                    <XCircleIcon className="w-16 h-16" />
                  </div>
                )}
                
                {scanResult.status === 'success' && (
                  <div className="absolute bottom-2 right-2 bg-white p-2 rounded-2xl shadow-xl border border-slate-100 scale-110">
                    {scanResult.method === 'RFID' ? <SignalIcon className="w-4 h-4 text-cyan-500" /> : <QrCodeIcon className="w-4 h-4 text-indigo-500" />}
                  </div>
                )}
              </div>

              <div className="flex-grow text-center sm:text-left">
                <div className="flex justify-center sm:justify-between items-center mb-3">
                   <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full shadow-sm ${
                     scanResult.status === 'success' 
                        ? (scanResult.type === 'Pulang' ? 'bg-emerald-500 text-white' : (scanResult.isLate ? 'bg-amber-500 text-white' : 'bg-slate-900 text-white'))
                        : 'bg-rose-500 text-white'
                   }`}>
                     {scanResult.status === 'success' ? `${scanResult.type} TERDATA` : 'GAGAL PINDAI'}
                   </span>
                   <span className="hidden sm:block text-[10px] font-black text-slate-400 uppercase tracking-widest">{scanResult.time}</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 leading-none uppercase mb-2 line-clamp-1">{scanResult.name}</h2>
                <div className="flex flex-wrap justify-center sm:justify-start gap-3 mb-3">
                    <p className="px-2 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-widest">NIS: {scanResult.student?.rollNumber || '-'}</p>
                    <p className="px-2 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-widest">KELAS: {scanResult.student?.className || '-'}</p>
                </div>
                <p className={`text-sm font-black uppercase tracking-widest flex items-center justify-center sm:justify-start gap-2 ${
                   scanResult.status === 'success' ? (scanResult.isLate ? 'text-amber-500' : 'text-emerald-500') : 'text-rose-500'
                }`}>
                    {scanResult.status === 'success' && (scanResult.isLate ? <ClockIcon className="w-4 h-4"/> : <CheckCircleIcon className="w-4 h-4"/>)}
                    {scanResult.message}
                </p>
              </div>

              {cooldownTime > 0 && (
                <div className="flex flex-col items-center gap-1 border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-8 shrink-0">
                  <div className="relative w-16 h-16">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="32" cy="32" r="28" fill="none" stroke="#f1f5f9" strokeWidth="6" />
                      <circle cx="32" cy="32" r="28" fill="none" stroke={scanResult.status === 'success' ? "#22d3ee" : "#f43f5e"} strokeWidth="6" strokeDasharray="175.84" strokeDashoffset={175.84 - (175.84 * cooldownTime / 3)} className="transition-all duration-1000 linear" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-black text-slate-900">{cooldownTime}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="w-full max-w-2xl bg-slate-950 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden border border-white/5">
        <div className={`absolute inset-0 bg-cyan-400/5 transition-all duration-700 blur-[80px] ${hardwarePulse ? 'opacity-100 scale-150' : 'opacity-0 scale-100'}`}></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
             <div className={`w-16 h-16 rounded-[1.8rem] flex items-center justify-center transition-all duration-500 ${hardwarePulse ? 'bg-cyan-400 shadow-[0_0_30px_#22d3ee]' : 'bg-white/5 shadow-inner'}`}>
                <SignalIcon className={`w-8 h-8 ${hardwarePulse ? 'text-slate-950' : 'text-cyan-400'}`} />
             </div>
             <div>
                <h2 className="text-white font-black tracking-widest text-xl uppercase leading-none">PANDA PRJ-220 ENGINE</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2">EXTERNAL HARDWARE AUTO-DETECT</p>
             </div>
          </div>
          <div className="flex items-center gap-4 px-6 py-3 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
             <div className={`w-2.5 h-2.5 rounded-full ${cooldownTime > 0 ? 'bg-amber-500' : 'bg-emerald-400 animate-pulse shadow-[0_0_12px_#10b981]'}`}></div>
             <p className="text-[10px] font-black text-cyan-50 text-glow tracking-widest uppercase">
               {cooldownTime > 0 ? `COOLING DOWN` : 'LISTENING...'}
             </p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-2xl bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col items-center gap-8">
          <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4">
            <div className="text-center sm:text-left">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">Kamera Mobile (Opsional)</h3>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest mt-1">Multi-Format: 1D & 2D QR</p>
            </div>
          </div>

          <button 
            onClick={() => setIsScannerActive(!isScannerActive)} 
            disabled={cooldownTime > 0}
            className={`w-full py-6 rounded-[2rem] font-black text-sm tracking-[0.3em] uppercase flex items-center justify-center gap-4 transition-all duration-300 shadow-2xl active:scale-95 disabled:opacity-50 ${isScannerActive ? 'bg-rose-50 text-rose-500 border border-rose-100' : 'bg-slate-900 text-white hover:bg-black'}`}
          >
            {isScannerActive ? <XCircleIcon className="w-6 h-6" /> : <CameraIcon className="w-6 h-6" />}
            {isScannerActive ? 'NONAKTIFKAN KAMERA' : 'BUKA PEMINDAI KAMERA'}
          </button>

          {isScannerActive && (
              <div className="w-full aspect-square bg-slate-950 rounded-[3rem] overflow-hidden border-8 border-slate-50 relative group shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
                  <div id="reader" className="w-full h-full scale-125"></div>
                  <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-400/60 shadow-[0_0_20px_#22d3ee] z-20 animate-[scan_3s_ease-in-out_infinite]"></div>
                  
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-30">
                      <div className="w-[85%] h-[40%] border-2 border-white/20 rounded-[2rem] relative shadow-[0_0_0_1000px_rgba(2,6,23,0.5)]">
                          <div className="absolute -top-1 -left-1 w-12 h-12 border-t-8 border-l-8 border-cyan-400 rounded-tl-2xl"></div>
                          <div className="absolute -top-1 -right-1 w-12 h-12 border-t-8 border-r-8 border-cyan-400 rounded-tr-2xl"></div>
                          <div className="absolute -bottom-1 -left-1 w-12 h-12 border-b-8 border-l-8 border-cyan-400 rounded-bl-2xl"></div>
                          <div className="absolute -bottom-1 -right-1 w-12 h-12 border-b-8 border-r-8 border-cyan-400 rounded-br-2xl"></div>
                      </div>
                  </div>
              </div>
          )}
      </div>

      <style>{`
        @keyframes check-pop {
          0% { transform: scale(0); opacity: 0; }
          70% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes error-pop {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-check-pop { animation: check-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .animate-error-pop { animation: error-pop 0.4s ease-out forwards; }
        @keyframes scan {
          0% { top: 10%; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { top: 90%; opacity: 0; }
        }
        .text-glow { text-shadow: 0 0 10px rgba(34, 211, 238, 0.5); }
        .shake-animation { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
      `}</style>
    </div>
  );
};

export default AttendanceScanner;

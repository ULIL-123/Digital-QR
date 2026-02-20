
import React, { createContext, useContext, ReactNode, useCallback, useMemo, useEffect, useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Student, AttendanceRecord, AttendanceStatus, ApiConfig, BackupData, GeneralSettings } from '../types';
import * as GoogleDrive from '../utils/googleDrive';

interface DataContextType {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  deletedStudents: Student[];
  setDeletedStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  attendance: AttendanceRecord[];
  setAttendance: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
  apiConfig: ApiConfig;
  setApiConfig: (config: ApiConfig) => void;
  generalSettings: GeneralSettings;
  setGeneralSettings: (settings: GeneralSettings) => void;
  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  bulkDeleteStudents: (ids: string[]) => void;
  restoreStudent: (id: string) => void;
  bulkRestoreStudents: (ids: string[]) => void;
  permanentlyDeleteStudent: (id: string) => void;
  bulkPermanentlyDeleteStudents: (ids: string[]) => void;
  markAttendance: (studentId: string, date: string, method: 'QR' | 'RFID') => Promise<{ student: Student, late?: number, record?: AttendanceRecord, type?: 'Hadir' | 'Pulang', isEarly?: boolean } | null | string>;
  setManualStatus: (studentId: string, date: string, status: AttendanceStatus) => void;
  getAttendanceForDate: (date: string) => { student: Student, status: AttendanceStatus, scanTime?: string, pulangTime?: string, minutesLate?: number }[];
  clearAllAttendance: () => void;
  exportDatabase: () => void;
  importDatabase: (jsonData: string) => boolean;
  backupToCloud: () => Promise<{ success: boolean, message: string }>;
  restoreFromCloud: () => Promise<{ success: boolean, message: string }>;
  syncToHub: () => Promise<{ success: boolean, message: string }>;
  pullFromHub: () => Promise<{ success: boolean, message: string }>;
  backupToDrive: (clientId: string, apiKey: string) => Promise<{ success: boolean, message: string }>;
  restoreFromDrive: (clientId: string, apiKey: string) => Promise<{ success: boolean, message: string }>;
  testNotification: (method: 'WhatsApp' | 'Webhook' | 'Telegram', config: any) => Promise<{success: boolean, message: string}>;
  sendAnnouncement: (message: string) => Promise<{ success: number, fail: number }>;
  isSyncing: boolean;
  unsyncedCount: number;
  manualSync: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [students, setStudents] = useLocalStorage<Student[]>('hadirku_students_v3', []);
  const [deletedStudents, setDeletedStudents] = useLocalStorage<Student[]>('hadirku_deleted_students_v3', []);
  const [attendance, setAttendance] = useLocalStorage<AttendanceRecord[]>('hadirku_attendance_v3', []);
  const [apiConfig, setApiConfig] = useLocalStorage<ApiConfig>('hadirku_config_v3', { 
    baseUrl: 'https://ulil-abshor-apk.vercel.app', 
    enabled: true,
    hubUrl: 'https://hub.hadirku-digital.com',
    autoHubSync: false
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [generalSettings, setGeneralSettings] = useLocalStorage<GeneralSettings>('hadirku_brand_v3', {
    schoolName: 'SDN 4 Kronggen',
    shortName: 'Digital',
    tagline: 'CREATIVE, DISCIPLINE AND NOBLE-CHARACTER',
    principalName: '',
    principalNip: '',
    teacher1: { name: '', nip: '' },
    teacher2: { name: '', nip: '' },
    teacher3: { name: '', nip: '' },
    teacher4: { name: '', nip: '' },
    teacher5: { name: '', nip: '' },
    teacher6: { name: '', nip: '' },
    teacher7: { name: '', nip: '' },
    teacher8: { name: '', nip: '' },
    teacher9: { name: '', nip: '' },
    teacher10: { name: '', nip: '' },
    notifications: {
      autoNotify: true,
      method: 'WhatsApp',
      apiEndpoint: 'https://api.fonnte.com/send'
    },
    printer: {
      autoPrintSlip: false,
      autoSavePdf: false,
      slipTitle: 'BUKTI PRESENSI SISWA',
      printerType: 'standard'
    },
    timeSettings: {
      startAttendance: '06:30',
      onTimeEnd: '07:15',
      lateEndLimit: '09:00',
      returnEarlyStart: '09:00',
      returnLimit: '17:00',
      onTimePulangStart: '12:10',
      onTimePulangStartClass12: '10:45'
    }
  });

  const unsyncedCount = useMemo(() => attendance.filter(a => !a.synced).length, [attendance]);

  const syncRecord = useCallback(async (record: AttendanceRecord) => {
    if (!apiConfig.enabled || !apiConfig.baseUrl) return false;
    try {
      const response = await fetch(`${apiConfig.baseUrl}/api/attendance/scan`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': apiConfig.apiKey ? `Bearer ${apiConfig.apiKey}` : ''
        },
        body: JSON.stringify(record)
      });
      return response.ok;
    } catch (err) {
      return false;
    }
  }, [apiConfig]);

  const backupToCloud = useCallback(async () => {
    if (!apiConfig.baseUrl) return { success: false, message: 'Base URL Cloud belum diatur.' };
    try {
      const data: BackupData = { 
        version: 3, 
        timestamp: new Date().toISOString(), 
        students, 
        attendance,
        deletedStudents,
        generalSettings,
        apiConfig
      };
      const response = await fetch(`${apiConfig.baseUrl}/api/backup/push`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': apiConfig.apiKey ? `Bearer ${apiConfig.apiKey}` : ''
        },
        body: JSON.stringify(data)
      });
      if (response.ok) return { success: true, message: 'Backup Cloud Berhasil!' };
      return { success: false, message: 'Gagal mengunggah backup ke server.' };
    } catch (err) {
      return { success: false, message: 'Terjadi kesalahan koneksi cloud.' };
    }
  }, [apiConfig, students, attendance, deletedStudents, generalSettings]);

  const restoreFromCloud = useCallback(async () => {
    if (!apiConfig.baseUrl) return { success: false, message: 'Base URL Cloud belum diatur.' };
    try {
      const response = await fetch(`${apiConfig.baseUrl}/api/backup/pull`, {
        headers: { 'Authorization': apiConfig.apiKey ? `Bearer ${apiConfig.apiKey}` : '' }
      });
      if (response.ok) {
        const data: BackupData = await response.json();
        if (data.students && Array.isArray(data.students)) {
          setStudents(data.students);
          setAttendance(data.attendance || []);
          if (data.deletedStudents) setDeletedStudents(data.deletedStudents);
          if (data.generalSettings) setGeneralSettings(data.generalSettings);
          if (data.apiConfig) setApiConfig(data.apiConfig);
          return { success: true, message: 'Database Cloud Berhasil Dipulihkan!' };
        }
      }
      return { success: false, message: 'Data cloud tidak valid atau kosong.' };
    } catch (err) {
      return { success: false, message: 'Gagal mengunduh data dari cloud.' };
    }
  }, [apiConfig, setStudents, setAttendance, setDeletedStudents, setGeneralSettings, setApiConfig]);

  // CloudDatabaseHub Feature
  const syncToHub = useCallback(async () => {
    if (!apiConfig.hubUrl || !apiConfig.hubToken) return { success: false, message: 'Konfigurasi Hub belum lengkap.' };
    try {
      const data: BackupData = { 
        version: 4, 
        timestamp: new Date().toISOString(), 
        students, 
        attendance,
        deletedStudents,
        generalSettings,
        apiConfig
      };
      const response = await fetch(`${apiConfig.hubUrl}/api/v1/sync`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Hub-Token': apiConfig.hubToken
        },
        body: JSON.stringify(data)
      });
      if (response.ok) return { success: true, message: 'Sinkronisasi Hub Berhasil!' };
      return { success: false, message: 'Hub menolak koneksi (Token salah).' };
    } catch (err) {
      return { success: false, message: 'Gagal terhubung ke CloudDatabaseHub.' };
    }
  }, [apiConfig, students, attendance, deletedStudents, generalSettings]);

  const pullFromHub = useCallback(async () => {
    if (!apiConfig.hubUrl || !apiConfig.hubToken) return { success: false, message: 'Konfigurasi Hub belum lengkap.' };
    try {
      const response = await fetch(`${apiConfig.hubUrl}/api/v1/pull`, {
        headers: { 'X-Hub-Token': apiConfig.hubToken }
      });
      if (response.ok) {
        const data: BackupData = await response.json();
        if (data.students) {
          setStudents(data.students);
          setAttendance(data.attendance || []);
          return { success: true, message: 'Data dari Hub berhasil diunduh!' };
        }
      }
      return { success: false, message: 'Gagal menarik data dari Hub.' };
    } catch (err) {
      return { success: false, message: 'Koneksi Hub Error.' };
    }
  }, [apiConfig, setStudents, setAttendance]);

  const backupToDrive = useCallback(async (clientId: string, apiKey: string) => {
    try {
      const tokenClient = await GoogleDrive.initGapiClient(apiKey, clientId, () => {});
      return new Promise<{ success: boolean, message: string }>((resolve) => {
        GoogleDrive.handleAuthClick(tokenClient, async () => {
          const content = JSON.stringify({
            version: 4,
            timestamp: new Date().toISOString(),
            students,
            attendance,
            deletedStudents,
            generalSettings,
            apiConfig
          });
          await GoogleDrive.uploadBackupFile(content);
          resolve({ success: true, message: 'Backup Google Drive Berhasil!' });
        });
      });
    } catch (err) {
      return { success: false, message: 'Gagal backup ke Drive: ' + (err as Error).message };
    }
  }, [students, attendance, deletedStudents, generalSettings, apiConfig]);

  const restoreFromDrive = useCallback(async (clientId: string, apiKey: string) => {
    try {
      const tokenClient = await GoogleDrive.initGapiClient(apiKey, clientId, () => {});
      return new Promise<{ success: boolean, message: string }>((resolve) => {
        GoogleDrive.handleAuthClick(tokenClient, async () => {
          const files = await GoogleDrive.listBackupFiles();
          if (files.length === 0) {
            resolve({ success: false, message: 'Tidak ada file backup di Google Drive.' });
            return;
          }
          const content = await GoogleDrive.downloadBackupFile(files[0].id);
          const data = typeof content === 'string' ? JSON.parse(content) : content;
          
          if (data.students && Array.isArray(data.students)) {
            setStudents(data.students);
            setAttendance(data.attendance || []);
            if (data.deletedStudents) setDeletedStudents(data.deletedStudents);
            if (data.generalSettings) setGeneralSettings(data.generalSettings);
            if (data.apiConfig) setApiConfig(data.apiConfig);
            resolve({ success: true, message: 'Restore Google Drive Berhasil!' });
          } else {
            resolve({ success: false, message: 'Format file backup tidak valid.' });
          }
        });
      });
    } catch (err) {
      return { success: false, message: 'Gagal restore dari Drive: ' + (err as Error).message };
    }
  }, [setStudents, setAttendance, setDeletedStudents, setGeneralSettings, setApiConfig]);

  const manualSync = useCallback(async () => {
    if (!navigator.onLine || !apiConfig.enabled || !apiConfig.baseUrl || isSyncing) return;
    const unsyncedIndices = attendance.reduce((acc, a, idx) => {
      if (!a.synced) acc.push(idx);
      return acc;
    }, [] as number[]);
    if (unsyncedIndices.length === 0) return;
    setIsSyncing(true);
    let hasChanges = false;
    const updatedAttendance = [...attendance];
    for (const idx of unsyncedIndices) {
      const success = await syncRecord(updatedAttendance[idx]);
      if (success) {
        updatedAttendance[idx] = { ...updatedAttendance[idx], synced: true };
        hasChanges = true;
      }
    }
    if (hasChanges) setAttendance(updatedAttendance);
    setIsSyncing(false);
  }, [attendance, apiConfig, syncRecord, setAttendance, isSyncing]);

  const sendAutomation = useCallback(async (student: Student, method: 'QR' | 'RFID' | 'MANUAL', minutesLate: number, type: 'Hadir' | 'Pulang' = 'Hadir', isEarly: boolean = false, status: AttendanceStatus = AttendanceStatus.Present) => {
    const config = generalSettings.notifications;
    if (!config || !config.autoNotify || !student.parentContact) {
      return;
    }
    
    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    let message = '';
    
    if (status === AttendanceStatus.Sick || status === AttendanceStatus.Permit) {
      const statusLabel = status === AttendanceStatus.Sick ? 'SAKIT' : 'IJIN';
      message = `🔔 *NOTIFIKASI KETERANGAN SISWA*\n` +
                `------------------------------------------\n` +
                `Ananda: *${student.name}*\n` +
                `NIS: ${student.rollNumber}\n` +
                `Kelas: ${student.className || '-'}\n\n` +
                `Tanggal: ${dateStr}\n` +
                `*STATUS: ${statusLabel}*\n` +
                `------------------------------------------\n` +
                `Sekolah: *${generalSettings.schoolName}*\n` +
                `_Pesan otomatis Sistem Hadirku Digital._`;
    } else if (type === 'Hadir') {
      const lateInfo = minutesLate > 0 
        ? `\n⏰ *STATUS:* DATANG TERLAMBAT (${minutesLate} menit)` 
        : `\n✅ *STATUS:* HADIR TEPAT WAKTU`;
      
      message = `🔔 *NOTIFIKASI KEHADIRAN SISWA*\n` +
                `------------------------------------------\n` +
                `Ananda: *${student.name}*\n` +
                `NIS: ${student.rollNumber}\n` +
                `Kelas: ${student.className || '-'}\n\n` +
                `Tanggal: ${dateStr}\n` +
                `Jam Scan: ${timeStr} WIB\n` +
                `Metode: ${method}${lateInfo}\n` +
                `------------------------------------------\n` +
                `Sekolah: *${generalSettings.schoolName}*\n` +
                `_Pesan otomatis Sistem Hadirku Digital._`;
    } else {
      const earlyInfo = isEarly 
        ? `\n⚠️ *KETERANGAN:* PULANG MENDAHULUI` 
        : `\n✅ *KETERANGAN:* PULANG TEPAT WAKTU`;
      
      message = `🔔 *NOTIFIKASI KEPULANGAN SISWA*\n` +
                `------------------------------------------\n` +
                `Ananda: *${student.name}*\n` +
                `NIS: ${student.rollNumber}\n` +
                `Kelas: ${student.className || '-'}\n\n` +
                `Tanggal: ${dateStr}\n` +
                `Jam Scan: ${timeStr} WIB\n` +
                `*STATUS: TELAH PULANG SEKOLAH*${earlyInfo}\n` +
                `------------------------------------------\n` +
                `Sekolah: *${generalSettings.schoolName}*\n` +
                `_Pesan otomatis Sistem Hadirku Digital._`;
    }
    
    try {
      if (config.method === 'WhatsApp' && config.apiKey && config.apiEndpoint) {
        const cleanNumber = student.parentContact.replace(/\D/g, '');
        const finalNumber = cleanNumber.startsWith('0') ? '62' + cleanNumber.slice(1) : (cleanNumber.startsWith('62') ? cleanNumber : '62' + cleanNumber);
        
        await fetch(config.apiEndpoint, {
          method: 'POST',
          headers: { 'Authorization': config.apiKey },
          body: new URLSearchParams({ 'target': finalNumber, 'message': message, 'delay': '2' })
        });
      } else if (config.method === 'Telegram' && config.apiKey) {
        await fetch(`https://api.telegram.org/bot${config.apiKey}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: student.parentContact, text: message, parse_mode: 'Markdown' })
        });
      }
    } catch (err) { 
      console.error("Automation error:", err); 
    }
  }, [generalSettings]);

  const addStudent = useCallback((studentData: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      ...studentData,
      id: `std-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    setStudents(prev => [...prev, newStudent]);
  }, [setStudents]);

  const updateStudent = useCallback((id: string, updates: Partial<Student>) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, [setStudents]);

  const deleteStudent = useCallback((id: string) => {
    setStudents(prev => {
      const studentToTrash = prev.find(s => s.id === id);
      if (studentToTrash) setDeletedStudents(d => [...d, studentToTrash]);
      return prev.filter(s => id !== s.id);
    });
  }, [setStudents, setDeletedStudents]);

  const bulkDeleteStudents = useCallback((ids: string[]) => {
    setStudents(prev => {
      const toDelete = prev.filter(s => ids.includes(s.id));
      setDeletedStudents(d => [...d, ...toDelete]);
      return prev.filter(s => !ids.includes(s.id));
    });
  }, [setStudents, setDeletedStudents]);

  const restoreStudent = useCallback((id: string) => {
    setDeletedStudents(prev => {
      const studentToRestore = prev.find(s => id === s.id);
      if (studentToRestore) setStudents(s => [...s, studentToRestore]);
      return prev.filter(s => s.id !== id);
    });
  }, [setStudents, setDeletedStudents]);

  const bulkRestoreStudents = useCallback((ids: string[]) => {
    setDeletedStudents(prev => {
      const found = prev.filter(s => ids.includes(s.id));
      setStudents(s => [...s, ...found]);
      return prev.filter(s => !ids.includes(s.id));
    });
  }, [setStudents, setDeletedStudents]);

  const permanentlyDeleteStudent = useCallback((id: string) => {
    setDeletedStudents(prev => prev.filter(s => s.id !== id));
    setAttendance(prev => prev.filter(a => a.studentId !== id));
  }, [setDeletedStudents, setAttendance]);

  const bulkPermanentlyDeleteStudents = useCallback((ids: string[]) => {
    setDeletedStudents(prev => prev.filter(s => !ids.includes(s.id)));
    setAttendance(prev => prev.filter(a => !ids.includes(a.studentId)));
  }, [setDeletedStudents, setAttendance]);

  const markAttendance = useCallback(async (studentId: string, date: string, method: 'QR' | 'RFID'): Promise<{ student: Student, late?: number, record?: AttendanceRecord, type?: 'Hadir' | 'Pulang', isEarly?: boolean } | null | string> => {
    const now = new Date();
    const student = students.find(s => s.id === studentId || s.rfidTag === studentId || s.rollNumber === studentId);
    if (!student) return null;

    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const timeInMinutes = currentHour * 60 + currentMin;

    const parseTime = (timeStr: string, defaultMins: number) => {
      if (!timeStr) return defaultMins;
      const [h, m] = timeStr.split(':').map(Number);
      return (isNaN(h) || isNaN(m)) ? defaultMins : h * 60 + m;
    };

    const ts = generalSettings.timeSettings;
    const startAttendance = parseTime(ts?.startAttendance || '06:30', 6 * 60 + 30);
    const onTimeEnd = parseTime(ts?.onTimeEnd || '07:15', 7 * 60 + 15);
    const lateEndLimit = parseTime(ts?.lateEndLimit || '09:00', 9 * 60);
    const returnEarlyStart = parseTime(ts?.returnEarlyStart || '09:00', 9 * 60);
    const returnLimit = parseTime(ts?.returnLimit || '17:00', 17 * 60);

    const existingRecord = attendance.find(r => r.studentId === student.id && r.date === date);

    if (existingRecord) {
        if (existingRecord.status !== AttendanceStatus.Present) {
          return `Siswa sudah memiliki keterangan: ${existingRecord.status === AttendanceStatus.Sick ? 'SAKIT' : 'IJIN'}.`;
        }
        if (!existingRecord.pulangTime) {
            if (timeInMinutes < returnEarlyStart) {
                return `Scan pulang belum tersedia. Minimal pkl ${ts?.returnEarlyStart || '09:00'}.`;
            }
            if (timeInMinutes > returnLimit) {
                return `Waktu scan pulang sudah berakhir (Max ${ts?.returnLimit || '17:00'}).`;
            }

            const isClass12 = student.className?.startsWith('1') || student.className?.startsWith('2');
            const onTimePulangStart = isClass12 
              ? parseTime(ts?.onTimePulangStartClass12 || '10:45', 10 * 60 + 45) 
              : parseTime(ts?.onTimePulangStart || '12:10', 12 * 60 + 10);
            
            const isEarly = timeInMinutes < onTimePulangStart;
            const updatedRecord = { ...existingRecord, pulangTime: now.toISOString(), synced: false };
            setAttendance(prev => prev.map(a => (a.studentId === student.id && a.date === date) ? updatedRecord : a));
            
            sendAutomation(student, method, updatedRecord.minutesLate || 0, 'Pulang', isEarly);
            syncRecord(updatedRecord);
            return { student, record: updatedRecord, type: 'Pulang', isEarly };
        } else {
            return "Anda sudah melakukan presensi masuk dan pulang hari ini.";
        }
    } else {
        if (timeInMinutes < startAttendance) {
            return `Presensi belum dibuka. Silakan tunggu pukul ${ts?.startAttendance || '06:30'}.`;
        }

        if (timeInMinutes > lateEndLimit) {
            return `Waktu scan masuk sudah berakhir (Max ${ts?.lateEndLimit || '09:00'}).`;
        }

        let minutesLate = 0;
        if (timeInMinutes > onTimeEnd) {
            minutesLate = timeInMinutes - onTimeEnd;
        }

        const newRecord: AttendanceRecord = { 
            studentId: student.id, 
            date, 
            status: AttendanceStatus.Present, 
            method, 
            scanTime: now.toISOString(), 
            minutesLate, 
            synced: false 
        };
        
        const synced = await syncRecord(newRecord);
        newRecord.synced = synced;
        setAttendance(prev => [...prev, newRecord]);
        sendAutomation(student, method, minutesLate, 'Hadir');
        return { student, late: minutesLate, record: newRecord, type: 'Hadir' };
    }
  }, [students, attendance, setAttendance, syncRecord, sendAutomation]);

  const setManualStatus = useCallback((studentId: string, date: string, status: AttendanceStatus) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    setAttendance(prev => {
      const existingIdx = prev.findIndex(a => a.studentId === studentId && a.date === date);
      const newRecord: AttendanceRecord = {
        studentId,
        date,
        status,
        method: 'MANUAL',
        synced: false,
        scanTime: new Date().toISOString()
      };

      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = newRecord;
        return updated;
      } else {
        return [...prev, newRecord];
      }
    });

    sendAutomation(student, 'MANUAL', 0, 'Hadir', false, status);
  }, [students, setAttendance, sendAutomation]);

  const getAttendanceForDate = useCallback((date: string) => {
    return students.map(student => {
      const record = attendance.find(a => a.studentId === student.id && a.date === date);
      return { 
        student, 
        status: record ? record.status : AttendanceStatus.Absent, 
        scanTime: record?.scanTime, 
        pulangTime: record?.pulangTime, 
        minutesLate: record?.minutesLate 
      };
    });
  }, [students, attendance]);

  const clearAllAttendance = useCallback(() => {
    if (window.confirm("Hapus SELURUH riwayat absensi?")) setAttendance([]);
  }, [setAttendance]);

  const exportDatabase = useCallback(() => {
    const data: BackupData = { 
      version: 4, 
      timestamp: new Date().toISOString(), 
      students, 
      attendance,
      deletedStudents,
      generalSettings,
      apiConfig
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hadirku_database_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [students, attendance, deletedStudents, generalSettings, apiConfig]);

  const importDatabase = useCallback((jsonData: string) => {
    try {
      const parsed = JSON.parse(jsonData) as BackupData;
      if (parsed.students && Array.isArray(parsed.students)) {
        setStudents(parsed.students);
        setAttendance(parsed.attendance || []);
        if (parsed.deletedStudents) setDeletedStudents(parsed.deletedStudents);
        if (parsed.generalSettings) setGeneralSettings(parsed.generalSettings);
        if (parsed.apiConfig) setApiConfig(parsed.apiConfig);
        return true;
      }
      return false;
    } catch (e) { return false; }
  }, [setStudents, setAttendance, setDeletedStudents, setGeneralSettings, setApiConfig]);

  const testNotification = useCallback(async (method: 'WhatsApp' | 'Webhook' | 'Telegram', config: any) => {
    const testMsg = `🧪 *HADIRKU SYSTEM TEST*\n\nGateway aktif dan tervalidasi!\nSekolah: ${generalSettings.schoolName}\nWaktu: ${new Date().toLocaleString('id-ID')}\n\n_Pesan ini adalah uji coba koneksi._`;
    try {
      if (method === 'WhatsApp') {
        if (!config.apiKey || !config.endpoint) return { success: false, message: 'API Key & Endpoint harus diisi' };
        const res = await fetch(config.endpoint, {
          method: 'POST',
          headers: { 'Authorization': config.apiKey },
          body: new URLSearchParams({ 'target': '628123456789', 'message': testMsg }) 
        });
        const data = await res.json();
        return res.ok ? { success: true, message: 'WhatsApp Gateway terhubung!' } : { success: false, message: `Gagal: ${data.reason || 'Koneksi Ditolak'}` };
      } else if (method === 'Telegram') {
        if (!config.apiKey) return { success: false, message: 'Bot Token harus diisi' };
        const res = await fetch(`https://api.telegram.org/bot${config.apiKey}/getMe`);
        const data = await res.json();
        return data.ok ? { success: true, message: `Bot Aktif: @${data.result.username}` } : { success: false, message: 'Token Bot Tidak Valid' };
      }
      return { success: false, message: 'Metode tidak didukung untuk tes otomatis.' };
    } catch (err) { 
      return { success: false, message: 'Koneksi gagal ke server gateway.' }; 
    }
  }, [generalSettings.schoolName]);

  const sendAnnouncement = useCallback(async (message: string) => {
    const config = generalSettings.notifications;
    let success = 0; let fail = 0;
    if (!config) return { success, fail };
    const validStudents = students.filter(s => s.parentContact && s.parentContact.length > 3);
    for (const student of validStudents) {
      try {
        const fullMessage = `📢 *PENGUMUMAN SEKOLAH*\n${generalSettings.schoolName}\n\n${message}\n\n_Pesan otomatis via Hadirku Portal_`;
        if (config.method === 'WhatsApp' && config.apiKey && config.apiEndpoint) {
          const cleanNumber = student.parentContact!.replace(/\D/g, '');
          const finalNumber = cleanNumber.startsWith('0') ? '62' + cleanNumber.slice(1) : (cleanNumber.startsWith('62') ? cleanNumber : '62' + cleanNumber);
          await fetch(config.apiEndpoint, {
            method: 'POST',
            headers: { 'Authorization': config.apiKey },
            body: new URLSearchParams({ 'target': finalNumber, 'message': fullMessage })
          });
          success++;
        }
      } catch (e) { fail++; }
      await new Promise(r => setTimeout(r, 400));
    }
    return { success, fail };
  }, [students, generalSettings]);

  const value = useMemo(() => ({ 
    students, setStudents, deletedStudents, setDeletedStudents, attendance, setAttendance, apiConfig, setApiConfig,
    generalSettings, setGeneralSettings,
    addStudent, updateStudent, deleteStudent, bulkDeleteStudents, restoreStudent, bulkRestoreStudents, permanentlyDeleteStudent, bulkPermanentlyDeleteStudents, markAttendance, setManualStatus, getAttendanceForDate,
    clearAllAttendance, exportDatabase, importDatabase, backupToCloud, restoreFromCloud, syncToHub, pullFromHub, backupToDrive, restoreFromDrive, testNotification, sendAnnouncement, isSyncing, unsyncedCount, manualSync
  }), [students, deletedStudents, attendance, apiConfig, generalSettings, addStudent, updateStudent, deleteStudent, bulkDeleteStudents, restoreStudent, bulkRestoreStudents, permanentlyDeleteStudent, bulkPermanentlyDeleteStudents, markAttendance, setManualStatus, getAttendanceForDate, clearAllAttendance, exportDatabase, importDatabase, backupToCloud, restoreFromCloud, syncToHub, pullFromHub, backupToDrive, restoreFromDrive, testNotification, sendAnnouncement, isSyncing, unsyncedCount, manualSync]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};

export { useData };


export enum AttendanceStatus {
  Present = 'Present',
  Absent = 'Absent',
  Sick = 'Sick',
  Permit = 'Permit',
}

export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  customId?: string; 
  className?: string;
  parentContact?: string;
  rfidTag?: string; // RFID UID field
  profilePicture?: string; // Restore profile picture field
}

export interface AttendanceRecord {
  studentId: string;
  status: AttendanceStatus;
  date: string;
  method: 'QR' | 'RFID' | 'MANUAL'; 
  scanTime?: string; // Store exact scan time (Arrival)
  pulangTime?: string; // Store exact scan time (Departure)
  minutesLate?: number; // Store late duration
  synced?: boolean; // New: tracking for offline-first synchronization
}

export interface ApiConfig {
  baseUrl: string;
  enabled: boolean;
  apiKey?: string;
  hubUrl?: string;
  hubToken?: string;
  autoHubSync?: boolean;
}

export interface NotificationSettings {
  autoNotify: boolean;
  method: 'WhatsApp' | 'Webhook' | 'Telegram'; 
  apiKey?: string;
  apiEndpoint?: string;
  targetDevice?: string;
}

export interface PrinterSettings {
  autoPrintSlip: boolean;
  autoSavePdf: boolean;
  slipTitle: string;
  printerType: 'standard' | 'thermal';
}

export interface Teacher {
  name: string;
  nip: string;
}

export interface TimeSettings {
  startAttendance: string;
  onTimeEnd: string;
  lateEndLimit: string;
  returnEarlyStart: string;
  returnLimit: string;
  onTimePulangStart: string;
  onTimePulangStartClass12: string;
}

export interface GeneralSettings {
  schoolName: string;
  shortName: string;
  tagline: string;
  principalName?: string;
  principalNip?: string;
  teacher1?: Teacher;
  teacher2?: Teacher;
  teacher3?: Teacher;
  teacher4?: Teacher;
  teacher5?: Teacher;
  teacher6?: Teacher;
  teacher7?: Teacher;
  teacher8?: Teacher;
  teacher9?: Teacher;
  teacher10?: Teacher;
  schoolLogoUrl?: string; 
  appLogoUrl?: string;    
  govtLogoUrl?: string; // New: Government logo for official documents
  notifications?: NotificationSettings;
  printer?: PrinterSettings;
  timeSettings?: TimeSettings;
}

export interface BackupData {
  version: number;
  timestamp: string;
  students: Student[];
  attendance: AttendanceRecord[];
  deletedStudents?: Student[];
  generalSettings?: GeneralSettings;
  apiConfig?: ApiConfig;
}

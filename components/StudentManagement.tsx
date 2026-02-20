
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Student } from '../types';
import Modal from './common/Modal';
import QRCode from "react-qr-code";
import { 
  UserPlusIcon, TrashIcon, QrCodeIcon, ArrowDownTrayIcon, 
  ArrowUpTrayIcon, UserCircleIcon, PencilIcon, XMarkIcon, 
  PrinterIcon, MagnifyingGlassIcon, CheckCircleIcon, 
  DocumentArrowUpIcon, DocumentArrowDownIcon, EyeIcon, 
  EyeSlashIcon, ChevronDownIcon, CheckIcon, ArrowPathIcon, 
  BarsArrowDownIcon, BarsArrowUpIcon, Squares2X2Icon,
  PhotoIcon,
  ArrowUturnLeftIcon,
  NoSymbolIcon,
  CheckBadgeIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  SignalIcon
} from '@heroicons/react/24/outline';
import { svgToPngDataUrl, generateZip, generateIdCardPdf, downloadStudentTemplateExcel } from '../utils/export';
import useLocalStorage from '../hooks/useLocalStorage';
import { useHardwareScanner } from '../hooks/useHardwareScanner';

declare var XLSX: any;

const StudentFormModal: React.FC<{
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Student, 'id'>) => void;
}> = ({ student, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<Omit<Student, 'id'>>({
    name: '',
    rollNumber: '',
    className: '',
    parentContact: '',
    rfidTag: '',
    profilePicture: ''
  });

  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name,
        rollNumber: student.rollNumber,
        className: student.className || '',
        parentContact: student.parentContact || '',
        rfidTag: student.rfidTag || '',
        profilePicture: student.profilePicture || ''
      });
    } else {
      setFormData({ name: '', rollNumber: '', className: '', parentContact: '', rfidTag: '', profilePicture: '' });
    }
  }, [student, isOpen]);

  useHardwareScanner((code) => {
    setFormData(prev => ({ ...prev, rfidTag: code }));
  }, { 
    enabled: isOpen, 
    ignoreInputs: false
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profilePicture: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-8">
        <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-tight pr-12">
          {student ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
        </h3>
        
        <div className="space-y-4">
          <div className="flex flex-col items-center mb-6">
            <div 
              onClick={() => photoInputRef.current?.click()}
              className="w-24 h-24 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center cursor-pointer hover:border-cyan-400 transition-all overflow-hidden relative group"
            >
              {formData.profilePicture ? (
                <img src={formData.profilePicture} className="w-full h-full object-cover" alt="Preview" />
              ) : (
                <PhotoIcon className="w-8 h-8 text-slate-300 group-hover:text-cyan-400" />
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-[8px] font-black text-white uppercase tracking-widest">Ganti Foto</p>
              </div>
            </div>
            <input type="file" ref={photoInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">Foto Profil Siswa</p>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Nama Lengkap</label>
            <input 
              className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm font-bold outline-none focus:border-cyan-400"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Nomor Induk Siswa NIS</label>
              <input 
                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm font-bold outline-none focus:border-cyan-400"
                value={formData.rollNumber}
                onChange={e => setFormData({ ...formData, rollNumber: e.target.value })}
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Kelas</label>
              <input 
                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm font-bold outline-none focus:border-cyan-400"
                value={formData.className}
                onChange={e => setFormData({ ...formData, className: e.target.value })}
              />
            </div>
          </div>

          <div className="p-4 bg-cyan-50 rounded-2xl border border-cyan-100">
            <label className="text-[10px] font-black text-cyan-600 uppercase tracking-widest flex items-center gap-2 mb-2">
              <SignalIcon className="w-4 h-4" /> RFID Tag ID (Scan Kartu Untuk Isi)
            </label>
            <input 
              className="w-full bg-white border border-cyan-200 rounded-xl p-3 text-sm font-mono font-bold outline-none focus:border-cyan-500 text-cyan-900"
              placeholder="Tempel kartu RFID ke scanner..."
              value={formData.rfidTag}
              onChange={e => setFormData({ ...formData, rfidTag: e.target.value })}
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Kontak Orang Tua WA</label>
            <input 
              className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm font-bold outline-none focus:border-cyan-400"
              placeholder="Contoh: 628123456789"
              value={formData.parentContact}
              onChange={e => setFormData({ ...formData, parentContact: e.target.value })}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-6">
            <button 
              onClick={onClose}
              className="py-4 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
            >
              Batal
            </button>
            <button 
              onClick={() => onSave(formData)}
              className="py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black shadow-lg shadow-slate-200"
            >
              Simpan Data
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

const StudentManagement: React.FC = () => {
  const { students, setStudents, deletedStudents, setDeletedStudents, addStudent, updateStudent, deleteStudent, bulkDeleteStudents, restoreStudent, bulkRestoreStudents, permanentlyDeleteStudent, bulkPermanentlyDeleteStudents, generalSettings } = useData();
  
  const [searchTerm, setSearchTerm] = useLocalStorage('student_search_term', '');
  const [showStudentList, setShowStudentList] = useLocalStorage('student_show_list', true);
  const [selectedIds, setSelectedIds] = useLocalStorage<string[]>('student_selected_ids', []);
  const [selectedClasses, setSelectedClasses] = useLocalStorage<string[]>('student_filter_classes', []);
  const [dragPos, setDragPos] = useLocalStorage('student_drag_pos', { x: 0, y: 0 });

  const [selectedStudentForQr, setSelectedStudentForQr] = useState<Student | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [generatingType, setGeneratingType] = useState<'id-card' | 'zip' | null>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const [sortConfig, setSortConfig] = useLocalStorage<{
    key: 'name' | 'rollNumber' | 'className';
    direction: 'asc' | 'desc';
  }>('student_sort_config', { key: 'name', direction: 'asc' });

  const excelInputRef = useRef<HTMLInputElement>(null);
  const qrHiddenRef = useRef<HTMLDivElement>(null);

  const availableClasses = useMemo(() => {
    const classes = students.map(s => s.className || 'Tanpa Kelas').filter(Boolean);
    return Array.from(new Set(classes)).sort();
  }, [students]);

  const toggleClassFilter = (className: string) => {
    setSelectedClasses(prev => 
      prev.includes(className) 
        ? prev.filter(c => c !== className) 
        : [...prev, className]
    );
  };

  const sortData = (data: Student[]) => {
    return [...data].sort((a, b) => {
      const aValue = (a[sortConfig.key] || '').toString().toLowerCase();
      const bValue = (b[sortConfig.key] || '').toString().toLowerCase();
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const filteredStudents = useMemo(() => {
    const result = students.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           s.rollNumber.includes(searchTerm);
      
      const sClass = s.className || 'Tanpa Kelas';
      const matchesClass = selectedClasses.length === 0 || selectedClasses.includes(sClass);
      
      return matchesSearch && matchesClass;
    });
    return sortData(result);
  }, [students, searchTerm, selectedClasses, sortConfig]);

  const selectedStudents = useMemo(() => sortData(students.filter(s => selectedIds.includes(s.id))), [students, selectedIds, sortConfig]);

  const handleSelectAll = () => {
    const filteredIds = filteredStudents.map(s => s.id);
    const allFilteredSelected = filteredIds.every(id => selectedIds.includes(id));

    if (allFilteredSelected) {
      setSelectedIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      setSelectedIds(prev => {
        const newSet = new Set([...prev, ...filteredIds]);
        return Array.from(newSet);
      });
    }
  };

  const isAllFilteredSelected = filteredStudents.length > 0 && filteredStudents.every(s => selectedIds.includes(s.id));

  const handleStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    dragStartRef.current = { x: clientX - dragPos.x, y: clientY - dragPos.y };
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (isDragging) {
      setDragPos({ x: clientX - dragStartRef.current.x, y: clientY - dragStartRef.current.y });
    }
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onMouseUp = () => handleEnd();
    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging]);

  const prepareStudentsWithQr = async (studentList: Student[]) => {
    const results = [];
    await new Promise(resolve => setTimeout(resolve, 800));
    for (const student of studentList) {
        const qrContainer = document.getElementById(`qr-gen-${student.id}`);
        const svgElement = qrContainer?.querySelector('svg');
        if (!svgElement) {
            results.push({ ...student, qrDataUrl: '' });
            continue;
        }
        const clonedSvg = svgElement.cloneNode(true) as SVGElement;
        clonedSvg.setAttribute('width', '256');
        clonedSvg.setAttribute('height', '256');
        const qrDataUrl = await svgToPngDataUrl(clonedSvg);
        results.push({ ...student, qrDataUrl });
    }
    return results;
  };

  const handleDownload = async (type: 'zip' | 'id-card', subset?: Student[]) => {
    const studentsToExport = subset ? sortData(subset) : sortData(students);
    if (studentsToExport.length === 0) return alert("Data siswa kosong atau belum dipilih.");
    
    setGeneratingType(type);
    try {
        const studentsWithQr = await prepareStudentsWithQr(studentsToExport);
        if (type === 'id-card') {
            await generateIdCardPdf(studentsWithQr, generalSettings);
        } else {
            await generateZip(studentsWithQr, generalSettings);
        }
    } catch (err: any) {
        alert("Gagal memproses data.");
    } finally {
        setGeneratingType(null);
    }
  };

  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        const importedStudents: Student[] = data.map((row: any) => {
          const name = row["Nama"] || row["Nama Lengkap"] || row["name"] || "Tanpa Nama";
          const rollNumber = String(row["NIS"] || row["Nomor Induk"] || row["rollNumber"] || Date.now());
          const className = row["Kelas"] || row["className"] || "";
          const parentContact = String(row["Kontak_Ortu"] || row["WhatsApp"] || row["parentContact"] || "");
          const rfidTag = String(row["RFID_Tag"] || row["RFID"] || row["rfidTag"] || "");

          return {
            id: `std-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: String(name).trim(),
            rollNumber: String(rollNumber).trim(),
            className: String(className).trim(),
            parentContact: String(parentContact).trim(),
            rfidTag: String(rfidTag).trim()
          };
        });

        if (importedStudents.length > 0) {
            setStudents(prev => [...prev, ...importedStudents]);
            alert(`Berhasil impor ${importedStudents.length} data siswa secara riil.`);
        } else {
            alert("Tidak ada data valid yang ditemukan di file Excel.");
        }
      } catch (err) {
        console.error("Import Error:", err);
        alert("Gagal impor Excel. Pastikan format file benar.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleSaveStudent = (data: Omit<Student, 'id'>) => {
    if (editingStudent) {
      updateStudent(editingStudent.id, data);
    } else {
      addStudent(data);
    }
    setIsFormModalOpen(false);
    setEditingStudent(null);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const bulkDeleteAction = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Pindahkan ${selectedIds.length} siswa terpilih ke tempat sampah?`)) {
      bulkDeleteStudents(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleSortChange = (key: 'name' | 'rollNumber' | 'className') => {
    if (sortConfig.key === key) {
      setSortConfig({ ...sortConfig, direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      setSortConfig({ key, direction: 'asc' });
    }
  };

  return (
    <div className="space-y-6 pb-24 relative">
      <div ref={qrHiddenRef} className="fixed -left-[10000px] top-0 opacity-0 pointer-events-none" aria-hidden="true">
          {students.map(s => (
              <div key={s.id} id={`qr-gen-${s.id}`}>
                  <QRCode value={s.rollNumber} size={256} />
              </div>
          ))}
      </div>

      <input type="file" accept=".xlsx, .xls" ref={excelInputRef} className="hidden" onChange={handleExcelImport} />

      {selectedIds.length > 0 && (
        <div 
          style={{ transform: `translate(${dragPos.x}px, ${dragPos.y}px)` }}
          className="fixed bottom-24 lg:bottom-12 left-0 right-0 z-[100] w-fit mx-auto animate-fade-in-up"
        >
          <div className="bg-slate-950 text-white p-3 lg:p-4 rounded-[2.5rem] shadow-[0_0_50px_rgba(34,211,238,0.3)] flex items-center gap-4 border-2 border-cyan-400/50 backdrop-blur-xl transition-shadow hover:shadow-cyan-400/40">
            <div 
              onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
              className="p-3 cursor-grab active:cursor-grabbing text-slate-500 hover:text-cyan-400 transition-colors"
              title="Geser bebas"
            >
              <Squares2X2Icon className="w-7 h-7" />
            </div>

            <div className="flex items-center gap-3 pr-2 border-r border-white/10">
              <div className="w-12 h-12 bg-cyan-400 text-slate-950 rounded-2xl flex items-center justify-center font-black text-lg shadow-lg shadow-cyan-400/20">
                {selectedIds.length}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button 
                onClick={() => handleDownload('id-card', selectedStudents)}
                disabled={generatingType !== null}
                className={`px-5 py-3 bg-white text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-400 transition-all flex items-center gap-2 disabled:opacity-50 ${generatingType === 'id-card' ? 'animate-pulse scale-105 shadow-xl' : ''}`}
              >
                <PrinterIcon className="w-4 h-4" /> CETAK
              </button>
              <button 
                onClick={() => handleDownload('zip', selectedStudents)}
                disabled={generatingType !== null}
                className={`px-5 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50 ${generatingType === 'zip' ? 'animate-pulse scale-105 shadow-xl' : ''}`}
              >
                <ArrowDownTrayIcon className="w-4 h-4" /> ZIP
              </button>
              <button 
                onClick={bulkDeleteAction}
                className="px-5 py-3 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all flex items-center gap-2 shadow-lg shadow-rose-900/20 active:scale-95"
                title="Hapus Terpilih"
              >
                <TrashIcon className="w-4 h-4" /> HAPUS
              </button>
              <button 
                onClick={() => setSelectedIds([])}
                className="p-3 bg-white/5 text-slate-400 rounded-xl hover:text-white transition-all"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Database Siswa</h2>
              <p className="text-sm font-medium text-slate-400 mt-1">Sistem pengelolaan data siswa digital.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
              <button 
                onClick={handleSelectAll}
                className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border ${isAllFilteredSelected ? 'bg-cyan-500 text-slate-950 border-cyan-500' : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-white hover:border-cyan-400'}`}
              >
                  <CheckBadgeIcon className="w-5 h-5" /> {isAllFilteredSelected ? 'BATAL PILIH SEMUA' : 'PILIH SEMUA'}
              </button>

              <div className="relative flex-grow min-w-[200px]">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input type="text" placeholder="Cari Nama..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-cyan-400 outline-none transition-all" />
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col gap-4 animate-fade-in h-full">
            <div className="flex items-center gap-3 px-2">
              <FunnelIcon className="w-5 h-5 text-indigo-500" />
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Filter Berdasarkan Kelas</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setSelectedClasses([])}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${selectedClasses.length === 0 ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-indigo-200'}`}
              >
                Semua Kelas
              </button>
              {availableClasses.map(className => (
                <button
                  key={className}
                  onClick={() => toggleClassFilter(className)}
                  className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${selectedClasses.includes(className) ? 'bg-cyan-500 text-slate-950 border-cyan-500 shadow-md' : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-cyan-200'}`}
                >
                  {className}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col gap-4 animate-fade-in h-full">
            <div className="flex items-center gap-3 px-2">
              <ArrowsUpDownIcon className="w-5 h-5 text-cyan-500" />
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Urutkan Daftar Siswa</h3>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              {[
                { key: 'name', label: 'Nama' },
                { key: 'rollNumber', label: 'NIS' },
                { key: 'className', label: 'Kelas' }
              ].map(item => (
                <button
                  key={item.key}
                  onClick={() => handleSortChange(item.key as any)}
                  className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border flex items-center gap-2 ${sortConfig.key === item.key ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-200'}`}
                >
                  {item.label}
                  {sortConfig.key === item.key && (
                    sortConfig.direction === 'asc' ? <BarsArrowUpIcon className="w-4 h-4" /> : <BarsArrowDownIcon className="w-4 h-4" />
                  )}
                </button>
              ))}
              
              <div className="h-6 w-[1px] bg-slate-100 mx-2 hidden sm:block"></div>
              
              <button 
                onClick={() => setSortConfig({ ...sortConfig, direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
                className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-cyan-50 text-cyan-600 border border-cyan-100 hover:bg-cyan-100 transition-all flex items-center gap-2"
              >
                {sortConfig.direction === 'asc' ? 'Menaik (A-Z)' : 'Menurun (Z-A)'}
              </button>
            </div>
          </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-cyan-50 rounded-2xl flex items-center justify-center text-cyan-600">
                  <PrinterIcon className="w-6 h-6" />
              </div>
              <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">ID CARD SERVICES COLLECTIVE</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                    Layout F4 (10 ID Lembar) • Desain Hologram 5D • Ukuran Proposional
                  </p>
              </div>
          </div>
          <div className="flex flex-col gap-3 w-full md:w-64">
              <button 
                  onClick={() => handleDownload('id-card')} 
                  disabled={generatingType !== null || students.length === 0}
                  className={`w-full px-6 py-4 bg-slate-900 text-cyan-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg ${generatingType === 'id-card' ? 'animate-pulse scale-[1.02] ring-2 ring-cyan-400' : ''}`}
              >
                  <PrinterIcon className="w-4 h-4" /> {generatingType === 'id-card' ? 'MENGOLAH...' : 'PRINT ALL ID CARD'}
              </button>
              <button 
                  onClick={() => handleDownload('zip')} 
                  disabled={generatingType !== null || students.length === 0}
                  className={`w-full px-6 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg ${generatingType === 'zip' ? 'animate-pulse scale-[1.02] ring-2 ring-white' : ''}`}
              >
                  <ArrowDownTrayIcon className="w-4 h-4" /> DOWNLOAD ALL ZIP
              </button>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white flex flex-col justify-between shadow-xl shadow-indigo-100 relative overflow-hidden group">
             <div className="relative z-10 mb-8">
                <h3 className="text-xl font-black uppercase tracking-widest mb-2">Impor Database</h3>
                <p className="text-indigo-100 text-xs font-medium leading-relaxed max-w-[200px]">Masukkan data siswa massal via Excel (Nama, NIS, Kelas).</p>
             </div>
             <div className="flex gap-2 relative z-10">
                <button onClick={() => excelInputRef.current?.click()} className="flex-grow py-4 bg-white text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-cyan-400 transition-all">
                   <DocumentArrowUpIcon className="w-5 h-5" /> Impor Excel
                </button>
                <button onClick={() => downloadStudentTemplateExcel()} className="p-4 bg-indigo-500/30 text-white rounded-2xl hover:bg-white/20 transition-colors">
                   <DocumentArrowDownIcon className="w-5 h-5" />
                </button>
             </div>
          </div>

          <button onClick={() => { setEditingStudent(null); setIsFormModalOpen(true); }} className="bg-white border-2 border-dashed border-slate-200 p-8 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 hover:border-cyan-400 group transition-all shadow-sm">
              <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center text-cyan-400 group-hover:scale-110 shadow-xl transition-all">
                  <UserPlusIcon className="w-8 h-8" />
              </div>
              <p className="font-black text-xs uppercase tracking-widest text-slate-400 group-hover:text-slate-900">Tambah Siswa Baru</p>
          </button>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-4 px-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">MENAMPILKAN DATA {filteredStudents.length} DARI {students.length} DATA SISWA</p>
          
          <div className="flex flex-col items-center md:items-end gap-3 w-full md:w-auto">
            <div className="flex flex-wrap items-center justify-center gap-3">
                {selectedIds.length > 0 && (
                  <button 
                    onClick={() => handleDownload('id-card', selectedStudents)}
                    disabled={generatingType !== null}
                    className={`px-8 py-5 bg-cyan-400 text-slate-950 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] flex items-center gap-3 transition-all shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 ${generatingType === 'id-card' ? 'animate-pulse' : ''}`}
                  >
                    <PrinterIcon className="w-5 h-5" />
                    CETAK TERPILIH ({selectedIds.length})
                  </button>
                )}
                <button 
                  onClick={() => setShowStudentList(!showStudentList)} 
                  className={`px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] flex items-center gap-4 transition-all shadow-xl ${showStudentList ? 'bg-slate-900 text-white' : 'bg-white text-slate-900 border border-slate-100'}`}
                >
                  {showStudentList ? 'SEMBUNYIKAN DAFTAR' : 'TAMPILKAN DAFTAR'}
                  <ChevronDownIcon className={`w-4 h-4 transition-transform duration-500 ${showStudentList ? 'rotate-180' : 'rotate-0'}`} />
                </button>
            </div>
          </div>
      </div>

      {(showStudentList || searchTerm.trim() !== '' || selectedClasses.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up relative">
          {filteredStudents.map(student => (
              <div 
                key={student.id} 
                className={`bg-white p-6 rounded-[2.5rem] shadow-sm border group hover:shadow-xl transition-all relative overflow-hidden transform active:scale-[0.98] ${selectedIds.includes(student.id) ? 'border-cyan-400 ring-4 ring-cyan-400/20 shadow-cyan-400/10 scale-[1.02]' : 'border-slate-100'}`}
              >
                  <div onClick={() => toggleSelect(student.id)} className="absolute top-6 left-6 z-10 cursor-pointer">
                     <div className={`w-8 h-8 rounded-xl border-2 transition-all flex items-center justify-center ${selectedIds.includes(student.id) ? 'bg-cyan-400 border-cyan-400 shadow-lg shadow-cyan-400/20' : 'bg-white border-slate-200 hover:border-cyan-200'}`}>
                        {selectedIds.includes(student.id) && <CheckIcon className="w-5 h-5 text-slate-950 font-black" />}
                     </div>
                  </div>

                  <div className="flex items-center justify-between mb-4 mt-2">
                    <div className="flex items-center gap-4 pl-12">
                        <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-cyan-400 font-black text-lg overflow-hidden border-2 border-white shadow-lg group-hover:rotate-3 transition-transform">
                            {student.profilePicture ? (
                              <img src={student.profilePicture} className="w-full h-full object-cover" alt="" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-slate-800 text-cyan-400">
                                {student.name.charAt(0)}
                              </div>
                            )}
                        </div>
                        <div>
                            <h4 className="font-black text-slate-900 text-base leading-tight line-clamp-1">{student.name}</h4>
                            <p className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mt-1">NIS: {student.rollNumber} • {student.className || 'Tanpa Kelas'}</p>
                            {student.rfidTag && <p className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1 mt-1"><SignalIcon className="w-2 h-2" /> RFID Aktif</p>}
                        </div>
                    </div>
                    <button onClick={() => { setEditingStudent(student); setIsFormModalOpen(true); }} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                      <PencilIcon className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                      <button 
                        onClick={() => toggleSelect(student.id)} 
                        className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md ${selectedIds.includes(student.id) ? 'bg-cyan-400 text-slate-950 border-cyan-500' : 'bg-slate-50 text-slate-500 border-slate-100 hover:border-cyan-200'}`}
                      >
                          <CheckBadgeIcon className="w-4 h-4" /> {selectedIds.includes(student.id) ? 'BATAL' : 'PILIH'}
                      </button>
                      <button onClick={() => { setSelectedStudentForQr(student); setIsQrModalOpen(true); }} className="flex-1 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all shadow-md">
                          <QrCodeIcon className="w-4 h-4" /> QR
                      </button>
                      <button 
                        onClick={() => { if(window.confirm(`Pindahkan ${student.name} ke Recycle Bin?`)) deleteStudent(student.id); }} 
                        className="p-3 bg-rose-50 text-rose-500 rounded-2xl border border-rose-100 hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-95"
                        title="Hapus Siswa"
                      >
                          <TrashIcon className="w-5 h-5" />
                      </button>
                  </div>
              </div>
          ))}
          {filteredStudents.length === 0 && (
            <div className="col-span-full py-20 text-center opacity-30">
               <UserCircleIcon className="w-20 h-20 mx-auto mb-4 text-slate-300" />
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{students.length === 0 ? 'Database Kosong' : 'Data tidak ditemukan'}</p>
            </div>
          )}
        </div>
      )}

      <StudentFormModal isOpen={isFormModalOpen} student={editingStudent} onClose={() => setIsFormModalOpen(false)} onSave={handleSaveStudent} />

      {selectedStudentForQr && (
        <Modal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)}>
          <div className="flex flex-col items-center p-8 text-center animate-fade-in">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-8 leading-tight pr-12 w-full text-center">{selectedStudentForQr.name}</h3>
            <div className="bg-white p-8 border-4 border-slate-50 rounded-[3rem] mb-8 shadow-2xl w-full flex justify-center"><QRCode value={selectedStudentForQr.rollNumber} size={200} level="H" /></div>
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em]">HADIRKU DIGITAL KEY</p>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default StudentManagement;

import React, { useState, useEffect } from 'react';
import { Student, SchoolProfile, ValidationError } from '../types';
import { validateStudent } from '../validationEngine';
import { 
  User, Shield, CreditCard, Calendar, Users, MapPin, 
  Save, ArrowLeft, LogOut, CheckCircle2, AlertTriangle, 
  Search, Lock, Info, Landmark, HelpCircle, Heart, Key,
  Sparkles, ClipboardList, BookOpen, UserPlus, ChevronRight,
  ShieldAlert, FileText, RefreshCw, Edit3, Upload, Clock, Check,
  Eye, Trash2, ShieldCheck, ChevronDown, ChevronUp, Copy
} from 'lucide-react';

interface StudentPortalViewProps {
  students: Student[];
  schoolProfile: SchoolProfile;
  onUpdateStudent: (updatedStudent: Student) => void;
  onAddStudent: (newStudent: Student) => void;
  onExitPortal: () => void;
}

export default function StudentPortalView({ 
  students, 
  schoolProfile, 
  onUpdateStudent, 
  onAddStudent,
  onExitPortal 
}: StudentPortalViewProps) {
  // Portal landing active tab: 'login' | 'register'
  const [activePortalTab, setActivePortalTab] = useState<'login' | 'register'>('login');

  // Authentication State
  const [loginNisn, setLoginNisn] = useState('');
  const [loginDob, setLoginDob] = useState('');
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  // Registration State
  const [regNama, setRegNama] = useState('');
  const [regNisn, setRegNisn] = useState('');
  const [regNik, setRegNik] = useState('');
  const [regJk, setRegJk] = useState<'L' | 'P'>('L');
  const [regTempatLahir, setRegTempatLahir] = useState('');
  const [regTanggalLahir, setRegTanggalLahir] = useState('');
  const [regNamaIbuKandung, setRegNamaIbuKandung] = useState('');
  const [regNikIbuKandung, setRegNikIbuKandung] = useState('');
  const [regNamaAyah, setRegNamaAyah] = useState('');
  const [regTingkatKelas, setRegTingkatKelas] = useState('10');
  const [regRombonganBelajar, setRegRombonganBelajar] = useState('X-A');
  const [regAlamatSiswa, setRegAlamatSiswa] = useState('');
  const [regError, setRegError] = useState<string | null>(null);
  
  // Edit State
  const [formData, setFormData] = useState<Student | null>(null);
  const [isSavedSuccessfully, setIsSavedSuccessfully] = useState(false);
  const [liveErrors, setLiveErrors] = useState<ValidationError[]>([]);

  // Sub-menu and Document Upload states
  const [activeSubTab, setActiveSubTab] = useState<'form' | 'documents' | 'workflow'>('form');
  const [kkFile, setKkFile] = useState<string | null>(null);
  const [aktaFile, setAktaFile] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadStatus, setUploadStatus] = useState<Record<string, 'idle' | 'uploading' | 'success'>>({});
  const [previewDoc, setPreviewDoc] = useState<'kk' | 'akta' | null>(null);
  const [selectedWorkflowStep, setSelectedWorkflowStep] = useState<number>(1);
  const [isAddressGuideOpen, setIsAddressGuideOpen] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  // States for student self-reported issue / problem notification
  const [isEditingIssue, setIsEditingIssue] = useState(false);
  const [tempIssueText, setTempIssueText] = useState('');

  const handleCopyAddress = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const simulateUpload = (docType: 'kk' | 'akta', fileName: string) => {
    setUploadStatus(prev => ({ ...prev, [docType]: 'uploading' }));
    setUploadProgress(prev => ({ ...prev, [docType]: 0 }));
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(prev => ({ ...prev, [docType]: progress }));
      
      if (progress >= 100) {
        clearInterval(interval);
        setUploadStatus(prev => ({ ...prev, [docType]: 'success' }));
        if (docType === 'kk') {
          setKkFile(fileName);
        } else {
          setAktaFile(fileName);
        }
      }
    }, 120);
  };

  // Search and log in
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (loginNisn.length !== 10) {
      setAuthError('NISN harus terdiri dari tepat 10 digit angka.');
      return;
    }

    if (!loginDob) {
      setAuthError('Silakan pilih Tanggal Lahir Anda.');
      return;
    }

    // Find student with matching NISN and DOB
    const foundStudent = students.find(s => 
      s.nisn.trim() === loginNisn.trim() && 
      s.tanggalLahir.trim() === loginDob.trim()
    );

    if (foundStudent) {
      setCurrentStudent(foundStudent);
      setFormData({ ...foundStudent });
      setIsSavedSuccessfully(false);
    } else {
      // Look up if NISN exists but DOB is wrong to provide better guidance, or vice versa
      const nisnExists = students.find(s => s.nisn.trim() === loginNisn.trim());
      if (nisnExists) {
        setAuthError('NISN ditemukan, tetapi Tanggal Lahir tidak cocok. Harap periksa kembali.');
      } else {
        setAuthError('Data siswa tidak ditemukan. Periksa kembali NISN dan Tanggal Lahir Anda, atau hubungi Operator Sekolah.');
      }
    }
  };

  // Registration handler
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    // Validate inputs
    if (regNama.trim().length < 3) {
      setRegError('Nama Lengkap minimal 3 karakter.');
      return;
    }

    if (regNisn.length !== 10) {
      setRegError('NISN harus terdiri dari tepat 10 digit angka.');
      return;
    }

    if (regNik.length !== 16) {
      setRegError('NIK harus terdiri dari tepat 16 digit angka.');
      return;
    }

    if (regNamaIbuKandung.trim().length < 3) {
      setRegError('Nama Ibu Kandung harus diisi dengan benar.');
      return;
    }

    if (regNikIbuKandung && regNikIbuKandung.length !== 16) {
      setRegError('NIK Ibu Kandung harus terdiri dari tepat 16 digit angka jika diisi.');
      return;
    }

    if (!regTanggalLahir) {
      setRegError('Silakan pilih Tanggal Lahir.');
      return;
    }

    if (!regTempatLahir.trim()) {
      setRegError('Silakan isi Tempat Lahir.');
      return;
    }

    if (!regRombonganBelajar.trim()) {
      setRegError('Silakan isi Rombongan Belajar (Rombel).');
      return;
    }

    if (!regAlamatSiswa.trim()) {
      setRegError('Silakan isi Alamat Tempat Tinggal Lengkap.');
      return;
    }

    // Check if NISN already exists
    const nisnExists = students.some(s => s.nisn.trim() === regNisn.trim());
    if (nisnExists) {
      setRegError(`Siswa dengan NISN ${regNisn} sudah terdaftar dalam sistem. Silakan masuk menggunakan menu "Masuk Portal".`);
      return;
    }

    // Check if NIK already exists
    const nikExists = students.some(s => s.nik.trim() === regNik.trim());
    if (nikExists) {
      setRegError(`Siswa dengan NIK ${regNik} sudah terdaftar dalam sistem. Harap periksa kembali.`);
      return;
    }

    // Construct new student
    const newStudent: Student = {
      id: `std-${Date.now()}`,
      nama: regNama.trim().toUpperCase(),
      nisn: regNisn.trim(),
      nik: regNik.trim(),
      jenisKelamin: regJk,
      tempatLahir: regTempatLahir.trim(),
      tanggalLahir: regTanggalLahir.trim(),
      namaIbuKandung: regNamaIbuKandung.trim().toUpperCase(),
      nikIbuKandung: regNikIbuKandung.trim(),
      namaAyah: regNamaAyah.trim().toUpperCase(),
      tingkatKelas: regTingkatKelas,
      rombonganBelajar: regRombonganBelajar.trim().toUpperCase(),
      alamatSiswa: regAlamatSiswa.trim(),
      statusSiswa: 'Aktif'
    };

    // Save to global / admin database
    onAddStudent(newStudent);

    // Auto log in!
    setCurrentStudent(newStudent);
    setFormData({ ...newStudent });
    setIsSavedSuccessfully(true);

    // Auto clear success message after 5 seconds
    setTimeout(() => {
      setIsSavedSuccessfully(false);
    }, 5000);
    
    // Clear registration fields
    setRegNama('');
    setRegNisn('');
    setRegNik('');
    setRegJk('L');
    setRegTempatLahir('');
    setRegTanggalLahir('');
    setRegNamaIbuKandung('');
    setRegNikIbuKandung('');
    setRegNamaAyah('');
    setRegTingkatKelas('10');
    setRegRombonganBelajar('X-A');
    setRegAlamatSiswa('');
  };

  // Re-run validation on form change or initial load
  useEffect(() => {
    if (formData) {
      const errors = validateStudent(formData);
      setLiveErrors(errors);
    }
  }, [formData]);

  // Sync self-reported issue text when student logs in or updates
  useEffect(() => {
    if (currentStudent) {
      setTempIssueText(currentStudent.keteranganMasalah || '');
    } else {
      setTempIssueText('');
      setIsEditingIssue(false);
    }
  }, [currentStudent]);

  const handleLogout = () => {
    setCurrentStudent(null);
    setFormData(null);
    setLoginNisn('');
    setLoginDob('');
    setAuthError(null);
    setIsSavedSuccessfully(false);
    setActiveSubTab('form');
    setKkFile(null);
    setAktaFile(null);
    setUploadProgress({});
    setUploadStatus({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!formData) return;
    const { name, value } = e.target;
    setFormData((prev) => prev ? {
      ...prev,
      [name]: value,
    } : null);
    setIsSavedSuccessfully(false);
  };

  const handleUpperChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    const { name, value } = e.target;
    setFormData((prev) => prev ? {
      ...prev,
      [name]: value.toUpperCase(),
    } : null);
    setIsSavedSuccessfully(false);
  };

  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    const { name, value } = e.target;
    const cleanVal = value.replace(/[^0-9]/g, '');
    setFormData((prev) => prev ? {
      ...prev,
      [name]: cleanVal,
    } : null);
    setIsSavedSuccessfully(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    // Save to global state (localStorage sync will be handled by App callback)
    onUpdateStudent(formData);
    
    // Update active student view
    setCurrentStudent(formData);
    setIsSavedSuccessfully(true);
    
    // Auto redirect / logout to the main portal menu after 2 seconds
    setTimeout(() => {
      setCurrentStudent(null);
      setFormData(null);
      setLoginNisn('');
      setLoginDob('');
      setActivePortalTab('login');
    }, 2000);

    // Auto clear success message after 7 seconds
    setTimeout(() => {
      setIsSavedSuccessfully(false);
    }, 7000);
  };

  // Format Date to Indonesian Local Format
  const formatIndoDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateStr).toLocaleDateString('id-ID', options);
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6" id="student-portal-wrapper">
      
      {/* 1. PORTAL HEADER BANNER */}
      <div className="bg-gradient-to-r from-teal-700 to-cyan-800 rounded-2xl p-6 text-white shadow-md border border-teal-600/30">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="bg-white/15 p-3 rounded-xl backdrop-blur-md">
              <Users className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Portal Siswa Mandiri</h2>
              <p className="text-teal-100 text-sm">
                Sistem perbaikan biodata peserta didik {schoolProfile.namaSekolah} secara mandiri dan real-time
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. AUTH / LOGIN / REGISTER SCREEN */}
      {!currentStudent ? (
        <div className={`mx-auto my-8 transition-all duration-300 ${activePortalTab === 'register' ? 'max-w-2xl' : 'max-w-md'}`} id="student-portal-login">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Top decorative bar */}
            <div className="h-2 bg-gradient-to-r from-teal-500 to-cyan-500"></div>

            {/* Toggle Tabs */}
            <div className="flex border-b border-gray-100 bg-gray-50/50">
              <button
                type="button"
                onClick={() => {
                  setActivePortalTab('login');
                  setAuthError(null);
                }}
                className={`flex-1 py-3 text-xs font-extrabold text-center border-b-2 transition-all cursor-pointer ${
                  activePortalTab === 'login'
                    ? 'border-teal-600 text-teal-600 bg-white'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                MASUK PORTAL SISWA
              </button>
              <button
                type="button"
                onClick={() => {
                  setActivePortalTab('register');
                  setRegError(null);
                }}
                className={`flex-1 py-3 text-xs font-extrabold text-center border-b-2 transition-all cursor-pointer ${
                  activePortalTab === 'register'
                    ? 'border-teal-600 text-teal-600 bg-white'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                PENDAFTARAN SISWA BARU
              </button>
            </div>
            
            <div className="p-6 sm:p-8 space-y-6">
              {isSavedSuccessfully && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-emerald-800 text-xs font-semibold flex items-start space-x-2.5 animate-fade-in mb-4">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Penyimpanan & Verifikasi Berhasil!</span>
                    <span className="font-normal text-emerald-600">Biodata Anda telah berhasil disimpan dan diaudit ulang secara otomatis dalam database utama sekolah.</span>
                  </div>
                </div>
              )}

              {activePortalTab === 'login' ? (
                // LOGIN TAB CONTENT
                <>
                  <div className="text-center space-y-2">
                    <div className="mx-auto h-12 w-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 mb-2">
                      <Key className="h-6 w-6 stroke-[1.5]" />
                    </div>
                    <h3 className="text-lg font-black text-gray-900 tracking-tight">Masuk Portal Mandiri</h3>
                    <p className="text-gray-500 text-xs px-2 leading-relaxed">
                      Gunakan Nomor Induk Siswa Nasional (NISN) dan Tanggal Lahir Anda sesuai Kartu Keluarga untuk mengakses profil data.
                    </p>
                  </div>

                  {authError && (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-red-700 text-xs font-semibold flex items-start space-x-2 animate-fade-in">
                      <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <span>{authError}</span>
                    </div>
                  )}

                  <form onSubmit={handleLogin} className="space-y-5">
                    <div className="bg-teal-50/50 p-3.5 rounded-2xl border border-teal-100 text-[11px] text-teal-800 space-y-1">
                      <p className="font-extrabold flex items-center space-x-1 text-teal-900">
                        <span className="inline-block w-1.5 h-1.5 bg-teal-600 rounded-full animate-pulse mr-1"></span>
                        <span>Petunjuk Validasi Masuk:</span>
                      </p>
                      <ul className="list-disc pl-4 space-y-0.5 text-teal-700 font-medium">
                        <li><b>NISN</b> wajib berupa 10 digit angka tanpa spasi/karakter.</li>
                        <li><b>Tanggal Lahir</b> disesuaikan dengan format Hari-Bulan-Tahun resmi.</li>
                      </ul>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-xs font-extrabold text-slate-700 tracking-wide uppercase" htmlFor="loginNisn">
                          Nomor Induk Siswa Nasional (NISN)
                        </label>
                        <span className="text-[10px] bg-teal-100 text-teal-900 px-2 py-0.5 rounded-md font-extrabold font-mono">10 DIGIT</span>
                      </div>
                      <div className="relative">
                        <input
                          id="loginNisn"
                          type="text"
                          maxLength={10}
                          value={loginNisn}
                          onChange={(e) => setLoginNisn(e.target.value.replace(/[^0-9]/g, ''))}
                          className="w-full pl-11 pr-4 py-3 bg-white border-2 border-slate-300 hover:border-teal-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-500/15 rounded-2xl text-base font-extrabold font-mono tracking-[0.2em] text-teal-950 focus:bg-white focus:outline-none transition-all placeholder:text-gray-300 placeholder:tracking-normal"
                          placeholder="Masukkan 10 digit NISN..."
                          required
                        />
                        <Search className="absolute left-4 top-4 h-4.5 w-4.5 text-teal-600" />
                      </div>
                      <p className="text-[10.5px] text-teal-600/95 mt-1 font-semibold italic flex items-center space-x-1">
                        <span>💡</span> <span>Contoh: 0081234567 (Angka saja)</span>
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-xs font-extrabold text-slate-700 tracking-wide uppercase" htmlFor="loginDob">
                          Tanggal Lahir Siswa
                        </label>
                        <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md font-extrabold">DOKUMEN KK</span>
                      </div>
                      <div className="relative">
                        <input
                          id="loginDob"
                          type="date"
                          value={loginDob}
                          onChange={(e) => setLoginDob(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 bg-white border-2 border-slate-300 hover:border-teal-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-500/15 rounded-2xl text-base font-bold text-teal-950 focus:bg-white focus:outline-none transition-all"
                          required
                        />
                        <Calendar className="absolute left-4 top-4 h-4.5 w-4.5 text-teal-600" />
                      </div>
                      <p className="text-[10.5px] text-teal-600/95 mt-1 font-semibold italic flex items-center space-x-1">
                        <span>📅</span> <span>Sesuaikan hari, bulan, dan tahun lahir</span>
                      </p>
                    </div>

                    <button
                      id="btn-student-login"
                      type="submit"
                      className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-black text-sm py-3.5 px-4 rounded-xl shadow-md shadow-teal-100 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] mt-2"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>Verifikasi & Masuk Portal</span>
                    </button>
                  </form>
                </>
              ) : (
                // REGISTRATION TAB CONTENT
                <>
                  <div className="text-center space-y-2">
                    <div className="mx-auto h-12 w-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 mb-2">
                      <UserPlus className="h-6 w-6 stroke-[1.5]" />
                    </div>
                    <h3 className="text-lg font-black text-gray-900 tracking-tight">Perekaman Siswa Baru</h3>
                    <p className="text-gray-500 text-xs px-2 leading-relaxed">
                      Lengkapi data berikut untuk menambahkan data Anda ke basis data utama {schoolProfile.namaSekolah}.
                    </p>
                  </div>

                  {regError && (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-3.5 text-red-700 text-xs font-semibold flex items-start space-x-2 animate-fade-in">
                      <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <span>{regError}</span>
                    </div>
                  )}

                  <form onSubmit={handleRegister} className="space-y-6">
                    {/* SECTION 1: IDENTITAS DIRI */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center space-x-1.5 border-b border-gray-100 pb-1">
                        <User className="h-3.5 w-3.5 text-teal-600" />
                        <span>Identitas Pribadi</span>
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-gray-500 mb-1" htmlFor="regNama">
                            NAMA LENGKAP SISWA <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="regNama"
                            type="text"
                            required
                            value={regNama}
                            onChange={(e) => setRegNama(e.target.value.toUpperCase())}
                            className="w-full px-3.5 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-semibold uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                            placeholder="Sesuai akta kelahiran"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="block text-xs font-extrabold text-slate-700 uppercase" htmlFor="regNisn">
                              NISN SISWA <span className="text-red-500">*</span>
                            </label>
                            <span className="text-[9px] bg-teal-100 text-teal-900 px-1.5 py-0.5 rounded font-bold">10 DIGIT</span>
                          </div>
                          <input
                            id="regNisn"
                            type="text"
                            maxLength={10}
                            required
                            value={regNisn}
                            onChange={(e) => setRegNisn(e.target.value.replace(/[^0-9]/g, ''))}
                            className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-300 hover:border-teal-400 focus:border-teal-500 rounded-xl text-sm font-extrabold font-mono tracking-wider focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-500/10 transition-all placeholder:tracking-normal"
                            placeholder="Contoh: 0081234567"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1" htmlFor="regNik">
                            NIK SISWA (16 DIGIT) <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="regNik"
                            type="text"
                            maxLength={16}
                            required
                            value={regNik}
                            onChange={(e) => setRegNik(e.target.value.replace(/[^0-9]/g, ''))}
                            className="w-full px-3.5 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-mono tracking-wider focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                            placeholder="16 digit NIK Anda"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1" htmlFor="regJk">
                            JENIS KELAMIN <span className="text-red-500">*</span>
                          </label>
                          <select
                            id="regJk"
                            value={regJk}
                            onChange={(e) => setRegJk(e.target.value as 'L' | 'P')}
                            className="w-full px-3.5 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                          >
                            <option value="L">Laki-laki (L)</option>
                            <option value="P">Perempuan (P)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1" htmlFor="regTempatLahir">
                            TEMPAT LAHIR <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="regTempatLahir"
                            type="text"
                            required
                            value={regTempatLahir}
                            onChange={(e) => setRegTempatLahir(e.target.value)}
                            className="w-full px-3.5 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                            placeholder="Kota/Kabupaten Lahir"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="block text-xs font-extrabold text-slate-700 uppercase" htmlFor="regTanggalLahir">
                              TANGGAL LAHIR <span className="text-red-500">*</span>
                            </label>
                            <span className="text-[9px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-bold">KK / AKTA</span>
                          </div>
                          <input
                            id="regTanggalLahir"
                            type="date"
                            required
                            value={regTanggalLahir}
                            onChange={(e) => setRegTanggalLahir(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-300 hover:border-teal-400 focus:border-teal-500 rounded-xl text-sm font-bold text-teal-950 focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-500/10 transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1" htmlFor="regTingkatKelas">
                            TINGKAT KELAS <span className="text-red-500">*</span>
                          </label>
                          <select
                            id="regTingkatKelas"
                            value={regTingkatKelas}
                            onChange={(e) => setRegTingkatKelas(e.target.value)}
                            className="w-full px-3.5 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                          >
                            <option value="10">Kelas 10</option>
                            <option value="11">Kelas 11</option>
                            <option value="12">Kelas 12</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1" htmlFor="regRombonganBelajar">
                            ROMBONGAN BELAJAR <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="regRombonganBelajar"
                            type="text"
                            required
                            value={regRombonganBelajar}
                            onChange={(e) => setRegRombonganBelajar(e.target.value.toUpperCase())}
                            className="w-full px-3.5 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                            placeholder="Contoh: X-A atau XI-MIPA 1"
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION 2: BIODATA KELUARGA */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center space-x-1.5 border-b border-gray-100 pb-1">
                        <Users className="h-3.5 w-3.5 text-cyan-600" />
                        <span>Informasi Orang Tua / Wali</span>
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-gray-500 mb-1" htmlFor="regNamaIbuKandung">
                            NAMA IBU KANDUNG <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="regNamaIbuKandung"
                            type="text"
                            required
                            value={regNamaIbuKandung}
                            onChange={(e) => setRegNamaIbuKandung(e.target.value.toUpperCase())}
                            className="w-full px-3.5 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-semibold uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                            placeholder="Sesuai akta / KK"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1" htmlFor="regNikIbuKandung">
                            NIK IBU KANDUNG
                          </label>
                          <input
                            id="regNikIbuKandung"
                            type="text"
                            maxLength={16}
                            value={regNikIbuKandung}
                            onChange={(e) => setRegNikIbuKandung(e.target.value.replace(/[^0-9]/g, ''))}
                            className="w-full px-3.5 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-mono tracking-wider focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                            placeholder="Opsional / Diisi jika ada"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1" htmlFor="regNamaAyah">
                            NAMA AYAH KANDUNG
                          </label>
                          <input
                            id="regNamaAyah"
                            type="text"
                            value={regNamaAyah}
                            onChange={(e) => setRegNamaAyah(e.target.value.toUpperCase())}
                            className="w-full px-3.5 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-semibold uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                            placeholder="Nama Lengkap Ayah"
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION 3: ALAMAT */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center space-x-1.5 border-b border-gray-100 pb-1">
                        <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Alamat Domisili</span>
                      </h4>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1" htmlFor="regAlamatSiswa">
                          ALAMAT TEMPAT TINGGAL LENGKAP <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          id="regAlamatSiswa"
                          rows={2}
                          required
                          value={regAlamatSiswa}
                          onChange={(e) => setRegAlamatSiswa(e.target.value)}
                          className="w-full px-3.5 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none"
                          placeholder="Nama jalan, RT/RW, kelurahan, kecamatan, kota"
                        />
                      </div>
                    </div>

                    <button
                      id="btn-student-register"
                      type="submit"
                      className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-md shadow-teal-100 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>Simpan Baru & Masuk ke Portal</span>
                    </button>
                  </form>
                </>
              )}

              <div className="border-t border-gray-100 pt-4 flex justify-between items-center text-[10px] text-gray-400 font-medium">
                <span className="flex items-center">
                  <Shield className="h-3 w-3 mr-1 text-teal-600" />
                  Verifikasi Jalur Dukcapil & Dapodik
                </span>
                <span>NPSN: {schoolProfile.npsn}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* 3. LOGGED-IN PORTAL INTERFACE */
        <div className="space-y-6 animate-fade-in" id="student-portal-dashboard">
          {/* Welcome/Halaman Title Banner */}
          <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-cyan-600 rounded-2xl shadow-sm text-white p-6 relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 rounded-full bg-white/5 pointer-events-none"></div>
            <div className="absolute left-0 bottom-0 -translate-x-12 translate-y-12 w-64 h-64 rounded-full bg-white/5 pointer-events-none"></div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
              <div className="space-y-1">
                <span className="text-teal-200 text-xs font-bold uppercase tracking-wider block">PORTAL MANDIRI SISWA</span>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
                  <BookOpen className="h-6 w-6 stroke-[2] text-cyan-200" />
                  <span>Halaman Perbaikan Data Dapodik</span>
                </h2>
                <p className="text-teal-100/95 text-xs max-w-xl leading-relaxed">
                  Selamat datang, <strong>{currentStudent.nama}</strong>. Silakan lakukan perbaikan mandiri data Anda melalui formulir di bawah ini jika terdapat kesalahan atau ketidaksesuaian.
                </p>
              </div>
              <div className="flex items-center space-x-2.5 self-start md:self-auto">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[10px] font-extrabold tracking-wider bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-xs">SINKRONISASI AKTIF</span>
              </div>
            </div>
          </div>

          {/* NOTIFIKASI LAPORAN PERMASALAHAN MANDIRI SISWA */}
          {currentStudent && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden animate-fade-in" id="notifikasi-permasalahan-siswa">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShieldAlert className="h-5 w-5 text-teal-600 animate-pulse" />
                  <h3 className="text-sm font-black text-slate-800 tracking-tight uppercase">
                    Notifikasi Laporan Permasalahan Mandiri Siswa
                  </h3>
                </div>
                <span className="text-[10px] bg-teal-100/75 text-teal-800 px-2.5 py-0.5 rounded-full font-extrabold font-mono tracking-wider">
                  SISTEM AUDIT MANDIRI
                </span>
              </div>

              <div className="p-6">
                {currentStudent.keteranganMasalah && currentStudent.keteranganMasalah.trim() !== '' ? (
                  currentStudent.masalahTertangani ? (
                    /* 1. STATUS: SUDAH DITANGANI / SELESAI */
                    <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-5 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-200/40">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                            <CheckCircle2 className="h-5.5 w-5.5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-emerald-900 uppercase tracking-wide">
                              Status: SELESAI &amp; TERVERIFIKASI
                            </h4>
                            <p className="text-[11px] text-emerald-700 font-medium">
                              Laporan permasalahan data Anda telah berhasil diperbaiki oleh Operator Sekolah.
                            </p>
                          </div>
                        </div>
                        <span className="self-start sm:self-auto text-[10px] font-extrabold text-white bg-emerald-600 px-3 py-1 rounded-lg tracking-wider">
                          DAPODIK VALID
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <span className="font-black text-emerald-900 block uppercase tracking-wider text-[10px]">Laporan Anda:</span>
                        <blockquote className="bg-white/80 border-l-4 border-emerald-400 p-3 rounded-r-xl italic text-slate-700 font-medium">
                          "{currentStudent.keteranganMasalah}"
                        </blockquote>
                        <p className="text-[10.5px] text-emerald-600 leading-relaxed pt-1">
                          ✓ Pemutakhiran database lokal dan cloud telah rampung. Jika Anda masih melihat data yang salah di formulir, harap lakukan <b>Refresh</b> halaman web Anda atau sunting ulang di bawah ini.
                        </p>
                      </div>

                      <div className="pt-1 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingIssue(true);
                            setTempIssueText('');
                          }}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-emerald-100 cursor-pointer"
                        >
                          Kirim Laporan Baru
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (window.confirm("Apakah Anda yakin ingin menghapus arsip riwayat laporan ini?")) {
                              const updated = {
                                ...currentStudent,
                                keteranganMasalah: '',
                                masalahTertangani: false
                              };
                              onUpdateStudent(updated);
                              setCurrentStudent(updated);
                              if (formData) {
                                setFormData(prev => prev ? {
                                  ...prev,
                                  keteranganMasalah: '',
                                  masalahTertangani: false
                                } : null);
                              }
                            }
                          }}
                          className="px-4 py-2 bg-white hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                        >
                          Hapus Riwayat Laporan
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* 2. STATUS: SEDANG DIPROSES / ANTRIAN */
                    <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-200/40">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                            <Clock className="h-5.5 w-5.5 animate-spin" style={{ animationDuration: '3s' }} />
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
                              <span>Status: SEDANG VERIFIKASI BERKAS</span>
                              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                            </h4>
                            <p className="text-[11px] text-amber-700 font-medium">
                              Laporan telah diterima dan masuk antrean verifikasi berkas luring oleh Operator.
                            </p>
                          </div>
                        </div>
                        <span className="self-start sm:self-auto text-[10px] font-extrabold text-amber-900 bg-amber-200 border border-amber-300 px-3 py-1 rounded-lg tracking-wider uppercase">
                          Antrean Audit
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <span className="font-black text-amber-900 block uppercase tracking-wider text-[10px]">Rincian Masalah yang Dilaporkan:</span>
                        {isEditingIssue ? (
                          <div className="space-y-3">
                            <textarea
                              rows={3}
                              value={tempIssueText}
                              onChange={(e) => setTempIssueText(e.target.value)}
                              className="w-full px-4 py-2.5 bg-white border border-amber-300 rounded-xl text-xs focus:ring-4 focus:ring-amber-500/10 focus:outline-none focus:border-amber-500 transition-all font-medium resize-none text-slate-800"
                              placeholder="Ketik deskripsi permasalahan data baru secara detail..."
                            />
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  if (!tempIssueText.trim()) return;
                                  const updated = {
                                    ...currentStudent,
                                    keteranganMasalah: tempIssueText.trim(),
                                    masalahTertangani: false
                                  };
                                  onUpdateStudent(updated);
                                  setCurrentStudent(updated);
                                  if (formData) {
                                    setFormData(prev => prev ? {
                                      ...prev,
                                      keteranganMasalah: tempIssueText.trim(),
                                      masalahTertangani: false
                                    } : null);
                                  }
                                  setIsEditingIssue(false);
                                }}
                                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
                              >
                                Simpan Perubahan
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setIsEditingIssue(false);
                                  setTempIssueText(currentStudent.keteranganMasalah || '');
                                }}
                                className="px-3 py-1.5 bg-white hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold rounded-lg transition-all cursor-pointer"
                              >
                                Batal
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <blockquote className="bg-white/80 border-l-4 border-amber-400 p-3 rounded-r-xl italic text-slate-700 font-medium">
                              "{currentStudent.keteranganMasalah}"
                            </blockquote>
                            <p className="text-[10.5px] text-amber-600 leading-relaxed pt-1">
                              💡 <b>Informasi Penting</b>: Harap pastikan Anda telah mengunggah pindaian (scan) Kartu Keluarga (KK) dan Akta Kelahiran yang sah pada menu <b>"Dokumen Pendukung"</b> di sebelah kiri agar verifikasi Anda segera disetujui.
                            </p>
                            <div className="pt-2 flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => {
                                  setIsEditingIssue(true);
                                  setTempIssueText(currentStudent.keteranganMasalah || '');
                                }}
                                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                              >
                                Ubah Deskripsi Laporan
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  if (window.confirm("Apakah Anda yakin ingin menarik / menghapus laporan permasalahan mandiri ini?")) {
                                    const updated = {
                                      ...currentStudent,
                                      keteranganMasalah: '',
                                      masalahTertangani: false
                                    };
                                    onUpdateStudent(updated);
                                    setCurrentStudent(updated);
                                    if (formData) {
                                      setFormData(prev => prev ? {
                                        ...prev,
                                        keteranganMasalah: '',
                                        masalahTertangani: false
                                      } : null);
                                    }
                                  }
                                }}
                                className="px-4 py-2 bg-white hover:bg-amber-100 border border-amber-200 text-amber-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                              >
                                Tarik Laporan Saya
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )
                ) : (
                  /* 3. STATUS: BELUM ADA LAPORAN (FORMULIR LAPORAN MANDIRI CEPAT) */
                  <div className="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-5 space-y-4">
                    <div className="flex items-start space-x-3.5">
                      <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold flex-shrink-0">
                        <Info className="h-5.5 w-5.5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-black text-blue-900 uppercase tracking-wide">
                          Laporkan Permasalahan Data Mandiri Anda
                        </h4>
                        <p className="text-[11px] text-blue-700 font-medium leading-relaxed">
                          Menemukan kesalahan tulis pada nama, NIK, NISN, atau biodata orang tua Anda? Jangan khawatir! Kirimkan detail permasalahan data Anda melalui formulir mandiri cepat di bawah ini agar segera ditinjau dan diperbaiki oleh Operator Sekolah di Dapodik.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <textarea
                        rows={3}
                        value={tempIssueText}
                        onChange={(e) => setTempIssueText(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-blue-200 rounded-xl text-xs focus:ring-4 focus:ring-blue-500/10 focus:outline-none focus:border-blue-500 transition-all font-medium resize-none text-slate-800"
                        placeholder="Contoh: Nama Ibu Kandung saya kurang huruf 'A' di bagian tengah, tertulis NURAINI seharusnya NURAINIA sesuai KK..."
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!tempIssueText.trim()) return;
                          const updated = {
                            ...currentStudent,
                            keteranganMasalah: tempIssueText.trim(),
                            masalahTertangani: false
                          };
                          onUpdateStudent(updated);
                          setCurrentStudent(updated);
                          if (formData) {
                            setFormData(prev => prev ? {
                              ...prev,
                              keteranganMasalah: tempIssueText.trim(),
                              masalahTertangani: false
                            } : null);
                          }
                          setTempIssueText('');
                        }}
                        className="flex items-center space-x-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-100 cursor-pointer"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Kirim Laporan Permasalahan Mandiri</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT COLUMN: SIDEBAR WITH PROFILE AND SUB-MENU (4 COLS) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Profile Summary Badge */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white flex items-center justify-center font-black text-lg shadow-sm shadow-teal-100">
                    {currentStudent.nama.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 tracking-tight leading-tight">{currentStudent.nama}</h3>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      <span className="text-xs bg-teal-50 border border-teal-100 text-teal-900 px-2.5 py-0.5 rounded-lg font-extrabold font-mono shadow-3xs">
                        NISN: {currentStudent.nisn}
                      </span>
                      <span className="text-[10px] bg-slate-50 border border-slate-100 text-slate-700 px-2 py-0.5 rounded-lg font-extrabold">
                        Kelas {currentStudent.tingkatKelas} ({currentStudent.rombonganBelajar})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-3.5 grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50">
                    <span className="text-[9px] font-black text-gray-400 block uppercase tracking-wider mb-0.5">Tempat, Tgl Lahir</span>
                    <span className="font-extrabold text-slate-900 block leading-tight">{currentStudent.tempatLahir}, {formatIndoDate(currentStudent.tanggalLahir)}</span>
                  </div>
                  <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50">
                    <span className="text-[9px] font-black text-gray-400 block uppercase tracking-wider mb-0.5">Jenis Kelamin</span>
                    <span className="font-extrabold text-slate-900 block leading-tight">
                      {currentStudent.jenisKelamin === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)'}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center space-x-1.5 py-2 text-xs font-bold border border-red-100 hover:border-red-200 text-red-600 hover:bg-red-50/50 rounded-xl transition-all cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Keluar & Tutup Profil</span>
                  </button>
                </div>
              </div>

              {/* DYNAMIC INTERACTIVE SUB-MENU */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-4 space-y-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block px-2 mb-1">
                  Sub Menu Perbaikan Data
                </span>
                
                <button
                  type="button"
                  id="submenu-form"
                  onClick={() => setActiveSubTab('form')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeSubTab === 'form'
                      ? 'bg-teal-600 text-white shadow-sm shadow-teal-100'
                      : 'text-gray-600 hover:text-gray-950 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Edit3 className="h-4 w-4 flex-shrink-0" />
                    <span>Formulir Perbaikan</span>
                  </div>
                  <ChevronRight className={`h-4 w-4 opacity-50 ${activeSubTab === 'form' ? 'text-white' : 'text-gray-400'}`} />
                </button>

                <button
                  type="button"
                  id="submenu-documents"
                  onClick={() => setActiveSubTab('documents')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeSubTab === 'documents'
                      ? 'bg-teal-600 text-white shadow-sm shadow-teal-100'
                      : 'text-gray-600 hover:text-gray-950 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <FileText className="h-4 w-4 flex-shrink-0" />
                    <span>Dokumen Pendukung KK/Akta</span>
                  </div>
                  <ChevronRight className={`h-4 w-4 opacity-50 ${activeSubTab === 'documents' ? 'text-white' : 'text-gray-400'}`} />
                </button>

                <button
                  type="button"
                  id="submenu-workflow"
                  onClick={() => setActiveSubTab('workflow')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeSubTab === 'workflow'
                      ? 'bg-teal-600 text-white shadow-sm shadow-teal-100'
                      : 'text-gray-600 hover:text-gray-950 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <RefreshCw className="h-4 w-4 flex-shrink-0" />
                    <span>Alur Sinkronisasi</span>
                  </div>
                  <ChevronRight className={`h-4 w-4 opacity-50 ${activeSubTab === 'workflow' ? 'text-white' : 'text-gray-400'}`} />
                </button>
              </div>
            </div>

          {/* RIGHT COLUMN: DATA EDIT FORM (7 COLS) */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {activeSubTab === 'form' && (
                    <>
                      <BookOpen className="h-4.5 w-4.5 text-teal-600" />
                      <h3 className="text-sm font-bold text-gray-800">Formulir Perbaikan Mandiri Biodata Siswa</h3>
                    </>
                  )}
                  {activeSubTab === 'documents' && (
                    <>
                      <FileText className="h-4.5 w-4.5 text-blue-600" />
                      <h3 className="text-sm font-bold text-gray-800">Dokumen Pendukung KK & Akta</h3>
                    </>
                  )}
                  {activeSubTab === 'workflow' && (
                    <>
                      <RefreshCw className="h-4.5 w-4.5 text-purple-600" />
                      <h3 className="text-sm font-bold text-gray-800">Alur Sinkronisasi & Pemutakhiran</h3>
                    </>
                  )}
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 bg-teal-50 text-teal-700 rounded-full">
                  Status: {currentStudent.statusSiswa}
                </span>
              </div>

              {/* TAB 1: FORMULIR PERBAIKAN */}
              {activeSubTab === 'form' && formData && (
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  
                  {isSavedSuccessfully && (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-emerald-800 text-xs font-semibold flex items-center space-x-2 animate-fade-in">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                      <span>
                        Selesai! Biodata Anda berhasil disimpan dan diaudit ulang secara otomatis.
                      </span>
                    </div>
                  )}

                  {liveErrors.length > 0 && (
                    <div className="bg-red-50/75 border border-red-100 rounded-2xl p-5 space-y-3 animate-fade-in">
                      <div className="flex items-center space-x-2 pb-2 border-b border-red-100/50">
                        <ShieldAlert className="h-5 w-5 text-red-600 flex-shrink-0" />
                        <h4 className="text-xs font-extrabold text-red-800 uppercase tracking-wider">
                          Daftar Permasalahan Data yang Perlu Diperbaiki ({liveErrors.length})
                        </h4>
                      </div>
                      <ul className="space-y-2">
                        {liveErrors.map((err, idx) => (
                          <li key={err.id || idx} className="flex items-start space-x-2 text-xs">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                            <div className="space-y-0.5">
                              <span className="font-semibold text-gray-800">{err.message}</span>
                              {err.suggestedValue && (
                                <span className="block text-[10px] text-gray-500 font-mono">
                                  Saran Perbaikan: <b className="text-teal-700 font-semibold">{err.suggestedValue}</b>
                                </span>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                      <p className="text-[10px] text-red-600 italic">
                        * Silakan perbaiki data di bawah ini sesuai petunjuk agar status data Anda menjadi LAYAK DAPODIK.
                      </p>
                    </div>
                  )}

                  {liveErrors.length === 0 && !isSavedSuccessfully && (
                    <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 text-teal-800 text-xs font-semibold flex items-center space-x-2">
                      <ShieldCheck className="h-5 w-5 text-teal-500 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-teal-900">Selamat! Data Anda Sudah Valid</p>
                        <p className="text-[11px] text-teal-700 font-normal mt-0.5">Tidak ditemukan adanya permasalahan data. Data siap disinkronkan ke server pusat (Dapodik).</p>
                      </div>
                    </div>
                  )}

                  {/* SUBSECTION 1: BIODATA UTAMA */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider flex items-center space-x-2">
                      <User className="h-4 w-4 text-teal-500" />
                      <span>1. Identitas Pribadi</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="p_nama">
                          Nama Lengkap Siswa <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="p_nama"
                          type="text"
                          name="nama"
                          required
                          value={formData.nama}
                          onChange={handleUpperChange}
                          className="w-full px-4 py-2 bg-gray-50/30 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:outline-none focus:border-teal-500 focus:bg-white transition-all uppercase font-semibold"
                          placeholder="Sesuai akta kelahiran"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">
                          Harus ditulis dengan <b>HURUF KAPITAL</b> sepenuhnya, tanpa spasi ganda, dan tanpa sebutan gelar akademik.
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="p_nik">
                          NIK Siswa (16 Digit) <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="p_nik"
                          type="text"
                          name="nik"
                          required
                          maxLength={16}
                          value={formData.nik}
                          onChange={handleNumericChange}
                          className="w-full px-4 py-2 bg-gray-50/30 border border-gray-200 rounded-xl text-sm font-mono tracking-wider focus:ring-2 focus:ring-teal-500/20 focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                          placeholder="317xxxxxxxxxxxxx"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="p_jk">
                          Jenis Kelamin <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="p_jk"
                          name="jenisKelamin"
                          value={formData.jenisKelamin}
                          onChange={handleChange}
                          className="w-full px-4 py-2 bg-gray-50/30 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:outline-none focus:border-teal-500 focus:bg-white transition-all font-medium"
                        >
                          <option value="L">Laki-laki (L)</option>
                          <option value="P">Perempuan (P)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="p_tempat">
                          Tempat Lahir <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="p_tempat"
                          type="text"
                          name="tempatLahir"
                          required
                          value={formData.tempatLahir}
                          onChange={handleChange}
                          className="w-full px-4 py-2 bg-gray-50/30 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:outline-none focus:border-teal-500 focus:bg-white transition-all font-medium"
                          placeholder="Kabupaten/Kota lahir"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="p_dob">
                          Tanggal Lahir <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="p_dob"
                          type="date"
                          name="tanggalLahir"
                          required
                          value={formData.tanggalLahir}
                          onChange={handleChange}
                          className="w-full px-4 py-2 bg-gray-50/30 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:outline-none focus:border-teal-500 focus:bg-white transition-all font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="p_anak_ke">
                          Anak Ke <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="p_anak_ke"
                          type="text"
                          name="anakKe"
                          required
                          value={formData.anakKe || ''}
                          onChange={handleNumericChange}
                          className="w-full px-4 py-2 bg-gray-50/30 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:outline-none focus:border-teal-500 focus:bg-white transition-all font-medium"
                          placeholder="Contoh: 1"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="p_hp">
                          Nomor HP Aktif <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="p_hp"
                          type="text"
                          name="noHp"
                          required
                          value={formData.noHp || ''}
                          onChange={handleNumericChange}
                          className="w-full px-4 py-2 bg-gray-50/30 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:outline-none focus:border-teal-500 focus:bg-white transition-all font-medium"
                          placeholder="Contoh: 0812xxxxxxxx"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SUBSECTION 2: BIODATA ORANG TUA */}
                  <div className="space-y-4 border-t border-gray-100 pt-5">
                    <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider flex items-center space-x-2">
                      <Users className="h-4 w-4 text-cyan-500" />
                      <span>2. Informasi Keluarga / Orang Tua</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* CARD SUB-SECTION: IBU KANDUNG */}
                      <div className="bg-slate-50/50 p-4 border border-slate-100 rounded-2xl space-y-4">
                        <div className="font-bold text-xs text-slate-700 border-b border-slate-100 pb-1.5 flex items-center space-x-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
                          <span>Data Ibu Kandung</span>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-500 mb-1" htmlFor="p_ibu">
                              Nama Ibu Kandung <span className="text-red-500">*</span>
                            </label>
                            <input
                              id="p_ibu"
                              type="text"
                              name="namaIbuKandung"
                              required
                              value={formData.namaIbuKandung}
                              onChange={handleUpperChange}
                              className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500/20 focus:outline-none focus:border-teal-500 focus:bg-white transition-all uppercase font-semibold"
                              placeholder="SESUAI AKTA LAHIR"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-gray-500 mb-1" htmlFor="p_ibu_nik">
                              NIK Ibu Kandung (16 Digit)
                            </label>
                            <input
                              id="p_ibu_nik"
                              type="text"
                              name="nikIbuKandung"
                              maxLength={16}
                              value={formData.nikIbuKandung}
                              onChange={handleNumericChange}
                              className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-mono tracking-wider focus:ring-2 focus:ring-teal-500/20 focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                              placeholder="317xxxxxxxxxxxxx"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[11px] font-semibold text-gray-500 mb-1" htmlFor="p_ibu_dob">
                                Tgl Lahir Ibu <span className="text-red-500">*</span>
                              </label>
                              <input
                                id="p_ibu_dob"
                                type="date"
                                name="tanggalLahirIbu"
                                required
                                value={formData.tanggalLahirIbu || ''}
                                onChange={handleChange}
                                className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500/20 focus:outline-none focus:border-teal-500 focus:bg-white transition-all font-medium"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-gray-500 mb-1" htmlFor="p_ibu_job">
                                Pekerjaan Ibu <span className="text-red-500">*</span>
                              </label>
                              <input
                                id="p_ibu_job"
                                type="text"
                                name="pekerjaanIbu"
                                required
                                value={formData.pekerjaanIbu || ''}
                                onChange={handleChange}
                                className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500/20 focus:outline-none focus:border-teal-500 focus:bg-white transition-all font-medium"
                                placeholder="Contoh: Ibu Rumah Tangga"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* CARD SUB-SECTION: AYAH KANDUNG */}
                      <div className="bg-slate-50/50 p-4 border border-slate-100 rounded-2xl space-y-4">
                        <div className="font-bold text-xs text-slate-700 border-b border-slate-100 pb-1.5 flex items-center space-x-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                          <span>Data Ayah Kandung</span>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-500 mb-1" htmlFor="p_ayah">
                              Nama Ayah Kandung <span className="text-red-500">*</span>
                            </label>
                            <input
                              id="p_ayah"
                              type="text"
                              name="namaAyah"
                              required
                              value={formData.namaAyah}
                              onChange={handleUpperChange}
                              className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500/20 focus:outline-none focus:border-teal-500 focus:bg-white transition-all uppercase font-semibold"
                              placeholder="SESUAI AKTA LAHIR"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[11px] font-semibold text-gray-500 mb-1" htmlFor="p_ayah_dob">
                                Tgl Lahir Ayah <span className="text-red-500">*</span>
                              </label>
                              <input
                                id="p_ayah_dob"
                                type="date"
                                name="tanggalLahirAyah"
                                required
                                value={formData.tanggalLahirAyah || ''}
                                onChange={handleChange}
                                className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500/20 focus:outline-none focus:border-teal-500 focus:bg-white transition-all font-medium"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-gray-500 mb-1" htmlFor="p_ayah_job">
                                Pekerjaan Ayah <span className="text-red-500">*</span>
                              </label>
                              <input
                                id="p_ayah_job"
                                type="text"
                                name="pekerjaanAyah"
                                required
                                value={formData.pekerjaanAyah || ''}
                                onChange={handleChange}
                                className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500/20 focus:outline-none focus:border-teal-500 focus:bg-white transition-all font-medium"
                                placeholder="Contoh: Karyawan Swasta"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SUBSECTION 3: ALAMAT TINGGAL */}
                  <div className="space-y-4 border-t border-gray-100 pt-5">
                    <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-emerald-500" />
                      <span>3. Alamat Domisili Siswa</span>
                    </h4>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-gray-600" htmlFor="p_alamat">
                          Alamat Tempat Tinggal Lengkap <span className="text-red-500">*</span>
                        </label>
                        {formData.alamatSiswa && (
                          <button
                            type="button"
                            onClick={() => handleCopyAddress(formData.alamatSiswa)}
                            className="flex items-center space-x-1 text-[10px] font-bold text-teal-600 hover:text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100 hover:bg-teal-100/50 transition-all cursor-pointer"
                          >
                            {copiedAddress ? (
                              <>
                                <Check className="h-3 w-3" />
                                <span>Tersalin!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                <span>Salin Alamat</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                      <textarea
                        id="p_alamat"
                        name="alamatSiswa"
                        rows={2}
                        required
                        value={formData.alamatSiswa}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-gray-50/30 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:outline-none focus:border-teal-500 focus:bg-white transition-all font-medium resize-none"
                        placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan"
                      />
                    </div>

                    <div className="pt-2">
                      <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="p_keterangan_masalah">
                        Keterangan Permasalahan Data / Detail Kesalahan <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="p_keterangan_masalah"
                        name="keteranganMasalah"
                        rows={3}
                        required
                        value={formData.keteranganMasalah || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-gray-50/30 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:outline-none focus:border-teal-500 focus:bg-white transition-all font-medium resize-none"
                        placeholder="Contoh: Tempat lahir saya tertulis Jakarta Barat tetapi seharusnya Tangerang Selatan sesuai Akta Lahir."
                      />
                      <p className="text-[10px] text-gray-400 mt-1">
                        Tuliskan secara lengkap kesalahan data apa saja yang Anda temukan pada biodata saat ini agar operator sekolah dapat memprosesnya dengan mudah.
                      </p>
                    </div>
                  </div>

                  {/* PROTECTED FIELDS ADVISORY */}
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5 flex items-start space-x-3 text-[11px] text-gray-500">
                    <Lock className="h-4.5 w-4.5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      Catatan: Kolom <b>NISN</b>, <b>Tingkat Kelas</b>, <b>Rombongan Belajar</b>, dan <b>Status Kependidikan</b> dikunci demi keamanan penataan rombel nasional. Jika terdapat kesalahan rombel, hubungi Guru Wali Kelas atau Operator Dapodik Sekolah.
                    </p>
                  </div>

                  {/* ACTION BUTTON */}
                  <div className="border-t border-gray-100 pt-5 flex items-center justify-end">
                    <button
                      id="btn-student-save"
                      type="submit"
                      className="flex items-center space-x-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold text-sm py-2.5 px-6 rounded-xl shadow-md shadow-teal-100 transition-all cursor-pointer transform hover:scale-[1.01] active:scale-[0.99]"
                    >
                      <Save className="h-4 w-4" />
                      <span>Simpan & Verifikasi Ulang</span>
                    </button>
                  </div>

                </form>
              )}



              {/* TAB 3: UNGGAN DOKUMEN KK & AKTA */}
              {activeSubTab === 'documents' && (
                <div className="p-6 space-y-6">
                  <div className="border-b border-gray-100 pb-4">
                    <h4 className="text-sm font-extrabold text-gray-900">Unggah Dokumen Bukti Pendukung</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Dokumen ini digunakan operator sekolah untuk mencocokkan usulan Anda sebelum disinkronkan ke pusat.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* CARD 1: KARTU KELUARGA */}
                    <div className="bg-white border border-gray-150 rounded-2xl p-4 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-md uppercase tracking-wider">Kartu Keluarga (KK)</span>
                          {uploadStatus['kk'] === 'success' && <span className="text-[10px] text-emerald-600 font-bold flex items-center space-x-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> <span>Siap</span>
                          </span>}
                        </div>
                        <h5 className="font-extrabold text-gray-800 text-sm mt-2">Scan / Foto Kartu Keluarga</h5>
                        <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">Pastikan seluruh nomor NIK anggota keluarga dan nama Ibu Kandung terbaca jelas.</p>
                      </div>

                      {/* AREA DROP / STATUS */}
                      {(!uploadStatus['kk'] || uploadStatus['kk'] === 'idle') && (
                        <div>
                          <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-teal-400 bg-gray-50/50 hover:bg-teal-50/10 rounded-xl p-6 text-center cursor-pointer transition-all">
                            <Upload className="h-8 w-8 text-gray-400 mb-2" />
                            <span className="text-xs font-bold text-gray-700">Pilih Berkas KK</span>
                            <span className="text-[10px] text-gray-400 mt-1">PDF, JPG, atau PNG (Max 2MB)</span>
                            <input 
                              type="file" 
                              accept=".pdf,.jpg,.jpeg,.png"
                              className="hidden" 
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  simulateUpload('kk', e.target.files[0].name);
                                }
                              }}
                            />
                          </label>
                        </div>
                      )}

                      {uploadStatus['kk'] === 'uploading' && (
                        <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                            <span className="flex items-center space-x-1.5">
                              <RefreshCw className="h-3.5 w-3.5 animate-spin text-teal-600" />
                              <span>Mengunggah berkas...</span>
                            </span>
                            <span>{uploadProgress['kk'] || 0}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-teal-600 h-1.5 rounded-full transition-all duration-100" style={{ width: `${uploadProgress['kk'] || 0}%` }}></div>
                          </div>
                        </div>
                      )}

                      {uploadStatus['kk'] === 'success' && (
                        <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between">
                          <div className="flex items-center space-x-2.5 overflow-hidden">
                            <FileText className="h-8 w-8 text-blue-600 flex-shrink-0" />
                            <div className="overflow-hidden">
                              <span className="text-xs font-bold text-gray-800 block truncate">{kkFile || 'KK_TERUNGGAH.pdf'}</span>
                              <span className="text-[10px] text-gray-400 block font-mono">1.2 MB • Berkas Terlampir</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1.5 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => setPreviewDoc('kk')}
                              className="p-1.5 text-gray-500 hover:text-teal-600 bg-white border border-gray-200 rounded-lg shadow-2xs hover:border-teal-200 transition-all cursor-pointer"
                              title="Pratinjau Dokumen"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setUploadStatus(prev => ({ ...prev, kk: 'idle' }));
                                setKkFile(null);
                              }}
                              className="p-1.5 text-red-500 hover:text-red-700 bg-white border border-gray-200 rounded-lg shadow-2xs hover:border-red-200 transition-all cursor-pointer"
                              title="Hapus Berkas"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* CARD 2: AKTA KELAHIRAN */}
                    <div className="bg-white border border-gray-150 rounded-2xl p-4 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded-md uppercase tracking-wider">Akta Kelahiran</span>
                          {uploadStatus['akta'] === 'success' && <span className="text-[10px] text-emerald-600 font-bold flex items-center space-x-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> <span>Siap</span>
                          </span>}
                        </div>
                        <h5 className="font-extrabold text-gray-800 text-sm mt-2">Scan / Foto Akta Kelahiran</h5>
                        <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">Berguna untuk verifikasi penulisan nama lengkap, tempat lahir, dan tanggal lahir secara sahih.</p>
                      </div>

                      {/* AREA DROP / STATUS */}
                      {(!uploadStatus['akta'] || uploadStatus['akta'] === 'idle') && (
                        <div>
                          <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-teal-400 bg-gray-50/50 hover:bg-teal-50/10 rounded-xl p-6 text-center cursor-pointer transition-all">
                            <Upload className="h-8 w-8 text-gray-400 mb-2" />
                            <span className="text-xs font-bold text-gray-700">Pilih Berkas Akta</span>
                            <span className="text-[10px] text-gray-400 mt-1">PDF, JPG, atau PNG (Max 2MB)</span>
                            <input 
                              type="file" 
                              accept=".pdf,.jpg,.jpeg,.png"
                              className="hidden" 
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  simulateUpload('akta', e.target.files[0].name);
                                }
                              }}
                            />
                          </label>
                        </div>
                      )}

                      {uploadStatus['akta'] === 'uploading' && (
                        <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                            <span className="flex items-center space-x-1.5">
                              <RefreshCw className="h-3.5 w-3.5 animate-spin text-teal-600" />
                              <span>Mengunggah berkas...</span>
                            </span>
                            <span>{uploadProgress['akta'] || 0}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-teal-600 h-1.5 rounded-full transition-all duration-100" style={{ width: `${uploadProgress['akta'] || 0}%` }}></div>
                          </div>
                        </div>
                      )}

                      {uploadStatus['akta'] === 'success' && (
                        <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between">
                          <div className="flex items-center space-x-2.5 overflow-hidden">
                            <FileText className="h-8 w-8 text-purple-600 flex-shrink-0" />
                            <div className="overflow-hidden">
                              <span className="text-xs font-bold text-gray-800 block truncate">{aktaFile || 'AKTA_TERUNGGAH.pdf'}</span>
                              <span className="text-[10px] text-gray-400 block font-mono">980 KB • Berkas Terlampir</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1.5 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => setPreviewDoc('akta')}
                              className="p-1.5 text-gray-500 hover:text-teal-600 bg-white border border-gray-200 rounded-lg shadow-2xs hover:border-teal-200 transition-all cursor-pointer"
                              title="Pratinjau Dokumen"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setUploadStatus(prev => ({ ...prev, akta: 'idle' }));
                                setAktaFile(null);
                              }}
                              className="p-1.5 text-red-500 hover:text-red-700 bg-white border border-gray-200 rounded-lg shadow-2xs hover:border-red-200 transition-all cursor-pointer"
                              title="Hapus Berkas"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-gray-100 rounded-xl p-4 space-y-3">
                    <h5 className="text-xs font-extrabold text-gray-700 uppercase flex items-center space-x-1.5">
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      <span>Kebijakan Keamanan Dokumen</span>
                    </h5>
                    <ul className="text-[11px] text-gray-500 space-y-1.5 list-disc pl-4 leading-relaxed">
                      <li>Dokumen bukti pendukung dienkripsi secara aman end-to-end di database sekolah.</li>
                      <li>Hanya operator sekolah (Wali Data) yang memiliki wewenang mengunduh dokumen untuk diverifikasi kesesuaian fisiknya.</li>
                      <li>Format file yang diizinkan adalah PDF atau gambar berkualitas tinggi. Pastikan scan tidak memantulkan cahaya berlebih yang menutupi nomor registrasi dokumen.</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* TAB 4: ALUR SINKRONISASI */}
              {activeSubTab === 'workflow' && (
                <div className="p-6 space-y-6">
                  <div className="border-b border-gray-100 pb-4">
                    <h4 className="text-sm font-extrabold text-gray-900">Alur Penyelesaian & Sinkronisasi</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Memahami proses perjalanan data usulan dari perangkat Anda hingga ke server kementerian.</p>
                  </div>

                  {/* INTERACTIVE VERTICAL TIMELINE */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-6 space-y-4">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                        Tahapan Progres Usulan
                      </span>

                      <div className="relative border-l border-gray-150 pl-6 ml-3 space-y-6">
                        {/* STEP 1 */}
                        <div 
                          onClick={() => setSelectedWorkflowStep(1)}
                          className="relative cursor-pointer group"
                        >
                          <div className={`absolute -left-10 top-0.5 h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                            selectedWorkflowStep === 1
                              ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-100'
                              : 'bg-white text-gray-500 border-gray-200 group-hover:bg-slate-50'
                          }`}>
                            1
                          </div>
                          <div>
                            <h5 className={`font-bold text-xs ${selectedWorkflowStep === 1 ? 'text-teal-700' : 'text-gray-800'}`}>Siswa Mengajukan Perbaikan</h5>
                            <p className="text-[10px] text-gray-400 mt-0.5">Pengisian biodata secara mandiri dan mengunggah KK/Akta.</p>
                          </div>
                        </div>

                        {/* STEP 2 */}
                        <div 
                          onClick={() => setSelectedWorkflowStep(2)}
                          className="relative cursor-pointer group"
                        >
                          <div className={`absolute -left-10 top-0.5 h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                            selectedWorkflowStep === 2
                              ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-100'
                              : 'bg-white text-gray-500 border-gray-200 group-hover:bg-slate-50'
                          }`}>
                            2
                          </div>
                          <div>
                            <h5 className={`font-bold text-xs ${selectedWorkflowStep === 2 ? 'text-teal-700' : 'text-gray-800'}`}>Verifikasi Wali Data / Operator</h5>
                            <p className="text-[10px] text-gray-400 mt-0.5">Pemeriksaan keaslian KK/Akta oleh operator di dashboard admin.</p>
                          </div>
                        </div>

                        {/* STEP 3 */}
                        <div 
                          onClick={() => setSelectedWorkflowStep(3)}
                          className="relative cursor-pointer group"
                        >
                          <div className={`absolute -left-10 top-0.5 h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                            selectedWorkflowStep === 3
                              ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-100'
                              : 'bg-white text-gray-500 border-gray-200 group-hover:bg-slate-50'
                          }`}>
                            3
                          </div>
                          <div>
                            <h5 className={`font-bold text-xs ${selectedWorkflowStep === 3 ? 'text-teal-700' : 'text-gray-800'}`}>Persetujuan & TTE SPTJM</h5>
                            <p className="text-[10px] text-gray-400 mt-0.5">Kepala sekolah mengesahkan berkas secara elektronik.</p>
                          </div>
                        </div>

                        {/* STEP 4 */}
                        <div 
                          onClick={() => setSelectedWorkflowStep(4)}
                          className="relative cursor-pointer group"
                        >
                          <div className={`absolute -left-10 top-0.5 h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                            selectedWorkflowStep === 4
                              ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-100'
                              : 'bg-white text-gray-500 border-gray-200 group-hover:bg-slate-50'
                          }`}>
                            4
                          </div>
                          <div>
                            <h5 className={`font-bold text-xs ${selectedWorkflowStep === 4 ? 'text-teal-700' : 'text-gray-800'}`}>Sinkronisasi Server Pusat</h5>
                            <p className="text-[10px] text-gray-400 mt-0.5">Pengiriman paket data lokal ke server Dapodik Kemendikbud.</p>
                          </div>
                        </div>

                        {/* STEP 5 */}
                        <div 
                          onClick={() => setSelectedWorkflowStep(5)}
                          className="relative cursor-pointer group"
                        >
                          <div className={`absolute -left-10 top-0.5 h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                            selectedWorkflowStep === 5
                              ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-100'
                              : 'bg-white text-gray-500 border-gray-200 group-hover:bg-slate-50'
                          }`}>
                            5
                          </div>
                          <div>
                            <h5 className={`font-bold text-xs ${selectedWorkflowStep === 5 ? 'text-teal-700' : 'text-gray-800'}`}>Penyelarasan Ditjen Dukcapil</h5>
                            <p className="text-[10px] text-gray-400 mt-0.5">Verifikasi kecocokan nomor identitas ke Ditjen Dukcapil pusat.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* DETAILS CARD */}
                    <div className="md:col-span-6 bg-slate-50 border border-gray-100 rounded-2xl p-4.5 flex flex-col justify-between">
                      <div className="space-y-3">
                        <span className="text-[9px] font-black tracking-widest uppercase bg-teal-100 text-teal-800 px-2 py-0.5 rounded-md">
                          Detail Tahapan {selectedWorkflowStep}
                        </span>

                        {selectedWorkflowStep === 1 && (
                          <div className="space-y-2 text-xs">
                            <h6 className="font-extrabold text-gray-800 text-sm">Siswa Mengajukan Perbaikan</h6>
                            <p className="text-gray-500 leading-relaxed font-medium">
                              Siswa login menggunakan NISN dan tanggal lahir terdaftar, melakukan perbaikan data yang berstatus "invalid" pada sistem audit, dan mengunggah dokumen KK serta Akta asli sebagai bukti sah penyesuaian.
                            </p>
                            <div className="bg-white p-2.5 rounded-xl border border-gray-100">
                              <span className="font-bold text-[10px] text-gray-400 block uppercase">Penanggung Jawab</span>
                              <span className="font-extrabold text-gray-700 text-[11px]">Siswa Bersangkutan (Mandiri)</span>
                            </div>
                            <div className="bg-white p-2.5 rounded-xl border border-gray-100">
                              <span className="font-bold text-[10px] text-gray-400 block uppercase">Estimasi Waktu</span>
                              <span className="font-extrabold text-gray-700 text-[11px]">Sesuai kecepatan siswa (5 - 15 Menit)</span>
                            </div>
                          </div>
                        )}

                        {selectedWorkflowStep === 2 && (
                          <div className="space-y-2 text-xs">
                            <h6 className="font-extrabold text-gray-800 text-sm">Verifikasi Wali Data / Operator</h6>
                            <p className="text-gray-500 leading-relaxed font-medium">
                              Operator Dapodik Sekolah meneliti data usulan di panel admin dan mencocokkannya dengan fisik dokumen scan KK/Akta. Usulan disetujui jika tidak ada ketidaksesuaian penulisan nama atau NIK.
                            </p>
                            <div className="bg-white p-2.5 rounded-xl border border-gray-100">
                              <span className="font-bold text-[10px] text-gray-400 block uppercase">Penanggung Jawab</span>
                              <span className="font-extrabold text-gray-700 text-[11px]">Operator Dapodik / Tata Usaha Sekolah</span>
                            </div>
                            <div className="bg-white p-2.5 rounded-xl border border-gray-100">
                              <span className="font-bold text-[10px] text-gray-400 block uppercase">Estimasi Waktu</span>
                              <span className="font-extrabold text-gray-700 text-[11px]">1 - 2 Hari Kerja (Tergantung antrean berkas)</span>
                            </div>
                          </div>
                        )}

                        {selectedWorkflowStep === 3 && (
                          <div className="space-y-2 text-xs">
                            <h6 className="font-extrabold text-gray-800 text-sm">Persetujuan & TTE SPTJM</h6>
                            <p className="text-gray-500 leading-relaxed font-medium">
                              Kepala Sekolah memeriksa rekap usulan perbaikan data kolektif siswa, lalu menandatangani Surat Pernyataan Tanggung Jawab Mutlak (SPTJM) secara elektronik untuk melegalkan pengajuan ke dinas pendidikan.
                            </p>
                            <div className="bg-white p-2.5 rounded-xl border border-gray-100">
                              <span className="font-bold text-[10px] text-gray-400 block uppercase">Penanggung Jawab</span>
                              <span className="font-extrabold text-gray-700 text-[11px]">Kepala Satuan Pendidikan (Kepsek)</span>
                            </div>
                            <div className="bg-white p-2.5 rounded-xl border border-gray-100">
                              <span className="font-bold text-[10px] text-gray-400 block uppercase">Estimasi Waktu</span>
                              <span className="font-extrabold text-gray-700 text-[11px]">1 - 3 Hari Kerja</span>
                            </div>
                          </div>
                        )}

                        {selectedWorkflowStep === 4 && (
                          <div className="space-y-2 text-xs">
                            <h6 className="font-extrabold text-gray-800 text-sm">Sinkronisasi Server Pusat</h6>
                            <p className="text-gray-500 leading-relaxed font-medium">
                              Aplikasi Dapodik sekolah disinkronkan langsung ke server kementerian (Pusdatin). Data usulan yang disetujui akan diintegrasikan dengan database induk kependidikan nasional secara terpadu.
                            </p>
                            <div className="bg-white p-2.5 rounded-xl border border-gray-100">
                              <span className="font-bold text-[10px] text-gray-400 block uppercase">Penanggung Jawab</span>
                              <span className="font-extrabold text-gray-700 text-[11px]">Sistem Sinkronisasi Dapodik Pusdatin</span>
                            </div>
                            <div className="bg-white p-2.5 rounded-xl border border-gray-100">
                              <span className="font-bold text-[10px] text-gray-400 block uppercase">Estimasi Waktu</span>
                              <span className="font-extrabold text-gray-700 text-[11px]">Real-time / Maksimal 1x24 jam</span>
                            </div>
                          </div>
                        )}

                        {selectedWorkflowStep === 5 && (
                          <div className="space-y-2 text-xs">
                            <h6 className="font-extrabold text-gray-800 text-sm">Penyelarasan Ditjen Dukcapil</h6>
                            <p className="text-gray-500 leading-relaxed font-medium">
                              Pusdatin Kemendikbud melakukan interkoneksi database web service dengan Ditjen Dukcapil Kemendagri untuk memastikan validitas NIK, nama, dan tanggal lahir siswa terdaftar sinkron secara nasional.
                            </p>
                            <div className="bg-white p-2.5 rounded-xl border border-gray-100">
                              <span className="font-bold text-[10px] text-gray-400 block uppercase">Penanggung Jawab</span>
                              <span className="font-extrabold text-gray-700 text-[11px]">Kemendikbudristek & Ditjen Dukcapil Kemendagri</span>
                            </div>
                            <div className="bg-white p-2.5 rounded-xl border border-gray-100">
                              <span className="font-bold text-[10px] text-gray-400 block uppercase">Estimasi Waktu</span>
                              <span className="font-extrabold text-gray-700 text-[11px]">Otomatis (Seketika setelah sinkronisasi)</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl mt-4">
                        <p className="text-[10px] text-blue-700 leading-relaxed flex items-start space-x-1.5">
                          <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                          <span>Status Anda saat ini sedang berada pada <b>Tahapan 1 (Siswa Mengajukan Perbaikan)</b>. Selesaikan pengisian formulir dan unggahan dokumen agar operator dapat melanjutkannya ke Tahapan 2.</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    )}

    {/* SIMULATED DOCUMENT PREVIEW MODAL */}
    {previewDoc && (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl max-w-2xl w-full overflow-hidden animate-scale-up">
          <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-teal-400" />
              <h4 className="font-extrabold text-sm tracking-tight">
                Pratinjau Dokumen: {previewDoc === 'kk' ? 'Kartu Keluarga (KK)' : 'Akta Kelahiran'}
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setPreviewDoc(null)}
              className="text-gray-400 hover:text-white transition-all p-1 hover:bg-white/10 rounded-lg cursor-pointer text-xs font-bold"
            >
              Tutup
            </button>
          </div>

          <div className="p-6 bg-slate-100 flex justify-center items-center overflow-auto max-h-[60vh]">
            {previewDoc === 'kk' ? (
              /* KK Mock Graphic */
              <div className="bg-[#fcf8f2] border-4 border-double border-slate-700 p-8 shadow-md max-w-lg w-full font-serif text-[11px] text-slate-800 space-y-6 relative overflow-hidden select-none">
                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none transform -rotate-45">
                  <span className="text-8xl font-black">GARUDA</span>
                </div>

                <div className="text-center space-y-1 relative">
                  <h5 className="font-bold text-[14px] uppercase tracking-widest text-slate-900">KARTU KELUARGA</h5>
                  <p className="font-mono text-xs font-bold">No. 3171020304050009</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-[10px] border-b border-slate-300 pb-3">
                  <div>
                    <p>Nama Kepala Keluarga: <b>{formData?.namaAyah || 'MOHAMMAD SAFEI'}</b></p>
                    <p>Alamat: <b>{formData?.alamatSiswa.split(',')[0] || 'JL. MATRAMAN RAYA NO. 12'}</b></p>
                    <p>RT/RW: <b>004/002</b></p>
                  </div>
                  <div>
                    <p>Kecamatan: <b>MATRAMAN</b></p>
                    <p>Kabupaten/Kota: <b>JAKARTA TIMUR</b></p>
                    <p>Provinsi: <b>DKI JAKARTA</b></p>
                  </div>
                </div>

                {/* Table header */}
                <div className="border border-slate-400 overflow-x-auto">
                  <table className="w-full text-left text-[9px] border-collapse">
                    <thead>
                      <tr className="bg-slate-200 border-b border-slate-400 font-bold">
                        <th className="p-1 border-r border-slate-400">No</th>
                        <th className="p-1 border-r border-slate-400">Nama Lengkap</th>
                        <th className="p-1 border-r border-slate-400">NIK</th>
                        <th className="p-1 border-r border-slate-400">JK</th>
                        <th className="p-1">Tempat Lahir</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-300">
                        <td className="p-1 border-r border-slate-400">1</td>
                        <td className="p-1 border-r border-slate-400 font-bold">{formData?.namaAyah || 'MOHAMMAD SAFEI'}</td>
                        <td className="p-1 border-r border-slate-400 font-mono">3171021212720003</td>
                        <td className="p-1 border-r border-slate-400">L</td>
                        <td className="p-1">JAKARTA</td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="p-1 border-r border-slate-400">2</td>
                        <td className="p-1 border-r border-slate-400 font-bold">{formData?.namaIbuKandung || 'SITI AMINAH'}</td>
                        <td className="p-1 border-r border-slate-400 font-mono">{formData?.nikIbuKandung || '3171024508760002'}</td>
                        <td className="p-1 border-r border-slate-400">P</td>
                        <td className="p-1">BANDUNG</td>
                      </tr>
                      <tr>
                        <td className="p-1 border-r border-slate-400">3</td>
                        <td className="p-1 border-r border-slate-400 font-bold text-teal-700">{formData?.nama || 'ADITYA PRATAMA'}</td>
                        <td className="p-1 border-r border-slate-400 font-mono text-teal-700">{formData?.nik || '3171021504070001'}</td>
                        <td className="p-1 border-r border-slate-400">{formData?.jenisKelamin}</td>
                        <td className="p-1 font-bold">{formData?.tempatLahir}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-end text-[9px] pt-4">
                  <div className="space-y-1">
                    <p>Dikeluarkan Tanggal: 12-05-2021</p>
                    <p className="font-bold">KEPALA DINAS KEPENDUDUKAN</p>
                    <div className="h-10"></div>
                    <p className="underline font-bold">DRS. H. BUDI UTOMO, M.SI</p>
                  </div>
                  <div className="text-center font-bold text-emerald-700 border border-emerald-500/30 bg-emerald-50/50 p-2 rounded-lg flex items-center space-x-1">
                    <ShieldCheck className="h-4 w-4" />
                    <span>TERVERIFIKASI SISTEM SINKRONISASI</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Akta Mock Graphic */
              <div className="bg-[#fcf8f2] border-2 border-amber-800/40 p-8 shadow-md max-w-lg w-full font-serif text-[11px] text-slate-800 space-y-6 relative overflow-hidden select-none">
                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none transform -rotate-45">
                  <span className="text-8xl font-black">REPUBLIK INDONESIA</span>
                </div>

                <div className="text-center space-y-1 relative">
                  <span className="font-bold text-[10px] uppercase tracking-wider block">REPUBLIK INDONESIA</span>
                  <h5 className="font-bold text-[13px] uppercase tracking-widest text-amber-950">SALINAN AKTA KELAHIRAN</h5>
                  <p className="font-mono text-[10px]">No. 12891 / DIS / 2007</p>
                </div>

                <div className="space-y-4 pt-2 text-[11px] leading-relaxed">
                  <p>
                    Bahwa di <b className="uppercase">{formData?.tempatLahir || 'JAKARTA'}</b> pada tanggal <b className="uppercase">{formData ? formatIndoDate(formData.tanggalLahir) : '15 APRIL 2007'}</b> telah lahir seorang anak bernama:
                  </p>
                  <p className="text-center text-[14px] font-bold text-teal-800 uppercase tracking-wide border-y border-slate-300 py-2">
                    {formData?.nama || 'ADITYA PRATAMA'}
                  </p>
                  <p>
                    anak ke-1 (SATU) dari suami istri:
                  </p>
                  <p className="font-bold pl-4">
                    {formData?.namaAyah || 'MOHAMMAD SAFEI'} & {formData?.namaIbuKandung || 'SITI AMINAH'}
                  </p>
                </div>

                <div className="flex justify-between items-end text-[9px] pt-6 border-t border-slate-200">
                  <div>
                    <p>Jakarta, 20 April 2007</p>
                    <p className="font-bold">PEJABAT PENCATATAN SIPIL</p>
                    <div className="h-10"></div>
                    <p className="underline font-bold">H. HARTONO, S.H.</p>
                  </div>
                  <div className="text-center font-bold text-emerald-700 border border-emerald-500/30 bg-emerald-50/50 p-2 rounded-lg flex items-center space-x-1">
                    <ShieldCheck className="h-4 w-4" />
                    <span>MATERAI DIGITAL AKTIF</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setPreviewDoc(null)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Selesai Pratinjau
            </button>
          </div>
        </div>
      </div>
    )}

    </div>
  );
}

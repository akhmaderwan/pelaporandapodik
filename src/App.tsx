import React, { useState, useEffect } from 'react';
import { Student, SchoolProfile, ValidationError } from './types';
import { DEFAULT_SCHOOL_PROFILE, DEFAULT_STUDENTS } from './data';
import { 
  getSchoolProfile, 
  updateSchoolProfile, 
  getStudents, 
  saveStudent, 
  saveStudentsBatch, 
  removeStudent, 
  getResolutionNotes, 
  saveResolutionNote 
} from './lib/firebase';
import { validateStudent } from './validationEngine';
import SchoolProfileView from './components/SchoolProfileView';
import StudentFormView from './components/StudentFormView';
import StudentDirectory from './components/StudentDirectory';
import StudentValidationDetail from './components/StudentValidationDetail';
import ReportViewer from './components/ReportViewer';
import StudentPortalView from './components/StudentPortalView';
import AdminManagementView from './components/AdminManagementView';
import GitHubConnectionView from './components/GitHubConnectionView';
import Sman2Logo from './components/Sman2Logo';
import { 
  School, Users, ClipboardList, Settings, Sparkles, 
  CheckCircle2, AlertTriangle, BookOpen, GraduationCap, ArrowUpRight,
  UserCheck, ShieldAlert, X, Lock, LogIn, LogOut, Eye, EyeOff, Shield
} from 'lucide-react';

export default function App() {
  // 1. STATE INITIALIZATION (Persistent Browser Database)
  const [students, setStudents] = useState<Student[]>([]);
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(DEFAULT_SCHOOL_PROFILE);
  const [resolutionNotes, setResolutionNotes] = useState<Record<string, string>>({});
  
  // Authentication & View States
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('dapodik_admin_authenticated') === 'true';
  });
  
  // View Mode: 'operator' for Dapodik Operator Portal, 'student' for Student Self-Service
  const [viewMode, setViewMode] = useState<'operator' | 'student'>(() => {
    return localStorage.getItem('dapodik_admin_authenticated') === 'true' ? 'operator' : 'student';
  });

  // Admin login credentials state
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  // Navigation & Sub-views State
  const [currentTab, setCurrentTab] = useState<'students' | 'report' | 'profile' | 'admins'>('students');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [importNotification, setImportNotification] = useState<{
    added: number;
    updated: number;
    skipped: number;
  } | null>(null);
  
  // Loading state
  const [isLoaded, setIsLoaded] = useState(false);

  // Running text / Tulisan berjalan State
  const [showEditRunningTextModal, setShowEditRunningTextModal] = useState(false);
  const [tempRunningText, setTempRunningText] = useState('');

  // 2. LOAD DATA FROM DATABASE ON MOUNT WITH FIREBASE CLOUD SYNC
  useEffect(() => {
    const loadData = async () => {
      try {
        // Try getting from Firestore first
        const [cloudProfile, cloudStudents, cloudNotes] = await Promise.all([
          getSchoolProfile(),
          getStudents(),
          getResolutionNotes()
        ]);
        
        setSchoolProfile(cloudProfile);
        setStudents(cloudStudents);
        setResolutionNotes(cloudNotes);
        
        // Sync local cache
        localStorage.setItem('dapodik_db_school_profile', JSON.stringify(cloudProfile));
        localStorage.setItem('dapodik_db_students', JSON.stringify(cloudStudents));
        localStorage.setItem('dapodik_db_resolution_notes', JSON.stringify(cloudNotes));
      } catch (err) {
        console.error("Gagal memuat database cloud, memuat dari cache lokal:", err);
        // Fallback to local cache if offline or error
        const savedStudents = localStorage.getItem('dapodik_db_students');
        const savedProfile = localStorage.getItem('dapodik_db_school_profile');
        const savedNotes = localStorage.getItem('dapodik_db_resolution_notes');

        if (savedStudents) {
          setStudents(JSON.parse(savedStudents));
        } else {
          setStudents(DEFAULT_STUDENTS);
        }

        if (savedProfile) {
          setSchoolProfile(JSON.parse(savedProfile));
        } else {
          setSchoolProfile(DEFAULT_SCHOOL_PROFILE);
        }

        if (savedNotes) {
          setResolutionNotes(JSON.parse(savedNotes));
        }
      } finally {
        setIsLoaded(true);
      }
    };
    
    loadData();
  }, []);

  // 3. PERSIST SAVE HANDLERS (Saves to both Firestore & Local Cache)
  const saveStudentsToLocal = async (newStudents: Student[]) => {
    setStudents(newStudents);
    localStorage.setItem('dapodik_db_students', JSON.stringify(newStudents));
    try {
      await saveStudentsBatch(newStudents);
    } catch (e) {
      console.error("Gagal sinkronisasi data siswa ke cloud database:", e);
    }
  };

  const handleSaveProfile = async (updatedProfile: SchoolProfile) => {
    setSchoolProfile(updatedProfile);
    localStorage.setItem('dapodik_db_school_profile', JSON.stringify(updatedProfile));
    try {
      await updateSchoolProfile(updatedProfile);
    } catch (e) {
      console.error("Gagal menyimpan profil sekolah ke cloud database:", e);
    }
  };

  const handleUpdateResolutionNotes = async (errorId: string, notes: string) => {
    const updatedNotes = {
      ...resolutionNotes,
      [errorId]: notes,
    };
    setResolutionNotes(updatedNotes);
    localStorage.setItem('dapodik_db_resolution_notes', JSON.stringify(updatedNotes));
    try {
      await saveResolutionNote(errorId, notes);
    } catch (e) {
      console.error("Gagal menyimpan catatan resolusi ke cloud database:", e);
    }
  };

  // Admin Portal Protection Methods
  const handleSwitchToOperator = () => {
    if (isAdminAuthenticated) {
      setViewMode('operator');
      setSelectedStudent(null);
      setEditingStudent(null);
      setIsAddingStudent(false);
    } else {
      setShowLoginModal(true);
      setLoginUsername('');
      setLoginPassword('');
      setLoginError('');
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const u = loginUsername.trim().toLowerCase();
    const p = loginPassword.trim();
    
    if (!u || !p) {
      setLoginError('Username dan kata sandi wajib diisi.');
      return;
    }

    try {
      const response = await fetch('/api/admins/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: u, password: p }),
      });

      const data = await response.json();
      if (data.success) {
        setIsAdminAuthenticated(true);
        localStorage.setItem('dapodik_admin_authenticated', 'true');
        setViewMode('operator');
        setShowLoginModal(false);
        setLoginUsername('');
        setLoginPassword('');
        setLoginError('');
        setSelectedStudent(null);
        setEditingStudent(null);
        setIsAddingStudent(false);
      } else {
        setLoginError(data.error || 'Username atau kata sandi salah.');
      }
    } catch (err) {
      setLoginError('Gagal terhubung ke database server.');
    }
  };

  const handleRestoreFromGitHub = async (restoredData: {
    students?: Student[];
    schoolProfile?: SchoolProfile;
    resolutionNotes?: Record<string, string>;
  }) => {
    if (restoredData.students) {
      setStudents(restoredData.students);
      localStorage.setItem('dapodik_db_students', JSON.stringify(restoredData.students));
      try {
        await saveStudentsBatch(restoredData.students);
      } catch (e) {
        console.error("Gagal sinkronisasi data siswa hasil restore ke cloud database:", e);
      }
    }
    if (restoredData.schoolProfile) {
      setSchoolProfile(restoredData.schoolProfile);
      localStorage.setItem('dapodik_db_school_profile', JSON.stringify(restoredData.schoolProfile));
      try {
        await updateSchoolProfile(restoredData.schoolProfile);
      } catch (e) {
        console.error("Gagal sinkronisasi profil sekolah hasil restore ke cloud database:", e);
      }
    }
    if (restoredData.resolutionNotes) {
      setResolutionNotes(restoredData.resolutionNotes);
      localStorage.setItem('dapodik_db_resolution_notes', JSON.stringify(restoredData.resolutionNotes));
      for (const [key, value] of Object.entries(restoredData.resolutionNotes)) {
        try {
          await saveResolutionNote(key, value);
        } catch (e) {
          console.error(`Gagal sinkronisasi catatan resolusi ${key} ke cloud database:`, e);
        }
      }
    }
  };

  // 4. STUDENT CRUD METHODS
  const handleAddStudent = (newStudent: Student) => {
    const updated = [newStudent, ...students];
    saveStudentsToLocal(updated);
    setIsAddingStudent(false);
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    const updated = students.map(s => s.id === updatedStudent.id ? updatedStudent : s);
    saveStudentsToLocal(updated);
    
    // Also sync the selection if detail view is active
    if (selectedStudent && selectedStudent.id === updatedStudent.id) {
      setSelectedStudent(updatedStudent);
    }
    setEditingStudent(null);
  };

  const handleDeleteStudent = (id: string) => {
    const student = students.find(s => s.id === id);
    if (student) {
      setStudentToDelete(student);
    }
  };

  const confirmDeleteStudent = () => {
    if (!studentToDelete) return;
    const updated = students.filter(s => s.id !== studentToDelete.id);
    saveStudentsToLocal(updated);
    if (selectedStudent && selectedStudent.id === studentToDelete.id) {
      setSelectedStudent(null);
    }
    setStudentToDelete(null);
  };

  const handleImportStudents = (imported: Student[], overwriteDuplicates: boolean) => {
    let updated = [...students];
    let addedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    imported.forEach(newStudent => {
      // Find if student with same NISN already exists
      const existingIdx = newStudent.nisn 
        ? updated.findIndex(s => s.nisn === newStudent.nisn) 
        : -1;

      if (existingIdx !== -1) {
        if (overwriteDuplicates) {
          const existing = updated[existingIdx];
          updated[existingIdx] = {
            ...existing,
            ...newStudent,
            id: existing.id // preserve original system ID
          };
          updatedCount++;
        } else {
          skippedCount++;
        }
      } else {
        updated.unshift(newStudent);
        addedCount++;
      }
    });

    saveStudentsToLocal(updated);
    setImportNotification({
      added: addedCount,
      updated: updatedCount,
      skipped: skippedCount
    });
  };

  // 5. COMPUTE GLOBAL STATS
  const totalStudents = students.length;
  let totalErrors = 0;
  let validStudentsCount = 0;
  let invalidStudentsCount = 0;

  students.forEach(student => {
    const errors = validateStudent(student);
    if (errors.length > 0) {
      totalErrors += errors.length;
      invalidStudentsCount++;
    } else {
      validStudentsCount++;
    }
  });

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium text-sm">Menyiapkan basis data DapoValidator...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800 font-sans flex flex-col antialiased relative overflow-hidden">
      {/* Background Watermark Logo */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-0 opacity-[0.16] p-6 md:p-12">
        <div className="w-full h-full max-w-[680px] max-h-[680px] flex items-center justify-center">
          <Sman2Logo size="100%" />
        </div>
      </div>

      {/* 1. TOP EXECUTIVE KEMENDIKBUD-ACCENTED HEADER */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              {schoolProfile.logoUrl ? (
                <div className="h-11 w-11 bg-white border border-gray-100 rounded-xl p-1 flex items-center justify-center flex-shrink-0">
                  <img 
                    src={schoolProfile.logoUrl} 
                    alt="Logo Sekolah" 
                    className="max-h-full max-w-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <div className="h-11 w-11 bg-white border border-gray-100 rounded-xl p-0.5 flex items-center justify-center flex-shrink-0 shadow-xs">
                  <Sman2Logo size="100%" />
                </div>
              )}
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-base font-black text-gray-900 tracking-tight">DapoValidator</h1>
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">
                    v2.0 PRO
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 font-medium">
                  Sistem Audit & Perbaikan Data Mandiri Dapodik • {schoolProfile.namaSekolah}
                </p>
              </div>
            </div>

            {/* Header Right Controls */}
            <div className="flex items-center space-x-3">
              {/* Quick stats badge in navbar (hidden on mobile) */}
              <div className="hidden lg:flex items-center space-x-4 mr-1">
                <div className="text-right">
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Akurasi Data</div>
                  <div className="text-xs font-semibold text-gray-700">
                    {totalStudents > 0 ? `${Math.round((validStudentsCount / totalStudents) * 100)}% Layak` : '0%'}
                  </div>
                </div>
              </div>

              {/* Portal Switcher Button */}
              <button
                id="portal-switcher-btn"
                onClick={() => {
                  if (viewMode === 'student') {
                    handleSwitchToOperator();
                  } else {
                    setViewMode('student');
                    setSelectedStudent(null);
                    setEditingStudent(null);
                    setIsAddingStudent(false);
                  }
                }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-extrabold transition-all border shadow-xs cursor-pointer ${
                  viewMode === 'student'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-500 shadow-md shadow-blue-100'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-100'
                }`}
              >
                {viewMode === 'student' ? (
                  <>
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">Portal Operator Admin</span>
                    <span className="sm:hidden">Operator</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="h-4 w-4" />
                    <span className="hidden sm:inline">Portal Siswa Mandiri</span>
                    <span className="sm:hidden">Siswa</span>
                  </>
                )}
              </button>

              {/* Logout Admin Button */}
              {viewMode === 'operator' && isAdminAuthenticated && (
                <button
                  id="admin-logout-btn"
                  onClick={() => {
                    setIsAdminAuthenticated(false);
                    localStorage.removeItem('dapodik_admin_authenticated');
                    setViewMode('student');
                    setSelectedStudent(null);
                    setEditingStudent(null);
                    setIsAddingStudent(false);
                  }}
                  className="flex items-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-100/60 rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-xs transform active:scale-98"
                  title="Keluar dari Sesi Admin"
                >
                  <LogOut className="h-4 w-4 text-red-600" />
                  <span className="hidden sm:inline">Keluar Admin</span>
                  <span className="sm:hidden">Keluar</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* REAL-TIME DYNAMIC RUNNING ANNOUNCEMENT BANNER */}
      <div className="bg-blue-900 border-b border-blue-800 text-white shadow-xs py-2 px-4 sm:px-6 lg:px-8 relative z-30 flex items-center justify-between" id="running-announcement-banner">
        <div className="flex items-center flex-1 min-w-0">
          <div className="bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded-md font-extrabold tracking-wider uppercase text-[9px] flex items-center space-x-1 animate-pulse flex-shrink-0 mr-3">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-700"></span>
            </span>
            <span>INFO BERJALAN</span>
          </div>
          <div className="flex-1 min-w-0 overflow-hidden relative">
            <marquee 
              className="text-xs font-semibold select-none cursor-default block" 
              behavior="scroll" 
              direction="left" 
              scrollamount="5"
              onMouseOver={(e) => e.currentTarget.stop()} 
              onMouseOut={(e) => e.currentTarget.start()}
            >
              {schoolProfile.runningText || "Harap semua peserta didik segera memeriksa kelayakan data masing-masing menggunakan fitur perbaikan mandiri ini."}
            </marquee>
          </div>
        </div>

        {/* Edit Button for Admin/Operator */}
        {isAdminAuthenticated && (
          <button
            onClick={() => {
              setTempRunningText(schoolProfile.runningText || '');
              setShowEditRunningTextModal(true);
            }}
            title="Ubah Tulisan Berjalan"
            className="ml-3 p-1.5 bg-white/10 hover:bg-white/20 text-blue-200 hover:text-white rounded-lg transition-all cursor-pointer flex-shrink-0 border border-white/5 active:scale-95 flex items-center space-x-1"
          >
            <Settings className="h-3.5 w-3.5" />
            <span className="text-[10px] font-bold hidden md:inline">Ubah</span>
          </button>
        )}
      </div>

      {/* 2. SUB-BAR: STATISTICS DASHBOARD & TAB CONTROLLER */}
      {viewMode === 'operator' && (
        <section className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Quick Overview Bento stats */}
              <div className="grid grid-cols-3 gap-2.5 sm:gap-4 flex-grow max-w-xl">
                <div className="bg-gray-50/70 p-3.5 rounded-xl border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Siswa</span>
                  <span className="text-base sm:text-lg font-black text-gray-900 block mt-0.5">{totalStudents}</span>
                </div>
                <div className="bg-emerald-50/40 p-3.5 rounded-xl border border-emerald-100">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Siswa Valid</span>
                  <span className="text-base sm:text-lg font-black text-emerald-700 block mt-0.5">{validStudentsCount}</span>
                </div>
                <div className="bg-red-50/40 p-3.5 rounded-xl border border-red-100">
                  <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider block">Butuh Solusi</span>
                  <span className="text-base sm:text-lg font-black text-red-600 block mt-0.5">{invalidStudentsCount}</span>
                </div>
              </div>

              {/* TAB SELECTOR */}
              <nav className="flex space-x-1 bg-gray-100 p-1 rounded-xl self-start md:self-auto" id="main-navigation-tabs">
                <button
                  id="tab-students"
                  onClick={() => {
                    setCurrentTab('students');
                    setSelectedStudent(null);
                  }}
                  className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    currentTab === 'students' && !selectedStudent
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <Users className="h-4 w-4" />
                  <span>Basis Data Siswa</span>
                </button>

                <button
                  id="tab-report"
                  onClick={() => {
                    setCurrentTab('report');
                    setSelectedStudent(null);
                  }}
                  className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    currentTab === 'report'
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <ClipboardList className="h-4 w-4" />
                  <span>Profil Peserta Didik</span>
                </button>

                <button
                  id="tab-profile"
                  onClick={() => {
                    setCurrentTab('profile');
                    setSelectedStudent(null);
                  }}
                  className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    currentTab === 'profile'
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <School className="h-4 w-4" />
                  <span>Profil Sekolah</span>
                </button>

                <button
                  id="tab-admins"
                  onClick={() => {
                    setCurrentTab('admins');
                    setSelectedStudent(null);
                  }}
                  className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    currentTab === 'admins'
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <Shield className="h-4 w-4" />
                  <span>Kelola Admin</span>
                </button>
              </nav>
            </div>
          </div>
        </section>
      )}

      {/* 3. MAIN CONTENTS WRAPPER */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {importNotification && (
          <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 mb-6 shadow-xs flex items-start justify-between animate-fade-in">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-600 text-white rounded-xl">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-900">Impor Data Excel Berhasil!</h4>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-emerald-700 font-medium mt-0.5">
                  <span>• {importNotification.added} siswa baru ditambahkan</span>
                  {importNotification.updated > 0 && <span>• {importNotification.updated} siswa diperbarui</span>}
                  {importNotification.skipped > 0 && <span>• {importNotification.skipped} duplikat dilewati</span>}
                </div>
              </div>
            </div>
            <button
              onClick={() => setImportNotification(null)}
              className="p-1 hover:bg-emerald-100 text-emerald-600 hover:text-emerald-800 rounded-lg transition-all cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
        )}

        {viewMode === 'student' ? (
          <StudentPortalView
            students={students}
            schoolProfile={schoolProfile}
            onUpdateStudent={handleUpdateStudent}
            onAddStudent={handleAddStudent}
            onExitPortal={handleSwitchToOperator}
          />
        ) : (
          <>
            {/* ADD / EDIT MODAL-OVERLAY PANEL */}
            {isAddingStudent && (
              <StudentFormView
                onSave={handleAddStudent}
                onCancel={() => setIsAddingStudent(false)}
              />
            )}

            {editingStudent && (
              <StudentFormView
                student={editingStudent}
                onSave={handleUpdateStudent}
                onCancel={() => setEditingStudent(null)}
              />
            )}

            {/* REGULAR TAB CONTENT (IF NO FORM ACTIVE) */}
            {!isAddingStudent && !editingStudent && (
              <>
                {/* If a student is selected for detailed validation, show that regardless of tab to give natural flow */}
                {selectedStudent ? (
                  <StudentValidationDetail
                    student={selectedStudent}
                    onUpdateStudent={handleUpdateStudent}
                    onClose={() => setSelectedStudent(null)}
                    resolutionNotes={resolutionNotes}
                    onUpdateResolutionNotes={handleUpdateResolutionNotes}
                    onDeleteStudent={handleDeleteStudent}
                  />
                ) : (
                  <>
                    {currentTab === 'students' && (
                      <StudentDirectory
                        students={students}
                        onAddStudent={() => setIsAddingStudent(true)}
                        onEditStudent={(s) => setEditingStudent(s)}
                        onDeleteStudent={handleDeleteStudent}
                        onSelectStudent={(s) => setSelectedStudent(s)}
                        onUpdateStudent={handleUpdateStudent}
                        onImportStudents={handleImportStudents}
                      />
                    )}

                    {currentTab === 'report' && (
                      <ReportViewer
                        students={students}
                        schoolProfile={schoolProfile}
                        resolutionNotes={resolutionNotes}
                        onUpdateResolutionNotes={handleUpdateResolutionNotes}
                        onEditStudent={(s) => setEditingStudent(s)}
                      />
                    )}

                    {currentTab === 'profile' && (
                      <SchoolProfileView
                        profile={schoolProfile}
                        onSave={handleSaveProfile}
                      />
                    )}

                    {currentTab === 'admins' && (
                      <div className="space-y-6">
                        <AdminManagementView />
                        <GitHubConnectionView 
                          students={students}
                          schoolProfile={schoolProfile}
                          resolutionNotes={resolutionNotes}
                          onRestore={handleRestoreFromGitHub}
                        />
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* 4. FOOTER CREDITS */}
      <footer className="bg-white border-t border-gray-100 py-6 text-center text-xs text-gray-400 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-2">
          <p>
            DapoValidator adalah sistem asisten operator sekolah independen untuk mengaudit kualitas kualifikasi kelayakan Dapodik.
          </p>
          <p className="font-mono text-[10px]">
            © {new Date().getFullYear()} • Dikembangkan untuk Admin & Operator Dapodik Indonesia
          </p>
        </div>
      </footer>

      {/* CUSTOM CONFIRMATION MODAL */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-fade-in" id="delete-confirmation-modal">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl max-w-md w-full overflow-hidden transform transition-all scale-100 animate-scale-up">
            <div className="p-6 text-center space-y-4">
              <div className="mx-auto h-12 w-12 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-gray-900">Konfirmasi Hapus Data Siswa</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Apakah Anda yakin ingin menghapus data siswa <strong className="text-gray-800">{studentToDelete.nama}</strong> (NISN: <span className="font-mono text-gray-700">{studentToDelete.nisn}</span>) dari basis data lokal ini secara permanen? Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-end space-x-3">
              <button
                type="button"
                id="btn-delete-cancel"
                onClick={() => setStudentToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                id="btn-delete-confirm"
                onClick={confirmDeleteStudent}
                className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md shadow-red-100 transition-all cursor-pointer transform active:scale-98"
              >
                Ya, Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN LOGIN MODAL */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/65 backdrop-blur-xs animate-fade-in" id="admin-login-modal">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl max-w-md w-full overflow-hidden transform transition-all scale-100 animate-scale-up">
            <div className="p-6 pb-4">
              <div className="mx-auto h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
                <Lock className="h-6 w-6" />
              </div>
              <div className="text-center space-y-2 mb-6">
                <h3 className="text-base font-extrabold text-gray-900">Autentikasi Operator Sekolah</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Masukkan nama pengguna dan kata sandi Operator untuk mengakses basis data Dapodik, melakukan audit kelayakan data, dan perbaikan terpadu.
                </p>
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-4">
                {/* Username Field */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Username Operator</label>
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={(e) => {
                      setLoginUsername(e.target.value.toLowerCase().replace(/\s+/g, ''));
                      if (loginError) setLoginError('');
                    }}
                    placeholder="Masukkan username..."
                    className="w-full bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white text-gray-900 placeholder-gray-400 rounded-xl px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-100 font-medium"
                    autoFocus
                    required
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Kata Sandi Operator</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={loginPassword}
                      onChange={(e) => {
                        setLoginPassword(e.target.value);
                        if (loginError) setLoginError('');
                      }}
                      placeholder="Masukkan kata sandi..."
                      className="w-full bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white text-gray-900 placeholder-gray-400 rounded-xl px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-100 font-medium pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {loginError && (
                  <div className="flex items-center space-x-1.5 text-red-600 text-xs font-semibold bg-red-50/60 p-2.5 rounded-xl border border-red-100/30 animate-shake">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowLoginModal(false);
                      setLoginUsername('');
                      setLoginPassword('');
                      setLoginError('');
                    }}
                    className="px-4 py-2.5 text-xs font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-100 transition-all cursor-pointer transform active:scale-98 flex items-center space-x-1.5"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Masuk Admin</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* DYNAMIC MODAL: EDIT RUNNING TEXT */}
      {showEditRunningTextModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-xs animate-fade-in" id="edit-running-text-modal">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-gray-100 shadow-2xl overflow-hidden transform transition-all scale-100 p-6 space-y-5">
            <div className="flex items-center space-x-3 text-amber-500">
              <div className="p-2.5 bg-amber-50 rounded-2xl">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-gray-900">Ubah Tulisan Berjalan</h3>
                <p className="text-[11px] text-gray-400">Sunting teks pengumuman berjalan secara real-time</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700" htmlFor="running-text-input">Isi Pengumuman</label>
              <textarea
                id="running-text-input"
                rows={4}
                value={tempRunningText}
                onChange={(e) => setTempRunningText(e.target.value)}
                className="w-full px-4 py-3 text-xs font-semibold border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all leading-relaxed"
                placeholder="Tulis pengumuman baru di sini..."
              />
              <p className="text-[10px] text-gray-400">
                Teks ini akan berjalan (scroll) dari kanan ke kiri di bagian atas aplikasi untuk menginformasikan pengumuman penting kepada siswa dan operator.
              </p>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowEditRunningTextModal(false)}
                className="flex-1 py-2.5 text-xs font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  const updated = { ...schoolProfile, runningText: tempRunningText };
                  handleSaveProfile(updated);
                  setShowEditRunningTextModal(false);
                }}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all cursor-pointer shadow-md shadow-blue-100 flex items-center justify-center"
              >
                Simpan & Terapkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

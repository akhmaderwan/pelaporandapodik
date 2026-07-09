import React, { useState } from 'react';
import { Student, ValidationError } from '../types';
import { validateStudent } from '../validationEngine';
import { 
  Sparkles, CheckCircle2, AlertTriangle, ArrowLeft, RefreshCw, 
  CornerDownRight, Check, Edit2, Save, FileText, User, Calendar, CreditCard, Heart, MapPin, Users,
  ChevronDown, ChevronUp, HelpCircle, Copy, Trash2
} from 'lucide-react';

interface StudentValidationDetailProps {
  student: Student;
  onUpdateStudent: (updated: Student) => void;
  onClose: () => void;
  onDeleteStudent: (id: string) => void;
  // Resolution notes storage
  resolutionNotes: Record<string, string>; // errorId -> notes
  onUpdateResolutionNotes: (errorId: string, notes: string) => void;
}

export default function StudentValidationDetail({
  student,
  onUpdateStudent,
  onClose,
  onDeleteStudent,
  resolutionNotes,
  onUpdateResolutionNotes
}: StudentValidationDetailProps) {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Correction Form States
  const [isEditing, setIsEditing] = useState(false);
  const [isAddressGuideOpen, setIsAddressGuideOpen] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  const handleCopyAddress = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const [editForm, setEditForm] = useState({
    nama: student.nama,
    nisn: student.nisn,
    nik: student.nik,
    tempatLahir: student.tempatLahir,
    tanggalLahir: student.tanggalLahir,
    jenisKelamin: student.jenisKelamin,
    namaIbuKandung: student.namaIbuKandung,
    nikIbuKandung: student.nikIbuKandung || '',
    namaAyah: student.namaAyah || '',
    alamatSiswa: student.alamatSiswa || '',
    tingkatKelas: student.tingkatKelas,
    rombonganBelajar: student.rombonganBelajar,
    statusSiswa: student.statusSiswa || 'Aktif',
    anakKe: student.anakKe || '',
    noHp: student.noHp || '',
    tanggalLahirAyah: student.tanggalLahirAyah || '',
    pekerjaanAyah: student.pekerjaanAyah || '',
    tanggalLahirIbu: student.tanggalLahirIbu || '',
    pekerjaanIbu: student.pekerjaanIbu || '',
    keteranganMasalah: student.keteranganMasalah || '',
  });

  // Sync state if student changes (e.g. on quick fix application)
  React.useEffect(() => {
    setEditForm({
      nama: student.nama,
      nisn: student.nisn,
      nik: student.nik,
      tempatLahir: student.tempatLahir,
      tanggalLahir: student.tanggalLahir,
      jenisKelamin: student.jenisKelamin,
      namaIbuKandung: student.namaIbuKandung,
      nikIbuKandung: student.nikIbuKandung || '',
      namaAyah: student.namaAyah || '',
      alamatSiswa: student.alamatSiswa || '',
      tingkatKelas: student.tingkatKelas,
      rombonganBelajar: student.rombonganBelajar,
      statusSiswa: student.statusSiswa || 'Aktif',
      anakKe: student.anakKe || '',
      noHp: student.noHp || '',
      tanggalLahirAyah: student.tanggalLahirAyah || '',
      pekerjaanAyah: student.pekerjaanAyah || '',
      tanggalLahirIbu: student.tanggalLahirIbu || '',
      pekerjaanIbu: student.pekerjaanIbu || '',
      keteranganMasalah: student.keteranganMasalah || '',
    });
  }, [student]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormUpperChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value.toUpperCase()
    }));
  };

  const handleFormNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const clean = value.replace(/[^0-9]/g, '');
    setEditForm(prev => ({
      ...prev,
      [name]: clean
    }));
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Student = {
      ...student,
      ...editForm,
      nama: editForm.nama.toUpperCase().trim(),
      namaIbuKandung: editForm.namaIbuKandung.toUpperCase().trim(),
      namaAyah: editForm.namaAyah.toUpperCase().trim(),
    };
    onUpdateStudent(updated);
    setIsEditing(false);
  };

  // Compute live deterministic errors
  const errors = validateStudent(student);

  // Trigger Gemini AI analysis
  const runAiAnalysis = async () => {
    setAiLoading(true);
    setAiResult(null);
    setAiError(null);

    try {
      const response = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student })
      });

      const data = await response.json();
      if (data.success) {
        setAiResult(data);
      } else {
        setAiError(data.error || 'Gagal memproses analisis AI.');
      }
    } catch (err: any) {
      console.error(err);
      setAiError('Terjadi kesalahan jaringan saat menghubungi asisten AI.');
    } finally {
      setAiLoading(false);
    }
  };

  // Helper to quickly apply a fix for a field
  const applyQuickFix = (field: string, suggestedValue: string) => {
    const updated = { ...student };
    const fieldMapping: Record<string, keyof Student> = {
      nama: 'nama',
      nik: 'nik',
      nisn: 'nisn',
      tanggalLahir: 'tanggalLahir',
      namaIbuKandung: 'namaIbuKandung',
      nikIbuKandung: 'nikIbuKandung',
    };

    const targetField = fieldMapping[field];
    if (targetField) {
      // Apply the fix!
      (updated[targetField] as string) = suggestedValue;
      onUpdateStudent(updated);
    }
  };

  return (
    <div className="space-y-6" id="student-validation-detail-container">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700 transition-all cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-gray-900">{student.nama}</h2>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                student.jenisKelamin === 'L' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'
              }`}>
                {student.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
              </span>
            </div>
            <p className="text-gray-500 text-xs mt-0.5">
              NISN: {student.nisn} | Kelas: {student.tingkatKelas} - Rombel: {student.rombonganBelajar}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 self-stretch sm:self-auto w-full sm:w-auto">
          <button
            onClick={runAiAnalysis}
            disabled={aiLoading}
            className="flex flex-grow sm:flex-initial items-center justify-center space-x-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-indigo-100 transition-all cursor-pointer transform active:scale-98"
          >
            <Sparkles className={`h-4.5 w-4.5 ${aiLoading ? 'animate-spin' : ''}`} />
            <span>{aiLoading ? 'Menganalisis...' : 'Audit Asisten AI Gemini'}</span>
          </button>
          
          <button
            onClick={() => {
              onDeleteStudent(student.id);
              onClose();
            }}
            className="flex items-center justify-center space-x-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200/60 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer shadow-sm transform active:scale-98"
            title="Hapus Siswa dari Database"
          >
            <Trash2 className="h-4.5 w-4.5 text-red-600" />
            <span className="hidden md:inline">Hapus Siswa</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: LIVE VALIDATION FINDINGS (8 COLS) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card: Laporan Kesalahan Otomatis (Deterministic) */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-gray-600" />
                <h3 className="font-bold text-gray-800 text-sm">Hasil Validasi Dapodik Instan</h3>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                errors.length === 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
              }`}>
                {errors.length === 0 ? 'Data Layak / Bersih' : `${errors.length} Masalah Terdeteksi`}
              </span>
            </div>

            <div className="p-5 space-y-4 divide-y divide-gray-50">
              {errors.length === 0 ? (
                <div className="py-8 text-center flex flex-col items-center">
                  <div className="bg-emerald-50 text-emerald-600 p-3 rounded-full mb-3">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h4 className="font-semibold text-gray-800 text-sm">Luar Biasa, Data Siswa Valid!</h4>
                  <p className="text-gray-400 text-xs mt-1 max-w-sm">
                    Seluruh field kritis siswa ini telah lulus validasi format baku Dapodik & Dukcapil luring (offline).
                  </p>
                </div>
              ) : (
                errors.map((err, idx) => (
                  <div key={err.id} className={`pt-4 first:pt-0 space-y-3`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start space-x-2.5">
                        <div className="mt-0.5">
                          <AlertTriangle className={`h-4.5 w-4.5 ${
                            err.severity === 'critical' ? 'text-red-500' : 'text-amber-500'
                          }`} />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-gray-800 uppercase bg-gray-100 px-2 py-0.5 rounded">
                              {err.field}
                            </span>
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                              err.severity === 'critical' 
                                ? 'bg-red-50 text-red-700' 
                                : 'bg-amber-50 text-amber-700'
                            }`}>
                              {err.severity === 'critical' ? 'Kritis / Wajib' : 'Peringatan'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 font-medium mt-1.5">
                            {err.message}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Correction suggestion box */}
                    <div className="bg-gray-50 rounded-xl p-3 ml-7 text-xs border border-gray-100 space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-gray-400 block font-semibold uppercase">Nilai Saat Ini:</span>
                          <span className="font-mono text-red-600 bg-red-50/50 px-1 py-0.5 rounded break-all">
                            {err.currentValue || '[Kosong]'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 block font-semibold uppercase">Saran Koreksi Dapodik:</span>
                          <span className="font-mono text-emerald-700 bg-emerald-50/50 px-1 py-0.5 rounded break-all">
                            {err.suggestedValue}
                          </span>
                        </div>
                      </div>

                      {/* Quick Fix Button */}
                      {err.suggestedValue && err.suggestedValue !== 'YYYY-MM-DD' && !err.suggestedValue.includes('MASUKKAN') && (
                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => applyQuickFix(err.field, err.suggestedValue)}
                            className="inline-flex items-center space-x-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50/80 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                          >
                            <Check className="h-3 w-3" />
                            <span>Terapkan Koreksi Otomatis</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Editable Resolution Note */}
                    <div className="ml-7 space-y-1.5">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Catatan Penyelesaian Profil Peserta Didik (Tampil di Word/Excel):
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={resolutionNotes[err.id] || ''}
                          onChange={(e) => onUpdateResolutionNotes(err.id, e.target.value)}
                          placeholder="Contoh: Sedang menunggu upload akta kelahiran oleh wali murid / KK sudah sinkron"
                          className="w-full text-xs px-3 py-2 bg-gray-50/30 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* AI Output Container */}
          {aiLoading && (
            <div className="bg-gradient-to-r from-violet-50 to-indigo-50 border border-indigo-100 rounded-2xl p-6 text-center space-y-3 shadow-sm animate-pulse">
              <div className="flex justify-center">
                <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin" />
              </div>
              <h4 className="text-indigo-900 font-bold text-sm">Gemini AI Sedang Mengaudit Data...</h4>
              <p className="text-indigo-600 text-xs max-w-sm mx-auto">
                Memverifikasi format nama, cross-check tanggal lahir pada NIK, sinkronisasi Dukcapil, serta meneliti aturan baku Dapodik. Mohon tunggu sejenak.
              </p>
            </div>
          )}

          {aiError && (
            <div className="bg-red-50 border border-red-100 text-red-800 rounded-2xl p-5 text-xs flex items-start space-x-2.5">
              <AlertTriangle className="h-4.5 w-4.5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-bold">Gagal Menjalankan Analisis AI</h4>
                <p className="mt-1">{aiError}</p>
              </div>
            </div>
          )}

          {aiResult && (
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-slate-100 rounded-2xl p-6 shadow-xl border border-indigo-900 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="bg-violet-500/20 p-1.5 rounded-lg border border-violet-500/30">
                    <Sparkles className="h-5 w-5 text-violet-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200 text-sm">Laporan Audit Asisten AI Gemini</h4>
                    <p className="text-[10px] text-indigo-300">Hasil verifikasi semantik mendalam</p>
                  </div>
                </div>
                <button 
                  onClick={() => setAiResult(null)}
                  className="text-xs text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
                >
                  Tutup Laporan
                </button>
              </div>

              {/* Summary */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">Kesimpulan Kelayakan:</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {aiResult.summary}
                </p>
              </div>

              {/* AI Issues */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">Masalah Semantik Yang Ditemukan AI:</span>
                {(!aiResult.issues || aiResult.issues.length === 0) ? (
                  <p className="text-xs text-slate-400 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                    AI tidak mendeteksi adanya kejanggalan semantik tersembunyi.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {aiResult.issues.map((issue: any, index: number) => (
                      <div key={index} className="bg-slate-800/50 p-4 rounded-xl border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold bg-violet-900/40 text-violet-300 border border-violet-800 px-2 py-0.5 rounded uppercase font-mono">
                            {issue.field}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                            issue.severity === 'critical' ? 'bg-red-950 text-red-400' : 'bg-amber-950 text-amber-400'
                          }`}>
                            {issue.severity === 'critical' ? 'Kritis' : 'Peringatan'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">
                          {issue.description}
                        </p>
                        {issue.fix_suggestion && (
                          <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-t border-slate-800 text-[11px]">
                            <span className="text-slate-400">
                              Saran AI: <strong className="font-mono text-emerald-400 bg-emerald-950/30 px-1 py-0.5 rounded break-all">{issue.fix_suggestion}</strong>
                            </span>
                            {/* Option to apply if suggest fits schema */}
                            {issue.field && issue.field !== 'Lainnya' && issue.fix_suggestion.length < 50 && (
                              <button
                                type="button"
                                onClick={() => applyQuickFix(issue.field, issue.fix_suggestion)}
                                className="text-[10px] font-bold text-violet-400 hover:text-violet-300 transition-all cursor-pointer bg-slate-900 px-2 py-1 rounded"
                              >
                                Terapkan Saran AI
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* AI Recommendation */}
              {aiResult.recommendation && (
                <div className="bg-indigo-950/40 p-4 rounded-xl border border-indigo-900/60 text-xs">
                  <span className="text-[10px] font-bold text-indigo-300 block uppercase mb-1">Rekomendasi Tindak Lanjut:</span>
                  <p className="text-slate-300 leading-relaxed">{aiResult.recommendation}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: CURRENT BIODATA PROFILE OR FORM PERBAIKAN DATA (5 COLS) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6 space-y-6">
            <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800 flex items-center space-x-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <span>{isEditing ? 'Formulir Perbaikan Data' : 'Biodata Peserta Didik'}</span>
              </h3>
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer"
                >
                  <Edit2 className="h-3 w-3" />
                  <span>Koreksi Data</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs text-gray-500 hover:text-gray-700 font-semibold cursor-pointer"
                >
                  Batal
                </button>
              )}
            </div>

            {isEditing ? (
              /* INTERACTIVE FORMULIR PERBAIKAN DATA */
              <form onSubmit={handleSaveForm} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1" htmlFor="edit_nama">
                    Nama Lengkap Siswa <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="edit_nama"
                      type="text"
                      name="nama"
                      required
                      value={editForm.nama}
                      onChange={handleFormUpperChange}
                      className="w-full pl-9 pr-3 py-1.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all uppercase font-semibold"
                      placeholder="BUDI SANTOSO"
                    />
                    <User className="absolute left-3 top-2 h-3.5 w-3.5 text-gray-400" />
                  </div>
                  <p className="text-[9px] text-gray-400 mt-0.5 leading-tight">Must be completely CAPITALIZED, no double spaces, no degrees.</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1" htmlFor="edit_nisn">
                      NISN (10 Digit) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="edit_nisn"
                        type="text"
                        name="nisn"
                        required
                        maxLength={10}
                        value={editForm.nisn}
                        onChange={handleFormNumericChange}
                        className="w-full pl-9 pr-3 py-1.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
                        placeholder="00xxxxxxxx"
                      />
                      <CreditCard className="absolute left-3 top-2 h-3.5 w-3.5 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1" htmlFor="edit_nik">
                      NIK Siswa (16 Digit) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="edit_nik"
                        type="text"
                        name="nik"
                        required
                        maxLength={16}
                        value={editForm.nik}
                        onChange={handleFormNumericChange}
                        className="w-full pl-9 pr-3 py-1.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
                        placeholder="317xxxxxxxxxxxxx"
                      />
                      <CreditCard className="absolute left-3 top-2 h-3.5 w-3.5 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1" htmlFor="edit_tempat">
                      Tempat Lahir <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="edit_tempat"
                        type="text"
                        name="tempatLahir"
                        required
                        value={editForm.tempatLahir}
                        onChange={handleFormChange}
                        className="w-full pl-9 pr-3 py-1.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold uppercase"
                        placeholder="JAKARTA"
                      />
                      <MapPin className="absolute left-3 top-2 h-3.5 w-3.5 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1" htmlFor="edit_dob">
                      Tanggal Lahir <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="edit_dob"
                        type="date"
                        name="tanggalLahir"
                        required
                        value={editForm.tanggalLahir}
                        onChange={handleFormChange}
                        className="w-full pl-9 pr-3 py-1.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                      />
                      <Calendar className="absolute left-3 top-2 h-3.5 w-3.5 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1" htmlFor="edit_anak_ke">
                      Anak Ke <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="edit_anak_ke"
                        type="text"
                        name="anakKe"
                        required
                        value={editForm.anakKe || ''}
                        onChange={handleFormNumericChange}
                        className="w-full pl-9 pr-3 py-1.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                        placeholder="Contoh: 1"
                      />
                      <User className="absolute left-3 top-2 h-3.5 w-3.5 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1" htmlFor="edit_no_hp">
                      Nomor HP <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="edit_no_hp"
                        type="text"
                        name="noHp"
                        required
                        value={editForm.noHp || ''}
                        onChange={handleFormNumericChange}
                        className="w-full pl-9 pr-3 py-1.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                        placeholder="08xxxxxxxx"
                      />
                      <Calendar className="absolute left-3 top-2 h-3.5 w-3.5 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1" htmlFor="edit_jk">
                      Jenis Kelamin <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="edit_jk"
                      name="jenisKelamin"
                      value={editForm.jenisKelamin}
                      onChange={handleFormChange}
                      className="w-full px-3 py-1.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold"
                    >
                      <option value="L">Laki-laki (L)</option>
                      <option value="P">Perempuan (P)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1" htmlFor="edit_status">
                      Status Siswa <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="edit_status"
                      name="statusSiswa"
                      value={editForm.statusSiswa}
                      onChange={handleFormChange}
                      className="w-full px-3 py-1.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold"
                    >
                      <option value="Aktif">Aktif</option>
                      <option value="Lulus">Lulus</option>
                      <option value="Mutasi">Mutasi</option>
                      <option value="Dikeluarkan">Dikeluarkan</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1" htmlFor="edit_ibu">
                    Nama Ibu Kandung <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="edit_ibu"
                      type="text"
                      name="namaIbuKandung"
                      required
                      value={editForm.namaIbuKandung}
                      onChange={handleFormUpperChange}
                      className="w-full pl-9 pr-3 py-1.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all uppercase font-semibold"
                      placeholder="SITI AMINAH"
                    />
                    <Heart className="absolute left-3 top-2 h-3.5 w-3.5 text-gray-400" />
                  </div>
                  <p className="text-[9px] text-gray-400 mt-0.5 leading-tight">Must correspond to Birth Certificate (Akta Lahir), no "IBU", "NY.", "ALM".</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1" htmlFor="edit_ibu_nik">
                      NIK Ibu Kandung
                    </label>
                    <div className="relative">
                      <input
                        id="edit_ibu_nik"
                        type="text"
                        name="nikIbuKandung"
                        maxLength={16}
                        value={editForm.nikIbuKandung}
                        onChange={handleFormNumericChange}
                        className="w-full pl-9 pr-3 py-1.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
                        placeholder="317xxxxxxxxxxxxx"
                      />
                      <CreditCard className="absolute left-3 top-2 h-3.5 w-3.5 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1" htmlFor="edit_ibu_dob">
                      Tanggal Lahir Ibu <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="edit_ibu_dob"
                        type="date"
                        name="tanggalLahirIbu"
                        required
                        value={editForm.tanggalLahirIbu || ''}
                        onChange={handleFormChange}
                        className="w-full pl-9 pr-3 py-1.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                      />
                      <Calendar className="absolute left-3 top-2 h-3.5 w-3.5 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1" htmlFor="edit_ibu_job">
                      Pekerjaan Ibu <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="edit_ibu_job"
                      type="text"
                      name="pekerjaanIbu"
                      required
                      value={editForm.pekerjaanIbu || ''}
                      onChange={handleFormChange}
                      className="w-full px-3 py-1.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold"
                      placeholder="Contoh: Ibu Rumah Tangga"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1" htmlFor="edit_ayah">
                    Nama Ayah Kandung
                  </label>
                  <div className="relative">
                    <input
                      id="edit_ayah"
                      type="text"
                      name="namaAyah"
                      value={editForm.namaAyah}
                      onChange={handleFormUpperChange}
                      className="w-full pl-9 pr-3 py-1.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all uppercase font-semibold"
                      placeholder="MOHAMMAD SAFEI"
                    />
                    <User className="absolute left-3 top-2 h-3.5 w-3.5 text-gray-400" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1" htmlFor="edit_ayah_dob">
                      Tanggal Lahir Ayah <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="edit_ayah_dob"
                        type="date"
                        name="tanggalLahirAyah"
                        required
                        value={editForm.tanggalLahirAyah || ''}
                        onChange={handleFormChange}
                        className="w-full pl-9 pr-3 py-1.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                      />
                      <Calendar className="absolute left-3 top-2 h-3.5 w-3.5 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1" htmlFor="edit_ayah_job">
                      Pekerjaan Ayah <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="edit_ayah_job"
                      type="text"
                      name="pekerjaanAyah"
                      required
                      value={editForm.pekerjaanAyah || ''}
                      onChange={handleFormChange}
                      className="w-full px-3 py-1.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold"
                      placeholder="Contoh: Karyawan Swasta"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1" htmlFor="edit_tingkat">
                      Tingkat Kelas <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="edit_tingkat"
                      name="tingkatKelas"
                      value={editForm.tingkatKelas}
                      onChange={handleFormChange}
                      className="w-full px-3 py-1.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold"
                    >
                      <option value="10">Kelas 10</option>
                      <option value="11">Kelas 11</option>
                      <option value="12">Kelas 12</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1" htmlFor="edit_rombel">
                      Rombongan Belajar <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="edit_rombel"
                      type="text"
                      name="rombonganBelajar"
                      required
                      value={editForm.rombonganBelajar}
                      onChange={handleFormChange}
                      className="w-full px-3 py-1.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold uppercase"
                      placeholder="Contoh: X-A"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider" htmlFor="edit_alamat">
                      Alamat Lengkap <span className="text-red-500">*</span>
                    </label>
                    {editForm.alamatSiswa && (
                      <button
                        type="button"
                        onClick={() => handleCopyAddress(editForm.alamatSiswa)}
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
                  <div className="relative">
                    <textarea
                      id="edit_alamat"
                      name="alamatSiswa"
                      required
                      rows={2}
                      value={editForm.alamatSiswa}
                      onChange={handleFormChange}
                      className="w-full pl-9 pr-3 py-1.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium resize-none"
                      placeholder="Alamat lengkap tinggal..."
                    />
                    <MapPin className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1" htmlFor="edit_keterangan_masalah">
                    Keterangan Permasalahan Data / Catatan Perbaikan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="edit_keterangan_masalah"
                    name="keteranganMasalah"
                    required
                    rows={2}
                    value={editForm.keteranganMasalah || ''}
                    onChange={handleFormChange}
                    className="w-full px-3 py-1.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium resize-none"
                    placeholder="Contoh: Tanggal lahir ibu salah ketik..."
                  />
                  <p className="text-[9px] text-gray-400 mt-0.5">
                    Penjelasan atau detail kesalahan data yang dilaporkan langsung oleh siswa.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  <span>Simpan Perbaikan Biodata</span>
                </button>
              </form>
            ) : (
              /* READ-ONLY BIODATA VIEW WITH CORNER ACCENTS */
              <div className="space-y-4">
                <div className="flex items-start space-x-3 text-xs">
                  <User className="h-4.5 w-4.5 text-gray-400 mt-0.5" />
                  <div className="space-y-1">
                    <span className="text-gray-400 block font-semibold uppercase">Nama Lengkap Siswa</span>
                    <span className="font-semibold text-gray-800 break-all">{student.nama}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-xs">
                  <CreditCard className="h-4.5 w-4.5 text-gray-400 mt-0.5" />
                  <div className="space-y-1">
                    <span className="text-gray-400 block font-semibold uppercase">Nomor Induk Siswa (NISN)</span>
                    <span className="font-mono font-medium text-gray-800">{student.nisn}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-xs">
                  <CreditCard className="h-4.5 w-4.5 text-gray-400 mt-0.5" />
                  <div className="space-y-1">
                    <span className="text-gray-400 block font-semibold uppercase">NIK Siswa</span>
                    <span className="font-mono font-medium text-gray-800">{student.nik}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-xs">
                  <Calendar className="h-4.5 w-4.5 text-gray-400 mt-0.5" />
                  <div className="space-y-1">
                    <span className="text-gray-400 block font-semibold uppercase">Tempat, Tanggal Lahir</span>
                    <span className="font-medium text-gray-800">
                      {student.tempatLahir}, {student.tanggalLahir}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-start space-x-3 text-xs">
                    <User className="h-4.5 w-4.5 text-gray-400 mt-0.5" />
                    <div className="space-y-1">
                      <span className="text-gray-400 block font-semibold uppercase">Anak Ke</span>
                      <span className="font-medium text-gray-800">{student.anakKe || '-'}</span>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 text-xs">
                    <Calendar className="h-4.5 w-4.5 text-gray-400 mt-0.5" />
                    <div className="space-y-1">
                      <span className="text-gray-400 block font-semibold uppercase">Nomor HP</span>
                      <span className="font-medium text-gray-800">{student.noHp || '-'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-xs">
                  <Heart className="h-4.5 w-4.5 text-gray-400 mt-0.5" />
                  <div className="space-y-1">
                    <span className="text-gray-400 block font-semibold uppercase">Nama Ibu Kandung</span>
                    <span className="font-semibold text-gray-800 break-all">{student.namaIbuKandung}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="flex items-start space-x-3 text-xs">
                    <Heart className="h-4.5 w-4.5 text-gray-400 mt-0.5" />
                    <div className="space-y-1">
                      <span className="text-gray-400 block font-semibold uppercase">NIK Ibu</span>
                      <span className="font-mono text-gray-800">{student.nikIbuKandung || '-'}</span>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 text-xs">
                    <Calendar className="h-4.5 w-4.5 text-gray-400 mt-0.5" />
                    <div className="space-y-1">
                      <span className="text-gray-400 block font-semibold uppercase">Tgl Lahir Ibu</span>
                      <span className="font-medium text-gray-800">{student.tanggalLahirIbu || '-'}</span>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 text-xs">
                    <User className="h-4.5 w-4.5 text-gray-400 mt-0.5" />
                    <div className="space-y-1">
                      <span className="text-gray-400 block font-semibold uppercase">Pekerjaan Ibu</span>
                      <span className="font-medium text-gray-800">{student.pekerjaanIbu || '-'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-xs">
                  <User className="h-4.5 w-4.5 text-gray-400 mt-0.5" />
                  <div className="space-y-1">
                    <span className="text-gray-400 block font-semibold uppercase">Nama Ayah</span>
                    <span className="font-medium text-gray-800 break-all">{student.namaAyah || '-'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-start space-x-3 text-xs">
                    <Calendar className="h-4.5 w-4.5 text-gray-400 mt-0.5" />
                    <div className="space-y-1">
                      <span className="text-gray-400 block font-semibold uppercase">Tgl Lahir Ayah</span>
                      <span className="font-medium text-gray-800">{student.tanggalLahirAyah || '-'}</span>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 text-xs">
                    <User className="h-4.5 w-4.5 text-gray-400 mt-0.5" />
                    <div className="space-y-1">
                      <span className="text-gray-400 block font-semibold uppercase">Pekerjaan Ayah</span>
                      <span className="font-medium text-gray-800">{student.pekerjaanAyah || '-'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-xs">
                  <MapPin className="h-4.5 w-4.5 text-gray-400 mt-0.5" />
                  <div className="space-y-1 w-full">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 block font-semibold uppercase">Alamat Domisili</span>
                      {student.alamatSiswa && (
                        <button
                          type="button"
                          onClick={() => handleCopyAddress(student.alamatSiswa)}
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
                    <span className="font-medium text-gray-800 leading-relaxed block">{student.alamatSiswa || '-'}</span>
                  </div>
                </div>

                {student.keteranganMasalah && (
                  <div className={`mt-2 p-3.5 border rounded-xl space-y-2.5 animate-fade-in transition-all ${
                    student.masalahTertangani 
                      ? 'bg-emerald-50/50 border-emerald-200/50' 
                      : 'bg-amber-50/70 border-amber-200/60'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold block uppercase tracking-wider ${
                        student.masalahTertangani ? 'text-emerald-700' : 'text-amber-700'
                      }`}>
                        Laporan Kesalahan / Permasalahan Siswa:
                      </span>
                      <label className="flex items-center space-x-1.5 cursor-pointer bg-white px-2 py-0.5 rounded-lg border border-gray-100 shadow-xs">
                        <input
                          type="checkbox"
                          checked={!!student.masalahTertangani}
                          onChange={() => {
                            onUpdateStudent({
                              ...student,
                              masalahTertangani: !student.masalahTertangani
                            });
                          }}
                          className="h-3.5 w-3.5 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded cursor-pointer transition-all"
                        />
                        <span className="text-[10px] font-bold text-gray-700 select-none">Sudah Tertangani</span>
                      </label>
                    </div>
                    <p className={`text-xs font-semibold leading-relaxed italic ${
                      student.masalahTertangani ? 'text-gray-500 line-through' : 'text-amber-900'
                    }`}>
                      "{student.keteranganMasalah}"
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

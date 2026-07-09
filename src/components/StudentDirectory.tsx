import React, { useState } from 'react';
import { Student } from '../types';
import { validateStudent } from '../validationEngine';
import { 
  Search, Plus, Edit2, Trash2, SlidersHorizontal, CheckCircle2, 
  AlertTriangle, Eye, Sparkles, Filter, UserMinus, ChevronRight,
  Bell, MessageSquare, ArrowRight, FileSpreadsheet
} from 'lucide-react';
import ExcelImporter from './ExcelImporter';

interface StudentDirectoryProps {
  students: Student[];
  onAddStudent: () => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onSelectStudent: (student: Student) => void; // Trigger detailed view & validation
  onUpdateStudent?: (student: Student) => void;
  onImportStudents?: (importedStudents: Student[], overwriteDuplicates: boolean) => void;
}

export default function StudentDirectory({
  students,
  onAddStudent,
  onEditStudent,
  onDeleteStudent,
  onSelectStudent,
  onUpdateStudent,
  onImportStudents
}: StudentDirectoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'Valid', 'Error'
  const [showImporter, setShowImporter] = useState(false);

  // Get unique classes for filter
  const classes = Array.from(new Set(students.map(s => s.rombonganBelajar))).filter(Boolean).sort();

  // Filter students based on search, class and validity
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.nik.includes(searchTerm) ||
      student.nisn.includes(searchTerm);

    const matchesClass = classFilter === 'All' || student.rombonganBelajar === classFilter;

    // Check validity on the fly
    const errors = validateStudent(student);
    const hasErrors = errors.length > 0;

    let matchesStatus = true;
    if (statusFilter === 'Valid') {
      matchesStatus = !hasErrors;
    } else if (statusFilter === 'Error') {
      matchesStatus = hasErrors;
    }

    return matchesSearch && matchesClass && matchesStatus;
  });

  const studentsWithReportedIssues = students.filter(s => s.keteranganMasalah && s.keteranganMasalah.trim() !== '');
  const pendingIssuesCount = studentsWithReportedIssues.filter(s => !s.masalahTertangani).length;

  return (
    <div className="space-y-6">
      {/* LAPORAN PERMASALAHAN MANDIRI NOTIFICATION CENTER */}
      {studentsWithReportedIssues.length > 0 && (
        <div className={`border rounded-2xl p-6 shadow-sm transition-all duration-300 ${
          pendingIssuesCount === 0 
            ? 'bg-emerald-50/50 border-emerald-200/80 shadow-emerald-100/10' 
            : 'bg-amber-50/60 border-amber-200/80 shadow-amber-100/30'
        }`}>
          <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b gap-3 ${
            pendingIssuesCount === 0 ? 'border-emerald-200/60' : 'border-amber-200/60'
          }`}>
            <div className="flex items-center space-x-2.5">
              <div className={`p-2 rounded-xl text-white ${
                pendingIssuesCount === 0 
                  ? 'bg-emerald-600' 
                  : 'bg-amber-500 animate-bounce-slow'
              }`}>
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h3 className={`text-sm font-black uppercase tracking-wider ${
                  pendingIssuesCount === 0 ? 'text-emerald-900' : 'text-amber-900'
                }`}>
                  Notifikasi Laporan Permasalahan Mandiri Siswa
                </h3>
                <p className={`text-xs font-medium ${
                  pendingIssuesCount === 0 ? 'text-emerald-700' : 'text-amber-700'
                }`}>
                  {pendingIssuesCount === 0 ? (
                    <span>Luar biasa! Semua laporan permasalahan siswa telah <span className="font-bold underline">selesai ditangani</span>.</span>
                  ) : (
                    <span>Terdapat <span className="font-bold underline">{pendingIssuesCount} dari {studentsWithReportedIssues.length} siswa</span> yang laporannya belum ditangani.</span>
                  )}
                </p>
              </div>
            </div>
            <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest self-start sm:self-auto ${
              pendingIssuesCount === 0 
                ? 'bg-emerald-600 text-white' 
                : 'bg-amber-500 text-white'
            }`}>
              {pendingIssuesCount === 0 ? 'Selesai Semua' : 'Butuh Penanganan'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[340px] overflow-y-auto pr-1">
            {studentsWithReportedIssues.map((student) => (
              <div 
                key={student.id} 
                className={`border rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-all group ${
                  student.masalahTertangani 
                    ? 'bg-emerald-50/15 border-emerald-100/80 hover:border-emerald-300 hover:shadow-emerald-100/10' 
                    : 'bg-white border-amber-200/50 hover:border-amber-400 hover:shadow-amber-100/20'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <input
                        type="checkbox"
                        checked={!!student.masalahTertangani}
                        onChange={() => {
                          if (onUpdateStudent) {
                            onUpdateStudent({
                              ...student,
                              masalahTertangani: !student.masalahTertangani
                            });
                          }
                        }}
                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded cursor-pointer transition-all"
                      />
                      <span className={`font-bold text-xs uppercase tracking-tight flex items-center ${
                        student.masalahTertangani ? 'line-through text-gray-400' : 'text-gray-900'
                      }`}>
                        {!student.masalahTertangani && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse" />}
                        {student.nama}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wide ${
                        student.masalahTertangani 
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200/50' 
                          : 'bg-amber-100 text-amber-700 border border-amber-200/50'
                      }`}>
                        {student.masalahTertangani ? 'Tertangani' : 'Pending'}
                      </span>
                      <span className="text-[10px] font-extrabold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md uppercase tracking-wide">
                        {student.rombonganBelajar || `Kelas ${student.tingkatKelas}`}
                      </span>
                    </div>
                  </div>
                  
                  <div className={`border rounded-lg p-3 text-xs font-medium leading-relaxed italic relative ${
                    student.masalahTertangani 
                      ? 'bg-emerald-50/10 border-emerald-100/20 text-gray-400 line-through' 
                      : 'bg-amber-50/40 border-amber-100/30 text-amber-950'
                  }`}>
                    <MessageSquare className={`h-3.5 w-3.5 absolute right-2.5 top-2.5 opacity-60 ${
                      student.masalahTertangani ? 'text-emerald-400' : 'text-amber-400'
                    }`} />
                    "{student.keteranganMasalah}"
                  </div>
                </div>

                <div className="mt-3.5 pt-3 border-t border-gray-100/80 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-gray-400">
                    NISN: {student.nisn}
                  </span>
                  <button
                    onClick={() => onSelectStudent(student)}
                    className={`flex items-center space-x-1.5 text-xs font-bold px-3.5 py-1.5 rounded-lg border transition-all cursor-pointer group-hover:translate-x-0.5 ${
                      student.masalahTertangani
                        ? 'text-emerald-700 hover:text-emerald-900 bg-emerald-100/40 hover:bg-emerald-100/70 border-emerald-200/20'
                        : 'text-amber-700 hover:text-amber-900 bg-amber-100/70 hover:bg-amber-100 border-amber-200/30'
                    }`}
                  >
                    <span>Lakukan Audit Data</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showImporter && (
        <ExcelImporter
          existingStudents={students}
          onImport={(imported, overwrite) => {
            if (onImportStudents) {
              onImportStudents(imported, overwrite);
            }
            setShowImporter(false);
          }}
          onCancel={() => setShowImporter(false)}
        />
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" id="student-directory-container">
      {/* Search & Filter Header */}
      <div className="p-6 border-b border-gray-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Database Peserta Didik</h2>
            <p className="text-gray-500 text-sm">Kelola, audit, dan perbaiki data siswa sekolah Anda</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto w-full sm:w-auto">
            <button
              id="btn-import-excel"
              onClick={() => setShowImporter(!showImporter)}
              className="flex items-center justify-center space-x-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/60 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer shadow-sm transform active:scale-98 flex-1 sm:flex-initial"
            >
              <FileSpreadsheet className="h-4.5 w-4.5 text-emerald-600" />
              <span>Impor Excel</span>
            </button>
            <button
              id="btn-add-student"
              onClick={onAddStudent}
              className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer shadow-md shadow-blue-100 transform active:scale-98 flex-1 sm:flex-initial"
            >
              <Plus className="h-4.5 w-4.5" />
              <span>Tambah Siswa Baru</span>
            </button>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2">
          {/* Search Input */}
          <div className="relative md:col-span-6">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
              <Search className="h-4.5 w-4.5" />
            </span>
            <input
              type="text"
              placeholder="Cari berdasarkan Nama, NIK, atau NISN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm text-gray-800 placeholder:text-gray-400"
            />
          </div>

          {/* Class Filter */}
          <div className="relative md:col-span-3">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <Filter className="h-4 w-4" />
            </span>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm text-gray-700"
            >
              <option value="All">Semua Rombel</option>
              {classes.map(cl => (
                <option key={cl} value={cl}>{cl}</option>
              ))}
            </select>
          </div>

          {/* Validation Status Filter */}
          <div className="relative md:col-span-3">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <SlidersHorizontal className="h-4 w-4" />
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm text-gray-700"
            >
              <option value="All">Semua Status Kelayakan</option>
              <option value="Valid">Data Layak (Valid)</option>
              <option value="Error">Butuh Perbaikan (Error)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/70 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <th className="py-4 px-6">Nama Peserta Didik</th>
              <th className="py-4 px-6 hidden md:table-cell">NISN</th>
              <th className="py-4 px-6 hidden lg:table-cell">NIK</th>
              <th className="py-4 px-6">Rombel</th>
              <th className="py-4 px-6 text-center">Status Audit</th>
              <th className="py-4 px-6 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <div className="max-w-md mx-auto flex flex-col items-center">
                    <div className="bg-gray-50 p-4 rounded-full mb-3 text-gray-400">
                      <UserMinus className="h-8 w-8" />
                    </div>
                    <p className="text-gray-800 font-semibold">Tidak Ada Siswa Ditemukan</p>
                    <p className="text-gray-400 text-xs mt-1">
                      Coba ganti filter Anda atau tambahkan peserta didik baru untuk memulai audit perbaikan data.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => {
                const errors = validateStudent(student);
                const hasCritical = errors.some(e => e.severity === 'critical');
                const hasWarning = errors.some(e => e.severity === 'warning');

                return (
                  <tr 
                    key={student.id} 
                    className="hover:bg-gray-50/50 transition-all group"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                          student.jenisKelamin === 'L' 
                            ? 'bg-blue-50 text-blue-600' 
                            : 'bg-pink-50 text-pink-600'
                        }`}>
                          {student.nama.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800 text-sm group-hover:text-blue-600 transition-all flex items-center">
                            <span>{student.nama}</span>
                            {student.statusSiswa !== 'Aktif' && (
                              <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                                {student.statusSiswa}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-400 font-mono mt-0.5 md:hidden">
                            NISN: {student.nisn} | NIK: {student.nik}
                          </div>
                          <div className="text-[11px] text-gray-400 mt-0.5 hidden md:block">
                            Ibu: {student.namaIbuKandung || '-'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 hidden md:table-cell font-mono text-sm text-gray-600">
                      {student.nisn}
                    </td>

                    <td className="py-4 px-6 hidden lg:table-cell font-mono text-sm text-gray-600">
                      {student.nik}
                    </td>

                    <td className="py-4 px-6">
                      <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg">
                        {student.rombonganBelajar || `Kelas ${student.tingkatKelas}`}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-center">
                      {errors.length === 0 ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium border border-emerald-100">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Layak (Valid)</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => onSelectStudent(student)}
                          className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-full text-xs font-medium border border-red-100 transition-all cursor-pointer"
                          title="Klik untuk detail perbaikan"
                        >
                          <AlertTriangle className={`h-3.5 w-3.5 ${hasCritical ? 'text-red-500' : 'text-amber-500'}`} />
                          <span>{errors.length} Masalah</span>
                        </button>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-1.5 opacity-80 group-hover:opacity-100 transition-all">
                        <button
                          onClick={() => onSelectStudent(student)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                          title="Lakukan Audit & Perbaikan Terperinci"
                        >
                          <Sparkles className="h-4.5 w-4.5" />
                        </button>
                        <button
                          onClick={() => onEditStudent(student)}
                          className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all cursor-pointer"
                          title="Edit Biodata Siswa"
                        >
                          <Edit2 className="h-4.5 w-4.5" />
                        </button>
                        <button
                          onClick={() => onDeleteStudent(student.id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                          title="Hapus Siswa dari Database"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                        <button
                          onClick={() => onSelectStudent(student)}
                          className="p-1 text-gray-300 hover:text-gray-600 rounded transition-all"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer Stats */}
      <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500 gap-2">
        <div>
          Menampilkan <span className="font-semibold text-gray-700">{filteredStudents.length}</span> dari <span className="font-semibold text-gray-700">{students.length}</span> total siswa.
        </div>
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span>Layak Dapodik: {students.filter(s => validateStudent(s).length === 0).length}</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="h-2 w-2 rounded-full bg-red-500"></span>
            <span>Butuh Perbaikan: {students.filter(s => validateStudent(s).length > 0).length}</span>
          </span>
        </div>
      </div>
    </div>
    </div>
  );
}

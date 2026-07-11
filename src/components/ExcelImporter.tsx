import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Student } from '../types';
import { validateStudent } from '../validationEngine';
import { 
  Upload, Download, AlertTriangle, CheckCircle2, X, FileSpreadsheet,
  Info, Check, RefreshCw, AlertCircle
} from 'lucide-react';

interface ExcelImporterProps {
  onImport: (importedStudents: Student[], overwriteDuplicates: boolean) => void;
  onCancel: () => void;
  existingStudents: Student[];
}

export default function ExcelImporter({ onImport, onCancel, existingStudents }: ExcelImporterProps) {
  const [dragActive, setDragActive] = useState(false);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [validatedStudents, setValidatedStudents] = useState<{ student: Student; errors: string[] }[]>([]);
  const [overwriteDuplicates, setOverwriteDuplicates] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to parse dates from excel format
  const parseExcelDate = (value: any): string => {
    if (!value) return '';
    if (typeof value === 'number') {
      try {
        const date = new Date((value - 25569) * 86400 * 1000);
        if (!isNaN(date.getTime())) {
          const y = date.getFullYear();
          const m = String(date.getMonth() + 1).padStart(2, '0');
          const d = String(date.getDate()).padStart(2, '0');
          return `${y}-${m}-${d}`;
        }
      } catch (e) {
        // Fallback to string parse
      }
    }
    const str = String(value).trim();
    // Parse DD/MM/YYYY or DD-MM-YYYY
    const dmyMatch = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
    if (dmyMatch) {
      const [, d, m, y] = dmyMatch;
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
    return str;
  };

  // Convert parsed sheet rows into standard Student objects
  const processExcelRows = (rows: any[]) => {
    setErrorMsg(null);
    if (!rows || rows.length === 0) {
      setErrorMsg('File Excel kosong atau tidak memiliki data yang valid.');
      return;
    }

    // Find headers mapping
    const headerRow = rows[0];
    if (!headerRow || typeof headerRow !== 'object') {
      setErrorMsg('Format file tidak dikenali.');
      return;
    }

    // Check row structure - can be array of arrays or array of objects
    // If it's sheet_to_json with header: 1, first row is array of headers
    const headers = Array.isArray(headerRow) ? headerRow.map(h => String(h).trim().toLowerCase()) : [];
    
    if (headers.length === 0) {
      // It's already parsed as objects
      const keys = Object.keys(rows[0]);
      headers.push(...keys.map(k => k.trim().toLowerCase()));
    }

    // Header mappings
    const mappings: { [key: string]: string[] } = {
      nama: ['nama', 'nama lengkap', 'nama_lengkap', 'name', 'student name'],
      nisn: ['nisn', 'nomor induk siswa nasional', 'nisn_number'],
      nik: ['nik', 'nomor induk kependudukan', 'nik_number', 'no_nik', 'no nik'],
      tempatLahir: ['tempat lahir', 'tempat_lahir', 'birthplace', 'tempat'],
      tanggalLahir: ['tanggal lahir', 'tanggal_lahir', 'birthdate', 'tgl lahir', 'tgl_lahir'],
      jenisKelamin: ['jenis kelamin', 'jk', 'jenis_kelamin', 'gender', 'l/p', 'sex'],
      namaIbuKandung: ['nama ibu kandung', 'nama ibu', 'ibu kandung', 'nama_ibu_kandung', 'ibu'],
      nikIbuKandung: ['nik ibu', 'nik ibu kandung', 'nik_ibu_kandung', 'nik_ibu'],
      namaAyah: ['nama ayah', 'nama_ayah', 'ayah', 'father name', 'father'],
      alamatSiswa: ['alamat', 'alamat siswa', 'alamat_siswa', 'address'],
      tingkatKelas: ['tingkat kelas', 'tingkat_kelas', 'kelas', 'grade', 'tingkat'],
      rombonganBelajar: ['rombongan belajar', 'rombongan_belajar', 'rombel', 'class_name', 'class'],
      statusSiswa: ['status', 'status siswa', 'status_siswa', 'status siswa aktif']
    };

    const findKeyForHeader = (rowObj: any, fields: string[]): any => {
      const keys = Object.keys(rowObj);
      for (const key of keys) {
        const normalizedKey = key.trim().toLowerCase();
        if (fields.includes(normalizedKey)) {
          return rowObj[key];
        }
      }
      return undefined;
    };

    // Skip first row if it was parsed as array-of-arrays headers
    const dataRows = Array.isArray(headerRow) ? rows.slice(1) : rows;
    const imported: { student: Student; errors: string[] }[] = [];

    dataRows.forEach((row, index) => {
      // Skip empty rows
      if (!row || (Array.isArray(row) && row.length === 0) || (typeof row === 'object' && Object.keys(row).length === 0)) {
        return;
      }

      let studentData: any = {};

      if (Array.isArray(row)) {
        // Map by array index
        const getValByIndex = (fields: string[]) => {
          const idx = headers.findIndex(h => fields.includes(h));
          return idx !== -1 ? row[idx] : undefined;
        };

        studentData = {
          nama: String(getValByIndex(mappings.nama) || '').trim(),
          nisn: String(getValByIndex(mappings.nisn) || '').trim().replace(/\D/g, ''),
          nik: String(getValByIndex(mappings.nik) || '').trim().replace(/\D/g, ''),
          tempatLahir: String(getValByIndex(mappings.tempatLahir) || '').trim(),
          tanggalLahir: parseExcelDate(getValByIndex(mappings.tanggalLahir)),
          jenisKelamin: String(getValByIndex(mappings.jenisKelamin) || '').trim().toUpperCase() === 'P' ? 'P' : 'L',
          namaIbuKandung: String(getValByIndex(mappings.namaIbuKandung) || '').trim(),
          nikIbuKandung: String(getValByIndex(mappings.nikIbuKandung) || '').trim().replace(/\D/g, ''),
          namaAyah: String(getValByIndex(mappings.namaAyah) || '').trim(),
          alamatSiswa: String(getValByIndex(mappings.alamatSiswa) || '').trim(),
          tingkatKelas: String(getValByIndex(mappings.tingkatKelas) || '').trim(),
          rombonganBelajar: String(getValByIndex(mappings.rombonganBelajar) || '').trim(),
          statusSiswa: String(getValByIndex(mappings.statusSiswa) || '').trim() || 'Aktif'
        };
      } else {
        // Map by object keys
        const getVal = (fields: string[]) => findKeyForHeader(row, fields);

        studentData = {
          nama: String(getVal(mappings.nama) || '').trim(),
          nisn: String(getVal(mappings.nisn) || '').trim().replace(/\D/g, ''),
          nik: String(getVal(mappings.nik) || '').trim().replace(/\D/g, ''),
          tempatLahir: String(getVal(mappings.tempatLahir) || '').trim(),
          tanggalLahir: parseExcelDate(getVal(mappings.tanggalLahir)),
          jenisKelamin: String(getVal(mappings.jenisKelamin) || '').trim().toUpperCase() === 'P' ? 'P' : 'L',
          namaIbuKandung: String(getVal(mappings.namaIbuKandung) || '').trim(),
          nikIbuKandung: String(getVal(mappings.nikIbuKandung) || '').trim().replace(/\D/g, ''),
          namaAyah: String(getVal(mappings.namaAyah) || '').trim(),
          alamatSiswa: String(getVal(mappings.alamatSiswa) || '').trim(),
          tingkatKelas: String(getVal(mappings.tingkatKelas) || '').trim(),
          rombonganBelajar: String(getVal(mappings.rombonganBelajar) || '').trim(),
          statusSiswa: String(getVal(mappings.statusSiswa) || '').trim() || 'Aktif'
        };
      }

      // If name is totally empty, ignore this row
      if (!studentData.nama) return;

      // Normalize statusSiswa to fit type union
      let finalStatus: 'Aktif' | 'Mutasi' | 'Lulus' | 'Keluar' = 'Aktif';
      const parsedStatus = studentData.statusSiswa.toLowerCase();
      if (parsedStatus.includes('mutasi')) finalStatus = 'Mutasi';
      else if (parsedStatus.includes('lulus')) finalStatus = 'Lulus';
      else if (parsedStatus.includes('keluar')) finalStatus = 'Keluar';

      // Complete defaults for model conformity
      const fullStudent: Student = {
        id: studentData.nisn || `imported-${Date.now()}-${index}`,
        nama: studentData.nama,
        nisn: studentData.nisn || '',
        nik: studentData.nik || '',
        tempatLahir: studentData.tempatLahir || '',
        tanggalLahir: studentData.tanggalLahir || '',
        jenisKelamin: studentData.jenisKelamin === 'P' ? 'P' : 'L',
        tingkatKelas: studentData.tingkatKelas || '10',
        rombonganBelajar: studentData.rombonganBelajar || '',
        namaIbuKandung: studentData.namaIbuKandung || '',
        nikIbuKandung: studentData.nikIbuKandung || '',
        namaAyah: studentData.namaAyah || '',
        alamatSiswa: studentData.alamatSiswa || '',
        statusSiswa: finalStatus,
        masalahTertangani: false
      };

      // Validate student record to see warnings/errors
      const errors = validateStudent(fullStudent);

      imported.push({
        student: fullStudent,
        errors: errors.map(err => err.message)
      });
    });

    if (imported.length === 0) {
      setErrorMsg('Tidak dapat menemukan data siswa yang valid dalam file Excel tersebut.');
    } else {
      setValidatedStudents(imported);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) return;
        
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to array of arrays to preserve header row and column order
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        processExcelRows(rows);
      } catch (err: any) {
        console.error(err);
        setErrorMsg(`Format file tidak valid atau rusak: ${err.message || err}`);
      }
    };
    reader.readAsBinaryString(file);
  };

  const downloadTemplate = () => {
    // Generate simple excel template and download
    const templateData = [
      [
        "Nama Lengkap", "NISN", "NIK", "No Kartu Keluarga", 
        "Tempat Lahir", "Tanggal Lahir", "Jenis Kelamin", 
        "Nama Ibu Kandung", "Tingkat Kelas", "Rombongan Belajar", 
        "Penerima KIP", "No KIP", "Nama di KIP"
      ],
      [
        "Ahmad Fauzi", "3081234567", "3201234567890123", "3201234567890456",
        "Jakarta", "2008-05-14", "L", 
        "Siti Aminah", "10", "X MIPA 1", 
        "Tidak", "", ""
      ],
      [
        "Lutfi Rahmawati", "3087654321", "3202345678901234", "3202345678907890",
        "Bandung", "2007-11-23", "P", 
        "Kartini", "11", "XI IPS 2", 
        "Ya", "KIP-99887766", "LUTFI RAHMAWATI"
      ]
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Siswa");
    
    // Write buffer and download
    XLSX.writeFile(workbook, "Template_Dapodik_Import_Siswa.xlsx");
  };

  const handleConfirmImport = () => {
    if (validatedStudents.length === 0) return;
    const records = validatedStudents.map(v => v.student);
    onImport(records, overwriteDuplicates);
  };

  const resetImporter = () => {
    setValidatedStudents([]);
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Helper to deeply compare and match students to prevent duplicate entries
  const isSameStudent = (s1: Student, s2: Student): boolean => {
    // 1. Match by NISN if both have valid non-empty NISN
    if (s1.nisn && s2.nisn && s1.nisn.trim() !== '' && s2.nisn.trim() !== '') {
      if (s1.nisn.trim() === s2.nisn.trim()) return true;
    }
    
    // 2. Match by NIK if both have valid non-empty NIK
    if (s1.nik && s2.nik && s1.nik.trim() !== '' && s2.nik.trim() !== '') {
      if (s1.nik.trim() === s2.nik.trim()) return true;
    }
    
    // 3. Match by Name & Tanggal Lahir (case-insensitive, trimmed)
    if (s1.nama && s2.nama && s1.tanggalLahir && s2.tanggalLahir) {
      const name1 = s1.nama.trim().toLowerCase().replace(/\s+/g, ' ');
      const name2 = s2.nama.trim().toLowerCase().replace(/\s+/g, ' ');
      const dob1 = s1.tanggalLahir.trim();
      const dob2 = s2.tanggalLahir.trim();
      if (name1 === name2 && dob1 === dob2) return true;
    }
    
    return false;
  };

  // Compute duplicate checks
  const duplicatesCount = validatedStudents.filter(v => 
    existingStudents.some(es => isSameStudent(es, v.student))
  ).length;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6 animate-fade-in" id="excel-importer-container">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <FileSpreadsheet className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Import Data Siswa Kolektif (Excel)</h3>
            <p className="text-gray-500 text-xs">Unggah berkas excel untuk memasukkan atau membarui data siswa dalam jumlah banyak.</p>
          </div>
        </div>
        <button 
          onClick={onCancel}
          className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-gray-700 rounded-lg transition-all cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {validatedStudents.length === 0 ? (
        <div className="space-y-6">
          {/* DRAG AND DROP ZONE */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-4 ${
              dragActive 
                ? 'border-blue-500 bg-blue-50/40 scale-[0.99]' 
                : 'border-gray-200 hover:border-blue-400 hover:bg-slate-50/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileInputChange}
              className="hidden"
            />
            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
              <Upload className="h-8 w-8 animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Seret & taruh berkas Excel di sini, atau klik untuk memilih</p>
              <p className="text-xs text-gray-400 mt-1">Mendukung berkas format .xlsx, .xls, .csv hingga 10MB</p>
            </div>
          </div>

          {/* INFO & TEMPLATE DOWNLOAD */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 bg-slate-50/80 rounded-2xl p-5 border border-gray-100">
            <div className="md:col-span-8 space-y-3">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center space-x-1.5">
                <Info className="h-4 w-4 text-blue-500" />
                <span>Format Kolom yang Didukung</span>
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Sistem akan secara otomatis mencocokkan tajuk kolom (headers) dengan variasi nama berikut:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                <div className="bg-white border border-gray-200/60 rounded-lg p-2">
                  <span className="font-bold text-gray-800 block">Nama Lengkap</span>
                  <span className="text-gray-400 font-mono text-[9px]">nama, nama_lengkap, name</span>
                </div>
                <div className="bg-white border border-gray-200/60 rounded-lg p-2">
                  <span className="font-bold text-gray-800 block">NISN</span>
                  <span className="text-gray-400 font-mono text-[9px]">nisn, nomor induk siswa</span>
                </div>
                <div className="bg-white border border-gray-200/60 rounded-lg p-2">
                  <span className="font-bold text-gray-800 block">NIK</span>
                  <span className="text-gray-400 font-mono text-[9px]">nik, nomor_nik</span>
                </div>
                <div className="bg-white border border-gray-200/60 rounded-lg p-2">
                  <span className="font-bold text-gray-800 block">No KK</span>
                  <span className="text-gray-400 font-mono text-[9px]">no_kk, nomor kk</span>
                </div>
                <div className="bg-white border border-gray-200/60 rounded-lg p-2">
                  <span className="font-bold text-gray-800 block">Tgl Lahir</span>
                  <span className="text-gray-400 font-mono text-[9px]">tanggal_lahir, YYYY-MM-DD</span>
                </div>
                <div className="bg-white border border-gray-200/60 rounded-lg p-2">
                  <span className="font-bold text-gray-800 block">JK (L/P)</span>
                  <span className="text-gray-400 font-mono text-[9px]">jenis kelamin, gender</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-4 flex flex-col justify-center items-center md:items-start md:pl-4 md:border-l border-gray-200/60 space-y-3">
              <div className="text-center md:text-left">
                <span className="text-xs font-bold text-gray-800 block">Butuh contoh format?</span>
                <span className="text-[11px] text-gray-500">Gunakan dokumen template resmi yang sudah kami siapkan.</span>
              </div>
              <button
                onClick={downloadTemplate}
                className="flex items-center space-x-1.5 px-4 py-2 bg-white hover:bg-gray-50 text-blue-600 border border-blue-200 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Unduh Template Excel</span>
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2 text-red-800 animate-shake">
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold">Gagal memproses berkas:</span> {errorMsg}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* PARSED PREVIEW ZONE */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-blue-50/50 border border-blue-100 rounded-2xl p-4">
            <div>
              <h4 className="text-sm font-bold text-blue-900">Review Hasil Ekstraksi</h4>
              <p className="text-xs text-blue-700">
                Berhasil mendeteksi <span className="font-black">{validatedStudents.length} baris data siswa</span>.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {duplicatesCount > 0 && (
                <label className="flex items-center space-x-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={overwriteDuplicates}
                    onChange={(e) => setOverwriteDuplicates(e.target.checked)}
                    className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded cursor-pointer"
                  />
                  <span className="text-xs text-amber-800 font-medium select-none">
                    Timpa data duplikat ({duplicatesCount} siswa)
                  </span>
                </label>
              )}

              <button
                onClick={resetImporter}
                className="flex items-center space-x-1.5 px-3 py-1.5 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Ganti Berkas</span>
              </button>
            </div>
          </div>

          <div className="border border-gray-100 rounded-xl overflow-hidden max-h-[300px] overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 font-semibold sticky top-0 border-b border-gray-100 z-10">
                <tr>
                  <th className="px-4 py-3">Nama Lengkap</th>
                  <th className="px-4 py-3">NISN</th>
                  <th className="px-4 py-3">NIK</th>
                  <th className="px-4 py-3">Rombel</th>
                  <th className="px-4 py-3">Ibu Kandung</th>
                  <th className="px-4 py-3">Status Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-700">
                {validatedStudents.map(({ student, errors }, idx) => {
                  const isDuplicate = existingStudents.some(es => isSameStudent(es, student));
                  return (
                    <tr key={idx} className={`hover:bg-slate-50/50 transition-all ${isDuplicate ? 'bg-amber-50/20' : ''}`}>
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        <div className="flex flex-col">
                          <span>{student.nama}</span>
                          {isDuplicate && (
                            <span className="text-[9px] font-bold text-amber-600 uppercase tracking-wider mt-0.5">
                              {overwriteDuplicates ? 'Duplikat - Akan Ditimpa' : 'Duplikat - Lewatkan'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono">{student.nisn || <span className="text-gray-400 italic">kosong</span>}</td>
                      <td className="px-4 py-3 font-mono">{student.nik || <span className="text-gray-400 italic">kosong</span>}</td>
                      <td className="px-4 py-3">
                        <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 uppercase font-bold text-[10px]">
                          {student.rombonganBelajar || `Kelas ${student.tingkatKelas}`}
                        </span>
                      </td>
                      <td className="px-4 py-3">{student.namaIbuKandung || <span className="text-gray-400 italic">kosong</span>}</td>
                      <td className="px-4 py-3">
                        {errors.length === 0 ? (
                          <span className="inline-flex items-center space-x-1 text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md font-bold text-[10px] uppercase">
                            <Check className="h-3 w-3" />
                            <span>Valid</span>
                          </span>
                        ) : (
                          <div className="flex flex-col space-y-0.5 max-w-[200px]">
                            <span className="inline-flex items-center space-x-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-bold text-[10px] uppercase w-fit">
                              <AlertTriangle className="h-3 w-3 text-amber-500" />
                              <span>{errors.length} Temuan</span>
                            </span>
                            <span className="text-[10px] text-gray-500 truncate" title={errors.join(', ')}>
                              {errors[0]}
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
            <button
              onClick={onCancel}
              className="px-5 py-2 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={handleConfirmImport}
              className="flex items-center space-x-1.5 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-blue-100 cursor-pointer transform active:scale-98"
            >
              <CheckCircle2 className="h-4.5 w-4.5" />
              <span>Konfirmasi & Impor ({validatedStudents.length} Siswa)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

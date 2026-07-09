import React, { useState } from 'react';
import { Student, ValidationError, SchoolProfile } from '../types';
import { validateStudent } from '../validationEngine';
import Sman2Logo from './Sman2Logo';
import { 
  FileSpreadsheet, FileDown, CheckCircle2, AlertTriangle, 
  Edit3, Edit2, Check, RefreshCw, Printer, BookOpen,
  ShieldCheck, Sparkles
} from 'lucide-react';

interface ReportViewerProps {
  students: Student[];
  schoolProfile: SchoolProfile;
  resolutionNotes: Record<string, string>;
  onUpdateResolutionNotes: (errorId: string, notes: string) => void;
  onEditStudent: (student: Student) => void;
}

export default function ReportViewer({
  students,
  schoolProfile,
  resolutionNotes,
  onUpdateResolutionNotes,
  onEditStudent
}: ReportViewerProps) {
  const [subTab, setSubTab] = useState<'aktif' | 'terverifikasi'>('aktif');

  // Aggregate all errors on the fly across all students
  const allErrors: ValidationError[] = [];
  
  students.forEach(student => {
    const studentErrors = validateStudent(student);
    studentErrors.forEach(err => {
      // Inject current saved resolution notes
      allErrors.push({
        ...err,
        resolutionNotes: resolutionNotes[err.id] || ''
      });
    });
  });

  const criticalCount = allErrors.filter(e => e.severity === 'critical').length;
  const warningCount = allErrors.filter(e => e.severity === 'warning').length;

  const verifiedStudents = students.filter(student => {
    const studentErrors = validateStudent(student);
    return studentErrors.length === 0 || student.masalahTertangani;
  });

  const pureValidCount = students.filter(student => validateStudent(student).length === 0).length;
  const resolvedIssuesCount = students.filter(student => student.masalahTertangani).length;

  // EXPORT TO EXCEL HELPER
  const handleExportExcel = () => {
    const isAktif = subTab === 'aktif';
    const suffix = isAktif ? 'Kesalahan_Aktif' : 'Terverifikasi';
    const filename = `Laporan_${suffix}_Dapodik_${schoolProfile.npsn}_${new Date().toISOString().slice(0, 10)}.xls`;
    
    // Constructing a beautifully styled HTML file that Excel reads perfectly.
    const tableHeader = isAktif ? `
            <tr>
              <th style="width: 40px; background-color: #1e40af; color: #ffffff; font-weight: bold; font-size: 10pt; border: 1px solid #cbd5e1; padding: 8px;">No</th>
              <th style="background-color: #1e40af; color: #ffffff; font-weight: bold; font-size: 10pt; border: 1px solid #cbd5e1; padding: 8px;">Nama Siswa</th>
              <th style="background-color: #1e40af; color: #ffffff; font-weight: bold; font-size: 10pt; border: 1px solid #cbd5e1; padding: 8px;">NISN</th>
              <th style="background-color: #1e40af; color: #ffffff; font-weight: bold; font-size: 10pt; border: 1px solid #cbd5e1; padding: 8px;">Rombel</th>
              <th style="background-color: #1e40af; color: #ffffff; font-weight: bold; font-size: 10pt; border: 1px solid #cbd5e1; padding: 8px;">Elemen Data</th>
              <th style="background-color: #1e40af; color: #ffffff; font-weight: bold; font-size: 10pt; border: 1px solid #cbd5e1; padding: 8px;">Tingkat Kesalahan</th>
              <th style="background-color: #1e40af; color: #ffffff; font-weight: bold; font-size: 10pt; border: 1px solid #cbd5e1; padding: 8px;">Uraian Detail Kesalahan</th>
              <th style="background-color: #1e40af; color: #ffffff; font-weight: bold; font-size: 10pt; border: 1px solid #cbd5e1; padding: 8px;">Rekomendasi Solusi / Nilai Usulan</th>
              <th style="background-color: #1e40af; color: #ffffff; font-weight: bold; font-size: 10pt; border: 1px solid #cbd5e1; padding: 8px;">Catatan Tindak Lanjut Operator</th>
            </tr>
    ` : `
            <tr>
              <th style="width: 40px; background-color: #047857; color: #ffffff; font-weight: bold; font-size: 10pt; border: 1px solid #cbd5e1; padding: 8px;">No</th>
              <th style="background-color: #047857; color: #ffffff; font-weight: bold; font-size: 10pt; border: 1px solid #cbd5e1; padding: 8px;">Nama Siswa</th>
              <th style="background-color: #047857; color: #ffffff; font-weight: bold; font-size: 10pt; border: 1px solid #cbd5e1; padding: 8px;">NISN</th>
              <th style="background-color: #047857; color: #ffffff; font-weight: bold; font-size: 10pt; border: 1px solid #cbd5e1; padding: 8px;">NIK</th>
              <th style="background-color: #047857; color: #ffffff; font-weight: bold; font-size: 10pt; border: 1px solid #cbd5e1; padding: 8px;">Rombel</th>
              <th style="background-color: #047857; color: #ffffff; font-weight: bold; font-size: 10pt; border: 1px solid #cbd5e1; padding: 8px;">Status Audit</th>
              <th style="background-color: #047857; color: #ffffff; font-weight: bold; font-size: 10pt; border: 1px solid #cbd5e1; padding: 8px;">Keterangan Verifikasi / Masalah Teratasi</th>
            </tr>
    `;

    const tableRows = isAktif ? allErrors.map((err, idx) => `
              <tr>
                <td style="text-align: center; border: 1px solid #e2e8f0; padding: 8px; font-size: 9.5pt; vertical-align: top;">${idx + 1}</td>
                <td style="font-weight: bold; border: 1px solid #e2e8f0; padding: 8px; font-size: 9.5pt; vertical-align: top;">${err.studentName.toUpperCase()}</td>
                <td style="font-family: monospace; border: 1px solid #e2e8f0; padding: 8px; font-size: 9.5pt; vertical-align: top;">'${err.nisn}</td>
                <td style="border: 1px solid #e2e8f0; padding: 8px; font-size: 9.5pt; vertical-align: top;">${err.classGroup}</td>
                <td style="text-transform: uppercase; font-weight: bold; border: 1px solid #e2e8f0; padding: 8px; font-size: 9.5pt; vertical-align: top;">${err.field}</td>
                <td style="border: 1px solid #e2e8f0; padding: 8px; font-size: 9.5pt; vertical-align: top;" class="${err.severity === 'critical' ? 'severity-critical' : 'severity-warning'}">
                  ${err.severity === 'critical' ? 'KRITIS' : 'PERINGATAN'}
                </td>
                <td style="border: 1px solid #e2e8f0; padding: 8px; font-size: 9.5pt; vertical-align: top;">${err.message}</td>
                <td style="background-color: #f0fdf4; font-family: monospace; color: #15803d; border: 1px solid #e2e8f0; padding: 8px; font-size: 9.5pt; vertical-align: top;">${err.suggestedValue}</td>
                <td style="background-color: #fafafa; font-style: italic; border: 1px solid #e2e8f0; padding: 8px; font-size: 9.5pt; vertical-align: top;">${err.resolutionNotes || '-'}</td>
              </tr>
    `).join('') : verifiedStudents.map((student, idx) => {
      const hasErrors = validateStudent(student).length > 0;
      const statusText = !hasErrors ? '100% VALID' : 'TERTANGANI';
      const detailText = student.keteranganMasalah 
        ? `Laporan Mandiri: "${student.keteranganMasalah}" - Telah diselesaikan oleh operator`
        : 'Lolos audit otomatis tanpa kendala tertulis.';
      return `
              <tr>
                <td style="text-align: center; border: 1px solid #e2e8f0; padding: 8px; font-size: 9.5pt; vertical-align: top;">${idx + 1}</td>
                <td style="font-weight: bold; border: 1px solid #e2e8f0; padding: 8px; font-size: 9.5pt; vertical-align: top;">${student.nama.toUpperCase()}</td>
                <td style="font-family: monospace; border: 1px solid #e2e8f0; padding: 8px; font-size: 9.5pt; vertical-align: top;">'${student.nisn}</td>
                <td style="font-family: monospace; border: 1px solid #e2e8f0; padding: 8px; font-size: 9.5pt; vertical-align: top;">'${student.nik}</td>
                <td style="border: 1px solid #e2e8f0; padding: 8px; font-size: 9.5pt; vertical-align: top;">Tingkat ${student.tingkatKelas} - ${student.rombonganBelajar}</td>
                <td style="font-weight: bold; color: ${!hasErrors ? '#047857' : '#0f766e'}; background-color: ${!hasErrors ? '#ecfdf5' : '#f0fdfa'}; text-align: center; border: 1px solid #e2e8f0; padding: 8px; font-size: 9.5pt; vertical-align: top;">
                  ${statusText}
                </td>
                <td style="font-style: italic; border: 1px solid #e2e8f0; padding: 8px; font-size: 9.5pt; vertical-align: top;">${detailText}</td>
              </tr>
      `;
    }).join('');

    const colSpanVal = isAktif ? (schoolProfile.logoUrl ? 7 : 8) : (schoolProfile.logoUrl ? 5 : 6);
    const totalCols = isAktif ? 9 : 7;

    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
         <meta charset="utf-8" />
         <style>
           body { font-family: 'Segoe UI', Arial, sans-serif; }
           .header-title { font-size: 16pt; font-weight: bold; text-align: center; color: #1e3a8a; }
           .header-sub { font-size: 11pt; text-align: center; font-style: italic; color: #4b5563; }
           .profile-table { margin-bottom: 20px; border-collapse: collapse; }
           .profile-table td { padding: 4px; font-size: 10pt; }
           .data-table { border-collapse: collapse; width: 100%; margin-top: 15px; }
           .severity-critical { color: #b91c1c; font-weight: bold; background-color: #fef2f2; }
           .severity-warning { color: #b45309; font-weight: bold; background-color: #fffbeb; }
           .footer-section { margin-top: 40px; font-size: 10pt; }
           .signature-box { float: right; width: 250px; text-align: center; margin-top: 30px; }
         </style>
      </head>
      <body>
         <!-- KOP SEKOLAH -->
         <table>
           <tr>
             ${schoolProfile.logoUrl ? `
               <td rowspan="3" style="width: 80px; text-align: center; vertical-align: middle;">
                 <img src="${schoolProfile.logoUrl}" width="70" height="70" style="object-fit: contain;" />
               </td>
             ` : ''}
             <td colspan="${colSpanVal}" class="header-title">${schoolProfile.namaSekolah.toUpperCase()}</td>
           </tr>
           <tr>
             <td colspan="${colSpanVal}" class="header-sub">Alamat: ${schoolProfile.alamat}, ${schoolProfile.desaKelurahan}, Kec. ${schoolProfile.kecamatan}, ${schoolProfile.kabupatenKota}, Prov. ${schoolProfile.provinsi}</td>
           </tr>
           <tr>
             <td colspan="${colSpanVal}" class="header-sub">NPSN: ${schoolProfile.npsn} | Email: ${schoolProfile.emailSekolah} | Status: ${schoolProfile.status} (Akreditasi ${schoolProfile.akreditasi})</td>
           </tr>
           <tr><td colspan="${totalCols}"></td></tr>
           <tr>
             <td colspan="${totalCols}" style="font-size: 14pt; font-weight: bold; text-align: center; color: #000;">
               LAPORAN AUDIT &amp; REKAPITULASI DATA PESERTA DIDIK
             </td>
           </tr>
           <tr>
             <td colspan="${totalCols}" style="font-size: 10pt; text-align: center; color: #666;">
               Status Cetak: ${isAktif ? 'KESALAHAN DATA AKTIF' : 'DATA VALID &amp; TERVERIFIKASI'} | Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}
             </td>
           </tr>
         </table>

         <br/>

         <!-- DATA TABLE -->
         <table class="data-table">
           <thead>
             ${tableHeader}
           </thead>
           <tbody>
             ${tableRows}
           </tbody>
         </table>

         <br/><br/>

         <!-- SIGNATURES -->
         <table style="width: 100%; margin-top: 40px;">
           <tr>
             <td colspan="${Math.floor(totalCols / 2)}" style="text-align: center; font-size: 10pt;">
               Mengetahui,<br/>
               Kepala Sekolah<br/><br/><br/><br/>
               <strong><u>${schoolProfile.namaKepalaSekolah}</u></strong><br/>
               NIP. ${schoolProfile.nipKepalaSekolah || '-'}
             </td>
             <td colspan="${totalCols - Math.floor(totalCols / 2)}" style="text-align: center; font-size: 10pt;">
               ${schoolProfile.kabupatenKota}, ${new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}<br/>
               Operator Dapodik,<br/><br/><br/><br/>
               <strong><u>${schoolProfile.namaOperator}</u></strong><br/>
               NIP. ${schoolProfile.nipOperator || '-'}
             </td>
           </tr>
         </table>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // EXPORT TO WORD HELPER
  const handleExportWord = () => {
    const isAktif = subTab === 'aktif';
    const suffix = isAktif ? 'Kesalahan_Aktif' : 'Terverifikasi';
    const filename = `Laporan_${suffix}_Dapodik_${schoolProfile.npsn}_${new Date().toISOString().slice(0, 10)}.doc`;
    
    const tableHeader = isAktif ? `
            <tr>
              <th style="width: 5%; background-color: #f3f4f6; border: 1px solid #000000; padding: 6px; font-weight: bold; text-align: center;">No</th>
              <th style="width: 20%; background-color: #f3f4f6; border: 1px solid #000000; padding: 6px; font-weight: bold; text-align: center;">Nama Lengkap Siswa</th>
              <th style="width: 10%; background-color: #f3f4f6; border: 1px solid #000000; padding: 6px; font-weight: bold; text-align: center;">NISN</th>
              <th style="width: 8%; background-color: #f3f4f6; border: 1px solid #000000; padding: 6px; font-weight: bold; text-align: center;">Rombel</th>
              <th style="width: 12%; background-color: #f3f4f6; border: 1px solid #000000; padding: 6px; font-weight: bold; text-align: center;">Elemen Data</th>
              <th style="width: 25%; background-color: #f3f4f6; border: 1px solid #000000; padding: 6px; font-weight: bold; text-align: center;">Uraian Detail Kesalahan</th>
              <th style="width: 20%; background-color: #f3f4f6; border: 1px solid #000000; padding: 6px; font-weight: bold; text-align: center;">Catatan Tindak Lanjut Operator</th>
            </tr>
    ` : `
            <tr>
              <th style="width: 5%; background-color: #f3f4f6; border: 1px solid #000000; padding: 6px; font-weight: bold; text-align: center;">No</th>
              <th style="width: 25%; background-color: #f3f4f6; border: 1px solid #000000; padding: 6px; font-weight: bold; text-align: center;">Nama Lengkap Siswa</th>
              <th style="width: 12%; background-color: #f3f4f6; border: 1px solid #000000; padding: 6px; font-weight: bold; text-align: center;">NISN</th>
              <th style="width: 13%; background-color: #f3f4f6; border: 1px solid #000000; padding: 6px; font-weight: bold; text-align: center;">NIK</th>
              <th style="width: 10%; background-color: #f3f4f6; border: 1px solid #000000; padding: 6px; font-weight: bold; text-align: center;">Rombel</th>
              <th style="width: 15%; background-color: #f3f4f6; border: 1px solid #000000; padding: 6px; font-weight: bold; text-align: center;">Status Audit</th>
              <th style="width: 20%; background-color: #f3f4f6; border: 1px solid #000000; padding: 6px; font-weight: bold; text-align: center;">Keterangan Verifikasi / Masalah Teratasi</th>
            </tr>
    `;

    const tableRows = isAktif ? allErrors.map((err, idx) => `
              <tr>
                <td style="text-align: center; border: 1px solid #000000; padding: 6px; vertical-align: top;">${idx + 1}</td>
                <td style="border: 1px solid #000000; padding: 6px; vertical-align: top;"><b>${err.studentName.toUpperCase()}</b></td>
                <td style="text-align: center; border: 1px solid #000000; padding: 6px; vertical-align: top;">${err.nisn}</td>
                <td style="text-align: center; border: 1px solid #000000; padding: 6px; vertical-align: top;">${err.classGroup}</td>
                <td style="text-transform: uppercase; font-weight: bold; text-align: center; border: 1px solid #000000; padding: 6px; vertical-align: top;">${err.field}</td>
                <td style="border: 1px solid #000000; padding: 6px; vertical-align: top;">
                  <b>[${err.severity === 'critical' ? 'KRITIS' : 'PERINGATAN'}]</b>: ${err.message}<br/>
                  <i>Saran Koreksi: <b>${err.suggestedValue}</b></i>
                </td>
                <td style="border: 1px solid #000000; padding: 6px; vertical-align: top;">${err.resolutionNotes || '<i>Belum ditindaklanjuti</i>'}</td>
              </tr>
    `).join('') : verifiedStudents.map((student, idx) => {
      const hasErrors = validateStudent(student).length > 0;
      const statusText = !hasErrors ? '100% VALID' : 'TERTANGANI';
      const detailText = student.keteranganMasalah 
        ? `Laporan Mandiri: "${student.keteranganMasalah}" - Telah diselesaikan oleh operator`
        : 'Lolos audit otomatis tanpa kendala tertulis.';
      return `
              <tr>
                <td style="text-align: center; border: 1px solid #000000; padding: 6px; vertical-align: top;">${idx + 1}</td>
                <td style="border: 1px solid #000000; padding: 6px; vertical-align: top;"><b>${student.nama.toUpperCase()}</b></td>
                <td style="text-align: center; border: 1px solid #000000; padding: 6px; vertical-align: top;">${student.nisn}</td>
                <td style="text-align: center; border: 1px solid #000000; padding: 6px; vertical-align: top;">${student.nik}</td>
                <td style="text-align: center; border: 1px solid #000000; padding: 6px; vertical-align: top;">Tingkat ${student.tingkatKelas} - ${student.rombonganBelajar}</td>
                <td style="font-weight: bold; text-align: center; color: ${!hasErrors ? '#047857' : '#0f766e'}; border: 1px solid #000000; padding: 6px; vertical-align: top;">
                  ${statusText}
                </td>
                <td style="border: 1px solid #000000; padding: 6px; vertical-align: top;">${detailText}</td>
              </tr>
      `;
    }).join('');

    const titleText = isAktif ? 'LAPORAN REKAPITULASI KESALAHAN DATA PESERTA DIDIK DAPODIK' : 'LAPORAN REKAPITULASI DATA PESERTA DIDIK TERVERIFIKASI DAPODIK';
    const subTitleIntro = isAktif 
      ? 'Berikut dilampirkan daftar perincian kesalahan elemen data peserta didik yang terdeteksi tidak valid berdasarkan aturan penulisan aplikasi Dapodik dan Dukcapil kependudukan luring:'
      : 'Berikut dilampirkan daftar data peserta didik yang telah dinyatakan valid dan terverifikasi di dalam database aplikasi Dapodik:';

    // Constructing a structured HTML document that MS Word opens as a beautifully formatted file
    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8" />
        <title>Laporan Penanganan</title>
        <style>
          @page {
            size: 11in 8.5in; /* Landscape orientation */
            margin: 1in;
          }
          body { font-family: 'Times New Roman', Times, serif; line-height: 1.3; }
          .kop-surat { text-align: center; border-bottom: 3px double #000; padding-bottom: 5px; margin-bottom: 20px; }
          .kop-title { font-size: 14pt; font-weight: bold; }
          .kop-sub { font-size: 10pt; }
          .doc-title { text-align: center; font-size: 12pt; font-weight: bold; margin-bottom: 5px; margin-top: 15px; text-decoration: underline; }
          .doc-subtitle { text-align: center; font-size: 10pt; margin-bottom: 25px; }
          .data-table { border-collapse: collapse; width: 100%; font-size: 9pt; }
          .data-table th { background-color: #f3f4f6; border: 1px solid #000000; padding: 6px; font-weight: bold; text-align: center; }
          .data-table td { border: 1px solid #000000; padding: 6px; vertical-align: top; }
          .badge-critical { font-weight: bold; color: #b91c1c; }
          .badge-warning { font-weight: bold; color: #b45309; }
          .signature-table { width: 100%; margin-top: 40px; font-size: 10pt; }
        </style>
      </head>
      <body>
        <!-- KOP SURAT SEKOLAH -->
        <table style="width: 100%; border-collapse: collapse; border-bottom: 3px double #000000; margin-bottom: 20px; padding-bottom: 8px;">
          <tr>
            ${schoolProfile.logoUrl ? `
              <td style="width: 80px; text-align: center; vertical-align: middle; padding-right: 15px;">
                <img src="${schoolProfile.logoUrl}" width="70" height="70" style="object-fit: contain;" />
              </td>
            ` : ''}
            <td style="text-align: center; vertical-align: middle;">
              <div style="font-size: 11pt; font-weight: bold; font-family: 'Times New Roman', Times, serif;">PEMERINTAH PROVINSI</div>
              <div style="font-size: 15pt; font-weight: bold; font-family: 'Times New Roman', Times, serif; text-transform: uppercase;">${schoolProfile.namaSekolah}</div>
              <div style="font-size: 9.5pt; font-family: 'Times New Roman', Times, serif;">
                NPSN: ${schoolProfile.npsn} | Akreditasi: ${schoolProfile.akreditasi} | Status: ${schoolProfile.status}<br/>
                Alamat: ${schoolProfile.alamat}, Kec. ${schoolProfile.kecamatan}, ${schoolProfile.kabupatenKota}, Prov. ${schoolProfile.provinsi}<br/>
                Email Resmi: ${schoolProfile.emailSekolah}
              </div>
            </td>
          </tr>
        </table>

        <!-- JUDUL DOKUMEN -->
        <div class="doc-title">${titleText}</div>
        <div class="doc-subtitle">Tanggal Audit: ${new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</div>

        <p style="font-size: 10pt;">${subTitleIntro}</p>

        <!-- TABLE -->
        <table class="data-table">
          <thead>
            ${tableHeader}
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>

        <!-- TANDA TANGAN -->
        <table class="signature-table">
          <tr>
            <td style="width: 50%; text-align: center;">
              Mengetahui,<br/>
              Kepala Sekolah<br/><br/><br/><br/>
              <b><u>${schoolProfile.namaKepalaSekolah}</u></b><br/>
              NIP. ${schoolProfile.nipKepalaSekolah || '-'}
            </td>
            <td style="width: 50%; text-align: center;">
              ${schoolProfile.kabupatenKota}, ${new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}<br/>
              Operator Dapodik,<br/><br/><br/><br/>
              <b><u>${schoolProfile.namaOperator}</u></b><br/>
              NIP. ${schoolProfile.nipOperator || '-'}
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/msword;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" id="report-viewer-container">
      {/* Top Banner Stats */}
      <div className="p-6 bg-slate-900 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-center space-x-4">
          {schoolProfile.logoUrl ? (
            <div className="h-14 w-14 bg-white/10 rounded-xl p-1.5 flex items-center justify-center flex-shrink-0 border border-white/10">
              <img 
                src={schoolProfile.logoUrl} 
                alt="Logo Sekolah" 
                className="max-h-full max-w-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <div className="h-14 w-14 bg-white rounded-xl p-0.5 flex items-center justify-center flex-shrink-0">
              <Sman2Logo size="100%" />
            </div>
          )}
          <div className="space-y-1">
            <h2 className="text-lg font-bold flex items-center space-x-2">
              <span>Pusat Rekap Laporan Penanganan (DapoAudit)</span>
            </h2>
            <p className="text-slate-400 text-xs">
              Format laporan siap cetak & unduh dengan Kop Sekolah: <b className="text-white">{schoolProfile.namaSekolah}</b>
            </p>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-export-word"
            onClick={handleExportWord}
            disabled={subTab === 'aktif' ? allErrors.length === 0 : verifiedStudents.length === 0}
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-100 px-4 py-2 rounded-xl text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
            title={subTab === 'aktif' ? "Unduh laporan kesalahan aktif dalam format Microsoft Word" : "Unduh laporan peserta didik terverifikasi dalam format Microsoft Word"}
          >
            <FileDown className="h-4 w-4 text-blue-400" />
            <span>Unduh Word (DOC)</span>
          </button>
          
          <button
            id="btn-export-excel"
            onClick={handleExportExcel}
            disabled={subTab === 'aktif' ? allErrors.length === 0 : verifiedStudents.length === 0}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-md shadow-emerald-900/10 transition-all cursor-pointer"
            title={subTab === 'aktif' ? "Unduh laporan kesalahan aktif dalam format Microsoft Excel" : "Unduh laporan peserta didik terverifikasi dalam format Microsoft Excel"}
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Unduh Excel (XLS)</span>
          </button>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex border-b border-gray-100 bg-slate-50">
        <button
          type="button"
          onClick={() => setSubTab('aktif')}
          className={`flex items-center space-x-2 px-6 py-3.5 text-xs transition-all border-b-2 font-black uppercase tracking-wider cursor-pointer ${
            subTab === 'aktif'
              ? 'border-rose-500 text-rose-600 bg-white'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
          }`}
        >
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <span>Laporan Kesalahan Aktif ({allErrors.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('terverifikasi')}
          className={`flex items-center space-x-2 px-6 py-3.5 text-xs transition-all border-b-2 font-black uppercase tracking-wider cursor-pointer ${
            subTab === 'terverifikasi'
              ? 'border-emerald-500 text-emerald-600 bg-white'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
          }`}
        >
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Laporan Terverifikasi ({verifiedStudents.length})</span>
        </button>
      </div>

      {subTab === 'aktif' ? (
        <>
          {/* Summary Count Grid (Aktif) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 border-b border-gray-100 text-center bg-gray-50/50">
            <div className="p-4">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Kesalahan Aktif</span>
              <span className="text-2xl font-black text-gray-800 mt-1 block">{allErrors.length}</span>
            </div>
            <div className="p-4">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Tingkat Kritis (Fatal)</span>
              <span className="text-2xl font-black text-red-600 mt-1 block">{criticalCount}</span>
            </div>
            <div className="p-4">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Tingkat Peringatan</span>
              <span className="text-2xl font-black text-amber-500 mt-1 block">{warningCount}</span>
            </div>
          </div>

          {/* Laporan Kesalahan Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-3 px-4 text-center">No</th>
                  <th className="py-3 px-4">Nama Peserta Didik</th>
                  <th className="py-3 px-4">Rombel</th>
                  <th className="py-3 px-4 text-center">Elemen</th>
                  <th className="py-3 px-4 text-center">Tingkat</th>
                  <th className="py-3 px-4">Uraian Kesalahan &amp; Solusi</th>
                  <th className="py-3 px-4">Catatan Penyelesaian Laporan (Bisa Diedit Langsung)</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {allErrors.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center">
                      <div className="max-w-md mx-auto flex flex-col items-center">
                        <div className="bg-emerald-50 text-emerald-600 p-3.5 rounded-full mb-3">
                          <CheckCircle2 className="h-7 w-7" />
                        </div>
                        <p className="text-gray-800 font-bold text-sm">Semua Siswa Lolos Audit Dapodik!</p>
                        <p className="text-gray-400 text-xs mt-1">
                          Hebat! Database Anda 100% layak sinkronisasi tanpa ada kesalahan kualifikasi kritis yang terdeteksi.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  allErrors.map((err, idx) => {
                    const s = students.find(x => x.id === err.studentId);
                    return (
                      <tr key={err.id} className="hover:bg-gray-50/50 transition-all align-top">
                        <td className="py-3 px-4 text-center text-gray-400 font-mono font-bold">
                          {idx + 1}
                        </td>
                        
                        <td className="py-3 px-4">
                          <div className="font-bold text-gray-800 uppercase">{err.studentName}</div>
                          <div className="text-[10px] text-gray-400 font-mono mt-0.5">NISN: {err.nisn}</div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-[10px] font-semibold font-mono">
                            {err.classGroup}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span className="font-bold text-[10px] uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                            {err.field}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                            err.severity === 'critical' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}>
                            {err.severity === 'critical' ? 'KRITIS' : 'WARNING'}
                          </span>
                        </td>

                        <td className="py-3 px-4 max-w-xs space-y-1">
                          <div className="text-gray-600 leading-relaxed font-medium">
                            {err.message}
                          </div>
                          <div className="text-[10px] bg-emerald-50 text-emerald-800 p-1 rounded font-mono border border-emerald-100">
                            <span className="font-bold">Usulan perbaikan:</span> {err.suggestedValue}
                          </div>
                        </td>

                        {/* Editable column for operator's resolution notes */}
                        <td className="py-3 px-4 min-w-[200px]">
                          <div className="relative group/edit">
                            <textarea
                              rows={2}
                              value={err.resolutionNotes}
                              onChange={(e) => onUpdateResolutionNotes(err.id, e.target.value)}
                              placeholder="Ketik catatan di sini... (contoh: KK sedang diurus wali murid)"
                              className="w-full text-xs px-2 py-1.5 bg-gray-50/50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-gray-700 placeholder:text-gray-300"
                            />
                          </div>
                        </td>

                        <td className="py-3 px-4 text-right">
                          {s && (
                            <button
                              type="button"
                              onClick={() => onEditStudent(s)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer inline-flex items-center space-x-1"
                              title="Perbaiki biodata siswa secara langsung"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                              <span className="text-[10px] font-bold">Ubah</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          {/* Summary Count Grid (Terverifikasi) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 border-b border-gray-100 text-center bg-gray-50/50">
            <div className="p-4">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Terverifikasi</span>
              <span className="text-2xl font-black text-emerald-600 mt-1 block">{verifiedStudents.length}</span>
            </div>
            <div className="p-4">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Siswa 100% Valid &amp; Lolos Audit</span>
              <span className="text-2xl font-black text-blue-600 mt-1 block">{pureValidCount}</span>
            </div>
            <div className="p-4">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Laporan Mandiri Selesai</span>
              <span className="text-2xl font-black text-teal-600 mt-1 block">{resolvedIssuesCount}</span>
            </div>
          </div>

          {/* Laporan Terverifikasi Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-3 px-4 text-center">No</th>
                  <th className="py-3 px-4">Nama Peserta Didik</th>
                  <th className="py-3 px-4">Rombel</th>
                  <th className="py-3 px-4">NISN / NIK</th>
                  <th className="py-3 px-4 text-center">Status Audit</th>
                  <th className="py-3 px-4">Keterangan Verifikasi / Masalah Teratasi</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {verifiedStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="max-w-md mx-auto flex flex-col items-center">
                        <div className="bg-amber-50 text-amber-500 p-3.5 rounded-full mb-3">
                          <AlertTriangle className="h-7 w-7" />
                        </div>
                        <p className="text-gray-800 font-bold text-sm">Belum Ada Siswa Terverifikasi</p>
                        <p className="text-gray-400 text-xs mt-1">
                          Harap audit dan perbaiki kesalahan data peserta didik terlebih dahulu agar mereka masuk ke daftar terverifikasi.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  verifiedStudents.map((student, idx) => {
                    const hasErrors = validateStudent(student).length > 0;
                    return (
                      <tr key={student.id} className="hover:bg-gray-50/50 transition-all align-middle">
                        <td className="py-4 px-4 text-center text-gray-400 font-mono font-bold">
                          {idx + 1}
                        </td>
                        
                        <td className="py-4 px-4">
                          <div className="font-bold text-gray-800 uppercase">{student.nama}</div>
                          <div className="text-[10px] text-gray-400 font-mono mt-0.5">ID: {student.id}</div>
                        </td>

                        <td className="py-4 px-4">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-semibold font-mono">
                            Tingkat {student.tingkatKelas} - {student.rombonganBelajar}
                          </span>
                        </td>

                        <td className="py-4 px-4 font-mono text-[11px] text-gray-600">
                          <div>NISN: {student.nisn}</div>
                          <div>NIK: {student.nik}</div>
                        </td>

                        <td className="py-4 px-4 text-center">
                          {!hasErrors ? (
                            <span className="text-[10px] font-extrabold px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full inline-flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>100% VALID</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-extrabold px-2.5 py-1 bg-teal-50 text-teal-700 border border-teal-100 rounded-full inline-flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>TERTANGANI</span>
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-4 max-w-xs">
                          {student.keteranganMasalah ? (
                            <div className="space-y-1">
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Laporan Mandiri:</p>
                              <p className="text-gray-700 italic font-medium bg-slate-50 p-2 rounded-lg border border-slate-100">
                                "{student.keteranganMasalah}"
                              </p>
                              <p className="text-[10.5px] text-emerald-600 font-bold flex items-center gap-1">
                                <Sparkles className="h-3 w-3" />
                                <span>Telah diselesaikan oleh operator</span>
                              </p>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic text-xs">Lolos audit otomatis tanpa kendala tertulis.</span>
                          )}
                        </td>

                        <td className="py-4 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => onEditStudent(student)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer inline-flex items-center space-x-1"
                            title="Lihat detail biodata"
                          >
                            <BookOpen className="h-3.5 w-3.5" />
                            <span className="text-[10px] font-bold">Detail</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Printing & Action Footer */}
      <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500 gap-2">
        <p>
          Catatan tindak lanjut yang diinput akan otomatis terintegrasi dan tercetak pada berkas pengunduhan Word/Excel.
        </p>
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-gray-700">DapoAudit Engine v2.0</span>
        </div>
      </div>
    </div>
  );
}

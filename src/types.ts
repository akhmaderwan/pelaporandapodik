export interface SchoolProfile {
  namaSekolah: string;
  npsn: string;
  status: 'Negeri' | 'Swasta';
  akreditasi: 'A' | 'B' | 'C' | 'Belum Terakreditasi';
  alamat: string;
  desaKelurahan: string;
  kecamatan: string;
  kabupatenKota: string;
  provinsi: string;
  namaKepalaSekolah: string;
  nipKepalaSekolah: string;
  namaOperator: string;
  nipOperator: string;
  emailSekolah: string;
  logoUrl?: string;
  runningText?: string;
}

export interface Student {
  id: string;
  nama: string;
  nisn: string;
  nik: string;
  tempatLahir: string;
  tanggalLahir: string; // YYYY-MM-DD
  jenisKelamin: 'L' | 'P';
  tingkatKelas: string;
  rombonganBelajar: string;
  namaIbuKandung: string;
  nikIbuKandung: string;
  namaAyah: string;
  alamatSiswa: string;
  statusSiswa: 'Aktif' | 'Mutasi' | 'Lulus' | 'Keluar';
  // Additional correction fields
  anakKe?: string;
  noHp?: string;
  tanggalLahirAyah?: string;
  pekerjaanAyah?: string;
  tanggalLahirIbu?: string;
  pekerjaanIbu?: string;
  keteranganMasalah?: string;
  masalahTertangani?: boolean;
}

export interface ValidationError {
  id: string; // unique identifier for the error itself
  studentId: string;
  studentName: string;
  nisn: string;
  classGroup: string;
  field: 'nik' | 'nisn' | 'nama' | 'tanggalLahir' | 'namaIbuKandung' | 'nikIbuKandung' | 'anakKe' | 'noHp' | 'tanggalLahirIbu' | 'pekerjaanIbu' | 'tanggalLahirAyah' | 'pekerjaanAyah' | 'lainnya';
  severity: 'critical' | 'warning';
  message: string;
  currentValue: string;
  suggestedValue: string;
  isResolved: boolean;
  resolutionNotes: string; // editable by the user
}

import { SchoolProfile, Student } from './types';

export const DEFAULT_SCHOOL_PROFILE: SchoolProfile = {
  namaSekolah: "SMA Negeri 2 Kota Pasuruan",
  npsn: "20534382",
  status: "Negeri",
  akreditasi: "A",
  alamat: "Jl. Panglima Sudirman No. 162, Purworejo",
  desaKelurahan: "Purworejo",
  kecamatan: "Purworejo",
  kabupatenKota: "Kota Pasuruan",
  provinsi: "Jawa Timur",
  namaKepalaSekolah: "Drs. H. Ahmad Erwan, M.Pd.",
  nipKepalaSekolah: "197405122002121003",
  namaOperator: "Akhmad Erwan",
  nipOperator: "198902142018011002",
  emailSekolah: "sman2pasuruan@sch.id",
  logoUrl: "",
  runningText: "PENGUMUMAN: Harap semua peserta didik SMA Negeri 2 Kota Pasuruan segera memeriksa kelayakan data masing-masing menggunakan fitur perbaikan mandiri ini. Sinkronisasi Dapodik terakhir dilakukan tanggal 30 Juni 2026.",
  backgroundUrl: "",
  useCustomBackground: false
};

export const DEFAULT_STUDENTS: Student[] = [
  {
    id: "std-001",
    nama: "BUDI SANTOSO",
    nisn: "0082345678",
    nik: "3174011205080001",
    tempatLahir: "Jakarta",
    tanggalLahir: "2008-05-12",
    jenisKelamin: "L",
    tingkatKelas: "10",
    rombonganBelajar: "X IPA 1",
    namaIbuKandung: "SITI AMINAH",
    nikIbuKandung: "3174015509750002",
    namaAyah: "HADI SANTOSO",
    alamatSiswa: "Jl. Mawar No. 12, Kebayoran Baru",
    statusSiswa: "Aktif"
  },
  {
    id: "std-002",
    nama: "ade kurniawan", // Error: Huruf kecil (harus KAPITAL)
    nisn: "007123456", // Error: Kurang dari 10 digit (9 digit)
    nik: "3174012010070002",
    tempatLahir: "Bandung",
    tanggalLahir: "2007-10-20",
    jenisKelamin: "L",
    tingkatKelas: "11",
    rombonganBelajar: "XI IPA 2",
    namaIbuKandung: "Ibu Kartini", // Error: Mengandung kata "Ibu" & huruf kecil
    nikIbuKandung: "3174026211780001",
    namaAyah: "SUPRIADI KURNIAWAN",
    alamatSiswa: "Jl. Melati Raya No. 4, Cilandak",
    statusSiswa: "Aktif",
    keteranganMasalah: "Nama lengkap saya tertulis dengan huruf kecil semua, dan NISN saya kurang satu digit. Mohon perbaikan sesuai ijazah SMP."
  },
  {
    id: "std-003",
    nama: "RINA AMALIA",
    nisn: "0089876543",
    nik: "317402550808001", // Error: Kurang dari 16 digit (15 digit)
    tempatLahir: "Surabaya",
    tanggalLahir: "2008-08-15",
    jenisKelamin: "P",
    tingkatKelas: "10",
    rombonganBelajar: "X IPS 1",
    namaIbuKandung: "ENDANG SULASTRI",
    nikIbuKandung: "", // Error: NIK Ibu Kosong
    namaAyah: "DJOKO AMIN",
    alamatSiswa: "Jl. Dahlia Blok B3 No. 9, Gandaria",
    statusSiswa: "Aktif",
    keteranganMasalah: "NIK saya kurang 1 angka di akhir (tertulis 15 digit), dan NIK Ibu Kandung saya masih kosong karena saat pendaftaran KK baru belum terbit."
  },
  {
    id: "std-004",
    nama: "Michael & Jackson", // Error: Karakter khusus yang dilarang di Dapodik (&)
    nisn: "0067654321",
    nik: "3174011503900003", // NIK valid secara format tapi...
    tempatLahir: "Jakarta",
    tanggalLahir: "1990-03-15", // Error: Lahir tahun 1990 (Usia 36 tahun terlalu tua untuk SMA tingkat 12)
    jenisKelamin: "L",
    tingkatKelas: "12",
    rombonganBelajar: "XII IPA 1",
    namaIbuKandung: "HELEN JACKSON",
    nikIbuKandung: "3174015010650005",
    namaAyah: "JOHN JACKSON",
    alamatSiswa: "Apartemen Kemang Pratama Tower B",
    statusSiswa: "Aktif"
  },
  {
    id: "std-005",
    nama: "SITI RAHMA",
    nisn: "0078881112",
    nik: "3174034201070005",
    tempatLahir: "Medan",
    tanggalLahir: "2007-01-02",
    jenisKelamin: "P",
    tingkatKelas: "11",
    rombonganBelajar: "XI IPS 3",
    namaIbuKandung: "FATIMAH AHZAHRA",
    nikIbuKandung: "31740348087700", // Error: NIK Ibu kurang digit (14 digit)
    namaAyah: "SYAHRIAL",
    alamatSiswa: "Jl. Anggrek Hitam No. 22",
    statusSiswa: "Aktif"
  },
  {
    id: "std-006",
    nama: "JOKO SUSILO",
    nisn: "0191212123",
    nik: "3174012212190004",
    tempatLahir: "Jakarta",
    tanggalLahir: "2019-12-05", // Error: Usia 7 tahun terdaftar di SMA (terlalu muda)
    jenisKelamin: "L",
    tingkatKelas: "10",
    rombonganBelajar: "X IPA 2",
    namaIbuKandung: "SUPRIATIN",
    nikIbuKandung: "3174014210850003",
    namaAyah: "AHMAD SUSILO",
    alamatSiswa: "Jl. Kamboja No. 5, Kebayoran Baru",
    statusSiswa: "Aktif"
  },
  {
    id: "std-007",
    nama: "FARHAN BAHARUDIN",
    nisn: "0083214567",
    nik: "3275011411080002",
    tempatLahir: "Bekasi",
    tanggalLahir: "2008-11-14",
    jenisKelamin: "L",
    tingkatKelas: "10",
    rombonganBelajar: "X IPA 1",
    namaIbuKandung: "HALIMAH",
    nikIbuKandung: "3275014406820001",
    namaAyah: "BAHARUDIN",
    alamatSiswa: "Perumahan Bekasi Indah Blok C/12",
    statusSiswa: "Aktif"
  },
  {
    id: "std-008",
    nama: "dewi lestari", // Error: Tidak kapital
    nisn: "007112233O", // Error: Mengandung karakter 'O' (huruf) bukan '0' (angka) di akhir
    nik: "317401451207A001", // Error: Mengandung huruf 'A' di tengah NIK
    tempatLahir: "Jakarta",
    tanggalLahir: "2007-12-05",
    jenisKelamin: "P",
    tingkatKelas: "11",
    rombonganBelajar: "XI IPA 1",
    namaIbuKandung: "lestari indah", // Error: Tidak kapital
    nikIbuKandung: "3174014512750002",
    namaAyah: "PURNOMO LESTARI",
    alamatSiswa: "Jl. Tebet Barat No. 88",
    statusSiswa: "Aktif"
  },
  {
    id: "std-009",
    nama: "ANDI WIJAYA",
    nisn: "0064433221",
    nik: "3174020303060001",
    tempatLahir: "Yogyakarta",
    tanggalLahir: "2006-03-03",
    jenisKelamin: "L",
    tingkatKelas: "12",
    rombonganBelajar: "XII IPS 2",
    namaIbuKandung: "SRI WAHYUNI",
    nikIbuKandung: "3174024304720003",
    namaAyah: "WIJAYA ATMAJA",
    alamatSiswa: "Jl. Pancoran Timur No. 11",
    statusSiswa: "Aktif"
  },
  {
    id: "std-010",
    nama: "RAHMAT HIDAYAT",
    nisn: "0075566778",
    nik: "3174011810070008",
    tempatLahir: "Semarang",
    tanggalLahir: "2027-01-01", // Error: Tanggal lahir di masa depan (tahun 2027)
    jenisKelamin: "L",
    tingkatKelas: "11",
    rombonganBelajar: "XI IPS 1",
    namaIbuKandung: "NUR HIDAYAH",
    nikIbuKandung: "3174015809790001",
    namaAyah: "BUDI HIDAYAT",
    alamatSiswa: "Jl. Hang Lekir No. 3A",
    statusSiswa: "Aktif"
  }
];

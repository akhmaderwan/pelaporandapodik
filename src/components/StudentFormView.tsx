import React, { useState, useEffect } from 'react';
import { Student } from '../types';
import { User, Shield, CreditCard, Calendar, Users, MapPin, Save, ArrowLeft, Heart } from 'lucide-react';

interface StudentFormViewProps {
  student?: Student; // If provided, we are editing. If undefined, we are adding.
  onSave: (data: Student) => void;
  onCancel: () => void;
}

export default function StudentFormView({ student, onSave, onCancel }: StudentFormViewProps) {
  const isEditing = !!student;
  const [formData, setFormData] = useState<Student>({
    id: student?.id || `std-${Date.now()}`,
    nama: student?.nama || '',
    nisn: student?.nisn || '',
    nik: student?.nik || '',
    tempatLahir: student?.tempatLahir || '',
    tanggalLahir: student?.tanggalLahir || '',
    jenisKelamin: student?.jenisKelamin || 'L',
    tingkatKelas: student?.tingkatKelas || '10',
    rombonganBelajar: student?.rombonganBelajar || '',
    namaIbuKandung: student?.namaIbuKandung || '',
    nikIbuKandung: student?.nikIbuKandung || '',
    namaAyah: student?.namaAyah || '',
    alamatSiswa: student?.alamatSiswa || '',
    statusSiswa: student?.statusSiswa || 'Aktif',
    anakKe: student?.anakKe || '',
    noHp: student?.noHp || '',
    tanggalLahirAyah: student?.tanggalLahirAyah || '',
    pekerjaanAyah: student?.pekerjaanAyah || '',
    tanggalLahirIbu: student?.tanggalLahirIbu || '',
    pekerjaanIbu: student?.pekerjaanIbu || '',
    keteranganMasalah: student?.keteranganMasalah || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpperChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value.toUpperCase(),
    }));
  };

  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Hanya perbolehkan angka
    const cleanVal = value.replace(/[^0-9oO]/g, ''); // Biarkan O masuk dulu nanti divalidasi
    setFormData((prev) => ({
      ...prev,
      [name]: cleanVal,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" id="student-form-container">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700 transition-all cursor-pointer"
            title="Kembali"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-bold text-gray-900">
            {isEditing ? 'Ubah Profil Peserta Didik' : 'Tambah Peserta Didik Baru'}
          </h2>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full">
          {isEditing ? 'Mode Edit' : 'Perekaman Baru'}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* SECTION 1: IDENTITAS DIRI */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center space-x-2">
            <User className="h-4 w-4 text-blue-500" />
            <span>Identitas Pribadi Siswa</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="nama">
                Nama Lengkap Siswa <span className="text-red-500">*</span>
              </label>
              <input
                id="nama"
                type="text"
                name="nama"
                required
                value={formData.nama}
                onChange={handleUpperChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-transparent transition-all uppercase placeholder:normal-case font-medium"
                placeholder="CONTOH: BUDI SANTOSO (Gunakan Huruf Kapital)"
              />
              <p className="text-[11px] text-gray-400 mt-0.5">
                Gunakan HURUF KAPITAL sesuai akta kelahiran. Hindari karakter khusus dilarang.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="nisn">
                NISN (10 Digit) <span className="text-red-500">*</span>
              </label>
              <input
                id="nisn"
                type="text"
                name="nisn"
                required
                maxLength={10}
                value={formData.nisn}
                onChange={handleNumericChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-transparent transition-all font-mono"
                placeholder="Contoh: 0081234567"
              />
              <p className="text-[11px] text-gray-400 mt-0.5">
                Nomor Induk Siswa Nasional, harus tepat 10 digit angka.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="nik">
                NIK Siswa (16 Digit) <span className="text-red-500">*</span>
              </label>
              <input
                id="nik"
                type="text"
                name="nik"
                required
                maxLength={16}
                value={formData.nik}
                onChange={handleNumericChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-transparent transition-all font-mono"
                placeholder="Contoh: 3174011205080001"
              />
              <p className="text-[11px] text-gray-400 mt-0.5">
                Nomor Induk Kependudukan sesuai Kartu Keluarga (KK), harus 16 digit.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="jenisKelamin">
                Jenis Kelamin <span className="text-red-500">*</span>
              </label>
              <select
                id="jenisKelamin"
                name="jenisKelamin"
                value={formData.jenisKelamin}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-transparent transition-all"
              >
                <option value="L">Laki-laki (L)</option>
                <option value="P">Perempuan (P)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="tempatLahir">
                  Tempat Lahir <span className="text-red-500">*</span>
                </label>
                <input
                  id="tempatLahir"
                  type="text"
                  name="tempatLahir"
                  required
                  value={formData.tempatLahir}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-transparent transition-all"
                  placeholder="Contoh: Jakarta"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="tanggalLahir">
                  Tanggal Lahir <span className="text-red-500">*</span>
                </label>
                <input
                  id="tanggalLahir"
                  type="date"
                  name="tanggalLahir"
                  required
                  value={formData.tanggalLahir}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-transparent transition-all font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="anakKe">
                  Anak Ke <span className="text-red-500">*</span>
                </label>
                <input
                  id="anakKe"
                  type="text"
                  name="anakKe"
                  required
                  value={formData.anakKe || ''}
                  onChange={handleNumericChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-transparent transition-all"
                  placeholder="Contoh: 1"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="noHp">
                  Nomor HP Aktif <span className="text-red-500">*</span>
                </label>
                <input
                  id="noHp"
                  type="text"
                  name="noHp"
                  required
                  value={formData.noHp || ''}
                  onChange={handleNumericChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-transparent transition-all"
                  placeholder="Contoh: 0812xxxxxxxx"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: ROMBEL & KELAS */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center space-x-2">
            <Users className="h-4 w-4 text-purple-500" />
            <span>Akademik & Rombongan Belajar</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="tingkatKelas">
                Tingkat Kelas <span className="text-red-500">*</span>
              </label>
              <select
                id="tingkatKelas"
                name="tingkatKelas"
                value={formData.tingkatKelas}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-transparent transition-all"
              >
                <option value="10">Kelas 10 (X)</option>
                <option value="11">Kelas 11 (XI)</option>
                <option value="12">Kelas 12 (XII)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="rombonganBelajar">
                Rombongan Belajar (Rombel) <span className="text-red-500">*</span>
              </label>
              <input
                id="rombonganBelajar"
                type="text"
                name="rombonganBelajar"
                required
                value={formData.rombonganBelajar}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-transparent transition-all"
                placeholder="Contoh: X IPA 1 / XI IPS 2"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="statusSiswa">
                Status Keaktifan
              </label>
              <select
                id="statusSiswa"
                name="statusSiswa"
                value={formData.statusSiswa}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-transparent transition-all"
              >
                <option value="Aktif">Aktif</option>
                <option value="Mutasi">Mutasi</option>
                <option value="Lulus">Lulus</option>
                <option value="Keluar">Keluar</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 3: KELUARGA & ALAMAT */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center space-x-2">
            <Heart className="h-4 w-4 text-emerald-500" />
            <span>Keluarga & Alamat Orang Tua</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="namaIbuKandung">
                Nama Ibu Kandung <span className="text-red-500">*</span>
              </label>
              <input
                id="namaIbuKandung"
                type="text"
                name="namaIbuKandung"
                required
                value={formData.namaIbuKandung}
                onChange={handleUpperChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-transparent transition-all uppercase placeholder:normal-case font-medium"
                placeholder="CONTOH: SITI AMINAH (Jangan ketik 'IBU SITI')"
              />
              <p className="text-[11px] text-gray-400 mt-0.5">
                Sesuai dokumen resmi. DILARANG mencantumkan gelar kekeluargaan seperti "Ibu" atau "Ny." di depan nama.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="nikIbuKandung">
                NIK Ibu Kandung (16 Digit)
              </label>
              <input
                id="nikIbuKandung"
                type="text"
                name="nikIbuKandung"
                maxLength={16}
                value={formData.nikIbuKandung}
                onChange={handleNumericChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-transparent transition-all font-mono"
                placeholder="Contoh: 3174015509750002"
              />
              <p className="text-[11px] text-gray-400 mt-0.5">
                Digunakan untuk validasi silang dengan data kependudukan Dukcapil.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="tanggalLahirIbu">
                  Tanggal Lahir Ibu <span className="text-red-500">*</span>
                </label>
                <input
                  id="tanggalLahirIbu"
                  type="date"
                  name="tanggalLahirIbu"
                  required
                  value={formData.tanggalLahirIbu || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-transparent transition-all font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="pekerjaanIbu">
                  Pekerjaan Ibu <span className="text-red-500">*</span>
                </label>
                <input
                  id="pekerjaanIbu"
                  type="text"
                  name="pekerjaanIbu"
                  required
                  value={formData.pekerjaanIbu || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-transparent transition-all text-sm"
                  placeholder="Contoh: Ibu Rumah Tangga"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="namaAyah">
                Nama Ayah Kandung
              </label>
              <input
                id="namaAyah"
                type="text"
                name="namaAyah"
                value={formData.namaAyah}
                onChange={handleUpperChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-transparent transition-all uppercase"
                placeholder="Nama Lengkap Ayah"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="tanggalLahirAyah">
                  Tanggal Lahir Ayah <span className="text-red-500">*</span>
                </label>
                <input
                  id="tanggalLahirAyah"
                  type="date"
                  name="tanggalLahirAyah"
                  required
                  value={formData.tanggalLahirAyah || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-transparent transition-all font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="pekerjaanAyah">
                  Pekerjaan Ayah <span className="text-red-500">*</span>
                </label>
                <input
                  id="pekerjaanAyah"
                  type="text"
                  name="pekerjaanAyah"
                  required
                  value={formData.pekerjaanAyah || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-transparent transition-all text-sm"
                  placeholder="Contoh: Karyawan Swasta"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="alamatSiswa">
                Alamat Tinggal Lengkap
              </label>
              <textarea
                id="alamatSiswa"
                name="alamatSiswa"
                rows={1}
                value={formData.alamatSiswa}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-transparent transition-all resize-y"
                placeholder="Jalan, No, RT/RW, Dusun"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="keteranganMasalah">
                Keterangan Permasalahan Data / Catatan Perbaikan (Oleh Siswa)
              </label>
              <textarea
                id="keteranganMasalah"
                name="keteranganMasalah"
                rows={2}
                value={formData.keteranganMasalah || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-transparent transition-all resize-y"
                placeholder="Keterangan mengenai perbaikan data jika diisi oleh siswa..."
              />
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTONS */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium transition-all cursor-pointer text-sm"
          >
            Batal
          </button>
          <button
            id="btn-save-student"
            type="submit"
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all cursor-pointer text-sm shadow-md shadow-blue-200 transform active:scale-98"
          >
            <Save className="h-4 w-4" />
            <span>Simpan Data</span>
          </button>
        </div>
      </form>
    </div>
  );
}

import { Student, ValidationError } from './types';

/**
 * Validasi data siswa Dapodik secara terperinci
 * Mengembalikan daftar error (ValidationError) yang ditemukan
 */
export function validateStudent(student: Student): ValidationError[] {
  const errors: ValidationError[] = [];
  const currentYear = new Date().getFullYear();

  // Helper untuk membuat ID unik
  const makeErrId = (field: string) => `${student.id}-${field}`;

  // 1. VALIDASI NAMA SISWA
  if (!student.nama || student.nama.trim() === '') {
    errors.push({
      id: makeErrId('nama-empty'),
      studentId: student.id,
      studentName: student.nama || "TANPA NAMA",
      nisn: student.nisn,
      classGroup: `${student.tingkatKelas} - ${student.rombonganBelajar}`,
      field: 'nama',
      severity: 'critical',
      message: 'Nama lengkap siswa wajib diisi dan tidak boleh kosong.',
      currentValue: '',
      suggestedValue: 'MASUKKAN NAMA LENGKAP',
      isResolved: false,
      resolutionNotes: ''
    });
  } else {
    const trimmedName = student.nama.trim();
    
    // Check capitalization (harus huruf kapital)
    if (trimmedName !== trimmedName.toUpperCase()) {
      errors.push({
        id: makeErrId('nama-case'),
        studentId: student.id,
        studentName: trimmedName,
        nisn: student.nisn,
        classGroup: `${student.tingkatKelas} - ${student.rombonganBelajar}`,
        field: 'nama',
        severity: 'warning',
        message: 'Format penulisan nama harus menggunakan HURUF KAPITAL (Uppercase).',
        currentValue: student.nama,
        suggestedValue: trimmedName.toUpperCase(),
        isResolved: false,
        resolutionNotes: ''
      });
    }

    // Check special characters
    // Hanya membolehkan huruf, spasi, titik (.), koma (,), petik satu ('), dan hubung (-)
    const invalidCharRegex = /[^a-zA-Z\s\.,'\-]/g;
    if (invalidCharRegex.test(trimmedName)) {
      errors.push({
        id: makeErrId('nama-chars'),
        studentId: student.id,
        studentName: trimmedName,
        nisn: student.nisn,
        classGroup: `${student.tingkatKelas} - ${student.rombonganBelajar}`,
        field: 'nama',
        severity: 'critical',
        message: 'Nama mengandung karakter khusus atau angka yang dilarang di Dapodik (hanya boleh huruf, spasi, titik, koma, petik tunggal, atau tanda hubung).',
        currentValue: student.nama,
        suggestedValue: trimmedName.replace(/[^a-zA-Z\s\.,'\-]/g, '').toUpperCase(),
        isResolved: false,
        resolutionNotes: ''
      });
    }

    // Check double spaces
    if (/\s{2,}/.test(trimmedName)) {
      errors.push({
        id: makeErrId('nama-space'),
        studentId: student.id,
        studentName: trimmedName,
        nisn: student.nisn,
        classGroup: `${student.tingkatKelas} - ${student.rombonganBelajar}`,
        field: 'nama',
        severity: 'warning',
        message: 'Nama mengandung spasi ganda (double-space) yang tidak perlu.',
        currentValue: student.nama,
        suggestedValue: trimmedName.replace(/\s+/g, ' ').toUpperCase(),
        isResolved: false,
        resolutionNotes: ''
      });
    }
  }

  // 2. VALIDASI NISN (10 Digit Angka)
  if (!student.nisn || student.nisn.trim() === '') {
    errors.push({
      id: makeErrId('nisn-empty'),
      studentId: student.id,
      studentName: student.nama,
      nisn: 'KOSONG',
      classGroup: `${student.tingkatKelas} - ${student.rombonganBelajar}`,
      field: 'nisn',
      severity: 'critical',
      message: 'NISN (Nomor Induk Siswa Nasional) wajib diisi.',
      currentValue: '',
      suggestedValue: 'MASUKKAN 10 DIGIT NISN',
      isResolved: false,
      resolutionNotes: ''
    });
  } else {
    const cleanNisn = student.nisn.trim();
    
    // Check non-numeric
    const hasLetter = /[^0-9]/.test(cleanNisn);
    if (hasLetter) {
      // Seringkali huruf 'O' tertukar dengan angka '0'
      const correctedNisn = cleanNisn.replace(/[oO]/g, '0').replace(/[^0-9]/g, '');
      errors.push({
        id: makeErrId('nisn-numeric'),
        studentId: student.id,
        studentName: student.nama,
        nisn: student.nisn,
        classGroup: `${student.tingkatKelas} - ${student.rombonganBelajar}`,
        field: 'nisn',
        severity: 'critical',
        message: 'NISN hanya boleh berisi karakter angka (0-9). Terdeteksi huruf atau karakter khusus.',
        currentValue: student.nisn,
        suggestedValue: correctedNisn || '0000000000',
        isResolved: false,
        resolutionNotes: ''
      });
    }

    // Check length (harus 10 digit)
    if (cleanNisn.length !== 10) {
      errors.push({
        id: makeErrId('nisn-length'),
        studentId: student.id,
        studentName: student.nama,
        nisn: student.nisn,
        classGroup: `${student.tingkatKelas} - ${student.rombonganBelajar}`,
        field: 'nisn',
        severity: 'critical',
        message: `Panjang NISN tidak sesuai standar Dapodik (harus tepat 10 digit, saat ini: ${cleanNisn.length} digit).`,
        currentValue: student.nisn,
        suggestedValue: cleanNisn.slice(0, 10).padEnd(10, '0'),
        isResolved: false,
        resolutionNotes: ''
      });
    }
  }

  // 3. VALIDASI NIK (16 Digit Angka)
  if (!student.nik || student.nik.trim() === '') {
    errors.push({
      id: makeErrId('nik-empty'),
      studentId: student.id,
      studentName: student.nama,
      nisn: student.nisn,
      classGroup: `${student.tingkatKelas} - ${student.rombonganBelajar}`,
      field: 'nik',
      severity: 'critical',
      message: 'NIK (Nomor Induk Kependudukan) siswa wajib diisi.',
      currentValue: '',
      suggestedValue: 'MASUKKAN 16 DIGIT NIK',
      isResolved: false,
      resolutionNotes: ''
    });
  } else {
    const cleanNik = student.nik.trim();
    
    // Check non-numeric
    if (/[^0-9]/.test(cleanNik)) {
      errors.push({
        id: makeErrId('nik-numeric'),
        studentId: student.id,
        studentName: student.nama,
        nisn: student.nisn,
        classGroup: `${student.tingkatKelas} - ${student.rombonganBelajar}`,
        field: 'nik',
        severity: 'critical',
        message: 'NIK hanya boleh berisi karakter angka (0-9).',
        currentValue: student.nik,
        suggestedValue: cleanNik.replace(/[^0-9]/g, ''),
        isResolved: false,
        resolutionNotes: ''
      });
    }

    // Check length (harus 16 digit)
    if (cleanNik.length !== 16) {
      errors.push({
        id: makeErrId('nik-length'),
        studentId: student.id,
        studentName: student.nama,
        nisn: student.nisn,
        classGroup: `${student.tingkatKelas} - ${student.rombonganBelajar}`,
        field: 'nik',
        severity: 'critical',
        message: `Panjang NIK tidak sesuai ketentuan (harus tepat 16 digit, saat ini: ${cleanNik.length} digit).`,
        currentValue: student.nik,
        suggestedValue: cleanNik.slice(0, 16).padEnd(16, '0'),
        isResolved: false,
        resolutionNotes: ''
      });
    }

    // BONUS: Analisis kecocokan tanggal lahir dan NIK
    // Format NIK: kkddug-DDMMYY-xxxx. Untuk perempuan, tanggal lahir (DD) ditambah 40.
    if (cleanNik.length === 16 && !/[^0-9]/.test(cleanNik) && student.tanggalLahir) {
      const nikDobPart = cleanNik.substring(6, 12); // DDMMYY
      const dobParts = student.tanggalLahir.split('-'); // [YYYY, MM, DD]
      
      if (dobParts.length === 3) {
        let expectedDay = parseInt(dobParts[2], 10);
        const expectedMonthStr = dobParts[1]; // MM
        const expectedYearTwoDigit = dobParts[0].substring(2); // YY
        
        // Perempuan: DD + 40
        if (student.jenisKelamin === 'P') {
          expectedDay += 40;
        }
        
        const expectedDayStr = expectedDay.toString().padStart(2, '0');
        const expectedNikDobStr = `${expectedDayStr}${expectedMonthStr}${expectedYearTwoDigit}`;
        
        if (nikDobPart !== expectedNikDobStr) {
          errors.push({
            id: makeErrId('nik-dob-mismatch'),
            studentId: student.id,
            studentName: student.nama,
            nisn: student.nisn,
            classGroup: `${student.tingkatKelas} - ${student.rombonganBelajar}`,
            field: 'nik',
            severity: 'warning',
            message: `Ketidakcocokan NIK dengan data Tanggal Lahir & Jenis Kelamin. Di NIK tertulis tanggal '${nikDobPart.substring(0, 2)}' sedangkan di profil adalah '${student.tanggalLahir}' (${student.jenisKelamin === 'P' ? 'Perempuan' : 'Laki-laki'}).`,
            currentValue: student.nik,
            suggestedValue: cleanNik.substring(0, 6) + expectedNikDobStr + cleanNik.substring(12),
            isResolved: false,
            resolutionNotes: ''
          });
        }
      }
    }
  }

  // 4. VALIDASI TANGGAL LAHIR & USIA
  if (!student.tanggalLahir || student.tanggalLahir.trim() === '') {
    errors.push({
      id: makeErrId('dob-empty'),
      studentId: student.id,
      studentName: student.nama,
      nisn: student.nisn,
      classGroup: `${student.tingkatKelas} - ${student.rombonganBelajar}`,
      field: 'tanggalLahir',
      severity: 'critical',
      message: 'Tanggal lahir wajib diisi.',
      currentValue: '',
      suggestedValue: 'YYYY-MM-DD',
      isResolved: false,
      resolutionNotes: ''
    });
  } else {
    const dob = new Date(student.tanggalLahir);
    const today = new Date();
    
    if (isNaN(dob.getTime())) {
      errors.push({
        id: makeErrId('dob-invalid'),
        studentId: student.id,
        studentName: student.nama,
        nisn: student.nisn,
        classGroup: `${student.tingkatKelas} - ${student.rombonganBelajar}`,
        field: 'tanggalLahir',
        severity: 'critical',
        message: 'Format tanggal lahir tidak valid (harus YYYY-MM-DD).',
        currentValue: student.tanggalLahir,
        suggestedValue: '2008-01-01',
        isResolved: false,
        resolutionNotes: ''
      });
    } else if (dob > today) {
      errors.push({
        id: makeErrId('dob-future'),
        studentId: student.id,
        studentName: student.nama,
        nisn: student.nisn,
        classGroup: `${student.tingkatKelas} - ${student.rombonganBelajar}`,
        field: 'tanggalLahir',
        severity: 'critical',
        message: 'Tanggal lahir berada di masa depan, melebihi tanggal hari ini.',
        currentValue: student.tanggalLahir,
        suggestedValue: '2008-01-01',
        isResolved: false,
        resolutionNotes: ''
      });
    } else {
      // Hitung usia siswa
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }

      // Validasi logika jenjang usia SMA (idealnya 14 - 21 tahun)
      if (age < 14) {
        errors.push({
          id: makeErrId('dob-young'),
          studentId: student.id,
          studentName: student.nama,
          nisn: student.nisn,
          classGroup: `${student.tingkatKelas} - ${student.rombonganBelajar}`,
          field: 'tanggalLahir',
          severity: 'critical',
          message: `Usia siswa terlalu muda (${age} tahun) untuk tingkat sekolah menengah atas (SMA). Harap verifikasi kesesuaian data.`,
          currentValue: student.tanggalLahir,
          suggestedValue: '2008-01-01',
          isResolved: false,
          resolutionNotes: ''
        });
      } else if (age > 21) {
        errors.push({
          id: makeErrId('dob-old'),
          studentId: student.id,
          studentName: student.nama,
          nisn: student.nisn,
          classGroup: `${student.tingkatKelas} - ${student.rombonganBelajar}`,
          field: 'tanggalLahir',
          severity: 'warning',
          message: `Usia siswa terdeteksi sudah ${age} tahun (melebihi batas usia wajar sekolah SMA 21 tahun).`,
          currentValue: student.tanggalLahir,
          suggestedValue: '2007-01-01',
          isResolved: false,
          resolutionNotes: ''
        });
      }
    }
  }

  // 5. VALIDASI NAMA IBU KANDUNG
  if (!student.namaIbuKandung || student.namaIbuKandung.trim() === '') {
    errors.push({
      id: makeErrId('mother-empty'),
      studentId: student.id,
      studentName: student.nama,
      nisn: student.nisn,
      classGroup: `${student.tingkatKelas} - ${student.rombonganBelajar}`,
      field: 'namaIbuKandung',
      severity: 'critical',
      message: 'Nama Ibu Kandung wajib diisi.',
      currentValue: '',
      suggestedValue: 'MASUKKAN NAMA IBU KANDUNG',
      isResolved: false,
      resolutionNotes: ''
    });
  } else {
    const trimmedMother = student.namaIbuKandung.trim();
    
    // Check capitalization (harus huruf kapital)
    if (trimmedMother !== trimmedMother.toUpperCase()) {
      errors.push({
        id: makeErrId('mother-case'),
        studentId: student.id,
        studentName: student.nama,
        nisn: student.nisn,
        classGroup: `${student.tingkatKelas} - ${student.rombonganBelajar}`,
        field: 'namaIbuKandung',
        severity: 'warning',
        message: 'Format penulisan nama Ibu Kandung harus menggunakan HURUF KAPITAL (Uppercase).',
        currentValue: student.namaIbuKandung,
        suggestedValue: trimmedMother.toUpperCase(),
        isResolved: false,
        resolutionNotes: ''
      });
    }

    // Check "Ibu" / "Ny." prefixes
    const cleanMother = trimmedMother.toUpperCase();
    if (cleanMother.startsWith('IBU ') || cleanMother.startsWith('NY. ') || cleanMother.startsWith('NYONYA ')) {
      const suggestedMother = trimmedMother
        .replace(/^(ibu|ny\.|nyonya)\s+/i, '')
        .toUpperCase();

      errors.push({
        id: makeErrId('mother-prefix'),
        studentId: student.id,
        studentName: student.nama,
        nisn: student.nisn,
        classGroup: `${student.tingkatKelas} - ${student.rombonganBelajar}`,
        field: 'namaIbuKandung',
        severity: 'critical',
        message: 'Nama Ibu Kandung tidak diperkenankan mencantumkan sebutan kehormatan/kekeluargaan seperti "Ibu" atau "Ny." di awal nama.',
        currentValue: student.namaIbuKandung,
        suggestedValue: suggestedMother,
        isResolved: false,
        resolutionNotes: ''
      });
    }
  }

  // 6. VALIDASI NIK IBU KANDUNG
  if (!student.nikIbuKandung || student.nikIbuKandung.trim() === '') {
    errors.push({
      id: makeErrId('mother-nik-empty'),
      studentId: student.id,
      studentName: student.nama,
      nisn: student.nisn,
      classGroup: `${student.tingkatKelas} - ${student.rombonganBelajar}`,
      field: 'nikIbuKandung',
      severity: 'warning',
      message: 'NIK Ibu Kandung dianjurkan untuk dilengkapi demi validitas data kependudukan (Dukcapil).',
      currentValue: '',
      suggestedValue: 'MASUKKAN NIK IBU',
      isResolved: false,
      resolutionNotes: ''
    });
  } else {
    const cleanMotherNik = student.nikIbuKandung.trim();
    
    // Check non-numeric
    if (/[^0-9]/.test(cleanMotherNik)) {
      errors.push({
        id: makeErrId('mother-nik-numeric'),
        studentId: student.id,
        studentName: student.nama,
        nisn: student.nisn,
        classGroup: `${student.tingkatKelas} - ${student.rombonganBelajar}`,
        field: 'nikIbuKandung',
        severity: 'critical',
        message: 'NIK Ibu Kandung hanya boleh berisi angka (0-9).',
        currentValue: student.nikIbuKandung,
        suggestedValue: cleanMotherNik.replace(/[^0-9]/g, ''),
        isResolved: false,
        resolutionNotes: ''
      });
    }

    // Check length (harus 16 digit)
    if (cleanMotherNik.length !== 16) {
      errors.push({
        id: makeErrId('mother-nik-length'),
        studentId: student.id,
        studentName: student.nama,
        nisn: student.nisn,
        classGroup: `${student.tingkatKelas} - ${student.rombonganBelajar}`,
        field: 'nikIbuKandung',
        severity: 'critical',
        message: `Panjang NIK Ibu Kandung tidak sesuai ketentuan (harus tepat 16 digit, saat ini: ${cleanMotherNik.length} digit).`,
        currentValue: student.nikIbuKandung,
        suggestedValue: cleanMotherNik.slice(0, 16).padEnd(16, '0'),
        isResolved: false,
        resolutionNotes: ''
      });
    }
  }

  // 7. VALIDASI ANAK KE
  if (!student.anakKe || student.anakKe.trim() === '') {
    errors.push({
      id: makeErrId('anakKe-empty'),
      studentId: student.id,
      studentName: student.nama,
      nisn: student.nisn,
      classGroup: `${student.tingkatKelas} - ${student.rombonganBelajar}`,
      field: 'anakKe',
      severity: 'critical',
      message: 'Data "Anak Ke" wajib diisi.',
      currentValue: '',
      suggestedValue: '1',
      isResolved: false,
      resolutionNotes: ''
    });
  } else {
    const cleanAnakKe = student.anakKe.trim();
    if (/[^0-9]/.test(cleanAnakKe)) {
      errors.push({
        id: makeErrId('anakKe-numeric'),
        studentId: student.id,
        studentName: student.nama,
        nisn: student.nisn,
        classGroup: `${student.tingkatKelas} - ${student.rombonganBelajar}`,
        field: 'anakKe',
        severity: 'critical',
        message: 'Kolom "Anak Ke" hanya boleh diisi dengan angka.',
        currentValue: student.anakKe,
        suggestedValue: cleanAnakKe.replace(/[^0-9]/g, '') || '1',
        isResolved: false,
        resolutionNotes: ''
      });
    } else {
      const numAnakKe = parseInt(cleanAnakKe, 10);
      if (numAnakKe <= 0 || numAnakKe > 20) {
        errors.push({
          id: makeErrId('anakKe-range'),
          studentId: student.id,
          studentName: student.nama,
          nisn: student.nisn,
          classGroup: `${student.tingkatKelas} - ${student.rombonganBelajar}`,
          field: 'anakKe',
          severity: 'warning',
          message: 'Nilai "Anak Ke" di luar batas kewajaran umum (harus antara 1 sampai 20).',
          currentValue: student.anakKe,
          suggestedValue: '1',
          isResolved: false,
          resolutionNotes: ''
        });
      }
    }
  }

  // 8. VALIDASI NOMOR HP
  if (!student.noHp || student.noHp.trim() === '') {
    errors.push({
      id: makeErrId('noHp-empty'),
      studentId: student.id,
      studentName: student.nama,
      nisn: student.nisn,
      classGroup: `${student.tingkatKelas} - ${student.rombonganBelajar}`,
      field: 'noHp',
      severity: 'critical',
      message: 'Nomor HP Aktif wajib diisi untuk koordinasi sekolah dan orang tua.',
      currentValue: '',
      suggestedValue: '0812xxxxxxxx',
      isResolved: false,
      resolutionNotes: ''
    });
  } else {
    const cleanHp = student.noHp.trim();
    if (/[^0-9]/.test(cleanHp)) {
      errors.push({
        id: makeErrId('noHp-numeric'),
        studentId: student.id,
        studentName: student.nama,
        nisn: student.nisn,
        classGroup: `${student.tingkatKelas} - ${student.rombonganBelajar}`,
        field: 'noHp',
        severity: 'critical',
        message: 'Nomor HP hanya boleh berisi karakter angka saja.',
        currentValue: student.noHp,
        suggestedValue: cleanHp.replace(/[^0-9]/g, ''),
        isResolved: false,
        resolutionNotes: ''
      });
    } else if (cleanHp.length < 9 || cleanHp.length > 15) {
      errors.push({
        id: makeErrId('noHp-length'),
        studentId: student.id,
        studentName: student.nama,
        nisn: student.nisn,
        classGroup: `${student.tingkatKelas} - ${student.rombonganBelajar}`,
        field: 'noHp',
        severity: 'warning',
        message: `Panjang Nomor HP tidak wajar (biasanya antara 9-13 digit, saat ini ${cleanHp.length} digit).`,
        currentValue: student.noHp,
        suggestedValue: cleanHp,
        isResolved: false,
        resolutionNotes: ''
      });
    } else if (!cleanHp.startsWith('08') && !cleanHp.startsWith('62') && !cleanHp.startsWith('8')) {
      errors.push({
        id: makeErrId('noHp-format'),
        studentId: student.id,
        studentName: student.nama,
        nisn: student.nisn,
        classGroup: `${student.tingkatKelas} - ${student.rombonganBelajar}`,
        field: 'noHp',
        severity: 'warning',
        message: 'Format nomor HP Indonesia umumnya diawali dengan "08" atau kode negara "62".',
        currentValue: student.noHp,
        suggestedValue: '08' + cleanHp.replace(/^(08|62|0)?/, ''),
        isResolved: false,
        resolutionNotes: ''
      });
    }
  }

  // 9. VALIDASI TANGGAL LAHIR IBU
  if (!student.tanggalLahirIbu || student.tanggalLahirIbu.trim() === '') {
    errors.push({
      id: makeErrId('tanggalLahirIbu-empty'),
      studentId: student.id,
      studentName: student.nama,
      nisn: student.nisn,
      classGroup: `${student.tingkatKelas} - ${student.rombonganBelajar}`,
      field: 'tanggalLahirIbu',
      severity: 'critical',
      message: 'Tanggal lahir Ibu Kandung wajib diisi.',
      currentValue: '',
      suggestedValue: '1980-01-01',
      isResolved: false,
      resolutionNotes: ''
    });
  } else {
    const motherDob = new Date(student.tanggalLahirIbu);
    if (isNaN(motherDob.getTime())) {
      errors.push({
        id: makeErrId('tanggalLahirIbu-invalid'),
        studentId: student.id,
        studentName: student.nama,
        nisn: student.nisn,
        classGroup: `${student.tingkatKelas} - ${student.rombonganBelajar}`,
        field: 'tanggalLahirIbu',
        severity: 'critical',
        message: 'Format Tanggal Lahir Ibu tidak valid (harus YYYY-MM-DD).',
        currentValue: student.tanggalLahirIbu,
        suggestedValue: '1980-01-01',
        isResolved: false,
        resolutionNotes: ''
      });
    } else if (student.tanggalLahir) {
      const studentDob = new Date(student.tanggalLahir);
      if (!isNaN(studentDob.getTime())) {
        const ageDiffMs = studentDob.getTime() - motherDob.getTime();
        const ageDiffYears = ageDiffMs / (1000 * 60 * 60 * 24 * 365.25);
        if (ageDiffYears < 12) {
          errors.push({
            id: makeErrId('tanggalLahirIbu-too-young'),
            studentId: student.id,
            studentName: student.nama,
            nisn: student.nisn,
            classGroup: `${student.tingkatKelas} - ${student.rombonganBelajar}`,
            field: 'tanggalLahirIbu',
            severity: 'critical',
            message: `Selisih usia Ibu dan Siswa tidak masuk akal (Ibu hanya lebih tua ${Math.floor(ageDiffYears)} tahun dari siswa).`,
            currentValue: student.tanggalLahirIbu,
            suggestedValue: '1980-01-01',
            isResolved: false,
            resolutionNotes: ''
          });
        }
      }
    }
  }

  // 10. VALIDASI PEKERJAAN IBU
  if (!student.pekerjaanIbu || student.pekerjaanIbu.trim() === '') {
    errors.push({
      id: makeErrId('pekerjaanIbu-empty'),
      studentId: student.id,
      studentName: student.nama,
      nisn: student.nisn,
      classGroup: `${student.tingkatKelas} - ${student.rombonganBelajar}`,
      field: 'pekerjaanIbu',
      severity: 'critical',
      message: 'Pekerjaan Ibu Kandung wajib diisi.',
      currentValue: '',
      suggestedValue: 'Ibu Rumah Tangga',
      isResolved: false,
      resolutionNotes: ''
    });
  }

  // 11. VALIDASI TANGGAL LAHIR AYAH
  if (!student.tanggalLahirAyah || student.tanggalLahirAyah.trim() === '') {
    errors.push({
      id: makeErrId('tanggalLahirAyah-empty'),
      studentId: student.id,
      studentName: student.nama,
      nisn: student.nisn,
      classGroup: `${student.tingkatKelas} - ${student.rombonganBelajar}`,
      field: 'tanggalLahirAyah',
      severity: 'critical',
      message: 'Tanggal lahir Ayah Kandung wajib diisi.',
      currentValue: '',
      suggestedValue: '1978-01-01',
      isResolved: false,
      resolutionNotes: ''
    });
  } else {
    const fatherDob = new Date(student.tanggalLahirAyah);
    if (isNaN(fatherDob.getTime())) {
      errors.push({
        id: makeErrId('tanggalLahirAyah-invalid'),
        studentId: student.id,
        studentName: student.nama,
        nisn: student.nisn,
        classGroup: `${student.tingkatKelas} - ${student.rombonganBelajar}`,
        field: 'tanggalLahirAyah',
        severity: 'critical',
        message: 'Format Tanggal Lahir Ayah tidak valid (harus YYYY-MM-DD).',
        currentValue: student.tanggalLahirAyah,
        suggestedValue: '1978-01-01',
        isResolved: false,
        resolutionNotes: ''
      });
    } else if (student.tanggalLahir) {
      const studentDob = new Date(student.tanggalLahir);
      if (!isNaN(studentDob.getTime())) {
        const ageDiffMs = studentDob.getTime() - fatherDob.getTime();
        const ageDiffYears = ageDiffMs / (1000 * 60 * 60 * 24 * 365.25);
        if (ageDiffYears < 12) {
          errors.push({
            id: makeErrId('tanggalLahirAyah-too-young'),
            studentId: student.id,
            studentName: student.nama,
            nisn: student.nisn,
            classGroup: `${student.tingkatKelas} - ${student.rombonganBelajar}`,
            field: 'tanggalLahirAyah',
            severity: 'critical',
            message: `Selisih usia Ayah dan Siswa tidak masuk akal (Ayah hanya lebih tua ${Math.floor(ageDiffYears)} tahun dari siswa).`,
            currentValue: student.tanggalLahirAyah,
            suggestedValue: '1978-01-01',
            isResolved: false,
            resolutionNotes: ''
          });
        }
      }
    }
  }

  // 12. VALIDASI PEKERJAAN AYAH
  if (!student.pekerjaanAyah || student.pekerjaanAyah.trim() === '') {
    errors.push({
      id: makeErrId('pekerjaanAyah-empty'),
      studentId: student.id,
      studentName: student.nama,
      nisn: student.nisn,
      classGroup: `${student.tingkatKelas} - ${student.rombonganBelajar}`,
      field: 'pekerjaanAyah',
      severity: 'critical',
      message: 'Pekerjaan Ayah Kandung wajib diisi.',
      currentValue: '',
      suggestedValue: 'Karyawan Swasta',
      isResolved: false,
      resolutionNotes: ''
    });
  }

  return errors;
}

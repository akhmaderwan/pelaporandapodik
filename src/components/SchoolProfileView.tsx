import React, { useState, useEffect } from 'react';
import { SchoolProfile } from '../types';
import { 
  Building2, Save, Check, Award, MapPin, User, Mail, 
  Upload, Sparkles, RefreshCw, Trash2, HelpCircle, GraduationCap,
  BookOpen, Star, Globe, Landmark, ImageIcon
} from 'lucide-react';

interface SchoolProfileViewProps {
  profile: SchoolProfile;
  onSave: (updated: SchoolProfile) => void;
}

// Pure client-side dynamic SVG Generator for Indonesian educational crests
const generateSvgLogo = (
  shape: 'shield' | 'circle' | 'hexagon' | 'octagon',
  colorScheme: 'blue' | 'emerald' | 'crimson' | 'gold' | 'purple' | 'charcoal',
  iconName: 'cap' | 'book' | 'star' | 'award' | 'globe' | 'landmark' | 'none',
  initials: string
): string => {
  const gradients = {
    blue: { start: '#1e3a8a', end: '#3b82f6' },
    emerald: { start: '#064e3b', end: '#10b981' },
    crimson: { start: '#7f1d1d', end: '#ef4444' },
    gold: { start: '#78350f', end: '#f59e0b' },
    purple: { start: '#4c1d95', end: '#8b5cf6' },
    charcoal: { start: '#111827', end: '#6b7280' },
  };

  const colors = gradients[colorScheme] || gradients.blue;

  const shapes = {
    shield: `
      <path d="M15 15 H85 V45 C85 68, 50 88, 50 88 C50 88, 15 68, 15 45 Z" fill="url(#bgGrad)" stroke="#ffffff" stroke-width="4" stroke-linejoin="round"/>
      <path d="M21 21 H79 V44 C79 63, 50 79, 50 79 C50 79, 21 63, 21 44 Z" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="3,3" opacity="0.75" stroke-linejoin="round"/>
    `,
    circle: `
      <circle cx="50" cy="50" r="42" fill="url(#bgGrad)" stroke="#ffffff" stroke-width="4"/>
      <circle cx="50" cy="50" r="36" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="3,3" opacity="0.75"/>
    `,
    hexagon: `
      <polygon points="50,10 88,30 88,70 50,90 12,70 12,30" fill="url(#bgGrad)" stroke="#ffffff" stroke-width="4" stroke-linejoin="round"/>
      <polygon points="50,16 83,33 83,67 50,84 17,67 17,33" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="3,3" opacity="0.75" stroke-linejoin="round"/>
    `,
    octagon: `
      <polygon points="30,10 70,10 90,30 90,70 70,90 30,90 10,70 10,30" fill="url(#bgGrad)" stroke="#ffffff" stroke-width="4" stroke-linejoin="round"/>
      <polygon points="32,15 68,15 85,32 85,68 68,85 32,85 15,68 15,32" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="3,3" opacity="0.75" stroke-linejoin="round"/>
    `,
  };

  const selectedShapeSvg = shapes[shape] || shapes.shield;

  const icons = {
    cap: `
      <path d="M50 20 L80 32 L50 44 L20 32 Z" fill="#ffffff"/>
      <path d="M28 35 V48 C28 55, 72 55, 72 48 V35" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
      <path d="M75 32 V46 C75 48, 77 50, 75 52" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
    `,
    book: `
      <path d="M22 25 C28 25, 45 28, 50 32 C55 28, 72 25, 78 25 V65 C72 65, 55 68, 50 72 C45 68, 28 65, 22 65 Z" fill="none" stroke="#ffffff" stroke-width="4.5" stroke-linejoin="round"/>
      <path d="M50 32 V72" stroke="#ffffff" stroke-width="4"/>
    `,
    star: `<polygon points="50,20 58,38 78,38 62,50 68,68 50,56 32,68 38,50 22,38 42,38" fill="#ffffff"/>`,
    award: `
      <circle cx="50" cy="38" r="15" fill="none" stroke="#ffffff" stroke-width="4"/>
      <path d="M42 51 L36 71 L50 61 L64 71 L58 51" fill="none" stroke="#ffffff" stroke-width="4" stroke-linejoin="round"/>
    `,
    globe: `
      <circle cx="50" cy="42" r="21" fill="none" stroke="#ffffff" stroke-width="3"/>
      <ellipse cx="50" cy="42" rx="21" ry="7" fill="none" stroke="#ffffff" stroke-width="2"/>
      <ellipse cx="50" cy="42" rx="7" ry="21" fill="none" stroke="#ffffff" stroke-width="2"/>
      <line x1="50" y1="21" x2="50" y2="63" stroke="#ffffff" stroke-width="2"/>
      <line x1="29" y1="42" x2="71" y2="42" stroke="#ffffff" stroke-width="2"/>
    `,
    landmark: `
      <path d="M25 60 H75 M28 36 V60 M40 36 V60 M50 36 V60 M60 36 V60 M72 36 V60 M25 36 H75 M50 18 L75 36 H25 Z" fill="none" stroke="#ffffff" stroke-width="3" stroke-linejoin="round"/>
    `,
    none: ''
  };

  const hasIcon = iconName !== 'none';
  const selectedIconSvg = icons[iconName] || '';

  const textY = hasIcon ? '73' : '56';
  const textFontSize = hasIcon ? '11.5' : '18';
  const textFontWeight = hasIcon ? 'bold' : '900';

  const textSvg = initials ? `
    <text 
      x="50" 
      y="${textY}" 
      font-family="system-ui, -apple-system, sans-serif" 
      font-weight="${textFontWeight}" 
      font-size="${textFontSize}" 
      fill="#ffffff" 
      text-anchor="middle" 
      letter-spacing="0.5"
    >${initials.toUpperCase().slice(0, 5)}</text>
  ` : '';

  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${colors.start}" />
          <stop offset="100%" stop-color="${colors.end}" />
        </linearGradient>
      </defs>
      ${selectedShapeSvg}
      <g transform="${hasIcon ? 'translate(0, -5)' : ''}">
        ${selectedIconSvg}
      </g>
      ${textSvg}
    </svg>
  `.trim().replace(/\s+/g, ' ');

  const base64Svg = btoa(unescape(encodeURIComponent(svgString)));
  return `data:image/svg+xml;base64,${base64Svg}`;
};

export default function SchoolProfileView({ profile, onSave }: SchoolProfileViewProps) {
  const [formData, setFormData] = useState<SchoolProfile>({ ...profile });
  const [isSaved, setIsSaved] = useState(false);

  // Logo source: 'builder' (custom vector generator) or 'upload' (local file)
  const [logoSource, setLogoSource] = useState<'builder' | 'upload'>(() => {
    if (profile.logoUrl && (
      profile.logoUrl.startsWith('data:image/png') || 
      profile.logoUrl.startsWith('data:image/jpeg') || 
      profile.logoUrl.startsWith('data:image/webp') || 
      (profile.logoUrl.startsWith('data:image/svg') && !profile.logoUrl.includes('bgGrad'))
    )) {
      return 'upload';
    }
    return 'builder';
  });

  // Builder Parameters State
  const [crestShape, setCrestShape] = useState<'shield' | 'circle' | 'hexagon' | 'octagon'>('shield');
  const [crestColor, setCrestColor] = useState<'blue' | 'emerald' | 'crimson' | 'gold' | 'purple' | 'charcoal'>('blue');
  const [crestIcon, setCrestIcon] = useState<'cap' | 'book' | 'star' | 'award' | 'globe' | 'landmark' | 'none'>('cap');
  const [crestInitials, setCrestInitials] = useState(() => {
    if (profile.namaSekolah) {
      const words = profile.namaSekolah.split(' ').filter(w => !/^(SMA|SMK|SMP|SD|NEGERI|SWASTA)$/i.test(w));
      if (words.length > 0) {
        return words.slice(0, 3).map(w => w[0]).join('').toUpperCase();
      }
    }
    return 'SCH';
  });

  // Upload States
  const [dragActive, setDragActive] = useState(false);
  const [kopDragActive, setKopDragActive] = useState(false);

  const handleKopDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setKopDragActive(true);
    } else if (e.type === "dragleave") {
      setKopDragActive(false);
    }
  };

  const handleKopDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setKopDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    processUploadedKopFile(file);
  };

  const handleKopFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    processUploadedKopFile(file);
  };

  const processUploadedKopFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Format file tidak didukung. Harap pilih file gambar (PNG, JPG, atau SVG).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file terlalu besar. Batas maksimal adalah 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      setFormData(prev => ({
        ...prev,
        kopLaporanUrl: base64Data,
        useKopGambar: true
      }));
      setIsSaved(false);
    };
    reader.readAsDataURL(file);
  };

  const handleClearKop = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus kop gambar kustom dan kembali ke format teks standar?')) {
      setFormData(prev => ({
        ...prev,
        kopLaporanUrl: '',
        useKopGambar: false
      }));
      setIsSaved(false);
    }
  };

  // Sync built logo to form data when builder settings change
  useEffect(() => {
    if (logoSource === 'builder') {
      const builtUrl = generateSvgLogo(crestShape, crestColor, crestIcon, crestInitials);
      setFormData(prev => ({
        ...prev,
        logoUrl: builtUrl
      }));
    }
  }, [logoSource, crestShape, crestColor, crestIcon, crestInitials]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setIsSaved(false);
  };

  // Drag and drop handlers
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

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    processUploadedFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    processUploadedFile(file);
  };

  const processUploadedFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Format file tidak didukung. Harap pilih file gambar (PNG, JPG, atau SVG).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file terlalu besar. Batas maksimal adalah 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      setFormData(prev => ({
        ...prev,
        logoUrl: base64Data
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleClearLogo = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus logo kustom dan kembali ke default?')) {
      if (logoSource === 'upload') {
        setLogoSource('builder');
      }
      // Trigger update of builder logo url
      const defaultCrest = generateSvgLogo('shield', 'blue', 'cap', 'SCH');
      setFormData(prev => ({
        ...prev,
        logoUrl: defaultCrest
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" id="school-profile-container">
      {/* Banner / Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-6 text-white flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-white/15 p-3 rounded-xl backdrop-blur-md">
            <Building2 className="h-7 w-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Profil Satuan Pendidikan & Logo</h2>
            <p className="text-blue-100 text-sm">Sesuaikan profil serta lambang sekolah untuk kop surat dan laporan Dapodik</p>
          </div>
        </div>
        <div className="hidden sm:block bg-blue-600/30 px-3 py-1.5 rounded-lg border border-blue-400/30 text-xs font-mono">
          NPSN: {formData.npsn || '-'}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT SIDE: VISUAL LOGO BUILDER & UPLOADER (4 COLS) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-gray-50/50 rounded-2xl border border-gray-200/60 p-5 space-y-5">
              <div className="text-center">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Pratinjau Logo Sekolah</span>
                
                {/* Logo Frame */}
                <div className="relative mx-auto h-32 w-32 bg-white rounded-2xl border border-gray-200 shadow-xs flex items-center justify-center p-3 transition-all hover:scale-[1.02]">
                  {formData.logoUrl ? (
                    <img 
                      src={formData.logoUrl} 
                      alt="Pratinjau Logo" 
                      className="max-h-full max-w-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="text-gray-300 flex flex-col items-center">
                      <HelpCircle className="h-10 w-10 stroke-1" />
                      <span className="text-[10px] mt-1">Belum Ada Logo</span>
                    </div>
                  )}

                  {/* Badges indicating logo type */}
                  <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-900 text-white shadow-xs border border-slate-700">
                    {logoSource === 'builder' ? 'Desain Crest' : 'Gambar Kustom'}
                  </span>
                </div>

                <div className="flex justify-center mt-5">
                  <button
                    type="button"
                    onClick={handleClearLogo}
                    className="inline-flex items-center space-x-1 text-[10px] font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition-all cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Hapus / Atur Ulang</span>
                  </button>
                </div>
              </div>

              {/* Source Tabs */}
              <div className="border-t border-gray-200/60 pt-4">
                <span className="text-xs font-bold text-gray-500 block mb-2">Metode Penyediaan Logo:</span>
                <div className="grid grid-cols-2 gap-1 bg-gray-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setLogoSource('builder')}
                    className={`py-1.5 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      logoSource === 'builder'
                        ? 'bg-white text-gray-800 shadow-xs'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    Desain Crest AI
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogoSource('upload')}
                    className={`py-1.5 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      logoSource === 'upload'
                        ? 'bg-white text-gray-800 shadow-xs'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    Unggah Gambar
                  </button>
                </div>
              </div>

              {/* SOURCE 1: CREST BUILDER */}
              {logoSource === 'builder' && (
                <div className="space-y-4 pt-1 animate-fade-in">
                  
                  {/* Crest Shapes */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">Bentuk Lambang Perisai</label>
                    <select
                      value={crestShape}
                      onChange={(e) => setCrestShape(e.target.value as any)}
                      className="w-full text-xs bg-white border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="shield">🛡️ Perisai Tradisional (Shield)</option>
                      <option value="circle">⭕ Lingkaran Akademis (Circle)</option>
                      <option value="hexagon">⬡ Segi Enam Modern (Hexagon)</option>
                      <option value="octagon">🛑 Segi Delapan Klasik (Octagon)</option>
                    </select>
                  </div>

                  {/* Swatch Colors */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">Warna Utama Almamater</label>
                    <div className="grid grid-cols-6 gap-2">
                      {[
                        { key: 'blue', color: 'bg-blue-600', name: 'Navy' },
                        { key: 'emerald', color: 'bg-emerald-600', name: 'Hijau' },
                        { key: 'crimson', color: 'bg-red-600', name: 'Merah' },
                        { key: 'gold', color: 'bg-amber-500', name: 'Emas' },
                        { key: 'purple', color: 'bg-purple-600', name: 'Ungu' },
                        { key: 'charcoal', color: 'bg-slate-700', name: 'Abu' },
                      ].map(swatch => (
                        <button
                          key={swatch.key}
                          type="button"
                          onClick={() => setCrestColor(swatch.key as any)}
                          title={swatch.name}
                          className={`h-7 rounded-lg transition-all relative flex items-center justify-center ${swatch.color} hover:scale-110 cursor-pointer ${
                            crestColor === swatch.key 
                              ? 'ring-2 ring-offset-2 ring-blue-500 scale-105' 
                              : ''
                          }`}
                        >
                          {crestColor === swatch.key && (
                            <Check className="h-3.5 w-3.5 text-white stroke-[3]" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Emblem Symbol */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">Simbol Lambang Tengah</label>
                    <div className="grid grid-cols-4 gap-1">
                      {[
                        { key: 'cap', icon: GraduationCap, label: 'Toga' },
                        { key: 'book', icon: BookOpen, label: 'Buku' },
                        { key: 'star', icon: Star, label: 'Bintang' },
                        { key: 'award', icon: Award, label: 'Medali' },
                        { key: 'globe', icon: Globe, label: 'Dunia' },
                        { key: 'landmark', icon: Landmark, label: 'Sekolah' },
                        { key: 'none', icon: HelpCircle, label: 'Kosong' }
                      ].map(item => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() => setCrestIcon(item.key as any)}
                            className={`p-2 rounded-lg border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                              crestIcon === item.key
                                ? 'bg-blue-50 border-blue-200 text-blue-600'
                                : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-100'
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                            <span className="text-[9px] scale-90 leading-none">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom initials */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1" htmlFor="initials-input">
                      Tulisan / Singkatan Di Logo (Maks 5 Huruf)
                    </label>
                    <input
                      id="initials-input"
                      type="text"
                      maxLength={5}
                      value={crestInitials}
                      onChange={(e) => setCrestInitials(e.target.value.toUpperCase())}
                      placeholder="Contoh: SMA1"
                      className="w-full text-xs bg-white border border-gray-200 rounded-lg px-2.5 py-2 uppercase font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* SOURCE 2: FILE UPLOADER */}
              {logoSource === 'upload' && (
                <div className="space-y-3 pt-1 animate-fade-in">
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                      dragActive 
                        ? 'border-blue-500 bg-blue-50/50' 
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="file"
                      id="logo-file-picker"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label htmlFor="logo-file-picker" className="cursor-pointer block space-y-2">
                      <div className="mx-auto h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                        <Upload className="h-5 w-5" />
                      </div>
                      <div className="text-xs">
                        <span className="font-bold text-blue-600 hover:underline">Klik untuk pilih berkas</span> atau seret gambar ke sini
                      </div>
                      <p className="text-[10px] text-gray-400">
                        Mendukung PNG, JPG, JPEG, atau SVG (Maks. 2MB)
                      </p>
                    </label>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* RIGHT SIDE: PROFILE FORM FIELDS (8 COLS) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Identitas Utama */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-gray-800 flex items-center space-x-2 border-b border-gray-100 pb-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <span>Identitas Utama Sekolah</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="namaSekolah">
                    Nama Sekolah <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="namaSekolah"
                    type="text"
                    name="namaSekolah"
                    required
                    value={formData.namaSekolah}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                    placeholder="Contoh: SMA Negeri 1 Harapan Bangsa"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="npsn">
                    NPSN <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="npsn"
                    type="text"
                    name="npsn"
                    required
                    maxLength={8}
                    value={formData.npsn}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-sm"
                    placeholder="8 digit NPSN"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="status">
                    Status Sekolah <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="Negeri">Negeri</option>
                    <option value="Swasta">Swasta</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="akreditasi">
                    Akreditasi Sekolah
                  </label>
                  <select
                    id="akreditasi"
                    name="akreditasi"
                    value={formData.akreditasi}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="A">Terakreditasi A</option>
                    <option value="B">Terakreditasi B</option>
                    <option value="C">Terakreditasi C</option>
                    <option value="Belum Terakreditasi">Belum Terakreditasi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="emailSekolah">
                    Email Resmi Sekolah
                  </label>
                  <input
                    id="emailSekolah"
                    type="email"
                    name="emailSekolah"
                    value={formData.emailSekolah}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                    placeholder="sekolah@sch.id"
                  />
                </div>
              </div>
            </div>

            {/* Wilayah & Alamat */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-gray-800 flex items-center space-x-2 border-b border-gray-100 pb-2">
                <MapPin className="h-5 w-5 text-indigo-600" />
                <span>Alamat & Lokasi Satuan Pendidikan</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="alamat">
                    Alamat Sekolah Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="alamat"
                    type="text"
                    name="alamat"
                    required
                    value={formData.alamat}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Nama jalan, nomor, RT/RW"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="desaKelurahan">
                    Desa / Kelurahan
                  </label>
                  <input
                    id="desaKelurahan"
                    type="text"
                    name="desaKelurahan"
                    value={formData.desaKelurahan}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Kelurahan"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="kecamatan">
                    Kecamatan
                  </label>
                  <input
                    id="kecamatan"
                    type="text"
                    name="kecamatan"
                    value={formData.kecamatan}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Kecamatan"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="kabupatenKota">
                    Kabupaten / Kota
                  </label>
                  <input
                    id="kabupatenKota"
                    type="text"
                    name="kabupatenKota"
                    value={formData.kabupatenKota}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Kabupaten atau Kota"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="provinsi">
                    Provinsi
                  </label>
                  <input
                    id="provinsi"
                    type="text"
                    name="provinsi"
                    value={formData.provinsi}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Provinsi"
                  />
                </div>
              </div>
            </div>

            {/* Pimpinan & Operator */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-gray-800 flex items-center space-x-2 border-b border-gray-100 pb-2">
                <User className="h-5 w-5 text-emerald-600" />
                <span>Manajemen & Penanggung Jawab</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="namaKepalaSekolah">
                    Nama Kepala Sekolah <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="namaKepalaSekolah"
                    type="text"
                    name="namaKepalaSekolah"
                    required
                    value={formData.namaKepalaSekolah}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Nama lengkap beserta gelar"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="nipKepalaSekolah">
                    NIP Kepala Sekolah
                  </label>
                  <input
                    id="nipKepalaSekolah"
                    type="text"
                    name="nipKepalaSekolah"
                    value={formData.nipKepalaSekolah}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-sm"
                    placeholder="NIP (Kosongkan jika bukan PNS)"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="namaOperator">
                    Nama Operator Dapodik <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="namaOperator"
                    type="text"
                    name="namaOperator"
                    required
                    value={formData.namaOperator}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Nama Operator Dapodik Sekolah"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="nipOperator">
                    NIP Operator Dapodik
                  </label>
                  <input
                    id="nipOperator"
                    type="text"
                    name="nipOperator"
                    value={formData.nipOperator || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-sm"
                    placeholder="NIP Operator (Kosongkan jika bukan PNS)"
                  />
                </div>
              </div>
            </div>

            {/* Custom Kop Laporan Section */}
            <div className="space-y-4 text-left" id="custom-kop-laporan-section">
              <h3 className="text-base font-semibold text-gray-800 flex items-center space-x-2 border-b border-gray-100 pb-2">
                <ImageIcon className="h-5 w-5 text-indigo-600" />
                <span>Kop Surat & Kepala Laporan Kustom</span>
              </h3>
              
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-gray-700 block">Format Kepala Laporan (Kop Surat)</span>
                    <span className="text-[10px] text-gray-400">Pilih antara Kop teks standar otomatis atau gambar banner kustom</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 bg-white p-1 rounded-lg border border-gray-200 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, useKopGambar: false }));
                        setIsSaved(false);
                      }}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                        !formData.useKopGambar
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Kop Teks Standar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, useKopGambar: true }));
                        setIsSaved(false);
                      }}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                        formData.useKopGambar
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Kop Gambar Kustom
                    </button>
                  </div>
                </div>

                {formData.useKopGambar ? (
                  <div className="space-y-4 animate-fade-in">
                    {/* Live Kop Laporan Preview */}
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Pratinjau Kop Laporan</span>
                      {formData.kopLaporanUrl ? (
                        <div className="relative bg-white rounded-xl border border-gray-200 p-2 overflow-hidden shadow-xs">
                          <img 
                            src={formData.kopLaporanUrl} 
                            alt="Pratinjau Kop Laporan" 
                            className="w-full max-h-32 object-contain mx-auto"
                            referrerPolicy="no-referrer"
                          />
                          <button
                            type="button"
                            onClick={handleClearKop}
                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all cursor-pointer shadow-xs"
                            title="Hapus Kop Laporan"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-200 rounded-xl bg-white p-6 text-center text-gray-400 flex flex-col items-center justify-center">
                          <ImageIcon className="h-10 w-10 stroke-1 text-gray-300 mb-2" />
                          <span className="text-xs font-semibold">Belum Ada Gambar Kop</span>
                          <span className="text-[10px] text-gray-400 mt-1">Unggah berkas di bawah untuk menampilkan kop kustom</span>
                        </div>
                      )}
                    </div>

                    {/* Drag and Drop Zone */}
                    <div
                      onDragEnter={handleKopDrag}
                      onDragOver={handleKopDrag}
                      onDragLeave={handleKopDrag}
                      onDrop={handleKopDrop}
                      className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                        kopDragActive 
                          ? 'border-blue-500 bg-blue-50/50' 
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="file"
                        id="kop-file-picker"
                        accept="image/*"
                        onChange={handleKopFileChange}
                        className="hidden"
                      />
                      <label htmlFor="kop-file-picker" className="cursor-pointer block space-y-2">
                        <div className="mx-auto h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
                          <Upload className="h-5 w-5" />
                        </div>
                        <div className="text-xs">
                          <span className="font-bold text-indigo-600 hover:underline">Klik untuk pilih berkas</span> atau seret kop gambar ke sini
                        </div>
                        <p className="text-[10px] text-gray-400 leading-normal">
                          Mendukung PNG, JPG, JPEG, atau SVG (Maks. 2MB)<br />
                          Rekomendasi rasio horizontal (contoh: 800 x 150 piksel)
                        </p>
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-xs text-blue-700 leading-relaxed flex items-start space-x-2">
                    <Check className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>
                      Saat ini sistem menggunakan format <strong>Kop Teks Standar otomatis</strong>. Logo sekolah dan rincian identitas utama (Nama Sekolah, Alamat, NPSN) di samping akan otomatis disusun menjadi Kepala Surat / Kop Surat dinas pada setiap cetakan dokumen Word/Excel.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Running Text Section */}
            <div className="space-y-4" id="running-text-profile-section">
              <h3 className="text-base font-semibold text-gray-800 flex items-center space-x-2 border-b border-gray-100 pb-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                <span>Pengumuman & Tulisan Berjalan</span>
              </h3>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="runningText">
                  Isi Tulisan Berjalan (Running Announcement Text)
                </label>
                <textarea
                  id="runningText"
                  name="runningText"
                  rows={3}
                  value={formData.runningText || ''}
                  onChange={(e) => {
                    const { name, value } = e.target;
                    setFormData(prev => ({ ...prev, [name]: value }));
                    setIsSaved(false);
                  }}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-xs font-medium leading-relaxed"
                  placeholder="Masukkan kalimat pengumuman berjalan di sini. Kalimat ini akan tampil di bagian atas seluruh halaman portal siswa dan operator."
                />
                <p className="text-[10px] text-gray-400 mt-1">Kalimat ini akan bergulir secara luring (scroll) dari kanan ke kiri pada halaman utama.</p>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex items-center justify-end space-x-4 border-t border-gray-100 pt-6">
              {isSaved && (
                <span className="text-emerald-600 flex items-center text-xs font-bold animate-fade-in">
                  <Check className="h-4 w-4 mr-1.5" />
                  Profil & Logo berhasil disimpan!
                </span>
              )}
              <button
                id="btn-save-profile"
                type="submit"
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl shadow-md shadow-blue-200 font-semibold transition-all cursor-pointer transform active:scale-98 text-sm"
              >
                <Save className="h-4 w-4" />
                <span>Simpan Perubahan</span>
              </button>
            </div>

          </div>

        </div>
      </form>
    </div>
  );
}

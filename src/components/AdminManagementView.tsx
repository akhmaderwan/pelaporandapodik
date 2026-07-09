import React, { useState, useEffect } from 'react';
import { 
  UserPlus, Trash2, Key, Calendar, Shield, CheckCircle2, AlertTriangle, User, RefreshCw
} from 'lucide-react';

interface AdminUser {
  id: string;
  username: string;
  nama: string;
  createdAt: string;
}

export default function AdminManagementView() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // New Admin Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [nama, setNama] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete Confirmation State
  const [adminToDelete, setAdminToDelete] = useState<{ id: string; nama: string } | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState('');

  // Fetch admin list on mount
  const fetchAdmins = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admins');
      if (!response.ok) {
        throw new Error('Server returned non-ok status');
      }
      const data = await response.json();
      if (data.success) {
        setAdmins(data.admins);
      } else {
        setError(data.error || 'Gagal memuat daftar operator.');
      }
    } catch (err) {
      console.warn("Gagal menghubungi server database local, memuat via Cloud Firestore...");
      try {
        const { getFirestoreAdmins } = await import('../lib/firebase');
        const dbAdmins = await getFirestoreAdmins();
        // Mask passwords before setting state
        const safeAdmins = dbAdmins.map(({ password, ...rest }) => rest);
        setAdmins(safeAdmins);
      } catch (firestoreErr) {
        setError('Gagal terhubung dengan database server lokal maupun cloud.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    
    if (!username.trim() || !password.trim() || !nama.trim()) {
      setFormError('Semua kolom wajib diisi.');
      return;
    }

    if (username.trim().length < 3) {
      setFormError('Username minimal harus 3 karakter.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/admins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
          nama: nama.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Server returned non-ok status');
      }

      const data = await response.json();
      if (data.success) {
        setFormSuccess(`Operator "${data.admin.nama}" berhasil disimpan ke database!`);
        setUsername('');
        setPassword('');
        setNama('');
        fetchAdmins();
      } else {
        setFormError(data.error || 'Gagal menyimpan operator baru.');
      }
    } catch (err) {
      console.warn("Gagal menyimpan ke database server local, menyimpan via Cloud Firestore...");
      try {
        const { getFirestoreAdmins, saveFirestoreAdmin } = await import('../lib/firebase');
        const dbAdmins = await getFirestoreAdmins();
        const cleanUsername = username.trim().toLowerCase();
        
        if (dbAdmins.some(a => a.username.toLowerCase() === cleanUsername)) {
          setFormError("Username sudah digunakan oleh operator lain.");
          setSubmitting(false);
          return;
        }

        const newAdmin = {
          id: `admin-${Date.now()}`,
          username: cleanUsername,
          password: password.trim(),
          nama: nama.trim(),
          createdAt: new Date().toISOString()
        };

        await saveFirestoreAdmin(newAdmin);
        setFormSuccess(`Operator "${newAdmin.nama}" berhasil disimpan ke database Cloud!`);
        setUsername('');
        setPassword('');
        setNama('');
        fetchAdmins();
      } catch (firestoreErr) {
        setFormError('Gagal menyimpan operator ke database lokal maupun cloud.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDeleteAdmin = async () => {
    if (!adminToDelete) return;

    setDeleting(true);
    setDeleteError('');
    setDeleteSuccess('');
    try {
      const response = await fetch(`/api/admins/${adminToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Server returned non-ok status');
      }

      const data = await response.json();
      if (data.success) {
        setDeleteSuccess(`Operator "${adminToDelete.nama}" berhasil dihapus secara permanen.`);
        setAdminToDelete(null);
        fetchAdmins();
        // Clear success message after 4 seconds
        setTimeout(() => {
          setDeleteSuccess('');
        }, 4000);
      } else {
        setDeleteError(data.error || 'Gagal menghapus operator.');
      }
    } catch (err) {
      console.warn("Gagal menghapus dari database server local, mencoba via Cloud Firestore...");
      try {
        const { getFirestoreAdmins, removeFirestoreAdmin } = await import('../lib/firebase');
        const dbAdmins = await getFirestoreAdmins();
        if (dbAdmins.length <= 1) {
          setDeleteError("Tidak dapat menghapus operator satu-satunya. Harus tersisa minimal satu operator.");
          setDeleting(false);
          return;
        }
        await removeFirestoreAdmin(adminToDelete.id);
        setDeleteSuccess(`Operator "${adminToDelete.nama}" berhasil dihapus secara permanen dari Cloud.`);
        setAdminToDelete(null);
        fetchAdmins();
        setTimeout(() => {
          setDeleteSuccess('');
        }, 4000);
      } catch (firestoreErr) {
        setDeleteError('Gagal menghapus operator dari database lokal maupun cloud.');
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="admin-management-container">
      {/* HEADER SECTION */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <Shield className="h-5 w-5" />
            </span>
            <h2 className="text-lg font-bold text-gray-900">Kelola Akun Operator / Admin</h2>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed max-w-2xl">
            Tambah, hapus, dan verifikasi akun operator sekolah yang memiliki akses penuh untuk melakukan sinkronisasi data Dapodik luring (offline) secara aman.
          </p>
        </div>
        
        <button
          onClick={fetchAdmins}
          disabled={loading}
          className="flex items-center justify-center space-x-1.5 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 rounded-xl text-xs font-semibold cursor-pointer transition-all"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Segarkan Data</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ADD ADMIN FORM */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
            <div className="border-b border-gray-50 pb-3">
              <h3 className="text-sm font-extrabold text-gray-900 flex items-center space-x-1.5">
                <UserPlus className="h-4 w-4 text-blue-600" />
                <span>Tambah Operator Manual</span>
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Daftarkan akun admin baru langsung ke database lokal server.</p>
            </div>

            <form onSubmit={handleCreateAdmin} className="space-y-4">
              {/* Nama Lengkap */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider" htmlFor="admin_nama">
                  Nama Lengkap Operator
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    id="admin_nama"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Contoh: Budi Santoso, S.Pd."
                    className="w-full bg-gray-50/70 border border-gray-200 focus:border-blue-500 focus:bg-white text-gray-900 placeholder-gray-400 rounded-xl pl-10 pr-4 py-2.5 text-xs transition-all focus:outline-none focus:ring-2 focus:ring-blue-100 font-medium"
                    required
                  />
                </div>
              </div>

              {/* Username */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider" htmlFor="admin_username">
                  Username Akun
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    <Shield className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    id="admin_username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                    placeholder="Contoh: budi_operator"
                    className="w-full bg-gray-50/70 border border-gray-200 focus:border-blue-500 focus:bg-white text-gray-900 placeholder-gray-400 rounded-xl pl-10 pr-4 py-2.5 text-xs transition-all focus:outline-none focus:ring-2 focus:ring-blue-100 font-mono font-bold text-blue-900"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider" htmlFor="admin_password">
                  Kata Sandi (Password)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    <Key className="h-4 w-4" />
                  </span>
                  <input
                    type="password"
                    id="admin_password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan sandi unik..."
                    className="w-full bg-gray-50/70 border border-gray-200 focus:border-blue-500 focus:bg-white text-gray-900 placeholder-gray-400 rounded-xl pl-10 pr-4 py-2.5 text-xs transition-all focus:outline-none focus:ring-2 focus:ring-blue-100 font-medium"
                    required
                  />
                </div>
              </div>

              {formError && (
                <div className="flex items-start space-x-1.5 text-red-600 text-[11px] font-semibold bg-red-50/70 p-3 rounded-xl border border-red-100/40">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="flex items-start space-x-1.5 text-emerald-700 text-[11px] font-semibold bg-emerald-50/70 p-3 rounded-xl border border-emerald-100/40">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-md shadow-blue-100 transition-all cursor-pointer transform active:scale-98 flex items-center justify-center space-x-1.5"
              >
                <UserPlus className="h-4 w-4" />
                <span>{submitting ? 'Menyimpan...' : 'Simpan Akun Operator'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* ADMIN DATABASE LIST */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xs">
            <div className="p-6 border-b border-gray-50">
              <h3 className="text-sm font-extrabold text-gray-900">
                Daftar Akun Terdaftar di Database ({admins.length})
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Daftar kredensial operator terverifikasi pada file database server.</p>
            </div>

            {deleteSuccess && (
              <div className="mx-6 mt-4 p-3 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl text-xs font-semibold flex items-center space-x-1.5 animate-fade-in">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span>{deleteSuccess}</span>
              </div>
            )}

            {loading ? (
              <div className="p-12 text-center text-gray-400 space-y-2">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto text-blue-500" />
                <p className="text-xs font-medium">Memuat data dari database...</p>
              </div>
            ) : error ? (
              <div className="p-12 text-center text-red-500 font-semibold space-y-2">
                <AlertTriangle className="h-8 w-8 mx-auto text-red-400" />
                <p className="text-xs">{error}</p>
              </div>
            ) : admins.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <p className="text-xs">Tidak ada operator terdaftar.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 max-h-[420px] overflow-y-auto">
                {admins.map((admin) => (
                  <div key={admin.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs">
                        {admin.nama.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-extrabold text-gray-900">{admin.nama}</span>
                          {admin.username === 'bekecotanyut' && (
                            <span className="text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200/50 px-1 py-0.5 rounded">
                              Super Admin
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-3 text-[10px] text-gray-500 font-medium">
                          <span className="flex items-center space-x-1">
                            <span className="text-gray-400">Username:</span>
                            <strong className="font-mono text-blue-800 font-bold">{admin.username}</strong>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            <span>{new Date(admin.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setDeleteError('');
                        setAdminToDelete({ id: admin.id, nama: admin.nama });
                      }}
                      disabled={admins.length === 1}
                      title={admins.length === 1 ? 'Tidak bisa menghapus operator satu-satunya' : 'Hapus Operator'}
                      className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-xl transition-all cursor-pointer disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CUSTOM CONFIRM DELETE MODAL */}
      {adminToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-xs animate-fade-in" id="delete-admin-modal">
          <div className="bg-white rounded-3xl max-w-md w-full border border-gray-100 shadow-2xl overflow-hidden transform transition-all scale-100 p-6 space-y-5">
            <div className="flex items-center space-x-3 text-red-600">
              <div className="p-2.5 bg-red-50 rounded-2xl">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-gray-900">Hapus Akun Operator?</h3>
                <p className="text-[11px] text-gray-400">Tindakan ini permanen dan tidak dapat dibatalkan.</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100 font-medium">
              Apakah Anda yakin ingin menghapus akun operator <strong className="text-gray-900">"{adminToDelete.nama}"</strong> secara permanen dari server lokal database? Operator ini tidak akan bisa login lagi.
            </p>

            {deleteError && (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-100 text-[11px] font-semibold flex items-center space-x-1.5">
                <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setAdminToDelete(null)}
                className="flex-1 py-2.5 text-xs font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDeleteAdmin}
                disabled={deleting}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all cursor-pointer shadow-md shadow-red-100 flex items-center justify-center space-x-1.5"
              >
                {deleting ? 'Menghapus...' : 'Hapus Permanen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

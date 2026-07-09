import React, { useState, useEffect } from 'react';
import { 
  Github, GitBranch, CloudLightning, DownloadCloud, UploadCloud, 
  CheckCircle2, AlertTriangle, RefreshCw, Lock, Unlock, Plus, 
  ChevronRight, Copy, Check, LogOut, Info, HelpCircle, ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Student, SchoolProfile } from '../types';

interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  name: string;
  html_url: string;
}

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  description: string;
}

interface GitHubConnectionViewProps {
  students: Student[];
  schoolProfile: SchoolProfile;
  resolutionNotes: Record<string, string>;
  onRestore: (data: {
    students?: Student[];
    schoolProfile?: SchoolProfile;
    resolutionNotes?: Record<string, string>;
  }) => Promise<void>;
}

export default function GitHubConnectionView({
  students,
  schoolProfile,
  resolutionNotes,
  onRestore
}: GitHubConnectionViewProps) {
  // OAuth & User State
  const [githubUser, setGithubUser] = useState<GitHubUser | null>(() => {
    const cached = localStorage.getItem('dapodik_github_user');
    return cached ? JSON.parse(cached) : null;
  });
  const [githubToken, setGithubToken] = useState<string | null>(() => {
    return localStorage.getItem('dapodik_github_token');
  });

  // UI state
  const [isConfigMissing, setIsConfigMissing] = useState(false);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>(() => {
    return localStorage.getItem('dapodik_github_repo') || '';
  });
  const [filePath, setFilePath] = useState<string>('dapodik-backup.json');

  // Loading & Notification states
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [newRepoName, setNewRepoName] = useState('dapodik-backups');
  const [showCreateRepo, setShowCreateRepo] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  
  // Restore preview / confirmation state
  const [restorePreview, setRestorePreview] = useState<{
    studentsCount: number;
    schoolName: string;
    timestamp: string;
    raw: any;
  } | null>(null);

  // Troubleshooting guide accordion state
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);

  // Computed Redirect URI for user reference
  const redirectUri = `${window.location.origin}/api/auth/github/callback`;

  // Monitor PostMessage from the OAuth Callback Popup
  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === 'GITHUB_AUTH_SUCCESS') {
        const { token, user } = event.data;
        setGithubToken(token);
        setGithubUser(user);
        localStorage.setItem('dapodik_github_token', token);
        localStorage.setItem('dapodik_github_user', JSON.stringify(user));
        setStatusMessage({ type: 'success', text: `Berhasil terhubung dengan @${user.login}!` });
        setAuthLoading(false);
      } else if (event.data?.type === 'GITHUB_AUTH_ERROR') {
        setStatusMessage({ type: 'error', text: event.data.error || 'Gagal melakukan otorisasi GitHub.' });
        setAuthLoading(false);
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, []);

  // Fetch Repositories once connected
  const fetchRepositories = async (tokenToUse?: string) => {
    const activeToken = tokenToUse || githubToken;
    if (!activeToken) return;

    setLoadingRepos(true);
    setStatusMessage(null);
    try {
      const res = await fetch(`/api/github/repos?token=${encodeURIComponent(activeToken)}`);
      const data = await res.json();
      if (data.success) {
        setRepos(data.repos);
        setIsConfigMissing(false);
        // If there's a cached repo, make sure it still exists in the repo list
        if (selectedRepo && !data.repos.some((r: GitHubRepo) => r.full_name === selectedRepo)) {
          setSelectedRepo('');
        } else if (!selectedRepo && data.repos.length > 0) {
          // Auto select first repo if none selected
          const defaultRepo = data.repos[0].full_name;
          setSelectedRepo(defaultRepo);
          localStorage.setItem('dapodik_github_repo', defaultRepo);
        }
      } else {
        if (data.isConfigMissing) {
          setIsConfigMissing(true);
        }
        setStatusMessage({ type: 'error', text: data.error || 'Gagal memuat repositori dari GitHub.' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Terjadi kesalahan jaringan saat memuat daftar repositori.' });
    } finally {
      setLoadingRepos(false);
    }
  };

  useEffect(() => {
    if (githubToken) {
      fetchRepositories();
    }
  }, [githubToken]);

  // Handle Copy Callback URL
  const copyCallbackUrl = () => {
    navigator.clipboard.writeText(redirectUri);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Connect Account via Popup
  const connectGitHub = async () => {
    setAuthLoading(true);
    setStatusMessage(null);
    try {
      const res = await fetch(`/api/auth/github/url?redirect_uri=${encodeURIComponent(redirectUri)}`);
      const data = await res.json();
      if (data.success) {
        // Open authorization popup
        const width = 600;
        const height = 700;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;
        
        window.open(
          data.url,
          'Hubungkan GitHub',
          `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,status=yes`
        );
      } else {
        if (data.isConfigMissing) {
          setIsConfigMissing(true);
        }
        setStatusMessage({ type: 'error', text: data.error || 'Gagal menyiapkan URL Otorisasi GitHub.' });
        setAuthLoading(false);
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Gagal menghubungi server untuk memproses otorisasi.' });
      setAuthLoading(false);
    }
  };

  // Disconnect GitHub Account
  const disconnectGitHub = () => {
    setGithubUser(null);
    setGithubToken(null);
    setRepos([]);
    setSelectedRepo('');
    localStorage.removeItem('dapodik_github_user');
    localStorage.removeItem('dapodik_github_token');
    localStorage.removeItem('dapodik_github_repo');
    setStatusMessage({ type: 'info', text: 'Koneksi akun GitHub berhasil diputuskan.' });
  };

  // Create a New Backup Repository
  const createNewRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubToken || !newRepoName.trim()) return;

    setActionLoading(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/github/create-repo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: githubToken,
          name: newRepoName.trim().replace(/\s+/g, '-').toLowerCase(),
          description: 'Penyimpanan cadangan (backup) otomatis database Dapodik luring dari DapoValidator.'
        })
      });

      const data = await res.json();
      if (data.success) {
        setStatusMessage({ type: 'success', text: `Repositori "${data.repo.name}" berhasil dibuat!` });
        setShowCreateRepo(false);
        setNewRepoName('dapodik-backups');
        // Refresh repo list and select the newly created repo
        await fetchRepositories();
        setSelectedRepo(data.repo.full_name);
        localStorage.setItem('dapodik_github_repo', data.repo.full_name);
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Gagal membuat repositori baru.' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Terjadi kesalahan jaringan saat membuat repositori.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Backup (Push) Data to GitHub
  const handleBackupToGitHub = async () => {
    if (!githubToken || !selectedRepo) {
      setStatusMessage({ type: 'error', text: 'Silakan hubungkan akun dan pilih repositori cadangan terlebih dahulu.' });
      return;
    }

    setActionLoading(true);
    setStatusMessage({ type: 'info', text: 'Mengecek berkas lama di repositori...' });
    
    try {
      // 1. Check if the file already exists to get its SHA (needed for updates)
      const checkRes = await fetch(
        `/api/github/get-file?token=${encodeURIComponent(githubToken)}&repo=${encodeURIComponent(selectedRepo)}&path=${encodeURIComponent(filePath)}`
      );
      const checkData = await checkRes.json();
      
      let sha = null;
      if (checkData.success && !checkData.notFound) {
        sha = checkData.sha;
      }

      // 2. Prepare the payload
      const backupPayload = {
        students,
        schoolProfile,
        resolutionNotes,
        timestamp: new Date().toISOString(),
        backupBy: githubUser?.name || githubUser?.login || 'Operator DapoValidator'
      };

      const contentString = JSON.stringify(backupPayload, null, 2);

      // 3. Push to GitHub
      setStatusMessage({ type: 'info', text: 'Mengunggah cadangan ke repositori GitHub...' });
      const res = await fetch('/api/github/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: githubToken,
          repo: selectedRepo,
          path: filePath,
          content: contentString,
          message: `Backup Dapodik oleh Operator via DapoValidator - ${new Date().toLocaleDateString('id-ID')}`,
          sha
        })
      });

      const data = await res.json();
      if (data.success) {
        setStatusMessage({ 
          type: 'success', 
          text: `Sinkronisasi BERHASIL! Berkas cadangan "${filePath}" berhasil disimpan di repositori ${selectedRepo}.` 
        });
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Gagal mengunggah berkas cadangan.' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Koneksi jaringan terputus saat melakukan backup.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Restore (Pull) Data from GitHub
  const handleRestoreFromGitHub = async () => {
    if (!githubToken || !selectedRepo) {
      setStatusMessage({ type: 'error', text: 'Silakan hubungkan akun dan pilih repositori terlebih dahulu.' });
      return;
    }

    setActionLoading(true);
    setStatusMessage({ type: 'info', text: 'Mengunduh berkas cadangan dari GitHub...' });

    try {
      const res = await fetch(
        `/api/github/get-file?token=${encodeURIComponent(githubToken)}&repo=${encodeURIComponent(selectedRepo)}&path=${encodeURIComponent(filePath)}`
      );
      const data = await res.json();

      if (data.success) {
        if (data.notFound) {
          setStatusMessage({ 
            type: 'error', 
            text: `Berkas cadangan "${filePath}" tidak ditemukan di repositori ${selectedRepo}. Silakan buat backup baru terlebih dahulu.` 
          });
          return;
        }

        // Parse backup data
        try {
          const parsed = JSON.parse(data.content);
          if (!parsed.students || !Array.isArray(parsed.students)) {
            throw new Error('Format berkas cadangan tidak valid (tidak berisi data siswa).');
          }

          // Show confirmation preview
          setRestorePreview({
            studentsCount: parsed.students.length,
            schoolName: parsed.schoolProfile?.namaSekolah || 'Tidak diketahui',
            timestamp: parsed.timestamp ? new Date(parsed.timestamp).toLocaleString('id-ID') : 'Tidak diketahui',
            raw: parsed
          });
          setStatusMessage(null);

        } catch (parseErr: any) {
          setStatusMessage({ 
            type: 'error', 
            text: `Gagal membaca berkas cadangan: ${parseErr.message || 'Format JSON tidak valid.'}` 
          });
        }
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Gagal mengunduh berkas dari GitHub.' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Gagal terhubung dengan server GitHub.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Confirm and apply restore data to database
  const confirmRestore = async () => {
    if (!restorePreview) return;

    setActionLoading(true);
    try {
      await onRestore({
        students: restorePreview.raw.students,
        schoolProfile: restorePreview.raw.schoolProfile,
        resolutionNotes: restorePreview.raw.resolutionNotes
      });

      setStatusMessage({ 
        type: 'success', 
        text: `DATABASE BERHASIL DIPULIHKAN! ${restorePreview.studentsCount} data siswa dan profil sekolah berhasil dimuat ke database sistem.` 
      });
      setRestorePreview(null);
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Terjadi kesalahan sistem saat memulihkan database lokal.' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-6" id="github-connection-section">
      {/* SECTION HEADER */}
      <div className="border-b border-gray-50 pb-4 flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-extrabold text-gray-900 flex items-center space-x-1.5">
            <Github className="h-5 w-5 text-gray-900" />
            <span>Koneksi GitHub & Sinkronisasi Cadangan</span>
          </h3>
          <p className="text-[11px] text-gray-400 max-w-xl leading-relaxed">
            Hubungkan akun GitHub Anda untuk mengamankan data Dapodik. Operator dapat melakukan ekspor cadangan (backup) data siswa secara luring langsung ke repositori Git pribadi, serta memulihkannya kapan saja jika cache terhapus.
          </p>
        </div>
        
        {githubUser && (
          <button
            onClick={disconnectGitHub}
            className="flex items-center space-x-1 px-2.5 py-1 text-[10px] font-bold text-red-600 hover:text-white hover:bg-red-600 bg-red-50 border border-red-200/50 rounded-lg transition-all cursor-pointer"
            title="Putuskan Otorisasi Akun"
          >
            <LogOut className="h-3 w-3" />
            <span>Putuskan</span>
          </button>
        )}
      </div>

      {/* STATUS & FEEDBACK ALERTS */}
      {statusMessage && (
        <div className={`p-3.5 rounded-2xl text-xs font-semibold border flex items-start space-x-2 animate-fade-in ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-100/70' 
            : statusMessage.type === 'error'
            ? 'bg-red-50 text-red-700 border-red-100/70'
            : 'bg-blue-50 text-blue-800 border-blue-100/70'
        }`}>
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 mt-0.5 flex-shrink-0" />
          ) : statusMessage.type === 'error' ? (
            <AlertTriangle className="h-4.5 w-4.5 text-red-500 mt-0.5 flex-shrink-0" />
          ) : (
            <RefreshCw className="h-4.5 w-4.5 text-blue-500 mt-0.5 flex-shrink-0 animate-spin" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* MAIN STATES */}
      {!githubUser ? (
        /* STATE 1: DISCONNECTED (PROMPT CONNECT) */
        <div className="space-y-4">
          <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1 flex-1">
              <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 border border-blue-100/60 px-2 py-0.5 rounded-md uppercase tracking-wide">Langkah 1</span>
              <h4 className="text-xs font-extrabold text-gray-800 mt-1">Otorisasi Akun GitHub Anda</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed max-w-md">
                Klik tombol di samping untuk masuk dengan akun GitHub Anda. DapoValidator akan meminta akses repositori pribadi Anda untuk membuat dan memuat berkas backup database secara aman.
              </p>
            </div>

            <button
              onClick={connectGitHub}
              disabled={authLoading}
              className="flex items-center justify-center space-x-2 px-5 py-3 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-extrabold cursor-pointer shadow-md shadow-gray-200 transition-all transform active:scale-98 disabled:opacity-50 self-start md:self-auto"
            >
              <Github className="h-4.5 w-4.5" />
              <span>{authLoading ? 'Menghubungkan...' : 'Hubungkan Akun GitHub'}</span>
            </button>
          </div>

          {/* OAUTH DEVELOPER APP DEPLOYMENT SETUP GUIDE */}
          <div className="bg-amber-50/30 border border-amber-200/50 rounded-2xl p-4 space-y-3">
            <div className="flex items-center space-x-1.5 text-amber-800">
              <Info className="h-4.5 w-4.5" />
              <h4 className="text-xs font-extrabold">Petunjuk Konfigurasi (Untuk Administrator)</h4>
            </div>
            
            <p className="text-[11px] text-amber-900/80 leading-relaxed">
              Otorisasi GitHub memerlukan pengaturan kredensial GitHub OAuth App. Jika Anda melihat pesan error konfigurasi, pastikan Anda telah mendaftarkan aplikasi di <b>GitHub Developer Settings</b> dengan setelan berikut:
            </p>

            <div className="space-y-2">
              <div className="bg-white/80 border border-amber-200/60 rounded-xl p-3 text-[11px] space-y-1.5">
                <div className="flex items-center justify-between text-amber-900">
                  <span className="font-medium text-[10px] text-amber-700 block uppercase tracking-wider font-bold">Homepage URL:</span>
                  <span className="font-mono bg-amber-50/50 px-1.5 py-0.5 rounded border border-amber-100">{window.location.origin}</span>
                </div>
                <div className="flex items-center justify-between text-amber-900">
                  <span className="font-medium text-[10px] text-amber-700 block uppercase tracking-wider font-bold">Authorization callback URL:</span>
                  <div className="flex items-center space-x-1">
                    <span className="font-mono bg-amber-50/50 px-1.5 py-0.5 rounded border border-amber-100 select-all truncate max-w-[200px] sm:max-w-xs">{redirectUri}</span>
                    <button 
                      onClick={copyCallbackUrl}
                      className="p-1 hover:bg-amber-100 text-amber-700 rounded-md transition-all cursor-pointer"
                      title="Salin Callback URL"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-amber-800 leading-relaxed">
                Setelah membuat OAuth App, paste <b>Client ID</b> dan <b>Client Secret</b> ke panel <b>Secrets</b> di menu <b>Settings AI Studio</b> dengan nama variabel <code className="font-mono bg-amber-100/50 px-1 rounded text-amber-900 font-bold">GITHUB_CLIENT_ID</code> dan <code className="font-mono bg-amber-100/50 px-1 rounded text-amber-900 font-bold">GITHUB_CLIENT_SECRET</code>.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* STATE 2: CONNECTED (SHOW BACKUP & SYNC INTERFACE) */
        <div className="space-y-6">
          {/* GitHub User Account Profile Badge */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src={githubUser.avatar_url} 
                alt={githubUser.login} 
                className="h-10 w-10 rounded-full border border-gray-200"
                referrerPolicy="no-referrer"
              />
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded uppercase tracking-wide">Tersambung</span>
                <div className="flex items-center space-x-1">
                  <h4 className="text-xs font-black text-gray-900">{githubUser.name || githubUser.login}</h4>
                  <a 
                    href={githubUser.html_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[10px] text-blue-500 hover:underline font-mono"
                  >
                    @{githubUser.login}
                  </a>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-gray-400 font-medium block">ID Otorisasi</span>
              <span className="text-xs font-mono font-bold text-gray-600">GH-{githubUser.id}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* COLUMN 1: REPOSITORY SETUP */}
            <div className="space-y-4">
              <h4 className="text-xs font-extrabold text-gray-800 flex items-center space-x-1">
                <Lock className="h-4 w-4 text-amber-600" />
                <span>Pilihan Repositori Cadangan</span>
              </h4>

              <div className="space-y-3 bg-gray-50/40 p-4 rounded-2xl border border-gray-100">
                {/* Repository Dropdown selector */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider" htmlFor="repo_select">
                    Pilih Repositori GitHub
                  </label>
                  <div className="flex space-x-2">
                    <select
                      id="repo_select"
                      value={selectedRepo}
                      onChange={(e) => {
                        setSelectedRepo(e.target.value);
                        localStorage.setItem('dapodik_github_repo', e.target.value);
                      }}
                      disabled={loadingRepos || showCreateRepo}
                      className="flex-1 bg-white border border-gray-200 text-gray-900 rounded-xl px-3 py-2 text-xs transition-all focus:outline-none focus:border-blue-500 font-medium"
                    >
                      {repos.length === 0 ? (
                        <option value="">-- Tidak ada repositori --</option>
                      ) : (
                        repos.map((r) => (
                          <option key={r.id} value={r.full_name}>
                            {r.full_name} {r.private ? '(Private)' : '(Public)'}
                          </option>
                        ))
                      )}
                    </select>

                    <button
                      onClick={() => fetchRepositories()}
                      disabled={loadingRepos}
                      title="Segarkan Repositori"
                      className="p-2 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-pointer transition-all"
                    >
                      <RefreshCw className={`h-4 w-4 ${loadingRepos ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Create New Repo trigger/form */}
                {!showCreateRepo ? (
                  <button
                    onClick={() => setShowCreateRepo(true)}
                    className="text-[10px] text-blue-600 hover:text-blue-800 font-bold flex items-center space-x-1 mt-1.5 cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Buat Repositori Backup Baru</span>
                  </button>
                ) : (
                  <form onSubmit={createNewRepo} className="bg-white border border-gray-200/60 rounded-xl p-3 mt-2 space-y-2.5 animate-fade-in">
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider" htmlFor="new_repo_input">
                        Nama Repositori Baru (Private)
                      </label>
                      <input
                        type="text"
                        id="new_repo_input"
                        value={newRepoName}
                        onChange={(e) => setNewRepoName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-blue-500"
                        placeholder="dapodik-backups"
                        required
                      />
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => setShowCreateRepo(false)}
                        className="flex-1 py-1 px-2 text-[10px] font-bold text-gray-500 hover:bg-gray-100 rounded-lg border border-gray-200 transition-all cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={actionLoading || !newRepoName.trim()}
                        className="flex-1 py-1 px-2 text-[10px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all cursor-pointer"
                      >
                        {actionLoading ? 'Membuat...' : 'Buat Repo'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Backup File Name */}
                <div className="space-y-1 pt-2 border-t border-gray-100">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider" htmlFor="file_path_input">
                    Nama Berkas Cadangan (.json)
                  </label>
                  <input
                    type="text"
                    id="file_path_input"
                    value={filePath}
                    onChange={(e) => setFilePath(e.target.value.trim().replace(/\s+/g, '-'))}
                    placeholder="dapodik-backup.json"
                    className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-3 py-2 text-xs font-mono font-semibold text-blue-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* COLUMN 2: BACKUP & RESTORE ACTIONS */}
            <div className="space-y-4">
              <h4 className="text-xs font-extrabold text-gray-800 flex items-center space-x-1">
                <GitBranch className="h-4 w-4 text-blue-600" />
                <span>Eksekusi Backup & Sinkronisasi</span>
              </h4>

              <div className="grid grid-cols-1 gap-3">
                {/* 1. Push Backup Action Card */}
                <div className="bg-gradient-to-br from-blue-50/40 to-blue-50/10 border border-blue-100 rounded-2xl p-4 flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-extrabold text-blue-700 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-md uppercase tracking-wide">Ekspor Data</span>
                    <h5 className="text-xs font-extrabold text-blue-950">Simpan Database Ke GitHub</h5>
                    <p className="text-[10px] text-blue-900/70 leading-relaxed">
                      Komit dan unggah data siswa ({students.length} baris), catatan resolusi, dan profil sekolah aktif Anda saat ini langsung ke repositori cadangan.
                    </p>
                  </div>

                  <button
                    onClick={handleBackupToGitHub}
                    disabled={actionLoading || !selectedRepo}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-55 text-white rounded-xl text-xs font-extrabold flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm active:scale-98 transition-all"
                  >
                    <UploadCloud className="h-4 w-4" />
                    <span>{actionLoading ? 'Sinkronisasi...' : 'Unggah Backup Ke GitHub'}</span>
                  </button>
                </div>

                {/* 2. Pull Restore Action Card */}
                <div className="bg-gradient-to-br from-indigo-50/40 to-indigo-50/10 border border-indigo-100 rounded-2xl p-4 flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded-md uppercase tracking-wide">Impor Data</span>
                    <h5 className="text-xs font-extrabold text-indigo-950">Muat Cadangan Dari GitHub</h5>
                    <p className="text-[10px] text-indigo-900/70 leading-relaxed">
                      Unduh dan pulihkan database dari repositori GitHub untuk memuat seluruh histori data sekolah yang telah Anda cadangkan sebelumnya.
                    </p>
                  </div>

                  <button
                    onClick={handleRestoreFromGitHub}
                    disabled={actionLoading || !selectedRepo}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-55 text-white rounded-xl text-xs font-extrabold flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm active:scale-98 transition-all"
                  >
                    <DownloadCloud className="h-4 w-4" />
                    <span>{actionLoading ? 'Memproses...' : 'Unduh & Terapkan Backup'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TROUBLESHOOTING / SOLUSI ERROR PLATFORM GITHUB */}
      <div className="border-t border-gray-100 pt-5 mt-4" id="github-troubleshooting-section">
        <button
          onClick={() => setShowTroubleshooting(!showTroubleshooting)}
          className="w-full flex items-center justify-between p-3.5 bg-gray-50 hover:bg-gray-100/80 rounded-2xl border border-gray-200/50 transition-all text-left cursor-pointer"
        >
          <div className="flex items-center space-x-2.5 text-gray-800">
            <HelpCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-black">💡 Solusi Error: "Failed to load file differences..."</h4>
              <p className="text-[10px] text-gray-400 font-medium">Klik untuk panduan solusi lengkap integrasi GitHub platform AI Studio</p>
            </div>
          </div>
          {showTroubleshooting ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </button>

        {showTroubleshooting && (
          <div className="mt-3.5 p-4 bg-blue-50/20 rounded-2xl border border-blue-100/40 space-y-3.5 animate-fade-in text-xs text-gray-700 leading-relaxed">
            <div className="bg-red-50/80 border border-red-100/50 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center space-x-1.5 text-red-800">
                <AlertTriangle className="h-4 w-4 flex-shrink-0 text-red-600" />
                <span className="font-extrabold text-[11px] uppercase tracking-wide">Pesan Galat yang Terjadi:</span>
              </div>
              <p className="text-[11px] font-mono font-semibold bg-white border border-red-50 p-2 rounded text-red-700 select-all leading-normal">
                "Failed to load file differences, The GitHub repository could not be found, or you lack permissions. Please ensure the AI Studio GitHub App is installed."
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-extrabold text-blue-800 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md uppercase tracking-wider block w-fit">Mengapa Ini Terjadi?</span>
              <p className="text-[11px] text-gray-600">
                Pesan ini berasal dari sistem platform Google AI Studio itu sendiri. Ketika Anda menggunakan menu sinkronisasi bawaan AI Studio (misalnya menu <b>Export</b> atau <b>Sync to GitHub</b> di pojok kanan atas), AI Studio membutuhkan otorisasi khusus berupa <b>AI Studio GitHub App</b> yang dipasang langsung di akun atau organisasi GitHub Anda.
              </p>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md uppercase tracking-wider block w-fit">Cara Mengatasi & Mengaturnya:</span>
              
              <ol className="space-y-2.5 list-decimal pl-4.5 text-[11px] text-gray-600">
                <li className="pl-1">
                  <strong>Periksa atau Pasang GitHub App Google AI Studio:</strong><br />
                  Silakan buka dan periksa daftar aplikasi GitHub yang terpasang pada akun Anda di tautan resmi berikut:<br />
                  <a 
                    href="https://github.com/settings/installations" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 font-bold hover:underline inline-flex items-center space-x-1 font-mono mt-1"
                  >
                    <span>github.com/settings/installations</span>
                  </a>
                </li>
                
                <li className="pl-1">
                  <strong>Berikan Hak Akses ke Repositori (Repository Access):</strong><br />
                  Pada konfigurasi aplikasi <strong>Google AI Studio</strong> di halaman tersebut, cari bagian <strong>Repository access</strong>.
                  <ul className="list-disc pl-4 mt-1 space-y-1">
                    <li>Pilih <strong className="text-gray-900">All repositories</strong> (Semua repositori), ATAU</li>
                    <li>Pilih <strong className="text-gray-900">Only select repositories</strong> lalu tambahkan repositori proyek Dapodik/DapoValidator yang Anda tuju ke dalam daftar izin.</li>
                  </ul>
                </li>

                <li className="pl-1">
                  <strong>Persetujuan untuk Akun Organisasi Sekolah:</strong><br />
                  Jika Anda menyimpan repositori di bawah akun <strong>GitHub Organization</strong> sekolah Anda (bukan akun pribadi), minta administrator/pemilik organisasi GitHub tersebut untuk menyetujui (approve) pemasangan <strong>Google AI Studio GitHub App</strong> di bawah setelan organisasi.
                </li>

                <li className="pl-1">
                  <strong>Hubungkan Ulang di AI Studio:</strong><br />
                  Setelah memberikan hak izin di atas, kembali ke tab Google AI Studio Anda, segarkan halaman browser, lalu coba ekspor atau sinkronkan kembali melalui menu Settings di kanan atas.
                </li>
              </ol>
            </div>

            <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl flex items-start space-x-2 text-[11px] text-amber-900">
              <Info className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="leading-relaxed">
                <strong>Catatan Penting:</strong> Fitur ekspor/singkronisasi kode di pojok kanan atas AI Studio ini berbeda dengan fitur <strong>Backup/Restore Data Siswa</strong> yang kami sediakan di atas. Fitur backup data siswa di atas menggunakan token personal OAuth Anda sendiri dan akan bekerja secara independen terlepas dari apakah aplikasi AI Studio GitHub App platform Anda aktif atau tidak.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* CONFIRMATION PREVIEW MODAL FOR RESTORE */}
      {restorePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-xs animate-fade-in" id="confirm-restore-modal">
          <div className="bg-white rounded-3xl max-w-md w-full border border-gray-100 shadow-2xl overflow-hidden transform transition-all scale-100 p-6 space-y-5">
            <div className="flex items-center space-x-3 text-indigo-600">
              <div className="p-2.5 bg-indigo-50 rounded-2xl">
                <DownloadCloud className="h-6 w-6 animate-bounce" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-gray-900">Pulihkan Database Dapodik?</h3>
                <p className="text-[11px] text-gray-400">Database lokal sekolah akan digantikan dengan data cadangan ini.</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-3">
              <span className="text-[9px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded uppercase tracking-wider block w-fit">Info File Cadangan</span>
              
              <div className="grid grid-cols-2 gap-3 text-xs font-medium text-gray-600">
                <div>
                  <span className="text-[10px] text-gray-400 block uppercase tracking-wider">Sekolah Terarsip</span>
                  <strong className="text-gray-900">{restorePreview.schoolName}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block uppercase tracking-wider">Jumlah Siswa</span>
                  <strong className="text-gray-900">{restorePreview.studentsCount} Siswa</strong>
                </div>
                <div className="col-span-2 border-t border-gray-100 pt-2 mt-1">
                  <span className="text-[10px] text-gray-400 block uppercase tracking-wider">Tanggal Cadangan Terbuat</span>
                  <strong className="text-gray-900">{restorePreview.timestamp}</strong>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3.5 flex items-start space-x-2">
              <AlertTriangle className="h-4.5 w-4.5 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-[10px] text-amber-900 leading-relaxed font-semibold">
                PENTING: Tindakan ini akan menimpa seluruh database siswa luring yang aktif di web Anda saat ini dengan data arsip dari GitHub. Serta akan menyinkronkannya kembali ke database Firebase Cloud!
              </p>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setRestorePreview(null)}
                className="flex-1 py-2.5 text-xs font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmRestore}
                disabled={actionLoading}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-100 flex items-center justify-center space-x-1.5"
              >
                {actionLoading ? 'Memulihkan...' : 'Ya, Pulihkan Sekarang'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs/promises";
import { existsSync } from "fs";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Setup basic parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // API: Healthcheck
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // API: Audit & Validate student data using Gemini AI
  app.post("/api/gemini/analyze", async (req, res) => {
    try {
      const { student } = req.body;
      if (!student) {
        return res.status(400).json({ 
          success: false, 
          error: "Data siswa wajib disertakan dalam request." 
        });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
        return res.json({
          success: false,
          isApiKeyMissing: true,
          summary: "Analisis AI tidak tersedia karena API Key Gemini belum dikonfigurasi.",
          issues: [
            {
              field: "Lainnya",
              severity: "warning",
              description: "API Key Gemini tidak terdeteksi di lingkungan server. Menggunakan validasi lokal otomatis sebagai gantinya.",
              fix_suggestion: "Hubungkan kunci API Gemini Anda melalui panel Secrets di menu Settings AI Studio."
            }
          ],
          recommendation: "Gunakan fitur validasi otomatis bawaan sistem yang berjalan secara luring (offline) secara penuh."
        });
      }

      // Initialize Google Gen AI
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `Anda adalah asisten audit ahli Dapodik (Data Pokok Pendidikan) Kemendikbudristek RI. Tugas Anda adalah melakukan verifikasi mendalam terhadap satu data siswa berikut dan menyusun laporan terperinci mengenai kesalahan format, kesalahan logis, atau inkonsistensi data.

Aturan Baku Dapodik yang harus dirujuk:
1. Nama Siswa & Ibu Kandung wajib huruf KAPITAL penuh tanpa singkatan tidak jelas.
2. Nama tidak boleh mengandung angka, karakter khusus dilarang (seperti &, #, @, $, %, dll), kecuali spasi tunggal, titik, koma, petik satu, atau tanda hubung.
3. Nama Ibu tidak boleh mencantumkan sapaan kehormatan/keluarga seperti "Ibu", "Ny.", "Nyonya", "Alm." di awal nama.
4. NIK wajib tepat 16 digit angka, tidak boleh ada huruf.
5. NISN wajib tepat 10 digit angka.
6. Tanggal Lahir harus masuk akal dengan tingkat kelas. Untuk tingkat SMA (Tingkat 10-12), usia normal berkisar 14-20 tahun. Usia <14 tahun sangat kritikal, sedangkan >21 tahun adalah peringatan.
7. Tanggal Lahir harus sinkron dengan digit ke 7-12 dari NIK (format DDMMYY, khusus perempuan tanggal lahir DD ditambah 40). Contoh: Laki-laki lahir 12 Mei 2008 -> digit NIK tengah: 120508. Perempuan lahir 12 Mei 2008 -> digit NIK tengah: 520508.

Berikut adalah data siswa yang akan dianalisis:
- Nama Lengkap: ${student.nama}
- NISN: ${student.nisn}
- NIK: ${student.nik}
- Tempat & Tanggal Lahir: ${student.tempatLahir}, ${student.tanggalLahir}
- Jenis Kelamin: ${student.jenisKelamin === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)'}
- Rombel: Tingkat Kelas ${student.tingkatKelas}, Rombongan Belajar: ${student.rombonganBelajar}
- Nama Ibu Kandung: ${student.namaIbuKandung}
- NIK Ibu Kandung: ${student.nikIbuKandung || 'Tidak diisi'}
- Nama Ayah Kandung: ${student.namaAyah || 'Tidak diisi'}
- Alamat Lengkap Siswa: ${student.alamatSiswa || 'Tidak diisi'}

Berikan hasil analisis Anda dalam bahasa Indonesia yang baik, lugas, ramah, dan sangat profesional. Format respons HARUS berupa objek JSON dengan struktur persis seperti berikut:

{
  "summary": "Ringkasan kesimpulan singkat kondisi kelayakan data siswa ini (1-2 kalimat).",
  "issues": [
    {
      "field": "nama_field_terkait", // gunakan nama field yang tepat seperti 'nama', 'nik', 'nisn', 'tanggalLahir', 'namaIbuKandung', 'nikIbuKandung', dll
      "severity": "critical", // nilai berupa 'critical' (kesalahan fatal penolakan sistem) atau 'warning' (peringatan kelengkapan)
      "description": "Penjelasan detail mengapa penulisan ini salah menurut aturan Dapodik dan Dukcapil.",
      "fix_suggestion": "Format penulisan yang benar atau aksi konkret yang harus dilakukan operator."
    }
  ],
  "recommendation": "Saran proaktif khusus untuk siswa ini atau koordinasi dengan dinas/dukcapil setempat jika diperlukan."
}

PENTING: Hanya keluarkan string JSON yang valid tersebut. Jangan membungkus respons dengan tanda kutip triple backticks seperti \`\`\`json ... \`\`\` jika memungkinkan, namun jika Anda melakukannya, kami akan memparsingnya. Kembalikan JSON murni.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const textResponse = response.text || "{}";
      
      // Parse to ensure it is valid JSON, then send back
      const cleanJson = JSON.parse(textResponse.trim());
      res.json({
        success: true,
        ...cleanJson
      });

    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Terjadi kesalahan internal saat menganalisis data dengan AI."
      });
    }
  });

  // --- GITHUB OAUTH & INTEGRATION ENDPOINTS ---
  app.get('/api/auth/github/url', (req, res) => {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    
    if (!clientId || clientId === "MY_GITHUB_CLIENT_ID" || clientId.trim() === "" ||
        !clientSecret || clientSecret === "MY_GITHUB_CLIENT_SECRET" || clientSecret.trim() === "") {
      return res.status(400).json({
        success: false,
        isConfigMissing: true,
        error: "Kredensial GitHub OAuth belum dikonfigurasi di server. Silakan hubungi operator sekolah atau tambahkan GITHUB_CLIENT_ID dan GITHUB_CLIENT_SECRET pada Secrets panel di menu Settings AI Studio."
      });
    }

    const redirectUri = (req.query.redirect_uri as string) || `${process.env.APP_URL}/api/auth/github/callback`;

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'repo,read:user',
      state: Math.random().toString(36).substring(7)
    });

    const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;
    res.json({ success: true, url: authUrl });
  });

  app.get(['/api/auth/github/callback', '/api/auth/github/callback/'], async (req, res) => {
    const { code, redirect_uri } = req.query;
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!code) {
      return res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'GITHUB_AUTH_ERROR', error: 'Otorisasi dibatalkan atau kode tidak ditemukan.' }, '*');
                window.close();
              }
            </script>
            <p>Otorisasi gagal atau dibatalkan.</p>
          </body>
        </html>
      `);
    }

    try {
      // 1. Exchange code for access token
      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri
        })
      });

      const tokenData: any = await tokenResponse.json();

      if (tokenData.error) {
        throw new Error(tokenData.error_description || tokenData.error);
      }

      const accessToken = tokenData.access_token;

      // 2. Fetch User Profile
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${accessToken}`,
          'User-Agent': 'aistudio-dapovalidator'
        }
      });

      const userData = await userResponse.json();

      // 3. Return response with postMessage
      res.send(`
        <html>
          <head>
            <title>Hubungkan GitHub</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #f9fafb; color: #111827; }
              .card { text-align: center; padding: 2rem; background: white; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 1px solid #f3f4f6; max-width: 320px; }
              h3 { margin-top: 0; color: #16a34a; }
              p { font-size: 0.875rem; color: #4b5563; line-height: 1.5; }
            </style>
          </head>
          <body>
            <div class="card">
              <h3>Koneksi Berhasil!</h3>
              <p>Akun GitHub Anda (<b>@${userData.login}</b>) berhasil dihubungkan dengan DapoValidator.</p>
              <p style="font-size: 11px; color: #9ca3af; margin-bottom: 0;">Jendela ini akan tertutup otomatis...</p>
            </div>
            <script>
              if (window.opener) {
                window.opener.postMessage({ 
                  type: 'GITHUB_AUTH_SUCCESS', 
                  token: ${JSON.stringify(accessToken)}, 
                  user: ${JSON.stringify(userData)} 
                }, '*');
                setTimeout(() => {
                  window.close();
                }, 1000);
              } else {
                window.location.href = '/';
              }
            </script>
          </body>
        </html>
      `);

    } catch (error: any) {
      console.error('GitHub OAuth error:', error);
      res.send(`
        <html>
          <head>
            <title>Koneksi GitHub Gagal</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #f9fafb; color: #111827; }
              .card { text-align: center; padding: 2rem; background: white; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 1px solid #f3f4f6; max-width: 320px; }
              h3 { margin-top: 0; color: #dc2626; }
              p { font-size: 0.875rem; color: #4b5563; line-height: 1.5; }
            </style>
          </head>
          <body>
            <div class="card">
              <h3>Koneksi Gagal</h3>
              <p>Terjadi kesalahan saat menghubungkan akun GitHub Anda.</p>
              <p style="color: #dc2626; font-size: 12px;">${error.message}</p>
              <p style="font-size: 11px; color: #9ca3af; margin-bottom: 0;">Jendela ini akan tertutup otomatis...</p>
            </div>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'GITHUB_AUTH_ERROR', error: ${JSON.stringify(error.message)} }, '*');
                setTimeout(() => {
                  window.close();
                }, 3000);
              }
            </script>
          </body>
        </html>
      `);
    }
  });

  app.get("/api/github/repos", async (req, res) => {
    const token = req.query.token as string;
    if (!token) {
      return res.status(400).json({ success: false, error: "Access token wajib disediakan." });
    }
    try {
      const response = await fetch("https://api.github.com/user/repos?per_page=100&sort=updated", {
        headers: {
          "Authorization": `token ${token}`,
          "User-Agent": "aistudio-dapovalidator",
          "Accept": "application/vnd.github.v3+json"
        }
      });
      const repos = await response.json();
      if (!response.ok) {
        throw new Error(repos.message || "Gagal mengambil daftar repositori.");
      }
      res.json({ success: true, repos });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/github/create-repo", async (req, res) => {
    const { token, name, description } = req.body;
    if (!token || !name) {
      return res.status(400).json({ success: false, error: "Token dan nama repositori wajib diisi." });
    }
    try {
      const response = await fetch("https://api.github.com/user/repos", {
        method: "POST",
        headers: {
          "Authorization": `token ${token}`,
          "User-Agent": "aistudio-dapovalidator",
          "Content-Type": "application/json",
          "Accept": "application/vnd.github.v3+json"
        },
        body: JSON.stringify({
          name,
          description: description || "Backup data Dapodik oleh DapoValidator",
          private: true,
          auto_init: true
        })
      });
      const repo = await response.json();
      if (!response.ok) {
        throw new Error(repo.message || "Gagal membuat repositori baru.");
      }
      res.json({ success: true, repo });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/github/backup", async (req, res) => {
    const { token, repo, path: filePath, content, message, sha } = req.body;
    if (!token || !repo || !filePath || !content) {
      return res.status(400).json({ success: false, error: "Parameter token, repo, path, dan content wajib diisi." });
    }
    try {
      const base64Content = Buffer.from(content).toString("base64");
      
      const body: any = {
        message: message || "Backup data Dapodik",
        content: base64Content
      };
      if (sha) {
        body.sha = sha;
      }

      const response = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
        method: "PUT",
        headers: {
          "Authorization": `token ${token}`,
          "User-Agent": "aistudio-dapovalidator",
          "Content-Type": "application/json",
          "Accept": "application/vnd.github.v3+json"
        },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Gagal mengunggah file backup ke GitHub.");
      }
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get("/api/github/get-file", async (req, res) => {
    const token = req.query.token as string;
    const repo = req.query.repo as string;
    const filePath = req.query.path as string;

    if (!token || !repo || !filePath) {
      return res.status(400).json({ success: false, error: "Parameter token, repo, dan path wajib diisi." });
    }

    try {
      const response = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
        headers: {
          "Authorization": `token ${token}`,
          "User-Agent": "aistudio-dapovalidator",
          "Accept": "application/vnd.github.v3+json"
        }
      });
      const data = await response.json();
      if (response.status === 404) {
        return res.json({ success: true, notFound: true });
      }
      if (!response.ok) {
        throw new Error(data.message || "Gagal mengambil file dari GitHub.");
      }

      let textContent = "";
      if (data.content) {
        textContent = Buffer.from(data.content, "base64").toString("utf-8");
      }

      res.json({
        success: true,
        sha: data.sha,
        content: textContent
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // --- ADMIN DATABASE STORAGE & API ENDPOINTS ---
  interface AdminUser {
    id: string;
    username: string;
    password?: string;
    nama: string;
    createdAt: string;
  }

  const ADMINS_FILE = path.join(process.cwd(), "db_admins.json");

  async function loadAdmins(): Promise<AdminUser[]> {
    try {
      if (!existsSync(ADMINS_FILE)) {
        // Seed default admin
        const defaultAdmins: AdminUser[] = [
          {
            id: "admin-1783065544727",
            username: "bekecotanyut",
            password: "erwan123",
            nama: "AKHMAD ERWAN",
            createdAt: new Date().toISOString()
          }
        ];
        await fs.writeFile(ADMINS_FILE, JSON.stringify(defaultAdmins, null, 2), "utf-8");
        return defaultAdmins;
      }
      const data = await fs.readFile(ADMINS_FILE, "utf-8");
      return JSON.parse(data);
    } catch (e) {
      console.error("Error loading admins:", e);
      return [];
    }
  }

  async function saveAdmins(admins: AdminUser[]) {
    await fs.writeFile(ADMINS_FILE, JSON.stringify(admins, null, 2), "utf-8");
  }

  // API: Get Admin List
  app.get("/api/admins", async (req, res) => {
    try {
      const admins = await loadAdmins();
      // Safe list: delete password properties from the payload before serving
      const safeAdmins = admins.map(({ password, ...rest }) => rest);
      res.json({ success: true, admins: safeAdmins });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // API: Add Admin User
  app.post("/api/admins", async (req, res) => {
    try {
      const { username, password, nama } = req.body;
      if (!username || !password || !nama) {
        return res.status(400).json({ success: false, error: "Username, kata sandi, dan nama lengkap wajib diisi." });
      }

      const cleanUsername = username.trim().toLowerCase();
      if (cleanUsername.length < 3) {
        return res.status(400).json({ success: false, error: "Username harus memiliki minimal 3 karakter." });
      }

      const admins = await loadAdmins();

      // Check for duplicate username
      if (admins.some(a => a.username.toLowerCase() === cleanUsername)) {
        return res.status(400).json({ success: false, error: "Username sudah digunakan oleh operator lain." });
      }

      const newAdmin: AdminUser = {
        id: `admin-${Date.now()}`,
        username: cleanUsername,
        password: password.trim(),
        nama: nama.trim(),
        createdAt: new Date().toISOString()
      };

      admins.push(newAdmin);
      await saveAdmins(admins);

      const { password: _, ...safeAdmin } = newAdmin;
      res.json({ success: true, admin: safeAdmin });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // API: Delete Admin User
  app.delete("/api/admins/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const admins = await loadAdmins();

      if (admins.length <= 1) {
        return res.status(400).json({ success: false, error: "Tidak dapat menghapus operator satu-satunya. Harus tersisa minimal satu operator." });
      }

      const updatedAdmins = admins.filter(a => a.id !== id);
      if (updatedAdmins.length === admins.length) {
        return res.status(404).json({ success: false, error: "Operator tidak ditemukan." });
      }

      await saveAdmins(updatedAdmins);
      res.json({ success: true, message: "Operator berhasil dihapus secara permanen." });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // API: Admin Authenticate (Login)
  app.post("/api/admins/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ success: false, error: "Username dan kata sandi wajib diisi." });
      }

      const cleanUsername = username.trim().toLowerCase();
      const cleanPassword = password.trim();

      const admins = await loadAdmins();
      
      const matchedAdmin = admins.find(a => {
        if (a.username.toLowerCase() === cleanUsername) {
          // If the admin username is 'admin', we also support the legacy passwords 'admin' or 'admin123' to keep backward compatibility
          if (cleanUsername === "admin") {
            return a.password === cleanPassword || cleanPassword === "admin" || cleanPassword === "admin123";
          }
          return a.password === cleanPassword;
        }
        return false;
      });

      if (!matchedAdmin) {
        return res.status(401).json({ success: false, error: "Username atau kata sandi yang Anda masukkan salah." });
      }

      const { password: _, ...safeAdmin } = matchedAdmin;
      res.json({ success: true, admin: safeAdmin });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Vite development vs production middleware setup
  if (process.env.NODE_ENV !== "production") {
    console.log("Loading Vite Dev Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving static production build from /dist...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server successfully started and listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});

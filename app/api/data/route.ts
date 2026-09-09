import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

const DB_FILE = path.join(process.cwd(), 'ftmp_db.json');

const DEFAULT_SCRIPTS = [
  {
    id: 'sc-1',
    judul: 'Ayahku Pulang',
    pengarang: 'Usmar Ismail',
    sinopsis: 'Drama keluarga yang mengisahkan kembalinya seorang ayah setelah bertahun-tahun meninggalkan keluarganya, tepat pada saat hari raya raya, membawa konflik batin di antara anak-anaknya.',
    fileUrl: 'https://docs.google.com/document/d/150X7LzXp2m-n_K5qX5I2mS_U1X0Lp_T_demo1/edit?usp=sharing',
    size: '1.2 MB'
  },
  {
    id: 'sc-2',
    judul: 'Bila Malam Bertambah Malam',
    pengarang: 'Putu Wijaya',
    sinopsis: 'Sebuah naskah drama psikologis yang menyoroti konflik kasta, cinta, dan kehormatan di Bali, menggambarkan pertentangan emosi yang mendalam antara kaum bangsawan dan rakyat jelata.',
    fileUrl: 'https://docs.google.com/document/d/150X7LzXp2m-n_K5qX5I2mS_U1X0Lp_T_demo2/edit?usp=sharing',
    size: '850 KB'
  },
  {
    id: 'sc-3',
    judul: 'RT Nol RW Nol',
    pengarang: 'Iwan Simatupang',
    sinopsis: 'Naskah absurd yang menceritakan kehidupan kaum gelandangan di bawah kolong jembatan, menggambarkan potret kemanusiaan, mimpi-mimpi sederhana, serta kritik sosial yang mendalam.',
    fileUrl: 'https://docs.google.com/document/d/150X7LzXp2m-n_K5qX5I2mS_U1X0Lp_T_demo3/edit?usp=sharing',
    size: '1.5 MB'
  }
];

interface DBState {
  accounts: any[];
  sanggars: any[];
  peserta: any[];
  tickets: any[];
  appscriptUrl: string;
  scripts: any[];
  globalSettings?: any;
  ticketSettings?: any;
}

/**
 * In-memory Mutex Queue untuk serialisasi eksekusi tulis & baca-tulis file ftmp_db.json
 * Mencegah race condition ketika banyak user mengirim data secara bersamaan.
 */
class AsyncMutex {
  private queue: Promise<void> = Promise.resolve();

  async runExclusive<T>(fn: () => Promise<T> | T): Promise<T> {
    let release: () => void;
    const nextPromise = new Promise<void>((resolve) => {
      release = resolve;
    });
    const currentQueue = this.queue;
    this.queue = currentQueue.then(() => nextPromise);

    await currentQueue;
    try {
      return await fn();
    } finally {
      release!();
    }
  }
}

const dbMutex = new AsyncMutex();

/**
 * Normalisasi String: Case-insensitive (lowercase) dan trim
 */
function normStr(str: any): string {
  return String(str || '').trim().toLowerCase();
}

/**
 * Sanitasi NPSN: hanya karakter alfanumerik, titik, atau strip
 */
function sanitizeNpsn(npsn: any): string {
  return String(npsn || '').replace(/[^\w.-]/g, '').trim();
}

function parseDownloadImages(raw: any): any[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.filter(item => typeof item === 'object' && item !== null);
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed.filter(item => typeof item === 'object' && item !== null);
      if (typeof parsed === 'object' && parsed !== null) return [parsed];
    } catch {}
    // Parse Google Apps Script string format: {id=img-1, url=..., title=...}
    const matches = trimmed.match(/\{([^}]+)\}/g);
    if (matches && matches.length > 0) {
      return matches.map((m, i) => {
        const idMatch = m.match(/id=([^,}]+)/);
        const titleMatch = m.match(/title=([^,}]+)/);
        const urlMatch = m.match(/url=([^,}]+)/);
        return {
          id: idMatch ? idMatch[1].trim() : `img-${i + 1}`,
          title: titleMatch ? titleMatch[1].trim() : '',
          url: urlMatch ? urlMatch[1].trim() : ''
        };
      }).filter(item => item.url || item.title);
    }
  }
  return [];
}

function getDB(): DBState {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      const parsed = JSON.parse(data);
      if (!parsed.accounts) parsed.accounts = [];
      if (!parsed.sanggars) parsed.sanggars = [];
      if (!parsed.peserta) parsed.peserta = [];
      if (!parsed.tickets) parsed.tickets = [];
      if (!parsed.ticketSettings) parsed.ticketSettings = {
        sessions: [
          { id: 'sess-1', date: '2026-11-09', time: '19:00', title: 'Malam Pembukaan & Pementasan 1', available: true },
          { id: 'sess-2', date: '2026-11-10', time: '16:00', title: 'Sesi Sore 1', available: true },
          { id: 'sess-3', date: '2026-11-10', time: '19:30', title: 'Sesi Malam 1', available: true },
        ],
        price: '25000',
        seatRows: [
          { rowName: 'A (VIP)', seatCount: 15 },
          { rowName: 'B', seatCount: 20 },
          { rowName: 'C', seatCount: 25 },
          { rowName: 'D', seatCount: 25 },
        ],
        paymentMethods: [
          { id: 'pay-1', bankName: 'BRI', accountNumber: '3495-01-046321-533', accountName: 'Teater Putih' },
          { id: 'pay-2', bankName: 'DANA/OVO/GoPay', accountNumber: '081234567890', accountName: 'Bendahara FTMP' }
        ]
      };
      
      const envAppScriptUrl = process.env.APPS_SCRIPT_URL?.trim();
      if (envAppScriptUrl && envAppScriptUrl !== '') {
        parsed.appscriptUrl = envAppScriptUrl;
      } else if (!parsed.appscriptUrl) {
        parsed.appscriptUrl = 'https://script.google.com/macros/s/AKfycbwfLmr5wD5whowru67yJ51ePa2Wz7FCNos87QRAv-2ne2bnahpwAAHJAOZGxhrbc0Iccw/exec';
      }

      if (!parsed.scripts) parsed.scripts = DEFAULT_SCRIPTS;
      if (!parsed.globalSettings) parsed.globalSettings = {};
      const defaultSettings = {
        appLogo: '/ftmp.png',
        heroTitle: 'Festival Teater Modern Pelajar',
        heroDesc: 'Daftarkan kelompok teater dari sekolahmu dan berlagalah pada panggung bergengsi FTMP XXVI. Tunjukkan tajimu, menangkan Piala Bergilir!',
        juknisUrl: '#',
        pelaksanaanTanggal: '9 s.d. 20 November 2026',
        pelaksanaanTempat: 'Arena Terbuka Taman Budaya Provinsi Nusa Tenggara Barat',
        biayaRegistrasi: 'Rp350.000',
        rekeningNomor: '3495-01-046321-533',
        rekeningNama: 'Teater Putih',
        kontak1Nama: 'Liza Hafsa',
        kontak1Hp: '081906901245',
        kontak2Nama: 'Bq Dinda Puspita Rinjani',
        kontak2Hp: '087855375689',
        kontakTiketNama: 'Admin Tiketing FTMP',
        kontakTiketHp: '081906901245',
        downloadImageUrl: 'https://picsum.photos/seed/ftmp/800/1200',
        downloadImageTitle: 'Poster Resmi FTMP XXVI',
        downloadImages: [
          { id: 'img-1', title: 'Poster Resmi FTMP XXVI', url: 'https://picsum.photos/seed/ftmp/800/1200' },
          { id: 'img-2', title: 'Pamflet Ketentuan Peserta', url: 'https://picsum.photos/seed/teater/800/1200' }
        ],
        petunjuk1Title: 'Batas SARA & Pornografi',
        petunjuk1Desc: 'Naskah dan pementasan murni seni kreatif, tidak boleh mengandung SARA, pornografi, maupun pornoaksi.',
        petunjuk2Title: 'Konstruksi & Bentuk Realis',
        petunjuk2Desc: 'Naskah drama harus memiliki konstruksi dramatik yang kuat serta disajikan dalam bentuk pementasan realis.',
        petunjuk3Title: 'Durasi Pertunjukan',
        petunjuk3Desc: 'Setiap kelompok/sanggar teater diberikan waktu mentas maksimal 45 menit lengkap.',
        petunjuk4Title: 'Komposisi Tim',
        petunjuk4Desc: 'Siswa aktif di NTB. Panitia menyediakan ID Card untuk 20 peserta dan Tim + 1 Pelatih + 1 Pembina + 1 Sutradara + 1 Pubdok + 1 Stage Manager.'
      };
      parsed.globalSettings = { ...defaultSettings, ...parsed.globalSettings };
      const parsedImages = parseDownloadImages(parsed.globalSettings.downloadImages);
      parsed.globalSettings.downloadImages = parsedImages.length > 0 ? parsedImages : defaultSettings.downloadImages;
      return parsed;
    }
  } catch (error) {
    console.error('Error reading DB:', error);
  }
  const defaultAppScriptUrl = process.env.APPS_SCRIPT_URL?.trim() || 'https://script.google.com/macros/s/AKfycbwfLmr5wD5whowru67yJ51ePa2Wz7FCNos87QRAv-2ne2bnahpwAAHJAOZGxhrbc0Iccw/exec';
  return {
    accounts: [],
    sanggars: [],
    peserta: [],
    tickets: [],
    ticketSettings: {
      sessions: [
        { id: 'sess-1', date: '2026-11-09', time: '19:00', title: 'Malam Pembukaan & Pementasan 1', available: true },
        { id: 'sess-2', date: '2026-11-10', time: '16:00', title: 'Sesi Sore 1', available: true },
        { id: 'sess-3', date: '2026-11-10', time: '19:30', title: 'Sesi Malam 1', available: true },
      ],
      price: '25000',
      seatRows: [
        { rowName: 'A (VIP)', seatCount: 15 },
        { rowName: 'B', seatCount: 20 },
        { rowName: 'C', seatCount: 25 },
        { rowName: 'D', seatCount: 25 },
      ],
      paymentMethods: [
        { id: 'pay-1', bankName: 'BRI', accountNumber: '3495-01-046321-533', accountName: 'Teater Putih' },
        { id: 'pay-2', bankName: 'DANA/OVO/GoPay', accountNumber: '081234567890', accountName: 'Bendahara FTMP' }
      ]
    },
    appscriptUrl: defaultAppScriptUrl,
    scripts: DEFAULT_SCRIPTS,
    globalSettings: {
      appLogo: '/ftmp.png',
      heroTitle: 'Festival Teater Modern Pelajar',
      heroDesc: 'Daftarkan kelompok teater dari sekolahmu dan berlagalah pada panggung bergengsi FTMP XXVI. Tunjukkan tajimu, menangkan Piala Bergilir!',
      juknisUrl: '#',
      pelaksanaanTanggal: '9 s.d. 20 November 2026',
      pelaksanaanTempat: 'Arena Terbuka Taman Budaya Provinsi Nusa Tenggara Barat',
      biayaRegistrasi: 'Rp350.000',
      rekeningNomor: '3495-01-046321-533',
      rekeningNama: 'Teater Putih',
      kontak1Nama: 'Liza Hafsa',
      kontak1Hp: '081906901245',
      kontak2Nama: 'Bq Dinda Puspita Rinjani',
      kontak2Hp: '087855375689',
      kontakTiketNama: 'Admin Tiketing FTMP',
      kontakTiketHp: '081906901245',
      downloadImageUrl: 'https://picsum.photos/seed/ftmp/800/1200',
      downloadImageTitle: 'Poster Resmi FTMP XXVI',
      downloadImages: [
        { id: 'img-1', title: 'Poster Resmi FTMP XXVI', url: 'https://picsum.photos/seed/ftmp/800/1200' },
        { id: 'img-2', title: 'Pamflet Ketentuan Peserta', url: 'https://picsum.photos/seed/teater/800/1200' }
      ],
      petunjuk1Title: 'Batas SARA & Pornografi',
      petunjuk1Desc: 'Naskah dan pementasan murni seni kreatif, tidak boleh mengandung SARA, pornografi, maupun pornoaksi.',
      petunjuk2Title: 'Konstruksi & Bentuk Realis',
      petunjuk2Desc: 'Naskah drama harus memiliki konstruksi dramatik yang kuat serta disajikan dalam bentuk pementasan realis.',
      petunjuk3Title: 'Durasi Pertunjukan',
      petunjuk3Desc: 'Setiap kelompok/sanggar teater diberikan waktu mentas maksimal 45 menit lengkap.',
      petunjuk4Title: 'Komposisi Tim',
      petunjuk4Desc: 'Siswa aktif di NTB. Panitia menyediakan ID Card untuk 20 peserta dan Tim + 1 Pelatih + 1 Pembina + 1 Sutradara + 1 Pubdok + 1 Stage Manager.'
    }
  };
}

/**
 * Penyimpanan Atomik: Menulis ke file sementara terlebih dahulu, kemudian me-rename secara atomik.
 * Mencegah file corrupt jika server di-restart atau ada proses lain saat penulisan berlangsung.
 */
function saveDB(state: DBState) {
  try {
    const tempFile = `${DB_FILE}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(state, null, 2), 'utf8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (error) {
    console.error('Error writing DB atomically, falling back to direct write:', error);
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf8');
    } catch (directErr) {
      console.error('Fatal error writing DB:', directErr);
    }
  }
}

export async function GET(req: NextRequest) {
  const db = getDB();
  const searchParams = req.nextUrl.searchParams;
  const action = searchParams.get('action');
  
  if (action === 'search_ticket') {
    const rawId = searchParams.get('id');
    const cleanId = rawId ? rawId.trim().toLowerCase() : '';
    
    // 1. Search locally in db.tickets with case-insensitive and trimmed match
    let ticket = db.tickets?.find(t => t.id && t.id.trim().toLowerCase() === cleanId);

    // 2. If not found locally and appscriptUrl is available, trigger an on-demand sync from Google Sheets
    if (!ticket && db.appscriptUrl) {
      try {
        const res = await fetch(db.appscriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'get_all_data' })
        });
        if (res.ok) {
          const result = await res.json();
          if (result.success && result.data && result.data.tickets) {
            const fetchedTickets = (result.data.tickets || []).map((t: any) => ({
              id: t.ID_Tiket || t.id || '',
              namaPemesan: t.Nama_Pemesan || t.namaPemesan || '',
              email: t.Email || t.email || '',
              noHp: t.No_HP || t.noHp || '',
              jumlah: Number(t.Jumlah_Tiket || t.jumlah) || 1,
              kategori: t.Kategori || t.kategori || 'Reguler',
              tanggalPementasan: t.Tanggal_Pementasan || t.tanggalPementasan || '',
              kursi: typeof t.Daftar_Kursi === 'string' ? t.Daftar_Kursi.split(', ') : (Array.isArray(t.kursi) ? t.kursi : []),
              status: t.Status_Pembayaran || t.status || 'Unpaid',
              tanggalPesan: t.Waktu_Booking || t.tanggalPesan || '',
              buktiPembayaran: t.Bukti_Pembayaran || t.buktiPembayaran || ''
            }));

            db.tickets = fetchedTickets;
            saveDB(db);

            // Re-search ticket
            ticket = db.tickets?.find(t => t.id && t.id.trim().toLowerCase() === cleanId);
          }
        }
      } catch (err) {
        console.warn('Auto-sync failed during ticket search:', err);
      }
    }

    if (ticket) return NextResponse.json({ success: true, booking: ticket });
    return NextResponse.json({ error: `Tiket #${rawId || ''} tidak ditemukan. Pastikan ID Tiket sudah sesuai.` }, { status: 404 });
  }

  // Ambil parameter sync dari query string. Hanya lakukan tarik data Google Sheets jika sync=true (On-Demand)
  const sync = searchParams.get('sync') === 'true';

  if (db.appscriptUrl && sync) {
    await dbMutex.runExclusive(async () => {
      try {
        const res = await fetch(db.appscriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'get_all_data' })
        });
        if (res.ok) {
          const result = await res.json();
          if (result.success && result.data) {
            // Map google sheets formats ke local format agar serasi
            const fetchedAccounts = (result.data.accounts || []).map((acc: any) => ({
              username: normStr(acc.Username || ''),
              password: acc.Password || '',
              npsn: sanitizeNpsn(acc.NPSN || acc.npsn || ''),
              namaSekolah: acc.Nama_Sekolah || '',
              namaSanggar: acc.Nama_Sanggar || '',
              kontakPembina: acc.Kontak_Pembina || '',
              email: acc.Email || '',
              status: acc.Status_Verifikasi || 'Draft',
              catatan: acc.Catatan_Verifikasi || '',
              waktuDaftar: acc.Waktu_Pendaftaran || ''
            }));

            const fetchedSanggars = (result.data.sanggars || []).map((s: any) => ({
              username: normStr(s.Username || ''),
              namaSekolah: s.Nama_Sekolah || '',
              namaSanggar: s.Nama_Sanggar || '',
              kontakPembina: s.Kontak_Pembina || '',
              email: s.Email || '',
              naskahFile: s.Naskah_File_URL || '',
              plotLampu: s.Plot_Lampu_URL || '',
              poster: s.Poster_URL || '',
              artistik: s.Desain_Artistik_URL || '',
              sinopsis: s.Sinopsis_URL || '',
              profilSanggar: s.Profil_Sanggar_URL || '',
              buktiPembayaran: s.Bukti_Pembayaran_URL || '',
              waktuUpdate: s.Waktu_Update || ''
            }));

            const fetchedPeserta = (result.data.peserta || []).map((p: any) => ({
              username: normStr(p.Username || ''),
              id: p.ID_Peserta || '',
              nama: p.Nama_Sesuai_Ijazah || '',
              peran: p.Peran_Kategori || '',
              namaTokoh: p.Nama_Tokoh || '',
              jenisKelamin: p.Jenis_Kelamin || '',
              penyakitBawaan: p.Penyakit_Bawaan || '',
              fotoFile: p.Foto_3x4_URL || '',
              waktuUpdate: p.Waktu_Update || ''
            }));

            const fetchedTickets = (result.data.tickets || []).map((t: any) => ({
              id: t.ID_Tiket || '',
              namaPemesan: t.Nama_Pemesan || '',
              email: t.Email || '',
              noHp: t.No_HP || '',
              jumlah: Number(t.Jumlah_Tiket) || 1,
              kategori: t.Kategori || 'Reguler',
              tanggalPementasan: t.Tanggal_Pementasan || '',
              kursi: t.Daftar_Kursi ? t.Daftar_Kursi.split(', ') : [],
              status: t.Status_Pembayaran || 'Unpaid',
              tanggalPesan: t.Waktu_Booking || '',
              buktiPembayaran: t.Bukti_Pembayaran || ''
            }));

            // Parse scripts from Spreadsheet
            if (result.data.scripts && result.data.scripts.length > 0) {
              db.scripts = result.data.scripts.map((s: any) => ({
                id: s.ID_Script || s.id || '',
                judul: s.Judul || '',
                pengarang: s.Pengarang || s.Penulis || '',
                sinopsis: s.Sinopsis || '',
                fileUrl: s.File_URL || s.fileUrl || '',
                size: s.Ukuran || s.size || ''
              }));
            }

            // Parse settings from Spreadsheet
            if (result.data.settings && result.data.settings.length > 0) {
              const settingsMap: any = {};
              result.data.settings.forEach((item: any) => {
                if (item.Key) {
                  settingsMap[item.Key] = item.Value !== undefined ? item.Value : '';
                }
              });
              db.globalSettings = { ...db.globalSettings, ...settingsMap };
              if (db.globalSettings.downloadImages !== undefined) {
                db.globalSettings.downloadImages = parseDownloadImages(db.globalSettings.downloadImages);
              }
            }

            if (result.data.ticketSettings) {
              db.ticketSettings = result.data.ticketSettings;
            }

            // Google Sheets adalah Sumber Kebenaran Utama (Source of Truth).
            // Ketika sinkronisasi online berhasil, perbarui local cache seutuhnya agar sinkron sempurna dengan lembar kerja.
            db.accounts = fetchedAccounts;
            db.sanggars = fetchedSanggars;
            db.peserta = fetchedPeserta;
            db.tickets = fetchedTickets;
            saveDB(db);
          }
        }
      } catch (err) {
        console.warn('Apps Script fetch failed, using cached ftmp_db.json cache:', err);
      }
    });
  }

  return NextResponse.json(db);
}

export async function POST(req: NextRequest) {
  return await dbMutex.runExclusive(async () => {
    try {
      const body = await req.json();
      const { action, payload } = body;
      const db = getDB();

      // 1. Simpan/Ubah URL Apps Script
      if (action === 'update_appscript_url') {
        db.appscriptUrl = payload.url || '';
        saveDB(db);
        return NextResponse.json({ success: true, appscriptUrl: db.appscriptUrl });
      }

      // 2. Setup Sheets otomatis di Google Sheets
      if (action === 'setup_sheets') {
        if (!db.appscriptUrl) {
          return NextResponse.json({ success: false, message: 'Harap pasang URL Apps Script terlebih dahulu!' });
        }
        try {
          const res = await fetch(db.appscriptUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'setup_sheets' })
          });
          const resJson = await res.json();
          return NextResponse.json(resJson);
        } catch (err: any) {
          return NextResponse.json({ success: false, error: err.toString() });
        }
      }

      // 3. Register Akun Pendaftar Baru
      if (action === 'register_account') {
        const { username, password, npsn, namaSekolah, namaSanggar, kontakPembina, email } = payload;
        const cleanUsername = normStr(username);
        const cleanNpsn = sanitizeNpsn(npsn);

        if (!cleanUsername) {
          return NextResponse.json({ success: false, message: 'Username tidak boleh kosong!' });
        }
        
        const exists = db.accounts.some(acc => normStr(acc.username) === cleanUsername);
        if (exists) {
          return NextResponse.json({ success: false, message: `Username '${username}' sudah terdaftar!` });
        }

        const npsnExists = cleanNpsn !== '' && db.accounts.some(acc => sanitizeNpsn(acc.npsn) === cleanNpsn);
        if (npsnExists) {
          return NextResponse.json({ success: false, message: `NPSN '${npsn}' sudah digunakan oleh pengguna lain.` });
        }

        const newAccount = {
          username: cleanUsername,
          password,
          npsn: cleanNpsn,
          namaSekolah: (namaSekolah || '').trim(),
          namaSanggar: (namaSanggar || '').trim(),
          kontakPembina: (kontakPembina || '').trim(),
          email: (email || '').trim(),
          status: 'Draft',
          catatan: '',
          waktuDaftar: new Date().toISOString()
        };

        db.accounts.push(newAccount);
        saveDB(db);

        // Jika ada AppScript, kirim ke sana
        let synced = true;
        if (db.appscriptUrl) {
          try {
            const res = await fetch(db.appscriptUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'register_account', data: newAccount })
            });
            if (!res.ok) synced = false;
          } catch (err) {
            console.error('Failed to sync registration account to Apps Script:', err);
            synced = false;
          }
        } else {
          synced = false;
        }

        return NextResponse.json({ 
          success: true, 
          synced, 
          message: synced 
            ? 'Akun berhasil terdaftar! Silakan login menggunakan akun tersebut.' 
            : 'Pendaftaran disimpan secara lokal karena adanya gangguan jaringan.'
        });
      }

      // 4. Update/Save Profil Sanggar & Unggahan Berkas
      if (action === 'save_sanggar_data') {
        const { username, namaSekolah, namaSanggar, kontakPembina, email } = payload;
        const cleanUsername = normStr(username);
        
        // Simpan di local sanggar list
        const idx = db.sanggars.findIndex(s => normStr(s.username) === cleanUsername);
        const sanggarData = {
          ...payload,
          username: cleanUsername,
          waktuUpdate: new Date().toISOString()
        };

        if (idx !== -1) {
          db.sanggars[idx] = sanggarData;
        } else {
          db.sanggars.push(sanggarData);
        }

        // Update di akun pendaftar jika profil disesuaikan
        const idxAcc = db.accounts.findIndex(acc => normStr(acc.username) === cleanUsername);
        if (idxAcc !== -1) {
          db.accounts[idxAcc].namaSekolah = namaSekolah || db.accounts[idxAcc].namaSekolah;
          db.accounts[idxAcc].namaSanggar = namaSanggar || db.accounts[idxAcc].namaSanggar;
          db.accounts[idxAcc].kontakPembina = kontakPembina || db.accounts[idxAcc].kontakPembina;
          db.accounts[idxAcc].email = email || db.accounts[idxAcc].email;
        }

        saveDB(db);

        let synced = true;
        if (db.appscriptUrl) {
          try {
            const res = await fetch(db.appscriptUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'save_sanggar_data', data: { ...payload, username: cleanUsername } })
            });
            const resJson = await res.json();
            if (resJson.success) {
              return NextResponse.json({ success: true, synced: true, message: resJson.message });
            }
            synced = false;
          } catch (err) {
            console.error('Failed to sync sanggar data to Apps Script:', err);
            synced = false;
          }
        } else {
          synced = false;
        }

        return NextResponse.json({ 
          success: true, 
          synced, 
          message: 'Profil & berkas berhasil disimpan secara lokal karena adanya gangguan jaringan.' 
        });
      }

      // 5. Simpan / Sinkronkan Peserta Sanggar
      if (action === 'sync_peserta') {
        const { username, peserta } = payload;
        const cleanUsername = normStr(username);

        // Hapus yang lama dari user ini di cache local secara presisi
        db.peserta = db.peserta.filter(p => normStr(p.username) !== cleanUsername);
        // Tambah yang baru
        const formatedPeserta = (peserta || []).map((p: any) => ({
          ...p,
          username: cleanUsername,
          waktuUpdate: new Date().toISOString()
        }));

        db.peserta.push(...formatedPeserta);
        saveDB(db);

        let synced = true;
        if (db.appscriptUrl) {
          try {
            const res = await fetch(db.appscriptUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'sync_peserta', data: { ...payload, username: cleanUsername } })
            });
            const resJson = await res.json();
            if (resJson.success) {
              return NextResponse.json({ success: true, synced: true, message: resJson.message });
            }
            synced = false;
          } catch (err) {
            console.error('Error syncing peserta to Apps Script:', err);
            synced = false;
          }
        } else {
          synced = false;
        }

        return NextResponse.json({ 
          success: true, 
          synced, 
          message: 'Daftar peserta berhasil disimpan secara lokal karena adanya gangguan jaringan.' 
        });
      }

      // 6. Submit Bukti Pembayaran Pendaftar
      if (action === 'submit_bukti_pembayaran_pendaftar') {
        const { username, buktiBayarFile } = payload;
        const cleanUsername = normStr(username);

        // Update status di akun ke 'Pending' untuk review admin
        const idxAcc = db.accounts.findIndex(acc => normStr(acc.username) === cleanUsername);
        if (idxAcc !== -1) {
          db.accounts[idxAcc].status = 'Pending';
          db.accounts[idxAcc].catatan = '';
        }

        // Update bukti pembayaran di pendaftaran sanggar
        const idxS = db.sanggars.findIndex(s => normStr(s.username) === cleanUsername);
        if (idxS !== -1) {
          db.sanggars[idxS].buktiPembayaran = buktiBayarFile;
        }

        saveDB(db);

        let synced = true;
        if (db.appscriptUrl) {
          try {
            const res = await fetch(db.appscriptUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'submit_bukti_pembayaran_pendaftar', data: { ...payload, username: cleanUsername } })
            });
            const resJson = await res.json();
            if (resJson.success) {
              return NextResponse.json({ success: true, synced: true, message: resJson.message, url: resJson.url });
            }
            synced = false;
          } catch (err) {
            console.error('Failed to sync bukti bayar to Apps Script:', err);
            synced = false;
          }
        } else {
          synced = false;
        }

        return NextResponse.json({ 
          success: true, 
          synced, 
          url: buktiBayarFile, 
          message: 'Bukti pembayaran berhasil disimpan secara lokal karena adanya gangguan jaringan.' 
        });
      }

      // 7. Admin Action: Update Status Pendaftaran & Kirim Otomatis email ke Pembimbing
      if (action === 'update_status') {
        const { username, status, catatan, email } = payload;
        const cleanUsername = normStr(username);

        const idxAcc = db.accounts.findIndex(acc => normStr(acc.username) === cleanUsername);
        if (idxAcc !== -1) {
          db.accounts[idxAcc].status = status;
          db.accounts[idxAcc].catatan = catatan || '';
          saveDB(db);
        }

        if (db.appscriptUrl) {
          try {
            const res = await fetch(db.appscriptUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'update_status', data: { ...payload, username: cleanUsername } })
            });
            const resJson = await res.json();
            return NextResponse.json(resJson);
          } catch (err) {
            console.error('Failed to update status to Apps Script:', err);
          }
        }

        return NextResponse.json({ success: true, message: 'Status tersimpan lokal' });
      }

      // 8. Beli Tiket Baru
      if (action === 'new_ticket' || action === 'book_ticket') {
        const newBook = {
          id: 'TKT-' + Math.floor(1000 + Math.random() * 9000).toString(),
          namaPemesan: payload.namaPemesan || '',
          email: payload.email || '',
          noHp: payload.noHp || '',
          jumlah: Number(payload.jumlah) || 1,
          kategori: payload.kategori || 'Reguler',
          tanggalPementasan: payload.tanggalPementasan || '',
          kursi: payload.kursi || [],
          status: 'Unpaid', // requires payment and confirmation
          tanggalPesan: new Date().toISOString(),
          buktiPembayaran: ''
        };

        db.tickets.unshift(newBook);
        saveDB(db);

        let synced = true;
        if (db.appscriptUrl) {
          try {
            const res = await fetch(db.appscriptUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'new_ticket', data: newBook })
            });
            if (!res.ok) synced = false;
          } catch (err) {
            console.error('Failed to sync ticket to Apps Script:', err);
            synced = false;
          }
        } else {
          synced = false;
        }

        return NextResponse.json({ 
          success: true, 
          synced, 
          booking: newBook, 
          message: synced 
            ? 'Pemesanan tiket berhasil disinkronisasi.' 
            : 'Pemesanan tiket berhasil disimpan secara lokal karena adanya gangguan jaringan.' 
        });
      }

      // 8a. Upload Bukti Pembayaran Tiket
      if (action === 'upload_ticket_payment') {
        const cleanTicketId = normStr(payload.ticketId);
        const idx = db.tickets.findIndex(t => normStr(t.id) === cleanTicketId);
        if (idx !== -1) {
          db.tickets[idx].buktiPembayaran = payload.buktiPembayaran;
          db.tickets[idx].status = 'Pending Verifikasi';
          saveDB(db);

          let synced = true;
          if (db.appscriptUrl) {
            try {
              const res = await fetch(db.appscriptUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'upload_ticket_payment', data: { ticketId: db.tickets[idx].id, buktiPembayaran: payload.buktiPembayaran } })
              });
              if (!res.ok) synced = false;
            } catch (err) {
              synced = false;
            }
          } else {
            synced = false;
          }
          return NextResponse.json({ 
            success: true, 
            synced, 
            booking: db.tickets[idx], 
            message: synced 
              ? 'Bukti pembayaran tiket berhasil diunggah.' 
              : 'Bukti pembayaran tiket disimpan secara lokal karena adanya gangguan jaringan.'
          });
        }
        return NextResponse.json({ error: 'Tiket tidak ditemukan' }, { status: 404 });
      }

      // 9. Admin update status Pembayaran Tiket
      if (action === 'admin_update_ticket') {
        const { id, status } = payload;
        const cleanId = normStr(id);
        const idxT = db.tickets.findIndex(t => normStr(t.id) === cleanId);
        if (idxT !== -1) {
          db.tickets[idxT].status = status;
          saveDB(db);
        }

        let synced = true;
        if (db.appscriptUrl) {
          try {
            const res = await fetch(db.appscriptUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'admin_update_ticket', data: payload })
            });
            const resJson = await res.json();
            return NextResponse.json({ ...resJson, synced: true });
          } catch (err) {
            console.error('Failed to update ticket status on Apps Script:', err);
            synced = false;
          }
        } else {
          synced = false;
        }

        return NextResponse.json({ 
          success: true, 
          synced, 
          message: 'Status tiket berhasil diperbarui secara lokal karena adanya gangguan jaringan.' 
        });
      }

      // 10. Admin Update Settings
      if (action === 'admin_update_settings') {
        const cleanedPayload = { ...payload };
        if (cleanedPayload.downloadImages !== undefined) {
          cleanedPayload.downloadImages = parseDownloadImages(cleanedPayload.downloadImages);
        }
        db.globalSettings = { ...db.globalSettings, ...cleanedPayload };
        saveDB(db);
        
        if (db.appscriptUrl) {
          try {
            const dataToSync = {
              ...db.globalSettings,
              downloadImages: JSON.stringify(db.globalSettings.downloadImages || [])
            };
            await fetch(db.appscriptUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'save_global_settings', data: dataToSync })
            });
          } catch (err) {
            console.error('Failed to sync settings:', err);
          }
        }
        
        return NextResponse.json({ success: true, message: 'Pengaturan berhasil diperbarui' });
      }

      // 11. Manage scripts
      if (action === 'manage_scripts') {
        db.scripts = payload.scripts || [];
        saveDB(db);
        
        if (db.appscriptUrl) {
          try {
            await fetch(db.appscriptUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'manage_scripts', data: { scripts: db.scripts } })
            });
          } catch (err) {
            console.error('Failed to sync scripts:', err);
          }
        }
        
        return NextResponse.json({ success: true, scripts: db.scripts });
      }

      // 12. Manage ticket settings
      if (action === 'manage_ticket_settings') {
        db.ticketSettings = payload.ticketSettings || {};
        saveDB(db);
        
        if (db.appscriptUrl) {
          try {
            await fetch(db.appscriptUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'manage_ticket_settings', data: { ticketSettings: db.ticketSettings } })
            });
          } catch (err) {
            console.error('Failed to sync ticket settings:', err);
          }
        }
        
        return NextResponse.json({ success: true, ticketSettings: db.ticketSettings });
      }

      return NextResponse.json({ error: 'Aksi tidak diketahui' }, { status: 400 });

    } catch (error: any) {
      return NextResponse.json({ error: error.message || 'Internal Error' }, { status: 500 });
    }
  });
}

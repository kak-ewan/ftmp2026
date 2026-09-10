/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building, BookOpen, UserCheck, Key, LogIn, LogOut, Plus, Trash2, Edit2, 
  CheckCircle2, AlertTriangle, RefreshCw, FileText, Users, CreditCard, Lock, 
  Unlock, Upload, Info, HelpCircle, Mail, Phone, ShieldAlert, Check, ChevronRight,
  Database, Ticket
} from 'lucide-react';

interface Participant {
  id: string;
  nama: string;
  peran: string;
  namaTokoh?: string;
  jenisKelamin: 'Laki-laki' | 'Perempuan';
  penyakitBawaan?: string;
  fotoFile: string; // Base64 or URL
  kartuPelajarFile?: string; // Base64 or URL for ijazah/kartu pelajar
}

interface RegistrationSectionProps {
  onRegisterSuccess?: () => void;
  sessionUser?: any;
  setSessionUser?: (user: any) => void;
  settings?: any;
  onRefresh?: () => void;
}

const normalizeDownloadImages = (raw: any): any[] => {
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
};

export default function RegistrationSection({ onRegisterSuccess, sessionUser, setSessionUser, settings, onRefresh }: RegistrationSectionProps) {
  // Authentication states
  const [currentUser, setCurrentUser] = useState<any>(sessionUser || null); // { username: string, isAdmin: boolean, profile: any }
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    setCurrentUser(sessionUser);
  }, [sessionUser]);

  // Multi-platform sync session logic
  const handleSetCurrentUser = (val: any) => {
    if (typeof val === 'function') {
      setCurrentUser((prev: any) => {
        const nextUser = val(prev);
        if (setSessionUser) {
          setTimeout(() => setSessionUser(nextUser), 0);
        }
        return nextUser;
      });
    } else {
      setCurrentUser(val);
      if (setSessionUser) {
        setSessionUser(val);
      }
    }
  };

  const [editingPeserta, setEditingPeserta] = useState<Participant | null>(null);
  const [pesertaIdToDelete, setPesertaIdToDelete] = useState<string | null>(null);
  
  // Login form status
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    username: '',
    password: '',
    npsn: '',
    namaSekolah: '',
    namaSanggar: '',
    kontakPembina: '',
    email: ''
  });

  // DB Sync states
  const [allAccounts, setAllAccounts] = useState<any[]>([]);
  const [allSanggars, setAllSanggars] = useState<any[]>([]);
  const [allPeserta, setAllPeserta] = useState<any[]>([]);
  const [allTickets, setAllTickets] = useState<any[]>([]);
  const [appscriptUrl, setAppscriptUrl] = useState('');
  const [downloadableScripts, setDownloadableScripts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Active Pendaftar tab: 'sekolah' | 'peserta' | 'bayar'
  const [pendaftarTab, setRawPendaftarTab] = useState<'sekolah' | 'peserta' | 'bayar'>('sekolah');

  const setPendaftarTab = (tab: 'sekolah' | 'peserta' | 'bayar' | ((prev: 'sekolah' | 'peserta' | 'bayar') => 'sekolah' | 'peserta' | 'bayar')) => {
    if (typeof tab === 'function') {
      setRawPendaftarTab((prev) => {
        const next = tab(prev);
        if (typeof window !== 'undefined') {
          localStorage.setItem('ftmp_pendaftar_tab', next);
        }
        return next;
      });
    } else {
      setRawPendaftarTab(tab);
      if (typeof window !== 'undefined') {
        localStorage.setItem('ftmp_pendaftar_tab', tab);
      }
    }
  };

  // School profile form (current logged in user)
  const [schoolForm, setSchoolForm] = useState({
    npsn: '',
    namaSekolah: '',
    namaSanggar: '',
    kontakPembina: '',
    email: '',
    naskahFile: '',
    plotLampu: '',
    poster: '',
    artistik: '',
    sinopsis: '',
    profilSanggar: '',
    buktiPembayaran: ''
  });

  // Dynamic file upload labels/filenames
  const [uploadedNames, setUploadedNames] = useState<Record<string, string>>({});

  // Dynamic participant list
  const [pesertaList, setPesertaList] = useState<Participant[]>([]);
  const [showAddPesertaModal, setShowAddPesertaModal] = useState(false);
  const [newPesertaForm, setNewPesertaForm] = useState({
    id: '',
    nama: '',
    peran: 'Aktor Utama',
    namaTokoh: '',
    jenisKelamin: 'Laki-laki' as 'Laki-laki' | 'Perempuan',
    penyakitBawaan: '',
    fotoFile: '',
    kartuPelajarFile: ''
  });
  const [pesertaPhotoName, setPesertaPhotoName] = useState('');
  const [pesertaKartuName, setPesertaKartuName] = useState('');

  // Admin operational states
  const [adminSelectedSanggar, setAdminSelectedSanggar] = useState<any>(null);
  const [adminActionStatus, setAdminActionStatus] = useState({ status: 'Disetujui', catatan: '' });
  const [adminTab, setRawAdminTab] = useState<'peserta' | 'settings' | 'ticketing'>('peserta');

  const setAdminTab = (tab: 'peserta' | 'settings' | 'ticketing' | ((prev: 'peserta' | 'settings' | 'ticketing') => 'peserta' | 'settings' | 'ticketing')) => {
    if (typeof tab === 'function') {
      setRawAdminTab((prev) => {
        const next = tab(prev);
        if (typeof window !== 'undefined') {
          localStorage.setItem('ftmp_admin_tab', next);
        }
        return next;
      });
    } else {
      setRawAdminTab(tab);
      if (typeof window !== 'undefined') {
        localStorage.setItem('ftmp_admin_tab', tab);
      }
    }
  };
  
  // Quick hack state for settings editing to match the layout
  const [settingsForm, setSettingsForm] = useState<any>({
    heroTitle: '', heroDesc: '', juknisUrl: '', pelaksanaanTanggal: '', pelaksanaanTempat: '',
    biayaRegistrasi: '', rekeningNomor: '', rekeningNama: '', kontak1Nama: '', kontak1Hp: '', kontak2Nama: '', kontak2Hp: '',
    kontakTiketNama: '', kontakTiketHp: '',
    downloadImageUrl: '', downloadImageTitle: '', downloadImages: [],
    appLogo: '',
    petunjuk1Title: '', petunjuk1Desc: '',
    petunjuk2Title: '', petunjuk2Desc: '',
    petunjuk3Title: '', petunjuk3Desc: '',
    petunjuk4Title: '', petunjuk4Desc: ''
  });

  const [ticketSettingsForm, setTicketSettingsForm] = useState<any>({
    sessions: [],
    price: '',
    seatRows: [],
    paymentMethods: []
  });
  
  const [adminScripts, setAdminScripts] = useState<any[]>([]);

  // Messages
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'err' | 'warning'; text: string } | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Fetch full dataset
  const fetchDataset = async (forceSync = false) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/data${forceSync ? '?sync=true' : ''}`);
      if (res.ok) {
        const db = await res.json();
        setAllAccounts(db.accounts || []);
        setAllSanggars(db.sanggars || []);
        setAllPeserta(db.peserta || []);
        setAllTickets(db.tickets || []);
        setAppscriptUrl(db.appscriptUrl || '');
        setDownloadableScripts(db.scripts || []);
        setAdminScripts(db.scripts || []);
        if (db.globalSettings) {
          setSettingsForm({
            ...db.globalSettings,
            downloadImages: normalizeDownloadImages(db.globalSettings.downloadImages)
          });
        }
        if (db.ticketSettings) setTicketSettingsForm(db.ticketSettings);

        // Sync local current user's profile if logged in
        if (currentUser && !currentUser.isAdmin) {
          const normCurrent = String(currentUser.username || '').trim().toLowerCase();
          const userAcc = (db.accounts || []).find((acc: any) => String(acc.username || '').trim().toLowerCase() === normCurrent);
          const userSanggar = (db.sanggars || []).find((s: any) => String(s.username || '').trim().toLowerCase() === normCurrent);
          const userPeserta = (db.peserta || []).filter((p: any) => String(p.username || '').trim().toLowerCase() === normCurrent);

          if (userAcc) {
            handleSetCurrentUser((prev: any) => ({
              ...prev,
              profile: userAcc
            }));

            // Prefill forms
            setSchoolForm({
              npsn: userSanggar?.npsn || userAcc.npsn || '',
              namaSekolah: userSanggar?.namaSekolah || userAcc.namaSekolah || '',
              namaSanggar: userSanggar?.namaSanggar || userAcc.namaSanggar || '',
              kontakPembina: userSanggar?.kontakPembina || userAcc.kontakPembina || '',
              email: userSanggar?.email || userAcc.email || '',
              naskahFile: userSanggar?.naskahFile || '',
              plotLampu: userSanggar?.plotLampu || '',
              poster: userSanggar?.poster || '',
              artistik: userSanggar?.artistik || '',
              sinopsis: userSanggar?.sinopsis || '',
              profilSanggar: userSanggar?.profilSanggar || '',
              buktiPembayaran: userSanggar?.buktiPembayaran || ''
            });

            setPesertaList(userPeserta);
          }
        }
      }
    } catch (err) {
      console.error('Failed to sync dataset:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPendaftar = localStorage.getItem('ftmp_pendaftar_tab');
      if (savedPendaftar === 'sekolah' || savedPendaftar === 'peserta' || savedPendaftar === 'bayar') {
        setRawPendaftarTab(savedPendaftar);
      }
      const savedAdmin = localStorage.getItem('ftmp_admin_tab');
      if (savedAdmin === 'peserta' || savedAdmin === 'settings' || savedAdmin === 'ticketing') {
        setRawAdminTab(savedAdmin);
      }
    }
    fetchDataset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (settings) {
      if (settings.globalSettings) {
        setSettingsForm({
          ...settings.globalSettings,
          downloadImages: normalizeDownloadImages(settings.globalSettings.downloadImages)
        });
      }
      if (settings.ticketSettings) setTicketSettingsForm(settings.ticketSettings);
    }
  }, [settings]);

  // Utility to show temporary notification bubble
  const showNotification = (type: 'success' | 'err' | 'warning', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => {
      setStatusMessage(null);
    }, 7000);
  };

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const username = loginForm.username.trim().toLowerCase();
    const password = loginForm.password;

    if (!username || !password) {
      showNotification('err', 'Mohon isi seluruh bidang login!');
      return;
    }

    setIsLoading(true);

    // Admin direct condition login
    if (username === 'ftmp26' && password === 'xxviftmp') {
      handleSetCurrentUser({
        username: 'ftmp26',
        isAdmin: true,
        profile: { namaSekolah: 'Panitia Pelaksana', namaSanggar: 'Teater Putih FKIP UNRAM' }
      });
      showNotification('success', '🔐 Login Berhasil sebagai Administrator! Menyelaraskan seluruh data...');
      fetchDataset(true);
      return;
    }

    try {
      // Selalu selaraskan akun dari Google Sheets terlebih dahulu sebelum memverifikasi login
      const res = await fetch('/api/data?sync=true');
      if (res.ok) {
        const db = await res.json();
        
        // Perbarui seluruh state agar sinkron dengan data terbaru dari Google Sheets
        setAllAccounts(db.accounts || []);
        setAllSanggars(db.sanggars || []);
        setAllPeserta(db.peserta || []);
        setAllTickets(db.tickets || []);
        setAppscriptUrl(db.appscriptUrl || '');
        setDownloadableScripts(db.scripts || []);
        setAdminScripts(db.scripts || []);
        if (db.globalSettings) {
          setSettingsForm({
            ...db.globalSettings,
            downloadImages: normalizeDownloadImages(db.globalSettings.downloadImages)
          });
        }
        if (db.ticketSettings) setTicketSettingsForm(db.ticketSettings);

        // Gunakan list akun yang baru di-fetch (db.accounts) untuk otentikasi live
        const accountsToSearch = db.accounts || [];
        const passwordTrimmed = password.trim();
        const matchedAccount = accountsToSearch.find(
          (acc: any) => {
            const u = String(acc.username || '').trim().toLowerCase();
            const p = String(acc.password || '').trim();
            return u === username && p === passwordTrimmed;
          }
        );

        if (matchedAccount) {
          handleSetCurrentUser({
            username: matchedAccount.username,
            isAdmin: false,
            profile: matchedAccount
          });

          // Mengisi formulir dengan data terbaru
          const normU = String(matchedAccount.username || '').trim().toLowerCase();
          const sData = (db.sanggars || []).find((s: any) => String(s.username || '').trim().toLowerCase() === normU);
          const pData = (db.peserta || []).filter((p: any) => String(p.username || '').trim().toLowerCase() === normU);

          setSchoolForm({
            npsn: sData?.npsn || matchedAccount.npsn || '',
            namaSekolah: sData?.namaSekolah || matchedAccount.namaSekolah || '',
            namaSanggar: sData?.namaSanggar || matchedAccount.namaSanggar || '',
            kontakPembina: sData?.kontakPembina || matchedAccount.kontakPembina || '',
            email: sData?.email || matchedAccount.email || '',
            naskahFile: sData?.naskahFile || '',
            plotLampu: sData?.plotLampu || '',
            poster: sData?.poster || '',
            artistik: sData?.artistik || '',
            sinopsis: sData?.sinopsis || '',
            profilSanggar: sData?.profilSanggar || '',
            buktiPembayaran: sData?.buktiPembayaran || ''
          });

          setPesertaList(pData);
          showNotification('success', `🎭 Selamat Datang, Sanggar ${matchedAccount.namaSanggar || matchedAccount.username}! Data berhasil disinkronisasi dari Google Sheets.`);
        } else {
          showNotification('err', 'Username atau Password salah! Pastikan kredensial Anda sudah benar.');
        }
      } else {
        // Fallback ke pencarian lokal apabila Apps Script tidak merespon/error
        const passwordTrimmed = password.trim();
        const matchedAccount = allAccounts.find(
          acc => {
            const u = String(acc.username || '').trim().toLowerCase();
            const p = String(acc.password || '').trim();
            return u === username && p === passwordTrimmed;
          }
        );

        if (matchedAccount) {
          handleSetCurrentUser({
            username: matchedAccount.username,
            isAdmin: false,
            profile: matchedAccount
          });

          const normU = String(matchedAccount.username || '').trim().toLowerCase();
          const sData = allSanggars.find(s => String(s.username || '').trim().toLowerCase() === normU);
          const pData = allPeserta.filter(p => String(p.username || '').trim().toLowerCase() === normU);

          setSchoolForm({
            npsn: sData?.npsn || matchedAccount.npsn || '',
            namaSekolah: sData?.namaSekolah || matchedAccount.namaSekolah || '',
            namaSanggar: sData?.namaSanggar || matchedAccount.namaSanggar || '',
            kontakPembina: sData?.kontakPembina || matchedAccount.kontakPembina || '',
            email: sData?.email || matchedAccount.email || '',
            naskahFile: sData?.naskahFile || '',
            plotLampu: sData?.plotLampu || '',
            poster: sData?.poster || '',
            artistik: sData?.artistik || '',
            sinopsis: sData?.sinopsis || '',
            profilSanggar: sData?.profilSanggar || '',
            buktiPembayaran: sData?.buktiPembayaran || ''
          });

          setPesertaList(pData);
          showNotification('success', `🎭 Selamat Datang (Mode Offline), Sanggar ${matchedAccount.namaSanggar || matchedAccount.username}!`);
        } else {
          showNotification('err', 'Username atau Password salah! Gagal menyelaraskan dengan Google Sheets.');
        }
      }
    } catch (err) {
      console.error('Error verifying login credentials:', err);
      showNotification('err', 'Terjadi gangguan jaringan atau kesalahan server saat mencoba menyelaraskan data.');
    } finally {
      setIsLoading(false);
    }
  };

  // Register account handler
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const { username, password, npsn, namaSekolah, namaSanggar, kontakPembina, email } = registerForm;

    if (!username || !password || !npsn || !namaSekolah || !namaSanggar || !kontakPembina || !email) {
      showNotification('err', 'Mohon lengkapi seluruh kolom pendaftaran akun!');
      return;
    }

    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).+$/;
    if (!passwordRegex.test(password)) {
      showNotification('err', 'Kata sandi wajib menggunakan kombinasi huruf dan angka!');
      return;
    }

    if (username.toLowerCase() === 'ftmp26') {
      showNotification('err', 'Nama username "ftmp26" dilindungi. Gunakan nama pengguna sanggar Anda!');
      return;
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanNpsn = npsn.replace(/[^\w.-]/g, '').trim();

    setIsActionLoading(true);
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register_account',
          payload: {
            ...registerForm,
            username: cleanUsername,
            npsn: cleanNpsn
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        showNotification(data.synced === false ? 'warning' : 'success', data.message || '🎉 Akun berhasil terdaftar! Silakan login menggunakan akun tersebut.');
        // Set to login fields
        setLoginForm({ username: cleanUsername, password });
        setAuthMode('login');
        // Reset registration fields
        setRegisterForm({
          username: '',
          password: '',
          npsn: '',
          namaSekolah: '',
          namaSanggar: '',
          kontakPembina: '',
          email: ''
        });
        await fetchDataset();
      } else {
        showNotification('err', data.message || 'Gagal mendaftar akun.');
      }
    } catch (err: any) {
      showNotification('err', err.message || 'Terjadi masalah jaringan.');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Convert files helper
// Generate a safe file name based on NPSN and document name
  const getDriveFileName = (type: string, docName: string, ...extra: string[]) => {
    const npsn = currentUser?.npsn || 'NPSN';
    const parts = [npsn, docName, ...extra].filter(Boolean);
    const rawName = parts.join('_').replace(/[^a-zA-Z0-9_-]/g, '_');
    // Shorten if it's too long
    return rawName.length > 50 ? rawName.substring(0, 50) : rawName;
  };

  // Resolve Google Drive URLs into displayable thumbnails
  const resolveDriveImage = (url: string) => {
    if (url && url.includes('drive.google.com/file/d/')) {
      const match = url.match(/\/d\/(.*?)\//) || url.match(/\/d\/(.*?)$/);
      if (match && match[1]) {
        return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w400`;
      }
    }
    return url;
  };

  const triggerBase64Upload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3.5 * 1024 * 1024) {
      alert('Ukuran file maksimal adalah 3.5 MB!');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const baseString = reader.result as string;
      const genName = getDriveFileName('doc', fieldName) + '.pdf';
      setSchoolForm(prev => ({ ...prev, [fieldName]: baseString }));
      setUploadedNames(prev => ({ ...prev, [fieldName]: genName }));
    };
    reader.readAsDataURL(file);
  };

  // Drag-and-drop mechanics
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropUpload = (e: React.DragEvent, fieldName: string) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (file.size > 3.5 * 1024 * 1024) {
      alert('Ukuran file maksimal adalah 3.5 MB!');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const baseString = reader.result as string;
      const genName = getDriveFileName('doc', fieldName) + '.pdf';
      setSchoolForm(prev => ({ ...prev, [fieldName]: baseString }));
      setUploadedNames(prev => ({ ...prev, [fieldName]: genName }));
    };
    reader.readAsDataURL(file);
  };

  // Save profile sanggar and documents pendaftar
  const handleSaveSanggar = async () => {
    if (!currentUser) return;
    
    // Quick validation
    if (!schoolForm.namaSekolah || !schoolForm.namaSanggar || !schoolForm.kontakPembina || !schoolForm.email) {
      showNotification('err', 'Mohon lengkapi seluruh isian profil wajib!');
      return;
    }

    setIsActionLoading(true);
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_sanggar_data',
          payload: {
            username: currentUser.username,
            ...schoolForm
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        showNotification(data.synced === false ? 'warning' : 'success', data.message || '💾 Profil & Berkas Sanggar berhasil disimpan ke database!');
        await fetchDataset();
        
        // Cek jika komplit, pindahkan tab otomatis
        if (
          schoolForm.namaSekolah &&
          schoolForm.namaSanggar &&
          schoolForm.kontakPembina &&
          schoolForm.email &&
          schoolForm.naskahFile &&
          schoolForm.plotLampu &&
          schoolForm.poster &&
          schoolForm.artistik &&
          schoolForm.sinopsis &&
          schoolForm.profilSanggar
        ) {
          setPendaftarTab('peserta');
        }
      } else {
        showNotification('err', data.message || 'Gagal menyimpan.');
      }
    } catch (err: any) {
      showNotification('err', err.toString());
    } finally {
      setIsActionLoading(false);
    }
  };

  // Sync multi participant listing to backend sheets
  const handleSyncPesertaOnSheets = async (updatedList: Participant[]) => {
    if (!currentUser) return;

    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sync_peserta',
          payload: {
            username: currentUser.username,
            peserta: updatedList
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        showNotification(data.synced === false ? 'warning' : 'success', data.message || '👥 Daftar Peserta berhasil disinkronisasi ke server!');
      }
    } catch (e: any) {
      console.error('Error syncing participant:', e);
    }
  };

  // Edit selected participant handler
  const handleEditPeserta = (p: Participant) => {
    setEditingPeserta(p);
    setNewPesertaForm({
      id: p.id,
      nama: p.nama,
      peran: p.peran,
      namaTokoh: p.namaTokoh || '',
      jenisKelamin: p.jenisKelamin,
      penyakitBawaan: p.penyakitBawaan === '-' ? '' : p.penyakitBawaan || '',
      fotoFile: p.fotoFile,
      kartuPelajarFile: p.kartuPelajarFile || ''
    });
    setPesertaPhotoName('Foto Saat Ini');
    setPesertaKartuName(p.kartuPelajarFile ? 'Kartu Saat Ini' : '');
    setShowAddPesertaModal(true);
  };

  // Close model and reset state helper
  const handleCloseAddPesertaModal = () => {
    setEditingPeserta(null);
    setNewPesertaForm({
      id: '',
      nama: '',
      peran: 'Aktor Utama',
      namaTokoh: '',
      jenisKelamin: 'Laki-laki',
      penyakitBawaan: '',
      fotoFile: '',
      kartuPelajarFile: ''
    });
    setPesertaPhotoName('');
    setPesertaKartuName('');
    setShowAddPesertaModal(false);
  };

  // Add/Update Participant inside array locally and sync online sheets
  const handleAddPeserta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPesertaForm.nama) {
      alert('Nama peserta sesuai ijazah wajib diisi!');
      return;
    }

    const isActor = ['Aktor Utama', 'Aktris Utama', 'Aktor Pembantu', 'Aktris Pembantu'].includes(newPesertaForm.peran);
    const finalNamaTokoh = isActor ? (newPesertaForm.namaTokoh || '-') : '-';

    if (editingPeserta) {
      // Edit Mode
      const nextList = pesertaList.map((p) => {
        if (p.id === editingPeserta.id) {
          return {
            ...p,
            nama: newPesertaForm.nama,
            peran: newPesertaForm.peran,
            namaTokoh: finalNamaTokoh,
            jenisKelamin: newPesertaForm.jenisKelamin,
            penyakitBawaan: newPesertaForm.penyakitBawaan || '-',
            fotoFile: newPesertaForm.fotoFile || p.fotoFile,
            kartuPelajarFile: newPesertaForm.kartuPelajarFile || p.kartuPelajarFile
          };
        }
        return p;
      });
      setPesertaList(nextList);
      handleSyncPesertaOnSheets(nextList);
    } else {
      // Add Mode
      const item: Participant = {
        id: 'PST-' + Math.floor(1000 + Math.random() * 9000),
        nama: newPesertaForm.nama,
        peran: newPesertaForm.peran,
        namaTokoh: finalNamaTokoh,
        jenisKelamin: newPesertaForm.jenisKelamin,
        penyakitBawaan: newPesertaForm.penyakitBawaan || '-',
        fotoFile: newPesertaForm.fotoFile || 'https://picsum.photos/seed/avatar/300/400',
        kartuPelajarFile: newPesertaForm.kartuPelajarFile
      };

      const nextList = [...pesertaList, item];
      setPesertaList(nextList);
      handleSyncPesertaOnSheets(nextList);
    }

    // Reset modals & state
    handleCloseAddPesertaModal();
  };

  // Remove participant inside array locally and update sync online
  const handleRemovePeserta = (id: string) => {
    setPesertaIdToDelete(id);
  };

  const handleConfirmRemovePeserta = () => {
    if (pesertaIdToDelete) {
      const nextList = pesertaList.filter(p => p.id !== pesertaIdToDelete);
      setPesertaList(nextList);
      handleSyncPesertaOnSheets(nextList);
      setPesertaIdToDelete(null);
      showNotification('success', 'Peserta berhasil dihapus dari daftar.');
    }
  };

  // Selesaikan pendaftaran dengan mengunggah bukti pembayaran
  const handleSubmitBuktiBayarAndLockSubmit = async () => {
    if (!schoolForm.buktiPembayaran) {
      showNotification('err', 'Harap unggah bukti pembayaran kelayakan pementasan terlebih dahulu!');
      return;
    }

    setIsActionLoading(true);
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit_bukti_pembayaran_pendaftar',
          payload: {
            username: currentUser.username,
            buktiBayarFile: schoolForm.buktiPembayaran
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        showNotification(data.synced === false ? 'warning' : 'success', data.message || '🚀 Pengajuan pendaftaran terkirim! Status Anda sekarang menjadi PENDING verifikasi panitia.');
        await fetchDataset();
      } else {
        showNotification('err', data.message || 'Gagal mengirim pembayaran.');
      }
    } catch (e: any) {
      showNotification('err', e.toString());
    } finally {
      setIsActionLoading(false);
    }
  };

  // Admin operational mechanisms: Verify Status & Email Trigger via script
  const handleAddAdminScript = () => {
    setAdminScripts([...adminScripts, { id: 'sc-' + Date.now().toString(), judul: '', pengarang: '', sinopsis: '', fileUrl: '', size: '1 MB' }]);
  };

  const handleUpdateAdminScript = (idx: number, field: string, value: string) => {
    const updated = [...adminScripts];
    updated[idx] = { ...updated[idx], [field]: value };
    setAdminScripts(updated);
  };

  const handleRemoveAdminScript = (idx: number) => {
    const updated = [...adminScripts];
    updated.splice(idx, 1);
    setAdminScripts(updated);
  };

  const handleSaveScripts = async () => {
    setIsActionLoading(true);
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'manage_scripts', payload: { scripts: adminScripts } })
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', 'Daftar Naskah sukses diperbarui.');
        await fetchDataset(true);
        if (onRefresh) onRefresh();
      } else {
        showNotification('err', data.error || 'Gagal update naskah');
      }
    } catch (e: any) {
      showNotification('err', e.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSaveTicketSettings = async () => {
    setIsActionLoading(true);
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'manage_ticket_settings', payload: { ticketSettings: ticketSettingsForm } })
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', 'Pengaturan Tiket sukses diperbarui.');
        await fetchDataset(true);
        if (onRefresh) onRefresh();
      } else {
        showNotification('err', data.error || 'Gagal update pengaturan tiket');
      }
    } catch (e: any) {
      showNotification('err', e.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSaveAppscriptUrl = async () => {
    setIsActionLoading(true);
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_appscript_url', payload: { url: appscriptUrl } })
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', '🔗 URL Google Apps Script & Sheets berhasil diperbarui!');
        await fetchDataset(true);
        if (onRefresh) onRefresh();
      } else {
        showNotification('err', data.error || 'Gagal memperbarui URL Apps Script.');
      }
    } catch (e: any) {
      showNotification('err', e.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleAdminVerifyPendaftar = async (username: string, isApproval: boolean) => {
    setIsActionLoading(true);
    const targetStatus = isApproval ? 'Disetujui' : 'Ditolak';

    const account = allAccounts.find(acc => acc.username === username);
    const sanggar = allSanggars.find(s => s.username === username) || {};

    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_status',
          payload: {
            username,
            status: targetStatus,
            catatan: adminActionStatus.catatan,
            email: sanggar.email || account?.email || ''
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', `Verification set to "${targetStatus}"! Email notifications triggered successfully.`);
        setAdminSelectedSanggar(null);
        setAdminActionStatus({ status: 'Disetujui', catatan: '' });
        await fetchDataset();
      } else {
        showNotification('err', data.message || 'Failed to sync verification actions.');
      }
    } catch (e: any) {
      showNotification('err', e.toString());
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsActionLoading(true);
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'admin_update_settings', payload: settingsForm })
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', 'Pengaturan Publikasi Website berhasil diperbarui.');
        await fetchDataset(true);
        if (onRefresh) onRefresh();
      } else {
        showNotification('err', data.message || 'Gagal update setting');
      }
    } catch (e: any) {
      showNotification('err', e.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleAdminUpdateTicketPayment = async (id: string, nextStatus: string) => {
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'admin_update_ticket',
          payload: { id, status: nextStatus }
        })
      });
      const resData = await res.json();
      if (resData.success) {
        showNotification('success', `Status pembayaran tiket #${id} diubah ke ${nextStatus}`);
        await fetchDataset();
      }
    } catch (e: any) {
      showNotification('err', e.toString());
    }
  };

  // Convert user-uploaded profile photo to base64 for participants
  const handleParticipantPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const per = newPesertaForm.peran || 'Peran';
      const nm = newPesertaForm.nama || 'Nama';
      // untuk foto peserta NPSN+peran+nama (jika terlalu panjang dan membebani bisa disingkat)
      const genName = getDriveFileName('foto', per, nm) + '.jpg';
      setNewPesertaForm(prev => ({ ...prev, fotoFile: reader.result as string }));
      setPesertaPhotoName(genName);
    };
    reader.readAsDataURL(file);
  };

  const handleParticipantKartuUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const nm = newPesertaForm.nama || 'Nama';
      const genName = getDriveFileName('kartu', 'Kartu', nm) + '.pdf';
      setNewPesertaForm(prev => ({ ...prev, kartuPelajarFile: reader.result as string }));
      setPesertaKartuName(genName);
    };
    reader.readAsDataURL(file);
  };

  // Fix for older accounts that might have 'Pending' instead of 'Draft' as initial status
  const isDataLocked = ['Disetujui', 'Pending'].includes(currentUser?.profile?.status) && Boolean(schoolForm.buktiPembayaran);

  const isSchoolDataComplete = Boolean(
    schoolForm.namaSekolah &&
    schoolForm.namaSanggar &&
    schoolForm.kontakPembina &&
    schoolForm.email &&
    schoolForm.naskahFile &&
    schoolForm.plotLampu &&
    schoolForm.poster &&
    schoolForm.artistik &&
    schoolForm.sinopsis &&
    schoolForm.profilSanggar
  );

  const isPesertaDataComplete = pesertaList.length > 0;

  if (isLoading && allAccounts.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 bg-slate-50 text-slate-800 flex items-center justify-center min-h-[500px]">
        <div className="relative flex flex-col items-center text-center space-y-6 max-w-sm">
          {/* Animated concentric gold rings layout matching the theater festival brand style */}
          <div className="relative w-24 h-24 flex items-center justify-center bg-white border border-slate-200 rounded-full shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
            <div className="absolute inset-1.5 border border-slate-100/80 rounded-full" />
            {/* Spinning active ring */}
            <div className="absolute inset-1.5 border-2 border-transparent border-t-[#b88a44] border-r-[#b88a44] rounded-full animate-spin" style={{ animationDuration: '1s' }} />
            <div className="absolute inset-3 border border-dashed border-[#b88a44]/20 rounded-full animate-spin pointer-events-none" style={{ animationDuration: '6s' }} />
            <Database className="w-7 h-7 text-amber-600 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-black font-outfit uppercase tracking-widest text-[#221714]">Menyiapkan Panggung</h4>
            <div className="flex items-center justify-center gap-1.5 text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <p className="text-xs font-bold uppercase tracking-wider">Menghubungkan ke Arsip Data...</p>
            </div>
            <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed">
              Sedang memuat data registrasi pementasan dan status kelayakan administrasi langsung dari jaringan server.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 bg-slate-50 text-slate-800">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-xl border flex items-center gap-3 max-w-sm ${
              statusMessage.type === 'success' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : statusMessage.type === 'warning'
                  ? 'bg-amber-50 border-amber-200 text-amber-800'
                  : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            ) : statusMessage.type === 'warning' ? (
              <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" />
            ) : (
              <AlertTriangle className="w-5 h-5 shrink-0 text-red-600" />
            )}
            <p className="text-xs font-semibold leading-relaxed">{statusMessage.text}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER SECTION IN PORTAL */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-white border border-slate-200 rounded-3xl shadow-xs gap-4">
        <div>
          <h2 className="text-2xl font-black font-outfit text-slate-900 tracking-tight flex items-center gap-2">
            <Building className="w-6 h-6 text-amber-500" /> Portal Registrasi &amp; Dashboard
          </h2>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">
            Festival Teater Modern Pelajar (FTMP) XXVI Se-NTB 2026
          </p>
        </div>
        
        {currentUser ? (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className={`px-2.5 py-0.5 text-[10px] uppercase font-bold rounded-full ${
                currentUser.isAdmin 
                  ? 'bg-purple-100 text-purple-700' 
                  : (currentUser.profile?.status === 'Disetujui' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700')
              }`}>
                {currentUser.isAdmin ? 'Panitia Admin' : (currentUser.profile?.status || 'Pending')}
              </span>
              <p className="text-xs font-bold text-slate-900 mt-0.5">@{currentUser.username}</p>
            </div>
            <button
              onClick={() => {
                handleSetCurrentUser(null);
                showNotification('success', 'Berhasil keluar dari sesi akun.');
              }}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
              title="Keluar / Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <span className="text-xs text-slate-400 font-mono">Status: Belum Masuk Sesi</span>
        )}
      </div>

      {/* BEFORE USER IS LOGGED IN */}
      {!currentUser && (
        <div className="grid grid-cols-1 lg:grid-cols-12 border border-slate-800/80 rounded-3xl overflow-hidden bg-slate-950/80 backdrop-blur-md shadow-2xl">
          
          {/* Informasi Panduan Pendaftar */}
          <div className="lg:col-span-5 bg-[#080d1a] p-8 text-slate-100 flex flex-col justify-between border-r border-slate-900">
            <div className="space-y-6">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center font-bold text-lg text-blue-400 shadow-sm">
                🎭
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-bold tracking-tight text-white font-sans">Menjadi bagian dari Arsip Seperempat Abad</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-outfit">
                  Pendaftaran festival memerlukan pembuatan akun pendaftar terlebih dahulu. Satu akun mewakili satu Sanggar Seni / Sekolah SMA/SMK/MA Se-Nusa Tenggara Barat.
                </p>
              </div>

              <div className="space-y-3.5 pt-4">
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
                  <Info className="w-3.5 h-3.5 text-blue-400" /> Tahapan Registrasi Pendamping:
                </p>
                <div className="space-y-3 text-xs text-slate-400">
                  <div className="flex gap-2">
                    <span className="h-5 w-5 shrink-0 rounded-full bg-blue-950/50 border border-blue-900/30 flex items-center justify-center text-[10px] font-bold text-blue-400">1</span>
                    <p>Daftarkan Akun (Username &amp; Password Sanggar).</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="h-5 w-5 shrink-0 rounded-full bg-blue-950/50 border border-blue-900/30 flex items-center justify-center text-[10px] font-bold text-blue-400">2</span>
                    <p>Isi Data Sekolah &amp; Unggah 6 Berkas Pementasan (Bisa edit pengerjaan berkala).</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="h-5 w-5 shrink-0 rounded-full bg-blue-950/50 border border-blue-900/30 flex items-center justify-center text-[10px] font-bold text-blue-400">3</span>
                    <p>Daftarkan Data Peserta / Pemain &amp; Pasang foto 3x4 (Mendukung data jamak).</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="h-5 w-5 shrink-0 rounded-full bg-blue-950/50 border border-blue-900/30 flex items-center justify-center text-[10px] font-bold text-blue-400">4</span>
                    <p>Unggah bukti pembayaran &amp; kirim pengajuan ke verifikator Panitia.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Form Bidang Input */}
          <div className="lg:col-span-7 p-8 md:p-10 bg-[#0c111e]">
            {authMode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">Masuk Aplikasi</h3>
                  <p className="text-xs text-slate-400 mt-1">Lanjutkan pengisian database dan revisi kelayakan sanggar seni Anda.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Username Port</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-[#080c16] border border-slate-800 rounded-xl text-white placeholder-slate-650 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all"
                      placeholder="Masukkan nama pengguna"
                      value={loginForm.username}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Kata Sandi (Password)</label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 bg-[#080c16] border border-slate-800 rounded-xl text-white placeholder-slate-650 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all"
                      placeholder="Masukkan kata sandi"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-xl transition-all shadow-md items-center justify-center flex gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-white" /> Sinkronisasi Database...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <LogIn className="w-4 h-4" /> Masuk Portal
                    </span>
                  )}
                </button>

                <p className="text-xs text-center text-slate-400">
                  Belum memiliki akun pendaftar?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthMode('register')}
                    className="font-bold text-blue-400 hover:underline hover:text-blue-300 transition-colors"
                  >
                    Daftar Baru di Sini
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">Pendaftaran Akun Baru</h3>
                  <p className="text-xs text-slate-400 mt-1">Dapatkan kredensial mandiri untuk mendelegasikan naskah sekolah Anda.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Username Pilihan</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 bg-[#080c16] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-650 focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                      placeholder="Contoh: teatersenja"
                      value={registerForm.username}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, username: e.target.value.toLowerCase().replace(/\s+/g, '') }))}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2.5 bg-[#080c16] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-650 focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                      placeholder="Sandi rahasia"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                    <p className="text-[9px] text-slate-500 mt-1 font-medium">Wajib kombinasi huruf dan angka.</p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">NPSN Sekolah <span className="text-blue-400">*</span></label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 bg-blue-950/20 border border-blue-900/40 rounded-xl text-xs text-blue-200 placeholder-blue-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      placeholder="Contoh NPSN Resmi Sekolah Anda: 50201234"
                      value={registerForm.npsn}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, npsn: e.target.value }))}
                      required
                    />
                    <p className="text-[11px] text-blue-400 font-bold mt-1.5 flex flex-wrap items-center gap-1 bg-blue-500/10 px-2 py-1 rounded w-fit">ℹ️ NPSN hanya dapat digunakan oleh satu akun.</p>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nama SMA/SMK/MA Asal</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 bg-[#080c16] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-650 focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                      placeholder="Contoh: SMAN 1 Mataram"
                      value={registerForm.namaSekolah}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, namaSekolah: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nama Sanggar Teater</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 bg-[#080c16] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-650 focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                      placeholder="Contoh: Sanggar Putih"
                      value={registerForm.namaSanggar}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, namaSanggar: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Kontak Pendamping (No HP)</label>
                    <input
                      type="tel"
                      className="w-full px-4 py-2.5 bg-[#080c16] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-650 focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                      placeholder="Contoh: 08123456789"
                      value={registerForm.kontakPembina}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, kontakPembina: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Email Pembina Resmi</label>
                    <input
                      type="email"
                      className="w-full px-4 py-2.5 bg-[#080c16] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-650 focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                      placeholder="Contoh: teater@sekolah.sch.id"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isActionLoading}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 mt-4"
                >
                  {isActionLoading ? 'Sedang Mendaftarkan...' : 'Buat Akun Registrasi'}
                </button>

                <p className="text-xs text-center text-slate-500">
                  Sudah terdaftar?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className="font-bold text-amber-600 hover:underline"
                  >
                    Masuk Portal Akun
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      )}

      {/* DISPLAY AFTER LOGGED IN AS PENDAFTAR CLIENT */}
      {currentUser && !currentUser.isAdmin && (
        <div className="space-y-6">
          
          {/* Status Badge & Alert */}
          <div className={`p-5 rounded-2xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
            currentUser.profile?.status === 'Disetujui'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : currentUser.profile?.status === 'Ditolak'
                ? 'bg-red-50 border-red-200 text-red-800'
                : 'bg-amber-50/70 border-amber-200 text-amber-800'
          }`}>
            <div className="space-y-1">
              <h4 className="font-extrabold text-sm flex items-center gap-1.5">
                {currentUser.profile?.status === 'Disetujui' ? (
                  <><CheckCircle2 className="w-5 h-5 text-emerald-600" /> STATUS SANGGAR: DISETUJUI &amp; MEMENUHI SYARAT</>
                ) : currentUser.profile?.status === 'Ditolak' ? (
                  <><AlertTriangle className="w-5 h-5 text-red-600" /> STATUS SANGGAR: REVISI BERKAS / PENOLAKAN</>
                ) : currentUser.profile?.status === 'Pending' ? (
                  <><Info className="w-5 h-5 text-amber-600" /> STATUS SANGGAR: DALAM PENINJAUAN PANITIA</>
                ) : (
                  <><Info className="w-5 h-5 text-amber-600" /> STATUS PENGAJUAN: BARU / DALAM PENGISIAN</>
                )}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                {currentUser.profile?.status === 'Disetujui' 
                  ? 'Selamat! Berkas dan Bukti Pendaftaran telah divalidasi penuh oleh tim verifikator. Akses perubahan data telah dikunci sistem.'
                  : currentUser.profile?.status === 'Ditolak'
                    ? `Perlu Perbaikan: ${currentUser.profile?.catatan || 'Mohon perbaiki isian data / bukti pembayaran Anda sesuai ketentuan.'}`
                    : currentUser.profile?.status === 'Pending'
                      ? 'Bukti pembayaran dan berkas Anda sedang ditinjau oleh panitia. Data tidak dapat diedit saat ini.'
                    : 'Silakan isi seluruh profil sekolah, unggah naskah/poster pertunjukan, daftarkan seluruh pemain teater Anda, kemudian lakukan pengajuan pembayaran.'
                }
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 items-center">
              {isDataLocked && (
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/60 px-3.5 py-2 rounded-xl border border-emerald-200">
                  <Lock className="w-4 h-4" /> Data Dikunci Sistem
                </div>
              )}
              <button
                onClick={() => fetchDataset(true)}
                disabled={isLoading}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Menyelaraskan...' : 'Segarkan Status'}
              </button>
            </div>
          </div>

          {/* Tab Menu Navigation Pendaftar */}
          <div className="flex flex-col sm:flex-row gap-1 bg-white p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => setPendaftarTab('sekolah')}
              className={`flex-1 py-3 text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                pendaftarTab === 'sekolah' 
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs' 
                  : 'text-slate-500 hover:text-slate-850 hover:bg-slate-50'
              }`}
            >
              <Building className="w-4 h-4" /> 1. Data Sekolah &amp; Berkas
            </button>
            <button
              onClick={() => isSchoolDataComplete ? setPendaftarTab('peserta') : showNotification('err', 'Selesaikan pengisian Data Sekolah & Berkas terlebih dahulu!')}
              disabled={!isSchoolDataComplete}
              className={`flex-1 py-3 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                pendaftarTab === 'peserta' 
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs' 
                  : 'text-slate-500 hover:text-slate-850 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer'
              }`}
            >
              <Users className="w-4 h-4" /> 2. Registrasi Peserta ({pesertaList.length})
            </button>
            <button
              onClick={() => (isSchoolDataComplete && isPesertaDataComplete) ? setPendaftarTab('bayar') : showNotification('err', 'Selesaikan pendaftaran Peserta minimal 1 orang terlebih dahulu!')}
              disabled={!(isSchoolDataComplete && isPesertaDataComplete)}
              className={`flex-1 py-3 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                pendaftarTab === 'bayar' 
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs' 
                  : 'text-slate-500 hover:text-slate-850 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer'
              }`}
            >
              <CreditCard className="w-4 h-4" /> 3. Selesaikan &amp; Bayar
            </button>
          </div>

          {/* SUB-SECTION 1: Data Sekolah &amp; Berkas */}
          {pendaftarTab === 'sekolah' && (
            <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl space-y-6">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Profil Sekolah, Sanggar, &amp; Lampiran Teknis</h3>
                <p className="text-xs text-slate-500 mt-0.5">Kelola data administrasi yang akan dimasukkan ke buku program panduan.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">NPSN Sekolah (Tidak dapat diubah)</label>
                  <input
                    type="text"
                    disabled
                    className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-mono text-xs focus:outline-hidden"
                    value={schoolForm.npsn}
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Sistem kami membuat database spesifik berdasar NPSN Sekolah sehingga data siswa tidak akan tercampur.</p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Nama Sekolah</label>
                  <input
                    type="text"
                    disabled={isDataLocked}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-hidden disabled:bg-slate-100 disabled:text-slate-450"
                    value={schoolForm.namaSekolah}
                    onChange={(e) => setSchoolForm(prev => ({ ...prev, namaSekolah: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Nama Sanggar Seni</label>
                  <input
                    type="text"
                    disabled={isDataLocked}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-hidden disabled:bg-slate-100"
                    value={schoolForm.namaSanggar}
                    onChange={(e) => setSchoolForm(prev => ({ ...prev, namaSanggar: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Hubungi Pembina Resmi (No HP)</label>
                  <input
                    type="text"
                    disabled={isDataLocked}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-hidden disabled:bg-slate-100"
                    value={schoolForm.kontakPembina}
                    onChange={(e) => setSchoolForm(prev => ({ ...prev, kontakPembina: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Email Pembina Resmi</label>
                  <input
                    type="email"
                    disabled={isDataLocked}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-hidden disabled:bg-slate-100"
                    value={schoolForm.email}
                    onChange={(e) => setSchoolForm(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>

              <div className="h-px bg-slate-100 my-4" />

              <div>
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-4 text-amber-600 flex items-center gap-1.5">
                  <FileText className="w-4 h-4" /> Unggahan 6 Berkas Penunjang Wajib:
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Item 1: Naskah */}
                  <div className="p-4 border border-slate-200 rounded-2xl space-y-3 bg-slate-50/50">
                    <p className="text-xs font-bold text-slate-800">1. Draft Naskah Lakon</p>
                    {schoolForm.naskahFile ? (
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-slate-500 font-mono block truncate">{uploadedNames.naskahFile || 'Berkas Naskah Siap'}</span>
                        <div className="flex gap-2">
                          <a href={schoolForm.naskahFile} target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 font-bold hover:underline">Unduh Berkas</a>
                          {!isDataLocked && <button onClick={() => setSchoolForm(prev => ({ ...prev, naskahFile: '' }))} className="text-[10px] text-red-500 hover:underline">Hapus</button>}
                        </div>
                      </div>
                    ) : (
                      <div className="relative border border-dashed border-slate-300 rounded-xl p-4 text-center cursor-pointer hover:bg-white" onDragOver={handleDragOver} onDrop={(e) => handleDropUpload(e, 'naskahFile')}>
                        <input type="file" disabled={isDataLocked} accept=".pdf" onChange={(e) => triggerBase64Upload(e, 'naskahFile')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        <Upload className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                        <span className="text-[10px] text-slate-500 block">Pilih File Naskah (PDF)</span>
                      </div>
                    )}
                  </div>

                  {/* Item 2: Plot Lampu */}
                  <div className="p-4 border border-slate-200 rounded-2xl space-y-3 bg-slate-50/50">
                    <p className="text-xs font-bold text-slate-800">2. Plot Tata Lampu</p>
                    {schoolForm.plotLampu ? (
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-slate-500 font-mono block truncate">{uploadedNames.plotLampu || 'Sketsa Plot Lampu'}</span>
                        <div className="flex gap-2">
                          <a href={schoolForm.plotLampu} target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 font-bold hover:underline">Unduh Berkas</a>
                          {!isDataLocked && <button onClick={() => setSchoolForm(prev => ({ ...prev, plotLampu: '' }))} className="text-[10px] text-red-500 hover:underline">Hapus</button>}
                        </div>
                      </div>
                    ) : (
                      <div className="relative border border-dashed border-slate-300 rounded-xl p-4 text-center cursor-pointer hover:bg-white" onDragOver={handleDragOver} onDrop={(e) => handleDropUpload(e, 'plotLampu')}>
                        <input type="file" disabled={isDataLocked} accept=".pdf" onChange={(e) => triggerBase64Upload(e, 'plotLampu')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        <Upload className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                        <span className="text-[10px] text-slate-500 block">Plot Tata Lampu (PDF)</span>
                      </div>
                    )}
                  </div>

                  {/* Item 3: Poster Pertunjukan */}
                  <div className="p-4 border border-slate-200 rounded-2xl space-y-3 bg-slate-50/50">
                    <p className="text-xs font-bold text-slate-800">3. Poster Pertunjukan</p>
                    {schoolForm.poster ? (
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-slate-500 font-mono block truncate">{uploadedNames.poster || 'Poster Pertunjukan'}</span>
                        <div className="flex gap-2">
                          <a href={schoolForm.poster} target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 font-bold hover:underline">Unduh Berkas</a>
                          {!isDataLocked && <button onClick={() => setSchoolForm(prev => ({ ...prev, poster: '' }))} className="text-[10px] text-red-500 hover:underline">Hapus</button>}
                        </div>
                      </div>
                    ) : (
                      <div className="relative border border-dashed border-slate-300 rounded-xl p-4 text-center cursor-pointer hover:bg-white" onDragOver={handleDragOver} onDrop={(e) => handleDropUpload(e, 'poster')}>
                        <input type="file" disabled={isDataLocked} accept=".pdf" onChange={(e) => triggerBase64Upload(e, 'poster')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        <Upload className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                        <span className="text-[10px] text-slate-500 block">Upload Poster Pertunjukan (PDF)</span>
                      </div>
                    )}
                  </div>

                  {/* Item 4: Artistik Stage */}
                  <div className="p-4 border border-slate-200 rounded-2xl space-y-3 bg-slate-50/50">
                    <p className="text-xs font-bold text-slate-800">4. Desain Artistik Panggung</p>
                    {schoolForm.artistik ? (
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-slate-500 font-mono block truncate">{uploadedNames.artistik || 'Desain Artistik'}</span>
                        <div className="flex gap-2">
                          <a href={schoolForm.artistik} target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 font-bold hover:underline">Unduh Berkas</a>
                          {!isDataLocked && <button onClick={() => setSchoolForm(prev => ({ ...prev, artistik: '' }))} className="text-[10px] text-red-500 hover:underline">Hapus</button>}
                        </div>
                      </div>
                    ) : (
                      <div className="relative border border-dashed border-slate-300 rounded-xl p-4 text-center cursor-pointer hover:bg-white" onDragOver={handleDragOver} onDrop={(e) => handleDropUpload(e, 'artistik')}>
                        <input type="file" disabled={isDataLocked} accept=".pdf" onChange={(e) => triggerBase64Upload(e, 'artistik')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        <Upload className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                        <span className="text-[10px] text-slate-500 block">Panggung &amp; Properti Artistik (PDF)</span>
                      </div>
                    )}
                  </div>

                  {/* Item 5: Ringkasan Sinopsis */}
                  <div className="p-4 border border-slate-200 rounded-2xl space-y-3 bg-slate-50/50">
                    <p className="text-xs font-bold text-slate-800">5. Sinopsis Lakon</p>
                    {schoolForm.sinopsis ? (
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-slate-500 font-mono block truncate">{uploadedNames.sinopsis || 'Berkas Sinopsis'}</span>
                        <div className="flex gap-2">
                          <a href={schoolForm.sinopsis} target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 font-bold hover:underline">Unduh Berkas</a>
                          {!isDataLocked && <button onClick={() => setSchoolForm(prev => ({ ...prev, sinopsis: '' }))} className="text-[10px] text-red-500 hover:underline">Hapus</button>}
                        </div>
                      </div>
                    ) : (
                      <div className="relative border border-dashed border-slate-300 rounded-xl p-4 text-center cursor-pointer hover:bg-white" onDragOver={handleDragOver} onDrop={(e) => handleDropUpload(e, 'sinopsis')}>
                        <input type="file" disabled={isDataLocked} accept=".pdf" onChange={(e) => triggerBase64Upload(e, 'sinopsis')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        <Upload className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                        <span className="text-[10px] text-slate-500 block">Sinopsis Lakon Singkat (PDF)</span>
                      </div>
                    )}
                  </div>

                  {/* Item 6: Profil Sanggar */}
                  <div className="p-4 border border-slate-200 rounded-2xl space-y-3 bg-slate-50/50">
                    <p className="text-xs font-bold text-slate-800">6. Profil Sanggar Seni</p>
                    {schoolForm.profilSanggar ? (
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-slate-500 font-mono block truncate">{uploadedNames.profilSanggar || 'Arsip Profil'}</span>
                        <div className="flex gap-2">
                          <a href={schoolForm.profilSanggar} target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 font-bold hover:underline">Unduh Berkas</a>
                          {!isDataLocked && <button onClick={() => setSchoolForm(prev => ({ ...prev, profilSanggar: '' }))} className="text-[10px] text-red-500 hover:underline">Hapus</button>}
                        </div>
                      </div>
                    ) : (
                      <div className="relative border border-dashed border-slate-300 rounded-xl p-4 text-center cursor-pointer hover:bg-white" onDragOver={handleDragOver} onDrop={(e) => handleDropUpload(e, 'profilSanggar')}>
                        <input type="file" disabled={isDataLocked} accept=".pdf" onChange={(e) => triggerBase64Upload(e, 'profilSanggar')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        <Upload className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                        <span className="text-[10px] text-slate-500 block">Berkas Profil Sejarah Sanggar (PDF)</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {!isDataLocked && (
                <div className="pt-6 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={handleSaveSanggar}
                    disabled={isActionLoading}
                    className="px-6 py-3 bg-slate-900 border border-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {isActionLoading ? 'Sedang Menyimpan...' : 'Simpan dan Lanjutkan'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* SUB-SECTION 2: Kelola Peserta Jamak */}
          {pendaftarTab === 'peserta' && (
            <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Registrasi Delegasi Peserta / Pemain</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Daftarkan nama-nama aktor, aktris, penata artistik, serta musik secara lengkap.</p>
                </div>
                
                {!isDataLocked && (
                  <button
                    onClick={() => setShowAddPesertaModal(true)}
                    className="inline-flex items-center gap-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-transform transform active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Daftarkan Peserta Baru
                  </button>
                )}
              </div>

              {pesertaList.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                  <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-600">Belum Ada Peserta Terdaftar</p>
                  <p className="text-[10px] text-slate-400 mt-1 max-w-xs mx-auto">Silakan daftarkan minimal 2 aktor / aktris Anda sebelum mengunci data pendaftaran.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Mobile-friendly Grid Cards (Only visible on small devices) */}
                  <div className="block md:hidden space-y-3">
                    {pesertaList.map((p) => (
                      <div key={p.id} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                            <img src={resolveDriveImage(p.fotoFile)} alt={p.nama} className="h-full w-full object-cover" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-black text-slate-900 truncate">{p.nama}</h4>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              <span className="inline-block px-2 py-0.5 bg-amber-50 text-amber-700 font-bold text-[9px] rounded-lg border border-amber-200/40">
                                {p.peran}
                              </span>
                              {p.namaTokoh && p.namaTokoh !== '-' && (
                                <span className="inline-block px-2 py-0.5 bg-sky-50 text-sky-700 font-bold text-[9px] rounded-lg border border-sky-200/40">
                                  Tokoh: {p.namaTokoh}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-medium">
                          <div>
                            <span className="text-slate-400 block text-[8px] uppercase tracking-wider">Jenis Kelamin</span>
                            <span className="text-slate-700">{p.jenisKelamin}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[8px] uppercase tracking-wider">Penyakit Bawaan</span>
                            <span className={p.penyakitBawaan && p.penyakitBawaan !== '-' ? 'text-red-650 font-bold' : 'text-slate-500'}>
                              {p.penyakitBawaan || '-'}
                            </span>
                          </div>
                        </div>

                        {!isDataLocked && (
                          <div className="flex justify-end gap-1.5 pt-1.5 border-t border-slate-100">
                            <button
                              onClick={() => handleEditPeserta(p)}
                              className="px-3 py-1.5 text-[10px] font-bold text-slate-700 bg-slate-150 hover:bg-slate-200 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-slate-500" /> Edit
                            </button>
                            <button
                              onClick={() => handleRemovePeserta(p.id)}
                              className="px-3 py-1.5 text-[10px] font-bold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" /> Hapus
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Desktop-friendly Table (Only visible on medium and larger devices) */}
                  <div className="hidden md:block overflow-x-auto border border-slate-200 rounded-2xl">
                    <table className="w-full text-left text-xs text-slate-700 min-w-[600px]">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-550 text-[10px] uppercase font-bold tracking-wider">
                        <tr>
                          <th className="p-4 w-12">Foto</th>
                          <th className="p-4">Nama Sesuai Ijazah</th>
                          <th className="p-4">Ketegori Peran</th>
                          <th className="p-4">Nama Tokoh / Karakter</th>
                          <th className="p-4">Jenis Kelamin</th>
                          <th className="p-4">Penyakit Bawaan</th>
                          {!isDataLocked && <th className="p-4 w-28 text-center">Aksi</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {pesertaList.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4">
                              <div className="h-9 w-9 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                                <img src={resolveDriveImage(p.fotoFile)} alt={p.nama} className="h-full w-full object-cover" />
                              </div>
                            </td>
                            <td className="p-4 font-bold text-slate-900">{p.nama}</td>
                            <td className="p-4 font-medium text-amber-700 font-outfit">{p.peran}</td>
                            <td className="p-4 text-slate-700 font-medium italic">{p.namaTokoh || '-'}</td>
                            <td className="p-4 text-slate-500">{p.jenisKelamin}</td>
                            <td className="p-4 text-red-650 font-mono text-[10px]">{p.penyakitBawaan || '-'}</td>
                            {!isDataLocked && (
                              <td className="p-4 text-center">
                                <div className="flex justify-center gap-1">
                                  <button
                                    onClick={() => handleEditPeserta(p)}
                                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all cursor-pointer"
                                    title="Edit Peserta"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleRemovePeserta(p.id)}
                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                                    title="Hapus Peserta"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {!isDataLocked && isPesertaDataComplete && (
                <div className="pt-6 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => {
                      if (isSchoolDataComplete) {
                        setPendaftarTab('bayar');
                      } else {
                        showNotification('err', 'Selesaikan profil sekolah dahulu.');
                      }
                    }}
                    className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    Simpan Peserta &amp; Lanjut ke Pembayaran
                  </button>
                </div>
              )}
            </div>
          )}

          {/* SUB-SECTION 3: Pembayaran & Selesaikan */}
          {pendaftarTab === 'bayar' && (
            <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl space-y-6">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Selesaikan Pendaftaran &amp; Pembayaran</h3>
                <p className="text-xs text-slate-500 mt-0.5">Tutup pengajuan dengan menyertakan bukti bayar.</p>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-800 text-xs">
                <Info className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-bold">Ketentuan Biaya Pendaftaran Sanggar:</p>
                  <p className="mt-1 leading-relaxed text-slate-700">
                    Satu kali pendaftaran sanggar dikenakan biaya komitmen sebesar <strong>Rp350.000,00</strong> ditransferkan menuju rekening resmi <strong>BRI 3495-01-046321-533 (a.n. Teater Putih UNRAM)</strong>. Unduh kwitansi resmi akan dikirim otomatis ke email Anda saat status diverifikasi setujui.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-2">
                <div className="space-y-4">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Unggah Bukti Transaksi Resmi</span>
                    
                    {schoolForm.buktiPembayaran ? (
                      <div className="p-4 border border-emerald-100 rounded-2xl bg-emerald-50/20 space-y-2 text-center">
                        <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                        <span className="block text-xs font-bold text-emerald-800">Bukti Pembayaran Terpasang</span>
                        <div className="flex gap-2 justify-center">
                          <a href={schoolForm.buktiPembayaran} target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 font-bold hover:underline">Tampilkan Bukti</a>
                          {!isDataLocked && (
                            <button onClick={() => setSchoolForm(prev => ({ ...prev, buktiPembayaran: '' }))} className="text-[10px] text-red-500 hover:underline">Hapus</button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center cursor-pointer hover:bg-slate-50" onDragOver={handleDragOver} onDrop={(e) => handleDropUpload(e, 'buktiPembayaran')}>
                        <input type="file" disabled={isDataLocked} accept=".pdf" onChange={(e) => triggerBase64Upload(e, 'buktiPembayaran')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        <Upload className="w-6 h-6 mx-auto text-slate-400 mb-1" />
                        <span className="text-[11px] text-slate-500 block">Pilih berkas bukti pembayaran</span>
                        <span className="text-[9px] text-slate-400 mt-1 block">PDF, Maksimal 3.5 MB</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-5 border border-slate-200 rounded-2xl bg-slate-50 space-y-4">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest">📋 RINGKASAN DATA FORMULIR</h4>
                  <div className="space-y-2 text-xs text-slate-600">
                    <p className="flex justify-between"><span>Nama Sanggar:</span> <span className="font-bold text-slate-900">{schoolForm.namaSanggar || '-'}</span></p>
                    <p className="flex justify-between"><span>Asal Sekolah:</span> <span className="font-bold text-slate-900">{schoolForm.namaSekolah || '-'}</span></p>
                    <p className="flex justify-between"><span>Jumlah Pemain:</span> <span className="font-bold text-amber-700">{pesertaList.length} Orang</span></p>
                    <p className="flex justify-between"><span>Draft Naskah:</span> <span className={`font-bold ${schoolForm.naskahFile ? 'text-emerald-600':'text-red-500'}`}>{schoolForm.naskahFile ? 'Selesai' : 'Belum Lengkap'}</span></p>
                    <p className="flex justify-between"><span>Sketsa Artistik:</span> <span className={`font-bold ${schoolForm.artistik ? 'text-emerald-600':'text-red-500'}`}>{schoolForm.artistik ? 'Selesai' : 'Belum Lengkap'}</span></p>
                  </div>

                  {!isDataLocked && (
                    <button
                      onClick={handleSubmitBuktiBayarAndLockSubmit}
                      disabled={isActionLoading || !schoolForm.buktiPembayaran}
                      className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl transition-all tracking-wide text-center uppercase cursor-pointer"
                    >
                      {isActionLoading ? 'Mengirim Pengajuan...' : 'Ajukan Verifikasi Sekarang'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* DISPLAY IF LOGGED IN AS ADMINISTRATOR/PANITIA */}
      {currentUser && currentUser.isAdmin && (
        <div className="space-y-6">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">TOTAL SANGGAR</span>
              <p className="text-xl font-bold font-outfit text-slate-900 mt-1">{allAccounts.length}</p>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">REGISTRASI APPROVED</span>
              <p className="text-xl font-bold font-outfit text-emerald-600 mt-1">{allAccounts.filter(a => a.status === 'Disetujui').length}</p>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">PENDING REVIEW</span>
              <p className="text-xl font-bold font-outfit text-amber-600 mt-1">{allAccounts.filter(a => a.status === 'Pending').length}</p>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">TIKET TERJUAL</span>
              <p className="text-xl font-bold font-outfit text-purple-600 mt-1">
                {allTickets.reduce((sum, t) => sum + (t.status === 'Paid' ? t.jumlah : 0), 0)} Tiket
              </p>
            </div>
          </div>

          {/* Admin Navigation Tabs */}
          <div className="flex bg-slate-200 p-1 rounded-xl max-w-[500px]">
            <button 
              onClick={() => setAdminTab('peserta')}
              className={`flex-1 py-2 text-[11px] font-bold uppercase rounded-lg transition-all ${adminTab === 'peserta' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Data Pendaftaran
            </button>
            <button 
              onClick={() => setAdminTab('ticketing')}
              className={`flex-1 py-2 text-[11px] font-bold uppercase rounded-lg transition-all ${adminTab === 'ticketing' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Pengaturan Tiket
            </button>
            <button 
              onClick={() => setAdminTab('settings')}
              className={`flex-1 py-2 text-[11px] font-bold uppercase rounded-lg transition-all ${adminTab === 'settings' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Publikasi Website
            </button>
          </div>

          {adminTab === 'settings' ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
              {/* INTEGRASI GOOGLE APPS SCRIPT CARD */}
              <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-xs text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <Database className="w-4 h-4 text-amber-500" /> Integrasi Google Apps Script &amp; Google Sheets URL
                  </h3>
                  <span className="text-[9px] text-emerald-400 font-mono bg-slate-800 px-2 py-0.5 rounded-md">Locked (Hardcoded)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  URL Web App Google Apps Script telah dikonfigurasi secara permanen langsung di dalam kode server aplikasi (<code className="text-emerald-400 font-bold">Hardcoded</code>) demi keamanan dan performa yang stabil.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <input 
                    type="text" 
                    value={appscriptUrl}
                    readOnly
                    placeholder="https://script.google.com/macros/s/AKfy.../exec"
                    className="flex-1 text-xs px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-emerald-400 font-mono opacity-80 cursor-not-allowed focus:outline-hidden"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled
                      className="px-4 py-2.5 bg-slate-800 text-slate-500 font-bold text-xs rounded-xl cursor-not-allowed shrink-0"
                    >
                      Terkunci
                    </button>
                    <button
                      type="button"
                      onClick={() => fetchDataset(true)}
                      disabled={isActionLoading}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50 shrink-0 flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Tes Sync
                    </button>
                  </div>
                </div>
              </div>

              <h2 className="text-xl font-black font-outfit text-slate-900 flex items-center gap-2 pt-2 border-t border-slate-100">
                <FileText className="w-5 h-5 text-amber-500" /> Pengaturan Konten Publik <span className="text-[10px] font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full ml-auto">Disinkronkan otomatis</span>
              </h2>

              <form onSubmit={handleUpdateSettings} className="space-y-6">
                {/* Hero Section Copy */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <h3 className="font-bold text-sm text-slate-700 border-b pb-2">Konten Beranda Utama</h3>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Logo Aplikasi (URL Gambar)</label>
                      <input 
                        type="text" 
                        value={settingsForm.appLogo || ''} 
                        onChange={(e) => setSettingsForm({ ...settingsForm, appLogo: e.target.value })}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-slate-50"
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Judul / Tema (Hero Title)</label>
                      <input 
                        type="text" 
                        value={settingsForm.heroTitle || ''} 
                        onChange={(e) => setSettingsForm({ ...settingsForm, heroTitle: e.target.value })}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-slate-50"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Deskripsi Beranda (Hero Desc)</label>
                      <textarea 
                        rows={3}
                        value={settingsForm.heroDesc || ''} 
                        onChange={(e) => setSettingsForm({ ...settingsForm, heroDesc: e.target.value })}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-slate-50"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Link Petunjuk Teknis (Juknis Doc)</label>
                      <input 
                        type="text" 
                        value={settingsForm.juknisUrl || ''} 
                        onChange={(e) => setSettingsForm({ ...settingsForm, juknisUrl: e.target.value })}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-slate-50"
                      />
                    </div>
                    {(() => {
                      const currentImages = normalizeDownloadImages(settingsForm.downloadImages);
                      return (
                        <div className="bg-amber-500/5 p-4 rounded-2xl border border-amber-500/10 space-y-3">
                          <div className="flex justify-between items-center">
                            <label className="block text-[10px] font-bold text-amber-950 uppercase">Daftar Unduhan Gambar (Bisa Lebih Dari 1)</label>
                            <button
                              type="button"
                              onClick={() => setSettingsForm({
                                ...settingsForm,
                                downloadImages: [...currentImages, { id: 'img-' + Date.now(), title: '', url: '' }]
                              })}
                              className="px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-700 text-[9px] font-bold rounded-lg border border-amber-200 transition-all cursor-pointer"
                            >
                              + Tambah Gambar Unduhan
                            </button>
                          </div>

                          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                            {currentImages.length === 0 ? (
                              <div className="text-center p-3 text-slate-400 text-[10px] italic">
                                Belum ada gambar ditambahkan. Gunakan tombol di atas.
                              </div>
                            ) : (
                              currentImages.map((img: any, idx: number) => (
                                <div key={img.id || idx} className="bg-white p-2.5 rounded-xl border border-amber-100 space-y-2 relative shadow-xs">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const list = [...currentImages];
                                      list.splice(idx, 1);
                                      setSettingsForm({ ...settingsForm, downloadImages: list });
                                    }}
                                    className="absolute top-1.5 right-2 text-[10px] text-red-500 hover:text-red-700 font-bold cursor-pointer"
                                  >
                                    Hapus
                                  </button>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <div>
                                      <label className="block text-[8px] font-bold text-slate-500 uppercase mb-0.5">Judul Gambar</label>
                                      <input
                                        type="text"
                                        placeholder="Contoh: Poster Resmi"
                                        value={img.title || ''}
                                        onChange={(e) => {
                                          const list = [...currentImages];
                                          list[idx] = { ...list[idx], title: e.target.value };
                                          setSettingsForm({ ...settingsForm, downloadImages: list });
                                        }}
                                        className="w-full text-[10px] px-2 py-1.5 border border-slate-200 rounded-lg"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[8px] font-bold text-slate-500 uppercase mb-0.5">URL Gambar (https://...)</label>
                                      <input
                                        type="text"
                                        placeholder="https://... atau path gambar"
                                        value={img.url || ''}
                                        onChange={(e) => {
                                          const list = [...currentImages];
                                          list[idx] = { ...list[idx], url: e.target.value };
                                          setSettingsForm({ ...settingsForm, downloadImages: list });
                                        }}
                                        className="w-full text-[10px] px-2 py-1.5 border border-slate-200 rounded-lg"
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Informasi Pelaksanaan & Narahubung */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-sm text-slate-700 border-b pb-2">Informasi Event & Narahubung</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tanggal</label>
                        <input 
                          type="text" 
                          value={settingsForm.pelaksanaanTanggal || ''} 
                          onChange={(e) => setSettingsForm({ ...settingsForm, pelaksanaanTanggal: e.target.value })}
                          className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-slate-50"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tempat</label>
                        <input 
                          type="text" 
                          value={settingsForm.pelaksanaanTempat || ''} 
                          onChange={(e) => setSettingsForm({ ...settingsForm, pelaksanaanTempat: e.target.value })}
                          className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-slate-50"
                        />
                      </div>
                    </div>

                    <div className="w-full p-3 bg-amber-50 rounded-xl border border-amber-100">
                      <label className="block text-[10px] font-bold text-amber-900 uppercase mb-1">Biaya Pendaftaran</label>
                      <input 
                        type="text" 
                        value={settingsForm.biayaRegistrasi || ''} 
                        onChange={(e) => setSettingsForm({ ...settingsForm, biayaRegistrasi: e.target.value })}
                        className="w-full text-xs px-3 py-2 border border-amber-200 rounded-lg bg-white"
                      />
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div>
                          <label className="block text-[9px] font-bold text-amber-700 uppercase mb-1">No Rekening</label>
                          <input 
                            type="text" 
                            value={settingsForm.rekeningNomor || ''} 
                            onChange={(e) => setSettingsForm({ ...settingsForm, rekeningNomor: e.target.value })}
                            className="w-full text-[10px] px-2 py-1.5 border border-amber-200 rounded-lg bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-amber-700 uppercase mb-1">Atas Nama</label>
                          <input 
                            type="text" 
                            value={settingsForm.rekeningNama || ''} 
                            onChange={(e) => setSettingsForm({ ...settingsForm, rekeningNama: e.target.value })}
                            className="w-full text-[10px] px-2 py-1.5 border border-amber-200 rounded-lg bg-white"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                        <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Narahubung 1</label>
                        <input 
                          type="text" 
                          placeholder="Nama"
                          value={settingsForm.kontak1Nama || ''} 
                          onChange={(e) => setSettingsForm({ ...settingsForm, kontak1Nama: e.target.value })}
                          className="w-full text-[10px] px-2 py-1.5 border border-slate-200 rounded-lg bg-white mb-1"
                        />
                        <input 
                          type="text" 
                          placeholder="No HP"
                          value={settingsForm.kontak1Hp || ''} 
                          onChange={(e) => setSettingsForm({ ...settingsForm, kontak1Hp: e.target.value })}
                          className="w-full text-[10px] px-2 py-1.5 border border-slate-200 rounded-lg bg-white"
                        />
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                        <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Narahubung 2</label>
                        <input 
                          type="text" 
                          placeholder="Nama"
                          value={settingsForm.kontak2Nama || ''} 
                          onChange={(e) => setSettingsForm({ ...settingsForm, kontak2Nama: e.target.value })}
                          className="w-full text-[10px] px-2 py-1.5 border border-slate-200 rounded-lg bg-white mb-1"
                        />
                        <input 
                          type="text" 
                          placeholder="No HP"
                          value={settingsForm.kontak2Hp || ''} 
                          onChange={(e) => setSettingsForm({ ...settingsForm, kontak2Hp: e.target.value })}
                          className="w-full text-[10px] px-2 py-1.5 border border-slate-200 rounded-lg bg-white"
                        />
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                        <label className="block text-[9px] font-bold text-amber-600 uppercase mb-1">Narahubung Tiketing (WA Khusus)</label>
                        <input 
                          type="text" 
                          placeholder="Nama Admin Tiket"
                          value={settingsForm.kontakTiketNama || ''} 
                          onChange={(e) => setSettingsForm({ ...settingsForm, kontakTiketNama: e.target.value })}
                          className="w-full text-[10px] px-2 py-1.5 border border-amber-200 rounded-lg bg-white mb-1 focus:border-amber-500/50"
                        />
                        <input 
                          type="text" 
                          placeholder="No HP (Contoh: 08123...)"
                          value={settingsForm.kontakTiketHp || ''} 
                          onChange={(e) => setSettingsForm({ ...settingsForm, kontakTiketHp: e.target.value })}
                          className="w-full text-[10px] px-2 py-1.5 border border-amber-200 rounded-lg bg-white focus:border-amber-500/50"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Petunjuk Teknis Section */}
                <div className="border-t border-slate-150 pt-6 mt-6">
                  <h3 className="font-bold text-sm text-slate-700 border-b pb-2 mb-4 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-amber-500" />
                    Aturan Kriteria / Petunjuk Teknis Utama
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Aturan 1 */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                      <p className="text-xs font-bold text-slate-800">Aturan 1 (Batas SARA & Pornografi)</p>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Judul Aturan</label>
                        <input 
                          type="text" 
                          value={settingsForm.petunjuk1Title || ''} 
                          onChange={(e) => setSettingsForm({ ...settingsForm, petunjuk1Title: e.target.value })}
                          className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-xl bg-white"
                          placeholder="Batas SARA & Pornografi"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Deskripsi Detail</label>
                        <textarea 
                          rows={2}
                          value={settingsForm.petunjuk1Desc || ''} 
                          onChange={(e) => setSettingsForm({ ...settingsForm, petunjuk1Desc: e.target.value })}
                          className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-xl bg-white"
                          placeholder="Deskripsi aturan..."
                        />
                      </div>
                    </div>

                    {/* Aturan 2 */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                      <p className="text-xs font-bold text-slate-800">Aturan 2 (Konstruksi & Bentuk Realis)</p>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Judul Aturan</label>
                        <input 
                          type="text" 
                          value={settingsForm.petunjuk2Title || ''} 
                          onChange={(e) => setSettingsForm({ ...settingsForm, petunjuk2Title: e.target.value })}
                          className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-xl bg-white"
                          placeholder="Konstruksi & Bentuk Realis"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Deskripsi Detail</label>
                        <textarea 
                          rows={2}
                          value={settingsForm.petunjuk2Desc || ''} 
                          onChange={(e) => setSettingsForm({ ...settingsForm, petunjuk2Desc: e.target.value })}
                          className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-xl bg-white"
                          placeholder="Deskripsi aturan..."
                        />
                      </div>
                    </div>

                    {/* Aturan 3 */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                      <p className="text-xs font-bold text-slate-800">Aturan 3 (Durasi Pertunjukan)</p>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Judul Aturan</label>
                        <input 
                          type="text" 
                          value={settingsForm.petunjuk3Title || ''} 
                          onChange={(e) => setSettingsForm({ ...settingsForm, petunjuk3Title: e.target.value })}
                          className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-xl bg-white"
                          placeholder="Durasi Pertunjukan"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Deskripsi Detail</label>
                        <textarea 
                          rows={2}
                          value={settingsForm.petunjuk3Desc || ''} 
                          onChange={(e) => setSettingsForm({ ...settingsForm, petunjuk3Desc: e.target.value })}
                          className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-xl bg-white"
                          placeholder="Deskripsi aturan..."
                        />
                      </div>
                    </div>

                    {/* Aturan 4 */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                      <p className="text-xs font-bold text-slate-800">Aturan 4 (Komposisi Tim)</p>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Judul Aturan</label>
                        <input 
                          type="text" 
                          value={settingsForm.petunjuk4Title || ''} 
                          onChange={(e) => setSettingsForm({ ...settingsForm, petunjuk4Title: e.target.value })}
                          className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-xl bg-white"
                          placeholder="Komposisi Tim"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Deskripsi Detail</label>
                        <textarea 
                          rows={2}
                          value={settingsForm.petunjuk4Desc || ''} 
                          onChange={(e) => setSettingsForm({ ...settingsForm, petunjuk4Desc: e.target.value })}
                          className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-xl bg-white"
                          placeholder="Deskripsi aturan..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={isActionLoading}
                    className="px-6 py-2 bg-slate-900 border border-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all disabled:opacity-50"
                  >
                    Simpan Perubahan Publikasi
                  </button>
                </div>
              </form>

              {/* Scripts Manager */}
              <div className="mt-10 border-t border-slate-200 pt-8">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h2 className="text-xl font-black font-outfit text-slate-900 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-amber-500" /> Database Naskah Lomba
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">Daftar naskah rujukan yang dapat diunduh oleh peserta secara langsung melalui Beranda Aplikasi.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddAdminScript}
                    className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    + Tambah Naskah Baru
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {adminScripts.map((sc, scIdx) => (
                    <div key={scIdx} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl relative">
                      <button
                        onClick={() => handleRemoveAdminScript(scIdx)}
                        className="absolute top-3 right-3 p-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <div className="space-y-3 pt-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Judul Naskah</label>
                          <input 
                            type="text" 
                            value={sc.judul || ''} 
                            onChange={(e) => handleUpdateAdminScript(scIdx, 'judul', e.target.value)}
                            className="w-full text-sm font-bold px-3 py-2 border border-slate-200 rounded-xl bg-white"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Pengarang</label>
                            <input 
                              type="text" 
                              value={sc.pengarang || ''} 
                              onChange={(e) => handleUpdateAdminScript(scIdx, 'pengarang', e.target.value)}
                              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Size (Misal: 1 MB)</label>
                            <input 
                              type="text" 
                              value={sc.size || ''} 
                              onChange={(e) => handleUpdateAdminScript(scIdx, 'size', e.target.value)}
                              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">URL File Google Drive</label>
                          <input 
                            type="text" 
                            value={sc.fileUrl || ''} 
                            onChange={(e) => handleUpdateAdminScript(scIdx, 'fileUrl', e.target.value)}
                            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white italic"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Sinopsis Pendek</label>
                          <textarea 
                            rows={3}
                            value={sc.sinopsis || ''} 
                            onChange={(e) => handleUpdateAdminScript(scIdx, 'sinopsis', e.target.value)}
                            className="w-full text-[10px] px-3 py-2 border border-slate-200 rounded-xl bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleSaveScripts}
                    disabled={isActionLoading}
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                  >
                    Simpan Database Naskah
                  </button>
                </div>
              </div>
            </div>
          ) : adminTab === 'ticketing' ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
              <h2 className="text-xl font-black font-outfit text-slate-900 mb-6 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-amber-500" /> Pengaturan Tiketing &amp; Jadwal
              </h2>

              <div className="space-y-6">
                
                {/* Harga Tiket */}
                <div className="border border-slate-200 rounded-2xl p-5 bg-amber-50/50 max-w-xl">
                  <h3 className="font-bold text-sm text-amber-900 border-b border-amber-200 pb-2 mb-3">Harga Tiket Pertunjukan</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-amber-800 uppercase mb-1">Harga (Rupiah) per Tiket</label>
                      <input 
                        type="text" 
                        value={ticketSettingsForm.price || ''}
                        onChange={(e) => setTicketSettingsForm({...ticketSettingsForm, price: e.target.value})}
                        className="w-full text-sm font-bold text-slate-900 px-3 py-2 border border-amber-300 rounded-xl bg-white max-w-md focus:outline-hidden" 
                        placeholder="Contoh: 25.000" 
                      />
                      <p className="text-[10px] text-slate-500 font-semibold mt-1">Format bebas (Contoh: 25.000 atau 20.000).</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-start pt-4 border-t border-slate-100">
                  <button
                    onClick={handleSaveTicketSettings}
                    disabled={isActionLoading}
                    className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isActionLoading ? 'Menyimpan...' : 'Simpan Pengaturan Tiket'}
                  </button>
                </div>
              </div>
            </div>
          ) : (

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left section: List of Applicants */}
            <div className="lg:col-span-4 bg-white border border-slate-200 p-5 rounded-3xl space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="text-xs font-bold uppercase text-slate-900 tracking-widest">Daftar Pendaftar</h3>
                <button 
                  onClick={() => fetchDataset(true)}
                  className="p-1 px-2.5 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors text-[10px] text-slate-600 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Segarkan &amp; Sinkronisasi
                </button>
              </div>

              {allAccounts.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">Belum ada sanggar terdaftar.</p>
              ) : (
                <div className="space-y-2 max-h-[450px] overflow-y-auto">
                  {allAccounts.map((acc) => {
                    const isSelected = adminSelectedSanggar?.username === acc.username;
                    return (
                      <div
                        key={acc.username}
                        onClick={() => {
                          setAdminSelectedSanggar(acc);
                          // Prefill confirmation notes
                          setAdminActionStatus({ status: 'Disetujui', catatan: acc.catatan || '' });
                        }}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-amber-500 bg-amber-50/20' 
                            : 'border-slate-100 hover:bg-slate-50 bg-white'
                        }`}
                      >
                        <p className="text-xs font-bold text-slate-900 line-clamp-1">{acc.namaSanggar || `Sanggar @${acc.username}`}</p>
                        <p className="text-[10px] text-slate-450 line-clamp-1 mt-0.5">{acc.namaSekolah || 'Asal Sekolah Belum Ditulis'}</p>
                        
                        <div className="flex justify-between items-center mt-2 pt-1 border-t border-slate-50">
                          <span className="text-[9px] font-mono text-slate-450">@{acc.username}</span>
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                            acc.status === 'Disetujui' ? 'bg-emerald-100 text-emerald-700' : (acc.status === 'Ditolak' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700')
                          }`}>
                            {acc.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right details of Selected Sanggar */}
            <div className="lg:col-span-8 space-y-6">

              {adminSelectedSanggar ? (
                <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-6">
                  
                  {/* Detailed profile */}
                  <div className="space-y-2">
                    <h3 className="text-base font-black text-slate-900 font-outfit">Detail Sanggar &amp; Lembaga</h3>
                    <p className="text-xs text-slate-500">Koreksi berkas administrasi dan kelayakan pemain yang didaftarkan pihak sanggar.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p><strong>NPSN:</strong> <span className="font-mono bg-amber-100 text-amber-800 px-1 rounded">{adminSelectedSanggar.npsn || '-'}</span></p>
                    <p><strong>Nama Sekolah:</strong> {adminSelectedSanggar.namaSekolah || '-'}</p>
                    <p><strong>Nama Sanggar:</strong> {adminSelectedSanggar.namaSanggar || '-'}</p>
                    <p><strong>Username Akun:</strong> @{adminSelectedSanggar.username}</p>
                    <p><strong>Waktu Mendaftar:</strong> {adminSelectedSanggar.waktuDaftar ? new Date(adminSelectedSanggar.waktuDaftar).toLocaleString('id-ID') : '-'}</p>
                    <p><strong>Kontak Pembimbing:</strong> {adminSelectedSanggar.kontakPembina || '-'}</p>
                    {/* Retrieve matched items */}
                    {(() => {
                      const matS = allSanggars.find(s => s.username === adminSelectedSanggar.username);
                      return (
                        <>
                          <p><strong>Email Penghubung:</strong> {matS?.email || '-'}</p>
                        </>
                      );
                    })()}
                  </div>

                  <div className="h-px bg-slate-100" />

                  {/* Documents of Selected Sanggar */}
                  {(() => {
                    const matS = allSanggars.find(s => s.username === adminSelectedSanggar.username);
                    if (!matS) return <p className="text-xs text-red-500 font-bold">Pendaftar bersangkutan belum melengkapi profile data sekolah &amp; berkas saat ini.</p>;
                    return (
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Document Uploads Checklist</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {matS.naskahFile && <a href={matS.naskahFile} target="_blank" rel="noreferrer" className="p-2.5 bg-slate-50 hover:bg-slate-100 border rounded-xl text-[10px] font-semibold text-slate-700 flex items-center justify-between"><span>📄 Naskah Lakon</span> <ChevronRight className="w-3.5 h-3.5 text-slate-400" /></a>}
                          {matS.plotLampu && <a href={matS.plotLampu} target="_blank" rel="noreferrer" className="p-2.5 bg-slate-50 hover:bg-slate-100 border rounded-xl text-[10px] font-semibold text-slate-700 flex items-center justify-between"><span>💡 Plot Tata Lampu</span> <ChevronRight className="w-3.5 h-3.5 text-slate-400" /></a>}
                          {matS.poster && <a href={matS.poster} target="_blank" rel="noreferrer" className="p-2.5 bg-slate-50 hover:bg-slate-100 border rounded-xl text-[10px] font-semibold text-slate-700 flex items-center justify-between"><span>🖼️ Poster Acara</span> <ChevronRight className="w-3.5 h-3.5 text-slate-400" /></a>}
                          {matS.artistik && <a href={matS.artistik} target="_blank" rel="noreferrer" className="p-2.5 bg-slate-50 hover:bg-slate-100 border rounded-xl text-[10px] font-semibold text-slate-700 flex items-center justify-between"><span>🛠️ Sketsa Stage</span> <ChevronRight className="w-3.5 h-3.5 text-slate-400" /></a>}
                          {matS.sinopsis && <a href={matS.sinopsis} target="_blank" rel="noreferrer" className="p-2.5 bg-slate-50 hover:bg-slate-100 border rounded-xl text-[10px] font-semibold text-slate-700 flex items-center justify-between"><span>✍️ Sinopsis Cerita</span> <ChevronRight className="w-3.5 h-3.5 text-slate-400" /></a>}
                          {matS.profilSanggar && <a href={matS.profilSanggar} target="_blank" rel="noreferrer" className="p-2.5 bg-slate-50 hover:bg-slate-100 border rounded-xl text-[10px] font-semibold text-slate-700 flex items-center justify-between"><span>🏢 Profil Sanggar</span> <ChevronRight className="w-3.5 h-3.5 text-slate-400" /></a>}
                        </div>

                        {matS.buktiPembayaran && (
                          <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl space-y-2 mt-4 text-xs">
                            <p className="font-bold text-amber-800">Bukti Pembayaran Pendaftaran Mandiri:</p>
                            <a href={matS.buktiPembayaran} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-600 font-bold hover:underline">Tampilkan Lampiran Transfer Bank ↗</a>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Table of Members nested inside admin view of selected Sanggar */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Daftar Anggota / Pemain Terdaftar</h4>
                    {allPeserta.filter(p => p.username === adminSelectedSanggar.username).length === 0 ? (
                      <p className="text-[10px] text-slate-400">Sanggar ini belum mengunggah berkas list pemain saat ini.</p>
                    ) : (
                      <div className="border border-slate-100 rounded-xl overflow-hidden text-[10px]">
                        <table className="w-full text-left">
                          <thead className="bg-slate-50 border-b">
                            <tr>
                              <th className="p-2 w-8">Foto</th>
                              <th className="p-2">Nama Lengkap Sesuai Ijazah</th>
                              <th className="p-2">Peran Kategori</th>
                              <th className="p-2">Nama Tokoh / Karakter</th>
                              <th className="p-2">Kelamin</th>
                              <th className="p-2">Penyakit Bawaan</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {allPeserta.filter(p => p.username === adminSelectedSanggar.username).map(p => (
                              <tr key={p.id}>
                                <td className="p-2"><img src={resolveDriveImage(p.fotoFile)} className="h-6 w-6 rounded-md object-cover" /></td>
                                <td className="p-2 font-bold">{p.nama}</td>
                                <td className="p-2 font-semibold text-amber-700">{p.peran}</td>
                                <td className="p-2 text-slate-700 font-medium italic">{p.namaTokoh || '-'}</td>
                                <td className="p-2 text-slate-500">{p.jenisKelamin}</td>
                                <td className="p-2 text-red-650">{p.penyakitBawaan || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  <div className="h-px bg-slate-100" />

                  {/* Dynamic Action Trigger Verification box */}
                  <div className="p-4 bg-slate-50 border rounded-2xl space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">VERIFIKASI &amp; PERIKSA STATUS AKTIF</h4>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setAdminActionStatus(prev => ({ ...prev, status: 'Disetujui' }))}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                          adminActionStatus.status === 'Disetujui' 
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600' 
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        Setujui &amp; Konfirmasi
                      </button>
                      
                      <button
                        onClick={() => setAdminActionStatus(prev => ({ ...prev, status: 'Ditolak' }))}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                          adminActionStatus.status === 'Ditolak' 
                            ? 'bg-red-600 hover:bg-red-700 text-white border-red-600' 
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        Minta Revisi &amp; Tolak
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Catatan Tambahan untuk Pembimbing (Tercantum pada dashboard &amp; Email)</label>
                      <textarea
                        className="w-full p-2 bg-white border text-xs placeholder-slate-400 rounded-xl"
                        rows={2}
                        placeholder="Contoh: Bukti transfer kurang jelas, harap unggah kembali struk bayar yang sah..."
                        value={adminActionStatus.catatan}
                        onChange={(e) => setAdminActionStatus(prev => ({ ...prev, catatan: e.target.value }))}
                      />
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => handleAdminVerifyPendaftar(adminSelectedSanggar.username, adminActionStatus.status === 'Disetujui')}
                        disabled={isActionLoading}
                        className={`px-6 py-2.5 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer ${
                          adminActionStatus.status === 'Disetujui' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                        }`}
                      >
                        Selesaikan Konfirmasi Verifikasi
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 border-2 border-dashed border-slate-200 rounded-3xl text-center bg-white">
                  <UserCheck className="w-8 h-8 text-slate-350 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-500">Pilih Sanggar Pendaftar untuk memulai Verifikasi Berkas</p>
                  <p className="text-[10px] text-slate-400 mt-1 max-w-sm mx-auto">Klik salah satu sanggar pendaftaran di baris sebelah kiri untuk merespon berkas yang diajukan.</p>
                </div>
              )}

              {/* LIST OF TICKET PURCHASE ENTRIES IN ADMIN PANEL VIEW */}
              <div className="bg-white border border-slate-200 p-6 rounded-3xl">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 mb-4">
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest">📋 Daftar Booking Tiket Penonton</h3>
                  <span className="text-[10px] font-bold text-purple-600 px-2 py-0.5 bg-purple-50 rounded-full">{allTickets.length} Transaksi</span>
                </div>

                {allTickets.length === 0 ? (
                  <p className="text-xs text-slate-450 text-center py-4">Belum ada pemesanan tiket penonton.</p>
                ) : (
                  <div className="overflow-x-auto border border-slate-100 rounded-xl">
                    <table className="w-full text-left text-[10px] text-slate-700 min-w-[600px]">
                      <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase font-bold">
                        <tr>
                          <th className="p-2.5">ID Tiket</th>
                          <th className="p-2.5">Pemesan</th>
                          <th className="p-2.5">Email</th>
                          <th className="p-2.5">Jumlah</th>
                          <th className="p-2.5">Kategori</th>
                          <th className="p-2.5">Kursi</th>
                          <th className="p-2.5 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {allTickets.map((t) => (
                          <tr key={t.id} className="hover:bg-slate-50/40">
                            <td className="p-2.5 font-mono font-bold text-slate-900">{t.id}</td>
                            <td className="p-2.5 font-bold">{t.namaPemesan} <span className="text-[8px] text-slate-450">({t.noHp})</span></td>
                            <td className="p-2.5 text-slate-500">{t.email}</td>
                            <td className="p-2.5 font-semibold text-center">{t.jumlah}</td>
                            <td className="p-2.5"><span className="px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-slate-100 text-slate-600">{t.kategori}</span></td>
                            <td className="p-2.5 font-mono text-[9px] text-slate-650">{t.kursi ? t.kursi.join(', ') : '-'}</td>
                            <td className="p-2.5 text-center flex flex-col items-center gap-1">
                               {t.buktiPembayaran ? (
                                <a href={t.buktiPembayaran} target="_blank" rel="noreferrer" className="text-[8px] font-bold text-blue-600 hover:underline">Lihat Bukti</a>
                               ) : (<span className="text-[8px] text-slate-400">-</span>)}
                              <select
                                value={t.status}
                                onChange={(e) => handleAdminUpdateTicketPayment(t.id, e.target.value)}
                                className={`px-2 py-1 flex-1 rounded-lg text-[9px] font-bold border transition-colors cursor-pointer focus:outline-hidden appearance-none text-center ${
                                  t.status === 'Paid' 
                                    ? 'bg-emerald-100 border-emerald-200 text-emerald-800' 
                                    : t.status === 'Pending Verifikasi'
                                    ? 'bg-amber-100 border-amber-200 text-amber-800'
                                    : 'bg-red-100 border-red-200 text-red-800'
                                }`}
                              >
                                <option value="Unpaid">Unpaid</option>
                                <option value="Pending Verifikasi">Pending</option>
                                <option value="Paid">Paid</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
          )}
        </div>
      )}

      {/* DYNAMIC MODAL REGISTER NEW PARTICIPANT */}
      <AnimatePresence>
        {showAddPesertaModal && (() => {
          const isActor = ['Aktor Utama', 'Aktris Utama', 'Aktor Pembantu', 'Aktris Pembantu'].includes(newPesertaForm.peran);
          
          return (
            <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-none">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white border border-slate-200 max-w-3xl w-full rounded-3xl p-6 shadow-2xl relative space-y-4 flex flex-col max-h-[90vh]"
              >
                <div>
                  <h4 className="text-base font-bold text-slate-900 font-sans tracking-tight">
                    {editingPeserta ? 'Edit Informasi Anggota' : 'Daftarkan Anggota Baru'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {editingPeserta 
                      ? 'Perbarui detail data aktor/crew panggung dan unggah pas foto 3x4 formal.' 
                      : 'Tuliskan detail aktor/crew panggung dan unggah pas foto 3x4 formal.'}
                  </p>
                </div>

                <form onSubmit={handleAddPeserta} className="space-y-4 flex flex-col overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 overflow-y-auto max-h-[60vh] pr-2 py-1">
                    {/* Left Column: Identitas & Peran */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nama Sesuai Ijazah Resmi</label>
                        <input
                          type="text"
                          placeholder="Nama lengkap peserta"
                          className="w-full text-xs px-3 py-2 border rounded-xl animate-none bg-slate-50 text-slate-900 border-slate-200"
                          value={newPesertaForm.nama}
                          onChange={(e) => setNewPesertaForm(prev => ({ ...prev, nama: e.target.value }))}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Peran dalam Tim</label>
                          <select
                            className="w-full text-xs px-2.5 py-2 border rounded-xl bg-slate-50 text-slate-900 border-slate-200"
                            value={newPesertaForm.peran}
                            onChange={(e) => setNewPesertaForm(prev => ({ ...prev, peran: e.target.value }))}
                          >
                            <option value="Sutradara">Sutradara</option>
                            <option value="Aktor Utama">Aktor Utama</option>
                            <option value="Aktris Utama">Aktris Utama</option>
                            <option value="Aktor Pembantu">Aktor Pembantu</option>
                            <option value="Aktris Pembantu">Aktris Pembantu</option>
                            <option value="Penata Musik">Penata Musik</option>
                            <option value="Penata Lampu">Penata Lampu</option>
                            <option value="Stage Manager">Stage Manager</option>
                            <option value="Tim Artistik">Tim Artistik</option>
                            <option value="Publikasi dan Dokumentasi">Publikasi dan Dokumentasi</option>
                            <option value="Pelatih">Pelatih</option>
                            <option value="Pembina">Pembina</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Jenis Kelamin</label>
                          <select
                            className="w-full text-xs px-2.5 py-2 border rounded-xl bg-slate-50 text-slate-900 border-slate-200"
                            value={newPesertaForm.jenisKelamin}
                            onChange={(e) => setNewPesertaForm(prev => ({ ...prev, jenisKelamin: e.target.value as any }))}
                          >
                            <option value="Laki-laki">Laki-laki</option>
                            <option value="Perempuan">Perempuan</option>
                          </select>
                        </div>
                      </div>

                      {isActor && (
                        <div className="animate-none">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nama Tokoh / Karakter</label>
                          <input
                            type="text"
                            className="w-full text-xs px-3 py-2 border rounded-xl bg-slate-50 text-slate-900 border-slate-200"
                            placeholder="Contoh: Sangaji, Ibu, dsb."
                            value={newPesertaForm.namaTokoh}
                            onChange={(e) => setNewPesertaForm(prev => ({ ...prev, namaTokoh: e.target.value }))}
                            required={isActor}
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Riwayat Penyakit Bawaan (Opsional)</label>
                        <input
                          type="text"
                          className="w-full text-xs px-3 py-2 border rounded-xl bg-slate-50 text-slate-900 border-slate-200"
                          placeholder="misal: Asma, Alergi makanan tertentu, dsb."
                          value={newPesertaForm.penyakitBawaan}
                          onChange={(e) => setNewPesertaForm(prev => ({ ...prev, penyakitBawaan: e.target.value }))}
                        />
                      </div>
                    </div>

                    {/* Right Column: Unggah Berkas & Pas Foto */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Pas Foto Resmi 3x4 (Maksimal 2MB)</label>
                        {newPesertaForm.fotoFile ? (
                          <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border mt-1">
                            <img src={resolveDriveImage(newPesertaForm.fotoFile)} alt="" className="h-10 w-8 rounded-md object-cover border" />
                            <span className="text-[10px] text-slate-500 truncate grow">{pesertaPhotoName || 'Pas Foto Terunggah'}</span>
                            <button type="button" onClick={() => setNewPesertaForm(prev => ({ ...prev, fotoFile: '' }))} className="text-[10px] text-red-500 font-bold cursor-pointer">Hapus</button>
                          </div>
                        ) : (
                          <div className="relative border border-dashed rounded-xl p-4 text-center cursor-pointer hover:bg-slate-50 mt-1">
                            <input type="file" accept="image/*" onChange={handleParticipantPhotoUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                            <Upload className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                            <span className="text-[10px] text-slate-500 block">Pilih Pas Foto 3x4 (Formal)</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Kartu Pelajar / Ijazah Terakhir (Maksimal 2MB)</label>
                        {newPesertaForm.kartuPelajarFile ? (
                          <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border mt-1">
                            <img src={newPesertaForm.kartuPelajarFile} alt="" className="h-10 w-14 rounded-md object-cover border" />
                            <span className="text-[10px] text-slate-500 truncate grow">{pesertaKartuName || 'Kartu Identitas Terunggah'}</span>
                            <button type="button" onClick={() => setNewPesertaForm(prev => ({ ...prev, kartuPelajarFile: '' }))} className="text-[10px] text-red-500 font-bold cursor-pointer">Hapus</button>
                          </div>
                        ) : (
                          <div className="relative border border-dashed rounded-xl p-4 text-center cursor-pointer hover:bg-slate-50 mt-1">
                            <input type="file" accept="image/*,.pdf" onChange={handleParticipantKartuUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                            <Upload className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                            <span className="text-[10px] text-slate-500 block">Pilih Kartu Pelajar / Ijazah</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 shrink-0">
                    <button
                      type="button"
                      onClick={handleCloseAddPesertaModal}
                      className="px-4 py-2 border text-slate-600 rounded-xl text-xs hover:bg-slate-50 transition-colors"
                    >
                      Batalkan
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-amber-600 transition-all hover:scale-[1.02] shadow-xs cursor-pointer"
                    >
                      {editingPeserta ? 'Simpan Perubahan' : 'Daftarkan Peserta'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* CONFIRMATION MODAL DELETE PARTICIPANT */}
      <AnimatePresence>
        {pesertaIdToDelete && (() => {
          const targetParticipant = pesertaList.find(p => p.id === pesertaIdToDelete) || allPeserta.find(p => p.id === pesertaIdToDelete);
          return (
            <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white border border-slate-200 max-w-md w-full rounded-3xl p-6 shadow-2xl relative space-y-4 animate-none"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                    <Trash2 className="w-5 h-5 text-red-500 animate-bounce" style={{ animationDuration: '2s' }} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 font-sans uppercase tracking-wider">Hapus Anggota Tim?</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Tindakan ini permanen</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs text-slate-600 font-medium leading-relaxed">
                  Apakah Anda yakin ingin menghapus peserta <span className="font-bold text-red-600">&ldquo;{targetParticipant?.nama}&rdquo;</span> dari pendaftaran kelompok Anda? Tindakan ini tidak dapat dibatalkan.
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setPesertaIdToDelete(null)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs hover:bg-slate-50 font-bold transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmRemovePeserta}
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-all shadow-md active:scale-[0.98] cursor-pointer"
                  >
                    Ya, Hapus
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* BEAUTIFUL GLOBAL GLASSMORPHISM ACTION LOADER */}
      <AnimatePresence>
        {isActionLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#0c0806]/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none"
          >
            <div className="relative flex flex-col items-center">
              {/* Spinning outer golden concentric ring */}
              <div className="relative w-24 h-24 flex items-center justify-center bg-[#150f0c] border border-[#b88a44]/45 rounded-full shadow-[0_0_50px_rgba(184,138,68,0.35)]">
                {/* Concentric rotating border */}
                <div className="absolute inset-1.5 border-2 border-stone-900 rounded-full" />
                <div className="absolute inset-1.5 border-2 border-[#b88a44]/60 border-t-transparent border-r-transparent rounded-full animate-spin" style={{ animationDuration: '1.2s' }} />
                <div className="absolute inset-3 border border-[#b88a44]/15 border-dashed rounded-full pointer-events-none animate-spin-slow" style={{ animationDuration: '8s' }} />
                
                {/* Center Database / Refresh symbol */}
                <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" style={{ animationDuration: '3s' }} />
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mt-6 space-y-2 max-w-sm"
              >
                <h4 className="text-xs font-black font-outfit uppercase tracking-widest text-[#B88A44]">Sinkronisasi Server</h4>
                <div className="flex items-center justify-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                  <p className="text-xs text-stone-200 font-medium tracking-wide">Menghubungkan ke server &amp; mengirim data...</p>
                </div>
                <p className="text-[9px] text-stone-400 leading-relaxed font-sans mt-2 bg-stone-900/60 border border-stone-850 px-3.5 py-1.5 rounded-xl">
                  Harap tunggu beberapa saat. Jangan menutup halaman atau menyegarkan peramban Anda agar proses pengemasan data tuntas tanpa kendala.
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

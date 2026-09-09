'use client';

import { motion } from 'motion/react';
import { BookOpen, UserCheck, ShieldCheck, Mail, Phone, CalendarRange, Medal, CreditCard, Clock } from 'lucide-react';

interface InfoSectionProps {
  settings?: any;
}

export default function InfoSection({ settings }: InfoSectionProps) {
  const categories = [
    'Penyaji Terbaik I', 'Penyaji Terbaik II', 'Penyaji Terbaik III',
    'Penyutradaraan Terbaik', 'Aktor Terbaik', 'Aktris Terbaik',
    'Aktor Pembantu Terbaik', 'Aktris Pembantu Terbaik',
    'Penata Artistik Terbaik', 'Penata Musik Terbaik',
    'Video Trailer Terbaik'
  ];

  const requirements = [
    {
      icon: <ShieldCheck className="w-5 h-5 text-amber-600" />,
      title: settings?.petunjuk1Title || 'Batas SARA & Pornografi',
      desc: settings?.petunjuk1Desc || 'Naskah dan pementasan murni seni kreatif, tidak boleh mengandung SARA, pornografi, maupun pornoaksi.'
    },
    {
      icon: <BookOpen className="w-5 h-5 text-amber-600" />,
      title: settings?.petunjuk2Title || 'Konstruksi & Bentuk Realis',
      desc: settings?.petunjuk2Desc || 'Naskah drama harus memiliki konstruksi dramatik yang kuat serta disajikan dalam bentuk pementasan realis.'
    },
    {
      icon: <Clock className="w-5 h-5 text-amber-600" />,
      title: settings?.petunjuk3Title || 'Durasi Pertunjukan',
      desc: settings?.petunjuk3Desc || 'Setiap kelompok/sanggar teater diberikan waktu mentas maksimal 45 menit lengkap.'
    },
    {
      icon: <UserCheck className="w-5 h-5 text-amber-600" />,
      title: settings?.petunjuk4Title || 'Komposisi Tim',
      desc: settings?.petunjuk4Desc || 'Siswa aktif di NTB. Panitia menyediakan ID Card untuk 20 peserta dan Tim + 1 Pelatih + 1 Pembina + 1 Sutradara + 1 Pubdok + 1 Stage Manager.'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 bg-[#0a0806] text-stone-200">
      
      {/* Title */}
      <div className="text-center mb-16 space-y-3">
        <h2 className="text-3xl md:text-5xl font-black font-outfit text-stone-100 tracking-tight">Kriteria Teknis &amp; Petunjuk</h2>
        <div className="h-1 w-20 bg-amber-500 mx-auto rounded-full" />
        <p className="text-stone-400 text-xs uppercase tracking-widest font-semibold">
          Pedoman Pelaksanaan Festival Teater Modern Pelajar (FTMP) XXVI Se-NTB
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        
        {/* Kolom 1: Pelaksanaan & Biaya */}
        <div className="bg-[#120e0b] border border-stone-850 rounded-3xl p-6 shadow-2xl flex flex-col justify-between">
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-100 flex items-center gap-2 border-b border-stone-800/80 pb-3">
              <CalendarRange className="w-5 h-5 text-amber-500" /> Pelaksanaan &amp; Kontribusi
            </h3>
            
            <div className="space-y-4 text-stone-300">
              <div>
                <p className="text-[10px] text-stone-500 uppercase font-bold tracking-wider">TANGGAL EVENT UTAMA</p>
                <p className="text-sm font-bold text-stone-100">{settings?.pelaksanaanTanggal || '9 s.d. 20 November 2026'}</p>
              </div>

              <div>
                <p className="text-[10px] text-stone-500 uppercase font-bold tracking-wider">TEMPAT PEMENTASAN</p>
                <p className="text-sm font-bold text-stone-100">{settings?.pelaksanaanTempat || 'Arena Terbuka Taman Budaya Provinsi Nusa Tenggara Barat'}</p>
              </div>

              <div>
                <p className="text-[10px] text-stone-500 uppercase font-bold tracking-wider">BIAYA REGISTRASI</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-amber-505">{settings?.biayaRegistrasi || 'Rp350.000'}</span>
                  <span className="text-xs text-stone-500 font-semibold">/ sanggar</span>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-[10px] text-stone-500 uppercase font-bold tracking-wider">NOMOR REKENING RESMI</p>
                <div className="mt-2 bg-[#18130f] border border-stone-800/80 p-4 rounded-xl flex items-start gap-3">
                  <CreditCard className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-stone-400">Bank BRI No. Rekening:</p>
                    <p className="text-xs font-mono font-bold text-amber-400 tracking-wider">{settings?.rekeningNomor || '3495-01-046321-533'}</p>
                    <p className="text-[10px] text-stone-400 mt-1">Atas nama: <span className="font-bold text-stone-200">{settings?.rekeningNama || 'Teater Putih'}</span></p>
                  </div>
                </div>
                <p className="text-[9px] text-stone-500 mt-2 leading-relaxed opacity-75">
                  Atau selesaikan langsung di Sekretariat UKMF Teater Putih Gedung Ormawa Lt. 2, Jl. Majapahit No. 62 FKIP Universitas Mataram.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-stone-800/85 text-[10px] font-bold text-amber-500 uppercase tracking-wider">
            * Pendaftaran ditutup penuh: 4 Oktober 2026
          </div>
        </div>

        {/* Kolom 2: Persyaratan Teknis Naskah & Pementasan */}
        <div className="bg-[#120e0b] border border-stone-850 rounded-3xl p-6 shadow-2xl lg:col-span-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-905 flex items-center gap-2 border-b border-stone-800/80 pb-3 mb-6">
            <BookOpen className="w-5 h-5 text-amber-500" /> Aturan Tata Panggung &amp; Tim
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {requirements.map((req, index) => (
              <div key={index} className="flex gap-4 p-4 rounded-2xl bg-[#18130f] border border-stone-800/80 hover:bg-stone-900/40 transition-colors">
                <div className="p-2 h-fit bg-amber-500/10 border border-amber-500/25 rounded-lg shrink-0 text-amber-500">
                  {req.icon}
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-stone-100">{req.title}</h4>
                  <p className="text-[10px] text-stone-400 leading-relaxed">{req.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-[#241315]/50 border border-[#7a1c1d]/35 p-4 rounded-xl text-stone-300">
            <p className="font-extrabold text-amber-400 mb-1 flex items-center gap-1 text-xs">📋 Dokumentasi Persyaratan yang Harus Diunggah:</p>
            <p className="text-[10px] leading-relaxed text-stone-400">
              1. Profil Sejarah Sanggar Seni | 2. Biodata Peserta &amp; Crew Lengkap beserta Pas Foto 3x4 | 3. Plot Tata Lampu Utama | 4. Sketsa Artistik Setting Pementasan | 5. Draft Naskah Lakon PDF/Doc | 6. Bukti Transfer Bank Sah.
            </p>
          </div>
        </div>
      </div>

      {/* Grid Bawah: Kategori Juara & Kontak */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Kolom 1 Juara */}
        <div className="bg-[#120e0b] border border-stone-850 rounded-3xl p-6 shadow-2xl lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-stone-100 flex items-center gap-2 border-b border-stone-800/80 pb-3">
            <Medal className="w-5 h-5 text-amber-500" /> Kategori Kejuaraan &amp; Gelar
          </h3>
          
          <p className="text-xs text-stone-400 font-medium">
            Seluruh kelompok memperoleh sertifikat resmi, memperebutkan Piala Bergilir Gubernur NTB, piala individu, dan dana pembinaan:
          </p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {categories.map((cat, idx) => (
              <div 
                key={idx} 
                className="px-3 py-2 bg-[#1c1612] border border-stone-800/85 rounded-lg text-xs font-bold text-stone-205 hover:border-amber-500/40 transition-colors"
                id={`cat-${idx}`}
              >
                🏆 {cat}
              </div>
            ))}
          </div>
        </div>

        {/* Kolom Kontak Narahubung */}
        <div className="bg-[#120e0b] border border-stone-850 rounded-3xl p-6 shadow-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-100 flex items-center gap-2 border-b border-stone-800/80 pb-3">
              <Phone className="w-5 h-5 text-amber-500" /> Kontak Narahubung Panitia
            </h3>
            
            <div className="space-y-3">
              <div className="p-3 bg-[#1c1612] border border-stone-800/85 rounded-xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center text-xs font-bold shrink-0">
                  NA
                </div>
                <div>
                  <p className="text-[9px] text-stone-500 font-bold uppercase tracking-wider">Narahubung 1</p>
                  <p className="text-xs font-bold text-stone-200">{settings?.kontak1Nama || 'Liza Hafsa'}</p>
                  <p className="text-[10px] font-bold text-amber-400 mt-0.5">{settings?.kontak1Hp || '081906901245'}</p>
                </div>
              </div>

              <div className="p-3 bg-[#1c1612] border border-stone-800/85 rounded-xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center text-xs font-bold shrink-0">
                  LO
                </div>
                <div>
                  <p className="text-[9px] text-stone-500 font-bold uppercase tracking-wider">Narahubung 2</p>
                  <p className="text-xs font-bold text-stone-200">{settings?.kontak2Nama || 'Bq Dinda Puspita Rinjani'}</p>
                  <p className="text-[10px] font-bold text-amber-400 mt-0.5">{settings?.kontak2Hp || '087855375689'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-amber-500/[0.03] border border-amber-500/15 rounded-xl text-center">
            <p className="text-[9px] text-stone-500">Butuh bantuan konsultasi naskah atau pengisian data?</p>
            <p className="text-xs font-bold text-amber-400 mt-0.5">LO Pendamping Sanggar selalu siap siaga</p>
          </div>

          <div className="mt-6">
            <div className="flex gap-2">
              <a 
                href={settings?.juknisUrl || '#'} 
                target="_blank" 
                rel="noreferrer"
                className="flex-1 px-4 py-3 bg-[#7a1c1d] hover:bg-[#8e2528] text-stone-100 border border-[#b88a44]/30 shadow-lg text-xs font-bold rounded-xl text-center transition-colors font-outfit uppercase tracking-wider font-semibold"
                id="btn-download-juknis"
              >
                Unduh Petunjuk Teknis
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Download, BookOpen, Search, X, Layers, User } from 'lucide-react';

interface Script {
  id: string;
  judul: string;
  pengarang: string;
  sinopsis: string;
  fileUrl: string;
  size: string;
}

interface ScriptDownloadSectionProps {
  scripts: Script[];
}

export default function ScriptDownloadSection({ scripts }: ScriptDownloadSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);

  const filteredScripts = scripts.filter(sc => 
    sc.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sc.pengarang.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getScriptPreviewText = (id: string) => {
    if (id === 'sc-1') {
      return `NASKAH DRAMA: "AYAHKU PULANG"
Oleh Usmar Ismail

Karakter Utama:
- RADEN SALEH (Orang tua, kurus, berpakaian compang-camping, Ayah yang pergi)
- IBU / TINA (Setengah baya, penyabar, lembut hati)
- GUNARTO (Anak sulung, keras kepala, pemarah, menaruh dendam pada ayahnya)
- MAIMUN (Anak kedua, lebih lunak, penuh rasa rindu)

[BABAK KESATU - MALAM HARI RAYA]
(Keadaan di dalam gubuk sederhana milik Tina. Terdengar takbir berkumandang dari kejauhan melambangkan malam Lebaran yang tenang namun sarat kerinduan. Tina sedang mempersiapkan ketupat bersama Maimun.)

TIB-TINA:
Maimun, malam raya malam pembawa berkah. Tapi mengapa hatimu nampak begitu masygul? Adakah hal lain yang melintas di benakmu malam ini?

MAIMUN:
Ibu... Aku senang malam ini takbir berkumandang indah. Namun, entah mengapa, bayangan tentang Ayah kembali terbersit di angan-anganku. Sudah hampir dua puluh tahun sejak beliau melangkah keluar dari pintu ini tanpa kabar berita. Di mana kah kiranya beliau malam ini?

(Gunarto masuk dengan langkah berat. Mengeringkan keringat di keningnya. Tampangnya kaku dan matanya menusuk.)

GUNARTO:
Mengapa nama lelaki itu disebut lagi di rumah ini? Dia bukan ayah kita! Ayah yang sejati tidak akan melarikan diri membiarkan keluarganya mati kelaparan dan ibunya memeras keringat mencuci baju orang demi sesuap nasi!

TINA:
(Sambil menitikkan air mata)
Gunarto, anakku, janganlah memelihara api dendam di dadamu, apalagi di malam yang suci ini. Bagaimanapun juga, darahnya mengalir di nadimu.

GUNARTO:
Darah ini adalah keringat Ibu! Sanggar dan kehormatan rumah ini kita bangun tanpa sepeser pun uang darinya. Biar dia mati di dalam kemiskinannya, itu adalah balasan setimpal!

(Ketukan perlahan terdengar di pintu kayu gubuk. Semua terdiam. Suasana hening seketika...)`;
    }
    
    if (id === 'sc-2') {
      return `NASKAH DRAMA: "BILA MALAM BERTAMBAH MALAM"
Oleh Putu Wijaya

Karakter Utama:
- GUSTI BIANG (Bangsawan tua Bali yang memegang kekerabatan kasta dengan kaku)
- WAYAN ANGGA (Mantan pelayan kasta rendah yang dituduh melanggar adat)
- NYOMAN (Gadis muda, cantik, mencintai Wayan namun terjebak adat)

[BABAK I - LATAR PELATARAN BANGSAWAN]
(Pelataran puri bangsawan yang sepi dibalut temaram lampu minyak Bali. Angin malam berdesir. Gusti Biang duduk di kursi kayu berukir, memandang kosong ke angkasa luar.)

GUSTI BIANG:
Malam bertambah malam, Nyoman! Namun kehormatan dinasti kita tak boleh meluncur terbawa arus modern yang liar ini. Kasta kita adalah darah suci yang mengalir dari leluhur Majapahit.

NYOMAN:
Gusti Biang... Zaman telah berganti. Di luar sana, orang-orang tidak lagi mengukur kelayakan hati manusia hanya dari kasta kelahirannya. Cinta juga tidak butuh stempel kasta.

GUSTI BIANG:
Kau berani menjawab kata-kataku, anak kemarin sore?! Wayan Angga itu hanyalah anak haram pelayan yang dulu kita beri makan! Beraninya dia melayangkan impiannya meminangmu!

(Suara gaduh langkah kaki terdengar di gerbang luar puri...)`;
    }

  return `NASKAH DRAMA: "RT NOL RW NOL"
Oleh Iwan Simatupang

Karakter Utama:
- ATENG (Gelasndangan intelektual, mantan mahasiswa filsafat)
- KAKEK (Gelandangan lanjut usia yang bijaksana namun pikun)
- ANI (Perempuan malam yang mencari kehangatan percakapan)

[BABAK UTAMA - SEPANJANG JALAN KOLONG JEMBATAN]
(Sebuah kolong jembatan gelap di tengah megahnya ibu kota metropolitan. Tumpukan kardus bekas menjadi kursi kehormatan kaum tersisih.)

ATENG:
Kita tinggal di RT Nol, RW Nol. Alamat kita adalah lintasan langit, dan batas ruang kita adalah ketiadaan. Bukankah itu kebebasan yang paling paripurna, Kek?`;
  };

  const handleDownload = (script: Script) => {
    if (script.fileUrl && script.fileUrl !== '#' && !script.fileUrl.startsWith('https://docs.google.com/document/d/150X7LzXp2m-n_K5qX5I2mS_U1X0Lp_T_demo')) {
      window.open(script.fileUrl, '_blank');
      return;
    }
    const textBlob = new Blob([getScriptPreviewText(script.id)], { type: 'text/plain' });
    const url = URL.createObjectURL(textBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `NASKAH_FTMP_2026_${script.judul.replace(/ /g, '_').toUpperCase()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 bg-[#0a0806] text-stone-200">
      
      {/* Title */}
      <div className="text-center mb-12 space-y-3">
        <h2 className="text-3xl md:text-5xl font-black font-outfit text-stone-100 tracking-tight">Perpustakaan Naskah Lakon</h2>
        <div className="h-1 w-20 bg-amber-500 mx-auto rounded-full" />
        <p className="text-stone-400 text-xs uppercase tracking-widest font-semibold">
          Koleksi Sastra Teater Realis Pilihan Kurator Pentas FTMP Se-NTB
        </p>
      </div>

      {/* Search and Filters */}
      <div className="relative max-w-sm mx-auto mb-10">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-500">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          placeholder="Cari naskah atau nama sasterawan..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[#120e0b] border border-stone-850 rounded-xl text-stone-100 placeholder-stone-500 text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-amber-500/25 focus:border-amber-500 transition-all shadow-xl"
        />
      </div>

      {/* Grid of manuscripts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredScripts.map((script) => (
          <div 
            key={script.id}
            className="group relative bg-[#120e0b] border border-stone-850 hover:border-amber-500/50 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between shadow-xs hover:shadow-2xl hover:shadow-amber-950/10"
          >
            <div>
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-550 mb-4 group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5 text-amber-500" />
              </div>
              <h3 className="text-sm font-black text-stone-100 group-hover:text-amber-400 transition-colors line-clamp-1">{script.judul}</h3>
              <p className="text-[10px] text-stone-450 flex items-center gap-1 mt-1 mb-3 font-semibold">
                <User className="w-3 h-3 text-amber-550/60" /> Karya: {script.pengarang}
              </p>
              <p className="text-xs text-stone-400 line-clamp-3 leading-relaxed mb-6 font-medium">{script.sinopsis}</p>
            </div>

            <div className="space-y-3 pt-4 border-t border-stone-800/60">
              <div className="flex justify-between items-center text-[9px] text-stone-500 font-bold font-mono">
                <span>FORMAT: TXT / DOCUMENT</span>
                <span>UKURAN: {script.size}</span>
              </div>
              
              <div className="pt-2">
                <button
                  onClick={() => handleDownload(script)}
                  className="w-full px-3 py-2.5 bg-[#7a1c1d] hover:bg-[#8e2528] text-[#fdfcf7] rounded-xl text-[11px] font-black flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-center border border-[#a42025]/30 shadow-md"
                >
                  <Download className="w-3.5 h-3.5" /> Unduh Naskah Lengkap
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredScripts.length === 0 && (
          <div className="col-span-full text-center py-12 bg-[#120e0b] border border-stone-850 rounded-3xl shadow-xs">
            <Layers className="w-8 h-8 text-stone-600 mx-auto mb-2" />
            <p className="text-stone-400 text-xs font-bold">Naskah tidak ditemukan</p>
            <p className="text-[10px] text-stone-550 mt-1">Gunakan kata kunci pencarian naskah lakon lainnya</p>
          </div>
        )}
      </div>
    </div>
  );
}

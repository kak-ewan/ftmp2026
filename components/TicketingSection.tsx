'use client';

import { useState } from 'react';
import { 
  Ticket, 
  MessageSquare, 
  ChevronRight, 
  Send, 
  User, 
  HelpCircle, 
  Calendar,
  Tag
} from 'lucide-react';

interface TicketingSectionProps {
  settings?: any;
}

export default function TicketingSection({ settings }: TicketingSectionProps) {
  const globalSettings = settings?.globalSettings || {};
  
  // Ambil data kontak tiketing khusus dari database (settings / ftmp_db.json)
  const kontakTiketNama = globalSettings.kontakTiketNama || 'Admin Tiketing FTMP';
  const kontakTiketHp = String(globalSettings.kontakTiketHp || '081906901245');

  const pelaksanaanTempat = globalSettings.pelaksanaanTempat || 'Arena Terbuka Taman Budaya Provinsi Nusa Tenggara Barat';
  const priceDefault = settings?.ticketSettings?.price || '25.000';

  // Form State - Cukup isi nama saja!
  const [nama, setNama] = useState('');
  const [validationError, setValidationError] = useState('');

  // Helper untuk normalisasi nomor WhatsApp ke format wa.me (mengubah 08... -> 628...)
  const formatWaNumber = (phone: string) => {
    let clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) {
      clean = '62' + clean.slice(1);
    }
    return clean;
  };

  const handleSendInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) {
      setValidationError('Silakan masukkan Nama Lengkap Anda terlebih dahulu.');
      return;
    }

    // Format pesan WhatsApp yang rapi, ringkas dan sopan
    const message = `Halo Kak ${kontakTiketNama}, saya atas nama *${nama.trim()}* ingin menanyakan informasi terbaru mengenai jadwal pertunjukan lengkap serta harga tiket masuk untuk Festival Teater Modern Pelajar (FTMP) XXVI. 

Mohon info ketersediaan tiket dan cara pembeliannya ya. Terima kasih!`;

    const targetPhoneFormatted = formatWaNumber(kontakTiketHp);
    const waUrl = `https://wa.me/${targetPhoneFormatted}?text=${encodeURIComponent(message)}`;
    
    if (typeof window !== 'undefined') {
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8" id="ticketing-whatsapp-section">
      
      {/* HEADER SECTION */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-[10px] font-bold tracking-widest uppercase">
          <Ticket className="w-3.5 h-3.5" />
          <span>LAYANAN TIKET FESTIVAL</span>
        </div>
        <h2 className="text-2xl font-black font-outfit text-stone-100 tracking-tight uppercase">Informasi & Pemesanan Tiket</h2>
        <p className="text-xs text-stone-400 leading-relaxed font-medium">
          Dapatkan akses masuk untuk menyaksikan pementasan teater pelajar terbaik se-NTB di {pelaksanaanTempat}.
        </p>
      </div>

      {/* SIMPLIFIED BENTO-GRID */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT COLUMN: SUPER SIMPLE FORM (ONLY NAME!) */}
        <div className="md:col-span-7 bg-[#120e0b] border border-stone-850 p-6 rounded-3xl flex flex-col justify-between space-y-6 shadow-2xl">
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-stone-800/80 pb-4">
              <div className="h-9 w-9 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-500">
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold tracking-wide text-stone-100">Tanyakan Jadwal & Harga Tiket</h3>
                <p className="text-[10px] text-stone-500 font-semibold mt-0.5">Cukup isi nama Anda untuk mulai berkonsultasi via WhatsApp</p>
              </div>
            </div>

            <form onSubmit={handleSendInquiry} className="space-y-4">
              {validationError && (
                <div className="p-3 bg-red-950/40 border border-red-900/30 text-red-400 text-xs font-bold rounded-xl">
                  {validationError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-[10px] text-stone-400 uppercase font-bold tracking-wider">Nama Lengkap Pemesan</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-500">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={nama}
                    onChange={(e) => {
                      setNama(e.target.value);
                      setValidationError('');
                    }}
                    placeholder="Masukkan nama lengkap Anda..."
                    className="w-full bg-[#181310] border border-stone-800 rounded-xl pl-10 pr-4 py-3 text-xs text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-500/50 transition-all font-semibold"
                  />
                </div>
              </div>

              {/* QUICK INFO ACCENTS */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-[#181310] border border-stone-850 rounded-xl flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
                  <div>
                    <p className="text-[8px] text-stone-500 font-black uppercase">Jadwal Acara</p>
                    <p className="text-[10px] font-bold text-stone-300">9 - 20 November</p>
                  </div>
                </div>
                <div className="p-3 bg-[#181310] border border-stone-850 rounded-xl flex items-center gap-2">
                  <Tag className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div>
                    <p className="text-[8px] text-stone-500 font-black uppercase">Harga Tiket Mulai</p>
                    <p className="text-[10px] font-mono font-black text-emerald-400">Rp {priceDefault.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTON */}
              <button
                type="submit"
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-950/20 cursor-pointer mt-4"
              >
                <Send className="w-4 h-4" />
                <span>Kirim Permintaan ke WhatsApp Tiketing</span>
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: DEDICATED TICKETING ADMIN CONTACT */}
        <div className="md:col-span-5 bg-[#120e0b] border border-stone-850 p-6 rounded-3xl flex flex-col justify-between space-y-6 shadow-2xl">
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold text-stone-100 uppercase tracking-wider flex items-center gap-2 border-b border-stone-800 pb-3">
              <HelpCircle className="w-4 h-4 text-amber-500" /> Kontak Layanan Tiketing
            </h4>
            
            <p className="text-[11px] text-stone-400 leading-relaxed">
              Layanan pembelian, informasi sisa kursi, dan konfirmasi tiket kini dilayani melalui **WhatsApp Admin Tiketing khusus** yang berbeda dengan admin pendaftaran sanggar.
            </p>

            {/* HIGH-LIGHT DEDICATED WA CARD */}
            <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl space-y-3.5 hover:border-amber-500/20 transition-all group">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-amber-500/15 border border-amber-500/35 rounded-xl flex items-center justify-center text-amber-400 shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-extrabold text-stone-100">{kontakTiketNama}</p>
                  <p className="text-[9px] text-amber-500 font-bold uppercase tracking-widest mt-0.5">Admin Khusus Tiket</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-stone-800/40">
                <span className="text-[10px] font-mono font-bold text-stone-400">{kontakTiketHp}</span>
                <a
                  href={`https://wa.me/${formatWaNumber(kontakTiketHp)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-emerald-600/15 hover:bg-emerald-600 text-emerald-400 hover:text-slate-950 font-black text-[10px] rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                >
                  <span>Chat WA</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>
            </div>
          </div>

          <p className="text-[9px] text-stone-500 leading-relaxed font-semibold italic">
            *Untuk kelancaran transaksi, pastikan Anda langsung berkonsultasi dengan Admin Tiketing kami melalui nomor di atas.
          </p>
        </div>

      </div>

    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Play, Calendar, MapPin, Award } from 'lucide-react';
import Image from 'next/image';

interface HeroSectionProps {
  onNavigate: (tab: string) => void;
  settings?: any;
}

function getTargetDate(tanggalStr: string): Date {
  const defaultDate = new Date('2026-11-09T08:00:00');
  if (!tanggalStr) return defaultDate;

  try {
    const monthsMap: Record<string, number> = {
      jan: 0, januari: 0,
      feb: 1, februari: 1,
      mar: 2, maret: 2,
      apr: 3, april: 3,
      mei: 4, may: 4,
      jun: 5, juni: 5,
      jul: 6, juli: 6,
      agu: 7, agustus: 7,
      sep: 8, september: 8,
      okt: 9, oktober: 9,
      nov: 10, november: 10,
      des: 11, desember: 11, december: 11
    };

    const cleanStr = tanggalStr.toLowerCase();
    
    // Extract year: 4 consecutive digits
    const yearMatch = cleanStr.match(/\b(20\d{2})\b/);
    const year = yearMatch ? parseInt(yearMatch[1], 10) : 2026;

    // Find the month word
    let month = 10; // November default
    for (const [mName, mIdx] of Object.entries(monthsMap)) {
      if (cleanStr.includes(mName)) {
        month = mIdx;
        break;
      }
    }

    // Find the first number in the string which is usually the starting day
    // Remove the year first from the search so we don't pick up the first of year digits
    const strWithoutYear = cleanStr.replace(/\b(20\d{2})\b/, '');
    const dayMatch = strWithoutYear.match(/\b([123]?\d)\b/);
    const day = dayMatch ? parseInt(dayMatch[1], 10) : 9;

    const targetDate = new Date(year, month, day, 8, 0, 0); // 8:00 AM
    if (isNaN(targetDate.getTime())) {
      return defaultDate;
    }
    return targetDate;
  } catch (e) {
    return defaultDate;
  }
}

export default function HeroSection({ onNavigate, settings }: HeroSectionProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  } | null>(null);

  useEffect(() => {
    const target = getTargetDate(settings?.pelaksanaanTanggal || '');
    
    const calculateTime = () => {
      const now = new Date();
      const diff = target.getTime() - now.getTime();
      
      if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      
      return { days, hours, minutes, seconds, isExpired: false };
    };

    // Initial calculation (deferred to next tick to satisfy reactivity rules)
    const initTimeout = setTimeout(() => {
      setTimeLeft(calculateTime());
    }, 0);

    const timer = setInterval(() => {
      setTimeLeft(calculateTime());
    }, 1000);

    return () => {
      clearTimeout(initTimeout);
      clearInterval(timer);
    };
  }, [settings?.pelaksanaanTanggal]);

  const renderCountdown = () => {
    if (!timeLeft) {
      return (
        <div className="inline-flex flex-col items-center gap-1.5 bg-[#14100d] border border-stone-850 px-5 py-2.5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.85)] text-center w-[240px] sm:w-[260px] mx-auto z-20 opacity-70">
          <div className="flex items-center gap-1.5 text-[8px] font-extrabold text-stone-500 uppercase tracking-widest font-outfit">
            <span className="w-1 h-1 rounded-full bg-stone-700 animate-pulse" />
            <span>Menghitung Hari...</span>
          </div>
          <div className="flex items-center gap-3.5">
            <div className="flex flex-col items-center min-w-[32px]">
              <span className="text-lg sm:text-xl font-black text-stone-600 font-mono tracking-tight leading-none">--</span>
              <span className="text-[7px] font-extrabold text-stone-500 uppercase tracking-widest mt-0.5">Hari</span>
            </div>
            <span className="text-stone-700 font-bold">:</span>
            <div className="flex flex-col items-center min-w-[32px]">
              <span className="text-lg sm:text-xl font-black text-stone-600 font-mono tracking-tight leading-none">--</span>
              <span className="text-[7px] font-extrabold text-stone-500 uppercase tracking-widest mt-0.5">Jam</span>
            </div>
            <span className="text-stone-700 font-bold">:</span>
            <div className="flex flex-col items-center min-w-[32px]">
              <span className="text-lg sm:text-xl font-black text-stone-600 font-mono tracking-tight leading-none">--</span>
              <span className="text-[7px] font-extrabold text-stone-500 uppercase tracking-widest mt-0.5">Mnt</span>
            </div>
            <span className="text-stone-700 font-bold">:</span>
            <div className="flex flex-col items-center min-w-[32px]">
              <span className="text-lg sm:text-xl font-black text-stone-600 font-mono tracking-tight leading-none">--</span>
              <span className="text-[7px] font-extrabold text-stone-500 uppercase tracking-widest mt-0.5">Det</span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="inline-flex flex-col items-center gap-1.5 bg-[#14100d]/95 backdrop-blur-md border border-[#b88a44]/55 px-5 py-2.5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.85)] text-center w-[240px] sm:w-[260px] mx-auto z-20"
      >
        <div className="flex items-center gap-1.5 text-[8px] font-extrabold text-amber-500 tracking-widest font-outfit">
          {!timeLeft.isExpired && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
          <span>{timeLeft.isExpired ? 'FESTIVAL TEATER MODERN' : 'PORTAL DIBUKA DALAM'}</span>
        </div>
        
        {timeLeft.isExpired ? (
          <div className="text-[10px] font-black text-amber-500 uppercase font-outfit tracking-wide px-3 py-0.5">
            Pendaftaran Dibuka! 🎉
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center min-w-[32px]">
              <span className="text-lg sm:text-xl font-black text-[#fcfaef] font-mono tracking-tight leading-none drop-shadow-[0_0_8px_rgba(251,191,36,0.2)]">
                {String(timeLeft.days).padStart(2, '0')}
              </span>
              <span className="text-[7px] font-extrabold text-stone-400 uppercase tracking-widest mt-0.5">Hari</span>
            </div>
            <span className="text-amber-500/40 font-bold">:</span>
            <div className="flex flex-col items-center min-w-[32px]">
              <span className="text-lg sm:text-xl font-black text-[#fcfaef] font-mono tracking-tight leading-none drop-shadow-[0_0_8px_rgba(251,191,36,0.2)]">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[7px] font-extrabold text-stone-400 uppercase tracking-widest mt-0.5">Jam</span>
            </div>
            <span className="text-amber-500/40 font-bold">:</span>
            <div className="flex flex-col items-center min-w-[32px]">
              <span className="text-lg sm:text-xl font-black text-[#fcfaef] font-mono tracking-tight leading-none drop-shadow-[0_0_8px_rgba(251,191,36,0.2)]">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[7px] font-extrabold text-stone-400 uppercase tracking-widest mt-0.5">Mnt</span>
            </div>
            <span className="text-amber-500/40 font-bold">:</span>
            <div className="flex flex-col items-center min-w-[32px]">
              <span className="text-lg sm:text-xl font-black text-amber-500 font-mono tracking-tight leading-none drop-shadow-[0_0_10px_rgba(245,158,11,0.5)] animate-pulse">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-[7px] font-extrabold text-amber-500/80 uppercase tracking-widest mt-0.5">Det</span>
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-[#0c0907] border-b border-stone-900 pb-28 pt-16 px-4 text-[#fcfaef]">
      
      {/* Dynamic spotlight beams to enhance theatrical atmosphere */}
      <div className="absolute top-0 left-1/4 w-[160px] h-[500px] bg-amber-500/[0.04] rounded-full blur-[80px] pointer-events-none transform -rotate-12" />
      <div className="absolute top-0 right-1/4 w-[180px] h-[550px] bg-red-800/[0.04] rounded-full blur-[90px] pointer-events-none transform rotate-12" />
      
      {/* High impact background ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] bg-amber-900/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Grid line overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#3e2d1f_1px,transparent_1px),linear-gradient(to_bottom,#3e2d1f_1px,transparent_1px)] bg-[size:6rem_6rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_60%,transparent_100%)] opacity-[0.12] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-14 items-center pt-6 pb-4">
        
        {/* Left Side (5 Columns on Desktop): Premium Brand Logo Showcase & Overlaid Countdown */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="md:col-span-5 flex justify-center md:justify-end pb-10 md:pb-0"
        >
          <div className="relative">
            {/* The circular brand dial / "lingkaran pembatas topeng" */}
            <div className="relative w-64 sm:w-76 h-64 sm:h-76 flex items-center justify-center bg-[#110e0c]/90 border border-[#b88a44]/40 rounded-full p-8 shadow-[0_0_40px_rgba(184,138,68,0.2)] overflow-hidden group">
              {/* Elegant rotating halo pattern in background */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(184,138,68,0.24)_0%,transparent_70%)] opacity-80 group-hover:opacity-100 transition-opacity pointer-events-none" />
              
              {/* Fine outer concentric rings representing 25 years of circle */}
              <div className="absolute inset-2 border border-[#b88a44]/15 rounded-full pointer-events-none" />
              <div className="absolute inset-4 border border-[#b88a44]/5 border-dashed rounded-full pointer-events-none animate-spin-slow" style={{ animationDuration: '40s' }} />
              
              {/* Decorative crosshairs / corner lines typical of premium blueprints */}
              <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-[#b88a44]/35" />
              <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-[#b88a44]/35" />
              <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-[#b88a44]/35" />
              <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-[#b88a44]/35" />
              
              {/* Rounded logo frame */}
              <div className="relative w-full h-full flex items-center justify-center">
                <Image 
                  src="/ftmp.png" 
                  alt="Festival Teater Modern Pelajar Logo" 
                  width={230} 
                  height={230}
                  className="object-contain drop-shadow-[0_0_24px_rgba(184,138,68,0.4)] select-none group-hover:scale-105 transition-transform duration-500" 
                  priority
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            {/* Countdown Badge - placed at bottom rim of circle, overlapping it perfectly */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 z-20">
              {renderCountdown()}
            </div>
          </div>
        </motion.div>

        {/* Right Side (7 Columns on Desktop): Informative Text Blocks & CTAs */}
        <div className="md:col-span-7 text-center md:text-left space-y-6 flex flex-col items-center md:items-start">
          
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3.5 py-1 text-[10px] font-black tracking-wider text-[#fcfaef] bg-[#221714] border border-[#b88a44]/35 rounded-md uppercase shadow-md"
          >
            <Award className="w-3.5 h-3.5 text-amber-500 animate-spin" style={{ animationDuration: '6s' }} />
            <span>FESTIVAL TEATER MODERN PELAJAR XXVI SE-NTB</span>
          </motion.div>

          <div className="space-y-3.5 w-full">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-wider font-outfit text-stone-100 uppercase leading-none drop-shadow-sm"
            >
              FTMP XXVI
            </motion.h1>
            
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-outfit tracking-wide"
              id="hero-title"
            >
              {settings?.heroTitle || 'Arsip Seperempat Abad'}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25 }}
              className="text-stone-300 text-sm sm:text-base leading-relaxed font-outfit font-medium max-w-xl text-stone-300/90"
            >
              {settings?.heroDesc || 'Daftarkan kelompok teater dari sekolahmu dan berlagalah pada panggung bergengsi FTMP XXVI. Tunjukkan tajimu, menangkan Piala Bergilir!'}
            </motion.p>
          </div>

          {/* Bento-style Minimalist Drawers */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 w-full"
          >
            <div className="bg-[#120e0b]/90 border border-stone-800 p-4 rounded-xl text-left hover:border-amber-500/20 transition-all">
              <div className="flex items-center gap-1.5 text-amber-500 font-bold mb-1">
                <Calendar className="w-3.5 h-3.5" />
                <span className="text-[8px] uppercase tracking-wider font-extrabold font-outfit">SABDA JADWAL</span>
              </div>
              <p className="text-[11px] font-bold text-stone-100 leading-tight">{settings?.pelaksanaanTanggal || '9 - 20 Nov 2026'}</p>
              <span className="text-[7.5px] text-stone-400 font-semibold block mt-0.5">Pendaftaran s.d. 4 Okt</span>
            </div>

            <div className="bg-[#120e0b]/90 border border-stone-800 p-4 rounded-xl text-left hover:border-amber-500/20 transition-all">
              <div className="flex items-center gap-1.5 text-amber-500 font-bold mb-1">
                <MapPin className="w-3.5 h-3.5" />
                <span className="text-[8px] uppercase tracking-wider font-extrabold font-outfit">SANGGABUANA</span>
              </div>
              <p className="text-[11px] font-bold text-stone-100 leading-tight">{settings?.pelaksanaanTempat?.split(' ')?.[0] === 'Gedung' ? 'Taman Budaya NTB' : (settings?.pelaksanaanTempat || 'Taman Budaya Provinsi NTB')}</p>
              <span className="text-[7.5px] text-stone-400 font-semibold block mt-0.5">Arena Terbuka</span>
            </div>

            <div className="bg-[#120e0b]/90 border border-stone-800 p-4 rounded-xl text-left hover:border-amber-500/20 transition-all">
              <div className="flex items-center gap-1.5 text-amber-500 font-bold mb-1">
                <Award className="w-3.5 h-3.5" />
                <span className="text-[8px] uppercase tracking-wider font-extrabold font-outfit">PIALA AGUNG</span>
              </div>
              <p className="text-[11px] font-bold text-stone-100 leading-tight flex items-center gap-0.5">Piala Gubernur NTB</p>
              <span className="text-[7.5px] text-stone-400 font-semibold block mt-0.5">Perebutan Bergilir Kasta</span>
            </div>
          </motion.div>

          {/* Majestic Burgundy Red and Dark gold CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 pt-4 w-full"
          >
            <button
              onClick={() => onNavigate('pendaftaran')}
              className="w-full sm:w-auto px-6 py-3.5 bg-[#721c1f] hover:bg-[#8e2528] text-[#fdfcf7] font-black rounded-lg shadow-xl border border-[#a42025]/50 tracking-wider transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer text-xs uppercase font-outfit text-center"
              id="btn-register-now"
            >
              DAFTAR SEKARANG &rarr;
            </button>
            
            <button
              onClick={() => onNavigate('tiket')}
              className="w-full sm:w-auto px-6 py-3.5 bg-[#120e0b]/90 hover:bg-stone-850 text-amber-500 hover:text-amber-400 border border-amber-600/25 rounded-lg transition-all font-black text-xs tracking-wider cursor-pointer font-outfit flex items-center justify-center gap-2"
              id="btn-buy-ticket-now"
            >
              <Play className="w-3 h-3 fill-amber-500 text-amber-500" /> PESAN TIKET
            </button>
          </motion.div>

        </div>
      </div>

      {/* Exquisite Torn Antique Paper Wave Edge divider SVG at bottom */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-20">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[32px] text-[#0a0806] fill-current">
          <path d="M0,0 Q120,25 240,10 T480,30 T720,15 T960,35 T1200,8 L1200,120 L0,120 Z"></path>
        </svg>
      </div>

    </div>
  );
}

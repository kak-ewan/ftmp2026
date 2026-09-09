/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home as HomeIcon, Calendar, BookOpen, UserCheck, Ticket, Landmark, Menu, X, Image as ImageIcon } from 'lucide-react';

import HeroSection from '@/components/HeroSection';
import InfoSection from '@/components/InfoSection';
import ScriptDownloadSection from '@/components/ScriptDownloadSection';
import RegistrationSection from '@/components/RegistrationSection';
import TicketingSection from '@/components/TicketingSection';
import ImageDownloadSection from '@/components/ImageDownloadSection';

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>('beranda');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sessionUser, setSessionUser] = useState<any>(null);

  const handleSetSessionUser = (user: any) => {
    setSessionUser(user);
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem('ftmp_session_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('ftmp_session_user');
      }
    }
  };

  const [dbState, setDbState] = useState<any>({
    accounts: [],
    sanggars: [],
    peserta: [],
    tickets: [],
    appscriptUrl: '',
    scripts: [],
    globalSettings: {}
  });

  const [isLoading, setIsLoading] = useState(true);

  const fetchDatabase = async (forceSync = false) => {
    try {
      const res = await fetch(`/api/data${forceSync ? '?sync=true' : ''}`, {
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        setDbState(data);
      }
    } catch (err) {
      console.error('Failed to sync DB:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Jalankan inisialisasi localStorage di client-side saja setelah komponen ter-mount
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const tabFromUrl = searchParams.get('tab');
      if (tabFromUrl) {
        setActiveTab(tabFromUrl);
      } else {
        const savedTab = localStorage.getItem('ftmp_active_tab');
        if (savedTab) {
          setActiveTab(savedTab);
        }
      }
      
      const savedUser = localStorage.getItem('ftmp_session_user');
      if (savedUser) {
        try {
          setSessionUser(JSON.parse(savedUser));
        } catch (e) {
          // ignore parsing error
        }
      }
    }
    fetchDatabase();
  }, []);

  const menuItems = [
    { id: 'beranda', label: 'Beranda', icon: <HomeIcon className="w-3.5 h-3.5" /> },
    { id: 'informasi', label: 'Petunjuk Teknis', icon: <Calendar className="w-3.5 h-3.5" /> },
    { id: 'pendaftaran', label: 'Portal Registrasi & Admin', icon: <UserCheck className="w-3.5 h-3.5" /> },
    { id: 'tiket', label: 'Pesan Tiket', icon: <Ticket className="w-3.5 h-3.5" /> },
    { id: 'naskah', label: 'Unduh Naskah', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'unduh-gambar', label: 'Unduh Gambar', icon: <ImageIcon className="w-3.5 h-3.5" /> },
  ];

  const handleNavigate = (tabId: string) => {
    setActiveTab(tabId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ftmp_active_tab', tabId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#0a0806] text-stone-200 selection:bg-amber-500/20 selection:text-amber-300">
      
      {/* HEADER / NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-[#0c0907]/95 backdrop-blur-md border-b border-stone-800/60 px-4 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          {/* Logo Brand Title */}
          <div 
            onClick={() => handleNavigate('beranda')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            {dbState?.globalSettings?.appLogo ? (
              <img src={dbState.globalSettings.appLogo} alt="Logo" className="h-9 w-9 object-contain group-hover:scale-105 transition-all" />
            ) : (
              <div className="h-9 w-9 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-center font-bold font-outfit text-amber-500 shadow-xs group-hover:scale-105 transition-all">
                🎭
              </div>
            )}
            <div>
              <p className="text-sm font-black font-outfit text-stone-100 tracking-tight leading-none group-hover:text-amber-500 transition-colors">FTMP XXVI</p>
              <p className="text-[9px] text-stone-400 font-bold uppercase tracking-wider mt-0.5">Teater Putih FKIP UNRAM</p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                   key={item.id}
                   onClick={() => handleNavigate(item.id)}
                   className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-all ${
                     isActive 
                       ? 'bg-[#7a1c1d] hover:bg-[#8e2528] text-stone-100 font-extrabold border border-[#b88a44]/30 shadow-md shadow-amber-950/20' 
                       : 'text-stone-400 hover:text-stone-100 hover:bg-stone-900/40'
                   }`}
                   id={`nav-${item.id}`}
                >
                  {item.icon}
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 bg-stone-900 border border-stone-800 hover:bg-stone-850 rounded-xl text-stone-400 hover:text-stone-100 transition-all cursor-pointer"
            id="mobile-menu-toggle"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* MOBILE EXPANDED MENU DRAWER */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-x-0 top-[60px] z-30 bg-[#0e0a07] border-b border-stone-800 p-4 space-y-2 lg:hidden shadow-2xl"
          >
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full p-3 rounded-xl text-xs font-extrabold text-left flex items-center gap-3 transition-colors cursor-pointer ${
                    isActive 
                      ? 'bg-[#7a1c1d] text-stone-100 border border-[#b88a44]/30 shadow-xs' 
                      : 'text-stone-400 hover:bg-stone-900/60'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* PRIMARY VIEWS LAYOUT */}
      <main className="grow bg-[#0a0806]">
        {isLoading ? (
          <div className="min-h-[80vh] flex flex-col justify-center items-center gap-3">
            <div className="h-10 w-10 border-r-2 border-amber-500 animate-spin rounded-full" />
            <p className="text-xs text-stone-400 font-bold tracking-widest uppercase">Menyiapkan Basis Data...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'beranda' && <HeroSection onNavigate={handleNavigate} settings={dbState.globalSettings} />}
              {activeTab === 'informasi' && <InfoSection settings={dbState.globalSettings} />}
              {activeTab === 'pendaftaran' && <RegistrationSection sessionUser={sessionUser} setSessionUser={handleSetSessionUser} settings={dbState} onRefresh={() => fetchDatabase(true)} />}
              {activeTab === 'tiket' && <TicketingSection settings={dbState} />}
              {activeTab === 'naskah' && <ScriptDownloadSection scripts={dbState.scripts} />}
              {activeTab === 'unduh-gambar' && <ImageDownloadSection settings={dbState} />}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* FOOTER SECTION */}
      <footer className="bg-[#0e0a07] border-t border-stone-900/80 py-12 px-4 text-stone-500 text-xs text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex justify-center items-center gap-2 text-stone-200">
            <Landmark className="w-5 h-5 text-amber-500" />
            <span className="font-outfit font-black tracking-wide text-sm">UKMF TEATER PUTIH FKIP UNRAM</span>
          </div>
          
          <p className="leading-relaxed max-w-xl mx-auto text-stone-400 text-[11px] font-medium opacity-85">
            Sekretariat Bersama: Gedung Ormawa Ruang Unit 2, Jalan Majapahit No. 62, Kampus Tengah FKIP Universitas Mataram, Nusa Tenggara Barat.
          </p>
          
          <div className="h-px bg-stone-850 w-24 mx-auto" />
          
          <p className="text-stone-400 text-[10px] font-bold uppercase tracking-wider">
            &copy; 2026 Festival Teater Modern Pelajar XXVI Se-NTB &bull; Theme &quot;Arsip Seperempat Abad&quot;
          </p>
        </div>
      </footer>
    </div>
  );
}

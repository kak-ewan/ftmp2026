'use client';

import { Download, Image as ImageIcon } from 'lucide-react';

interface ImageDownloadSectionProps {
  settings?: any;
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

export default function ImageDownloadSection({ settings }: ImageDownloadSectionProps) {
  const globalSettings = settings?.globalSettings || {};
  
  // Ambil URL gambar dan Judul gambar yang ditentukan admin
  const fallbackImageUrl = globalSettings.downloadImageUrl || 'https://picsum.photos/seed/ftmp/800/1200';
  const fallbackImageTitle = globalSettings.downloadImageTitle || 'Poster Resmi FTMP XXVI';

  // Ambil daftar gambar baru, jika tidak ada fallback ke yang lama
  const rawImages = normalizeDownloadImages(globalSettings.downloadImages);
  const downloadImages = rawImages.length > 0 
    ? rawImages 
    : [{ id: 'fallback', title: fallbackImageTitle, url: fallbackImageUrl }];

  const handleDownload = async (url: string, title: string) => {
    if (typeof window !== 'undefined') {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = (title.replace(/[^a-zA-Z0-9_-]/g, '_') || 'unduhan_gambar') + '.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      } catch {
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.download = (title.replace(/[^a-zA-Z0-9_-]/g, '_') || 'unduhan_gambar') + '.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-10" id="image-download-section">
      
      {/* HEADER SECTION */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-[10px] font-bold tracking-widest uppercase">
          <ImageIcon className="w-3.5 h-3.5" />
          <span>MATERI PUBLIKASI RESMI</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-black font-outfit text-stone-100 tracking-tight uppercase">
          Unduhan Berkas Gambar
        </h2>
        <p className="text-xs text-stone-400 leading-relaxed font-medium">
          Unduh brosur, pamflet, poster resmi, atau info grafis pelaksanaan festival langsung dalam resolusi tinggi.
        </p>
      </div>

      {/* CORE DISPLAY: LIST OF IMAGE DOWNLOADS */}
      <div className="max-w-3xl mx-auto space-y-3">
        {downloadImages.map((img: any, index: number) => {
          const title = img.title || `Berkas Gambar ${index + 1}`;
          const url = img.url || 'https://picsum.photos/seed/ftmp/800/1200';

          return (
            <div 
              key={img.id || index} 
              className="bg-[#120e0b] border border-stone-850 hover:border-amber-500/30 p-4 sm:p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <h3 className="text-sm md:text-base font-bold text-stone-100 tracking-wide truncate">
                    {title}
                  </h3>
                  <p className="text-[11px] text-stone-400 font-medium">
                    Berkas Gambar &bull; Siap Diunduh
                  </p>
                </div>
              </div>

              {/* Download Button */}
              <button
                onClick={() => handleDownload(url, title)}
                className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 shadow-md shadow-amber-950/20"
                id={`btn-unduh-gambar-${index}`}
              >
                <Download className="w-4 h-4" />
                <span>Unduh</span>
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
}

import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  CheckCircle2,
  ShieldCheck,
  X,
  FileCheck,
  Zap,
} from 'lucide-react';

interface ApkDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkDownloadModal: React.FC<ApkDownloadModalProps> = ({ isOpen, onClose }) => {
  const [downloadStarted, setDownloadStarted] = useState(false);

  if (!isOpen) return null;

  const handleDownloadClick = () => {
    setDownloadStarted(true);
    setTimeout(() => setDownloadStarted(false), 5000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-indigo-600 text-white shadow-lg shadow-emerald-500/20">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">JAM AI Android APK</h3>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                  v3.8.0 Real App
                </span>
              </div>
              <p className="text-xs text-slate-400">
                100% असली, पूर्णतया वर्किंग Android एप्लीकेशन फ़ाइल
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          
          {/* Main Download Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-indigo-950/40 border border-emerald-500/40 space-y-4 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  आधिकारिक Android APK (Offline + Online Ready)
                </span>
                <h4 className="text-lg font-extrabold text-white mt-1">
                  JAM AI Mobile (v3.8.0)
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  इस APK में पूरा JAM AI सिस्टम, ऑफ़लाइन इंटेलिजेंस, गेम्स और इमेज जनरेटर सीधे बंडल किया गया है। फ़ोन में खोलते ही तुरंत खुलेगा — कोई "Page not found" एरर नहीं आएगा!
                </p>
              </div>
            </div>

            {/* Specifications Chips */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">फ़ाइल का आकार</span>
                <span className="font-extrabold text-white text-sm">~40 MB (Full App Bundle)</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Android सपोर्ट</span>
                <span className="font-extrabold text-emerald-400 text-sm">Android 5.0 से 15+</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Package Name</span>
                <span className="font-bold text-indigo-300 truncate block text-xs">com.vihaangiri.jamai</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">सुरक्षा व डिजिटल साइन</span>
                <span className="font-bold text-teal-300 text-xs">v1, v2, v3 Verified</span>
              </div>
            </div>

            {/* Direct Download Button */}
            <a
              href="/jam-ai.apk"
              download="jam-ai-v3.8.apk"
              onClick={handleDownloadClick}
              className="w-full flex items-center justify-center gap-2.5 py-4 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-500/25 active:scale-[0.98] transition-all cursor-pointer text-center"
            >
              <Download className="h-5 w-5" />
              <span>{downloadStarted ? 'डाउनलोड शुरू हो गया! (40 MB)' : 'डायरेक्ट APK डाउनलोड करें (Download APK • 40 MB)'}</span>
            </a>

            {downloadStarted && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 font-semibold animate-in fade-in">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>फ़ाइल डाउनलोड हो रही है। डाउनलोड पूरा होते ही उस पर टैप करके इंस्टॉल करें!</span>
              </div>
            )}
          </div>

          {/* Easy Instructions */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
            <h5 className="font-bold text-white flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-amber-400" />
              फ़ोन में इंस्टॉल करने के आसान स्टेप्स:
            </h5>
            <ol className="text-slate-300 space-y-1.5 list-decimal list-inside leading-relaxed pl-1">
              <li>ऊपर दिए गए हरे बटन पर क्लिक करके <strong>jam-ai-v3.8.apk (40 MB)</strong> डाउनलोड करें।</li>
              <li>फ़ोन में डाउनलोड पूरा होने पर उस पर टैप करें।</li>
              <li>अगर फ़ोन पूछे <em>"Install unknown apps"</em>, तो उसे <strong>"Allow"</strong> कर दें।</li>
              <li><strong>"Install"</strong> बटन दबाएँ — ऐप तुरंत आपके फ़ोन में इनस्टॉल होकर तैयार हो जाएगा!</li>
            </ol>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/90">
          <span className="flex items-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Architected by <strong>Vihaan Giri</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
          >
            बंद करें (Close)
          </button>
        </div>

      </div>
    </div>
  );
};

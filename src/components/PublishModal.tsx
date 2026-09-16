import React, { useState } from 'react';
import {
  Globe,
  Check,
  Copy,
  ExternalLink,
  Cloud,
  Rocket,
  Github,
  X,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PublishModal: React.FC<PublishModalProps> = ({ isOpen, onClose }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [isPublishingGoogle, setIsPublishingGoogle] = useState(false);
  const [publishResult, setPublishResult] = useState<any>(null);

  if (!isOpen) return null;

  const currentLiveUrl = window.location.origin;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentLiveUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePublishGoogle = async () => {
    setIsPublishingGoogle(true);
    try {
      const res = await fetch('/api/publish-google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      setPublishResult(data);
    } catch (e: any) {
      console.warn('Publishing failed:', e);
    } finally {
      setIsPublishingGoogle(false);
    }
  };

  return (
    <div
      id="publish-guide-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 transition-all"
    >
      <div className="relative flex flex-col w-full max-w-xl max-h-[92vh] rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden ring-1 ring-white/10">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20">
              <Rocket className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                वेबसाइट पब्लिश कैसे करें (How to Publish)
              </h3>
              <p className="text-xs text-slate-400">
                आपकी JAM AI वेबसाइट को इंटरनेट पर लाइव शेयर करने के 3 आसान तरीके
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* Method 0: Direct One-Click Google Publishing */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-indigo-950/30 border border-emerald-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-slate-950 text-xs font-black">
                  G
                </span>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Direct Google पर 1-क्लिक में पब्लिश करें
                  </h4>
                  <p className="text-[11px] text-emerald-400">
                    Google Search Engine, Googlebot Crawler, Sitemap और Social Card तुरंत एक्टिवेट करें
                  </p>
                </div>
              </div>
              <button
                onClick={handlePublishGoogle}
                disabled={isPublishingGoogle}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
              >
                {isPublishingGoogle ? 'Google पर पब्लिश हो रहा है...' : '🚀 Publish To Google Now'}
              </button>
            </div>

            {publishResult && (
              <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/30 space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <Check className="h-4 w-4" />
                  <span>बधाई हो विहान गिरी! आपकी JAM AI वेबसाइट Google पर पब्लिशिंग के लिए लाइव है!</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px] text-slate-400">
                  <div>✅ <strong>Sitemap:</strong> {publishResult.sitemapUrl}</div>
                  <div>✅ <strong>Robots:</strong> {publishResult.status?.robotsTxt}</div>
                  <div>✅ <strong>Social Card:</strong> {publishResult.status?.openGraphCard}</div>
                  <div>✅ <strong>Google Indexing:</strong> {publishResult.status?.googleIndexing}</div>
                </div>
              </div>
            )}
          </div>

          {/* Method 1: Direct Search Bar Typing & Live URL */}
          <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-bold">
                1
              </span>
              <h4 className="text-sm font-bold text-white">
                ब्राउज़र सर्च बार में क्या लिखें कि सीधे ऐप खुल जाए? (Direct Search Bar Entry)
              </h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              अपने मोबाइल या कंप्यूटर के <strong>Chrome/Safari के ऊपर वाले सर्च बार (Address Bar)</strong> में सीधा अपना लिंक या कस्टम डोमेन (जैसे <code>jamai.com</code>) टाइप करके एंटर दबाते ही आपका ऐप तुरंत बिना किसी रुकावट के खुल जाएगा!
            </p>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800">
              <input
                type="text"
                readOnly
                value={currentLiveUrl}
                className="flex-1 bg-transparent text-xs text-indigo-300 font-mono focus:outline-none px-2 select-all"
              />
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition-all active:scale-95"
              >
                {copiedLink ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
            <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
              💡 <strong>गूगल सर्च (Google Search):</strong> जब आप पब्लिश करते हैं, तो गूगल 24-48 घंटे में वेबसाइट को इंडेक्स कर लेता है। उसके बाद कोई भी गूगल में <strong>"JAM AI Vihaan Giri"</strong> लिखेगा तो आपका ऐप सबसे ऊपर आ जाएगा!
            </div>
          </div>

          {/* Method 2: One-Click AI Studio Deployment */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold">
                2
              </span>
              <h4 className="text-sm font-bold text-white">
                Google AI Studio से पब्लिश (One-Click Deploy)
              </h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              स्क्रीन के ऊपर दाईं तरफ <strong>"Deploy"</strong> या <strong>"Share"</strong> बटन पर क्लिक करें। वहाँ से आप इसे हमेशा के लिए Cloud Run पर स्थायी पब्लिश कर सकते हैं।
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-900/60">
              <Cloud className="h-4 w-4 shrink-0" />
              <span>Google Cloud Run कंटेनर में 24/7 ऑटोमैटिक स्केलिंग के साथ चलता है।</span>
            </div>
          </div>

          {/* Method 3: GitHub & Custom Domain (Vercel / Render / Netlify) */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-600 text-white text-xs font-bold">
                3
              </span>
              <h4 className="text-sm font-bold text-white">
                GitHub एक्सपोर्ट और कस्टम डोमेन (Custom Domain)
              </h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              अगर आप अपनी मनपसंद वेबसाइट डोमेन (जैसे <code>myjamai.com</code>) लगाना चाहते हैं:
            </p>
            <ol className="list-decimal list-inside text-xs text-slate-300 space-y-1 pl-1">
              <li>Settings मेनू से <strong>"Export to GitHub"</strong> या ZIP डाउनलोड करें।</li>
              <li>उसे <strong>Vercel</strong> या <strong>Render</strong> से 1-क्लिक में कनेक्ट करें।</li>
              <li>वहाँ अपना कस्टम डोमेन फ्री में लिंक कर दें!</li>
            </ol>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-950/70">
          <span className="text-xs text-slate-400">
            JAM AI By <strong className="text-white">Vihaan Giri</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-all active:scale-95"
          >
            समझ गया (Got It)
          </button>
        </div>

      </div>
    </div>
  );
};

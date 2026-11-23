import { useState, useEffect } from 'react';
import { Smartphone, Download, X } from 'lucide-react';

export const InstallAppBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isDismissed, setIsDismissed] = useState(() => {
    try {
      return sessionStorage.getItem('pwa_install_dismissed') === 'true';
    } catch {
      return false;
    }
  });
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // If user already dismissed it this session, don't show
    if (isDismissed) return;

    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isDismissed]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the native Android install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false);
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsVisible(false);
    setIsDismissed(true);
    try {
      sessionStorage.setItem('pwa_install_dismissed', 'true');
    } catch {
      // ignore
    }
  };

  // If dismissed, not visible, installed, or no install prompt available: hide completely
  if (isDismissed || !isVisible || isInstalled) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="p-4 rounded-3xl bg-[#1F1746] text-white shadow-2xl border border-purple-500/30 flex items-center justify-between gap-3 backdrop-blur-md">
        
        {/* Phone Icon */}
        <div className="w-11 h-11 rounded-2xl bg-[#371B7A] flex items-center justify-center shrink-0 border border-purple-400/40 text-white">
          <Smartphone className="w-5 h-5 text-[#EA580C]" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <h4 className="text-xs sm:text-sm font-black tracking-tight flex items-center gap-1.5">
            <span>Install Back2U on Android</span>
          </h4>
          <p className="text-[11px] text-purple-200/80 truncate mt-0.5">
            Add to home screen for instant access & fast recovery
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleInstallClick}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-white bg-[#EA580C] hover:bg-[#D94E07] shadow-sm transition-all cursor-pointer active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>
          
          <button
            type="button"
            onClick={handleDismiss}
            className="p-2 text-purple-300 hover:text-white cursor-pointer rounded-full hover:bg-white/10 active:scale-90 transition-all"
            title="Close"
            aria-label="Close install prompt"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

export const NetworkStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBackOnline, setShowBackOnline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowBackOnline(true);
      setTimeout(() => setShowBackOnline(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline) {
    return (
      <div className="bg-red-600 text-white px-4 py-2 text-center text-sm font-bold flex items-center justify-center gap-2 shadow-md animate-in slide-in-from-top-full z-[200] fixed top-0 left-0 right-0">
        <WifiOff size={16} />
        <span>מצב לא מקוון - הנתונים נשמרים במכשיר</span>
      </div>
    );
  }

  if (showBackOnline) {
    return (
      <div className="bg-emerald-600 text-white px-4 py-2 text-center text-sm font-bold flex items-center justify-center gap-2 shadow-md animate-in slide-in-from-top-full z-[200] fixed top-0 left-0 right-0">
        <Wifi size={16} />
        <span>החיבור חזר - הנתונים מסונכרנים</span>
      </div>
    );
  }

  return null;
};
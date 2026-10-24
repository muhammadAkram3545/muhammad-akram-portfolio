import React, { useState, useEffect } from 'react';
import { authService } from '../../services/authService';
import { BackendStatus } from '../../types/backend';
import { Database, ShieldCheck, HardDrive, Wifi, WifiOff } from 'lucide-react';

export const BackendStatusIndicator: React.FC = () => {
  const [status, setStatus] = useState<BackendStatus | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await authService.getBackendStatus();
        setStatus(data);
        setIsOnline(true);
      } catch {
        setIsOnline(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Check every 30s

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#121620] border border-white/10 text-[10px] font-mono text-slate-300">
      {/* Database connection dot */}
      <span className="flex items-center gap-1.5" title="Server Database: Persistent Transactional JSON (Cloud SQL / Supabase Ready)">
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
          }`}
        />
        <Database className="w-3 h-3 text-sky-400" />
        <span className="hidden xl:inline text-slate-400">Database:</span>
        <span className="text-emerald-400 font-semibold">
          {isOnline ? 'Persistent' : 'Offline'}
        </span>
      </span>

      <span className="text-slate-600 hidden md:inline">|</span>

      {/* Storage provider */}
      <span className="hidden md:flex items-center gap-1" title="Storage Adapter: Local Disk / R2 / S3 Ready">
        <HardDrive className="w-3 h-3 text-sky-400" />
        <span className="text-slate-400">{status?.storage?.provider || 'local-disk'}</span>
      </span>

      <span className="text-slate-600 hidden lg:inline">|</span>

      {/* Security */}
      <span className="hidden lg:flex items-center gap-1 text-slate-400" title="Security: PBKDF2 Hashing + HTTP-Only Session">
        <ShieldCheck className="w-3 h-3 text-emerald-400" />
        <span>Secure Auth</span>
      </span>
    </div>
  );
};

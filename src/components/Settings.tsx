import { useState, useEffect } from 'react';
import { Bell, CreditCard, Calendar, BookOpen, Cloud, RefreshCw, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { UserPreferences } from '../types';
import { cn } from '../lib/utils';

interface SettingsProps {
  preferences: UserPreferences;
  setPreferences: (prefs: UserPreferences) => void;
  onDataImport?: () => void;
}

export default function Settings({ preferences, setPreferences, onDataImport }: SettingsProps) {
  const [isDriveConnected, setIsDriveConnected] = useState<boolean | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  useEffect(() => {
    checkDriveStatus();

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        setIsDriveConnected(true);
        handleSync();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const checkDriveStatus = async () => {
    try {
      const res = await fetch('/api/auth/status');
      const data = await res.json();
      setIsDriveConnected(data.connected);
    } catch (e) {
      console.error('Failed to check drive status:', e);
    }
  };

  const handleConnect = async () => {
    try {
      const res = await fetch('/api/auth/url');
      const { url } = await res.json();
      if (url) {
        window.open(url, 'google_auth', 'width=600,height=700');
      }
    } catch (e) {
      console.error('Failed to get auth URL:', e);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncMessage('Sincronizzazione in corso...');
    try {
      const res = await fetch('/api/sync/drive', { method: 'POST' });
      if (res.ok) {
        setSyncMessage('Sincronizzazione completata!');
        if (onDataImport) onDataImport();
      } else {
        setSyncMessage('Errore durante la sincronizzazione.');
      }
    } catch (e) {
      setSyncMessage('Errore di connessione.');
    } finally {
      setTimeout(() => {
        setIsSyncing(false);
        setSyncMessage('');
      }, 3000);
    }
  };

  const togglePreference = (key: keyof UserPreferences) => {
    setPreferences({
      ...preferences,
      [key]: !preferences[key],
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rotate-45 translate-x-16 -translate-y-16"></div>
        <div className="relative z-10">
          
          {/* Cloud Sync Section */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Cloud Sync (Google Drive)</h2>
            </div>
            
            <div className={cn(
              "p-6 rounded-xl border transition-all duration-300",
              isDriveConnected 
                ? "bg-emerald-50/30 border-emerald-100" 
                : "bg-slate-50 border-slate-100"
            )}>
              <div className="flex items-start gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center shadow-sm border",
                  isDriveConnected ? "bg-emerald-500 text-white border-emerald-400" : "bg-white text-slate-400 border-slate-100"
                )}>
                  <Cloud size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-bold text-slate-800">
                      {isDriveConnected ? 'Google Drive Collegato' : 'Salva su Google Drive'}
                    </h3>
                    {isDriveConnected && <CheckCircle2 size={14} className="text-emerald-500" />}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-sm mb-4">
                    {isDriveConnected 
                      ? 'I tuoi dati vengono sincronizzati automaticamente su Google Drive ogni volta che effettui una modifica.' 
                      : 'Collega il tuo account Google per salvare automaticamente il database su Drive come file JSON sicuro.'}
                  </p>
                  
                  <div className="flex flex-wrap gap-3">
                    {isDriveConnected ? (
                      <button 
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all shadow-sm shadow-emerald-200 disabled:opacity-50"
                      >
                        <RefreshCw size={14} className={cn(isSyncing && "animate-spin")} />
                        {isSyncing ? 'Sincronizzazione...' : 'Sincronizza Ora'}
                      </button>
                    ) : (
                      <button 
                        onClick={handleConnect}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all shadow-sm shadow-indigo-200"
                      >
                        <ExternalLink size={14} />
                        Configura Google Drive
                      </button>
                    )}
                  </div>
                  
                  {syncMessage && (
                    <motion.p 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[9px] font-bold text-emerald-600 mt-3 uppercase tracking-widest"
                    >
                      {syncMessage}
                    </motion.p>
                  )}
                </div>
              </div>
            </div>
            
            <p className="text-[10px] text-slate-400 mt-4 leading-relaxed italic">
              * Nota: Per configurare l'integrazione è necessario impostare le credenziali Google OAuth (Client ID e Secret) nel pannello dei Segreti di AI Studio.
            </p>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 bg-indigo-600 rounded-full"></div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Configurazione Notifiche</h2>
          </div>
          <p className="text-xs text-slate-500 mb-8 max-w-md">
            Personalizza il modo in cui ricevi gli avvisi dal sistema. Queste impostazioni verranno salvate localmente.
          </p>

          <div className="space-y-4">
            {/* Payment Notifications */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100 group hover:border-indigo-200 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded bg-white flex items-center justify-center text-emerald-600 shadow-sm border border-slate-100">
                  <CreditCard size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Scadenze Pagamenti</p>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Avvisi per pagamenti imminenti</p>
                </div>
              </div>
              <button
                onClick={() => togglePreference('notifyPayments')}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${preferences.notifyPayments ? 'bg-indigo-600' : 'bg-slate-300'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${preferences.notifyPayments ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Attendance Notifications */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100 group hover:border-indigo-200 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded bg-white flex items-center justify-center text-blue-600 shadow-sm border border-slate-100">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Registrazione Presenze</p>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Promemoria post-lezione</p>
                </div>
              </div>
              <button
                onClick={() => togglePreference('notifyAttendance')}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${preferences.notifyAttendance ? 'bg-indigo-600' : 'bg-slate-300'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${preferences.notifyAttendance ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Course Notifications */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100 group hover:border-indigo-200 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded bg-white flex items-center justify-center text-amber-600 shadow-sm border border-slate-100">
                  <BookOpen size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Calendario Corsi</p>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Avvisi per prossime date</p>
                </div>
              </div>
              <button
                onClick={() => togglePreference('notifyCourses')}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${preferences.notifyCourses ? 'bg-indigo-600' : 'bg-slate-300'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${preferences.notifyCourses ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-6 bg-emerald-500 rounded-full"></div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Integrazione Calendario</h2>
            </div>
            <div className="space-y-4">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Google Calendar Embed URL / Booking Link</label>
              <input 
                type="text"
                placeholder="https://calendar.google.com/calendar/embed?..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-semibold text-slate-600 text-sm"
                value={preferences.calendarUrl || ''}
                onChange={(e) => setPreferences({ ...preferences, calendarUrl: e.target.value })}
              />
              <p className="text-[10px] text-slate-400 leading-relaxed italic">
                Incolla l'URL dell'iFrame di Google Calendar o il link della tua pagina di prenotazione (es. Calendly). 
                Assicurati che il calendario sia configurato come "Pubblico".
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 p-8 rounded-xl border border-transparent shadow-lg text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-white/10 rounded-lg">
            <Bell size={24} className="text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest leading-none mb-1">Stato Systema</h3>
            <p className="text-xs text-slate-400">Tutti i moduli di notifica sono operativi</p>
          </div>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed italic">
          Nota: Le notifiche vengono generate automaticamente elaborando i dati inseriti nel database anagrafico, presenze e pagamenti.
        </p>
      </div>
    </div>
  );
}

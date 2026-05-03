import { Calendar as CalendarIcon, ExternalLink, Settings } from 'lucide-react';
import { UserPreferences, View } from '../types';

interface CalendarViewProps {
  preferences: UserPreferences;
  onNavigate: (view: View) => void;
}

export default function CalendarView({ preferences, onNavigate }: CalendarViewProps) {
  const calendarUrl = preferences.calendarUrl;

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rotate-45 translate-x-12 -translate-y-12"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-6 bg-indigo-600 rounded-full"></div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Calendario & Appuntamenti</h2>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-4">Gstione appuntamenti e programmazione lezioni</p>
        </div>
        {calendarUrl && (
          <a 
            href={calendarUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 relative z-10"
          >
            <ExternalLink size={14} />
            Apri in nuova scheda
          </a>
        )}
      </div>

      <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
        {calendarUrl ? (
          <iframe 
            src={calendarUrl}
            style={{ border: 0 }}
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            className="flex-1"
            title="Calendar"
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <CalendarIcon size={32} className="opacity-20" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-2">Nessun Calendario Configurato</h3>
            <p className="text-xs text-slate-400 max-w-xs mb-8">
              Per visualizzare il calendario qui, devi prima configurare un URL nelle impostazioni del sistema.
            </p>
            <button 
              onClick={() => onNavigate('settings')}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              <Settings size={14} />
              Configura Ora
            </button>
          </div>
        )}
      </div>
      
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 italic text-[10px] text-slate-400 text-center">
        Nota: Se il calendario non viene caricato correttamente, assicurati che l'URL sia un link pubblico di condivisione o di incorporamento.
      </div>
    </div>
  );
}

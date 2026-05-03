import { Bell, CreditCard, Calendar, BookOpen } from 'lucide-react';
import { UserPreferences } from '../types';

interface SettingsProps {
  preferences: UserPreferences;
  setPreferences: (prefs: UserPreferences) => void;
}

export default function Settings({ preferences, setPreferences }: SettingsProps) {

  const togglePreference = (key: keyof UserPreferences) => {
    setPreferences({
      ...preferences,
      [key]: !preferences[key],
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rotate-45 translate-x-16 -translate-y-16"></div>
        <div className="relative z-10">
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

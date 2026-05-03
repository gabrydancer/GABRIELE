import { useState } from 'react';
import { Calendar, CheckCircle2, XCircle, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Person, Course, AttendanceRecord } from '../types';
import { cn } from '../lib/utils';

interface AttendanceTrackerProps {
  attendance: AttendanceRecord[];
  setAttendance: (records: AttendanceRecord[]) => void;
  people: Person[];
  courses: Course[];
}

export default function AttendanceTracker({ attendance, setAttendance, people, courses }: AttendanceTrackerProps) {
  const [selectedCourse, setSelectedCourse] = useState<string>(courses[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const toggleAttendance = (studentId: string, status: 'present' | 'absent' | 'late') => {
    const existing = attendance.find(a => a.courseId === selectedCourse && a.date === selectedDate && a.studentId === studentId);
    
    if (existing) {
      if (existing.status === status) {
        // Remove if clicking same status
        setAttendance(attendance.filter(a => a.id !== existing.id));
      } else {
        // Update status
        setAttendance(attendance.map(a => a.id === existing.id ? { ...a, status } : a));
      }
    } else {
      // Create new record
      const newRecord: AttendanceRecord = {
        id: crypto.randomUUID(),
        courseId: selectedCourse,
        studentId,
        date: selectedDate,
        status
      };
      setAttendance([...attendance, newRecord]);
    }
  };

  const getStatus = (studentId: string) => {
    return attendance.find(a => a.courseId === selectedCourse && a.date === selectedDate && a.studentId === studentId)?.status;
  };

  const changeDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  if (courses.length === 0) {
    return (
      <div className="bg-white p-24 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 text-center shadow-sm">
        <div className="w-16 h-16 bg-slate-50 rounded-lg flex items-center justify-center mb-4 border border-slate-100">
          <Calendar size={32} className="opacity-40" />
        </div>
        <p className="font-bold text-xs uppercase tracking-[0.2em] mb-1">Inizializzazione Richiesta</p>
        <p className="text-xs text-slate-300 font-medium">Configura almeno un corso per abilitare il registro presenze.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-8 items-end justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rotate-45 translate-x-16 -translate-y-16"></div>
        <div className="flex flex-col sm:flex-row items-end gap-6 w-full lg:w-auto relative z-10">
          <div className="space-y-2 w-full sm:w-72">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Corso di Riferimento</label>
            <select 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-800 text-sm appearance-none cursor-pointer"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-2 w-full sm:w-auto">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Data Sessione</label>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => changeDate(-1)}
                className="p-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-500 hover:text-indigo-600 transition-all text-slate-400 shadow-sm"
              >
                <ChevronLeft size={16} />
              </button>
              <input 
                type="date" 
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-800 text-sm cursor-pointer"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
              <button 
                onClick={() => changeDate(1)}
                className="p-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-500 hover:text-indigo-600 transition-all text-slate-400 shadow-sm"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-8 relative z-10 bg-slate-50 px-6 py-3 rounded-lg border border-slate-100">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Presenti</span>
            <span className="text-xl font-bold text-emerald-600 tabular-nums">
              {attendance.filter(a => a.courseId === selectedCourse && a.date === selectedDate && a.status === 'present').length}
            </span>
          </div>
          <div className="w-[1px] h-8 bg-slate-200"></div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Assenti</span>
            <span className="text-xl font-bold text-rose-500 tabular-nums">
              {attendance.filter(a => a.courseId === selectedCourse && a.date === selectedDate && a.status === 'absent').length}
            </span>
          </div>
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Identità Studente</th>
              <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Stato Presenza</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {people.filter(p => p.courseIds && p.courseIds.includes(selectedCourse)).map((person) => {
              const status = getStatus(person.id);
              return (
                <tr key={person.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded bg-white border border-slate-200 text-slate-400 flex items-center justify-center text-xs font-bold shadow-sm group-hover:border-indigo-500 group-hover:text-indigo-600 transition-all">
                        {person.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-slate-800 text-sm tracking-tight">{person.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-3">
                      <button 
                        onClick={() => toggleAttendance(person.id, 'present')}
                        className={cn(
                          "flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border",
                          status === 'present' 
                            ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-50" 
                            : "bg-white border-slate-200 text-slate-400 hover:border-emerald-300 hover:text-emerald-600"
                        )}
                      >
                        <CheckCircle2 size={12} />
                        Presente
                      </button>
                      <button 
                        onClick={() => toggleAttendance(person.id, 'absent')}
                        className={cn(
                          "flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border",
                          status === 'absent' 
                            ? "bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-50" 
                            : "bg-white border-slate-200 text-slate-400 hover:border-rose-300 hover:text-rose-500"
                        )}
                      >
                        <XCircle size={12} />
                        Assente
                      </button>
                      <button 
                        onClick={() => toggleAttendance(person.id, 'late')}
                        className={cn(
                          "flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border",
                          status === 'late' 
                            ? "bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-50" 
                            : "bg-white border-slate-200 text-slate-400 hover:border-amber-300 hover:text-amber-500"
                        )}
                      >
                        <Clock size={12} />
                        Ritardo
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {people.filter(p => !p.courseIds || !p.courseIds.includes(selectedCourse)).length > 0 && people.filter(p => p.courseIds && p.courseIds.includes(selectedCourse)).length === 0 && (
              <tr>
                <td colSpan={2} className="px-6 py-24 text-center text-slate-400 italic text-sm">
                  Nessun studente iscritto a questo corso.
                </td>
              </tr>
            )}
            {people.length === 0 && (
              <tr>
                <td colSpan={2} className="px-6 py-24 text-center text-slate-400 italic text-sm">
                  Nessun profilo caricato nel database anagrafico.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

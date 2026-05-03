import React, { useState } from 'react';
import { BookOpen, Search, Edit2, Trash2, X, Plus, Euro, Users } from 'lucide-react';
import { Course, Person } from '../types';

interface CourseManagerProps {
  courses: Course[];
  setCourses: (courses: Course[]) => void;
  people: Person[];
}

export default function CourseManager({ courses, setCourses, people }: CourseManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    dayOfWeek: '',
    time: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCourse) {
      setCourses(courses.map(c => c.id === editingCourse.id ? { ...c, ...formData } : c));
    } else {
      const newCourse: Course = {
        id: crypto.randomUUID(),
        ...formData
      };
      setCourses([...courses, newCourse]);
    }
    closeModal();
  };

  const openModal = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      setFormData({
        name: course.name,
        description: course.description,
        price: course.price,
        dayOfWeek: course.dayOfWeek || '',
        time: course.time || ''
      });
    } else {
      setEditingCourse(null);
      setFormData({ name: '', description: '', price: 0, dayOfWeek: '', time: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCourse(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition-all shadow-sm active:scale-[0.98] whitespace-nowrap"
        >
          <Plus size={16} />
          CREA CORSO
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => {
          const enrolledCount = people.filter(p => p.courseIds?.includes(course.id)).length;
          return (
            <div key={course.id} className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 border border-indigo-100 rounded-full">
                  <Users size={10} className="text-indigo-600" />
                  <span className="text-[10px] font-bold text-indigo-600 tabular-nums">{enrolledCount}</span>
                </div>
              </div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-slate-50 text-slate-400 border border-slate-100 flex items-center justify-center rounded-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                  <BookOpen size={24} />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Prezzo</p>
                  <p className="text-xl font-bold text-emerald-600 tabular-nums">€{course.price.toFixed(2)}</p>
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1 tracking-tight">{course.name}</h3>
              <div className="flex items-center gap-3 mb-4">
                {course.dayOfWeek && (
                  <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {course.dayOfWeek}
                  </span>
                )}
                {course.time && (
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {course.time}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 line-clamp-3 mb-8 min-h-[4.5rem] leading-relaxed">
                {course.description || 'Nessuna descrizione fornita.'}
              </p>
              <div className="flex items-center gap-3 border-t border-slate-100 pt-6">
                <button 
                  onClick={() => openModal(course)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase tracking-widest text-indigo-600 hover:bg-indigo-50 rounded transition-colors border border-transparent hover:border-indigo-100"
                >
                  <Edit2 size={12} />
                  Modifica
                </button>
                <button 
                  onClick={() => setCourses(courses.filter(c => c.id !== course.id))}
                  className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
        {courses.length === 0 && (
          <div className="col-span-full py-24 bg-white rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-lg flex items-center justify-center mb-4 border border-slate-100">
              <BookOpen size={32} className="opacity-40" />
            </div>
            <p className="font-bold text-xs uppercase tracking-widest">Nessun corso attivo</p>
            <p className="text-xs mt-1 text-slate-300 font-medium">Inizia creando il tuo primo programma</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={closeModal} />
          <div className="bg-white rounded-xl w-full max-w-lg relative z-10 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-200">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-2 h-6 bg-indigo-600 rounded-full"></div>
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">
                  {editingCourse ? 'Modifica Corso' : 'Crea Corso'}
                </h2>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                <X size={18} className="text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-[0.15em]">Nome Corso</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Es. Yoga Principianti"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-800"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-[0.15em]">Giorno della Settimana</label>
                  <select 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-800"
                    value={formData.dayOfWeek}
                    onChange={(e) => setFormData({...formData, dayOfWeek: e.target.value})}
                  >
                    <option value="">Seleziona giorno...</option>
                    <option value="Lunedì">Lunedì</option>
                    <option value="Martedì">Martedì</option>
                    <option value="Mercoledì">Mercoledì</option>
                    <option value="Giovedì">Giovedì</option>
                    <option value="Venerdì">Venerdì</option>
                    <option value="Sabato">Sabato</option>
                    <option value="Domenica">Domenica</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-[0.15em]">Orario Inizio</label>
                  <input 
                    type="time" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-800"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-[0.15em]">Quota Richiesta (€)</label>
                  <div className="relative">
                    <Euro className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input 
                      required
                      type="number" 
                      step="0.01"
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-800 text-lg tabular-nums"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-[0.15em]">Descrizione Programma</label>
                  <textarea 
                    rows={4}
                    placeholder="Dettagli sulle sessioni, requisiti, etc."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none font-medium text-slate-600 leading-relaxed"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 border border-slate-200 rounded-lg font-bold text-xs text-slate-400 hover:bg-slate-50 transition-colors uppercase tracking-widest"
                >
                  Annulla
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-6 py-3 bg-slate-900 text-white rounded-lg font-bold text-xs hover:bg-slate-800 transition-all uppercase tracking-widest shadow-lg shadow-slate-200"
                >
                  {editingCourse ? 'Salva' : 'Conferma'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

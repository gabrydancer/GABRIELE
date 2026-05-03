import React, { useState } from 'react';
import { UserPlus, Search, Edit2, Trash2, Mail, Phone, MoreVertical, X } from 'lucide-react';
import { Person, Course } from '../types';
import { cn } from '../lib/utils';

interface PeopleListProps {
  people: Person[];
  setPeople: (people: Person[]) => void;
  courses: Course[];
}

export default function PeopleList({ people, setPeople, courses }: PeopleListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    courseIds: [] as string[],
    notes: ''
  });

  const filteredPeople = people.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPerson) {
      setPeople(people.map(p => p.id === editingPerson.id ? { ...p, ...formData } : p));
    } else {
      const newPerson: Person = {
        id: crypto.randomUUID(),
        ...formData,
        createdAt: Date.now()
      };
      setPeople([...people, newPerson]);
    }
    closeModal();
  };

  const openModal = (person?: Person) => {
    if (person) {
      setEditingPerson(person);
      setFormData({
        name: person.name,
        email: person.email,
        phone: person.phone,
        courseIds: person.courseIds || [],
        notes: person.notes || ''
      });
    } else {
      setEditingPerson(null);
      setFormData({ name: '', email: '', phone: '', courseIds: [], notes: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPerson(null);
  };

  const deletePerson = (id: string) => {
    setPeople(people.filter(p => p.id !== id));
    setShowConfirmDelete(null);
    if (editingPerson?.id === id) {
      closeModal();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
          <input 
            type="text" 
            placeholder="Cerca per nome o email..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition-all shadow-sm active:scale-[0.98] whitespace-nowrap"
        >
          <UserPlus size={16} />
          REGISTRA NUOVO
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Studente</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Corso</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contatti</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Iscrizione</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPeople.map((person) => (
                <tr key={person.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                        {person.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm leading-tight mb-0.5">{person.name}</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-tight font-semibold">{person.notes || 'Nessuna nota'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {person.courseIds && person.courseIds.length > 0 ? (
                        person.courseIds.map(id => {
                          const course = courses.find(c => c.id === id);
                          return course ? (
                            <span key={id} className="inline-block text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full uppercase tracking-widest whitespace-nowrap">
                              {course.name}
                            </span>
                          ) : null;
                        })
                      ) : (
                        <span className="text-slate-300 italic text-[11px] font-bold uppercase tracking-tight">Nessun corso</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                        <Mail size={12} className="text-slate-300" />
                        {person.email}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                        <Phone size={12} className="text-slate-300" />
                        {person.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-slate-500 font-bold tabular-nums">
                      {new Date(person.createdAt).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1 transition-opacity">
                      <button 
                        onClick={() => openModal(person)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded transition-all"
                      >
                        <Edit2 size={14} />
                      </button>
                      <div className="relative">
                        {showConfirmDelete === person.id ? (
                          <div className="absolute right-0 bottom-full mb-2 z-30 bg-slate-900 text-white p-2 rounded-lg shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
                            <span className="text-[10px] font-bold uppercase whitespace-nowrap ml-1">Sei sicuro?</span>
                            <button 
                              onClick={() => deletePerson(person.id)}
                              className="px-2 py-1 bg-rose-500 hover:bg-rose-600 rounded text-[9px] font-bold uppercase"
                            >
                              Sì
                            </button>
                            <button 
                              onClick={() => setShowConfirmDelete(null)}
                              className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-[9px] font-bold uppercase"
                            >
                              No
                            </button>
                          </div>
                        ) : null}
                        <button 
                          onClick={() => setShowConfirmDelete(person.id)}
                          className={cn(
                            "p-2 rounded transition-all",
                            showConfirmDelete === person.id ? "bg-rose-50 text-rose-600" : "text-slate-400 hover:text-rose-600 hover:bg-white"
                          )}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPeople.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-slate-400 italic text-sm">
                    Nessuna persona trovata nel database
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={closeModal} />
          <div className="bg-white rounded-xl w-full max-w-lg relative z-10 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-200">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-2 h-6 bg-indigo-600 rounded-full"></div>
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">
                  {editingPerson ? 'Modifica Anagrafica' : 'Registra Persona'}
                </h2>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                <X size={18} className="text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-[0.15em]">Nome Completo</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Mario Rossi"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-semibold text-slate-800"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-[0.15em]">Email</label>
                    <input 
                      required
                      type="email" 
                      placeholder="mario@email.it"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-semibold text-slate-800"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-[0.15em]">Telefono</label>
                    <input 
                      required
                      type="tel" 
                      placeholder="+39 123 456789"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-semibold text-slate-800"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-[0.15em]">Corsi di Partecipazione</label>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    {courses.map(course => (
                      <label key={course.id} className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-all"
                          checked={formData.courseIds.includes(course.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, courseIds: [...formData.courseIds, course.id] });
                            } else {
                              setFormData({ ...formData, courseIds: formData.courseIds.filter(id => id !== course.id) });
                            }
                          }}
                        />
                        <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">{course.name}</span>
                      </label>
                    ))}
                    {courses.length === 0 && (
                      <p className="col-span-2 text-center text-[10px] text-slate-400 font-bold uppercase">Nessun corso disponibile</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-[0.15em]">Note Informative</label>
                  <textarea 
                    rows={3}
                    placeholder="Informazioni cliniche, preferenze, etc."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none font-medium text-slate-600"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                {editingPerson && (
                  <button 
                    type="button"
                    onClick={() => setShowConfirmDelete(editingPerson.id)}
                    className="p-3 border border-rose-200 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors group relative"
                    title="Elimina contatto"
                  >
                    <Trash2 size={18} />
                    {showConfirmDelete === editingPerson.id && (
                      <div className="absolute left-0 bottom-full mb-2 z-30 bg-slate-900 text-white p-2 rounded-lg shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <span className="text-[10px] font-bold uppercase whitespace-nowrap ml-1">Confermi?</span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); deletePerson(editingPerson.id); }}
                          className="px-2 py-1 bg-rose-500 hover:bg-rose-600 rounded text-[9px] font-bold uppercase"
                        >
                          Sì
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setShowConfirmDelete(null); }}
                          className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-[9px] font-bold uppercase"
                        >
                          No
                        </button>
                      </div>
                    )}
                  </button>
                )}
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
                  {editingPerson ? 'Aggiorna' : 'Conferma'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { Plus, Search, Trash2, Calendar, ShoppingBag, Euro, Filter, Receipt, Check, X } from 'lucide-react';
import { ExpenseRecord } from '../types';
import { cn } from '../lib/utils';

interface ExpenseTrackerProps {
  expenses: ExpenseRecord[];
  setExpenses: (records: ExpenseRecord[]) => void;
}

const CATEGORIES = [
  'Affitto',
  'Utenze',
  'Materiali',
  'Marketing',
  'Manutenzione',
  'Stipendi',
  'Assicurazione',
  'Altro'
];

export default function ExpenseTracker({ expenses, setExpenses }: ExpenseTrackerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    category: CATEGORIES[0],
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newExpense: ExpenseRecord = {
      id: crypto.randomUUID(),
      ...formData,
      amount: Number(formData.amount)
    };
    setExpenses([...expenses, newExpense]);
    setIsModalOpen(false);
    setFormData({
      category: CATEGORIES[0],
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = e.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          e.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || e.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
    setShowConfirmDelete(null);
  };

  const totalFiltered = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header / Stats */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="flex bg-white px-8 py-5 rounded-xl border border-slate-200 shadow-sm items-center gap-6 relative overflow-hidden flex-1">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rotate-45 translate-x-12 -translate-y-12"></div>
          <div className="w-12 h-12 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg flex items-center justify-center shadow-sm relative z-10">
            <Euro size={20} />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Totale Uscite Visualizzate</p>
            <p className="text-2xl font-bold text-slate-800 tabular-nums">€{totalFiltered.toFixed(2)}</p>
          </div>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-8 py-5 bg-rose-600 text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-100 active:scale-[0.98] whitespace-nowrap"
        >
          <Plus size={16} />
          Registra Uscita
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
          <input 
            type="text" 
            placeholder="Cerca per descrizione o categoria..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/10 focus:border-rose-500 transition-all text-sm font-semibold text-slate-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 min-w-[240px]">
          <div className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-400">
            <Filter size={16} />
          </div>
          <select 
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/10 focus:border-rose-500 transition-all font-bold text-slate-700 text-xs uppercase tracking-widest appearance-none cursor-pointer"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">Tutte le Categorie</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Categoria</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Descrizione</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Data</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Importo</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredExpenses.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="inline-block text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-100 px-3 py-1 rounded-full uppercase tracking-widest">
                      {e.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-800 tracking-tight">{e.description}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-slate-400 font-bold tabular-nums">
                      {new Date(e.date).toLocaleDateString('it-IT')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-bold text-rose-600 text-sm tabular-nums">€{e.amount.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="relative inline-flex items-center justify-end">
                      {showConfirmDelete === e.id && (
                        <div className="absolute right-0 bottom-full mb-2 z-30 bg-slate-900 text-white p-2 rounded-lg shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
                          <span className="text-[9px] font-bold uppercase whitespace-nowrap ml-1">Annulla spesa?</span>
                          <button 
                            onClick={() => deleteExpense(e.id)}
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
                      )}
                      <button 
                        onClick={() => setShowConfirmDelete(e.id)}
                        className={cn(
                          "p-2 rounded transition-all",
                          showConfirmDelete === e.id ? "bg-rose-50 text-rose-600" : "text-slate-400 hover:text-rose-600 hover:bg-white"
                        )}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-300 italic text-sm font-medium">
                    Nessun record di uscita corrispondente ai criteri.
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
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={() => setIsModalOpen(false)} />
          <div className="bg-white rounded-xl w-full max-w-lg relative z-10 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-200">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-2 h-6 bg-rose-600 rounded-full"></div>
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Nuova Uscita</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                <X size={18} className="text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-[0.2em]">Categoria</label>
                  <select 
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/10 focus:border-rose-500 transition-all font-bold text-slate-800 text-sm appearance-none cursor-pointer"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-[0.2em]">Data</label>
                    <input 
                      required
                      type="date" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/10 focus:border-rose-500 transition-all font-bold text-slate-800 text-sm cursor-pointer"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-[0.2em]">Importo (€)</label>
                    <input 
                      required
                      type="number" 
                      step="0.01"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/10 focus:border-rose-500 transition-all font-bold text-slate-800 text-lg tabular-nums"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-[0.2em]">Descrizione</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Esempio: Affitto locale Aprile..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/10 focus:border-rose-500 transition-all font-semibold text-slate-600 text-sm"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-3 border border-slate-200 rounded-lg font-bold text-xs text-slate-400 hover:bg-slate-50 transition-colors uppercase tracking-widest"
                >
                  Annulla
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-6 py-3 bg-rose-600 text-white rounded-lg font-bold text-xs hover:bg-rose-700 transition-all uppercase tracking-widest shadow-lg shadow-rose-100 flex items-center justify-center gap-2"
                >
                  <Check size={14} />
                  Salva Uscita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { CreditCard, Plus, Search, Trash2, Calendar, User, Euro, Filter, ChevronDown, Check, X, FileText, Edit2 } from 'lucide-react';
import { Person, Course, PaymentRecord } from '../types';
import { cn } from '../lib/utils';
import ReceiptModal from './ReceiptModal';

interface PaymentTrackerProps {
  payments: PaymentRecord[];
  setPayments: (records: PaymentRecord[]) => void;
  people: Person[];
  courses: Course[];
}

export default function PaymentTracker({ payments, setPayments, people, courses }: PaymentTrackerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);
  const [selectedPaymentForReceipt, setSelectedPaymentForReceipt] = useState<PaymentRecord | null>(null);

  const [formData, setFormData] = useState({
    studentId: '',
    courseId: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const selectedStudent = people.find(p => p.id === formData.studentId);
  const studentCourses = selectedStudent 
    ? courses.filter(c => selectedStudent.courseIds?.includes(c.id))
    : [];

  const handleStudentChange = (studentId: string) => {
    setFormData({ ...formData, studentId, courseId: '' });
  };

  const handleCourseChange = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    setFormData({ 
      ...formData, 
      courseId, 
      amount: course ? course.price.toString() : formData.amount,
      description: course ? `Pagamento corso: ${course.name}` : formData.description
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId) return alert('Seleziona uno studente');
    
    if (editingPaymentId) {
      setPayments(payments.map(p => p.id === editingPaymentId ? {
        ...p,
        ...formData,
        amount: Number(formData.amount)
      } : p));
    } else {
      const nextReceiptNumber = payments.length > 0 
        ? Math.max(...payments.map(p => p.receiptNumber || 0)) + 1 
        : 1;

      const newPayment: PaymentRecord = {
        id: crypto.randomUUID(),
        ...formData,
        amount: Number(formData.amount),
        receiptNumber: nextReceiptNumber
      };
      setPayments([...payments, newPayment]);
    }
    
    setIsModalOpen(false);
    setEditingPaymentId(null);
    setFormData({
      studentId: '',
      courseId: '',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleEdit = (payment: PaymentRecord) => {
    setEditingPaymentId(payment.id);
    setFormData({
      studentId: payment.studentId,
      courseId: payment.courseId || '',
      amount: payment.amount.toString(),
      description: payment.description,
      date: payment.date
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPaymentId(null);
    setFormData({
      studentId: '',
      courseId: '',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const filteredPayments = payments.filter(p => {
    const student = people.find(person => person.id === p.studentId);
    const matchesSearch = student?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = filterCourse === 'all' || p.courseId === filterCourse;
    return matchesSearch && matchesCourse;
  });

  const deletePayment = (id: string) => {
    setPayments(payments.filter(p => p.id !== id));
    setShowConfirmDelete(null);
  };

  const totalFiltered = filteredPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header / Stats */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="flex bg-white px-8 py-5 rounded-xl border border-slate-200 shadow-sm items-center gap-6 relative overflow-hidden flex-1">
          <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rotate-45 translate-x-12 -translate-y-12"></div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg flex items-center justify-center shadow-sm relative z-10">
            <Euro size={20} />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Volume Visualizzato</p>
            <p className="text-2xl font-bold text-slate-800 tabular-nums">€{totalFiltered.toFixed(2)}</p>
          </div>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-8 py-5 bg-indigo-600 text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-[0.98] whitespace-nowrap"
        >
          <Plus size={16} />
          Registra Incasso
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
          <input 
            type="text" 
            placeholder="Cerca per studente o descrizione..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-semibold text-slate-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 min-w-[240px]">
          <div className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-400">
            <Filter size={16} />
          </div>
          <select 
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700 text-xs uppercase tracking-widest appearance-none cursor-pointer"
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
          >
            <option value="all">Tutti i Corsi</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>)}
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">N° Ricevuta</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contribuente</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Causale</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Data</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Monto</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredPayments.map((p) => {
                const student = people.find(person => person.id === p.studentId);
                const course = courses.find(c => c.id === p.courseId);
                return (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                        {p.receiptNumber ? `#${p.receiptNumber}` : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded bg-white border border-slate-200 text-slate-400 flex items-center justify-center text-[10px] font-bold transition-all group-hover:border-indigo-500 group-hover:text-indigo-600 shadow-sm">
                          {student?.name.charAt(0).toUpperCase() || '?'}
                        </div>
                        <span className="font-bold text-slate-800 text-sm tracking-tight">{student?.name || 'Utente Eliminato'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-600 leading-tight">{p.description}</p>
                        {course && (
                          <span className="inline-block text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full uppercase tracking-widest">
                            {course.name}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-slate-400 font-bold tabular-nums">
                        {new Date(p.date).toLocaleDateString('it-IT')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-emerald-600 text-sm tabular-nums">€{p.amount.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative inline-flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setSelectedPaymentForReceipt(p)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded transition-all"
                          title="Vedi Ricevuta"
                        >
                          <FileText size={14} />
                        </button>
                        <button 
                          onClick={() => handleEdit(p)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded transition-all"
                          title="Modifica Pagamento"
                        >
                          <Edit2 size={14} />
                        </button>
                        {showConfirmDelete === p.id && (
                          <div className="absolute right-0 bottom-full mb-2 z-30 bg-slate-900 text-white p-2 rounded-lg shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
                            <span className="text-[9px] font-bold uppercase whitespace-nowrap ml-1">Annulla pagamento?</span>
                            <button 
                              onClick={() => deletePayment(p.id)}
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
                          onClick={() => setShowConfirmDelete(p.id)}
                          className={cn(
                            "p-2 rounded transition-all",
                            showConfirmDelete === p.id ? "bg-rose-50 text-rose-600" : "text-slate-400 hover:text-rose-600 hover:bg-white"
                          )}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-300 italic text-sm font-medium">
                    Nessun record di pagamento corrispondente ai criteri.
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
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={handleCloseModal} />
          <div className="bg-white rounded-xl w-full max-w-lg relative z-10 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-200">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-2 h-6 bg-indigo-600 rounded-full"></div>
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">
                  {editingPaymentId ? 'Modifica Registrazione' : 'Nuova Registrazione'}
                </h2>
              </div>
              <button onClick={handleCloseModal} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                <X size={18} className="text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-[0.2em]">Studente</label>
                  <select 
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-800 text-sm appearance-none cursor-pointer"
                    value={formData.studentId}
                    onChange={(e) => handleStudentChange(e.target.value)}
                  >
                    <option value="">Seleziona profilo...</option>
                    {people.map(person => <option key={person.id} value={person.id}>{person.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-[0.2em]">Corso Attribuito</label>
                    <select 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-800 text-sm appearance-none cursor-pointer"
                      value={formData.courseId}
                      onChange={(e) => handleCourseChange(e.target.value)}
                      disabled={!formData.studentId}
                    >
                      <option value="">Seleziona corso...</option>
                      {studentCourses.map(course => <option key={course.id} value={course.id}>{course.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-[0.2em]">Data Pagamento</label>
                    <input 
                      required
                      type="date" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-800 text-sm cursor-pointer"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-[0.2em]">Importo (€)</label>
                    <input 
                      required
                      type="number" 
                      step="0.01"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-800 text-lg tabular-nums"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-[0.2em]">Metodo/Note</label>
                    <input 
                      required
                      type="text" 
                      placeholder="Contanti, Bonifico..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-semibold text-slate-600 text-sm"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-3 border border-slate-200 rounded-lg font-bold text-xs text-slate-400 hover:bg-slate-50 transition-colors uppercase tracking-widest"
                >
                  Annulla
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-6 py-3 bg-slate-900 text-white rounded-lg font-bold text-xs hover:bg-slate-800 transition-all uppercase tracking-widest shadow-lg shadow-slate-200 flex items-center justify-center gap-2"
                >
                  <Check size={14} />
                  {editingPaymentId ? 'Salva Modifiche' : 'Conferma'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedPaymentForReceipt && (
        <ReceiptModal 
          isOpen={!!selectedPaymentForReceipt}
          onClose={() => setSelectedPaymentForReceipt(null)}
          payment={selectedPaymentForReceipt}
          student={people.find(p => p.id === selectedPaymentForReceipt.studentId)}
          course={courses.find(c => c.id === selectedPaymentForReceipt.courseId)}
        />
      )}
    </div>
  );
}

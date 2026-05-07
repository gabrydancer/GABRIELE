import React, { useState } from 'react';
import { X, Edit2, Check, Banknote, Download, ImageIcon, CreditCard, Printer } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PaymentRecord, Person, Course } from '../types';
import html2canvas from 'html2canvas';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: PaymentRecord;
  student: Person | undefined;
  course: Course | undefined;
}

export default function ReceiptModal({ isOpen, onClose, payment, student, course }: ReceiptModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [editableDetails, setEditableDetails] = useState({
    receiptNumber: payment.receiptNumber?.toString() || payment.id.substring(0, 8).toUpperCase(),
    date: payment.date,
    amount: payment.amount,
    description: course ? `Iscrizione Corso: ${course.name}` : payment.description,
    paymentMethod: payment.description.toLowerCase().includes('contanti') ? 'Contanti' : 
                   payment.description.toLowerCase().includes('carta') ? 'Carta' : 'Contanti',
    studentName: student?.name || 'Utente'
  });

  if (!isOpen) return null;

  const handlePrint = () => {
    window.focus();
    window.print();
  };

  const handleDownloadJPG = async () => {
    const element = document.getElementById('printable-receipt');
    if (!element) return;

    setIsDownloading(true);
    
    try {
      // Create canvas from element with high scale for better quality
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      // Convert to JPG and download
      const link = document.createElement('a');
      const fileName = `Ricevuta_${editableDetails.receiptNumber}_${editableDetails.studentName.replace(/\s+/g, '_')}.jpg`;
      
      link.download = fileName;
      link.href = canvas.toDataURL('image/jpeg', 0.9);
      link.click();
    } catch (error) {
      console.error('Error generating JPG:', error);
      alert('Si è verificato un errore durante la generazione dell\'immagine.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 print:p-0 print:static print:inset-auto overflow-y-auto print-container">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm print:hidden" 
          onClick={onClose} 
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl w-full max-w-3xl relative z-10 shadow-2xl overflow-hidden print:shadow-none print:rounded-none print:w-full print:max-w-none print:p-0 my-8"
        >
          {/* Header Actions - Hidden on Print */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 print:hidden">
            <div className="flex items-center gap-3">
              <div className="w-2 h-6 bg-indigo-600 rounded-full"></div>
              <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest">Gestione Ricevuta</h2>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className={`p-2 rounded-lg transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest border ${
                  isEditing 
                    ? 'bg-indigo-600 text-white border-indigo-600' 
                    : 'text-slate-500 hover:text-indigo-600 hover:bg-white border-transparent hover:border-slate-200'
                }`}
              >
                {isEditing ? <Check size={16} /> : <Edit2 size={16} />}
                <span>{isEditing ? 'Conferma' : 'Modifica'}</span>
              </button>
              <button 
                onClick={handlePrint}
                className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-lg transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest border border-transparent hover:border-slate-200"
              >
                <Printer size={16} />
                <span>Stampa</span>
              </button>
              <button 
                onClick={handleDownloadJPG}
                disabled={isDownloading}
                className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-white rounded-lg transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest border border-transparent hover:border-slate-200 disabled:opacity-50"
              >
                <ImageIcon size={16} className={isDownloading ? 'animate-bounce' : ''} />
                <span>{isDownloading ? 'Salvataggio...' : 'JPG'}</span>
              </button>
              <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-lg transition-colors ml-2">
                <X size={18} className="text-slate-400" />
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row">
            {/* Sidebar Editor - Hidden on Print */}
            {isEditing && (
              <div className="w-full md:w-64 bg-slate-50 border-r border-slate-100 p-6 print:hidden">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Configurazione</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase mb-1.5 ml-1">Metodo Pagamento</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => setEditableDetails({...editableDetails, paymentMethod: 'Contanti'})}
                        className={`py-2 rounded-lg flex flex-col items-center gap-1 border transition-all ${
                          editableDetails.paymentMethod === 'Contanti' 
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                            : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        <Banknote size={16} />
                        <span className="text-[9px] font-black uppercase">Contanti</span>
                      </button>
                      <button 
                        onClick={() => setEditableDetails({...editableDetails, paymentMethod: 'Carta'})}
                        className={`py-2 rounded-lg flex flex-col items-center gap-1 border transition-all ${
                          editableDetails.paymentMethod === 'Carta' 
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                            : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        <CreditCard size={16} />
                        <span className="text-[9px] font-black uppercase">Carta</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase mb-1.5 ml-1">Importo (€)</label>
                    <input 
                      type="number"
                      value={editableDetails.amount}
                      onChange={(e) => setEditableDetails({...editableDetails, amount: parseFloat(e.target.value) || 0})}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase mb-1.5 ml-1">N° Ricevuta</label>
                    <input 
                      type="text"
                      value={editableDetails.receiptNumber}
                      onChange={(e) => setEditableDetails({...editableDetails, receiptNumber: e.target.value})}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase mb-1.5 ml-1">Data</label>
                    <input 
                      type="date"
                      value={editableDetails.date}
                      onChange={(e) => setEditableDetails({...editableDetails, date: e.target.value})}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase mb-1.5 ml-1">Studente</label>
                    <input 
                      type="text"
                      value={editableDetails.studentName}
                      onChange={(e) => setEditableDetails({...editableDetails, studentName: e.target.value})}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase mb-1.5 ml-1">Descrizione</label>
                    <textarea 
                      value={editableDetails.description}
                      onChange={(e) => setEditableDetails({...editableDetails, description: e.target.value})}
                      rows={3}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Receipt Content */}
            <div className="flex-1 p-12 print:p-8 bg-white" id="printable-receipt">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 leading-none mb-2">RICEVUTA</h1>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">N° {editableDetails.receiptNumber}</p>
                </div>
                <div className="text-right uppercase">
                  <p className="font-black text-slate-800 text-lg">Gabriele Chiesa</p>
                  <p className="text-[10px] text-slate-500 font-bold tracking-tight">C.F. CHSGRL87D29C627L</p>
                  <p className="text-[10px] text-slate-400 font-medium tracking-wider mt-1">Management & Education</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-12 mb-12">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Emesso a:</p>
                  <div className="space-y-1">
                    <p className="font-bold text-slate-800">{editableDetails.studentName}</p>
                    <p className="text-xs text-slate-500">{student?.email}</p>
                    <p className="text-xs text-slate-500">{student?.phone}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Dettagli:</p>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500"><span className="font-bold text-slate-700">Data:</span> {new Date(editableDetails.date).toLocaleDateString('it-IT')}</p>
                    <p className="text-xs text-slate-500"><span className="font-bold text-slate-700">Metodo:</span> {editableDetails.paymentMethod}</p>
                    {course && <p className="text-xs text-slate-500"><span className="font-bold text-slate-700">Corso:</span> {course.name}</p>}
                  </div>
                </div>
              </div>

              <table className="w-full mb-12">
                <thead>
                  <tr className="border-b-2 border-slate-900">
                    <th className="py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-900">Descrizione Servizio</th>
                    <th className="py-3 text-right text-[10px] font-black uppercase tracking-widest text-slate-900">Totale</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="py-6">
                      <p className="font-bold text-slate-800 mb-1">
                        {editableDetails.description}
                      </p>
                      <p className="text-xs text-slate-500 italic">Servizio didattico professionale</p>
                    </td>
                    <td className="py-6 text-right">
                      <span className="font-black text-slate-900">€{editableDetails.amount.toFixed(2)}</span>
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="flex justify-end mb-20">
                <div className="w-64 space-y-3">
                  <div className="flex justify-between items-center text-slate-400 font-bold text-xs uppercase">
                    <span>Imponibile</span>
                    <span className="tabular-nums">€{editableDetails.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400 font-bold text-xs uppercase border-b border-slate-100 pb-3">
                    <span>IVA (Esente)</span>
                    <span className="tabular-nums">€0.00</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 text-slate-900 font-black text-xl">
                    <span>TOTALE</span>
                    <span className="tabular-nums">€{editableDetails.amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-12 text-[10px] text-slate-400 font-medium leading-relaxed">
                <div>
                  <p className="uppercase font-bold tracking-widest mb-2 border-b border-slate-100 pb-1">Note Legali</p>
                  <p>La presente ricevuta attesta l'avvenuto pagamento per i servizi indicati. Documento non rilevante ai fini IVA ai sensi dell'art. 10 DPR 633/72.</p>
                </div>
                <div className="flex flex-col items-center justify-end">
                  <div className="w-48 border-b border-slate-300 mb-2"></div>
                  <p className="uppercase font-black text-slate-800 tracking-widest">Firma del Responsabile</p>
                </div>
              </div>
            </div>
          </div>

          <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-4 print:hidden text-center">
            <button 
              onClick={handlePrint}
              className="flex-1 bg-slate-900 text-white px-6 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3"
            >
              <Printer size={16} />
              Stampa Ricevuta
            </button>
            <button 
              onClick={handleDownloadJPG}
              disabled={isDownloading}
              className="flex-1 bg-white border border-slate-200 text-slate-600 px-6 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-50 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <ImageIcon size={16} className={isDownloading ? 'animate-bounce' : ''} />
              {isDownloading ? 'Generazione...' : 'Salva JPG'}
            </button>
            <button 
              onClick={onClose}
              className="px-8 bg-slate-200 text-slate-500 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-300 transition-all"
            >
              Chiudi
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

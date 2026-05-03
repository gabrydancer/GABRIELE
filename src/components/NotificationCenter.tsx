import { Bell, CreditCard, Calendar, BookOpen, X, Check, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Notification, View } from '../types';
import { cn } from '../lib/utils';

interface NotificationCenterProps {
  notifications: Notification[];
  setNotifications: (notifications: Notification[]) => void;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: View) => void;
}

export default function NotificationCenter({ 
  notifications, 
  setNotifications, 
  isOpen, 
  onClose,
  onNavigate
}: NotificationCenterProps) {
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'payment': return <CreditCard size={14} className="text-emerald-500" />;
      case 'attendance': return <Calendar size={14} className="text-blue-500" />;
      case 'course': return <BookOpen size={14} className="text-amber-500" />;
      default: return <Bell size={14} className="text-indigo-500" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/10 backdrop-blur-[1px] z-40"
          />
          <motion.div 
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="fixed right-0 top-0 h-screen w-full max-w-sm bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Bell size={20} className="text-slate-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[8px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Notifiche</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-400">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
              {notifications.length > 0 ? (
                notifications.slice().sort((a, b) => b.date - a.date).map((notification) => (
                  <div 
                    key={notification.id}
                    className={cn(
                      "p-4 rounded-lg border transition-all relative group",
                      notification.read 
                        ? "bg-white border-slate-100 text-slate-400" 
                        : "bg-indigo-50/30 border-indigo-100 text-slate-800 shadow-sm border-l-4 border-l-indigo-600"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "mt-1 w-8 h-8 rounded flex items-center justify-center shrink-0 shadow-sm border",
                        notification.read ? "bg-slate-50 border-slate-100" : "bg-white border-indigo-100"
                      )}>
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className={cn(
                            "text-xs font-bold uppercase tracking-tight",
                            notification.read ? "text-slate-400" : "text-slate-900"
                          )}>
                            {notification.title}
                          </p>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter tabular-nums">
                            {new Date(notification.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed mb-3">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-3">
                          {!notification.read && (
                            <button 
                              onClick={() => markAsRead(notification.id)}
                              className="text-[9px] font-bold uppercase tracking-widest text-indigo-600 flex items-center gap-1 hover:underline"
                            >
                              <Check size={10} /> Segna come letta
                            </button>
                          )}
                          {notification.link && (
                            <button 
                              onClick={() => {
                                onNavigate(notification.link!);
                                onClose();
                              }}
                              className="text-[9px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1 hover:text-indigo-600"
                            >
                              <ExternalLink size={10} /> Vai alla sezione
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 py-20">
                  <Bell size={48} className="opacity-10 mb-4" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Nessuna notifica</p>
                  <p className="text-[10px] mt-1 italic">Il sistema è in stato di attesa</p>
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-6 border-t border-slate-100 grid grid-cols-2 gap-4 bg-slate-50/30">
                <button 
                  onClick={markAllAsRead}
                  className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 border border-slate-200 rounded hover:bg-white transition-colors"
                >
                  Leggi Tutte
                </button>
                <button 
                  onClick={clearAll}
                  className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-rose-500 border border-rose-100 rounded hover:bg-white transition-colors"
                >
                  Svuota
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

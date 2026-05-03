import { Users, BookOpen, CreditCard, TrendingUp, Bell, TrendingDown } from 'lucide-react';
import { Person, Course, AttendanceRecord, PaymentRecord, ExpenseRecord, Notification } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../lib/utils';

interface DashboardProps {
  people: Person[];
  courses: Course[];
  attendance: AttendanceRecord[];
  payments: PaymentRecord[];
  expenses: ExpenseRecord[];
  notifications: Notification[];
}

export default function Dashboard({ people, courses, attendance, payments, expenses, notifications }: DashboardProps) {
  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netEarnings = totalRevenue - totalExpenses;
  const activeStudents = people.length;
  const courseCount = courses.length;
  const unreadNotifications = notifications.filter(n => !n.read);
  
  // Last 7 days revenue vs expenses for chart
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayRevenue = payments
      .filter(p => p.date.startsWith(dateStr))
      .reduce((sum, p) => sum + p.amount, 0);
    const dayExpenses = expenses
      .filter(e => e.date.startsWith(dateStr))
      .reduce((sum, e) => sum + e.amount, 0);
    return {
      name: d.toLocaleDateString('it-IT', { weekday: 'short' }),
      revenue: dayRevenue,
      expenses: dayExpenses
    };
  });

  const stats = [
    { label: 'Studenti Totali', value: activeStudents, icon: Users, color: 'bg-slate-900', textColor: 'text-indigo-400' },
    { label: 'Entrate Totali', value: `€${totalRevenue.toFixed(2)}`, icon: CreditCard, color: 'bg-white', textColor: 'text-indigo-600' },
    { label: 'Uscite Totali', value: `€${totalExpenses.toFixed(2)}`, icon: TrendingDown, color: 'bg-white', textColor: 'text-rose-600' },
    { label: 'Utile Netto', value: `€${netEarnings.toFixed(2)}`, icon: TrendingUp, color: 'bg-indigo-600', textColor: 'text-white' },
  ];

  return (
    <div className="space-y-8">
      {unreadNotifications.length > 0 && (
        <div className="bg-indigo-600 p-4 rounded-xl shadow-lg shadow-indigo-100 flex items-center justify-between group">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-white animate-pulse">
              <Bell size={20} />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Hai {unreadNotifications.length} nuove notifiche</p>
              <p className="text-indigo-200 text-[10px] uppercase tracking-widest font-bold">Controlla il centro notifiche per i dettagli</p>
            </div>
          </div>
          <div className="hidden md:block">
            <span className="text-[10px] font-bold text-white bg-indigo-500 px-3 py-1 rounded-full uppercase tracking-widest">Azione Necessaria</span>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-slate-900">
        {stats.map((stat, i) => (
          <div key={i} className={cn(
            "p-6 rounded-xl border shadow-sm transition-all hover:shadow-md",
            stat.color.startsWith('bg-white') ? "bg-white border-slate-200" : `${stat.color} border-transparent`
          )}>
            <div className="flex items-center gap-4">
              <div className={cn(
                "p-3 rounded-lg",
                stat.color === 'bg-white' ? "bg-slate-50 text-slate-400" : "bg-white/10 text-white"
              )}>
                <stat.icon size={20} />
              </div>
              <div>
                <div className="flex items-center justify-between gap-2">
                  <p className={cn(
                    "text-[10px] font-bold uppercase tracking-widest",
                    stat.color.startsWith('bg-slate') || stat.color.startsWith('bg-indigo') ? "text-slate-300" : "text-slate-400"
                  )}>
                    {stat.label}
                  </p>
                </div>
                <p className={cn(
                  "text-2xl font-bold tracking-tight",
                  stat.color.startsWith('bg-slate') || stat.color.startsWith('bg-indigo') ? "text-white" : "text-slate-800"
                )}>
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rotate-45 translate-x-12 -translate-y-12"></div>
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-8 text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
            Andamento Finanziario
          </h3>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last7Days}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.01}/>
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="5%" stopColor="#E11D48" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#E11D48" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 600}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 600}} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Area type="monotone" dataKey="revenue" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" name="Entrate" />
                <Area type="monotone" dataKey="expenses" stroke="#E11D48" strokeWidth={3} fillOpacity={1} fill="url(#colorExpenses)" name="Uscite" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-8 text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
            Attività Recente
          </h3>
          <div className="space-y-6">
            {payments.slice(-5).reverse().map((p, i) => {
              const student = people.find(person => person.id === p.studentId);
              return (
                <div key={i} className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded bg-slate-50 text-slate-400 flex items-center justify-center shrink-0 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors border border-slate-100">
                    <CreditCard size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-800 truncate leading-none mb-1">
                      {student?.name || 'Utente eliminato'}
                    </p>
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                      + €{p.amount.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter tabular-nums">
                    {new Date(p.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}
                  </div>
                </div>
              );
            })}
            {payments.length === 0 && (
              <div className="py-20 flex flex-col items-center justify-center bg-slate-50 rounded-lg border border-dashed border-slate-200 italic text-slate-400 text-xs">
                Nessuna attività
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

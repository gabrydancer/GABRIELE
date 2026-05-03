import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { Person, Course, AttendanceRecord, PaymentRecord, ExpenseRecord } from '../types';

interface ReportsProps {
  people: Person[];
  courses: Course[];
  attendance: AttendanceRecord[];
  payments: PaymentRecord[];
  expenses: ExpenseRecord[];
}

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
const EXPENSE_COLORS = ['#E11D48', '#FB7185', '#FDA4AF', '#FECDD3', '#F43F5E'];

export default function Reports({ people, courses, attendance, payments, expenses }: ReportsProps) {
  // Revenue per Course
  const revenueByCourse = courses.map(course => ({
    name: course.name,
    amount: payments
      .filter(p => p.courseId === course.id)
      .reduce((sum, p) => sum + p.amount, 0)
  })).filter(d => d.amount > 0);

  // Expenses per Category
  const expensesByCategory = Object.entries(
    expenses.reduce((acc: Record<string, number>, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {})
  ).map(([name, amount]) => ({ name, amount }))
  .sort((a, b) => b.amount - a.amount);

  // Attendance rate per Course
  const attendanceByCourse = courses.map(course => {
    const courseAttendance = attendance.filter(a => a.courseId === course.id);
    const total = courseAttendance.length;
    const present = courseAttendance.filter(a => a.status === 'present').length;
    return {
      name: course.name,
      present: total > 0 ? Math.round((present / total) * 100) : 0
    };
  });

  // Top Spenders
  const topSpenders = people.map(p => ({
    name: p.name,
    total: payments
      .filter(pay => pay.studentId === p.id)
      .reduce((sum, pay) => sum + pay.amount, 0)
  }))
  .sort((a, b) => b.total - a.total)
  .slice(0, 5)
  .filter(d => d.total > 0);

  const downloadCSV = () => {
    const headers = ['Nome Corso', 'Entrate Totali', 'Percentuale Presenze'];
    const rows = courses.map(course => {
      const revenue = payments
        .filter(p => p.courseId === course.id)
        .reduce((sum, p) => sum + p.amount, 0);
      const courseAttendance = attendance.filter(a => a.courseId === course.id);
      const total = courseAttendance.length;
      const present = courseAttendance.filter(a => a.status === 'present').length;
      const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;
      
      return [course.name, `€${revenue.toFixed(2)}`, `${attendanceRate}%`].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `report_corsi_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Monthly Revenue Trend
  const monthlyRevenue = payments.reduce((acc: Record<string, number>, p) => {
    const date = new Date(p.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    acc[monthKey] = (acc[monthKey] || 0) + p.amount;
    return acc;
  }, {});

  const monthlyRevenueData = Object.entries(monthlyRevenue)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, amount]) => {
      const [year, monthNum] = month.split('-');
      const monthName = new Intl.DateTimeFormat('it-IT', { month: 'short' }).format(new Date(parseInt(year), parseInt(monthNum) - 1));
      return {
        label: `${monthName} ${year.slice(-2)}`,
        amount: Number(amount.toFixed(2))
      };
    });

  const totalIncome = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalOut = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netIncome = totalIncome - totalOut;
  const avgContribution = people.length > 0 ? totalIncome / people.length : 0;
  const totalAttendance = attendance.length;
  const totalPresent = attendance.filter(a => a.status === 'present').length;
  const attendanceRate = totalAttendance > 0 ? (totalPresent / totalAttendance) * 100 : 0;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rotate-45 translate-x-12 -translate-y-12"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-6 bg-indigo-600 rounded-full"></div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Resoconto Analitico</h2>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-4">Monitoraggio delle performance e dati aggregati</p>
        </div>
        <button 
          onClick={downloadCSV}
          className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 relative z-10"
        >
          <Download size={16} />
          Esporta CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Revenue Totale</p>
            <TrendingUp size={14} className="text-emerald-500" />
          </div>
          <p className="text-3xl font-bold text-slate-800 tabular-nums">€{totalIncome.toFixed(2)}</p>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider">Flusso Entrate</span>
          </div>
        </div>
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Uscite Totali</p>
            <TrendingDown size={14} className="text-rose-500" />
          </div>
          <p className="text-3xl font-bold text-slate-800 tabular-nums">€{totalOut.toFixed(2)}</p>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded uppercase tracking-wider">Flusso Uscite</span>
          </div>
        </div>
        <div className="bg-indigo-600 p-8 rounded-xl border border-transparent shadow-lg shadow-indigo-100">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-[0.2em]">Utile Netto</p>
            <Wallet size={14} className="text-white" />
          </div>
          <p className="text-3xl font-bold text-white tabular-nums">€{netIncome.toFixed(2)}</p>
          <div className="mt-4 flex items-center gap-2">
             <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-white rounded-full transition-all duration-1000" 
                 style={{ width: `${Math.min(100, Math.max(0, (netIncome / (totalIncome || 1)) * 100))}%` }}
               ></div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Distribution */}
        <div className="bg-white p-10 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-10 flex items-center gap-2">
            <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
            Distribuzione Entrate
          </h3>
          <div className="h-[320px]">
            {revenueByCourse.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueByCourse}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={8}
                    dataKey="amount"
                  >
                    {revenueByCourse.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px', fontWeight: 'bold'}}
                  />
                  <Legend iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
                <div className="flex items-center justify-center h-full text-slate-300 italic text-[10px] font-bold uppercase tracking-widest bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  Insufficient data for analysis
                </div>
            )}
          </div>
        </div>

        {/* Expense Distribution */}
        <div className="bg-white p-10 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-10 flex items-center gap-2">
            <div className="w-2 h-2 bg-rose-600 rounded-full"></div>
            Distribuzione Uscite
          </h3>
          <div className="h-[320px]">
            {expensesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={8}
                    dataKey="amount"
                  >
                    {expensesByCategory.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px', fontWeight: 'bold'}}
                  />
                  <Legend iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
                <div className="flex items-center justify-center h-full text-slate-300 italic text-[10px] font-bold uppercase tracking-widest bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  Nessun dato sulle uscite
                </div>
            )}
          </div>
        </div>

        {/* Top Spenders */}
        <div className="bg-white p-10 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-10 flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            Top Contributori
          </h3>
          <div className="h-[320px]">
            {topSpenders.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topSpenders} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#F1F3F5" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    width={100} 
                    tick={{fill: '#475569', fontSize: 11, fontWeight: 700}}
                  />
                  <Tooltip 
                    cursor={{fill: '#F8FAFC'}}
                    contentStyle={{borderRadius: '8px', border: '1px solid #E2E8F0'}}
                  />
                  <Bar dataKey="total" fill="#4F46E5" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
                <div className="flex items-center justify-center h-full text-slate-300 italic text-[10px] font-bold uppercase tracking-widest bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  Insufficient data for analysis
                </div>
            )}
          </div>
        </div>

        {/* Monthly Revenue Trend */}
        <div className="lg:col-span-2 bg-white p-10 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-10 flex items-center gap-2">
            <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
            Trend Mensile Entrate (€)
          </h3>
          <div className="h-[320px]">
            {monthlyRevenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                  <XAxis 
                    dataKey="label" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#475569', fontSize: 11, fontWeight: 700}} 
                    dy={10} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#475569', fontSize: 11, fontWeight: 700}} 
                    tickFormatter={(value) => `€${value}`}
                  />
                  <Tooltip 
                    cursor={{fill: '#F8FAFC'}}
                    contentStyle={{borderRadius: '8px', border: '1px solid #E2E8F0'}}
                    formatter={(value: number) => [`€${value.toFixed(2)}`, 'Totale Mensile']}
                  />
                  <Bar dataKey="amount" fill="#6366F1" radius={[4, 4, 0, 0]} barSize={50} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-300 italic text-[10px] font-bold uppercase tracking-widest bg-slate-50 rounded-lg border border-dashed border-slate-200">
                Insufficient data for trend analysis
              </div>
            )}
          </div>
        </div>

        {/* Attendance Percentage */}
        <div className="lg:col-span-2 bg-white p-10 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-10 flex items-center gap-2">
            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
            Performance Presenze per Corso
          </h3>
          <div className="h-[320px]">
              {attendanceByCourse.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attendanceByCourse}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 11, fontWeight: 700}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} unit="%" tick={{fill: '#475569', fontSize: 11, fontWeight: 700}} />
                    <Tooltip 
                      contentStyle={{borderRadius: '8px', border: '1px solid #E2E8F0'}}
                    />
                    <Bar dataKey="present" fill="#10B981" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-300 italic text-[10px] font-bold uppercase tracking-widest bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  Insufficient data for analysis
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}

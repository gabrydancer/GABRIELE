/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  Users, 
  BookOpen, 
  Calendar,
  CalendarCheck, 
  CreditCard, 
  BarChart3, 
  LayoutDashboard,
  Menu,
  X,
  Plus,
  Users2,
  Settings as SettingsIcon,
  Bell,
  TrendingDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStorage } from './hooks/useStorage';
import { Person, Course, AttendanceRecord, PaymentRecord, ExpenseRecord, Notification, UserPreferences } from './types';
import { cn } from './lib/utils';
import { useEffect } from 'react';

// Views
import PeopleList from './components/PeopleList';
import CourseManager from './components/CourseManager';
import AttendanceTracker from './components/AttendanceTracker';
import PaymentTracker from './components/PaymentTracker';
import ExpenseTracker from './components/ExpenseTracker';
import Reports from './components/Reports';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import NotificationCenter from './components/NotificationCenter';
import CalendarView from './components/CalendarView';

type View = 'dashboard' | 'people' | 'courses' | 'attendance' | 'payments' | 'expenses' | 'reports' | 'settings' | 'calendar';

export default function App() {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Data persistence
  const [people, setPeople] = useStorage<Person[]>('app_people', []);
  const [courses, setCourses] = useStorage<Course[]>('app_courses', []);
  const [attendance, setAttendance] = useStorage<AttendanceRecord[]>('app_attendance', []);
  const [payments, setPayments] = useStorage<PaymentRecord[]>('app_payments', []);
  const [expenses, setExpenses] = useStorage<ExpenseRecord[]>('app_expenses', []);
  const [notifications, setNotifications] = useStorage<Notification[]>('app_notifications', []);
  const [preferences, setPreferences] = useStorage<UserPreferences>('app_preferences', {
    notifyPayments: true,
    notifyAttendance: true,
    notifyCourses: true
  });

  // Notification engine
  useEffect(() => {
    const checkNotifications = () => {
      const newNotifications: Notification[] = [];
      const today = new Date().toISOString().split('T')[0];
      
      // 1. Payment deadlines (mock logic: if student hasn't paid recently)
      if (preferences.notifyPayments && courses.length > 0 && people.length > 0) {
        people.forEach(person => {
          const personPayments = payments.filter(p => p.studentId === person.id);
          if (personPayments.length === 0) {
            const id = `pay-${person.id}`;
            if (!notifications.find(n => n.id === id)) {
              newNotifications.push({
                id,
                type: 'payment',
                title: 'Pagamento Mancante',
                message: `${person.name} non ha ancora registrato alcun pagamento.`,
                date: Date.now(),
                read: false,
                link: 'payments'
              });
            }
          }
        });
      }

      // 2. Attendance reminders (if courses exist but no attendance recorded today)
      if (preferences.notifyAttendance && courses.length > 0) {
        const todayAttendance = attendance.filter(a => a.date === today);
        if (todayAttendance.length === 0) {
          const id = `att-${today}`;
          if (!notifications.find(n => n.id === id)) {
            newNotifications.push({
              id,
              type: 'attendance',
              title: 'Registro Presenze',
              message: `Ricordati di registrare le presenze per le lezioni di oggi.`,
              date: Date.now(),
              read: false,
              link: 'attendance'
            });
          }
        }
      }

      // 3. Upcoming courses (mock alert for tomorrow)
      if (preferences.notifyCourses && courses.length > 0) {
        const id = `course-alert-${today}`;
        if (!notifications.find(n => n.id === id)) {
          newNotifications.push({
            id,
            type: 'course',
            title: 'Prossima Lezione',
            message: `Domani sono previste nuove sessioni. Controlla il calendario dei corsi.`,
            date: Date.now(),
            read: false,
            link: 'courses'
          });
        }
      }

      if (newNotifications.length > 0) {
        setNotifications([...newNotifications, ...notifications]);
      }
    };

    checkNotifications();
    // In a real app, this might run on a timer or server push
  }, [people, courses, attendance, payments, preferences]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'people', label: 'Anagrafica', icon: Users },
    { id: 'courses', label: 'Corsi', icon: BookOpen },
    { id: 'attendance', label: 'Presenze', icon: CalendarCheck },
    { id: 'calendar', label: 'Calendario', icon: Calendar },
    { id: 'payments', label: 'Pagamenti', icon: CreditCard },
    { id: 'expenses', label: 'Uscite', icon: TrendingDown },
    { id: 'reports', label: 'Report', icon: BarChart3 },
    { id: 'settings', label: 'Impostazioni', icon: SettingsIcon },
  ];

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard 
          people={people} 
          courses={courses} 
          attendance={attendance} 
          payments={payments} 
          expenses={expenses}
          notifications={notifications}
        />;
      case 'people':
        return <PeopleList people={people} setPeople={setPeople} courses={courses} />;
      case 'courses':
        return <CourseManager courses={courses} setCourses={setCourses} people={people} />;
      case 'attendance':
        return <AttendanceTracker 
          attendance={attendance} 
          setAttendance={setAttendance}
          people={people}
          courses={courses}
        />;
      case 'calendar':
        return <CalendarView 
          preferences={preferences}
          onNavigate={(view) => setActiveView(view as any)}
        />;
      case 'payments':
        return <PaymentTracker 
          payments={payments} 
          setPayments={setPayments}
          people={people}
          courses={courses}
        />;
      case 'expenses':
        return <ExpenseTracker 
          expenses={expenses} 
          setExpenses={setExpenses}
        />;
      case 'reports':
        return <Reports 
          people={people} 
          courses={courses} 
          attendance={attendance} 
          payments={payments} 
          expenses={expenses}
        />;
      case 'settings':
        return <Settings 
          preferences={preferences}
          setPreferences={setPreferences}
        />;
      default:
        return <Dashboard 
          people={people} 
          courses={courses} 
          attendance={attendance} 
          payments={payments}
          expenses={expenses}
          notifications={notifications}
        />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Sidebar - Icon Only */}
      <aside className="w-20 bg-white border-r border-slate-200 flex flex-col z-20 shadow-sm">
        <div className="p-6 flex items-center justify-center border-b border-slate-50">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-xs">
            GC
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-2 mt-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as View)}
                className={cn(
                  "w-full flex flex-col items-center justify-center gap-1 py-3 rounded-lg transition-all duration-200 group relative",
                  isActive 
                    ? "bg-slate-50 text-indigo-600 border-r-4 border-indigo-600" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-indigo-600"
                )}
                title={item.label}
              >
                <Icon size={20} className={cn("shrink-0", isActive ? "text-indigo-600" : "group-hover:text-indigo-600")} />
                <span className="text-[8px] font-bold uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-600 rounded-r-lg" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 flex justify-center">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
            {preferences.notifyAttendance ? 'ON' : 'OFF'}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50/50">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-indigo-600 rounded-full"></div>
            <h1 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] pt-0.5">
              {navItems.find(i => i.id === activeView)?.label}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsNotificationsOpen(true)}
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-all relative"
            >
              <Bell size={20} />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
              )}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="h-full"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>

        <footer className="h-8 bg-white border-t border-slate-200 px-6 flex items-center justify-between shrink-0">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Status: Ready</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            {new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </footer>
      </main>

      <NotificationCenter 
        notifications={notifications}
        setNotifications={setNotifications}
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onNavigate={(view) => setActiveView(view)}
      />
    </div>
  );
}

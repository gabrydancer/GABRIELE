export interface Person {
  id: string;
  name: string;
  email: string;
  phone: string;
  courseIds: string[];
  notes?: string;
  createdAt: number;
}

export interface Course {
  id: string;
  name: string;
  description: string;
  price: number;
  dayOfWeek?: string;
  time?: string;
}

export interface AttendanceRecord {
  id: string;
  courseId: string;
  studentId: string;
  date: string; // ISO string YYYY-MM-DD
  status: 'present' | 'absent' | 'late';
}

export interface Notification {
  id: string;
  type: 'payment' | 'attendance' | 'course';
  title: string;
  message: string;
  date: number;
  read: boolean;
  link?: View;
}

export interface PaymentRecord {
  id: string;
  studentId: string;
  courseId: string;
  amount: number;
  description: string;
  date: string; // ISO string YYYY-MM-DD
}

export interface ExpenseRecord {
  id: string;
  category: string;
  amount: number;
  description: string;
  date: string; // ISO string YYYY-MM-DD
}

export interface UserPreferences {
  notifyPayments: boolean;
  notifyAttendance: boolean;
  notifyCourses: boolean;
  calendarUrl?: string;
}

export type View = 'dashboard' | 'people' | 'courses' | 'attendance' | 'payments' | 'expenses' | 'reports' | 'settings' | 'calendar';

import { Link, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Megaphone,
  Settings,
  Database,
  Building2,
  LogOut,
  X,
  ListTree,
  Package,
  Calendar,
} from 'lucide-react';

const adminNav = [
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/employees', label: 'Employees', Icon: Users },
  { to: '/departments', label: 'Departments', Icon: Building2 },
  { to: '/leaves', label: 'Leave Management', Icon: CalendarDays },
  { to: '/leave-types', label: 'Leave Types', Icon: ListTree },
  { to: '/leave-groups', label: 'Leave Groups', Icon: Package },
  { to: '/holidays', label: 'Holidays', Icon: Calendar },
  { to: '/announcements', label: 'Announcements', Icon: Megaphone },
  { to: '/settings', label: 'Settings', Icon: Settings },
  { to: '/backup', label: 'Backup & Restore', Icon: Database },
];

const employeeNav = [
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/leaves', label: 'My Leaves', Icon: CalendarDays },
  { to: '/holidays', label: 'Holidays', Icon: Calendar },
  { to: '/announcements', label: 'Announcements', Icon: Megaphone },
];

export default function Sidebar({ open, onClose }) {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const nav = user?.role === 'admin' ? adminNav : employeeNav;

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <>
      {/* Desktop: always visible; Mobile: slide in/out */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 flex flex-col
          bg-gradient-to-b from-[#0f172a] to-[#1e293b]
          shadow-2xl transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Logo / brand */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-none">EMS Portal</p>
              <p className="text-slate-400 text-[11px] mt-0.5 capitalize">{user?.role} · v1.1.0</p>
            </div>
          </div>
          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Navigation
          </p>
          {nav.map(({ to, label, Icon }) => {
            const active = pathname === to || (to !== '/dashboard' && pathname.startsWith(to));
            return (
              <Link
                key={to}
                to={to}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon size={17} className={active ? 'text-indigo-200' : 'text-slate-400'} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="px-3 py-3 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5 mb-2">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate leading-none">{user?.name}</p>
              <p className="text-xs text-slate-400 mt-0.5 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}

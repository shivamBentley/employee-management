import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStats, downloadPdf, downloadExcel, getLeaveSummary } from '../api';
import StatCard from '../components/StatCard';
import DepartmentChart from '../components/DepartmentChart';
import {
  Download,
  Users,
  Building2,
  CalendarDays,
  ListTree,
  Package,
  Calendar,
  Megaphone,
  Settings,
  Database,
  UserCircle,
  PlusCircle,
} from 'lucide-react';
import useToastStore from '../../../store/toastStore';
import useAuthStore from '../../../store/authStore';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [leaveSummary, setLeaveSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToastStore((s) => s.toast);
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'admin';

  const fetchStats = () => {
    setLoading(true);
    Promise.all([
      getStats(),
      getLeaveSummary({ year: new Date().getFullYear() }).catch(() => ({ data: null })),
    ])
      .then(([statsRes, leaveRes]) => {
        setStats(statsRes.data);
        setLeaveSummary(leaveRes.data);
      })
      .catch(() => toast('Failed to load dashboard stats', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleDownload = async (type) => {
    try {
      const fn = type === 'pdf' ? downloadPdf : downloadExcel;
      const { data } = await fn();
      const url = URL.createObjectURL(new Blob([data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `report.${type}`;
      a.click();
      toast(`Report downloaded as ${type.toUpperCase()}`, 'success');
    } catch {
      toast('Download failed', 'error');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-40 text-gray-400">Loading…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2">
        <button
          onClick={() => handleDownload('pdf')}
          className="flex items-center gap-1.5 text-sm bg-red-50 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-100 transition"
        >
          <Download size={14} /> PDF
        </button>
        <button
          onClick={() => handleDownload('excel')}
          className="flex items-center gap-1.5 text-sm bg-green-50 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-100 transition"
        >
          <Download size={14} /> Excel
        </button>
      </div>

      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 flex-shrink-0">
        <StatCard label="Total Employees" value={stats?.total_employees} color="blue" />
        <StatCard label="Active Employees" value={stats?.active_employees} color="green" />
        <StatCard label="On Leave Today" value={stats?.on_leave_today} color="orange" />
        <StatCard label="Pending Leaves" value={stats?.pending_leaves} color="red" />
      </div>

      <DepartmentChart data={stats?.department_stats ?? []} />

      {/* Quick Links */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-800">Quick Links</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[
            { to: '/profile', label: 'My Profile', Icon: UserCircle, color: 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' },
            { to: '/leaves/apply', label: 'Apply Leave', Icon: PlusCircle, color: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' },
            { to: '/leaves', label: 'My Leaves', Icon: CalendarDays, color: 'text-sky-600 bg-sky-50 hover:bg-sky-100' },
            { to: '/holidays', label: 'Holidays', Icon: Calendar, color: 'text-amber-600 bg-amber-50 hover:bg-amber-100' },
            { to: '/announcements', label: 'Announcements', Icon: Megaphone, color: 'text-pink-600 bg-pink-50 hover:bg-pink-100' },
            ...(isAdmin
              ? [
                  { to: '/employees', label: 'Employees', Icon: Users, color: 'text-blue-600 bg-blue-50 hover:bg-blue-100' },
                  { to: '/departments', label: 'Departments', Icon: Building2, color: 'text-violet-600 bg-violet-50 hover:bg-violet-100' },
                  { to: '/leave-types', label: 'Leave Types', Icon: ListTree, color: 'text-teal-600 bg-teal-50 hover:bg-teal-100' },
                  { to: '/leave-groups', label: 'Leave Groups', Icon: Package, color: 'text-orange-600 bg-orange-50 hover:bg-orange-100' },
                  { to: '/settings', label: 'Settings', Icon: Settings, color: 'text-gray-600 bg-gray-50 hover:bg-gray-100' },
                  { to: '/backup', label: 'Backup', Icon: Database, color: 'text-rose-600 bg-rose-50 hover:bg-rose-100' },
                ]
              : []),
          ].map(({ to, label, Icon, color }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${color}`}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Leave Balance Summary */}
      {leaveSummary?.balances && leaveSummary.balances.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-800">My Leave Balances ({new Date().getFullYear()})</h3>
          <div className="space-y-3">
            {leaveSummary.balances.map((b) => {
              const total = (b.allocated || 0) + (b.carried_forward || 0);
              const pct = total > 0 ? Math.min(100, ((b.used || 0) / total) * 100) : 0;
              return (
                <div key={b.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-gray-700">{b.leave_type?.name || 'Leave'}</span>
                    <span className="text-gray-500">{b.used}/{total}h used · <span className="text-indigo-600 font-semibold">{b.available}h left</span></span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-indigo-500 h-2 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          {leaveSummary.next_leave && (
            <div className="bg-indigo-50 rounded-lg px-4 py-2 text-xs text-indigo-700">
              Next upcoming leave: <span className="font-semibold">{leaveSummary.next_leave.leave_type?.name}</span> from{' '}
              {new Date(leaveSummary.next_leave.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} to{' '}
              {new Date(leaveSummary.next_leave.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

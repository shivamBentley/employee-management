import { useEffect, useState } from 'react';
import { getStats, downloadPdf, downloadExcel } from '../api';
import StatCard from '../components/StatCard';
import DepartmentChart from '../components/DepartmentChart';
import { Download } from 'lucide-react';
import useToastStore from '../../../store/toastStore';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToastStore((s) => s.toast);

  const fetchStats = () => {
    setLoading(true);
    getStats()
      .then(({ data }) => setStats(data))
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
    </div>
  );
}

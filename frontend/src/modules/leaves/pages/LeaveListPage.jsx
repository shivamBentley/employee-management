import { useEffect, useState, useMemo } from 'react';
import { getLeaves, approveLeave, rejectLeave, cancelLeave } from '../api';
import { Link } from 'react-router-dom';
import useAuthStore from '../../../store/authStore';
import useToastStore from '../../../store/toastStore';
import { Plus, Check, X, Search, ChevronUp, ChevronDown } from 'lucide-react';
import { useFeatureFlag } from '../../../shared/hooks/useFeatureFlag';
import FeatureDisabledBanner from '../../../shared/components/FeatureDisabledBanner';

function SortIcon({ field, sortKey, sortDir }) {
  if (sortKey !== field) return <ChevronUp size={11} className="text-gray-300 inline ml-0.5" />;
  return sortDir === 'asc'
    ? <ChevronUp size={11} className="text-indigo-500 inline ml-0.5" />
    : <ChevronDown size={11} className="text-indigo-500 inline ml-0.5" />;
}

const STATUS_COLORS = {
  pending:  'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

export default function LeaveListPage() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [sortKey, setSortKey] = useState('start_date');
  const [sortDir, setSortDir] = useState('desc');
  const { user } = useAuthStore();
  const toast = useToastStore((s) => s.toast);
  const { enabled: featureEnabled } = useFeatureFlag('leave_management_enabled');

  const load = () => {
    setLoading(true);
    getLeaves()
      .then(({ data }) => setLeaves(data.leaves ?? []))
      .catch(() => toast('Failed to load leaves', 'error'))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const leaveTypes = useMemo(() => [...new Set(leaves.map((l) => l.leave_type?.name || l.type).filter(Boolean))], [leaves]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const filtered = useMemo(() => {
    let list = [...leaves];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((l) => (l.user?.name ?? '').toLowerCase().includes(q));
    }
    if (filterStatus) list = list.filter((l) => l.status === filterStatus);
    if (filterType)   list = list.filter((l) => (l.leave_type?.name || l.type) === filterType);
    list.sort((a, b) => {
      if (sortKey === 'employee') {
        const cmp = (a.user?.name ?? '').localeCompare(b.user?.name ?? '');
        return sortDir === 'asc' ? cmp : -cmp;
      }
      if (sortKey === 'status') {
        const cmp = a.status.localeCompare(b.status);
        return sortDir === 'asc' ? cmp : -cmp;
      }
      // default: start_date
      const diff = new Date(a.start_date) - new Date(b.start_date);
      return sortDir === 'asc' ? diff : -diff;
    });
    return list;
  }, [leaves, search, filterStatus, filterType, sortKey, sortDir]);

  const handleAction = async (action, id) => {
    try {
      if (action === 'approve') {
        await approveLeave(id);
        toast('Leave approved', 'success');
      } else if (action === 'reject') {
        await rejectLeave(id);
        toast('Leave rejected', 'warning');
      } else if (action === 'cancel') {
        if (!window.confirm('Cancel this leave?')) return;
        await cancelLeave(id);
        toast('Leave cancelled', 'info');
      }
      load();
    } catch {
      toast('Action failed', 'error');
    }
  };

  const COLS = [
    { key: 'employee',   label: 'Employee' },
    { key: null,         label: 'Type' },
    { key: 'start_date', label: 'From' },
    { key: null,         label: 'To' },
    { key: null,         label: 'Hours' },
    { key: 'status',     label: 'Status' },
    { key: null,         label: 'Actions' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-3">
        <Link
          to="/leaves/apply"
          className="flex items-center gap-1.5 text-sm bg-indigo-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-indigo-700 whitespace-nowrap"
        >
          <Plus size={16} /> <span className="hidden sm:inline">Apply</span> Leave
        </Link>
      </div>

      {!featureEnabled && <FeatureDisabledBanner featureName="Leave Management" />}

      {/* Toolbar */}
      <div className="flex flex-wrap gap-2">
        {user?.role === 'admin' && (
          <div className="relative flex-1 min-w-[160px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employee…"
              className="w-full pl-8 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>
        )}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="">All Types</option>
          {leaveTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {!loading && (
        <p className="text-xs text-gray-400">{filtered.length} of {leaves.length} records</p>
      )}

      {loading ? (
        <p className="text-gray-400">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
          No leave records match your filters.
        </div>
      ) : (
        <div className="overflow-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full text-sm min-w-[560px]">
            <thead className="sticky top-0 z-10 bg-gray-50 text-gray-500 text-xs uppercase shadow-sm">
              <tr>
                {COLS.map(({ key, label }) => (
                  <th
                    key={label}
                    onClick={() => key && toggleSort(key)}
                    className={`px-4 py-3 text-left font-semibold whitespace-nowrap select-none ${
                      key ? 'cursor-pointer hover:text-indigo-600' : ''
                    }`}
                  >
                    <span className="inline-flex items-center">
                      {label}{key && <SortIcon field={key} sortKey={sortKey} sortDir={sortDir} />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{l.user?.name ?? 'You'}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{l.leave_type?.name || l.type}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmtDate(l.start_date)}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmtDate(l.end_date)}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{l.effective_hours ?? '—'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[l.status]}`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {user?.role === 'admin' && l.status === 'pending' && (
                        <>
                          <button onClick={() => handleAction('approve', l.id)} className="p-1.5 rounded hover:bg-green-50 text-green-600" title="Approve"><Check size={14} /></button>
                          <button onClick={() => handleAction('reject', l.id)} className="p-1.5 rounded hover:bg-red-50 text-red-500" title="Reject"><X size={14} /></button>
                        </>
                      )}
                      {l.status === 'pending' && (
                        <button onClick={() => handleAction('cancel', l.id)} className="text-xs text-gray-400 hover:text-red-500 px-2">Cancel</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


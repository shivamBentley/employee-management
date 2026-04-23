import { useEffect, useState, useMemo } from 'react';
import { getEmployees, deleteEmployee } from '../api';
import { Link } from 'react-router-dom';
import StatusBadge from '../../presence/components/StatusBadge';
import { Pencil, Trash2, Plus, Search, ChevronUp, ChevronDown } from 'lucide-react';
import CreateEmployeeModal from '../components/CreateEmployeeModal';
import useToastStore from '../../../store/toastStore';

function SortIcon({ field, sortKey, sortDir }) {
  if (sortKey !== field) return <ChevronUp size={11} className="text-gray-300 inline ml-0.5" />;
  return sortDir === 'asc'
    ? <ChevronUp size={11} className="text-indigo-500 inline ml-0.5" />
    : <ChevronDown size={11} className="text-indigo-500 inline ml-0.5" />;
}

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?background=6366f1&color=fff&bold=true&size=64';

export default function EmployeeListPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const toast = useToastStore((s) => s.toast);

  const load = () => {
    setLoading(true);
    getEmployees()
      .then(({ data }) => setEmployees(data.users ?? []))
      .catch(() => toast('Failed to load employees', 'error'))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const departments = useMemo(() => {
    const map = new Map();
    employees.forEach((e) => { if (e.department) map.set(e.department.id, e.department.name); });
    return [...map.entries()].map(([id, name]) => ({ id, name }));
  }, [employees]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    try {
      await deleteEmployee(id);
      setEmployees((prev) => prev.filter((e) => e.id !== id));
      toast(`${name} removed`, 'success');
    } catch {
      toast('Failed to delete employee', 'error');
    }
  };

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const filtered = useMemo(() => {
    let list = [...employees];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((e) => e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q));
    }
    if (filterDept) list = list.filter((e) => String(e.department?.id) === filterDept);
    if (filterStatus) list = list.filter((e) => (e.presence?.status ?? 'offline') === filterStatus);
    list.sort((a, b) => {
      let va = '', vb = '';
      if (sortKey === 'name')       { va = a.name;                       vb = b.name; }
      else if (sortKey === 'department') { va = a.department?.name ?? ''; vb = b.department?.name ?? ''; }
      else if (sortKey === 'position')   { va = a.position ?? '';         vb = b.position ?? ''; }
      else if (sortKey === 'status')     { va = a.presence?.status ?? 'offline'; vb = b.presence?.status ?? 'offline'; }
      const cmp = String(va).localeCompare(String(vb));
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [employees, search, filterDept, filterStatus, sortKey, sortDir]);

  const COLS = [
    { key: 'name',       label: 'Name' },
    { key: 'email',      label: 'Email' },
    { key: 'department', label: 'Department' },
    { key: 'position',   label: 'Position' },
    { key: 'status',     label: 'Status' },
    { key: null,         label: 'Actions' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 text-sm bg-indigo-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-indigo-700 whitespace-nowrap"
        >
          <Plus size={16} /> <span className="hidden sm:inline">Add</span> Employee
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email…"
            className="w-full pl-8 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
        </div>
        <select
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="">All Departments</option>
          {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="">All Statuses</option>
          <option value="online">Online</option>
          <option value="away">Away</option>
          <option value="offline">Offline</option>
        </select>
      </div>

      {!loading && (
        <p className="text-xs text-gray-400">{filtered.length} of {employees.length} employees</p>
      )}

      {loading ? (
        <p className="text-gray-400">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
          No employees match your filters.
        </div>
      ) : (
        <div className="overflow-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full text-sm min-w-[640px]">
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
              {filtered.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <img
                        src={emp.avatar || `${DEFAULT_AVATAR}&name=${encodeURIComponent(emp.name)}`}
                        alt={emp.name}
                        className="w-7 h-7 rounded-full object-cover shrink-0"
                      />
                      {emp.name}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 truncate max-w-[180px]">{emp.email}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{emp.department?.name || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{emp.position || '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={emp.presence?.status ?? 'offline'} showLabel /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link to={`/employees/${emp.id}`} className="p-1.5 rounded hover:bg-indigo-50 text-indigo-600" title="Edit"><Pencil size={14} /></Link>
                      <button onClick={() => handleDelete(emp.id, emp.name)} className="p-1.5 rounded hover:bg-red-50 text-red-500" title="Delete"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <CreateEmployeeModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); load(); }}
        />
      )}
    </div>
  );
}


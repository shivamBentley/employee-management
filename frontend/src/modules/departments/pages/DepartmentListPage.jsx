import { useEffect, useState, useMemo } from 'react';
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from '../api';
import { Plus, Pencil, Trash2, X, Check, Search, ChevronUp, ChevronDown } from 'lucide-react';
import useToastStore from '../../../store/toastStore';

function SortIcon({ field, sortKey, sortDir }) {
  if (sortKey !== field) return <ChevronUp size={11} className="text-gray-300 inline ml-0.5" />;
  return sortDir === 'asc'
    ? <ChevronUp size={11} className="text-indigo-500 inline ml-0.5" />
    : <ChevronDown size={11} className="text-indigo-500 inline ml-0.5" />;
}

export default function DepartmentListPage() {
  const [departments, setDepartments] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const toast = useToastStore((s) => s.toast);

  const load = () =>
    getDepartments()
      .then(({ data }) => setDepartments(data.departments ?? []))
      .catch(() => toast('Failed to load departments', 'error'));

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      await createDepartment({ name: newName });
      setNewName('');
      setAdding(false);
      toast('Department created', 'success');
      load();
    } catch {
      toast('Failed to create department', 'error');
    }
  };

  const handleUpdate = async (id) => {
    try {
      await updateDepartment(id, { name: editName });
      setEditId(null);
      toast('Department updated', 'success');
      load();
    } catch {
      toast('Failed to update department', 'error');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await deleteDepartment(id);
      toast(`"${name}" deleted`, 'success');
      load();
    } catch {
      toast('Failed to delete department', 'error');
    }
  };

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const filtered = useMemo(() => {
    let list = [...departments];
    if (search) list = list.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()));
    list.sort((a, b) => {
      if (sortKey === 'members') {
        const va = a.users_count ?? a.user_count ?? 0;
        const vb = b.users_count ?? b.user_count ?? 0;
        return sortDir === 'asc' ? va - vb : vb - va;
      }
      const cmp = a.name.localeCompare(b.name);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [departments, search, sortKey, sortDir]);

  const COLS = [
    { key: 'name',    label: 'Name' },
    { key: 'members', label: 'Members' },
    { key: null,      label: 'Actions' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700"
        >
          <Plus size={14} /> Add
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search departments…"
            className="w-full pl-8 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
        </div>
      </div>

      <p className="text-xs text-gray-400">{filtered.length} of {departments.length} departments</p>

      {adding && (
        <div className="flex gap-2">
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="Department name"
            className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button onClick={handleCreate} className="p-2 bg-indigo-600 text-white rounded-lg"><Check size={16} /></button>
          <button onClick={() => setAdding(false)} className="p-2 text-gray-400 rounded-lg hover:bg-gray-100"><X size={16} /></button>
        </div>
      )}

      <div className="overflow-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">No departments match your search.</div>
        ) : (
          <table className="w-full text-sm">
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
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {editId === d.id ? (
                      <input
                        autoFocus
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleUpdate(d.id)}
                        className="border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                      />
                    ) : d.name}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{d.users_count ?? d.user_count ?? 0} members</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {editId === d.id ? (
                        <>
                          <button onClick={() => handleUpdate(d.id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded"><Check size={14} /></button>
                          <button onClick={() => setEditId(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded"><X size={14} /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditId(d.id); setEditName(d.name); }} className="p-1.5 hover:bg-indigo-50 text-indigo-600 rounded"><Pencil size={14} /></button>
                          <button onClick={() => handleDelete(d.id, d.name)} className="p-1.5 hover:bg-red-50 text-red-500 rounded"><Trash2 size={14} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}


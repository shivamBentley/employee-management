import { useEffect, useState, useMemo } from 'react';
import { getHolidays, getHolidayCountries, createHoliday, updateHoliday, deleteHoliday } from '../api';
import useToastStore from '../../../store/toastStore';
import useAuthStore from '../../../store/authStore';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

const COUNTRIES = [
  { code: 'IN', name: 'India' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'SG', name: 'Singapore' },
  { code: 'AE', name: 'UAE' },
  { code: 'JP', name: 'Japan' },
];

const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

export default function HolidayListPage() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCountry, setFilterCountry] = useState('');
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ country_code: '', country_name: '', name: '', date: '', description: '' });
  const toast = useToastStore((s) => s.toast);
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const load = () => {
    setLoading(true);
    const params = { year: filterYear };
    if (filterCountry) params.country = filterCountry;
    getHolidays(params)
      .then(({ data }) => setHolidays(data.holidays ?? []))
      .catch(() => toast('Failed to load holidays', 'error'))
      .finally(() => setLoading(false));
  };
  useEffect(load, [filterCountry, filterYear]);

  const resetForm = () => {
    setForm({ country_code: '', country_name: '', name: '', date: '', description: '' });
    setEditId(null);
    setShowForm(false);
  };

  const handleCountrySelect = (code) => {
    const c = COUNTRIES.find((c) => c.code === code);
    setForm((f) => ({ ...f, country_code: code, country_name: c?.name || code }));
  };

  const handleEdit = (h) => {
    setForm({
      country_code: h.country_code,
      country_name: h.country_name,
      name: h.name,
      date: h.date?.split('T')[0] || '',
      description: h.description || '',
    });
    setEditId(h.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateHoliday(editId, form);
        toast('Holiday updated', 'success');
      } else {
        await createHoliday(form);
        toast('Holiday created', 'success');
      }
      resetForm();
      load();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to save', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this holiday?')) return;
    try {
      await deleteHoliday(id);
      toast('Holiday deleted', 'info');
      load();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to delete', 'error');
    }
  };

  const years = useMemo(() => {
    const cur = new Date().getFullYear();
    return [cur - 1, cur, cur + 1];
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          {isAdmin && (
            <select
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">All Countries</option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          )}
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(Number(e.target.value))}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        {isAdmin && (
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-1.5 text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            <Plus size={16} /> Add Holiday
          </button>
        )}
      </div>

      {showForm && isAdmin && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-sm">{editId ? 'Edit Holiday' : 'New Holiday'}</h3>
            <button type="button" onClick={resetForm}><X size={16} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Country</label>
              <select
                required
                value={form.country_code}
                onChange={(e) => handleCountrySelect(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
              >
                <option value="">Select country</option>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Holiday Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
              <input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            {editId ? 'Update' : 'Create'}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-gray-400">Loading…</p>
      ) : holidays.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
          No holidays found for the selected filters.
        </div>
      ) : (
        <div className="overflow-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Holiday</th>
                <th className="px-4 py-3 text-left font-semibold">Date</th>
                <th className="px-4 py-3 text-left font-semibold">Country</th>
                <th className="px-4 py-3 text-left font-semibold">Description</th>
                {isAdmin && <th className="px-4 py-3 text-left font-semibold">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {holidays.map((h) => (
                <tr key={h.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-800">{h.name}</td>
                  <td className="px-4 py-3 text-gray-500">{fmtDate(h.date)}</td>
                  <td className="px-4 py-3 text-gray-500">{h.country_name} ({h.country_code})</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{h.description || '—'}</td>
                  {isAdmin && (
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => handleEdit(h)} className="p-1.5 rounded hover:bg-blue-50 text-blue-600"><Pencil size={14} /></button>
                        <button onClick={() => handleDelete(h.id)} className="p-1.5 rounded hover:bg-red-50 text-red-500"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

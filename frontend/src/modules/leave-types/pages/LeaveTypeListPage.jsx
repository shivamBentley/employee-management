import { useEffect, useState } from 'react';
import { getLeaveTypes, createLeaveType, updateLeaveType, deleteLeaveType } from '../api';
import useToastStore from '../../../store/toastStore';
import useAuthStore from '../../../store/authStore';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';

export default function LeaveTypeListPage() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', default_balance: 0, is_paid: true });
  const toast = useToastStore((s) => s.toast);
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const load = () => {
    setLoading(true);
    getLeaveTypes()
      .then(({ data }) => setTypes(data.leave_types ?? []))
      .catch(() => toast('Failed to load leave types', 'error'))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const resetForm = () => {
    setForm({ name: '', description: '', default_balance: 0, is_paid: true });
    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = (t) => {
    setForm({ name: t.name, description: t.description || '', default_balance: t.default_balance, is_paid: t.is_paid });
    setEditId(t.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateLeaveType(editId, form);
        toast('Leave type updated', 'success');
      } else {
        await createLeaveType(form);
        toast('Leave type created', 'success');
      }
      resetForm();
      load();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to save leave type', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this leave type?')) return;
    try {
      await deleteLeaveType(id);
      toast('Leave type deactivated', 'info');
      load();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to delete', 'error');
    }
  };

  return (
    <div className="space-y-4">
      {isAdmin && (
        <div className="flex justify-end">
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-1.5 text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            <Plus size={16} /> Add Leave Type
          </button>
        </div>
      )}

      {showForm && isAdmin && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-sm">{editId ? 'Edit Leave Type' : 'New Leave Type'}</h3>
            <button type="button" onClick={resetForm}><X size={16} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Default Balance (hours)</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={form.default_balance}
                onChange={(e) => setForm((f) => ({ ...f, default_balance: parseFloat(e.target.value) || 0 }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_paid}
              onChange={(e) => setForm((f) => ({ ...f, is_paid: e.target.checked }))}
              className="rounded"
            />
            Paid leave
          </label>
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
      ) : types.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
          No leave types found.
        </div>
      ) : (
        <div className="overflow-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Name</th>
                <th className="px-4 py-3 text-left font-semibold">Description</th>
                <th className="px-4 py-3 text-left font-semibold">Balance</th>
                <th className="px-4 py-3 text-left font-semibold">Paid</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                {isAdmin && <th className="px-4 py-3 text-left font-semibold">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {types.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-800">{t.name}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{t.description || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{t.default_balance}</td>
                  <td className="px-4 py-3">
                    {t.is_paid ? <Check size={14} className="text-green-500" /> : <X size={14} className="text-gray-300" />}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {t.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => handleEdit(t)} className="p-1.5 rounded hover:bg-blue-50 text-blue-600"><Pencil size={14} /></button>
                        <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded hover:bg-red-50 text-red-500"><Trash2 size={14} /></button>
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

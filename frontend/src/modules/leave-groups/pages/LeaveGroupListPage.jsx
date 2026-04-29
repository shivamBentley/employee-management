import { useEffect, useState } from 'react';
import { getLeaveGroups, createLeaveGroup, updateLeaveGroup, deleteLeaveGroup } from '../api';
import { getLeaveTypes } from '../../leave-types/api';
import useToastStore from '../../../store/toastStore';
import { Plus, Pencil, Trash2, X, ChevronDown, ChevronUp } from 'lucide-react';

export default function LeaveGroupListPage() {
  const [groups, setGroups] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', is_default: false, items: [] });
  const toast = useToastStore((s) => s.toast);

  const load = () => {
    setLoading(true);
    Promise.all([getLeaveGroups(), getLeaveTypes()])
      .then(([gRes, tRes]) => {
        setGroups(gRes.data.leave_groups ?? []);
        setLeaveTypes(tRes.data.leave_types ?? []);
      })
      .catch(() => toast('Failed to load data', 'error'))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const resetForm = () => {
    setForm({ name: '', description: '', is_default: false, items: [] });
    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = (g) => {
    setForm({
      name: g.name,
      description: g.description || '',
      is_default: g.is_default,
      items: (g.items || []).map((i) => ({ leave_type_id: i.leave_type_id, balance: i.balance })),
    });
    setEditId(g.id);
    setShowForm(true);
  };

  const addItem = () => {
    setForm((f) => ({ ...f, items: [...f.items, { leave_type_id: '', balance: 0 }] }));
  };

  const removeItem = (idx) => {
    setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  };

  const updateItem = (idx, key, val) => {
    setForm((f) => ({
      ...f,
      items: f.items.map((item, i) => (i === idx ? { ...item, [key]: val } : item)),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.items.length === 0) {
      toast('Add at least one leave type', 'warning');
      return;
    }
    try {
      const payload = {
        ...form,
        items: form.items.map((i) => ({ leave_type_id: Number(i.leave_type_id), balance: parseFloat(i.balance) || 0 })),
      };
      if (editId) {
        await updateLeaveGroup(editId, payload);
        toast('Leave group updated', 'success');
      } else {
        await createLeaveGroup(payload);
        toast('Leave group created', 'success');
      }
      resetForm();
      load();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to save', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this leave group?')) return;
    try {
      await deleteLeaveGroup(id);
      toast('Leave group deleted', 'info');
      load();
    } catch (err) {
      toast(err.response?.data?.message || 'Cannot delete', 'error');
    }
  };

  const getTypeName = (id) => leaveTypes.find((t) => t.id === id)?.name || `#${id}`;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-1.5 text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          <Plus size={16} /> Add Leave Group
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-sm">{editId ? 'Edit Leave Group' : 'New Leave Group'}</h3>
            <button type="button" onClick={resetForm}><X size={16} /></button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Group Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_default}
              onChange={(e) => setForm((f) => ({ ...f, is_default: e.target.checked }))}
              className="rounded"
            />
            Set as default group
          </label>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-gray-600">Leave Types & Balances</p>
              <button type="button" onClick={addItem} className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
                <Plus size={12} /> Add type
              </button>
            </div>
            {form.items.map((item, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <select
                  required
                  value={item.leave_type_id}
                  onChange={(e) => updateItem(idx, 'leave_type_id', e.target.value)}
                  className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none"
                >
                  <option value="">Select leave type</option>
                  {leaveTypes.filter((t) => t.is_active).map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="Balance"
                  value={item.balance}
                  onChange={(e) => updateItem(idx, 'balance', e.target.value)}
                  className="w-24 border rounded-lg px-3 py-2 text-sm focus:outline-none"
                />
                <button type="button" onClick={() => removeItem(idx)} className="p-1 text-red-400 hover:text-red-600">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            {editId ? 'Update Group' : 'Create Group'}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-gray-400">Loading…</p>
      ) : groups.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
          No leave groups found.
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map((g) => (
            <div key={g.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between px-4 py-3">
                <div
                  className="flex items-center gap-2 flex-1 cursor-pointer"
                  onClick={() => setExpanded(expanded === g.id ? null : g.id)}
                >
                  {expanded === g.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  <span className="font-medium text-sm">{g.name}</span>
                  {g.is_default && (
                    <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">Default</span>
                  )}
                  <span className="text-xs text-gray-400 ml-2">{g.user_count} users</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(g)} className="p-1.5 rounded hover:bg-blue-50 text-blue-600"><Pencil size={14} /></button>
                  {!g.is_default && (
                    <button onClick={() => handleDelete(g.id)} className="p-1.5 rounded hover:bg-red-50 text-red-500"><Trash2 size={14} /></button>
                  )}
                </div>
              </div>
              {expanded === g.id && (
                <div className="px-4 pb-3 border-t border-gray-50">
                  {g.description && <p className="text-xs text-gray-400 py-2">{g.description}</p>}
                  <table className="w-full text-sm">
                    <thead className="text-xs text-gray-500">
                      <tr>
                        <th className="text-left py-1.5">Leave Type</th>
                        <th className="text-left py-1.5">Balance (hours)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {(g.items || []).map((item) => (
                        <tr key={item.id}>
                          <td className="py-1.5 text-gray-700">{item.leave_type?.name || getTypeName(item.leave_type_id)}</td>
                          <td className="py-1.5 text-gray-600">{item.balance}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

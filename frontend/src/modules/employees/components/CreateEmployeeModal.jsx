import { useState, useEffect } from 'react';
import { createEmployee } from '../api';
import { getDepartments } from '../../departments/api';
import { X } from 'lucide-react';
import useToastStore from '../../../store/toastStore';

export default function CreateEmployeeModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'employee', position: '', department_id: '' });
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToastStore((s) => s.toast);

  useEffect(() => {
    getDepartments().then(({ data }) => setDepartments(data.departments ?? [])).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createEmployee(form);
      toast(`Employee "${form.name}" created`, 'success');
      onCreated();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to create employee', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Add Employee</h2>
          <button onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {[['name', 'Name', 'text'], ['email', 'Email', 'email'], ['password', 'Password', 'password'], ['position', 'Position', 'text']].map(([key, label, type]) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
              <input
                type={type}
                required={key !== 'position'}
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Department</label>
            <select
              value={form.department_id}
              onChange={(e) => setForm((f) => ({ ...f, department_id: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— No department —</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
            >
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? 'Creating…' : 'Create Employee'}
          </button>
        </form>
      </div>
    </div>
  );
}

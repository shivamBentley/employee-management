import { useState, useEffect } from 'react';
import { createEmployee } from '../api';
import { getDepartments } from '../../departments/api';
import { getLeaveGroups } from '../../leave-groups/api';
import { X } from 'lucide-react';
import useToastStore from '../../../store/toastStore';
import useSettingsStore from '../../../store/settingsStore';

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

export default function CreateEmployeeModal({ onClose, onCreated }) {
  const settings = useSettingsStore((s) => s.settings);
  const countryEnabled   = settings.country_support_enabled    !== '0';
  const leaveGroupEnabled = settings.leave_group_support_enabled !== '0';
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'employee', position: '',
    department_id: '', country_code: 'IN', leave_group_id: '',
    phone: '', team_name: '', date_of_joining: '', date_of_birth: '',
    salary: '', salary_currency: 'USD', skills: '',
    address: '', city: '', state: '', zip_code: '',
    linkedin_url: '', emergency_contact_name: '', emergency_contact_phone: '',
  });
  const [departments, setDepartments] = useState([]);
  const [leaveGroups, setLeaveGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToastStore((s) => s.toast);

  useEffect(() => {
    Promise.all([
      getDepartments().catch(() => ({ data: { departments: [] } })),
      getLeaveGroups().catch(() => ({ data: { leave_groups: [] } })),
    ]).then(([dRes, gRes]) => {
      setDepartments(dRes.data.departments ?? []);
      const groups = gRes.data.leave_groups ?? [];
      setLeaveGroups(groups);
      const defaultGroup = groups.find((g) => g.is_default);
      if (defaultGroup) setForm((f) => ({ ...f, leave_group_id: String(defaultGroup.id) }));
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form };
      // Parse comma-separated skills into array
      if (typeof payload.skills === 'string') {
        payload.skills = payload.skills.split(',').map((s) => s.trim()).filter(Boolean);
      }
      // Remove empty optional fields
      Object.keys(payload).forEach((k) => {
        if (payload[k] === '' || payload[k] === null) delete payload[k];
      });
      await createEmployee(payload);
      toast(`Employee "${form.name}" created`, 'success');
      onCreated();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to create employee', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-100">
          <h2 className="text-lg font-semibold">Add Employee</h2>
          <button onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-4 space-y-4 flex-1">
          {/* Required fields */}
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Basic Info</p>
          {[['name', 'Name', 'text', true], ['email', 'Email', 'email', true], ['password', 'Password', 'password', true], ['position', 'Position', 'text', false]].map(([key, label, type, req]) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{label}{req && <span className="text-red-400"> *</span>}</label>
              <input
                type={type}
                required={req}
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Team</label>
              <input type="text" value={form.team_name} onChange={(e) => setForm((f) => ({ ...f, team_name: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date of Joining</label>
              <input type="date" value={form.date_of_joining} onChange={(e) => setForm((f) => ({ ...f, date_of_joining: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date of Birth</label>
              <input type="date" value={form.date_of_birth} onChange={(e) => setForm((f) => ({ ...f, date_of_birth: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Department</label>
            <select value={form.department_id} onChange={(e) => setForm((f) => ({ ...f, department_id: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">— No department —</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {countryEnabled && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Country <span className="text-red-400">*</span></label>
                <select required value={form.country_code} onChange={(e) => setForm((f) => ({ ...f, country_code: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
              <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none">
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          {leaveGroupEnabled && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Leave Group</label>
              <select value={form.leave_group_id} onChange={(e) => setForm((f) => ({ ...f, leave_group_id: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">— Default group —</option>
                {leaveGroups.map((g) => <option key={g.id} value={g.id}>{g.name}{g.is_default ? ' (Default)' : ''}</option>)}
              </select>
            </div>
          )}

          {/* Compensation */}
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 pt-2">Compensation</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Salary</label>
              <input type="number" step="0.01" min="0" value={form.salary} onChange={(e) => setForm((f) => ({ ...f, salary: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. 95000" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Currency</label>
              <select value={form.salary_currency} onChange={(e) => setForm((f) => ({ ...f, salary_currency: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {['USD', 'EUR', 'GBP', 'INR', 'SGD', 'AUD', 'CAD', 'JPY', 'AED'].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Skills */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Skills <span className="text-gray-400 font-normal">(comma-separated)</span></label>
            <input type="text" value={form.skills} onChange={(e) => setForm((f) => ({ ...f, skills: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. React, TypeScript, AWS" />
          </div>

          {/* Address */}
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 pt-2">Address</p>
          <div>
            <input type="text" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Street address" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <input type="text" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="City" />
            </div>
            <div>
              <input type="text" value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="State" />
            </div>
            <div>
              <input type="text" value={form.zip_code} onChange={(e) => setForm((f) => ({ ...f, zip_code: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="ZIP" />
            </div>
          </div>

          {/* Emergency contact & LinkedIn */}
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 pt-2">Other</p>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">LinkedIn URL</label>
            <input type="url" value={form.linkedin_url} onChange={(e) => setForm((f) => ({ ...f, linkedin_url: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://linkedin.com/in/..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Emergency Contact</label>
              <input type="text" value={form.emergency_contact_name} onChange={(e) => setForm((f) => ({ ...f, emergency_contact_name: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Name" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Emergency Phone</label>
              <input type="tel" value={form.emergency_contact_phone} onChange={(e) => setForm((f) => ({ ...f, emergency_contact_phone: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Phone" />
            </div>
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

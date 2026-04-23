import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getEmployee, updateEmployee, getMe, updateMe } from '../api';
import { getDepartments } from '../../departments/api';
import useAuthStore from '../../../store/authStore';
import useToastStore from '../../../store/toastStore';
import { Camera } from 'lucide-react';

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?background=6366f1&color=fff&bold=true&size=128';

export default function EmployeeProfilePage() {
  const { id } = useParams();
  const { user: authUser, setUser } = useAuthStore();
  const isOwn = !id;
  const isAdmin = authUser?.role === 'admin';

  const [form, setForm] = useState({ name: '', phone: '', bio: '', position: '', department_id: '' });
  const [departments, setDepartments] = useState([]);
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [currentAvatar, setCurrentAvatar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToastStore((s) => s.toast);

  useEffect(() => {
    const fetch = isOwn ? getMe : () => getEmployee(id);
    const calls = [fetch(), getDepartments().catch(() => ({ data: { departments: [] } }))];

    Promise.all(calls).then(([userRes, deptRes]) => {
      const u = userRes.data.user;
      setForm({
        name: u.name || '',
        phone: u.phone || '',
        bio: u.bio || '',
        position: u.position || '',
        department_id: u.department?.id != null ? String(u.department.id) : '',
      });
      setCurrentAvatar(u.avatar || null);
      setDepartments(deptRes.data.departments ?? []);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (avatar) fd.append('avatar', avatar);

      const fn = isOwn ? () => updateMe(fd) : () => updateEmployee(id, fd);
      const { data } = await fn();
      if (isOwn) setUser(data.user);
      toast('Profile updated successfully', 'success');
    } catch (err) {
      toast(err.response?.data?.message || 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-gray-400">Loading…</p>;

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 space-y-4">
        {/* Avatar upload */}
        <div className="flex flex-col items-center gap-3 pb-2">
          <div className="relative group">
            <img
              src={avatarPreview || currentAvatar || `${DEFAULT_AVATAR}&name=${encodeURIComponent(form.name || 'U')}`}
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 shadow-sm"
            />
            <label className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition cursor-pointer">
              <Camera size={20} className="text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>
          <p className="text-xs text-gray-400">Click to change photo</p>
        </div>
        {[['name', 'Name', 'text'], ['position', 'Position', 'text'], ['phone', 'Phone', 'tel']].map(([key, label, type]) => (
          <div key={key}>
            <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
            <input
              type={type}
              value={form[key]}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        ))}

        {/* Department — visible to admins only */}
        {isAdmin && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Department</label>
            <select
              value={form.department_id}
              onChange={(e) => setForm((f) => ({ ...f, department_id: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">— No department —</option>
              {departments.map((d) => (
                <option key={d.id} value={String(d.id)}>{d.name}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Bio</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            rows={3}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}

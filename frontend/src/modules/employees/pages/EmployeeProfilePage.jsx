import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getEmployee, updateEmployee, getMe, updateMe, changePassword, getMyLeaveStats, getEmployeeLeaveStats } from '../api';
import { getDepartments } from '../../departments/api';
import useAuthStore from '../../../store/authStore';
import useToastStore from '../../../store/toastStore';
import { Camera, Clock, CheckCircle, XCircle, AlertCircle, Calendar, Briefcase, GraduationCap, MapPin, Wrench, Users, Link2, Phone, Shield, Plus, Trash2 } from 'lucide-react';

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?background=6366f1&color=fff&bold=true&size=128';

const countryFlag = (code) => {
  if (!code) return '';
  return String.fromCodePoint(...[...code.toUpperCase()].map((c) => 0x1f1e6 - 65 + c.charCodeAt(0)));
};

const COUNTRY_NAMES = {
  IN: 'India', US: 'United States', GB: 'United Kingdom', CA: 'Canada',
  AU: 'Australia', DE: 'Germany', FR: 'France', SG: 'Singapore', AE: 'UAE', JP: 'Japan',
};

function StatMiniCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    orange: 'bg-orange-50 text-orange-700',
    red: 'bg-red-50 text-red-700',
    indigo: 'bg-indigo-50 text-indigo-700',
  };
  return (
    <div className={`rounded-xl p-3 ${colors[color]} flex items-center gap-3`}>
      <Icon size={18} />
      <div>
        <p className="text-lg font-bold leading-none">{value}</p>
        <p className="text-[10px] font-medium mt-0.5 opacity-80">{label}</p>
      </div>
    </div>
  );
}

export default function EmployeeProfilePage() {
  const { id } = useParams();
  const { user: authUser, setUser } = useAuthStore();
  const isOwn = !id;
  const isAdmin = authUser?.role === 'admin';

  const [form, setForm] = useState({
    name: '', phone: '', bio: '', position: '', country_code: 'IN', department_id: '',
    team_name: '', date_of_joining: '', date_of_birth: '', linkedin_url: '',
    address: '', city: '', state: '', zip_code: '',
    skills: '', emergency_contact_name: '', emergency_contact_phone: '',
    education: [], experience: [],
  });
  const [profileData, setProfileData] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [leaveStats, setLeaveStats] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [currentAvatar, setCurrentAvatar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pwForm, setPwForm] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const toast = useToastStore((s) => s.toast);

  useEffect(() => {
    const fetchUser = isOwn ? getMe : () => getEmployee(id);
    const fetchStats = isOwn ? getMyLeaveStats : (params) => getEmployeeLeaveStats(id, params);

    Promise.all([
      fetchUser(),
      getDepartments().catch(() => ({ data: { departments: [] } })),
      fetchStats({ year: new Date().getFullYear() }).catch(() => ({ data: null })),
    ]).then(([userRes, deptRes, statsRes]) => {
      const u = userRes.data.user;
      setProfileData(u);
      setForm({
        name: u.name || '',
        phone: u.phone || '',
        bio: u.bio || '',
        position: u.position || '',
        country_code: u.country_code || 'IN',
        department_id: u.department?.id != null ? String(u.department.id) : '',
        team_name: u.team_name || '',
        date_of_joining: u.date_of_joining || '',
        date_of_birth: u.date_of_birth || '',
        linkedin_url: u.linkedin_url || '',
        address: u.address || '',
        city: u.city || '',
        state: u.state || '',
        zip_code: u.zip_code || '',
        skills: Array.isArray(u.skills) ? u.skills.join(', ') : '',
        emergency_contact_name: u.emergency_contact_name || '',
        emergency_contact_phone: u.emergency_contact_phone || '',
        education: Array.isArray(u.education) ? u.education : [],
        experience: Array.isArray(u.experience) ? u.experience : [],
      });
      setCurrentAvatar(u.avatar || null);
      setDepartments(deptRes.data.departments ?? []);
      setLeaveStats(statsRes.data);
    }).finally(() => setLoading(false));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

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
      // Simple fields
      ['name', 'phone', 'bio', 'position', 'country_code', 'department_id',
       'team_name', 'date_of_joining', 'date_of_birth', 'linkedin_url',
       'address', 'city', 'state', 'zip_code',
       'emergency_contact_name', 'emergency_contact_phone',
      ].forEach((k) => { if (form[k] !== undefined) fd.append(k, form[k]); });

      // Skills as array
      const skillsArr = typeof form.skills === 'string'
        ? form.skills.split(',').map((s) => s.trim()).filter(Boolean)
        : form.skills || [];
      skillsArr.forEach((s, i) => fd.append(`skills[${i}]`, s));
      if (skillsArr.length === 0) fd.append('skills', '');

      // Education array
      (form.education || []).forEach((edu, i) => {
        fd.append(`education[${i}][degree]`, edu.degree || '');
        fd.append(`education[${i}][institution]`, edu.institution || '');
        fd.append(`education[${i}][year]`, edu.year || '');
      });

      // Experience array
      (form.experience || []).forEach((exp, i) => {
        fd.append(`experience[${i}][company]`, exp.company || '');
        fd.append(`experience[${i}][role]`, exp.role || '');
        fd.append(`experience[${i}][from]`, exp.from || '');
        fd.append(`experience[${i}][to]`, exp.to || '');
        fd.append(`experience[${i}][description]`, exp.description || '');
      });

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

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'edit', label: 'Edit Profile' },
    ...(isOwn ? [{ key: 'password', label: 'Change Password' }] : []),
  ];

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Avatar */}
          <div className="relative group shrink-0">
            <img
              src={avatarPreview || currentAvatar || `${DEFAULT_AVATAR}&name=${encodeURIComponent(form.name || 'U')}`}
              alt="Avatar"
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 shadow-sm"
            />
            {(isOwn || isAdmin) && (
              <label className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition cursor-pointer">
                <Camera size={18} className="text-white" />
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
            )}
          </div>
          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-lg font-bold text-gray-900">{profileData?.name}</h2>
            <p className="text-sm text-gray-500">{profileData?.email}</p>
            <div className="flex flex-wrap items-center gap-3 mt-2 justify-center sm:justify-start text-xs text-gray-500">
              {profileData?.position && <span className="bg-gray-100 px-2 py-0.5 rounded-full">{profileData.position}</span>}
              {profileData?.department?.name && <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{profileData.department.name}</span>}
              {profileData?.country_code && (
                <span className="bg-gray-100 px-2 py-0.5 rounded-full">
                  {countryFlag(profileData.country_code)} {COUNTRY_NAMES[profileData.country_code] || profileData.country_code}
                </span>
              )}
              {profileData?.leave_group?.name && (
                <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">Group: {profileData.leave_group.name}</span>
              )}
              <span className={`px-2 py-0.5 rounded-full font-medium ${profileData?.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-green-50 text-green-700'}`}>
                {profileData?.role}
              </span>
            </div>
            {profileData?.bio && <p className="text-xs text-gray-400 mt-2 max-w-lg">{profileData.bio}</p>}
          </div>
        </div>
      </div>

      {/* Leave Stats Cards */}
      {leaveStats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatMiniCard icon={Calendar} label="Total Allocated" value={`${leaveStats.total_allocated}h`} color="blue" />
          <StatMiniCard icon={Clock} label="Total Used" value={`${leaveStats.total_used}h`} color="orange" />
          <StatMiniCard icon={CheckCircle} label="Available" value={`${leaveStats.total_available}h`} color="green" />
          <StatMiniCard icon={AlertCircle} label="Pending" value={leaveStats.pending_count} color="orange" />
          <StatMiniCard icon={XCircle} label="Rejected" value={leaveStats.rejected_count} color="red" />
        </div>
      )}

      {/* Tab Nav */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5 w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition ${
              activeTab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-5">
            {/* About */}
            {profileData?.bio && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-2">
                <h3 className="text-sm font-semibold text-gray-800">About</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{profileData.bio}</p>
              </div>
            )}

            {/* Experience */}
            {profileData?.experience?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <Briefcase size={15} className="text-gray-400" /> Experience
                </h3>
                <div className="space-y-4">
                  {profileData.experience.map((exp, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                        <Briefcase size={16} className="text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">{exp.role}</p>
                        <p className="text-xs text-gray-500">{exp.company}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {exp.from || '?'} — {exp.to || 'Present'}
                        </p>
                        {exp.description && <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{exp.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {profileData?.education?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <GraduationCap size={15} className="text-gray-400" /> Education
                </h3>
                <div className="space-y-3">
                  {profileData.education.map((edu, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center shrink-0 mt-0.5">
                        <GraduationCap size={16} className="text-purple-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{edu.degree}</p>
                        <p className="text-xs text-gray-500">{edu.institution}</p>
                        {edu.year && <p className="text-[11px] text-gray-400 mt-0.5">Class of {edu.year}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Leave Balances */}
            {leaveStats && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-800">Leave Balances — {leaveStats.year}</h3>
                  <p className="text-xs text-gray-400">{leaveStats.total_requests} total · {leaveStats.approved_count} approved</p>
                </div>
                {leaveStats.balances?.length > 0 ? (
                  <div className="space-y-3">
                    {leaveStats.balances.map((b) => {
                      const total = (parseFloat(b.allocated) || 0) + (parseFloat(b.carried_forward) || 0);
                      const used = parseFloat(b.used) || 0;
                      const avail = parseFloat(b.available) || 0;
                      const pct = total > 0 ? Math.min(100, (used / total) * 100) : 0;
                      return (
                        <div key={b.id}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-medium text-gray-700">{b.leave_type?.name || 'Leave'}</span>
                            <span className="text-gray-500">{used}h / {total}h · <span className="text-indigo-600 font-semibold">{avail}h left</span></span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className={`h-2 rounded-full transition-all ${pct > 80 ? 'bg-red-500' : pct > 50 ? 'bg-orange-400' : 'bg-indigo-500'}`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No leave balances provisioned for this year.</p>
                )}
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-5">
            {/* Skills */}
            {profileData?.skills?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <Wrench size={15} className="text-gray-400" /> Skills
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {profileData.skills.map((skill, i) => (
                    <span key={i} className="bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-full font-medium">{skill}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Work Info */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
              <h3 className="text-sm font-semibold text-gray-800">Work Info</h3>
              <div className="space-y-2.5 text-sm">
                {profileData?.team_name && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users size={14} className="text-gray-400 shrink-0" />
                    <span>Team: <span className="font-medium text-gray-800">{profileData.team_name}</span></span>
                  </div>
                )}
                {profileData?.date_of_joining && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={14} className="text-gray-400 shrink-0" />
                    <span>Joined: <span className="font-medium text-gray-800">{new Date(profileData.date_of_joining).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span></span>
                  </div>
                )}
                {profileData?.date_of_birth && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={14} className="text-gray-400 shrink-0" />
                    <span>Birthday: <span className="font-medium text-gray-800">{new Date(profileData.date_of_birth).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</span></span>
                  </div>
                )}
                {isAdmin && profileData?.salary && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="w-[14px] text-center text-gray-400 shrink-0 font-bold text-xs">$</span>
                    <span>Salary: <span className="font-medium text-gray-800">{Number(profileData.salary).toLocaleString()} {profileData.salary_currency || 'USD'}</span></span>
                  </div>
                )}
                {profileData?.linkedin_url && (
                  <div className="flex items-center gap-2">
                    <Link2 size={14} className="text-gray-400 shrink-0" />
                    <a href={profileData.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline text-xs truncate">{profileData.linkedin_url.replace(/^https?:\/\/(www\.)?/, '')}</a>
                  </div>
                )}
              </div>
            </div>

            {/* Address */}
            {(profileData?.address || profileData?.city) && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-2">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <MapPin size={15} className="text-gray-400" /> Address
                </h3>
                <p className="text-sm text-gray-600">
                  {[profileData.address, profileData.city, profileData.state, profileData.zip_code].filter(Boolean).join(', ')}
                </p>
              </div>
            )}

            {/* Emergency Contact */}
            {profileData?.emergency_contact_name && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-2">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <Shield size={15} className="text-gray-400" /> Emergency Contact
                </h3>
                <p className="text-sm font-medium text-gray-800">{profileData.emergency_contact_name}</p>
                {profileData.emergency_contact_phone && (
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Phone size={11} className="text-gray-400" /> {profileData.emergency_contact_phone}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'edit' && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 space-y-5">
          {/* Basic */}
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Basic Info</p>
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Team</label>
              <input type="text" value={form.team_name} onChange={(e) => setForm((f) => ({ ...f, team_name: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">LinkedIn</label>
              <input type="url" value={form.linkedin_url} onChange={(e) => setForm((f) => ({ ...f, linkedin_url: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="https://linkedin.com/in/..." />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date of Joining</label>
              <input type="date" value={form.date_of_joining} onChange={(e) => setForm((f) => ({ ...f, date_of_joining: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date of Birth</label>
              <input type="date" value={form.date_of_birth} onChange={(e) => setForm((f) => ({ ...f, date_of_birth: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Country</label>
            <select
              value={form.country_code}
              onChange={(e) => setForm((f) => ({ ...f, country_code: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {Object.entries(COUNTRY_NAMES).map(([code, name]) => (
                <option key={code} value={code}>{countryFlag(code)} {name}</option>
              ))}
            </select>
          </div>

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
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Skills <span className="text-gray-400 font-normal">(comma-separated)</span></label>
            <input type="text" value={form.skills} onChange={(e) => setForm((f) => ({ ...f, skills: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. React, TypeScript, AWS" />
          </div>

          {/* Address */}
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 pt-1">Address</p>
          <div>
            <input type="text" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Street address" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <input type="text" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="City" />
            <input type="text" value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="State" />
            <input type="text" value={form.zip_code} onChange={(e) => setForm((f) => ({ ...f, zip_code: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="ZIP" />
          </div>

          {/* Emergency contact */}
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 pt-1">Emergency Contact</p>
          <div className="grid grid-cols-2 gap-3">
            <input type="text" value={form.emergency_contact_name} onChange={(e) => setForm((f) => ({ ...f, emergency_contact_name: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Contact name" />
            <input type="tel" value={form.emergency_contact_phone} onChange={(e) => setForm((f) => ({ ...f, emergency_contact_phone: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Phone" />
          </div>

          {/* Education */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Education</p>
              <button type="button" onClick={() => setForm((f) => ({ ...f, education: [...f.education, { degree: '', institution: '', year: '' }] }))} className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"><Plus size={12} /> Add</button>
            </div>
            {form.education.map((edu, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-5">
                  <input type="text" value={edu.degree} onChange={(e) => { const next = [...form.education]; next[i] = { ...next[i], degree: e.target.value }; setForm((f) => ({ ...f, education: next })); }} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Degree" />
                </div>
                <div className="col-span-4">
                  <input type="text" value={edu.institution} onChange={(e) => { const next = [...form.education]; next[i] = { ...next[i], institution: e.target.value }; setForm((f) => ({ ...f, education: next })); }} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Institution" />
                </div>
                <div className="col-span-2">
                  <input type="text" value={edu.year} onChange={(e) => { const next = [...form.education]; next[i] = { ...next[i], year: e.target.value }; setForm((f) => ({ ...f, education: next })); }} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Year" />
                </div>
                <button type="button" onClick={() => setForm((f) => ({ ...f, education: f.education.filter((_, j) => j !== i) }))} className="col-span-1 p-2 text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>

          {/* Experience */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Experience</p>
              <button type="button" onClick={() => setForm((f) => ({ ...f, experience: [...f.experience, { company: '', role: '', from: '', to: '', description: '' }] }))} className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"><Plus size={12} /> Add</button>
            </div>
            {form.experience.map((exp, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-3 space-y-2 relative">
                <button type="button" onClick={() => setForm((f) => ({ ...f, experience: f.experience.filter((_, j) => j !== i) }))} className="absolute top-2 right-2 p-1 text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" value={exp.role} onChange={(e) => { const next = [...form.experience]; next[i] = { ...next[i], role: e.target.value }; setForm((f) => ({ ...f, experience: next })); }} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Role / Title" />
                  <input type="text" value={exp.company} onChange={(e) => { const next = [...form.experience]; next[i] = { ...next[i], company: e.target.value }; setForm((f) => ({ ...f, experience: next })); }} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Company" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" value={exp.from} onChange={(e) => { const next = [...form.experience]; next[i] = { ...next[i], from: e.target.value }; setForm((f) => ({ ...f, experience: next })); }} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="From (e.g. 2020)" />
                  <input type="text" value={exp.to} onChange={(e) => { const next = [...form.experience]; next[i] = { ...next[i], to: e.target.value }; setForm((f) => ({ ...f, experience: next })); }} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="To (or Present)" />
                </div>
                <textarea value={exp.description} onChange={(e) => { const next = [...form.experience]; next[i] = { ...next[i], description: e.target.value }; setForm((f) => ({ ...f, experience: next })); }} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Description (optional)" />
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      )}

      {activeTab === 'password' && isOwn && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setPwSaving(true);
            try {
              await changePassword(pwForm);
              toast('Password changed successfully', 'success');
              setPwForm({ current_password: '', password: '', password_confirmation: '' });
            } catch (err) {
              toast(err.response?.data?.message || 'Password change failed', 'error');
            } finally {
              setPwSaving(false);
            }
          }}
          className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 space-y-4"
        >
          <h3 className="text-sm font-semibold text-gray-800">Change Password</h3>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Current Password</label>
            <input
              type="password"
              required
              value={pwForm.current_password}
              onChange={(e) => setPwForm((f) => ({ ...f, current_password: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">New Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={pwForm.password}
              onChange={(e) => setPwForm((f) => ({ ...f, password: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={pwForm.password_confirmation}
              onChange={(e) => setPwForm((f) => ({ ...f, password_confirmation: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={pwSaving}
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
          >
            {pwSaving ? 'Changing…' : 'Change Password'}
          </button>
        </form>
      )}
    </div>
  );
}

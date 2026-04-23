import { useEffect, useState, useMemo } from 'react';
import { getAnnouncements, createAnnouncement, deleteAnnouncement } from '../api';
import useAuthStore from '../../../store/authStore';
import { Plus, Trash2, Search } from 'lucide-react';
import { useFeatureFlag } from '../../../shared/hooks/useFeatureFlag';
import FeatureDisabledBanner from '../../../shared/components/FeatureDisabledBanner';
import useToastStore from '../../../store/toastStore';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [form, setForm] = useState({ title: '', content: '' });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortDir, setSortDir] = useState('desc');
  const { user } = useAuthStore();
  const toast = useToastStore((s) => s.toast);

  const filtered = useMemo(() => {
    let list = [...announcements];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((a) =>
        a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      const diff = new Date(a.created_at) - new Date(b.created_at);
      return sortDir === 'desc' ? -diff : diff;
    });
    return list;
  }, [announcements, search, sortDir]);
  const { enabled: featureEnabled } = useFeatureFlag('announcements_enabled');

  const load = () => {
    setLoading(true);
    getAnnouncements()
      .then(({ data }) => setAnnouncements(data.data ?? []))
      .catch(() => toast('Failed to load announcements', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createAnnouncement(form);
      setForm({ title: '', content: '' });
      setShowForm(false);
      toast('Announcement published', 'success');
      load();
    } catch {
      toast('Failed to publish announcement', 'error');
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    try {
      await deleteAnnouncement(id);
      toast(`"${title}" deleted`, 'success');
      load();
    } catch {
      toast('Failed to delete announcement', 'error');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-3">
        {user?.role === 'admin' && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-1.5 text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 whitespace-nowrap"
          >
            <Plus size={16} /> New
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search announcements…"
            className="w-full pl-8 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
        </div>
        <select
          value={sortDir}
          onChange={(e) => setSortDir(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="desc">Newest first</option>
          <option value="asc">Oldest first</option>
        </select>
      </div>

      {!loading && (
        <p className="text-xs text-gray-400">{filtered.length} of {announcements.length} announcements</p>
      )}

      {!featureEnabled && <FeatureDisabledBanner featureName="Announcements" />}

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 space-y-3">
          <input
            required
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <textarea
            required
            placeholder="Content…"
            rows={4}
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">
            Publish
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-gray-400">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
          {search ? 'No announcements match your search.' : 'No announcements yet.'}
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((a) => (
            <li key={a.id} className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="font-semibold text-gray-800 truncate">{a.title}</h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    By {a.author?.name ?? 'Admin'} · {new Date(a.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                {user?.role === 'admin' && (
                  <button onClick={() => handleDelete(a.id, a.title)} className="p-1.5 text-red-400 hover:bg-red-50 rounded shrink-0">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-3 whitespace-pre-line">{a.content}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


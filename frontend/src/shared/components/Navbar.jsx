import { useState } from 'react';
import { Menu, ChevronDown, HelpCircle, Map, Zap } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import StatusDropdown from '../../modules/presence/components/StatusDropdown';
import NotificationBell from '../../modules/notifications/components/NotificationBell';
import HelpGuideModal from './HelpGuideModal';
import ReleaseNotesModal from './ReleaseNotesModal';
import { hasUnseenRelease, markReleaseSeen } from '../utils/releaseNotes';
import { useTour } from '../hooks/useTour';

const PAGE_TITLES = {
  '/dashboard':     'Dashboard',
  '/employees':     'Employees',
  '/departments':   'Departments',
  '/leaves':        'Leave Management',
  '/announcements': 'Announcements',
  '/settings':      'Settings',
  '/backup':        'Backup & Restore',
  '/profile':       'My Profile',
  '/leaves/apply':  'Apply Leave',
};

export default function Navbar({ onMenuClick }) {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [helpOpen, setHelpOpen] = useState(false);
  const [releaseOpen, setReleaseOpen] = useState(false);
  const [unseen, setUnseen] = useState(() => hasUnseenRelease());
  const { start: startTour } = useTour(user?.role);

  const handleReleaseOpen = () => {
    setReleaseOpen(true);
    setUnseen(false);
    markReleaseSeen();
  };

  const pageTitle =
    PAGE_TITLES[pathname]
    ?? Object.entries(PAGE_TITLES).find(([key]) => pathname.startsWith(key + '/'))?.[1]
    ?? 'EMS Portal';

  return (
    <header className="
      sticky top-0 z-20 h-16
      bg-white border-b border-slate-200
      flex items-center justify-between px-4 sm:px-6 gap-4
    ">
      {/* ── Left: hamburger + page title ─────────────────────────── */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition shrink-0"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <div className="min-w-0">
          <h1 className="text-sm sm:text-base font-semibold text-slate-800 leading-tight truncate">
            {pageTitle}
          </h1>
        </div>
      </div>

      {/* ── Right: status / bell / avatar ─────────────────────────── */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        <div className="hidden sm:block">
          <StatusDropdown />
        </div>

        <NotificationBell />

        <button
          id="release-notes-btn"
          onClick={handleReleaseOpen}
          className="relative p-2 rounded-lg hover:bg-gray-100 transition"
          aria-label="Release Notes"
          title="What's New"
        >
          <Zap size={20} className="text-gray-600" />
          {unseen && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
          )}
        </button>

        <button
          id="help-guide-btn"
          onClick={() => setHelpOpen(true)}
          className="p-2 rounded-lg hover:bg-gray-100 transition"
          aria-label="Help & User Guide"
          title="Help & User Guide"
        >
          <HelpCircle size={20} className="text-gray-600" />
        </button>

        <button
          id="tour-btn"
          onClick={startTour}
          className="p-2 rounded-lg hover:bg-gray-100 transition"
          aria-label="Take a tour"
          title="Take a Tour"
        >
          <Map size={20} className="text-gray-600" />
        </button>

        <HelpGuideModal open={helpOpen} onClose={() => setHelpOpen(false)} />
        <ReleaseNotesModal open={releaseOpen} onClose={() => setReleaseOpen(false)} />

        <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block" />

        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 pl-1 pr-2 py-1.5 rounded-xl hover:bg-slate-100 transition group"
        >
          <div className="w-8 h-8 rounded-full shrink-0 ring-2 ring-indigo-100 overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-slate-700 leading-tight group-hover:text-slate-900 max-w-[120px] truncate">
              {user?.name}
            </p>
            <p className="text-[11px] text-slate-400 capitalize">{user?.role}</p>
          </div>
          <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
        </button>
      </div>
    </header>
  );
}


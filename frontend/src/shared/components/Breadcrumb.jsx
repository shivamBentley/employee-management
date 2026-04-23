import { Link, useLocation, useParams } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

/**
 * Segment label map.
 * Keys are URL path segments (lowercase).
 * Value: { label, to } — `to: null` means this segment is the final, non-clickable crumb.
 */
const SEGMENT_MAP = {
  dashboard:     { label: 'Dashboard',        to: '/dashboard' },
  employees:     { label: 'Employees',        to: '/employees' },
  departments:   { label: 'Departments',      to: '/departments' },
  leaves:        { label: 'Leave Management', to: '/leaves' },
  apply:         { label: 'Apply Leave',      to: null },
  announcements: { label: 'Announcements',    to: '/announcements' },
  settings:      { label: 'Settings',         to: '/settings' },
  backup:        { label: 'Backup & Restore', to: '/backup' },
  profile:       { label: 'My Profile',       to: '/profile' },
};

function buildCrumbs(pathname) {
  const segments = pathname.replace(/^\//, '').split('/').filter(Boolean);
  const crumbs = [{ label: 'Home', to: '/dashboard', isHome: true }];

  segments.forEach((seg, i) => {
    const isLast = i === segments.length - 1;
    const isNumeric = /^\d+$/.test(seg);

    if (isNumeric) {
      // Dynamic :id segment — label as "Details", not clickable when last
      crumbs.push({ label: 'Details', to: isLast ? null : null });
    } else {
      const mapped = SEGMENT_MAP[seg.toLowerCase()];
      if (mapped) {
        crumbs.push({
          label: mapped.label,
          to: isLast ? null : mapped.to,
        });
      } else {
        // Fallback: capitalise the raw segment
        const label = seg.charAt(0).toUpperCase() + seg.slice(1);
        crumbs.push({ label, to: isLast ? null : `/${segments.slice(0, i + 1).join('/')}` });
      }
    }
  });

  return crumbs;
}

export default function Breadcrumb() {
  const { pathname } = useLocation();

  // Don't render on root or dashboard (only one crumb)
  if (pathname === '/dashboard' || pathname === '/') return null;

  const crumbs = buildCrumbs(pathname);
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <nav
      aria-label="Breadcrumb"
      className="sticky top-16 z-10 flex items-center justify-between gap-2 px-4 sm:px-6 py-2.5 text-xs bg-white border-b border-slate-100"
    >
      {/* Crumbs — left side */}
      <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap min-w-0">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight size={12} className="text-slate-300 shrink-0" />}
              {isLast ? (
                <span className="text-slate-600 font-medium">{crumb.label}</span>
              ) : crumb.isHome ? (
                <Link
                  to={crumb.to}
                  className="flex items-center gap-1 text-slate-400 hover:text-indigo-600 transition"
                >
                  <Home size={12} />
                  <span className="hidden sm:inline">{crumb.label}</span>
                </Link>
              ) : (
                <Link
                  to={crumb.to}
                  className="text-slate-400 hover:text-indigo-600 transition"
                >
                  {crumb.label}
                </Link>
              )}
            </span>
          );
        })}
      </div>

      {/* Today's date — right side */}
      <span className="shrink-0 text-slate-400 font-medium">{today}</span>
    </nav>
  );
}

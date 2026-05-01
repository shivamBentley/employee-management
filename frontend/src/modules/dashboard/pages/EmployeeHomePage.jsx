import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import useToastStore from '../../../store/toastStore';
import useSettingsStore from '../../../store/settingsStore';
import { getMe, getMyLeaveStats } from '../../employees/api';
import { getLeaves } from '../../leaves/api';
import { getHolidays } from '../../holidays/api';
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  CalendarDays,
  PlusCircle,
  Megaphone,
  UserCircle,
  X,
  PartyPopper,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  Building2,
  Users,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?background=6366f1&color=fff&bold=true&size=128';

const COUNTRY_NAMES = {
  IN: 'India', US: 'United States', GB: 'United Kingdom', CA: 'Canada',
  AU: 'Australia', DE: 'Germany', FR: 'France', SG: 'Singapore', AE: 'UAE', JP: 'Japan',
};

const countryFlag = (code) => {
  if (!code) return '';
  return String.fromCodePoint(...[...code.toUpperCase()].map((c) => 0x1f1e6 - 65 + c.charCodeAt(0)));
};

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const CURRENT_YEAR = new Date().getFullYear();
const DAY_LABELS = ['Mon', '', 'Wed', '', 'Fri', '', ''];

const STATUS_STYLES = {
  approved: { bg: 'bg-green-50 border-green-200', text: 'text-green-700', badge: 'bg-green-100 text-green-700', icon: CheckCircle },
  pending: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700', icon: AlertCircle },
  rejected: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-700', icon: XCircle },
};

/* ---------- Heatmap helpers ---------- */
function buildHeatmapData(year, leaves, holidays) {
  const map = {}; // dateStr -> { type, label }
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Mark weekends
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().slice(0, 10);
    const dow = d.getDay();
    if (dow === 0 || dow === 6) {
      map[key] = { type: 'weekend', label: 'Weekend' };
    }
  }

  // Mark holidays
  (holidays || []).forEach((h) => {
    const key = typeof h.date === 'string' ? h.date.slice(0, 10) : '';
    if (key) map[key] = { type: 'holiday', label: h.name };
  });

  // Mark leaves (skip weekends and holidays — those keep their own markers)
  (leaves || []).forEach((l) => {
    const s = new Date(l.start_date);
    const e = new Date(l.end_date);
    for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().slice(0, 10);
      const dow = d.getDay();
      if (dow === 0 || dow === 6) continue; // keep weekends
      if (map[key]?.type === 'holiday') continue; // keep holidays
      if (l.status === 'approved') map[key] = { type: 'leave-approved', label: `${l.leave_type?.name || 'Leave'} (Approved)` };
      else if (l.status === 'pending') map[key] = { type: 'leave-pending', label: `${l.leave_type?.name || 'Leave'} (Pending)` };
      else if (l.status === 'rejected') map[key] = { type: 'leave-rejected', label: `${l.leave_type?.name || 'Leave'} (Rejected)` };
    }
  });

  return map;
}

function getWeeksForMonth(year, month) {
  // month is 1-based; build Mon-Sun rows covering all days of that month
  const firstDay = new Date(year, month - 1, 1);
  const lastDay  = new Date(year, month, 0);
  const dow = firstDay.getDay(); // 0=Sun
  const startDate = new Date(firstDay);
  startDate.setDate(firstDay.getDate() - (dow === 0 ? 6 : dow - 1));

  const weeks = [];
  let current = new Date(startDate);
  while (current <= lastDay) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

const CELL_COLORS = {
  weekend: 'bg-gray-200',
  holiday: 'bg-purple-400',
  'leave-approved': 'bg-emerald-400',
  'leave-pending': 'bg-amber-400',
  'leave-rejected': 'bg-red-400',
  present: 'bg-green-200',
  future: 'bg-gray-50',
  'out-of-year': 'bg-transparent',
};

function AttendanceHeatmap({ year, month, heatmapData }) {
  const [tooltip, setTooltip] = useState(null);
  const weeks = useMemo(() => getWeeksForMonth(year, month), [year, month]);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Column date-labels (1, 8, 15, 22, 29)
  const dateLabels = useMemo(() => {
    const labels = [];
    weeks.forEach((week, wi) => {
      const inMonth = week.find((d) => d.getMonth() === month - 1 && d.getFullYear() === year);
      if (inMonth && (inMonth.getDate() === 1 || inMonth.getDate() % 7 === 1)) {
        labels.push({ wi, day: inMonth.getDate() });
      }
    });
    return labels;
  }, [weeks, year, month]);

  return (
    <div className="space-y-2">
      {/* Week-start day labels at the top */}
      <div className="flex ml-8 relative h-4">
        {dateLabels.map(({ wi, day }) => (
          <span
            key={wi}
            className="text-[10px] text-gray-400 absolute"
            style={{ left: `${wi * 14}px` }}
          >
            {day}
          </span>
        ))}
      </div>

      <div className="flex gap-0">
        {/* Day labels */}
        <div className="flex flex-col gap-[2px] mr-1 shrink-0">
          {DAY_LABELS.map((label, i) => (
            <div key={i} className="h-[14px] w-6 text-[9px] text-gray-400 flex items-center justify-end pr-1 select-none">
              {label}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex gap-[2px]">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[2px]">
              {week.map((date, di) => {
                const key = date.toISOString().slice(0, 10);
                const inMonth = date.getMonth() === month - 1 && date.getFullYear() === year;
                const entry = heatmapData[key];
                let cellType = 'out-of-year';

                if (inMonth) {
                  if (entry) {
                    cellType = entry.type;
                  } else if (date > today) {
                    cellType = 'future';
                  } else {
                    cellType = 'present';
                  }
                }

                const isToday = date.toDateString() === today.toDateString();

                return (
                  <div
                    key={di}
                    className={`w-[14px] h-[14px] rounded-[3px] ${CELL_COLORS[cellType] || 'bg-gray-50'} ${
                      isToday ? 'ring-1 ring-indigo-500 ring-offset-1' : ''
                    } ${inMonth ? 'cursor-pointer' : ''}`}
                    onMouseEnter={(e) => {
                      if (!inMonth) return;
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltip({
                        x: rect.left + rect.width / 2,
                        y: rect.top - 4,
                        text: `${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}${entry ? ` — ${entry.label}` : date <= today ? ' — Present' : ''}`,
                      });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 px-2 py-1 text-[10px] text-white bg-gray-900 rounded-md shadow-lg pointer-events-none whitespace-nowrap"
          style={{ left: tooltip.x, top: tooltip.y, transform: 'translate(-50%, -100%)' }}
        >
          {tooltip.text}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-[10px] text-gray-500 pt-1">
        {[
          { color: 'bg-green-200', label: 'Present' },
          { color: 'bg-emerald-400', label: 'Leave (Approved)' },
          { color: 'bg-amber-400', label: 'Leave (Pending)' },
          { color: 'bg-red-400', label: 'Leave (Rejected)' },
          { color: 'bg-purple-400', label: 'Holiday' },
          { color: 'bg-gray-200', label: 'Weekend' },
        ].map(({ color, label }) => (
          <span key={label} className="flex items-center gap-1">
            <span className={`w-[10px] h-[10px] rounded-[2px] ${color} inline-block`} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------- Main Component ---------- */

export default function EmployeeHomePage() {
  const toast = useToastStore((s) => s.toast);
  const settings = useSettingsStore((s) => s.settings);
  const countryEnabled    = settings.country_support_enabled    !== '0';
  const leaveGroupEnabled = settings.leave_group_support_enabled !== '0';

  const [profile, setProfile] = useState(null);
  const [leaveStats, setLeaveStats] = useState(null);
  const [upcomingHolidays, setUpcomingHolidays] = useState([]);
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [heatmapHolidays, setHeatmapHolidays] = useState({});
  const [heatmapLeaves, setHeatmapLeaves] = useState({});
  const [dismissedIds, setDismissedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const [filterYear, setFilterYear] = useState(now.getFullYear());
  const [filterMonth, setFilterMonth] = useState(now.getMonth() + 1);
  const [statsLoading, setStatsLoading] = useState(false);
  const yearOptions = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

  // Re-fetch leave stats when year/month filter changes
  useEffect(() => {
    let active = true;
    getMyLeaveStats({ year: filterYear, month: filterMonth })
      .then(({ data }) => { if (active) { setLeaveStats(data); setStatsLoading(false); } })
      .catch(() => { if (active) setStatsLoading(false); });
    return () => { active = false; };
  }, [filterYear, filterMonth]);

  // Initial data load
  useEffect(() => {
    const year = CURRENT_YEAR;

    Promise.all([
      getMe(),
      getMyLeaveStats({ year, month: now.getMonth() + 1 }).catch(() => ({ data: null })),
      getHolidays({ year }).catch(() => ({ data: { holidays: [] } })),
      getLeaves({ per_page: 200 }).catch(() => ({ data: { data: [] } })),
    ])
      .then(([meRes, statsRes, holidaysRes, leavesRes]) => {
        setProfile(meRes.data.user);
        setLeaveStats(statsRes.data);

        const holidays = Array.isArray(holidaysRes.data.holidays) ? holidaysRes.data.holidays : Array.isArray(holidaysRes.data) ? holidaysRes.data : [];
        setHeatmapHolidays((prev) => ({ ...prev, [year]: holidays }));

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        setUpcomingHolidays(
          holidays
            .filter((h) => new Date(h.date) >= today)
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 5)
        );

        const leaves = Array.isArray(leavesRes.data.leaves) ? leavesRes.data.leaves : Array.isArray(leavesRes.data.data) ? leavesRes.data.data : Array.isArray(leavesRes.data) ? leavesRes.data : [];
        setHeatmapLeaves((prev) => ({ ...prev, [year]: leaves }));

        setRecentLeaves(
          leaves
            .filter((l) => ['pending', 'approved', 'rejected'].includes(l.status))
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 10)
        );
      })
      .catch(() => toast('Failed to load data', 'error'))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch heatmap data when filterYear changes (cached per year)
  useEffect(() => {
    if (heatmapHolidays[filterYear] && heatmapLeaves[filterYear]) return;
    Promise.all([
      getHolidays({ year: filterYear }).catch(() => ({ data: { holidays: [] } })),
      getLeaves({ per_page: 200, year: filterYear }).catch(() => ({ data: { leaves: [] } })),
    ]).then(([holidaysRes, leavesRes]) => {
      const holidays = Array.isArray(holidaysRes.data.holidays) ? holidaysRes.data.holidays : Array.isArray(holidaysRes.data) ? holidaysRes.data : [];
      const leaves = Array.isArray(leavesRes.data.leaves) ? leavesRes.data.leaves : Array.isArray(leavesRes.data.data) ? leavesRes.data.data : Array.isArray(leavesRes.data) ? leavesRes.data : [];
      setHeatmapHolidays((prev) => ({ ...prev, [filterYear]: holidays }));
      setHeatmapLeaves((prev) => ({ ...prev, [filterYear]: leaves }));
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterYear]);

  const dismiss = (id) => {
    setDismissedIds((prev) => [...prev, id]);
  };

  const heatmapData = useMemo(
    () => buildHeatmapData(filterYear, heatmapLeaves[filterYear] || [], heatmapHolidays[filterYear] || []),
    [filterYear, heatmapLeaves, heatmapHolidays]
  );

  if (loading) {
    return <div className="flex items-center justify-center h-40 text-gray-400">Loading…</div>;
  }

  const visibleLeaves = recentLeaves.filter((l) => !dismissedIds.includes(l.id));
  const nextHoliday = upcomingHolidays[0];

  return (
    <div className="space-y-5">
      {/* ===== TOP BANNERS ===== */}

      {/* Next upcoming holiday banner */}
      {nextHoliday && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-purple-50 border border-purple-200">
          <PartyPopper size={18} className="text-purple-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-purple-800">
              Upcoming Holiday — <span className="font-semibold">{nextHoliday.name}</span>
            </p>
            <p className="text-xs text-purple-600">
              {new Date(nextHoliday.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              {countryEnabled && nextHoliday.country && ` · ${countryFlag(nextHoliday.country)} ${nextHoliday.country}`}
            </p>
          </div>
          <Link to="/holidays" className="text-xs font-medium text-purple-600 hover:text-purple-800 shrink-0">
            All holidays →
          </Link>
        </div>
      )}

      {/* Leave status alerts — pending & rejected at the very top */}
      {visibleLeaves.length > 0 && (
        <div className="space-y-2">
          {visibleLeaves.map((leave) => {
            const style = STATUS_STYLES[leave.status] || STATUS_STYLES.pending;
            const StatusIcon = style.icon;
            const startDate = new Date(leave.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const endDate = new Date(leave.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            return (
              <div
                key={leave.id}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${style.bg} transition-all`}
              >
                <StatusIcon size={15} className={style.text} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-gray-800">{leave.leave_type?.name || 'Leave'}</span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full uppercase ${style.badge}`}>
                      {leave.status}
                    </span>
                    <span className="text-xs text-gray-400">{startDate} — {endDate}</span>
                  </div>
                  {leave.reason && <p className="text-xs text-gray-400 mt-0.5 truncate">{leave.reason}</p>}
                </div>
                <button
                  onClick={() => dismiss(leave.id)}
                  className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-white/60 transition shrink-0"
                  title="Dismiss"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ===== PROFILE CARD (enhanced) ===== */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Gradient banner */}
        <div className="h-24 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-400" />

        <div className="px-5 sm:px-6 pb-5 -mt-12">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4">
            <img
              src={profile?.avatar || `${DEFAULT_AVATAR}&name=${encodeURIComponent(profile?.name || 'U')}`}
              alt="Avatar"
              className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg"
            />
            <div className="flex-1 text-center sm:text-left pt-2 sm:pt-0 sm:pb-1">
              <h2 className="text-xl font-bold text-gray-900">{profile?.name}</h2>
              <p className="text-sm text-gray-500">{profile?.position || 'Employee'}</p>
            </div>
            <Link
              to="/profile"
              className="text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-medium px-3 py-1.5 rounded-lg transition shrink-0"
            >
              Edit Profile
            </Link>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
            {[
              { Icon: Mail, label: 'Email', value: profile?.email },
              { Icon: Phone, label: 'Phone', value: profile?.phone || '—' },
              { Icon: Building2, label: 'Department', value: profile?.department?.name || '—' },
              ...(countryEnabled
                ? [{ Icon: MapPin, label: 'Location', value: profile?.country_code ? `${countryFlag(profile.country_code)} ${COUNTRY_NAMES[profile.country_code] || profile.country_code}` : '—' }]
                : []),
              ...(leaveGroupEnabled
                ? [{ Icon: Users, label: 'Leave Group', value: profile?.leave_group?.name || '—' }]
                : []),
              { Icon: Briefcase, label: 'Role', value: profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : '—' },
            ].map(({ Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm shrink-0">
                  <Icon size={14} className="text-gray-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{label}</p>
                  <p className="text-sm text-gray-700 font-medium truncate">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {profile?.bio && (
            <div className="mt-4 bg-gray-50 rounded-xl px-4 py-3">
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-1">About</p>
              <p className="text-sm text-gray-600">{profile.bio}</p>
            </div>
          )}
        </div>
      </div>

      {/* ===== LEAVE STATS CARDS ===== */}
      {/* Period filter */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFilterYear((y) => y - 1)}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition"
        >
          <ChevronLeft size={15} />
        </button>
        <select
          value={filterYear}
          onChange={(e) => setFilterYear(Number(e.target.value))}
          className="border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <button
          onClick={() => setFilterYear((y) => Math.min(y + 1, CURRENT_YEAR))}
          disabled={filterYear >= CURRENT_YEAR}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition disabled:opacity-30"
        >
          <ChevronRight size={15} />
        </button>
        <div className="flex gap-1 flex-wrap">
          {MONTH_LABELS.map((m, i) => (
            <button
              key={m}
              onClick={() => setFilterMonth(i + 1)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                filterMonth === i + 1
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
        {statsLoading && <span className="text-xs text-gray-400">Updating…</span>}
      </div>

      {leaveStats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { icon: Calendar, label: 'Total Allocated', value: `${leaveStats.total_allocated}h`, color: 'blue' },
            { icon: Clock, label: 'Total Used', value: `${leaveStats.total_used}h`, color: 'orange' },
            { icon: CheckCircle, label: 'Available', value: `${leaveStats.total_available}h`, color: 'green' },
            { icon: AlertCircle, label: 'Pending', value: leaveStats.pending_count, color: 'orange' },
            { icon: XCircle, label: 'Rejected', value: leaveStats.rejected_count, color: 'red' },
          ].map(({ icon: Icon, label, value, color }) => {
            const colors = {
              blue: 'bg-blue-50 text-blue-700',
              green: 'bg-green-50 text-green-700',
              orange: 'bg-orange-50 text-orange-700',
              red: 'bg-red-50 text-red-700',
            };
            return (
              <div key={label} className={`rounded-xl p-3 ${colors[color]} flex items-center gap-3`}>
                <Icon size={18} />
                <div>
                  <p className="text-lg font-bold leading-none">{value}</p>
                  <p className="text-[10px] font-medium mt-0.5 opacity-80">{label}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===== TWO-COLUMN: Upcoming Holidays + Leave Balances ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Upcoming Holidays */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <PartyPopper size={16} className="text-amber-500" />
            Upcoming Holidays
          </h3>
          {upcomingHolidays.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {upcomingHolidays.map((h) => {
                const d = new Date(h.date);
                const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
                const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const isToday = new Date().toDateString() === d.toDateString();
                return (
                  <div key={h.id} className="flex items-center gap-3 py-2.5">
                    <div className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center text-xs font-bold ${isToday ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                      <span className="text-[9px] uppercase leading-none">{dayName}</span>
                      <span className="text-sm leading-none mt-0.5">{d.getDate()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{h.name}</p>
                      <p className="text-xs text-gray-400">{dateStr}{h.description ? ` · ${h.description}` : ''}</p>
                    </div>
                    {countryEnabled && h.country && (
                      <span className="text-xs text-gray-400 shrink-0">{countryFlag(h.country)}</span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-4 text-center">No upcoming holidays</p>
          )}
          <Link to="/holidays" className="block text-center text-xs text-indigo-600 hover:text-indigo-700 font-medium pt-1">
            View all holidays →
          </Link>
        </div>

        {/* Leave Balances */}
        {leaveStats?.balances?.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800">Leave Balances — {MONTH_LABELS[filterMonth - 1]} {filterYear}</h3>
              <p className="text-xs text-gray-400">{leaveStats.total_requests} req · {leaveStats.approved_count} approved</p>
            </div>
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
                      <span className="text-gray-500">
                        {used}h / {total}h · <span className="text-indigo-600 font-semibold">{avail}h left</span>
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${pct > 80 ? 'bg-red-500' : pct > 50 ? 'bg-orange-400' : 'bg-indigo-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ===== MONTHLY ATTENDANCE HEATMAP ===== */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
        <h3 className="text-sm font-semibold text-gray-800">
          Attendance — {MONTH_LABELS[filterMonth - 1]} {filterYear}
        </h3>
        <AttendanceHeatmap year={filterYear} month={filterMonth} heatmapData={heatmapData} />
      </div>

      {/* ===== QUICK LINKS ===== */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
        <h3 className="text-sm font-semibold text-gray-800">Quick Links</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { to: '/profile', label: 'My Profile', Icon: UserCircle, color: 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' },
            { to: '/leaves/apply', label: 'Apply Leave', Icon: PlusCircle, color: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' },
            { to: '/leaves', label: 'My Leaves', Icon: CalendarDays, color: 'text-sky-600 bg-sky-50 hover:bg-sky-100' },
            { to: '/holidays', label: 'Holidays', Icon: Calendar, color: 'text-amber-600 bg-amber-50 hover:bg-amber-100' },
            { to: '/announcements', label: 'Announcements', Icon: Megaphone, color: 'text-pink-600 bg-pink-50 hover:bg-pink-100' },
          ].map(({ to, label, Icon, color }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${color}`}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

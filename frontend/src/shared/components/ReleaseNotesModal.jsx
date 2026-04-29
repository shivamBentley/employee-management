import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Sparkles, Zap, Wrench, ArrowUpCircle } from 'lucide-react';
import { markReleaseSeen } from '../utils/releaseNotes';

const RELEASES = [
  {
    version: '1.1.0',
    date: 'April 29, 2026',
    label: 'Latest',
    changes: [
      { type: 'new',      text: 'Interactive product tour — click the map icon in the navbar to get a guided walkthrough of the portal.' },
      { type: 'new',      text: 'Context-sensitive Help Guide — click the help icon on any page for a step-by-step guide specific to that module.' },
      { type: 'new',      text: 'Real-time Presence Tracking — set your status to Online, Away, Out of Office, or Offline, visible to your team.' },
      { type: 'new',      text: 'In-app Notification Bell — receive live notifications for leave approvals, rejections, and new announcements.' },
      { type: 'new',      text: 'Leave Heatmap — GitHub-style yearly heatmap on the employee dashboard showing leaves, holidays, and weekends.' },
      { type: 'new',      text: 'Feature Flags — admins can enable or disable individual modules (Leave Management, Announcements, Presence, Backups) from Settings.' },
      { type: 'new',      text: 'Backup Restore — upload a downloaded .zip backup file to fully restore the database, with a confirmation step to prevent accidental overwrites.' },
      { type: 'new',      text: 'Release Notes — this in-app changelog modal, accessible from the navbar with an unseen badge on new versions.' },
      { type: 'improved', text: 'Dashboard quick-action cards now include shortcuts to all key admin and employee modules.' },
      { type: 'improved', text: 'Leave calculation now excludes weekends and country-specific public holidays automatically.' },
      { type: 'improved', text: 'Employee profile updated with avatar upload, bio, and leave group assignment.' },
      { type: 'fixed',    text: 'Avatar initials no longer appear split across a gradient background — replaced with a clean solid colour.' },
      { type: 'fixed',    text: 'Mobile sidebar close button now correctly dismisses the overlay.' },
    ],
  },
  {
    version: '1.0.0',
    date: 'March 1, 2026',
    label: 'Initial Release',
    changes: [
      { type: 'new', text: 'Employee Management — create, edit, deactivate, and search employee accounts with role-based access.' },
      { type: 'new', text: 'Department Management — organise employees into departments with counts visible on the dashboard chart.' },
      { type: 'new', text: 'Leave Management — employees can apply for leave; admins can approve or reject requests with instant status updates.' },
      { type: 'new', text: 'Leave Types — configure paid and unpaid leave categories (Casual, Sick, Annual, WFH, etc.) with default balances.' },
      { type: 'new', text: 'Leave Groups — define different leave balance policies and assign groups to employees.' },
      { type: 'new', text: 'Holiday Calendar — manage country-specific public holidays that are automatically excluded from leave calculations.' },
      { type: 'new', text: 'Announcements — admins can publish organisation-wide announcements visible to all employees.' },
      { type: 'new', text: 'Admin Dashboard — stat cards, department pie chart, monthly leave summary, and PDF/Excel report exports.' },
      { type: 'new', text: 'Employee Dashboard — personal profile card, leave balance summary, and recent leave requests.' },
      { type: 'new', text: 'Backup & Restore — admins can trigger, list, and download full MySQL database backups.' },
      { type: 'new', text: 'Authentication — secure JWT-based login with role-aware routing for admin and employee roles.' },
    ],
  },
];

const TYPE_CONFIG = {
  new:      { Icon: Sparkles,      bg: 'bg-indigo-50',  text: 'text-indigo-600',  label: 'New'      },
  improved: { Icon: ArrowUpCircle, bg: 'bg-emerald-50', text: 'text-emerald-600', label: 'Improved' },
  fixed:    { Icon: Wrench,        bg: 'bg-amber-50',   text: 'text-amber-600',   label: 'Fixed'    },
};

export default function ReleaseNotesModal({ open, onClose }) {
  const handleClose = () => {
    markReleaseSeen();
    onClose();
  };

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-200"  leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"  leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <Zap size={18} className="text-indigo-600" />
                    </div>
                    <div>
                      <Dialog.Title className="text-lg font-semibold text-slate-800">
                        Release Notes
                      </Dialog.Title>
                      <p className="text-xs text-slate-500">What's new in EMS Portal</p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white/80 transition"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 max-h-[70vh] overflow-y-auto space-y-8">
                  {RELEASES.map((release) => (
                    <div key={release.version}>
                      {/* Version header */}
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-base font-bold text-slate-800">v{release.version}</span>
                        {release.label === 'Latest' ? (
                          <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-indigo-600 text-white">
                            Latest
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-slate-100 text-slate-500">
                            {release.label}
                          </span>
                        )}
                        <span className="text-xs text-slate-400 ml-auto">{release.date}</span>
                      </div>

                      {/* Changes */}
                      <ul className="space-y-2.5">
                        {release.changes.map((change, i) => {
                          const { Icon, bg, text, label } = TYPE_CONFIG[change.type];
                          return (
                            <li key={i} className="flex items-start gap-3">
                              <span className={`mt-0.5 flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-semibold shrink-0 ${bg} ${text}`}>
                                <Icon size={10} />
                                {label}
                              </span>
                              <span className="text-sm text-slate-600 leading-snug">{change.text}</span>
                            </li>
                          );
                        })}
                      </ul>

                      {/* Divider between versions */}
                      {RELEASES.indexOf(release) < RELEASES.length - 1 && (
                        <div className="mt-6 border-t border-slate-100" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

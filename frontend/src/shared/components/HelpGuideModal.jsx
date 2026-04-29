import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, BookOpen } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const GUIDES = {
  '/dashboard': {
    title: 'Dashboard',
    sections: [
      {
        heading: 'Overview',
        content:
          'The Dashboard is your central hub. Admins see organization-wide statistics — total employees, active count, employees on leave today, and pending leave requests. Employees see a personal dashboard with their profile summary, leave balance heatmap, and upcoming holidays.',
      },
      {
        heading: 'Admin Dashboard',
        items: [
          'View stat cards for total employees, active employees, on-leave today, and pending requests.',
          'Analyze department distribution via the interactive pie chart.',
          'Use quick-action cards to navigate to Employees, Departments, Leave Management, and more.',
          'Download PDF or Excel reports using the export buttons.',
          'View monthly leave summary with approved, rejected, and pending counts.',
        ],
      },
      {
        heading: 'Employee Dashboard',
        items: [
          'View your profile card with name, department, position, and contact info.',
          'Check your leave balance and usage at a glance.',
          'See a GitHub-style leave heatmap showing your leaves, holidays, and weekends for the year.',
          'View your recent leave requests and their statuses.',
          'Use quick-action cards to apply for leave, view announcements, or update your profile.',
          'See upcoming holidays for your assigned country.',
        ],
      },
    ],
  },
  '/employees': {
    title: 'Employee Management',
    sections: [
      {
        heading: 'Overview',
        content:
          'Manage all employee accounts in your organization. This page is available only to administrators.',
      },
      {
        heading: 'How to Use',
        items: [
          'Browse all employees in a paginated, searchable table.',
          'Use the search bar to filter employees by name, email, department, or position.',
          'Click "Add Employee" to create a new employee account via the modal form.',
          'Click on an employee row to view and edit their full profile.',
          'Deactivate employees using the action button — this soft-disables their account.',
          'Assign departments and leave groups when creating or editing employees.',
        ],
      },
      {
        heading: 'Tips',
        items: [
          'Employees with a red badge are inactive/deactivated.',
          'The presence status dot shows real-time online/away/offline status.',
          'You can download a PDF or Excel employee report from the Dashboard.',
        ],
      },
    ],
  },
  '/departments': {
    title: 'Department Management',
    sections: [
      {
        heading: 'Overview',
        content:
          'Create and manage organizational departments. Departments are used to group employees and appear in dashboard charts and reports.',
      },
      {
        heading: 'How to Use',
        items: [
          'View all departments with employee count in a card grid layout.',
          'Click "Add Department" to create a new department with a name and optional description.',
          'Click the edit icon on a department card to rename it or update its description.',
          'Click the delete icon to remove a department (only if no employees are assigned).',
        ],
      },
    ],
  },
  '/leaves': {
    title: 'Leave Management',
    sections: [
      {
        heading: 'Overview',
        content:
          'View, apply for, and manage leave requests. Employees can apply for leave and track their request status. Admins can approve or reject pending requests.',
      },
      {
        heading: 'For Employees',
        items: [
          'Click "Apply Leave" to submit a new leave request.',
          'Choose the leave type, start/end dates, and provide a reason.',
          'View all your submitted leaves with their current status (Pending, Approved, Rejected).',
          'Cancel a pending leave request before it is reviewed.',
          'Your leave balance is shown based on your assigned leave group.',
        ],
      },
      {
        heading: 'For Admins',
        items: [
          'View all leave requests across the organization.',
          'Filter by status (Pending, Approved, Rejected) or by employee.',
          'Click Approve or Reject on any pending leave request.',
          'The employee is automatically notified of the decision.',
        ],
      },
    ],
  },
  '/leaves/apply': {
    title: 'Apply for Leave',
    sections: [
      {
        heading: 'Overview',
        content: 'Submit a new leave request by filling out the leave application form.',
      },
      {
        heading: 'How to Use',
        items: [
          'Select the leave type from the dropdown (e.g., Casual, Sick, Annual, WFH).',
          'Pick the start and end dates using the date pickers.',
          'Enter a reason for your leave request.',
          'Review the number of effective working days (weekends and holidays are excluded).',
          'Click "Submit" to send the request for admin approval.',
          'You will receive a notification once your leave is approved or rejected.',
        ],
      },
    ],
  },
  '/leave-types': {
    title: 'Leave Types',
    sections: [
      {
        heading: 'Overview',
        content:
          'Configure the types of leave available in your organization (e.g., Casual Leave, Sick Leave, Annual Leave, Work From Home). Each type has a default balance and paid/unpaid status.',
      },
      {
        heading: 'How to Use',
        items: [
          'View all leave types in a list with their name, default balance, and paid status.',
          'Click "Add Leave Type" to create a new leave type.',
          'Click the edit icon to modify an existing leave type\'s name, description, default balance, or paid status.',
          'Click the delete icon to deactivate a leave type (it will no longer appear for new applications).',
        ],
      },
      {
        heading: 'Tips',
        items: [
          'Default balance defines how many days an employee gets per year for this leave type.',
          'Paid leave types are marked with a green badge; unpaid with a gray badge.',
          'Leave types are used inside Leave Groups to assign custom balances per group.',
        ],
      },
    ],
  },
  '/leave-groups': {
    title: 'Leave Groups',
    sections: [
      {
        heading: 'Overview',
        content:
          'Leave Groups let you define different leave balance policies for different sets of employees. For example, you might have a "Standard" group with 12 casual + 6 sick days, and a "Senior" group with 18 casual + 10 sick days.',
      },
      {
        heading: 'How to Use',
        items: [
          'View all leave groups with their assigned leave types and balances.',
          'Click "Add Leave Group" to create a new group.',
          'Add leave type items to the group and set custom balances for each.',
          'Mark a group as "Default" — new employees will automatically be assigned this group.',
          'Click the expand arrow to see the detailed breakdown of leave types and balances.',
          'Edit or delete groups using the action icons.',
        ],
      },
      {
        heading: 'Tips',
        items: [
          'Only one group can be marked as the default at a time.',
          'Assign employees to groups from their profile page or during creation.',
          'Changing a group\'s balances does not retroactively change already-provisioned balances.',
        ],
      },
    ],
  },
  '/holidays': {
    title: 'Holiday Calendar',
    sections: [
      {
        heading: 'Overview',
        content:
          'Manage country-specific public holidays. Holidays are excluded from leave day calculations, and they appear on the employee dashboard heatmap.',
      },
      {
        heading: 'How to Use',
        items: [
          'Filter holidays by country and year using the dropdowns at the top.',
          'View holidays in a clean table with date, name, country, and description.',
          'Admins can click "Add Holiday" to create a new holiday entry.',
          'Edit existing holidays by clicking the pencil icon.',
          'Delete holidays using the trash icon.',
        ],
      },
      {
        heading: 'Tips',
        items: [
          'Employees see holidays for their assigned country only.',
          'Holidays are automatically excluded when calculating effective leave days.',
          'Supported countries include India, US, UK, Canada, Australia, Germany, France, Singapore, UAE, and Japan.',
        ],
      },
    ],
  },
  '/announcements': {
    title: 'Announcements',
    sections: [
      {
        heading: 'Overview',
        content:
          'Organization-wide announcements published by administrators. All employees can view announcements in a chronological feed.',
      },
      {
        heading: 'For Admins',
        items: [
          'Click "New Announcement" to publish a new announcement with a title and content.',
          'Announcements are delivered to all employees and appear in their notification bell.',
          'Edit or delete announcements using the action icons.',
        ],
      },
      {
        heading: 'For Employees',
        items: [
          'Browse announcements in reverse chronological order.',
          'Use the search bar to find specific announcements by title or content.',
          'New announcements trigger a notification badge on the bell icon.',
        ],
      },
    ],
  },
  '/settings': {
    title: 'Settings',
    sections: [
      {
        heading: 'Overview',
        content:
          'System-wide configuration and feature flag management. Only accessible by administrators.',
      },
      {
        heading: 'How to Use',
        items: [
          'Toggle feature flags to enable or disable modules across the application.',
          'Available toggles: Leave Management, Announcements, Presence Tracking, and Backups.',
          'When a feature is disabled, its sidebar link is hidden and API endpoints return 403.',
          'Changes take effect immediately for all users.',
        ],
      },
      {
        heading: 'Tips',
        items: [
          'Use feature flags to gradually roll out new modules.',
          'Disabling a feature does not delete its data — re-enabling restores everything.',
        ],
      },
    ],
  },
  '/backup': {
    title: 'Backup & Restore',
    sections: [
      {
        heading: 'Overview',
        content:
          'Create and download database backups for disaster recovery. Only accessible by administrators.',
      },
      {
        heading: 'How to Use',
        items: [
          'Click "Create Backup" to trigger a new database backup.',
          'The backup runs as a background job — you will see a progress indicator.',
          'Once complete, the backup appears in the list with its file size and creation date.',
          'Click the download icon to download the backup file to your computer.',
        ],
      },
      {
        heading: 'Tips',
        items: [
          'Backups include the full MySQL database dump.',
          'Store downloaded backups in a safe, off-site location.',
          'Schedule regular backups for production environments.',
        ],
      },
    ],
  },
  '/profile': {
    title: 'My Profile',
    sections: [
      {
        heading: 'Overview',
        content:
          'View and update your personal profile information including your name, phone number, bio, position, and avatar.',
      },
      {
        heading: 'How to Use',
        items: [
          'Your profile card shows your name, email, department, position, and contact info.',
          'Click "Edit Profile" to modify your personal details.',
          'Upload a new avatar by clicking on your profile picture.',
          'Admins can view and edit any employee\'s profile from the Employees page.',
          'Your profile also shows your leave balance and assigned leave group.',
        ],
      },
    ],
  },
};

function getGuideForPath(pathname) {
  if (GUIDES[pathname]) return GUIDES[pathname];
  const match = Object.entries(GUIDES).find(
    ([key]) => key !== '/' && pathname.startsWith(key + '/')
  );
  if (match) return match[1];
  if (pathname.startsWith('/employees/')) return GUIDES['/employees'];
  return {
    title: 'Help',
    sections: [
      {
        heading: 'Welcome to EMS Portal',
        content:
          'Use the sidebar navigation to access different modules. Click the help icon on any page to see a detailed guide for that specific feature.',
      },
    ],
  };
}

export default function HelpGuideModal({ open, onClose }) {
  const { pathname } = useLocation();
  const guide = getGuideForPath(pathname);

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-purple-50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <BookOpen size={18} className="text-indigo-600" />
                    </div>
                    <div>
                      <Dialog.Title className="text-lg font-semibold text-slate-800">
                        {guide.title}
                      </Dialog.Title>
                      <p className="text-xs text-slate-500">User Guide</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white/80 transition"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 max-h-[70vh] overflow-y-auto space-y-6">
                  {guide.sections.map((section, i) => (
                    <div key={i}>
                      <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-2">
                        {section.heading}
                      </h3>
                      {section.content && (
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {section.content}
                        </p>
                      )}
                      {section.items && (
                        <ul className="space-y-1.5 mt-1">
                          {section.items.map((item, j) => (
                            <li
                              key={j}
                              className="flex items-start gap-2 text-sm text-slate-600"
                            >
                              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                  >
                    Got it
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

import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

const adminSteps = [
  {
    element: '#sidebar-brand',
    popover: {
      title: 'EMS Portal',
      description: 'Welcome to the Employee Management System! This is your portal brand and version indicator.',
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '#sidebar-nav',
    popover: {
      title: 'Navigation',
      description: 'Use the sidebar to navigate between sections: Dashboard, Employees, Departments, Leaves, Announcements, Settings, and more.',
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '#status-dropdown',
    popover: {
      title: 'Presence Status',
      description: 'Set your current availability — Online, Away, Out of Office, or Offline. Colleagues can see your real-time status.',
      side: 'bottom',
      align: 'end',
    },
  },
  {
    element: '#notification-bell',
    popover: {
      title: 'Notifications',
      description: 'Stay up to date with leave approvals, rejections, and system announcements. Unread notifications appear with a red badge.',
      side: 'bottom',
      align: 'end',
    },
  },
  {
    element: '#help-guide-btn',
    popover: {
      title: 'Help & User Guide',
      description: 'Click here anytime to open the context-sensitive help guide for the current page.',
      side: 'bottom',
      align: 'end',
    },
  },
  {
    element: '#tour-btn',
    popover: {
      title: 'Replay Tour',
      description: 'You can restart this tour anytime by clicking this button.',
      side: 'bottom',
      align: 'end',
    },
  },
  {
    element: '#sidebar-user',
    popover: {
      title: 'Your Account',
      description: 'Your name, email, and role are shown here. Click "Sign out" to securely log out of the portal.',
      side: 'top',
      align: 'start',
    },
  },
];

const employeeSteps = [
  {
    element: '#sidebar-brand',
    popover: {
      title: 'EMS Portal',
      description: 'Welcome to the Employee Management System! This is your personal employee portal.',
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '#sidebar-nav',
    popover: {
      title: 'Navigation',
      description: 'Use the sidebar to access your Dashboard, apply for Leaves, view Holidays, and read Announcements.',
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '#status-dropdown',
    popover: {
      title: 'Presence Status',
      description: 'Let your team know your availability by setting your status to Online, Away, Out of Office, or Offline.',
      side: 'bottom',
      align: 'end',
    },
  },
  {
    element: '#notification-bell',
    popover: {
      title: 'Notifications',
      description: 'Get notified when your leave requests are approved or rejected. Red badge shows unread count.',
      side: 'bottom',
      align: 'end',
    },
  },
  {
    element: '#help-guide-btn',
    popover: {
      title: 'Help & User Guide',
      description: 'Click here for a step-by-step guide on how to use the current page.',
      side: 'bottom',
      align: 'end',
    },
  },
  {
    element: '#tour-btn',
    popover: {
      title: 'Replay Tour',
      description: 'You can restart this tour anytime by clicking this button.',
      side: 'bottom',
      align: 'end',
    },
  },
  {
    element: '#sidebar-user',
    popover: {
      title: 'Your Account',
      description: 'Your profile info is here. Click "Sign out" to log out securely.',
      side: 'top',
      align: 'start',
    },
  },
];

export function useTour(role) {
  const start = () => {
    const steps = role === 'admin' ? adminSteps : employeeSteps;

    // Filter out steps whose target element doesn't exist in the DOM yet
    const availableSteps = steps.filter((s) => {
      if (!s.element) return true;
      return document.querySelector(s.element) !== null;
    });

    const driverObj = driver({
      showProgress: true,
      animate: true,
      overlayOpacity: 0.6,
      stagePadding: 6,
      stageRadius: 8,
      popoverClass: 'ems-tour-popover',
      nextBtnText: 'Next →',
      prevBtnText: '← Back',
      doneBtnText: 'Done',
      steps: availableSteps,
    });

    driverObj.drive();
  };

  return { start };
}

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../shared/components/ProtectedRoute';
import RoleGuard from '../shared/components/RoleGuard';
import AppLayout from '../shared/components/AppLayout';

// Auth
import LoginPage from '../modules/auth/pages/LoginPage';

// Dashboard
import DashboardPage from '../modules/dashboard/pages/DashboardPage';
import EmployeeHomePage from '../modules/dashboard/pages/EmployeeHomePage';

// Employees
import EmployeeListPage from '../modules/employees/pages/EmployeeListPage';
import EmployeeProfilePage from '../modules/employees/pages/EmployeeProfilePage';

// Departments
import DepartmentListPage from '../modules/departments/pages/DepartmentListPage';

// Leaves
import LeaveListPage from '../modules/leaves/pages/LeaveListPage';
import ApplyLeavePage from '../modules/leaves/pages/ApplyLeavePage';

// Leave Types (admin)
import LeaveTypeListPage from '../modules/leave-types/pages/LeaveTypeListPage';

// Leave Groups (admin)
import LeaveGroupListPage from '../modules/leave-groups/pages/LeaveGroupListPage';

// Holidays
import HolidayListPage from '../modules/holidays/pages/HolidayListPage';

// Announcements
import AnnouncementsPage from '../modules/announcements/pages/AnnouncementsPage';

// Settings (admin)
import SettingsPage from '../modules/settings/pages/SettingsPage';

import useAuthStore from '../store/authStore';

// Backup (admin)
import BackupPage from '../modules/backup/pages/BackupPage';

function DashboardRouter() {
  const user = useAuthStore((s) => s.user);
  return user?.role === 'admin' ? <DashboardPage /> : <EmployeeHomePage />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* All authenticated routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardRouter />} />
            <Route path="/profile" element={<EmployeeProfilePage />} />
            <Route path="/leaves" element={<LeaveListPage />} />
            <Route path="/leaves/apply" element={<ApplyLeavePage />} />
            <Route path="/holidays" element={<HolidayListPage />} />
            <Route path="/announcements" element={<AnnouncementsPage />} />

            {/* Admin-only routes */}
            <Route
              path="/employees"
              element={
                <RoleGuard role="admin">
                  <EmployeeListPage />
                </RoleGuard>
              }
            />
            <Route
              path="/employees/:id"
              element={
                <RoleGuard role="admin">
                  <EmployeeProfilePage />
                </RoleGuard>
              }
            />
            <Route
              path="/departments"
              element={
                <RoleGuard role="admin">
                  <DepartmentListPage />
                </RoleGuard>
              }
            />
            <Route
              path="/leave-types"
              element={
                <RoleGuard role="admin">
                  <LeaveTypeListPage />
                </RoleGuard>
              }
            />
            <Route
              path="/leave-groups"
              element={
                <RoleGuard role="admin">
                  <LeaveGroupListPage />
                </RoleGuard>
              }
            />
            <Route
              path="/settings"
              element={
                <RoleGuard role="admin">
                  <SettingsPage />
                </RoleGuard>
              }
            />
            <Route
              path="/backup"
              element={
                <RoleGuard role="admin">
                  <BackupPage />
                </RoleGuard>
              }
            />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

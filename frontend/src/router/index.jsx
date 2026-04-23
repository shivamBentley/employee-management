import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../shared/components/ProtectedRoute';
import RoleGuard from '../shared/components/RoleGuard';
import AppLayout from '../shared/components/AppLayout';

// Auth
import LoginPage from '../modules/auth/pages/LoginPage';

// Dashboard
import DashboardPage from '../modules/dashboard/pages/DashboardPage';

// Employees
import EmployeeListPage from '../modules/employees/pages/EmployeeListPage';
import EmployeeProfilePage from '../modules/employees/pages/EmployeeProfilePage';

// Departments
import DepartmentListPage from '../modules/departments/pages/DepartmentListPage';

// Leaves
import LeaveListPage from '../modules/leaves/pages/LeaveListPage';
import ApplyLeavePage from '../modules/leaves/pages/ApplyLeavePage';

// Announcements
import AnnouncementsPage from '../modules/announcements/pages/AnnouncementsPage';

// Settings (admin)
import SettingsPage from '../modules/settings/pages/SettingsPage';

// Backup (admin)
import BackupPage from '../modules/backup/pages/BackupPage';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* All authenticated routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<EmployeeProfilePage />} />
            <Route path="/leaves" element={<LeaveListPage />} />
            <Route path="/leaves/apply" element={<ApplyLeavePage />} />
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

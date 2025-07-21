import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { ProtectedRoute } from '../components/protected-route/ProtectedRoute';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { LoginForm } from '../pages/login/LoginForm';
import { LoginPage } from '../pages/login/LoginPage';
import { PasswordResetForm } from '../pages/login/PasswordResetForm';
import { SignupForm } from '../pages/login/SignupForm';
import { NotFoundPage } from '../pages/not-found/NotFoundPage';

import { AppRoot } from './app-root/AppRoot';

export function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />}>
          <Route path="" element={<LoginForm />} />
          <Route path="signup" element={<SignupForm />} />
          <Route path="reset-password" element={<PasswordResetForm />} />
        </Route>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppRoot />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="" element={<Navigate to="/dashboard" replace />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

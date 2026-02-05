import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import OrderResultPage from './pages/OrderResultPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrderForm from './pages/AdminOrderForm';
import StaffManagement from './pages/StaffManagement';
import { StorageService } from './services/storage';

// Protected Route Guard
const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const session = StorageService.getSession();
  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
};

// Admin Only Guard
const AdminOnlyRoute = ({ children }: { children?: React.ReactNode }) => {
  const session = StorageService.getSession();
  if (!session || session.role !== 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/order/:id" element={<OrderResultPage />} />
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Protected Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders/new"
            element={
              <ProtectedRoute>
                <AdminOrderForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders/:id"
            element={
              <ProtectedRoute>
                <AdminOrderForm />
              </ProtectedRoute>
            }
          />
          
          {/* Admin Only Route */}
          <Route
            path="/admin/staff"
            element={
              <AdminOnlyRoute>
                <StaffManagement />
              </AdminOnlyRoute>
            }
          />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
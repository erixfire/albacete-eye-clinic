import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './layouts/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PatientList from './pages/Patients/PatientList';
import PatientDetail from './pages/Patients/PatientDetail';
import PatientForm from './pages/Patients/PatientForm';
import VisitForm from './pages/Visits/VisitForm';
import MedicineList from './pages/Inventory/MedicineList';

// Protected Route Wrapper
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <AppLayout>{children}</AppLayout>;
};

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/patients" element={
          <ProtectedRoute roles={['admin', 'doctor', 'nurse']}>
            <PatientList />
          </ProtectedRoute>
        } />

        <Route path="/patients/new" element={
          <ProtectedRoute roles={['admin', 'doctor', 'nurse']}>
            <PatientForm />
          </ProtectedRoute>
        } />

        <Route path="/patients/:id" element={
          <ProtectedRoute roles={['admin', 'doctor', 'nurse']}>
            <PatientDetail />
          </ProtectedRoute>
        } />

        <Route path="/visits/new" element={
          <ProtectedRoute roles={['admin', 'doctor', 'nurse']}>
            <VisitForm />
          </ProtectedRoute>
        } />

        {/* Placeholders for other routes */}
        <Route path="/appointments" element={
          <ProtectedRoute roles={['admin', 'doctor', 'nurse']}>
            <div className="py-20 text-center text-gray-500">Appointments Module Coming Soon</div>
          </ProtectedRoute>
        } />

        <Route path="/inventory" element={
          <ProtectedRoute roles={['admin', 'pharmacist']}>
            <MedicineList />
          </ProtectedRoute>
        } />

        <Route path="/admin" element={
          <ProtectedRoute roles={['admin']}>
            <div className="py-20 text-center text-gray-500">Admin Settings Coming Soon</div>
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;

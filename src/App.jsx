import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './layouts/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PatientList from './pages/Patients/PatientList';
import PatientDetail from './pages/Patients/PatientDetail';
import PatientForm from './pages/Patients/PatientForm';
import VisitList from './pages/Visits/VisitList';
import VisitForm from './pages/Visits/VisitForm';
import VisitDetail from './pages/Visits/VisitDetail';
import MedicineList from './pages/Inventory/MedicineList';
import AppointmentList from './pages/Appointments/AppointmentList';
import RxPrint from './pages/Prescriptions/RxPrint';
import AdminPanel from './pages/Admin/AdminPanel';
import Home from './pages/Home';

const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <AppLayout>{children}</AppLayout>;
};

// Bare layout wrapper for print pages (no sidebar)
const PrintRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

const CLINIC_ROLES  = ['admin', 'doctor', 'nurse', 'frontdesk'];
const MEDICAL_ROLES = ['admin', 'doctor', 'nurse'];

const App = () => (
  <AuthProvider>
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />

      {/* Auth */}
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />

      {/* Dashboard */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

      {/* Patients */}
      <Route path="/patients" element={
        <ProtectedRoute roles={CLINIC_ROLES}><PatientList /></ProtectedRoute>
      } />
      <Route path="/patients/new" element={
        <ProtectedRoute roles={CLINIC_ROLES}><PatientForm /></ProtectedRoute>
      } />
      <Route path="/patients/:id" element={
        <ProtectedRoute roles={CLINIC_ROLES}><PatientDetail /></ProtectedRoute>
      } />
      <Route path="/patients/:id/edit" element={
        <ProtectedRoute roles={CLINIC_ROLES}><PatientForm /></ProtectedRoute>
      } />

      {/* Visits */}
      <Route path="/visits" element={
        <ProtectedRoute roles={CLINIC_ROLES}><VisitList /></ProtectedRoute>
      } />
      <Route path="/visits/new" element={
        <ProtectedRoute roles={MEDICAL_ROLES}><VisitForm /></ProtectedRoute>
      } />
      <Route path="/visits/:id" element={
        <ProtectedRoute roles={CLINIC_ROLES}><VisitDetail /></ProtectedRoute>
      } />

      {/* Appointments */}
      <Route path="/appointments" element={
        <ProtectedRoute roles={CLINIC_ROLES}><AppointmentList /></ProtectedRoute>
      } />

      {/* Prescription print — bare layout, no sidebar */}
      <Route path="/prescriptions/:id/print" element={
        <PrintRoute roles={CLINIC_ROLES}><RxPrint /></PrintRoute>
      } />

      {/* Inventory */}
      <Route path="/inventory" element={
        <ProtectedRoute roles={['admin', 'pharmacist']}><MedicineList /></ProtectedRoute>
      } />

      {/* Admin */}
      <Route path="/admin" element={
        <ProtectedRoute roles={['admin']}><AdminPanel /></ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </AuthProvider>
);

export default App;

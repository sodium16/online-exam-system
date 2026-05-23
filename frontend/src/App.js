import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

// Student pages
import Login       from './pages/Login';
import Register    from './pages/Register';
import Dashboard   from './pages/Dashboard';
import ExamList    from './pages/ExamList';
import ExamRoom    from './pages/ExamRoom';
import Result      from './pages/Result';
import History     from './pages/History';
import Leaderboard from './pages/Leaderboard';
import Reports     from './pages/Reports';
import Layout      from './components/Layout';

// Admin pages
import AdminLogin      from './pages/admin/AdminLogin';
import AdminLayout     from './components/admin/AdminLayout';
import AdminDashboard  from './pages/admin/AdminDashboard';
import AdminExams      from './pages/admin/AdminExams';
import AdminExamDetail from './pages/admin/AdminExamDetail';
import AdminStudents   from './pages/admin/AdminStudents';
import AdminDepts      from './pages/admin/AdminDepts';

const StudentRoute = ({ children }) => {
  const { student, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  return student ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { admin, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  return admin ? children : <Navigate to="/admin/login" />;
};

const PublicRoute = ({ children }) => {
  const { student, admin, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  if (admin)   return <Navigate to="/admin" />;
  if (student) return <Navigate to="/dashboard" />;
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login"       element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register"    element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/admin/login" element={<PublicRoute><AdminLogin /></PublicRoute>} />

          {/* Student */}
          <Route path="/" element={<StudentRoute><Layout /></StudentRoute>}>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard"              element={<Dashboard />} />
            <Route path="exams"                  element={<ExamList />} />
            <Route path="exams/:id"              element={<ExamRoom />} />
            <Route path="result/:examId"         element={<Result />} />
            <Route path="history"                element={<History />} />
            <Route path="leaderboard/:examId"    element={<Leaderboard />} />
            <Route path="reports"                element={<Reports />} />
          </Route>

          {/* Admin */}
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="exams"          element={<AdminExams />} />
            <Route path="exams/:id"      element={<AdminExamDetail />} />
            <Route path="students"       element={<AdminStudents />} />
            <Route path="departments"    element={<AdminDepts />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

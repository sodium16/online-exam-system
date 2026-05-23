import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

import Login        from './pages/Login';
import Register     from './pages/Register';
import Dashboard    from './pages/Dashboard';
import ExamList     from './pages/ExamList';
import ExamRoom     from './pages/ExamRoom';
import Result       from './pages/Result';
import History      from './pages/History';
import Leaderboard  from './pages/Leaderboard';
import Reports      from './pages/Reports';
import Layout       from './components/Layout';

const PrivateRoute = ({ children }) => {
  const { student, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  return student ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { student, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  return !student ? children : <Navigate to="/dashboard" />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard"          element={<Dashboard />} />
            <Route path="exams"              element={<ExamList />} />
            <Route path="exams/:id"          element={<ExamRoom />} />
            <Route path="result/:examId"     element={<Result />} />
            <Route path="history"            element={<History />} />
            <Route path="leaderboard/:examId" element={<Leaderboard />} />
            <Route path="reports"            element={<Reports />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

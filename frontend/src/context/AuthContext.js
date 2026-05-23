import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [student, setStudent]   = useState(null);
  const [admin, setAdmin]       = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const token   = localStorage.getItem('token');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      if (isAdmin) {
        // restore admin from localStorage snapshot
        const snap = localStorage.getItem('adminSnap');
        if (snap) setAdmin(JSON.parse(snap));
        setLoading(false);
      } else {
        axios.get('/api/auth/me')
          .then(r => setStudent(r.data))
          .catch(() => { localStorage.removeItem('token'); })
          .finally(() => setLoading(false));
      }
    } else setLoading(false);
  }, []);

  const setAuth = (token, isAdmin) => {
    localStorage.setItem('token', token);
    localStorage.setItem('isAdmin', isAdmin);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const login = async (email, password) => {
    const { data } = await axios.post('/api/auth/login', { email, password });
    setAuth(data.token, false);
    setStudent(data.student);
    setAdmin(null);
    return data;
  };

  const adminLogin = async (email, password) => {
    const { data } = await axios.post('/api/auth/admin/login', { email, password });
    setAuth(data.token, true);
    setAdmin(data.admin);
    localStorage.setItem('adminSnap', JSON.stringify(data.admin));
    setStudent(null);
    return data;
  };

  const register = async (form) => {
    const { data } = await axios.post('/api/auth/register', form);
    setAuth(data.token, false);
    setStudent(data.student);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminSnap');
    delete axios.defaults.headers.common['Authorization'];
    setStudent(null);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ student, admin, login, adminLogin, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

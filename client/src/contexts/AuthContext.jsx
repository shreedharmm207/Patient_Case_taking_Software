// client/src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginPatient, loginDoctor, loginAdmin } from '../utils/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('medikiosk_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('medikiosk_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('medikiosk_user');
    }
  }, [user]);

  const signInPatient = async (payload) => {
    const res = await loginPatient(payload);
    if (res.success) {
      setUser(res.user);
      return res.user;
    }
  };

  const signInDoctor = async (doctorId) => {
    const res = await loginDoctor(doctorId);
    if (res.success) {
      setUser(res.user);
      return res.user;
    }
  };

  const signInAdmin = async (creds = {}) => {
    const res = await loginAdmin(creds);
    if (res.success) {
      setUser(res.user);
      return res.user;
    }
  };

  const signOut = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      role: user?.role || null,
      signInPatient,
      signInDoctor,
      signInAdmin,
      signOut,
      isAuthenticated: Boolean(user)
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

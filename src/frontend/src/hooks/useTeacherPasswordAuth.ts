import { useState, useEffect } from 'react';

const TEACHER_PASSWORD_KEY = 'teacher_password';

export function useTeacherPasswordAuth() {
  const [password, setPassword] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Load password from sessionStorage on mount
    const stored = sessionStorage.getItem(TEACHER_PASSWORD_KEY);
    setPassword(stored);
    setIsInitialized(true);
  }, []);

  const login = (pwd: string) => {
    sessionStorage.setItem(TEACHER_PASSWORD_KEY, pwd);
    setPassword(pwd);
  };

  const logout = () => {
    sessionStorage.removeItem(TEACHER_PASSWORD_KEY);
    setPassword(null);
  };

  const updatePassword = (newPassword: string) => {
    sessionStorage.setItem(TEACHER_PASSWORD_KEY, newPassword);
    setPassword(newPassword);
  };

  return {
    password,
    isAuthenticated: !!password,
    isInitialized,
    login,
    logout,
    updatePassword,
  };
}

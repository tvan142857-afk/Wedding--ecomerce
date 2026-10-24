import { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);

function loadAuth() {
  try {
    const token = localStorage.getItem('wedding_token');
    const userRaw = localStorage.getItem('wedding_user');
    return { token: token || '', user: userRaw ? JSON.parse(userRaw) : null };
  } catch {
    return { token: '', user: null };
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(loadAuth);

  const login = (token, user) => {
    try {
      if (token) localStorage.setItem('wedding_token', token);
      if (user) localStorage.setItem('wedding_user', JSON.stringify(user));
    } catch { /* bỏ qua */ }
    setAuth({ token: token || '', user: user || null });
  };

  const logout = () => {
    try {
      localStorage.removeItem('wedding_token');
      localStorage.removeItem('wedding_user');
    } catch { /* bỏ qua */ }
    setAuth({ token: '', user: null });
  };

  // Backend trả AuthResponse phẳng {token, email, fullName, role}.
  // Lưu role để phân quyền admin/user đúng, không suy đoán từ email.
  const role = auth.user?.role || '';
  const value = useMemo(() => ({
    ...auth,
    role,
    isAdmin: role === 'ADMIN',
    isLoggedIn: Boolean(auth.token), login, logout,
  }), [auth, role]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth phải dùng trong AuthProvider');
  return ctx;
}

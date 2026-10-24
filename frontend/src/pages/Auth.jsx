import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, unwrapOne } from '../api.js';
import { useAuth } from '../store/AuthContext.jsx';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = unwrapOne(await api.login(form));
      const token = res.token || res.accessToken || res.jwt || '';
      // Backend trả phẳng {token, email, fullName, role} — lưu đủ 3 field này.
      const user = res.user || { email: res.email || form.email, fullName: res.fullName || res.name || '', role: res.role || '' };
      if (!token) {
        // Một số backend chỉ trả token trong header / trả user mà không có token:
        // vẫn báo rõ thay vì giả vờ đăng nhập thành công.
        throw new Error('Máy chủ không trả về token đăng nhập. Vui lòng kiểm tra lại API /api/auth/login.');
      }
      login(token, user);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra email/mật khẩu và thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-wrap">
      <form className="card auth-form" onSubmit={submit}>
        <h1>Đăng nhập</h1>
        {error && <div className="alert alert-error">{error}</div>}
        <label>Email<input className="input" type="email" value={form.email} onChange={set('email')} required /></label>
        <label>Mật khẩu<input className="input" type="password" value={form.password} onChange={set('password')} required /></label>
        <button className="btn btn-primary" disabled={submitting}>{submitting ? 'Đang đăng nhập…' : 'Đăng nhập'}</button>
        <p className="muted">Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link></p>
      </form>
    </div>
  );
}

export function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Mật khẩu cần ít nhất 6 ký tự.');
      return;
    }
    setSubmitting(true);
    try {
      // Backend nhận fullName (RegisterRequest), không nhận name — gửi name sẽ làm mất tên.
      await api.register({ email: form.email, password: form.password, fullName: form.name });
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-wrap">
      <form className="card auth-form" onSubmit={submit}>
        <h1>Đăng ký tài khoản</h1>
        {error && <div className="alert alert-error">{error}</div>}
        <label>Họ và tên<input className="input" value={form.name} onChange={set('name')} required /></label>
        <label>Email<input className="input" type="email" value={form.email} onChange={set('email')} required /></label>
        <label>Mật khẩu<input className="input" type="password" value={form.password} onChange={set('password')} required /></label>
        <button className="btn btn-primary" disabled={submitting}>{submitting ? 'Đang đăng ký…' : 'Đăng ký'}</button>
        <p className="muted">Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>
      </form>
    </div>
  );
}

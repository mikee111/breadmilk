import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/registration.css';

function Registration() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);

    if (!form.email || !form.password) {
      setMessage('Please enter your email and password.');
      setIsLoading(false);
      return;
    }

    const endpoints = [
      'http://localhost:5001/api/auth/login',
      'http://127.0.0.1:5001/api/auth/login'
    ];

    try {
      for (const endpoint of endpoints) {
        try {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: form.email.trim(),
              password: form.password.trim()
            })
          });

          if (!res.ok) {
            continue;
          }

          const data = await res.json();

          if (data.success) {
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('userRole', data.user.role || '');

            const userRole = (data.user.role || '').toLowerCase();
            const roleType = userRole.includes('admin') ? 'ADMIN' : 'USER';
            localStorage.setItem('userRoleType', roleType);

            navigate(roleType === 'ADMIN' ? '/admin-dashboard' : '/user-dashboard', { replace: true });
            return;
          }
        } catch (error) {
        }
      }

      setMessage('Invalid email or password.');
    } catch (error) {
      setMessage('Network error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="registration-page"
      style={{
        backgroundImage: "url('https://breadtalkindia.files.wordpress.com/2018/10/breadtalk.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="registration-form">
        <h2>Login</h2>
        <p className="registration-subtitle">Sign in with your account</p>
        <form onSubmit={handleSubmit}>
          <div className="form-row form-row-single">
            <label htmlFor="registration-email">Email</label>
            <input
              id="registration-email"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-row form-row-single">
            <label htmlFor="registration-password">Password</label>
            <input
              id="registration-password"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
          {message && (
            <div className={`registration-message ${message.includes('Invalid') || message.includes('error') ? 'error' : 'success'}`}>
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default Registration;

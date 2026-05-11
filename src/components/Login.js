import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      error: '',
      isLoading: false,
      showPassword: false,
      shouldRedirect: false
    };
    
    this.handleLogin = this.handleLogin.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.togglePasswordVisibility = this.togglePasswordVisibility.bind(this);
  }

  handleInputChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
      error: ''
    });
  }

  togglePasswordVisibility() {
    this.setState(prevState => ({
      showPassword: !prevState.showPassword
    }));
  }

  async handleLogin(e) {
    e.preventDefault();
    
    const { username, password } = this.state;
    
    if (!username || !password) {
      this.setState({ error: 'Please enter both username/email and password' });
      return;
    }

    this.setState({ isLoading: true, error: '' });

    const endpoints = [
      'http://localhost:5001/api/auth/login',
      'http://127.0.0.1:5001/api/auth/login'
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`Attempting login with ${endpoint}:`, { username, password });
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: username.trim(),
            password: password.trim()
          })
        });

        console.log(`Login response status from ${endpoint}:`, response.status);
        
        if (!response.ok) {
          console.log(`Failed with ${endpoint}, status: ${response.status}`);
          continue;
        }
        
        const result = await response.json();
        console.log('Login response data:', result);

        if (result.success) {
          // Store user data
          localStorage.setItem('user', JSON.stringify(result.user));
          localStorage.setItem('userRole', result.user.role); // Store role separately for easy access
          console.log('Login successful, checking user role for redirect...', result.user);
          
          // Determine redirect path based on user role
          const userRole = result.user.role?.toLowerCase();
          let redirectPath = '/user-dashboard'; // Default to user dashboard
          
          // Store the role type for route protection - Force to uppercase for consistency
          const roleForStorage = (userRole === 'super admin' || userRole === 'admin' || 
                                userRole === 'administrator' || userRole === 'superadmin') ? 
                                'ADMIN' : 'USER';
          localStorage.setItem('userRoleType', roleForStorage);
          console.log('Setting userRoleType in localStorage:', roleForStorage);
          
          // Check for admin roles (more comprehensive check)
          if (userRole === 'super admin' || userRole === 'admin' || userRole === 'administrator' || userRole === 'superadmin') {
            redirectPath = '/admin-dashboard'; // Changed to more specific admin route
            console.log('🔑 Admin user detected - redirecting to admin dashboard');
          } else {
            console.log('👤 Regular user detected - redirecting to user dashboard');
          }
          
          console.log(`Redirecting to: ${redirectPath} (Role: ${userRole})`);
          
          // Set state to trigger redirect
          this.setState({ 
            isLoading: false,
            shouldRedirect: true,
            redirectPath: redirectPath
          });
          
          // Show success message with role info
          const dashboardType = redirectPath === '/admin-dashboard' ? 'Admin Dashboard' : 'User Dashboard';
          alert(`✅ Welcome back, ${result.user.firstname || result.user.username}!\nRole: ${result.user.role}\nRedirecting to ${dashboardType}...`);
          return;
        } else {
          this.setState({ 
            error: result.message || 'Login failed. Please check your credentials.',
            isLoading: false
          });
          return;
        }
      } catch (error) {
        console.error(`Login error with ${endpoint}:`, error);
        // Continue to try next endpoint
      }
    }

    // If all endpoints failed
    this.setState({ 
      error: '🔌 Connection Error: Cannot reach the server on localhost:5001 or 127.0.0.1:5001.\n\nPlease ensure:\n• Backend server is running\n• No firewall is blocking the connection\n• Try the "Test Server Connection" button below',
      isLoading: false
    });
  }

  async testConnection() {
    this.setState({ error: '' });
    try {
      console.log('Testing server connection...');
      
      // Try both localhost and 127.0.0.1 with simpler ping endpoint first
      const endpoints = [
        'http://localhost:5001/api/ping',
        'http://127.0.0.1:5001/api/ping',
        'http://localhost:5001/api/test',
        'http://127.0.0.1:5001/api/test'
      ];
      
      for (const endpoint of endpoints) {
        try {
          console.log(`Testing ${endpoint}...`);
          const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const result = await response.json();
            this.setState({ error: `✅ Server connection successful via ${endpoint}!\n\nResponse: ${result.message || 'Server is working'}\nTimestamp: ${result.timestamp || 'N/A'}` });
            console.log('Connection test result:', result);
            return;
          } else {
            console.log(`${endpoint} responded with status: ${response.status}`);
          }
        } catch (err) {
          console.log(`Failed to connect to ${endpoint}:`, err.message);
        }
      }
      
      this.setState({ 
        error: '❌ Failed to connect to server on all endpoints.\n\nTroubleshooting:\n• Make sure the backend server is running\n• Check if Windows Firewall is blocking port 5001\n• Try restarting both frontend and backend\n• Ensure no antivirus is blocking the connection' 
      });
      
    } catch (error) {
      console.error('Connection test error:', error);
      this.setState({ 
        error: `❌ Connection test failed: ${error.message}\n\nMake sure the server is running on port 5000.`
      });
    }
  }

  render() {
    const { username, password, error, isLoading, showPassword, shouldRedirect, redirectPath } = this.state;

    if (shouldRedirect) {
      console.log('🚀 Redirecting to:', redirectPath);
      return <Navigate to={redirectPath || '/user-dashboard'} replace />;
    }

    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 18px',
        backgroundImage: "linear-gradient(120deg, rgba(15, 23, 42, 0.82), rgba(30, 41, 59, 0.76)), url('https://breadtalkindia.files.wordpress.com/2018/10/breadtalk.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
      }}>
        <div className="login-grid-responsive" style={{
          width: '100%',
          maxWidth: '980px',
          display: 'grid',
          gridTemplateColumns: '1.1fr 1fr',
          background: 'rgba(255, 255, 255, 0.96)',
          borderRadius: '20px',
          boxShadow: '0 28px 60px rgba(0, 0, 0, 0.36)',
          overflow: 'hidden'
        }}>
          <div style={{
            background: 'linear-gradient(160deg, #f59e0b, #fb923c)',
            color: '#fff',
            padding: '48px 40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '42px', fontWeight: '700', lineHeight: 1 }}>BreadTalk</div>
              <div style={{ marginTop: '14px', fontSize: '18px', opacity: 0.92 }}>
                Freshly baked every day with premium ingredients and handcrafted quality.
              </div>
            </div>
            <div style={{ marginTop: '38px' }}>
              <div style={{ fontSize: '15px', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.9 }}>
                Quick Navigation
              </div>
              <div style={{ marginTop: '14px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                <a href="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: '600', border: '1px solid rgba(255,255,255,0.45)', borderRadius: '999px', padding: '8px 14px' }}>Home</a>
                <a href="/about" style={{ color: '#fff', textDecoration: 'none', fontWeight: '600', border: '1px solid rgba(255,255,255,0.45)', borderRadius: '999px', padding: '8px 14px' }}>About</a>
                <a href="/#products" style={{ color: '#fff', textDecoration: 'none', fontWeight: '600', border: '1px solid rgba(255,255,255,0.45)', borderRadius: '999px', padding: '8px 14px' }}>Products</a>
                <span style={{ color: '#fff', fontWeight: '700', border: '1px solid rgba(255,255,255,0.65)', borderRadius: '999px', padding: '8px 14px', background: 'rgba(255,255,255,0.18)' }}>Login</span>
              </div>
            </div>
          </div>

          <div style={{ padding: '44px 40px' }}>
            <div style={{ marginBottom: '28px' }}>
              <h2 style={{ margin: 0, color: '#111827', fontSize: '30px', fontWeight: 700 }}>Login</h2>
              <p style={{ margin: '8px 0 0 0', color: '#6b7280', fontSize: '15px' }}>
                Sign in with your account to continue.
              </p>
            </div>

            {error && (
              <div style={{
                marginBottom: '20px',
                padding: '14px 16px',
                borderRadius: '12px',
                border: '1px solid #fecaca',
                background: '#fef2f2',
                color: '#b91c1c',
                fontSize: '14px',
                whiteSpace: 'pre-line'
              }}>
                {error}
              </div>
            )}

            <form onSubmit={this.handleLogin}>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#1f2937' }}>
                  Email or Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={username}
                  onChange={this.handleInputChange}
                  placeholder="Enter your email or username"
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: '0 14px',
                    borderRadius: '10px',
                    border: '1px solid #d1d5db',
                    fontSize: '15px',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#1f2937' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={password}
                    onChange={this.handleInputChange}
                    placeholder="Enter your password"
                    disabled={isLoading}
                    style={{
                      width: '100%',
                      height: '48px',
                      padding: '0 92px 0 14px',
                      borderRadius: '10px',
                      border: '1px solid #d1d5db',
                      fontSize: '15px',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={this.togglePasswordVisibility}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      border: 0,
                      background: '#f3f4f6',
                      color: '#374151',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 700,
                      padding: '6px 10px',
                      cursor: 'pointer'
                    }}
                  >
                    {showPassword ? 'HIDE' : 'SHOW'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  height: '50px',
                  border: 0,
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '15px',
                  fontWeight: 700,
                  letterSpacing: '0.02em',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  background: isLoading ? '#9ca3af' : 'linear-gradient(140deg, #f59e0b, #f97316)'
                }}
              >
                {isLoading ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      width: '15px',
                      height: '15px',
                      borderRadius: '50%',
                      border: '2px solid rgba(255,255,255,0.45)',
                      borderTopColor: '#fff',
                      display: 'inline-block',
                      animation: 'spin 0.8s linear infinite'
                    }} />
                    Signing in...
                  </span>
                ) : 'Login'}
              </button>
            </form>

            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
              <a href="/" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>Back to Home</a>
              <button
                type="button"
                onClick={() => this.testConnection()}
                style={{
                  border: 0,
                  background: 'transparent',
                  color: '#d97706',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Test Server Connection
              </button>
            </div>
          </div>
        </div>

        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @media (max-width: 900px) {
              .login-grid-responsive {
                grid-template-columns: 1fr !important;
              }
            }
          `}
        </style>
      </div>
    );
  }
}

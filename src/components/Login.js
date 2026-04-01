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

    // Handle redirect after successful login
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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '50px',
          borderRadius: '20px',
          boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
          width: '100%',
          maxWidth: '450px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '10px'
            }}>🍞</div>
            <h2 style={{
              margin: '0 0 8px 0',
              color: '#2d3748',
              fontSize: '28px',
              fontWeight: '700'
            }}>
              Welcome Back
            </h2>
            <p style={{
              margin: '0',
              color: '#718096',
              fontSize: '16px'
            }}>
              Sign in to your Breadmilk account
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              background: 'linear-gradient(135deg, #fed7d7 0%, #feb2b2 100%)',
              color: '#c53030',
              padding: '16px',
              borderRadius: '12px',
              marginBottom: '24px',
              fontSize: '14px',
              textAlign: 'center',
              border: '1px solid #fca5a5',
              fontWeight: '500'
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={this.handleLogin}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#2d3748',
                fontSize: '14px'
              }}>
                Email or Username
              </label>
              <input
                type="text"
                name="username"
                value={username}
                onChange={this.handleInputChange}
                placeholder="Enter your email or username"
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  transition: 'all 0.3s ease',
                  background: 'rgba(255, 255, 255, 0.8)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.boxShadow = 'none';
                }}
                disabled={isLoading}
              />
            </div>

            <div style={{ marginBottom: '32px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#2d3748',
                fontSize: '14px'
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={password}
                  onChange={this.handleInputChange}
                  placeholder="Enter your password"
                  style={{
                    width: '100%',
                    padding: '16px 50px 16px 20px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                    transition: 'all 0.3s ease',
                    background: 'rgba(255, 255, 255, 0.8)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.boxShadow = 'none';
                  }}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={this.togglePasswordVisibility}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px',
                    color: '#718096'
                  }}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '16px',
                background: isLoading ? 
                  'linear-gradient(135deg, #a0aec0 0%, #718096 100%)' : 
                  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                transform: isLoading ? 'none' : 'translateY(0)'
              }}
              onMouseOver={(e) => {
                if (!isLoading) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.5)';
                }
              }}
              onMouseOut={(e) => {
                if (!isLoading) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                }
              }}
            >
              {isLoading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <span style={{ 
                    width: '16px', 
                    height: '16px', 
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></span>
                  Signing In...
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  🔐 Sign In
                </span>
              )}
            </button>
          </form>

          {/* Test Connection Button */}
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button
              type="button"
              onClick={() => this.testConnection()}
              style={{
                width: '100%',
                padding: '12px 20px',
                background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(72, 187, 120, 0.3)'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(72, 187, 120, 0.4)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(72, 187, 120, 0.3)';
              }}
            >
              🔧 Test Server Connection
            </button>
          </div>

          {/* Test Credentials */}
          <div style={{
            marginTop: '32px',
            padding: '20px',
            background: 'linear-gradient(135deg, #e6fffa 0%, #b2f5ea 100%)',
            borderRadius: '12px',
            fontSize: '14px',
            textAlign: 'center',
            border: '1px solid #81e6d9'
          }}>
            <div style={{ fontWeight: '600', marginBottom: '8px', color: '#234e52' }}>
              🧪 Test Credentials
            </div>
            <div style={{ color: '#2d5a5a' }}>
              <strong>Admin:</strong> admin / admin123<br />
              <strong>Or use your registered email/password</strong>
            </div>
          </div>

          {/* Navigation */}
          <div style={{
            textAlign: 'center',
            marginTop: '24px',
            fontSize: '14px',
            color: '#718096'
          }}>
            Don't have an account?{' '}
            <a 
              href="/register" 
              style={{ 
                color: '#667eea', 
                textDecoration: 'none', 
                fontWeight: '600' 
              }}
            >
              Sign up here
            </a>
          </div>
        </div>

        {/* CSS Animation */}
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }
}

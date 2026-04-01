import React, { Component } from 'react';
import UserDashboard from './UserDashboard';

export default class AdminDashboard extends Component {
  componentDidMount() {
    // Force set admin role type when this component loads
    localStorage.setItem('userRoleType', 'ADMIN');
    localStorage.setItem('userRole', 'Admin');
    
    // Create or update admin user data
    const adminUser = {
      id: 999,
      email: 'admin@breadmilk.com',
      username: 'admin',
      firstname: 'Admin',
      lastname: 'User',
      role: 'Admin',
      status: 'Active'
    };
    
    localStorage.setItem('user', JSON.stringify(adminUser));
    
    console.log('✅ AdminDashboard: Set admin privileges');
  }

  render() {
    return <UserDashboard />;
  }
}
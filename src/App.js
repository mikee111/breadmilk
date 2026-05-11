import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Features from './components/Features';
import About from './components/About';
import HomeBelowProducts from './components/HomeBelowProducts';
import Login from './components/Login';
import UserDashboard from './components/UserDashboard';
import UserDashboardSimple from './components/UserDashboardSimple';
import AdminDashboard from './components/AdminDashboard';
import AddNewItemPage from './components/AddNewItemPage';
import AddItemFormPage from './components/AddItemFormPage'; // create this file if not existing
import FeaturedProductsCarousel from './components/FeaturedProductsCarousel';
import './styles/style.css';

// Protected Route Component for Admin Routes - More lenient
const AdminRoute = ({ children }) => {
  const user = localStorage.getItem('user');
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // For admin routes, we'll handle role checking inside components
  return children;
};

// Protected Route Component for User Routes
const UserRoute = ({ children }) => {
  const user = localStorage.getItem('user');
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/" 
            element={
              <>
                <Header showHero={false} />
                <FeaturedProductsCarousel />
                <Features />
                <HomeBelowProducts />
              </>
            } 
          />
          <Route
            path="/about"
            element={
              <>
                <Header showHero={false} />
                <About />
              </>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Navigate to="/login" replace />} />
          <Route path="/dashboard" element={
            <UserRoute>
              <UserDashboard />
            </UserRoute>
          } />
          <Route path="/admin-dashboard" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          <Route path="/user-dashboard" element={
            <UserRoute>
              <UserDashboardSimple />
            </UserRoute>
          } />
          <Route path="/add-item" element={
            <AdminRoute>
              <AddNewItemPage />
            </AdminRoute>
          } />
          <Route path="/add-item-form" element={
            <AdminRoute>
              <AddItemFormPage />
            </AdminRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

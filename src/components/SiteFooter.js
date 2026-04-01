import React from 'react';

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-grid">
          <div className="site-footer-column">
            <h4>Navigation</h4>
            <a href="/">Home</a>
            <a href="/about">About</a>
            <a href="/#products">Products</a>
          </div>
          <div className="site-footer-column">
            <h4>Contact Details</h4>
            <p>Customer Hotline: +63 99911436</p>
            <p>support@breadmilk.com.ph</p>
          </div>
          <div className="site-footer-column">
            <h4>Inventory Support</h4>
            <p>View inventory dashboard and monitor stock levels in real time.</p>
            <a href="/login">Open Dashboard</a>
          </div>
          <div className="site-footer-brand">
            <div className="site-footer-logo">
              <span className="about-brand-bread">Bread</span>
              <span className="about-brand-talk">Milk</span>
            </div>
            <p>Copyright © 2026 BreadMilk Inventory</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;

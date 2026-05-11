import React from 'react';
import '../styles/homepage.css';

function HomePage() {
  return (
    <div className="homepage">
      <header className="homepage-header">
        <div className="logo-title">
          <span className="logo-text">Bread</span>
          <span className="logo-highlight">Milk</span>
        </div>
        <nav>
          <ul className="nav-links">
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#products">Products</a></li>
            <li><a href="#signup">Sign up</a></li>
          </ul>
        </nav>
      </header>
      <div className="banner">
        <img
          src="https://breadtalkindia.files.wordpress.com/2018/10/breadtalk.jpg"
          alt="BreadTalk Store"
        />
      </div>
      <section className="features">
        <h2>
          <span className="features-highlight">FEATURES</span> Products
        </h2>
        <div className="product-images-landscape">
          <img src="https://www.breadtalk.com.ph/wp-content/uploads/2022/09/Pork-Floss.png" alt="Pork Floss" />
          <img src="https://www.breadtalk.com.ph/wp-content/uploads/2022/09/Golden-Lava-Croissant.png" alt="Golden Lava Croissant" />
          <img src="https://www.breadtalk.com.ph/wp-content/uploads/2022/09/Spring-in-the-City.png" alt="Spring in the City" />
          <img src="https://www.breadtalk.com.ph/wp-content/uploads/2022/09/Cheese-Sausage.png" alt="Cheese Sausage" />
        </div>
      </section>
    </div>
  );
}

export default HomePage;

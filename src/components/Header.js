import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function Header({ showHero = true }) {
  const navigate = useNavigate();
  const location = useLocation();
  const slides = [
    {
      src: 'https://breadtalkindia.files.wordpress.com/2018/10/breadtalk.jpg',
      alt: 'BreadMilk Banner'
    },
    {
      src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMHwwSXMXIhp0oYLVtMTPvnAhMMgNndprq1g&s',
      alt: 'BreadMilk Product Banner'
    },
    {
      src: 'https://cdn.ordermo.ph/photos/resto/yah8WQ73/menu/tr5wnogc-8BR8duHM.jpg',
      alt: 'BreadMilk Cake Banner'
    },
    {
      src: 'https://img.freepik.com/premium-photo/croissant-with-chocolate-nutty_1339-177402.jpg',
      alt: 'BreadMilk Croissant Banner'
    },
    {
      src: 'https://i5.samsclubimages.com/asr/6fe70abd-7006-4280-8d03-566e521e77f8.b8337e61af7afbd1da9627a119697615.jpeg',
      alt: 'BreadMilk Pastry Banner'
    }
  ];
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (!showHero) {
      return undefined;
    }

    const intervalId = setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 4000);

    return () => {
      clearInterval(intervalId);
    };
  }, [showHero, slides.length]);

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleAboutClick = () => {
    navigate('/about');
  };

  const handleProductsClick = () => {
    navigate('/#products');
  };

  const showPreviousSlide = () => {
    setActiveSlide((current) => (current - 1 + slides.length) % slides.length);
  };

  const showNextSlide = () => {
    setActiveSlide((current) => (current + 1) % slides.length);
  };

  return (
    <header id="home" className="header">
      <div className="header-top">
        <button type="button" className="logo logo-btn" onClick={handleHomeClick}>
          <span className="logo-bread">Bread</span>
          <span className="logo-talk">Talk</span>
        </button>
        <nav className="top-nav">
          <ul>
            <li><button type="button" className={location.pathname === '/' ? 'active' : ''} onClick={handleHomeClick}>Home</button></li>
            <li><button type="button" className={location.pathname === '/about' ? 'active' : ''} onClick={handleAboutClick}>About</button></li>
            <li><button type="button" onClick={handleProductsClick}>Products</button></li>
            <li><button type="button" className={location.pathname === '/login' ? 'active' : ''} onClick={handleLoginClick}>Login</button></li>
          </ul>
        </nav>
      </div>
      {showHero && (
        <div className="hero-banner">
          <img
            src={slides[activeSlide].src}
            alt={slides[activeSlide].alt}
            className="header-banner"
          />
          <button type="button" className="hero-arrow left" onClick={showPreviousSlide} aria-label="Previous slide">
            ‹
          </button>
          <button type="button" className="hero-arrow right" onClick={showNextSlide} aria-label="Next slide">
            ›
          </button>
          <div className="hero-overlay" />
          <div className="hero-dots">
            {slides.map((slide, index) => (
              <button
                key={slide.src}
                type="button"
                className={index === activeSlide ? 'active' : ''}
                onClick={() => setActiveSlide(index)}
                aria-label={`Show slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;

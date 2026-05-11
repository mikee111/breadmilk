import React from 'react';
import '../styles/homepage.css';

function Features() {
  const productImages = [
    '/assets/product-1.png',
    '/assets/product-2.png',
    '/assets/product-3.png',
    '/assets/product-4.png',
    '/assets/product-5.png',
    '/assets/product-6.png',
    '/assets/product-7.png',
    '/assets/product-8.png',
    '/assets/product-9.png',
    '/assets/product-10.png'
  ];

  return (
    <section id="products" className="features">
      <div className="product-images-landscape">
        {productImages.map((src, index) => (
          <img key={src} src={src} alt={`Product ${index + 1}`} />
        ))}
      </div>
    </section>
  );
}

export default Features;

import React, { useEffect, useMemo, useState } from 'react';

function FeaturedProductsCarousel() {
  const productImages = useMemo(
    () => [
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
    ],
    []
  );

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setActiveIndex((i) => (i + 1) % productImages.length);
    }, 4000);

    return () => clearInterval(intervalId);
  }, [productImages.length]);

  const mainSrc = productImages[activeIndex];
  const leftSrc = productImages[(activeIndex - 1 + productImages.length) % productImages.length];
  const rightSrc = productImages[(activeIndex + 1) % productImages.length];

  return (
    <section className="featured-carousel-section" aria-label="Featured products carousel">
      <div className="featured-carousel">
        <button
          type="button"
          className="featured-arrow left"
          onClick={() =>
            setActiveIndex((i) => (i - 1 + productImages.length) % productImages.length)
          }
          aria-label="Previous featured product"
        >
          ‹
        </button>

        <div className="featured-side">
          <img src={leftSrc} alt="Featured product left" />
        </div>

        <div className="featured-main">
          <div className="featured-kicker">FEATURED PRODUCTS</div>

          <h3 className="featured-title">
            BUTTER
            <br />
            SUGAR
          </h3>

          <div className="featured-main-image-wrap">
            <img className="featured-main-image" src={mainSrc} alt="Featured product" />
          </div>

          <div className="featured-dots" aria-label="Select featured slide">
            {productImages.map((src, index) => (
              <button
                key={src}
                type="button"
                className={index === activeIndex ? 'active' : ''}
                onClick={() => setActiveIndex(index)}
                aria-label={`Show slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="featured-side">
          <img src={rightSrc} alt="Featured product right" />
        </div>

        <button
          type="button"
          className="featured-arrow right"
          onClick={() => setActiveIndex((i) => (i + 1) % productImages.length)}
          aria-label="Next featured product"
        >
          ›
        </button>
      </div>
    </section>
  );
}

export default FeaturedProductsCarousel;

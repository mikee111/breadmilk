import React from 'react';
import SiteFooter from './SiteFooter';

function About() {
  return (
    <section id="about" className="about">
      <div className="about-card">
        <div className="about-brand-row">
          <div className="about-brand">
            <span className="about-brand-bread">Bread</span>
            <span className="about-brand-talk">Milk</span>
          </div>
          <div className="about-intro">
            <p>
              A staple in the daily lives of many in Asia, BreadMilk honors the art of bread-making by giving life to inspired creations.
            </p>
            <p>
              Through creativity and innovation, BreadMilk continues to grow as a beloved bakery brand, bringing modern flavor and artisan quality to every store.
            </p>
          </div>
        </div>
        <h3>A Brand New Experience Unrolls....</h3>
        <p className="about-description">
          BreadMilk&apos;s concept is built to immerse customers in a unique experience that celebrates natural goodness and the bliss of fresh-tasting breads. From sweet to savory, each branch features a curated repertoire of signature favorites crafted for everyday moments.
        </p>
        <div className="about-continuation">
          <img src="/mahal.jpg" alt="BreadMilk About Banner" />
        </div>
        <div className="about-gallery-section">
          <h3>The BreadMilk blueprint of constant innovation and reinvention</h3>
          <p>
            Incorporating natural ingredients, baking artistry and modern technology, this concept reflects BreadMilk&apos;s answer to the global call for more natural food options.
          </p>
          <div className="about-gallery-grid">
            <div className="about-gallery-item">
              <img src="/baker-with-bread-just-out-of-the-oven-photo.jpg" alt="BreadMilk baking process one" />
              <h4>Choicest Natural Ingredients</h4>
              <p>Sourcing globally to handpick and select premium natural ingredients for balanced flavor and reliable quality in every batch.</p>
            </div>
            <div className="about-gallery-item">
              <img src="/tasty-and-fresh-bakers-hands-in-working-gloves-taking-out-freshly-baked-bread-from-the-oven-at-the-kitchen-bakery-concept-T0189J.jpg" alt="BreadMilk baking process two" />
              <h4>Craftsmanship</h4>
              <p>Focused on creating perfect harmony among textures and flavors, each recipe reflects the master baker&apos;s careful technique.</p>
            </div>
            <div className="about-gallery-item">
              <img src="/istockphoto-673400318-612x612.jpg" alt="BreadMilk baking process three" />
              <h4>Wholesome Goodness</h4>
              <p>Every bite is made to bring comfort and joy while meeting the evolving tastes of today&apos;s bread and pastry lovers.</p>
            </div>
          </div>
        </div>
        <div className="about-footer">
          <SiteFooter />
        </div>
      </div>
    </section>
  );
}

export default About;

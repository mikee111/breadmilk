import React from 'react';
import '../styles/homepage.css';

function Features() {
  return (
    <>
      <section id="products" className="features">
        <h2>
          <span className="features-highlight">FEATURES</span> Products
        </h2>
        <div className="product-images-landscape">
          <img src="/assets/product-1.png" alt="Featured product 1" />
          <img src="/assets/product-2.png" alt="Featured product 2" />
          <img src="/assets/product-3.png" alt="Featured product 3" />
          <img src="/assets/product-4.png" alt="Featured product 4" />
          <img src="/assets/product-5.png" alt="Featured product 5" />
          <img src="/assets/product-6.png" alt="Featured product 6" />
          <img src="/assets/product-7.png" alt="Featured product 7" />
          <img src="/assets/product-8.png" alt="Featured product 8" />
          <img src="/assets/product-9.png" alt="Featured product 9" />
          <img src="/assets/product-10.png" alt="Featured product 10" />
        </div>
      </section>
      <section className="story-row">
        <div className="story-col">
          <h2 className="story-title">Our Story</h2>
          <p className="story-text">
            Milk Bakeshop, a homegrown Singaporean lifestyle bakery brand, has captured hearts locally and internationally with its creative twist on everyday baked goods. Since its debut in 2000, Milk Bakeshop has transformed the bakery scene with signature creations like the Cloud Puff Bun, which first catapulted the brand into the public eye. With an emphasis on quality, innovation, and design, the brand continues to deliver delightful products and a distinct shopping experience.
            <br />
            <br />
            Championing a boutique bakery concept, every Milk Bakeshop outlet offers more than just bread—it offers a story in every bite. From a baker’s inspiration to cultural movements and trending flavors, Milk Bakeshop’s creations like Cheddar Quake, Soy Good, and Tiger Stripes & Maple turn imaginative ideas into flavorful realities. The brand’s youthful vibe, minimalist interiors, and see-through kitchen concept provide a fresh, fun, and elevated bakery visit.
            <br />
            <br />
            Over its twelve years of operations in Singapore, Milk Bakeshop has earned accolades such as Singapore’s Most Promising Brand, Most Popular Brand, and Most Distinctive Brand. At the prestigious Singapore Prestige Brand Award (SPBA) in December 2011, Milk Bakeshop emerged as the Overall Category Winner for Most Popular Regional Brand, a title also awarded by consumer votes. Now with nearly 400 stores across Singapore, China, Indonesia, Kuwait, Bahrain, Oman, Hong Kong, India, Thailand, South Korea, Vietnam, and the Philippines, Milk Bakeshop continues to spread its love for innovative baking around the globe.
          </p>
        </div>
        <div className="story-col story-image-col">
          <img
            src="https://pngimg.com/uploads/bread/bread_PNG2219.png"
            alt="Bread logo"
            className="story-image"
          />
        </div>
      </section>
    </>
  );
}

export default Features;

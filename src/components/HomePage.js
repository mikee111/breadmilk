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
      <section className="story-row">
        <div className="story-col">
          <h2 className="story-title">Our Story</h2>
          <p className="story-text">
            Milk Bakeshop, a homegrown Singaporean lifestyle bakery brand, has captured hearts locally and internationally with its creative twist on everyday baked goods. Since its debut in 2000, Milk Bakeshop has transformed the bakery scene with signature creations like the Cloud Puff Bun, which first catapulted the brand into the public eye. With an emphasis on quality, innovation, and design, the brand continues to deliver delightful products and a distinct shopping experience.<br /><br />
            Championing a boutique bakery concept, every Milk Bakeshop outlet offers more than just bread—it offers a story in every bite. From a baker’s inspiration to cultural movements and trending flavors, Milk Bakeshop’s creations like Cheddar Quake, Soy Good, and Tiger Stripes & Maple turn imaginative ideas into flavorful realities. The brand’s youthful vibe, minimalist interiors, and see-through kitchen concept provide a fresh, fun, and elevated bakery visit.<br /><br />
            Over its twelve years of operations in Singapore, Milk Bakeshop has earned accolades such as Singapore’s Most Promising Brand, Most Popular Brand, and Most Distinctive Brand. At the prestigious Singapore Prestige Brand Award (SPBA) in December 2011, Milk Bakeshop emerged as the Overall Category Winner for Most Popular Regional Brand, a title also awarded by consumer votes. Now with nearly 400 stores across Singapore, China, Indonesia, Kuwait, Bahrain, Oman, Hong Kong, India, Thailand, South Korea, Vietnam, and the Philippines, Milk Bakeshop continues to spread its love for innovative baking around the globe.
          </p>
        </div>
        <div className="story-col story-image-col">
          <img
            src="https://pngimg.com/uploads/bread/bread_PNG2219.png"
            alt="Bread Milk Logo"
            className="story-image"
          />
        </div>
      </section>
    </div>
  );
}

export default HomePage;

import React from 'react';
import { Link } from 'react-router-dom';
import SiteFooter from './SiteFooter';

function HomeBelowProducts() {
  return (
    <>
      <section className="home-our-story" aria-labelledby="home-our-story-heading">
        <div className="home-our-story-inner">
          <div className="home-our-story-panel">
            <div className="home-our-story-grid">
              <div className="home-our-story-text-column">
                <h2 id="home-our-story-heading" className="home-our-story-title">
                  <span className="home-our-story-title-accent">OUR</span>{' '}
                  <span className="home-our-story-title-rest">STORY</span>
                </h2>
                <div className="home-our-story-text">
                  <p>
                    BreadTalk, a Singaporean lifestyle brand that has gained international appeal, is widely credited for taking the bread and bakery industry to new heights. Its introduction of the Flosss® bun propelled the brand into consumers&apos; minds and since opening in 2000, BreadTalk has continued to churn out exciting products and offer a unique shopping experience for its customers.
                  </p>
                  <p>
                    Emphasizing its boutique bakery concept, each BreadTalk store is literally a bread shopping haven where each product tells a story. Be it a chef&apos;s or baker&apos;s own inspiration, the workings of politics or society&apos;s trends, BreadTalk&apos;s &apos;Earthquake Cheese&apos;, &apos;Mr. Beans&apos;, &apos;Crouching Tiger, Hidden Bacon&apos; are just some of the breads that have brought real stories to life.
                  </p>
                  <p>
                    Over its twelve years of operations in Singapore, BreadTalk has been recognized as Singapore&apos;s Most Promising Brand, Most Popular Brand and Most Distinctive Brand. Most recently, in the Singapore Prestige Brand Award (SPBA) held in December 2011, BreadTalk was judged Overall Category Winner for Most Popular Regional Brand and was also voted Most Popular Regional Brand by consumers. The brand has taken its success around the world, now having nearly 400 stores in Singapore, China (Shanghai, Beijing, Shenzhen, Hangzhou, Chengdu and Chongqing), Indonesia, Kuwait, Bahrain, Oman, Hong Kong, India, Thailand, South Korea, Vietnam, and the Philippines.
                  </p>
                </div>
                <Link to="/about" className="home-our-story-cta">
                  View Our Story
                </Link>
              </div>
              <div className="home-our-story-media">
                <img
                  src="/mahal.jpg"
                  alt="Our story feature"
                  className="home-our-story-media-image"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}

export default HomeBelowProducts;

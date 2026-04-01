import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SiteFooter from './SiteFooter';

const continuationSlides = [
  {
    body:
      'BreadTalk has judged overall category winner for Most Popular Regional Brand and was also voted Most Popular Regional Brand by consumers. The brand has taken its success around the world, now having nearly 400 stores in Singapore, China (Shanghai, Beijing, Shenzhen, Hangzhou, Chengdu and Chongqing), Indonesia, Kuwait, Bahrain, Oman, Hong Kong, India, Thailand, South Korea, Vietnam, and the Philippines.'
  },
  {
    body:
      "Over its twelve years of operations in Singapore, BreadTalk has been recognized as Singapore's Most Promising Brand, Most Popular Brand and Most Distinctive Brand. Each BreadTalk store continues to tell a story through joyful names, creative bakes, and a welcoming open-kitchen experience."
  }
];

function HomeBelowProducts() {
  const [contIndex, setContIndex] = useState(0);

  return (
    <>
      <section className="home-our-story" aria-labelledby="home-our-story-heading">
        <div className="home-our-story-inner">
          <span className="home-our-story-pin" aria-hidden="true" />
          <h2 id="home-our-story-heading" className="home-our-story-title">
            <span className="home-our-story-title-accent">OUR</span>{' '}
            <span className="home-our-story-title-rest">STORY</span>
          </h2>
          <div className="home-our-story-grid">
            <div className="home-our-story-text">
              <p>
                BreadTalk, a Singaporean lifestyle brand that has gained international appeal, is widely credited for taking the bread and bakery industry to new heights. Its introduction of the Flosss® bun propelled the brand into consumers&apos; minds and since opening in 2000, BreadTalk has continued to churn out exciting products and offer a unique shopping experience for its customers.
              </p>
              <p>
                Emphasizing its boutique bakery concept, each BreadTalk store is literally a bread shopping haven where each product tells a story. Be it a chef&apos;s or baker&apos;s own inspiration, the workings of politics or society&apos;s trends, BreadTalk&apos;s &apos;Earthquake Cheese&apos;, &apos;Mr. Beans&apos;, &apos;Crouching Tiger, Hidden Bacon&apos; are just some of the breads that have brought real stories to life. Youthful names and designs, the store&apos;s clean lines, and BreadTalk&apos;s open kitchen all come together for a fun and sophisticated experience.
              </p>
              <p>
                Over its twelve years of operations in Singapore, BreadTalk has been recognized as Singapore&apos;s Most Promising Brand, Most Popular Brand and Most Distinctive Brand, building trust with fans across the region.
              </p>
            </div>
            <div className="home-our-story-media">
              <div className="home-our-story-video-wrap">
                <img
                  src="/assets/product-8.png"
                  alt="BreadTalk store and products"
                  className="home-our-story-video-thumb"
                />
                <a
                  href="/about"
                  className="home-our-story-play"
                  aria-label="View our story (about page)"
                >
                  <span className="home-our-story-play-icon" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-story-continuation" aria-label="Story continuation">
        <div className="home-story-continuation-bar home-story-continuation-bar--top" />
        <div className="home-story-continuation-body">
          <span className="home-story-continuation-decor home-story-continuation-decor--left" aria-hidden="true" />
          <div className="home-story-continuation-content">
            <p className="home-story-continuation-text">{continuationSlides[contIndex].body}</p>
            <Link to="/about" className="home-story-continuation-cta">
              View Our Story
            </Link>
          </div>
          <span className="home-story-continuation-decor home-story-continuation-decor--right" aria-hidden="true" />
        </div>
        <div className="home-story-continuation-bar home-story-continuation-bar--bottom">
          <div className="home-story-continuation-nav home-story-continuation-nav--bar">
            <button
              type="button"
              className="home-story-continuation-arrow home-story-continuation-arrow--light"
              onClick={() =>
                setContIndex((i) => (i - 1 + continuationSlides.length) % continuationSlides.length)
              }
              aria-label="Previous story panel"
            >
              ‹
            </button>
            <button
              type="button"
              className="home-story-continuation-arrow home-story-continuation-arrow--light"
              onClick={() => setContIndex((i) => (i + 1) % continuationSlides.length)}
              aria-label="Next story panel"
            >
              ›
            </button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}

export default HomeBelowProducts;

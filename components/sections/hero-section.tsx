"use client";

export function HeroSection() {
  return (
    <section className="section cam-view-1">
      <div className="hero--container">
        <div className="hero--content">
          <h2>Always shoot like a</h2>
          <h1>Pro</h1>
          <p>
            Discover our most advanced camera and lens series yet: blazing fast
            AF, incredible low light performance, superb image stabilization,
            sharp image quality, and so much more.
          </p>
          <button tabIndex={-1} className="button button-know-more">
            Know more
          </button>
        </div>
      </div>

      <div className="hero--scroller--container">
        <div className="hero--scroller">
          <p className="hero--scroller--text">Start scrolling to explore</p>
          <svg
            className="bounce"
            width="36"
            height="36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 33a15 15 0 1 0 0-30 15 15 0 0 0 0 30Z"
              stroke="#929292"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="m12 18 6 6 6-6M18 12v12"
              stroke="#929292"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      <div className="performance--container">
        <div className="performance--content">
          <h2>Outstanding</h2>
          <h1>Performance</h1>
          <p>
            The EOS R10 is perfect for content creators looking to take their
            creativity to the next level. Featuring a high-speed shooting 15 FPS
            mechanical shutter, a 24.2 Megapixel CMOS (APS-C) sensor, and
            lightning fast autofocus, the EOS R10 camera brings some of the best
            features from the growing EOS R Series to a sleek, lightweight
            design.
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/images/performance_video.jpg" alt="Performance" />
          <svg
            width="194"
            height="26"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="m48 17-2.6-9.8h1.2l2.1 8.4 2.4-8.4h1.3l2.4 8.4 2.1-8.4h1.3L55.4 17h-1.3l-2.3-8-2.4 8H48Zm11 0V7H60v4.2l1-1c.4-.2 1-.3 1.4-.3.8 0 1.5.2 2 .7.4.5.7 1.3.7 2.3V17H64v-4c0-1.4-.6-2.1-1.7-2.1a2 2 0 0 0-1.6.7c-.4.4-.6 1-.6 1.8V17H59Z"
              fill="#181818"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}

"use client";

import Image from "next/image";

export function PowerSection() {
  return (
    <section className="section cam-view-3">
      <div className="power--container">
        <div className="power--content">
          <h2>Features that bring you</h2>
          <h1>Power</h1>
          <p>
            The easy-to-carry EOS R10 packs advanced features into a
            lightweight, compact design. Pair with a Canon RF-S/RF lens for a
            high-performance setup that fits easily and comfortably in your
            hand.
          </p>
          <svg
            className="power--img"
            width="585"
            height="316"
            viewBox="0 0 585 316"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              opacity="0.02"
              fillRule="evenodd"
              clipRule="evenodd"
              d="M-28 310.832V0H88.0215C112.581 0 133.286 4.09558 149.9 12.5683C166.408 20.987 178.89 32.6688 187.126 47.6425C195.279 62.4644 199.314 79.0446 199.314 97.2754C199.314 114.657 195.417 130.776 187.591 145.551L187.582 145.569L187.572 145.587C179.63 160.275 167.313 172.079 150.878 181.059L150.849 181.075L150.819 181.09C134.176 189.881 113.154 194.12 88.0215 194.12H36.3754V310.832H-28Z"
              fill="#181818"
            />
          </svg>
        </div>
        <div className="power--features--img">
          <Image
            src="/assets/images/power_features.png"
            alt="Power Features"
            width={194}
            height={316}
            style={{ width: "auto", height: "auto" }}
          />
        </div>
      </div>
    </section>
  );
}

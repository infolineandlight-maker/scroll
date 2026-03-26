"use client";

import Image from "next/image";

export function Header() {
  return (
    <header className="header">
      <div className="header--container">
        <Image
          className="header--brand"
          src="/assets/images/logo.png"
          alt="Canon Logo"
          width={140}
          height={56}
          priority
          style={{ width: "auto", height: "auto" }}
        />
        <ul className="header--menu">
          <li>Features</li>
          <li>Experience it</li>
          <li>Buy now</li>
        </ul>
      </div>
    </header>
  );
}

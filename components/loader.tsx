"use client";

import Image from "next/image";

export function Loader() {
  return (
    <div className="loader">
      <Image
        src="/assets/images/logo.png"
        alt="Canon Logo"
        width={80}
        height={32}
        priority
      />
      <p>Loading... Please wait</p>
      <div className="progress" />
    </div>
  );
}

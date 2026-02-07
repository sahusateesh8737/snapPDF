"use client";

import React from "react";

export function DottedGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* Dot Pattern */}
      <div 
        className="absolute inset-0 h-full w-full bg-[radial-gradient(#ffffff40_1px,transparent_1px)] [background-size:24px_24px]"
      />
      
      {/* Radial fade mask to center attention */}
      <div className="absolute inset-0 bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      
      {/* Colorful Accent Blobs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[120px] mix-blend-screen" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] mix-blend-screen" />
    </div>
  );
}

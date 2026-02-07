"use client";

import React from "react";

export function IsometricGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      {/* 3D Perspective Grid */}
      <div 
        className="absolute w-[200%] h-[200%] -left-[50%] -top-[50%]"
        style={{
          transform: "perspective(1000px) rotateX(60deg) scale(1.5)",
          backgroundSize: "80px 80px",
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.2) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.2) 1px, transparent 1px)
          `,
          maskImage: "linear-gradient(to bottom, transparent, black 15%, black 60%, transparent 90%)"
        }}
      />
      
      {/* Accent Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-[100px] mix-blend-screen animate-pulse" />
      <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] mix-blend-screen" />
    </div>
  );
}

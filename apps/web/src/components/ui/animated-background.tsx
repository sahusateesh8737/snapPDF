"use client";

import { motion } from "framer-motion";

export const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Base moving gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-indigo-50/50 to-purple-50/50 animate-gradient-shift background-size-200" />
      
      <motion.div 
        className="absolute top-0 -left-20 w-[600px] h-[600px] bg-indigo-400/40 mix-blend-multiply filter blur-[96px] opacity-50 rounded-full"
        animate={{
          x: [0, 100, -50, 0],
          y: [0, 50, -100, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="absolute top-0 -right-20 w-[500px] h-[500px] bg-sky-400/40 mix-blend-multiply filter blur-[96px] opacity-50 rounded-full" 
        animate={{
          x: [0, -70, 30, 0],
          y: [0, 100, -50, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
          delay: 2
        }}
      />
      <motion.div 
        className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-400/40 mix-blend-multiply filter blur-[96px] opacity-50 rounded-full" 
        animate={{
          x: ["-50%", "-40%", "-60%", "-50%"], // Maintain centering roughly
          y: [0, -100, 50, 0],
          scale: [1, 1.3, 0.8, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
          delay: 1
        }}
      />
      <motion.div 
        className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-pink-400/30 mix-blend-multiply filter blur-[96px] opacity-40 rounded-full" 
        animate={{
          x: [0, -50, 50, 0],
          y: [0, -80, 20, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }}
      />
    </div>
  );
};

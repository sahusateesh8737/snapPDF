"use client";

import { motion } from "framer-motion";

export const MaskReveal = () => {
  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black flex items-center justify-center pointer-events-none"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: 1.2, duration: 0.5, ease: "easeInOut" }}
    >
      <motion.div
        initial={{ scale: 0, rotate: 0 }}
        animate={{ 
          scale: [0, 1, 1, 150], 
          rotate: [0, 45, 45, 45] 
        }}
        transition={{
          duration: 1.5,
          times: [0, 0.4, 0.8, 1.5],
          ease: "easeInOut"
        }}
        className="text-white"
      >
        <svg
          width="100"
          height="100"
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
        </svg>
      </motion.div>
    </motion.div>
  );
};

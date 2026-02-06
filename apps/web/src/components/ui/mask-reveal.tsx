"use client";

import { motion } from "framer-motion";

export const MaskReveal = () => {
  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black flex items-center justify-center pointer-events-none"
      initial={{ y: 0 }}
      animate={{ y: "-100%" }}
      transition={{
        duration: 0.8,
        ease: [0.76, 0, 0.24, 1], // Custom easing for smooth "reveal" feel
        delay: 0.5
      }}
    >
      {/* Optional: Add Logo or Loader here if desired, otherwise just a clean wipe */}
    </motion.div>
  );
};

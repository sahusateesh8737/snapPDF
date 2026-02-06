export const MaskReveal = () => {
  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black flex items-center justify-center pointer-events-none"
      initial={{ y: 0 }}
      animate={{ y: "-100%" }}
      transition={{
        duration: 0.8,
        ease: [0.76, 0, 0.24, 1],
        delay: 2.2 // Wait for star animation to finish + small pause
      }}
    >
      <motion.div
        initial={{ scale: 0, rotate: 0, opacity: 0 }}
        animate={{ 
          scale: [0, 1, 1.5, 1], // Pulse effect
          rotate: [0, 90, 90, 180],
          opacity: [0, 1, 1, 0] // Fade out star before slide up
        }}
        transition={{
          duration: 2,
          times: [0, 0.4, 0.7, 1],
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

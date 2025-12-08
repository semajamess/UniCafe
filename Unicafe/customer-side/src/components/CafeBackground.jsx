import { motion } from "framer-motion";

const CafeBackground = () => {
  // Generate coffee beans
  const coffeeElements = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    emoji: i % 5 === 0 ? "☕" : i % 5 === 1 ? "🥐" : i % 5 === 2 ? "🍰" : i % 5 === 3 ? "🧁" : "🍪",
    x: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 15 + Math.random() * 10,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Floating cafe items */}
      {coffeeElements.map((item) => (
        <motion.div
          key={item.id}
          className="absolute text-6xl opacity-10"
          style={{
            left: `${item.x}%`,
            top: "-10%",
          }}
          animate={{
            y: ["0vh", "110vh"],
            rotate: [0, 360],
            opacity: [0, 0.1, 0.1, 0],
          }}
          transition={{
            duration: item.duration,
            repeat: Infinity,
            delay: item.delay,
            ease: "linear",
          }}
        >
          {item.emoji}
        </motion.div>
      ))}

      {/* Steam effect */}
      <motion.div
        className="absolute bottom-10 left-1/4 text-8xl opacity-5"
        animate={{
          y: [0, -50, -100],
          opacity: [0.05, 0.02, 0],
          scale: [1, 1.2, 1.4],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeOut",
        }}
      >
        ☕
      </motion.div>

      <motion.div
        className="absolute bottom-10 right-1/4 text-8xl opacity-5"
        animate={{
          y: [0, -50, -100],
          opacity: [0.05, 0.02, 0],
          scale: [1, 1.2, 1.4],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          delay: 2,
          ease: "easeOut",
        }}
      >
        ☕
      </motion.div>

      {/* Sparkles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className="absolute w-3 h-3 bg-amber-400 rounded-full"
          style={{
            left: `${(i * 12.5 + 10) % 100}%`,
            top: `${(i * 15 + 20) % 80}%`,
          }}
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.3,
          }}
        />
      ))}
    </div>
  );
};

export default CafeBackground;

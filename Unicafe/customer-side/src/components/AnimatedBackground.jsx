import { motion } from 'framer-motion'
import { Coffee } from 'lucide-react'

export default function AnimatedBackground() {
  return (
    <>
      {/* Animated floating coffee cups background */}
      <motion.div
        animate={{ 
          y: [0, -30, 0],
          rotate: [0, 5, 0]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 right-10 opacity-10 pointer-events-none"
      >
        <Coffee className="w-40 h-40 text-primary-600" />
      </motion.div>
      
      <motion.div
        animate={{ 
          y: [0, -20, 0],
          rotate: [0, -5, 0]
        }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-32 left-20 opacity-10 pointer-events-none"
      >
        <Coffee className="w-32 h-32 text-primary-600" />
      </motion.div>
      
      <motion.div
        animate={{ 
          y: [0, -25, 0],
          rotate: [0, 3, 0]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-1/2 left-10 opacity-10 pointer-events-none"
      >
        <Coffee className="w-28 h-28 text-orange-600" />
      </motion.div>
      
      <motion.div
        animate={{ 
          y: [0, -15, 0],
          rotate: [0, -3, 0]
        }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute top-1/3 right-1/4 opacity-10 pointer-events-none"
      >
        <Coffee className="w-36 h-36 text-amber-600" />
      </motion.div>
    </>
  )
}

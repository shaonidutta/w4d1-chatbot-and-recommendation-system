import { motion } from 'framer-motion'

const SimpleBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100" />
      
      {/* Animated Shapes */}
      <div className="absolute inset-0">
        {/* Floating Circles */}
        <motion.div
          className="absolute top-20 left-20 w-32 h-32 bg-blue-200/20 rounded-full blur-xl"
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div
          className="absolute top-40 right-32 w-24 h-24 bg-purple-200/20 rounded-full blur-xl"
          animate={{
            y: [0, 15, 0],
            x: [0, -15, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        
        <motion.div
          className="absolute bottom-32 left-1/3 w-40 h-40 bg-indigo-200/15 rounded-full blur-xl"
          animate={{
            y: [0, -25, 0],
            x: [0, 20, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        
        <motion.div
          className="absolute bottom-20 right-20 w-28 h-28 bg-cyan-200/20 rounded-full blur-xl"
          animate={{
            y: [0, 10, 0],
            x: [0, -10, 0],
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3
          }}
        />
        
        {/* Geometric Shapes */}
        <motion.div
          className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-r from-blue-300/10 to-purple-300/10 transform rotate-45 blur-sm"
          animate={{
            rotate: [45, 135, 45],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        <motion.div
          className="absolute top-1/3 right-1/4 w-12 h-12 bg-gradient-to-r from-indigo-300/10 to-cyan-300/10 rounded-lg blur-sm"
          animate={{
            rotate: [0, 180, 360],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
      
      {/* Subtle Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />
    </div>
  )
}

export default SimpleBackground

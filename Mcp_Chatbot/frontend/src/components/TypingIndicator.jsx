import { motion } from 'framer-motion'
import { Bot } from 'lucide-react'

const TypingIndicator = () => {
  const dotVariants = {
    initial: { y: 0 },
    animate: { y: -10 },
  }

  const dotTransition = {
    duration: 0.5,
    repeat: Infinity,
    repeatType: "reverse",
    ease: "easeInOut"
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex justify-start mb-4"
    >
      <div className="flex items-start space-x-3 max-w-[85%]">
        {/* Avatar */}
        <motion.div 
          className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white flex items-center justify-center"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Bot className="w-4 h-4" />
        </motion.div>

        {/* Typing Bubble */}
        <motion.div
          className="chat-bubble chat-bubble-ai"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          <div className="flex items-center space-x-1">
            <span className="text-sm text-gray-600 mr-2">MCP Expert is thinking</span>
            <div className="flex space-x-1">
              <motion.div
                className="w-2 h-2 bg-blue-500 rounded-full"
                variants={dotVariants}
                initial="initial"
                animate="animate"
                transition={{ ...dotTransition, delay: 0 }}
              />
              <motion.div
                className="w-2 h-2 bg-blue-500 rounded-full"
                variants={dotVariants}
                initial="initial"
                animate="animate"
                transition={{ ...dotTransition, delay: 0.1 }}
              />
              <motion.div
                className="w-2 h-2 bg-blue-500 rounded-full"
                variants={dotVariants}
                initial="initial"
                animate="animate"
                transition={{ ...dotTransition, delay: 0.2 }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default TypingIndicator

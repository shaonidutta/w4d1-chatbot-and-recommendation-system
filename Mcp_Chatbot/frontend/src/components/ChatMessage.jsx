import { motion } from 'framer-motion'
import { Bot, User, Copy, ThumbsUp, ThumbsDown, ExternalLink } from 'lucide-react'
import { useState } from 'react'

const ChatMessage = ({ message }) => {
  const [copied, setCopied] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const isUser = message.type === 'user'
  const isAI = message.type === 'ai'

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const handleFeedback = (type) => {
    setFeedback(type)
    // TODO: Send feedback to backend
  }

  const messageVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 30
      }
    }
  }

  return (
    <motion.div
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 group`}
    >
      <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3 max-w-[85%]`}>
        {/* Avatar */}
        <motion.div 
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            isUser 
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
              : 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white'
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </motion.div>

        {/* Message Content */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          {/* Message Bubble */}
          <motion.div
            className={`chat-bubble ${isUser ? 'chat-bubble-user' : message.isError ? 'bg-red-50 border-red-200 text-red-800' : 'chat-bubble-ai'}`}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {message.content}
            </div>
            
            {/* Sources removed - internal knowledge base doesn't need to show sources to users */}

            {/* Token usage and technical details removed for cleaner user experience */}
          </motion.div>

          {/* Message Actions */}
          <div className={`flex items-center space-x-2 mt-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
            {/* Timestamp */}
            <span className="text-xs text-gray-400">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>

            {/* Action Buttons */}
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <motion.button
                onClick={handleCopy}
                className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                title="Copy message"
              >
                <Copy className="w-3 h-3" />
              </motion.button>

              {/* Feedback buttons for AI messages */}
              {isAI && (
                <>
                  <motion.button
                    onClick={() => handleFeedback('positive')}
                    className={`p-1 rounded-md transition-colors ${
                      feedback === 'positive' 
                        ? 'bg-green-100 text-green-600' 
                        : 'hover:bg-gray-100 text-gray-400 hover:text-green-500'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    title="Good response"
                  >
                    <ThumbsUp className="w-3 h-3" />
                  </motion.button>
                  
                  <motion.button
                    onClick={() => handleFeedback('negative')}
                    className={`p-1 rounded-md transition-colors ${
                      feedback === 'negative' 
                        ? 'bg-red-100 text-red-600' 
                        : 'hover:bg-gray-100 text-gray-400 hover:text-red-500'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    title="Poor response"
                  >
                    <ThumbsDown className="w-3 h-3" />
                  </motion.button>
                </>
              )}
            </div>
          </div>

          {/* Copy confirmation */}
          {copied && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-xs text-green-600 mt-1"
            >
              Copied to clipboard!
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default ChatMessage

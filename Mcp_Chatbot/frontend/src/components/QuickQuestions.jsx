import { motion } from 'framer-motion'

const QuickQuestions = ({ onQuestionClick }) => {
  const quickQuestions = [
    "What is MCP?",
    "How to create an MCP server?",
    "MCP connection issues",
    "MCP vs other protocols",
    "MCP tools and resources"
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-6 py-4"
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-wrap gap-3 justify-center">
          {quickQuestions.map((question, index) => (
            <motion.button
              key={index}
              onClick={() => onQuestionClick(question)}
              className="px-4 py-2.5 text-sm text-gray-700 hover:text-gray-900 bg-white/70 hover:bg-white/95 rounded-full border border-gray-200 hover:border-gray-300 transition-all duration-200 floating-button shadow-sm hover:shadow-md"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {question}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default QuickQuestions

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, Sparkles, MessageCircle, AlertCircle, History } from 'lucide-react'
import ChatMessage from './components/ChatMessage'
import TypingIndicator from './components/TypingIndicator'
import QuickQuestions from './components/QuickQuestions'
import SimpleBackground from './components/SimpleBackground'
import ChatHistory from './components/ChatHistory'

import { chatAPI } from './utils/api'

function App() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "Hello! I'm your MCP (Model Context Protocol) expert assistant. I can help you understand MCP concepts, implementation, troubleshooting, and best practices. What would you like to know?",
      timestamp: new Date(),
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const [error, setError] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Check backend connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        await chatAPI.getHealth()
        setIsConnected(true)
        setError(null)
      } catch (err) {
        setIsConnected(false)
        setError('Unable to connect to backend. Please ensure the API server is running.')
      }
    }

    checkConnection()
  }, [])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    }

    const currentInput = inputValue
    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)
    setError(null)

    try {
      // Call the actual API (backend will determine chat type automatically)
      const response = await chatAPI.sendMessage(currentInput)

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])
      setIsConnected(true)

    } catch (err) {
      console.error('Chat API Error:', err)
      setError(err.message)
      setIsConnected(false)

      // Add error message to chat
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: `I apologize, but I encountered an error: ${err.message}. Please check if the backend server is running and try again.`,
        timestamp: new Date(),
        isError: true
      }

      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleQuickQuestion = (question) => {
    setInputValue(question)
    inputRef.current?.focus()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background */}
      <SimpleBackground />

      {/* Main Chat Interface */}
      <div className="relative z-10 flex flex-col h-screen">
        {/* Header */}
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass-effect border-b border-white/20 p-4"
        >
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Bot className="w-8 h-8 text-blue-600" />
                <Sparkles className="w-4 h-4 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">MCP Expert Assistant</h1>
                <p className="text-sm text-gray-600">Model Context Protocol Specialist</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Chat History Button */}
              <motion.button
                onClick={() => setShowHistory(true)}
                className="p-2 bg-white/80 backdrop-blur-md rounded-lg shadow-md border border-gray-200 hover:bg-white/90 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <History className="w-4 h-4 text-gray-600" />
              </motion.button>

              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                <span className="text-xs text-gray-600">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Error Banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-50 border-l-4 border-red-500 p-4 mx-4 mt-2 rounded-lg"
          >
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700 text-sm">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-hidden flex">
          <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
              </AnimatePresence>

              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions - Above Input */}
            {messages.length <= 1 && (
              <QuickQuestions onQuestionClick={handleQuickQuestion} />
            )}

            {/* Input Area */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="p-4 glass-effect border-t border-white/20"
            >
              <div className="flex space-x-3">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about MCP..."
                    className="w-full px-4 py-3 pr-12 rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    rows="1"
                    style={{ minHeight: '48px', maxHeight: '120px' }}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isTyping}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed floating-button"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span>Press Enter to send, Shift+Enter for new line</span>
                <span className="flex items-center space-x-1">
                  <MessageCircle className="w-3 h-3" />
                  <span>MCP Expert Assistant</span>
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Chat History */}
      <ChatHistory
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        messages={messages}
        onLoadHistory={(session) => {
          console.log('Loading session:', session)
          // For now, just show an alert - you can implement actual loading later
          alert(`Loading session: ${session.title}`)
          setShowHistory(false)
        }}
        onClearHistory={() => {
          if (confirm('Are you sure you want to clear all chat history? This action cannot be undone.')) {
            // Clear current messages
            setMessages([{
              id: 1,
              type: 'ai',
              content: "Hello! I'm your MCP (Model Context Protocol) expert assistant. I can help you understand MCP concepts, implementation, troubleshooting, and best practices. What would you like to know?",
              timestamp: new Date(),
            }])
            alert('Chat history cleared!')
          }
        }}
      />


    </div>
  )
}

export default App

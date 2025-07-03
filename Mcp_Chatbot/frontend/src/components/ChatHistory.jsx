import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { History, Trash2, Download, Search } from 'lucide-react'

const ChatHistory = ({ isOpen, onClose, messages, onLoadHistory, onClearHistory }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredSessions, setFilteredSessions] = useState([])

  // Mock chat sessions - in real app, this would come from localStorage or API
  const [chatSessions] = useState([
    {
      id: 1,
      title: "MCP Basics Discussion",
      timestamp: new Date(Date.now() - 86400000), // 1 day ago
      messageCount: 8,
      preview: "What is MCP and how does it work?"
    },
    {
      id: 2,
      title: "Server Implementation Help",
      timestamp: new Date(Date.now() - 172800000), // 2 days ago
      messageCount: 12,
      preview: "How to create an MCP server?"
    },
    {
      id: 3,
      title: "Troubleshooting Connection Issues",
      timestamp: new Date(Date.now() - 259200000), // 3 days ago
      messageCount: 6,
      preview: "MCP server won't connect"
    }
  ])

  useEffect(() => {
    const filtered = chatSessions.filter(session =>
      session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.preview.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredSessions(filtered)
  }, [searchTerm, chatSessions])

  const handleExportChat = () => {
    const chatData = {
      timestamp: new Date().toISOString(),
      messages: messages,
      messageCount: messages.length
    }
    
    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mcp-chat-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <>
      {/* History Toggle Button - Integrated in Header */}

      {/* History Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
              onClick={onClose}
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: -400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -400, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 h-full w-80 bg-white/95 backdrop-blur-md border-r border-gray-200 shadow-xl z-40 flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Chat History</h2>
                  <button
                    onClick={onClose}
                    className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    ×
                  </button>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              {/* Sessions List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {filteredSessions.map((session) => (
                  <motion.div
                    key={session.id}
                    className="p-3 rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer transition-all duration-200 hover:shadow-md"
                    whileHover={{ scale: 1.02 }}
                    onClick={() => onLoadHistory && onLoadHistory(session)}
                  >
                    <h3 className="font-medium text-gray-800 text-sm mb-1">{session.title}</h3>
                    <p className="text-xs text-gray-500 mb-2">{session.preview}</p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{session.messageCount} messages</span>
                      <span>{session.timestamp.toLocaleDateString()}</span>
                    </div>
                  </motion.div>
                ))}

                {filteredSessions.length === 0 && (
                  <div className="text-center text-gray-500 text-sm py-8">
                    {searchTerm ? 'No matching conversations found' : 'No chat history yet'}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="p-4 border-t border-gray-200 space-y-2">
                <button
                  onClick={handleExportChat}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Current Chat</span>
                </button>
                
                <button
                  onClick={onClearHistory}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear All History</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default ChatHistory

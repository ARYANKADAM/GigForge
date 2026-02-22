'use client'
import { useState, useEffect, useRef } from 'react'
import { getSocket } from '@/lib/socket-client'
import { Send } from 'lucide-react'
import Link from 'next/link'

function formatTime(date) {
  return new Date(date).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

export default function ChatWindow({ roomId, currentUserId, initialMessages, otherUser }) {
  const [messages, setMessages] = useState(initialMessages || [])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [sending, setSending] = useState(false)
  const [mounted, setMounted] = useState(false)
  const bottomRef = useRef(null)
  const typingTimeout = useRef(null)
  const socket = useRef(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    socket.current = getSocket()
    socket.current.emit('join_room', roomId)

    socket.current.on('receive_message', (msg) => {
      setMessages(prev => {
        if (prev.some(m => m._id === msg._id)) return prev
        return [...prev, msg]
      })
    })

    socket.current.on('user_typing', ({ userId }) => {
      if (userId !== currentUserId) setIsTyping(true)
    })

    socket.current.on('user_stop_typing', ({ userId }) => {
      if (userId !== currentUserId) setIsTyping(false)
    })

    return () => {
      socket.current.emit('leave_room', roomId)
      socket.current.off('receive_message')
      socket.current.off('user_typing')
      socket.current.off('user_stop_typing')
    }
  }, [roomId, currentUserId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleInputChange(e) {
    setInput(e.target.value)
    socket.current?.emit('typing_start', { roomId, userId: currentUserId })
    clearTimeout(typingTimeout.current)
    typingTimeout.current = setTimeout(() => {
      socket.current?.emit('typing_stop', { roomId, userId: currentUserId })
    }, 1500)
  }

  async function sendMessage(e) {
    e.preventDefault()
    if (!input.trim() || sending) return
    setSending(true)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, content: input.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      // Add locally for sender (deduplicated)
      setMessages(prev => {
        if (prev.some(m => m._id === data._id)) return prev
        return [...prev, data]
      })

      // Emit to socket for the other person
      socket.current?.emit('send_message', { ...data, roomId })
      setInput('')
    } catch (err) {
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-xl border border-slate-200 overflow-hidden">
    {/* Header */}
<div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-white">
  <Link href={`/profile/${otherUser?.clerkId}`}>
    {otherUser?.imageUrl ? (
      <img src={otherUser.imageUrl} alt="" className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-80 transition" />
    ) : (
      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 cursor-pointer hover:opacity-80 transition">
        {otherUser?.name?.[0] || '?'}
      </div>
    )}
  </Link>
  <div>
    <Link href={`/profile/${otherUser?.clerkId}`}>
      <div className="font-semibold text-slate-900 hover:text-blue-600 cursor-pointer transition">
        {otherUser?.name || 'User'}
      </div>
    </Link>
    {isTyping && <span className="text-xs text-slate-400">typing...</span>}
  </div>
</div>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-slate-400 text-sm py-8">
            No messages yet. Say hello! 👋
          </div>
        )}
        {messages.map((msg, index) => {
          const isOwn = msg.senderId === currentUserId
          return (
            <div key={msg._id || `msg-${index}`} className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
              {!isOwn && (
                otherUser?.imageUrl ? (
                  <img
                    src={otherUser.imageUrl}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover shrink-0 mt-1"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0 mt-1">
                    {otherUser?.name?.[0] || '?'}
                  </div>
                )
              )}
              <div className={`max-w-xs lg:max-w-md flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                  isOwn
                    ? 'bg-blue-600 text-white rounded-tr-sm'
                    : 'bg-slate-100 text-slate-900 rounded-tl-sm'
                }`}>
                  {msg.content}
                </div>
                {/* ✅ Only render time on client to avoid hydration mismatch */}
                <span className="text-xs text-slate-400 mt-1 px-1">
                  {mounted ? formatTime(msg.createdAt) : ''}
                </span>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="flex items-center gap-3 px-4 py-3 border-t border-slate-100">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2.5 bg-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="w-10 h-10 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-colors shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  )
}
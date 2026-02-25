'use client'
import { useState, useEffect, useRef } from 'react'
import { getSocket } from '@/lib/socket-client'
import { Send } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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
  const router = useRouter()

  useEffect(() => { setMounted(true) }, [])

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
      setMessages(prev => {
        if (prev.some(m => m._id === data._id)) return prev
        return [...prev, data]
      })
      socket.current?.emit('send_message', { ...data, roomId })
      setInput('')
    } catch (err) {
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  return (
    // 100dvh shrinks when the virtual keyboard opens on mobile
    // flex-col so header + messages + input stack vertically
    <div
      className="flex flex-col bg-[#0a0a0a] text-white w-full"
      style={{ height: '100dvh' }}
    >
      {/* Chat Header — fixed height, never scrolls */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/5 bg-[#0d0d0d] shrink-0">
        <Link href={`/profile/${otherUser?.clerkId}`} className="shrink-0">
          {otherUser?.imageUrl ? (
            <img src={otherUser.imageUrl} alt="" className="w-9 h-9 rounded-full object-cover hover:opacity-80 transition" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center font-bold text-white/60 text-sm hover:opacity-80 transition">
              {otherUser?.name?.[0] || '?'}
            </div>
          )}
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="md:hidden inline-flex items-center justify-center w-8 h-8 rounded-md text-white/80 hover:bg-white/5"
              aria-label="Back"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
            </button>
            <Link href={`/profile/${otherUser?.clerkId}`} className="min-w-0">
              <p className="font-semibold text-white text-sm hover:text-white/80 transition truncate">
                {otherUser?.name || 'User'}
              </p>
            </Link>
          </div>
          {isTyping ? (
            <p className="text-xs text-green-400">typing...</p>
          ) : (
            <p className="text-xs text-white/25">Active now</p>
          )}
        </div>
      </div>

      {/* Messages — flex-1 fills remaining space, THIS is the only scrollable element */}
      <div
        className="flex-1 min-h-0 px-5 py-4 space-y-2"
        style={{ overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
              {otherUser?.imageUrl ? (
                <img src={otherUser.imageUrl} alt="" className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <span className="text-white/30 text-lg font-bold">{otherUser?.name?.[0] || '?'}</span>
              )}
            </div>
            <p className="text-white/30 text-sm font-medium">{otherUser?.name || 'User'}</p>
            <p className="text-white/15 text-xs mt-1">Send a message to start the conversation</p>
          </div>
        )}

        {messages.map((msg, index) => {
          const isOwn = msg.senderId === currentUserId
          const prevMsg = messages[index - 1]
          const showAvatar = !isOwn && (!prevMsg || prevMsg.senderId !== msg.senderId)

          return (
            <div key={msg._id || `msg-${index}`} className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end`}>
              {!isOwn && (
                <div className="w-6 shrink-0">
                  {showAvatar && (
                    otherUser?.imageUrl ? (
                      <img src={otherUser.imageUrl} alt="" className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white/40 text-xs font-bold">
                        {otherUser?.name?.[0] || '?'}
                      </div>
                    )
                  )}
                </div>
              )}

              <div className={`flex flex-col gap-0.5 max-w-xs lg:max-w-sm ${isOwn ? 'items-end' : 'items-start'}`}>
                <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isOwn
                    ? 'bg-white text-black rounded-br-sm'
                    : 'bg-[#1a1a1a] text-white/80 border border-white/5 rounded-bl-sm'
                }`}>
                  {msg.content}
                </div>
                <span className="text-xs text-white/50 px-1">
                  {mounted ? formatTime(msg.createdAt) : ''}
                </span>
              </div>
            </div>
          )
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-2 items-end">
            <div className="w-6 h-6 rounded-full bg-white/10 shrink-0" />
            <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center">
              <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar — shrink-0 so it never grows/shrinks, always at the bottom */}
      <form
        onSubmit={sendMessage}
        className="shrink-0 sticky bottom-0 z-20 flex items-center gap-2 px-4 py-3 border-t border-white/5 bg-[#0d0d0d]"
      >
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(e)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2.5 bg-white/5 border border-white/8 rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="w-9 h-9 bg-white hover:bg-white/90 disabled:bg-white/10 disabled:text-white/20 text-black rounded-xl flex items-center justify-center transition-all shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  )
}
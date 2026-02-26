'use client'
import { useState, useEffect, useRef, useMemo } from 'react'
import { getSocket } from '@/lib/socket-client'
import { Send } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

function formatTime(date) {
  return new Date(date).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

// ─── Ripple Background ───────────────────────────────────────────────────────

const ROWS = 18
const COLS = 22
const CELL = 52

function RippleBg() {
  const [clickedCell, setClickedCell] = useState(null)
  const [rippleKey, setRippleKey] = useState(0)

  useEffect(() => {
    const fire = () => {
      setClickedCell({
        row: Math.floor(Math.random() * ROWS),
        col: Math.floor(Math.random() * COLS),
      })
      setRippleKey(k => k + 1)
    }
    fire()
    const id = setInterval(fire, 3500 + Math.random() * 2000)
    return () => clearInterval(id)
  }, [])

  const cells = useMemo(() => Array.from({ length: ROWS * COLS }, (_, i) => i), [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div
        className="absolute inset-0 z-10"
        style={{
          background: 'radial-gradient(ellipse 85% 85% at 50% 50%, transparent 15%, #0a0a0a 72%)',
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          key={`grid-${rippleKey}`}
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${COLS}, ${CELL}px)`,
            gridTemplateRows: `repeat(${ROWS}, ${CELL}px)`,
            width: COLS * CELL,
            height: ROWS * CELL,
          }}
        >
          {cells.map((idx) => {
            const rowIdx = Math.floor(idx / COLS)
            const colIdx = idx % COLS
            const distance = clickedCell
              ? Math.hypot(clickedCell.row - rowIdx, clickedCell.col - colIdx)
              : 0
            return (
              <div
                key={idx}
                className={cn(
                  'border-[0.5px] opacity-30',
                  clickedCell && 'animate-cell-ripple [animation-fill-mode:none]'
                )}
                style={{
                  backgroundColor: '#0a0a0a',
                  borderColor: '#1e1e1e',
                  ...(clickedCell && {
                    '--delay': `${Math.max(0, distance * 45)}ms`,
                    '--duration': `${200 + distance * 75}ms`,
                  }),
                }}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Chat Window ─────────────────────────────────────────────────────────────

const INPUT_BAR_HEIGHT = 64 // px — matches py-3 + input height

export default function ChatWindow({ roomId, currentUserId, initialMessages, otherUser }) {
  const [messages, setMessages] = useState(initialMessages || [])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [sending, setSending] = useState(false)
  const [mounted, setMounted] = useState(false)
  const bottomRef = useRef(null)
  const typingTimeout = useRef(null)
  const socket = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => { setMounted(true) }, [])

  // Keep the container height locked to the visual viewport
  // This is what prevents the layout shifting when the browser URL bar hides/shows
  useEffect(() => {
    const setHeight = () => {
      const vh = window.visualViewport?.height ?? window.innerHeight
      if (containerRef.current) {
        containerRef.current.style.height = `${vh}px`
      }
    }

    setHeight()

    // visualViewport fires when keyboard opens/closes AND when URL bar hides
    window.visualViewport?.addEventListener('resize', setHeight)
    window.addEventListener('resize', setHeight)

    return () => {
      window.visualViewport?.removeEventListener('resize', setHeight)
      window.removeEventListener('resize', setHeight)
    }
  }, [])

  useEffect(() => {
    socket.current = getSocket()
    socket.current.emit('join_room', roomId)
    socket.current.on('receive_message', (msg) => {
      setMessages(prev => prev.some(m => m._id === msg._id) ? prev : [...prev, msg])
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
      setMessages(prev => prev.some(m => m._id === data._id) ? prev : [...prev, data])
      socket.current?.emit('send_message', { ...data, roomId })
      setInput('')
    } catch (err) {
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  return (
    // ref + inline height locked to visualViewport — never shifts with URL bar
    <div
      ref={containerRef}
      className="relative flex flex-col bg-[#0a0a0a] text-white w-full overflow-hidden"
      style={{ height: '100dvh' }} // fallback, overridden by JS above
    >
      {/* Ripple bg */}
      <RippleBg />

      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md shrink-0">
        <Link
          href="/messages"
          className="md:hidden w-8 h-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center shrink-0 active:bg-white/10 transition"
        >
          <svg className="w-4 h-4 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>

        <Link href={`/profile/${otherUser?.clerkId}`} className="shrink-0">
          {otherUser?.imageUrl ? (
            <img src={otherUser.imageUrl} alt="" className="w-9 h-9 rounded-full object-cover hover:opacity-80 transition" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center font-bold text-white/60 text-sm">
              {otherUser?.name?.[0] || '?'}
            </div>
          )}
        </Link>

        <div className="flex-1 min-w-0">
          <Link href={`/profile/${otherUser?.clerkId}`}>
            <p className="font-semibold text-white text-sm hover:text-white/80 transition truncate">
              {otherUser?.name || 'User'}
            </p>
          </Link>
          {isTyping
            ? <p className="text-xs text-green-400">typing...</p>
            : <p className="text-xs text-white/25">Active now</p>
          }
        </div>
      </div>

      {/* Messages — scrollable, padded so last message is never behind input bar */}
      <div
        className="relative z-10 flex-1 min-h-0 px-4 py-4 space-y-2"
        style={{
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          // Extra bottom padding so last message isn't hidden behind input bar
          paddingBottom: `${INPUT_BAR_HEIGHT + 16}px`,
        }}
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
              {otherUser?.imageUrl
                ? <img src={otherUser.imageUrl} alt="" className="w-12 h-12 rounded-full object-cover" />
                : <span className="text-white/30 text-lg font-bold">{otherUser?.name?.[0] || '?'}</span>
              }
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
            <div key={msg._id || `msg-${index}`} className={cn('flex gap-2 items-end', isOwn ? 'flex-row-reverse' : 'flex-row')}>
              {!isOwn && (
                <div className="w-6 shrink-0">
                  {showAvatar && (
                    otherUser?.imageUrl
                      ? <img src={otherUser.imageUrl} alt="" className="w-6 h-6 rounded-full object-cover" />
                      : <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white/40 text-xs font-bold">{otherUser?.name?.[0] || '?'}</div>
                  )}
                </div>
              )}
              <div className={cn('flex flex-col gap-0.5 max-w-[78%] sm:max-w-xs lg:max-w-sm', isOwn ? 'items-end' : 'items-start')}>
                <div className={cn(
                  'px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed',
                  isOwn
                    ? 'bg-white text-black rounded-br-sm'
                    : 'bg-[#1a1a1a]/90 backdrop-blur-sm text-white/80 border border-white/5 rounded-bl-sm'
                )}>
                  {msg.content}
                </div>
                <span className="text-xs text-white/40 px-1">
                  {mounted ? formatTime(msg.createdAt) : ''}
                </span>
              </div>
            </div>
          )
        })}

        {isTyping && (
          <div className="flex gap-2 items-end">
            <div className="w-6 h-6 rounded-full bg-white/10 shrink-0" />
            <div className="bg-[#1a1a1a]/90 backdrop-blur-sm border border-white/5 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center">
              <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar — absolute to the container so it never scrolls with messages */}
      <form
        onSubmit={sendMessage}
        className="absolute bottom-0 left-0 right-0 z-20 flex items-center gap-2 px-4 py-3 border-t border-white/5 bg-[#0a0a0a]/90 backdrop-blur-md"
        style={{ height: INPUT_BAR_HEIGHT }}
      >
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(e)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
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
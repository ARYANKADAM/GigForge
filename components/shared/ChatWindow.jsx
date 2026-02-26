'use client'
import { useState, useEffect, useRef, useMemo } from 'react'
import { getSocket } from '@/lib/socket-client'
import { Send, Smile, X, Pencil, Trash2, Check } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import dynamic from 'next/dynamic'
import data from '@emoji-mart/data'

const EmojiPicker = dynamic(() => import('@emoji-mart/react'), { ssr: false })

function formatTime(date) {
  return new Date(date).toLocaleTimeString([], {
    hour: '2-digit', minute: '2-digit', hour12: false,
  })
}

// ─── Ripple Background ────────────────────────────────────────────────────────

const ROWS = 18, COLS = 22, CELL = 52

function RippleBg() {
  const [clickedCell, setClickedCell] = useState(null)
  const [rippleKey, setRippleKey] = useState(0)

  useEffect(() => {
    const fire = () => {
      setClickedCell({ row: Math.floor(Math.random() * ROWS), col: Math.floor(Math.random() * COLS) })
      setRippleKey(k => k + 1)
    }
    fire()
    const id = setInterval(fire, 3500 + Math.random() * 2000)
    return () => clearInterval(id)
  }, [])

  const cells = useMemo(() => Array.from({ length: ROWS * COLS }, (_, i) => i), [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 z-10" style={{ background: 'radial-gradient(ellipse 85% 85% at 50% 50%, transparent 15%, #0a0a0a 72%)' }} />
      <div className="absolute inset-0 flex items-center justify-center">
        <div key={`grid-${rippleKey}`} style={{ display: 'grid', gridTemplateColumns: `repeat(${COLS}, ${CELL}px)`, gridTemplateRows: `repeat(${ROWS}, ${CELL}px)`, width: COLS * CELL, height: ROWS * CELL }}>
          {cells.map((idx) => {
            const rowIdx = Math.floor(idx / COLS)
            const colIdx = idx % COLS
            const distance = clickedCell ? Math.hypot(clickedCell.row - rowIdx, clickedCell.col - colIdx) : 0
            return (
              <div key={idx} className={cn('border-[0.5px] opacity-30', clickedCell && 'animate-cell-ripple [animation-fill-mode:none]')}
                style={{ backgroundColor: '#0a0a0a', borderColor: '#1e1e1e', ...(clickedCell && { '--delay': `${Math.max(0, distance * 45)}ms`, '--duration': `${200 + distance * 75}ms` }) }}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Context Menu ─────────────────────────────────────────────────────────────

function MessageContextMenu({ x, y, onEdit, onDelete, onClose }) {
  // Backdrop closing is handled outside (safer for React event ordering).
  return (
    <div
      className="fixed z-50 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1 min-w-[140px]"
      style={{ top: y, left: x }}
      onPointerDown={e => e.stopPropagation()}
    >
      <button onClick={onEdit} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:bg-white/8 hover:text-white transition-colors">
        <Pencil className="w-4 h-4 text-blue-400" /> Edit
      </button>
      <div className="h-px bg-white/5 mx-2" />
      <button onClick={onDelete} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
        <Trash2 className="w-4 h-4" /> Delete
      </button>
    </div>
  )
}

const INPUT_BAR_HEIGHT = 64

// ─── Chat Window ──────────────────────────────────────────────────────────────

export default function ChatWindow({ roomId, currentUserId, initialMessages, otherUser }) {
  const [messages, setMessages] = useState(initialMessages || [])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [sending, setSending] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showEmoji, setShowEmoji] = useState(false)
  const [contextMenu, setContextMenu] = useState(null) // { x, y, msg }
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')

  const bottomRef = useRef(null)
  const typingTimeout = useRef(null)
  const socket = useRef(null)
  const containerRef = useRef(null)
  const inputRef = useRef(null)
  const longPressTimer = useRef(null)
  const longPressTriggered = useRef(false) // prevents click firing after long press

  useEffect(() => { setMounted(true) }, [])

  // Lock height to visualViewport
  useEffect(() => {
    const setHeight = () => {
      const vh = window.visualViewport?.height ?? window.innerHeight
      if (containerRef.current) containerRef.current.style.height = `${vh}px`
    }
    setHeight()
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
    socket.current.on('message_edited', (msg) => {
      setMessages(prev => prev.map(m => m._id === msg._id ? msg : m))
    })
    socket.current.on('message_deleted', ({ id }) => {
      setMessages(prev => prev.filter(m => m._id !== id))
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
      socket.current.off('message_edited')
      socket.current.off('message_deleted')
      socket.current.off('user_typing')
      socket.current.off('user_stop_typing')
    }
  }, [roomId, currentUserId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!showEmoji) return
    const close = (e) => {
      if (!e.target.closest('.emoji-picker-container') && !e.target.closest('.emoji-btn')) setShowEmoji(false)
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [showEmoji])

  function handleInputChange(e) {
    setInput(e.target.value)
    socket.current?.emit('typing_start', { roomId, userId: currentUserId })
    clearTimeout(typingTimeout.current)
    typingTimeout.current = setTimeout(() => {
      socket.current?.emit('typing_stop', { roomId, userId: currentUserId })
    }, 1500)
  }

  function onEmojiSelect(emoji) {
    setInput(prev => prev + emoji.native)
    setShowEmoji(false)
    inputRef.current?.focus()
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

  // ── Context menu position helper ─────────────────────────────────────────

  function openContextMenu(rectOrEvent, msg) {
    if (msg.senderId !== currentUserId) return

    let x, y
    if (rectOrEvent.clientX !== undefined) {
      // Right-click / contextmenu event
      x = rectOrEvent.clientX
      y = rectOrEvent.clientY
    } else {
      // Rect from long press (already captured before timeout)
      x = rectOrEvent.left
      y = rectOrEvent.top > window.innerHeight / 2
        ? rectOrEvent.top - 108
        : rectOrEvent.bottom + 8
    }

    // Keep menu inside viewport
    x = Math.min(x, window.innerWidth - 160)
    y = Math.max(y, 8)

    setContextMenu({ x, y, msg })
  }

  // ── Long press (mobile) ──────────────────────────────────────────────────

  function handlePointerDown(e, msg) {
    if (msg.senderId !== currentUserId) return
    longPressTriggered.current = false

    // ✅ Capture rect IMMEDIATELY — before the timeout fires
    const rect = e.currentTarget.getBoundingClientRect()
    const capturedRect = { left: rect.left, top: rect.top, bottom: rect.bottom }

    longPressTimer.current = setTimeout(() => {
      longPressTriggered.current = true
      openContextMenu(capturedRect, msg)
    }, 500)
  }

  function handlePointerUp() {
    clearTimeout(longPressTimer.current)
  }

  function handlePointerLeave() {
    clearTimeout(longPressTimer.current)
  }

  // ── Right click (desktop) ────────────────────────────────────────────────

  function handleContextMenu(e, msg) {
    if (msg.senderId !== currentUserId) return
    e.preventDefault()
    openContextMenu(e, msg)
  }

  // ── Edit ─────────────────────────────────────────────────────────────────

  function startEdit(msg) {
    setContextMenu(null)
    setEditingId(msg._id)
    setEditValue(msg.content)
  }

  async function saveEdit(id) {
    if (!editValue.trim()) return
    try {
      const res = await fetch(`/api/messages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editValue.trim() }),
      })
      const updated = await res.json()
      setMessages(prev => prev.map(m => m._id === id ? updated : m))
      socket.current?.emit('message_edited', { ...updated, roomId })
    } catch (err) {
      console.error(err)
    } finally {
      setEditingId(null)
      setEditValue('')
    }
  }

  function cancelEdit() {
    setEditingId(null)
    setEditValue('')
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  async function deleteMessage(msg) {
    setContextMenu(null)
    try {
      await fetch(`/api/messages/${msg._id}`, { method: 'DELETE' })
      setMessages(prev => prev.filter(m => m._id !== msg._id))
      socket.current?.emit('message_deleted', { id: msg._id, roomId })
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col bg-[#0a0a0a] text-white w-full overflow-hidden"
      style={{ height: '100dvh' }}
    >
      <RippleBg />

      {/* Context menu */}
      {contextMenu && (
        <>
          {/* Backdrop closes the menu when clicking outside. Using a React-managed backdrop
              avoids native document listeners which can run before React click handlers */}
          <div
            className="fixed inset-0 z-40"
            onPointerDown={() => setContextMenu(null)}
          />
          <MessageContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onEdit={() => startEdit(contextMenu.msg)}
            onDelete={() => deleteMessage(contextMenu.msg)}
            onClose={() => setContextMenu(null)}
          />
        </>
      )}

      {/* Emoji picker */}
      {showEmoji && (
        <div className="emoji-picker-container absolute z-30 bottom-[68px] left-2 right-2 sm:left-4 sm:right-auto" style={{ maxWidth: 352 }}>
          <EmojiPicker data={data} onEmojiSelect={onEmojiSelect} theme="dark" previewPosition="none" skinTonePosition="none" searchPosition="top" maxFrequentRows={2} perLine={8} />
        </div>
      )}

      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md shrink-0">
        <Link href="/messages" className="md:hidden w-8 h-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center shrink-0 active:bg-white/10 transition">
          <svg className="w-4 h-4 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <Link href={`/profile/${otherUser?.clerkId}`} className="shrink-0">
          {otherUser?.imageUrl
            ? <img src={otherUser.imageUrl} alt="" className="w-9 h-9 rounded-full object-cover hover:opacity-80 transition" />
            : <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center font-bold text-white/60 text-sm">{otherUser?.name?.[0] || '?'}</div>
          }
        </Link>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm truncate">{otherUser?.name || 'User'}</p>
          {isTyping ? <p className="text-xs text-green-400">typing...</p> : <p className="text-xs text-white/25">Active now</p>}
        </div>
      </div>

      {/* Messages */}
      <div
        className="relative z-10 flex-1 min-h-0 px-4 py-4 space-y-2"
        style={{ overflowY: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: `${INPUT_BAR_HEIGHT + 16}px` }}
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
          const isEditing = editingId === msg._id

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
                {isEditing ? (
                  <div className="flex items-center gap-1 w-full">
                    <input
                      autoFocus
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') saveEdit(msg._id)
                        if (e.key === 'Escape') cancelEdit()
                      }}
                      className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/30"
                    />
                    <button onClick={() => saveEdit(msg._id)} className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 text-black" />
                    </button>
                    <button onClick={cancelEdit} className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                      <X className="w-3.5 h-3.5 text-white/50" />
                    </button>
                  </div>
                ) : (
                  <div
                    className={cn(
                      'px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed select-none',
                      isOwn
                        ? 'bg-white text-black rounded-br-sm cursor-pointer active:opacity-70'
                        : 'bg-[#1a1a1a]/90 backdrop-blur-sm text-white/80 border border-white/5 rounded-bl-sm'
                    )}
                    onPointerDown={isOwn ? (e) => handlePointerDown(e, msg) : undefined}
                    onPointerUp={isOwn ? handlePointerUp : undefined}
                    onPointerLeave={isOwn ? handlePointerLeave : undefined}
                    onContextMenu={isOwn ? (e) => handleContextMenu(e, msg) : undefined}
                  >
                    {msg.content}
                  </div>
                )}

                <span className="text-xs text-white/40 px-1 flex items-center gap-1">
                  {mounted ? formatTime(msg.createdAt) : ''}
                  {msg.edited && <span className="text-white/20 text-xs italic">edited</span>}
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

      {/* Input bar */}
      <form
        onSubmit={sendMessage}
        className="absolute bottom-0 left-0 right-0 z-20 flex items-center gap-2 px-3 py-3 border-t border-white/5 bg-[#0a0a0a]/90 backdrop-blur-md"
        style={{ height: INPUT_BAR_HEIGHT }}
      >
        <button
          type="button"
          onClick={() => setShowEmoji(v => !v)}
          className={cn('emoji-btn w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all',
            showEmoji ? 'bg-white/15 text-white' : 'bg-white/5 text-white/40 hover:text-white/70 hover:bg-white/10'
          )}
        >
          {showEmoji ? <X className="w-4 h-4" /> : <Smile className="w-4 h-4" />}
        </button>

        <input
          ref={inputRef}
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
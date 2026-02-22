const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  })

  // Store io instance globally for API routes
  global.io = io

  // Track online users
  const onlineUsers = new Map()
  // also expose the map so other modules can look up socket IDs
  global.onlineUsers = onlineUsers

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    // User joins with their userId
    socket.on('user:join', (userId) => {
      onlineUsers.set(userId, socket.id)
      socket.userId = userId
      io.emit('users:online', Array.from(onlineUsers.keys()))
    })

    // Join a chat room
    socket.on('room:join', (roomId) => {
      socket.join(roomId)
      console.log(`Socket ${socket.id} joined room ${roomId}`)
    })

    // Leave a chat room
    socket.on('room:leave', (roomId) => {
      socket.leave(roomId)
    })

    // Send message to room
    socket.on('message:send', (data) => {
      // Broadcast to everyone in the room including sender
      io.to(data.roomId).emit('message:receive', data)      // and notify specific recipient if online
      const targetSocketId = onlineUsers.get(data.receiverId);
      if (targetSocketId) {
        io.to(targetSocketId).emit('notification:message', data);
      }    })

    // Typing indicator
    socket.on('typing:start', (data) => {
      socket.to(data.roomId).emit('typing:start', { userId: socket.userId })
    })

    socket.on('typing:stop', (data) => {
      socket.to(data.roomId).emit('typing:stop', { userId: socket.userId })
    })

    // Bid notifications
    socket.on('bid:new', (data) => {
      const clientSocketId = onlineUsers.get(data.clientId)
      if (clientSocketId) {
        io.to(clientSocketId).emit('notification:bid', data)
      }
    })

    // Payment notifications
    socket.on('payment:update', (data) => {
      const targetSocketId = onlineUsers.get(data.targetUserId)
      if (targetSocketId) {
        io.to(targetSocketId).emit('notification:payment', data)
      }
    })

    socket.on('disconnect', () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId)
        io.emit('users:online', Array.from(onlineUsers.keys()))
      }
      console.log('Client disconnected:', socket.id)
    })
  })

  httpServer
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })
})

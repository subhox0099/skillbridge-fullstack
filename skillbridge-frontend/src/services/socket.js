import { io } from 'socket.io-client'

const SOCKET_URL = 'http://localhost:4000'

let socket = null

export function getSocket() {
  const token = localStorage.getItem('token')

  if (!token) {
    console.warn('No token found, cannot initialize socket')
    return null
  }

  // If no socket OR token changed → recreate
  if (!socket || socket.auth?.token !== token) {

    if (socket) {
      console.log('Token changed. Reconnecting socket...')
      socket.disconnect()
    }

    console.log('Creating new authenticated Socket.IO connection...')

    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
    })

    socket.on('connect', () => {
      console.log('✅ Socket.IO connected:', socket.id)
    })

    socket.on('disconnect', (reason) => {
      console.log('❌ Socket.IO disconnected:', reason)
    })

    socket.on('connect_error', (error) => {
      console.error('❌ Socket.IO connection error:', error.message)
    })
  }

  return socket
}


export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export default getSocket

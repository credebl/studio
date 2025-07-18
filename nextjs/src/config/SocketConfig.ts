import io from 'socket.io-client'

const SOCKET = io(`${process.env.NEXT_PUBLIC_BASE_URL}`, {
  reconnection: true,
  reconnectionDelay: 500,
  reconnectionAttempts: Infinity,
  autoConnect: true,
  transports: ['websocket'],
})

export default SOCKET

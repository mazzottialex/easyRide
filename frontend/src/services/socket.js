import { io } from 'socket.io-client'

let socket = null

const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
  }
}
export const getSocket = () => {
  if (!socket) {
    socket = io('http://localhost:3000', {
      withCredentials: true
    })
    window.addEventListener('pagehide', disconnectSocket, { once: true })
  }
  return socket
}
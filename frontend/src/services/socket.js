import { io } from 'socket.io-client'

let socket = null

const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
  }
}
export const getSocket = () => {
  if (!socket) {
    const token = localStorage.getItem('token')
    socket = io('http://localhost:3000', {
      withCredentials: true,
      auth: token ? { token } : undefined
    })
    window.addEventListener('pagehide', disconnectSocket, { once: true })
  }
  return socket
}
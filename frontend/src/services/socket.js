import { io } from 'socket.io-client'

let socket = null
export const getSocket = () => {
  if (!socket) {
    socket = io('http://localhost:3000', {
      auth: {
        token: localStorage.getItem('token')
      }
    })
  }
  return socket
}
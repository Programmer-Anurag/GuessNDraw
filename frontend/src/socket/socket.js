import { io } from "socket.io-client";

export const socket=io(import.meta.env.VITE_API_URL,{
    autoConnect: false
})

export function connectSocket() {
  return new Promise((resolve) => {
    if (socket.connected) return resolve();

    socket.connect();
    socket.once("connect", resolve);
  });
}


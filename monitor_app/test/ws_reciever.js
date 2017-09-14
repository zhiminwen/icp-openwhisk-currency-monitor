var io = require('socket.io-client')

const socket = io('http://localhost');

socket.on('connect', () => {
  console.log("connected...")
  
  socket.on("monitor-tracking-data", (data) => {
    console.log("data recieved...", data)
  })
})


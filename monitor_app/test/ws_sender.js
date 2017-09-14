var io = require('socket.io-client')

const socket = io('http://localhost');

socket.on('connect', () => {
  console.log("connected...")
  socket.emit("monitor-tracking-data", {
    value: "success",
    data: [1,2,3]
  })
});
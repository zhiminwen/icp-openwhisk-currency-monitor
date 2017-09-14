const app = require('./app');

//websocket 
const server = require("http").Server(app)
const io = require("socket.io")(server)

io.on('connection', socket =>{
  console.log("connected...")
  //TODO: different user should have his own tracking data only

  socket.join('tracking-room')

  socket.on('monitor-tracking-data', (data) => {
    console.log(data)
    io.to('tracking-room').emit('monitor-tracking-data', data)
  })
})


module.exports = server;
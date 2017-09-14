const PORT = process.env.PORT || 80;

const server = require('./socket') //the server with socket.io

//use server to listen, required for socket.io
server.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});
var io = require('socket.io-client')

function main(params) {
  const socket = io(params.frontendUrl);
  socket.on('connect', () => {
    console.log(`connected to socket on ${params.frontendUrl}`)
    //after connect then send
    socket.emit(params.topic, params.data)
    //close connection after send
    socket.close()
  });
}

exports.main = main;

// testing from local
if (!process.env.__OW_API_HOST) {
  main({
    // frontendUrl: "http://192.168.64.238:31720",
    frontendUrl: "http://10.10.20.168", //test from VPN to local laptop
    topic: "monitor-tracking-data",
    data: {
      currency: "Canadian Dollar",
      indicators: [ { value: 1.0953 },
        { sma_4: 1.084125 },
        { ema_5: 1.0821629995145403 },
        { macd_12_26__signal_9: 0.001229383870120115 }
      ],
      formula: "value > 1.0 && sma_4 <4.5 && ema_5 < 6 && macd_12_26__signal_9 < 0.001 ",
      formulaEvaluation: true,
      timestamp: 1504589242,
      cronJobId: '123456789',
      action: 'Purchase',
      actionResult: { msg: 'Purchased 1234 Canadian Dollar.'}      
    }
  });
}

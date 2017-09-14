import {observable} from "mobx"
import io from 'socket.io-client'
import {monitorListStore } from '../datastores/monitor_store'
import * as moment from 'moment'

var _ = require('lodash')
var socket = io('/')

class SocketIO {
  @observable popupPurchase = false
  @observable popupSell = false
  @observable popupSellCurrencyName = ""
  @observable popupPurchaseCurrencyName = ""

  @observable listOfActionResults = [
    // {
    //   currency: "Canadian Dollar",
    //   indicators: [ { value: 1.0953 },
    //     { sma_4: 1.084125 },
    //     { ema_5: 1.0821629995145403 },
    //     { macd_12_26__signal_9: 0.001229383870120115 }
    //   ],
    //   formula: "value > 1.0 && sma_4 <4.5 && ema_5 < 6 && macd_12_26__signal_9 < 0.001 ",
    //   formulaEvaluation: true,
    //   timestamp: 1504589242,
    //   cronJobId: '123456789',
    //   action: 'Sell',
    //   actionResult: {msg: "Sold 50 $"}
    // },
  ]

  constructor() {
    socket.on('connect', () => {
      console.log("connected...")
      
      socket.on("monitor-tracking-data", (data) => {
        console.log("monitor recieved from socket...", data)
        
        this.listOfActionResults.push(data)
      })
    })
  }

  removeFromList(cronJobId, timestamp){
    console.log("removing:", cronJobId, timestamp)
    _.remove(this.listOfActionResults, elm => elm.cronJobId === cronJobId && elm.timestamp === timestamp)
  }

  stop(cronJobId, timestamp){
    console.log(cronJobId)
    monitorListStore.deleteMonitor(cronJobId)
    this.removeFromList(cronJobId, timestamp)
  }

  formatTimestamp(timestamp){
    return moment(_.toNumber(timestamp)).format('MMM D HH:mm')
  }

  closePopupPurchase() {
    this.popupPurchase = false 
    this.popupPurchaseCurrencyName = ""
  }
  closePopupSell() {
    this.popupSell = false 
    this.popupSellCurrencyName = ""
  }

}

export const socketStore = window.socketStore =  new SocketIO()
import React, { Component } from 'react';
import { socketStore } from '../datastores/socket_store'
import { observer } from "mobx-react"
import {monitorListStore } from '../datastores/monitor_store'
import Purchase from './purchase'
import Sell from './sell'

var _ = require('lodash')
var sprintf = require('sprintf')

@observer
class ActionTracking extends Component {
  popupPurchase(currencyName){
    socketStore.popupPurchase = true
    socketStore.popupPurchaseCurrencyName = currencyName
  }
  closePurchase(){
    socketStore.popupPurchase = false
  }

  popupSell(currencyName){
    socketStore.popupSell = true
    socketStore.popupSellCurrencyName = currencyName
  }
  closeSell(){
    socketStore.popupSell = false
  }

  
  render() {
    let FieldValuePair = (field, value, className) => (
      <p>{field}: <span className={className}>{value}</span></p>
    )

    let marginTop = {marginTop: 15}
    return (
      <div>
        <div className="columns is-multiline">
        {
          socketStore.listOfActionResults.map(elm => {
            return (
              <div className="column is-one-third">
                <div className="card">
                  <div className="card-header">
                    <div className="card-header-title">{elm.currency}</div>
                    <div className="card-header-icon">
                      <figure className="image is-32x32">
                        <img src={monitorListStore.getImageUrl(elm.currency)}/>
                      </figure>
                    </div>
                  </div>
                  <div className="card-content">
                    <p>Triggered at: { socketStore.formatTimestamp(elm.timestamp) } </p>
                    <table className="table is-narrow is-size-7" style = {marginTop}>
                      <thead>
                        <tr>
                          <th>Indicator</th>
                          <th>Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {
                          elm.indicators.map(hash =>(
                            _.map(hash, (value, key)  => (
                              <tr>
                                <th>{key}</th>
                                <td>{sprintf("%0.8f", value)}</td>
                              </tr>
                            ))
                            )
                          )
                        }
                      </tbody>
                    </table>
                    { FieldValuePair("Formula", elm.formula, 'is-size-7')}
                    { FieldValuePair("Evaluation", elm.formulaEvaluation? "True": "False")}
                    { elm.formulaEvaluation? ( FieldValuePair("Action", _.replace(elm.action, /.*\//, ""))): null }
                    { elm.formulaEvaluation? ( FieldValuePair("Result", elm.actionResult.msg)): null }

                  </div>
                  

                  <footer className="card-footer">
                    <a className="card-footer-item" onClick = { () => socketStore.removeFromList(elm.cronJobId, elm.timestamp) }>Continue</a>
                    <a className="card-footer-item" onClick = { () => socketStore.stop(elm.cronJobId, elm.timestamp) }>Stop</a>
                    <a className="card-footer-item" onClick = { () => this.popupPurchase(elm.currency) }>Purchase</a>
                    <a className="card-footer-item" onClick = { () => this.popupSell(elm.currency) }>Sell</a>
                  </footer>
                </div>
                
                { socketStore.popupPurchase? <Purchase /> : null }
                { socketStore.popupSell? <Sell /> : null }
              </div>
            )
          })
        }
        </div>
      </div>
    );
  }
}

export default ActionTracking;
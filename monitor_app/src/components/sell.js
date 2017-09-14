import React, { Component } from 'react'
import { socketStore } from '../datastores/socket_store'

var classNames = require('classnames');

class Sell extends Component {
  render () {
    let whiteStyle={color:"white"}
    return (
      <div className={ classNames("modal", "is-active": socketStore.popupSell)} >
      <div className="modal-background"></div>
      <div className="modal-content">
          <h1 className="title" style={whiteStyle}>Sell { socketStore.popupSellCurrencyName }</h1>
          <div className="field">
            <div className="control">
              <label className="label has-text-white">Amount to Sell</label>
              <div className="control">
                <input className="input" type="text" placeholder="100.0"/>
              </div>
            </div>
          </div>
          <div className="field is-grouped-centered">
          <a className="button is-primary" onClick ={ e => socketStore.closePopupSell()}>
            Submit
          </a>
        </div>

      </div>
      
      <button className="modal-close is-large" aria-label="close" onClick ={ e => socketStore.closePopupSell()}></button>
      </div>
    )
  }
}

export default Sell
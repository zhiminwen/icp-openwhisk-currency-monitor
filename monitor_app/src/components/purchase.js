import React, { Component } from 'react'
import { socketStore } from '../datastores/socket_store'

var classNames = require('classnames');

class Purchase extends Component {
  render () {
    let whiteStyle={color: 'white'}
    return (
      <div className={ classNames("modal", "is-active": socketStore.popupPurchase)} >
      <div className="modal-background"></div>
      <div className="modal-content">
          <h1 className="title" style={whiteStyle} >Purchase { socketStore.popupPurchaseCurrencyName }</h1>
          <div className="field">
            <div className="control">
              <label className="label has-text-white">Amount to Purchase</label>
              <div className="control">
                <input className="input" type="text" placeholder="100.0"/>
              </div>
            </div>
          </div>
          <div className="field is-grouped-centered">
          <a className="button is-primary" onClick ={ e => socketStore.closePopupPurchase()}>
            Submit
          </a>
        </div>

      </div>
      
      <button className="modal-close is-large" aria-label="close" onClick ={ e => socketStore.closePopupPurchase()}></button>
      </div>
    )
  }
}

export default Purchase
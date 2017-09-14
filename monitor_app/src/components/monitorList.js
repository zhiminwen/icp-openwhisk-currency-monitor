import React, { Component } from "react";
import { owStore } from "../datastores/ow_store";
import { monitorListStore } from "../datastores/monitor_store";
import { observer } from "mobx-react";

var prettyCron = require("prettycron")

@observer
export default class MonitorList extends Component {
  constructor(params) {
    super()
    monitorListStore.getLists()
  }
  render() {
    const cardWidthStyle = {
      width: "450px",
      marginBottom: 10,
    }
    const keywordStyle = {
      color: "gray",
    }
    return <div>
        <p>{monitorListStore.monitorCount}</p>
        {monitorListStore.listOfMonitors.map(elm => <div>
            
            <div className="card" style={cardWidthStyle}>
              <div className="card-header">
                <p className="card-header-title">{elm.name}</p>
              </div>

              <div className="card-content">
                <div className="media">
                  <div className="media-left">
                    <figure className="image is-96x96">
                      <img src={monitorListStore.getImageUrl(elm.annotations.currency)} />
                    </figure>
                  </div>
                  <div className="media-content">
                    <p>
                      <span style={keywordStyle}>
                        Monitor:
                      </span> {elm.annotations.currency}
                    </p>
                    <p>
                      <span style={keywordStyle}>
                        On:
                      </span> {prettyCron.toString(elm.annotations.schedule)}
                    </p>
                    <p>
                      <span style={keywordStyle}>
                        When:
                      </span> {elm.annotations.formula}
                    </p>
                    <p>
                      <span style={keywordStyle}>
                        Act:
                      </span> {elm.annotations.action}
                    </p>
                    {
                      /Notify/i.test(elm.annotations.action) ? null : ( 
                        <p>
                          <span style={keywordStyle}>
                            Amount:
                          </span> {elm.annotations.amount}
                        </p>
                      )
                    }
                  </div>
                </div>
              </div>
              <div className="card-footer">
                <div className="card-footer-item">
                  <a className="Button" onClick={event => {
                      monitorListStore.deleteMonitor(elm.name);
                    }}>
                    Delete
                  </a>
                </div>
                <div className="card-footer-item">
                  <a className="Button" onClick={event => {
                      monitorListStore.disableMonitor(elm.name);
                    }}>
                    Disable
                  </a>
                </div>
              </div>
            </div>
          </div>)}
      </div>;
  }
} 
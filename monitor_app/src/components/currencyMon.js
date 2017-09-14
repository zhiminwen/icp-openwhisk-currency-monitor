import React, { Component } from 'react';
// import { observer } from "mobx-react"
import NewMonitor from "./newMonitor"
import MonitorList from './monitorList'

export default class ForeignCurrencyMonitor extends Component {
  render() {
    return <div>
        <div className="columns">
          <div className="column">
            <h1 className="subtitle is-4">New Monitor</h1>
            <NewMonitor />
          </div>
          <div className="column">
            <h1 className="subtitle is-4">Registered Monitor</h1>
            <MonitorList/>
          </div>
        </div>
      </div>;
  }
}


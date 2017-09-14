import React, { Component } from 'react';
import ForeignCurrencyMonitor from "../components/currencyMon";

class Monitor extends Component {
  render() {
    return <div>
        <section className="section">
          <div className="container">
            <ForeignCurrencyMonitor/>
          </div>
        </section>
      </div>;
  }
}

export default Monitor;

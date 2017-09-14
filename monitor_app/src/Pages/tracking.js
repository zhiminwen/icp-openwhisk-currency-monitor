import React, { Component } from 'react';
import ActionTracking from '../components/actionTracking'

class Tracking extends Component {
  render() {
    return <div>
        <section className="section">
          <div className="container">
            <h1 className="title">Tracking of My Foreign Currency Monitors</h1>

            <ActionTracking/>
          </div>
        </section>
      </div>;
  }
}

export default Tracking;

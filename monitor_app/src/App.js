import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'

import Monitor from "./Pages/monitor";
import Tracking from "./Pages/tracking";

import socketStore from './datastores/socket_store'

class App extends Component {
  render() {
    let heroStyle = {
      background: "url('/images/bluemix_social_media_lead-03.png') no-repeat 0 0 / cover #fff"
    }

    return (
      <Router>
        <div>
          <nav className="navbar">
            <div className="navbar-brand">
              <Link to="/" className="navbar-item">
                <span className="icon is-large">
                  <i className="fa fa-home" />
                </span>
              </Link>

              <div className="navbar-burger">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
            <div className="navbar-menu">
              <div className="navbar-start">
                <Link className="navbar-item" to="/">Monitor</Link>
                <Link className="navbar-item" to="/tracking">Tracking</Link>
                {/* <a className="navbar-item" href="/">Monitor</a> */}
                {/* <a className="navbar-item" href="/tracking">Tracking</a> */}
              </div>

              <div className="navbar-end">
                <Link className="navbar-item" to="/login">Logout</Link>
                <Link className="navbar-item" to="/about">About</Link>
              </div>

            </div>
          </nav>

          <section className="hero is-medium is-black" style={heroStyle}>
            <div className="hero-body">
              <div className="container">
                <h1 className="title">Demo of Openwhisk on ICp</h1>
                <h2 className="subtitle">
                  Foreign Currency Exchange Rate Monitor with OpenWhisk Actions and Kubernetes' Cron Jobs
                </h2>
              </div>
            </div>
          </section>

          <Route exact path="/" component={Monitor}/>
          <Route exact path="/tracking" component={Tracking}/>

        </div>
      </Router>
    )
  }
}

export default App;

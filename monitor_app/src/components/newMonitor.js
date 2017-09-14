import React, { Component } from 'react';
import { owStore } from '../datastores/ow_store'
import { monitorStore } from "../datastores/monitor_store"
import { observer } from "mobx-react"

@observer
export default class NewMonitor extends Component {
  refreshActionList() {
    owStore.getOwActionList();
  }

  render() {
    const narrowInputCron = {
      width: "15%"
    };
    const narrowInput = {
      width: "80%"
    };
    return <div>
        <div className="field">
          <div className="control">
            <label className="label">Currency</label>
            <div className="select">
              <select
                onChange={e => monitorStore.onCurrencyChange("currency", e)}
              >
                {monitorStore
                  .getForeignCurrencyList()
                  .map(el => <option value={el.desc} selected={el.desc == monitorStore.currency}>{el.desc}</option>
                  )}
              </select>
            </div>
            
            {
              [15, 30, 60, 90].map(day => (
                <a className="button" onClick={e => monitorStore.toggleShowChart(day)}>
                  { 
                    (monitorStore.days4Chart == day) ? (
                      monitorStore.isChartLoading? (
                        <span className="icon is-small">
                          <i className="fa fa-spinner fa-pulse fa-3x fa-fw" />
                        </span>
                      ):
                      day 
                    ): day
                  }
                </a>
              ))
            }
          </div>
        </div>

        {monitorStore.showChart ? <figure className="image">
            <img src={monitorStore.exchangeRateImageUrl} alt='chart' />
          </figure> : null}

        <div className="field">
          <div className="control">
            <label className="label">Frequency</label>
            <div className="is-grouped is-horizontal has-addons">
              <input className="button is-static" style={narrowInputCron} type="text" placeholder="Min"/>
              <input className="button is-static" style={narrowInputCron} type="text" placeholder="Hour"/>
              <input className="button is-static" style={narrowInputCron} type="text" placeholder="Day"/>
              <input className="button is-static" style={narrowInputCron} type="text" placeholder="Mon"/>
              <input className="button is-static" style={narrowInputCron} type="text" placeholder="DoW"/>
            </div>

            <div className="is-grouped is-horizontal has-addons">
              <input className="input" style={narrowInputCron} type="text" placeholder="Min" value={monitorStore.cronMin} onChange={e => monitorStore.onControlChange("cronMin", e)} />
              <input className="input" style={narrowInputCron} type="text" placeholder="Hour" value={monitorStore.cronHour} onChange={e => monitorStore.onControlChange("cronHour", e)} />
              <input className="input" style={narrowInputCron} type="text" placeholder="Day" value={monitorStore.cronDay} onChange={e => monitorStore.onControlChange("cronDay", e)} />
              <input className="input" style={narrowInputCron} type="text" placeholder="Mon" value={monitorStore.cronMonth} onChange={e => monitorStore.onControlChange("cronMonth", e)} />
              <input className="input" style={narrowInputCron} type="text" placeholder="DoW" value={monitorStore.cronDayOfWeek} onChange={e => monitorStore.onControlChange("cronDayOfWeek", e)} />
            </div>
          </div>
        </div>

        <div className="field">
          <div className="control">
            <label className="label">Formula to monitor
            </label>
            <input className="input" style={narrowInput} placeholder="formula to be evaluated as true or false" width="10" onChange={e => monitorStore.onControlChange("formula", e)} value={monitorStore.formula} />
            <a className="button" onClick={e => monitorStore.toggleFormulaHelp()}>
              <span className="icon is-small">
                <i className="fa fa-question" />
              </span>
            </a>

            {
              (monitorStore.showFormulaHelp) ? (
                <article className="message" style={narrowInput}>
                  <div className="message-header">
                    <p>Formula Help</p>
                    <button className="delete" aria-label="delete" onClick = {e => monitorStore.closeFormulaHelp()} ></button>
                  </div>
                  <div className="message-body">
                    <p>Use the available indicators to construct the formula. You can combine logic of using {"&&"}, ||</p>
                    <br/>
                    <p>Example:<em>value {">"} 1.0 {"&&"} sma_4 {"<"} 4.5 {"&&"} ema_5 {"<"} 6 {"&&"} macd_12_26__signal_9 {"<"} 0.001</em></p>
                    <br/>
                    {
                      [
                        { func: "value", desc: "last available exchange rate" },
                        { func: "sma_<period>", desc: "simple moving average, example: sma_5, sma_8" },
                        { func: "ema_<period>", desc: "exponential moving average, example: ema_3, sma_12" },
                        { func: "macd_<fast period>__<slow period>__<singal period>", desc: "Moving Average Convergence Divergence, example: macd_12_26__singnal_9" },

                      ].map(elm =><p>
                        <strong>{elm.func}</strong>: {elm.desc}
                        </p>
                      )
                    }


                  </div>
                </article>
              ): null
            }

          </div>
        </div>

        <div className="field">
          <div className="control">
            <label className="label">Action</label>
            <div className="select">
              <select onChange={e => monitorStore.onControlChange("action", e)}>
                <option value="" disabled selected>
                  Select your OpenWhisker action
                </option>
                {owStore.listOfActions.map(act => (
                  <option value={act}>{act}</option>
                ))}
              </select>
            </div>
            <a className="button" onClick={e => this.refreshActionList()}>
              <span className="icon is-small">
                <i className="fa fa-refresh" />
              </span>
            </a>
          </div>
        </div>
        
        { 
          monitorStore.ignoreActionParameter() ? null : (
          <div className="field">
            <div className="control">
              <label className="label">Amount</label>
              <div className="control">
                <input className="input" style={narrowInput} type="text" placeholder="100.0" onChange={e => monitorStore.onControlChange("amount", e)} value={monitorStore.amount} />
              </div>
            </div>
          </div>
          )
        }

        <div className="field is-grouped-centered">
          <a className="button is-primary" onClick={e => monitorStore.onSubmit()}>
            Submit
          </a>
        </div>
      </div>;
  }
}


var superagent = require("superagent")
var _eval = require('eval')
var _ = require("lodash")
var helper = require("./helper")

const funcMap = [
  {
    name: "Last Value",
    regexp: /\bvalue\b/i,
    func: (ow, apihost, api_key, currency, matches) => {
      return new Promise((resolve, reject) => {
        ow.actions.invoke({
          name: "FCEX-Mon/lastValue",
          result: true,
          blocking: true,
          params: {
            currency: currency,
            apihost: apihost,
            api_key: api_key,
          }
        }).then(result => {
          resolve({value: result.value})
        }).catch(err => {
          console.log(err)
          reject(err)
        });
      }); 
    }
  },
  {
    name: "Last sma for period of n days",
    regexp: /\b(sma_\d+)\b/i,
    func: (ow, apihost, api_key, currency, matches) => {
      let varName = matches[0]
      let period = matches[0].split(/_/)[1]

      return new Promise((resolve, reject) => {
       ow.actions
         .invoke({
           name: "FCEX-Mon/SMA",
           result: true,
           blocking: true,
           params: {
             currency: currency,
             period: period,
             apihost: apihost,
             api_key: api_key,
           }
         })
         .then(result => {
           let hash={}
           hash[varName] = _.last(result.value)
           resolve(hash)
         })
         .catch(err => {
           console.log(err);
           reject(err);
         });
     }); 
    }
  },
  {
    name: "Last ema for period of n days",
    regexp: /\b(ema_\d+)\b/i,
    func: (ow, apihost, api_key, currency, matches) => {
      let varName = matches[0]
      let period = matches[0].split(/_/)[1]

      return new Promise((resolve, reject) => {
       ow.actions
         .invoke({
           name: "FCEX-Mon/EMA",
           result: true,
           blocking: true,
           params: {
             currency: currency,
             period: period,
             apihost: apihost,
             api_key: api_key,
           }
         })
         .then(result => {
           let hash={}
           hash[varName] = _.last(result.value)
           resolve(hash)
         })
         .catch(err => {
           console.log(err);
           reject(err);
         });
     }); 
    }
  },
  {
    name: "Last histogram macd(12,26) - signal(9)",
    regexp: /\b(macd_\d+_\d+__signal_\d+)\b/i,
    func: (ow, apihost, api_key, currency, matches) => {
      let varName = matches[0]
      let args = _.chain(matches[0].split(/_+/)).map(e => _.toNumber(e)).filter(e => !_.isNaN (e)).value()
      
      let fastPeriod = args[0]
      let slowPeriod = args[1]
      let signalPeriod = args[2]

      return new Promise((resolve, reject) => {
       ow.actions
         .invoke({
            name: "FCEX-Mon/MACD",
            result: true,
            blocking: true,
            params: {
              currency: currency,
              fastPeriod: fastPeriod,
              slowPeriod: slowPeriod,
              signalPeriod: signalPeriod,
              apihost: apihost,
              api_key: api_key,
            }
         })
         .then(result => {
           let hash={}
           hash[varName] = _.last(result.value).histogram
           resolve(hash)
         })
         .catch(err => {
           console.log(err);
           reject(err);
         });
     }); 
    }
    
  }
]

function send2frontend(frontendUrl, topic, data){
  return new Promise((resolve, reject) => {
    ow.actions.invoke({
      name: "FCEX-Mon/Send2Frontend",
      result: false,
      blocking: false,
      params: {
        frontendUrl: frontendUrl,
        topic: topic,
        data: data
      }
    })
  })
}

function main(params){
  console.log("monitor params:", params)
  let cCode = helper.getCurrencyCode(params.currency);
  ow = helper.ow(params.apihost, params.api_key);

  let frontendUrl = params.frontendUrl
  let topic = params.topic

  let formula = params.formula
  let promises = []
  _.each(funcMap, elm => {
    let matches
    if( (matches = elm.regexp.exec(formula))!==null){
      promises.push(elm.func(ow, params.apihost, params.api_key, params.currency, matches))
    }
  })
  
  let finalResult={}
  return new Promise((resolve, reject) => {
    Promise.all(promises)
    .then(indicatorResult => {
      console.log("result", indicatorResult);
      //each promise return an hash,

      let codes = [`let formulaTrue = false`];
      _.each(indicatorResult, hash => {
        _.each(hash, (value, key) => {
          codes.push(`let ${key} = ${value}`);
        });
      });
      codes.push(`if(${formula}){formulaTrue = true}`);
      codes.push(`formulaTrue`);
      console.log(codes);

      let formulaEvaluation = eval(codes.join("\n"))
      if (!formulaEvaluation) {
        console.log("formula evaluated as false. exit without action. Sending back to frontend server.");
        let data= {
          currency: params.currency,
          indicators:indicatorResult,
          formula: formula,
          formulaEvaluation: formulaEvaluation,
          msg: "formula evaluated as false, no action taken.",
          timestamp: Date.now(),
          cronJobId: params.cronJobId
        }
        send2frontend(frontendUrl, topic, data)
        resolve(data)
        return
      }

      let frontendSendback = {
        currency: params.currency,
        indicators:indicatorResult,
        formula: formula,
        formulaEvaluation: formulaEvaluation,
        timestamp: Date.now(),
        cronJobId: params.cronJobId,
        action: params.action,
      }
      
      //now trigger the action in defined in the monitor
      ow.actions.invoke({
        name: params.action,
        result: true,
        blocking: true,
        params: {
          currency: params.currency,
          amount: params.amount
        }
      }).then(actionResult => {
        console.log("action result:", actionResult);
        frontendSendback.msg = `formula evaluated as true, action ${params.action} taken.`
        frontendSendback.actionResult = actionResult
        send2frontend(frontendUrl, topic,frontendSendback)

        resolve(frontendSendback)
      }).catch(err => {
        //TODO: sendback to frontend?
        reject(err)
      });
    }).catch(err => {
      console.log("err", err);
      reject(err);
      return;
    });      
  });

}

exports.main = main

//testing from local
if (!process.env.__OW_API_HOST) {
  // main({
  //   currency: "Canadian Dollar",
  //   formula: "value > 1.0 && sma_4 <4.5 && ema_5 < 6 && macd_12_26__signal_9 < 0.001 ",
  //   action: "Sell", 
  //   amount: 50,
  //   action: "FCEX-Act/Sell",
  //   frontendUrl: "http://localhost",
  //   topic: "monitor-tracking-data"
  // })
  main({
    currency: "US Dollar",
    formula: "value > 1.0",
    amount: 50,
    action: "FCEX-Act/Notify",
    frontendUrl: "http://192.168.64.238:31720",
    // frontendUrl:  "http://10.10.20.168",
    topic: "monitor-tracking-data",
    cronJobId: "wsk-fexm-56c4670b-0dd0-4c7d-bb1d-f0d5be33022e",
  })
  
}

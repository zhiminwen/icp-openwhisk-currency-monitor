var superagent = require("superagent")
var moment = require('moment')
var _ = require("lodash")
var helper = require("./helper")

//get yesterday's value, however MAS don't provide holiday's data. so get at least 5 days, take the last
function main(params){
  let today = moment().format('YYYY-MM-DD')
  let Ndays = params.lastNdays || 5

  let lastNdays = moment().subtract(Ndays, "days").format("YYYY-MM-DD");
  let currencyCode = helper.getCurrencyCode(params.currency)
  // console.log(currencyCode)

  return new Promise((resolve, reject) => {
    superagent.get("https://eservices.mas.gov.sg/api/action/datastore/search.json")
    .query({
      resource_id: "95932927-c8bc-4e7a-b484-68a66a24edfe",
      limit: Ndays,
      fields: `end_of_day,${currencyCode}`,
      "between[end_of_day]": lastNdays + "," + today
    }).end((err, res) => {
      if (err) {
        console.log("error when get mas data.", err)
        reject({error: err})
      }else{
        // console.log(res)
        let payload = {
          "value": res.body.result.records
        }
        console.log(payload)
        resolve(payload)
      }
    })
  });
}

exports.main = main

// testing from local
if (!process.env.__OW_API_HOST) {
  main({
    currency: "Canadian Dollar",
    lastNdays: 5
  })
}

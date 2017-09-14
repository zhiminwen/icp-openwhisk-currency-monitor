const ema = require("technicalindicators").ema;
var _ = require("lodash");
var helper = require("./helper");

function main(params) {
  let cCode = helper.getCurrencyCode(params.currency);
  let period = params.period
  let Ndays = params.lastNdays || period+1;
  ow = helper.ow(true);

  return new Promise((resolve, reject) => {
    ow.actions
      .invoke({
        name: "FCEX-Mon/lastNValue",
        result: true,
        blocking: true,
        params: {
          currency: params.currency,
          lastNdays: Ndays
        }
      })
      .then(result => {
        let series = _.chain(result.value).map(elm => _.toNumber(elm[cCode])).value(); 
        let value = ema({ period: period, values: series })

        console.log("series:series",series, "value:", value)
        resolve({ value: value })
      })
      .catch(err => {
        console.error("failed to invoke actions", err);
        reject({ err: err });
      });
  });
}

exports.main = main;

// testing from local
if (!process.env.__OW_API_HOST) {
  main({
    currency: "Canadian Dollar",
    lastNdays: 10,
    period: 2,
  });
}


// result of lastN
// {
//     "value": [
//         {
//             "cad_sgd": "1.0864",
//             "end_of_day": "2017-08-28"
//         },
//         {
//             "cad_sgd": "1.0830",
//             "end_of_day": "2017-08-29"
//         },
//         {
//             "cad_sgd": "1.0835",
//             "end_of_day": "2017-08-30"
//         },
//         {
//             "cad_sgd": "1.0747",
//             "end_of_day": "2017-08-31"
//         }
//     ]
// }
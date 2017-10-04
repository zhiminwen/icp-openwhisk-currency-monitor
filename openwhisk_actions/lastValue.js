var _ = require("lodash");
var helper = require("./helper");

function main(params) {
  // console.log(process.env)

  let cCode = helper.getCurrencyCode(params.currency);
  let ow = helper.ow(params.apihost, params.api_key);

  return new Promise((resolve, reject) => {
    ow.actions.invoke({
        name: "FCEX-Mon/lastNValue",
        result: true,
        blocking: true,
        params: {
          currency: params.currency,
          lastNdays: 5
        }
      })
      .then(result => {
        // console.log(result)
        let value = _.toNumber(_.last(result.value)[cCode]);
        console.log("value:", value);
        resolve({value: value})
      })
      .catch(err => {
        console.error("failed to invoke actions", err);
        reject({err: err})
      });
  });
}

exports.main = main;

// testing from local
if (!process.env.__OW_API_HOST) {
  main({
    currency: "Canadian Dollar",
    apihost: "192.168.5.100:30653",
    api_key: "23bc46b1-71f6-4ed5-8c54-816aa4f8c502:123zO3xZCLrMN6v2BKK1dXYFpXlPkccOFqm12CdAsMgRU4VrNZ9lyGVCGuMDGIwP"
  });
}

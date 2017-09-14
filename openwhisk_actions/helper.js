var _ = require("lodash");
var openwhisk = require("openwhisk")

function getCurrencyCode(currencyName){
  const foreignCurrencyList = [
    {
      code: "eur_sgd",
      desc: "Euro",
    },
    {
      code: "gbp_sgd",
      desc: "Pound Sterling",
    },
    {
      code: "usd_sgd",
      desc: "US Dollar",
    },
    {
      code: "aud_sgd",
      desc: "Australian Dollar",
    },
    {
      code: "cad_sgd",
      desc: "Canadian Dollar",
    },
    {
      code: "cny_sgd_100",
      desc: "Chinese Renminbi",
    },
    {
      code: "hkd_sgd_100",
      desc: "Hong Kong Dollar",
    },
    {
      code: "inr_sgd_100",
      desc: "Indian Rupee",
    },
    {
      code: "idr_sgd_100",
      desc: "Indonesian Rupiah",
    },
    {
      code: "jpy_sgd_100",
      desc: "Japanese Yen",
    },
    {
      code: "krw_sgd_100",
      desc: "Korean Won",
    },
    {
      code: "myr_sgd_100",
      desc: "Malaysian Ringgit",
    },
    {
      code: "twd_sgd_100",
      desc: "New Taiwan Dollar",
    },
    {
      code: "nzd_sgd",
      desc: "New Zealand Dollar",
    },
    {
      code: "php_sgd_100",
      desc: "Philippine Peso",
    },
    {
      code: "qar_sgd_100",
      desc: "Qatar Riyal",
    },
    {
      code: "sar_sgd_100",
      desc: "Saudi Arabia Riyal",
    },
    {
      code: "chf_sgd",
      desc: "Swiss Franc",
    },
    {
      code: "thb_sgd_100",
      desc: "Thai Baht",
    },
    {
      code: "aed_sgd_100",
      desc: "UAE Dirham",
    },
    {
      code: "vnd_sgd_100",
      desc: "Vietnamese Dong",
    }
  ];

  let item = _.find(foreignCurrencyList, elm => elm.desc === currencyName)
  if(item){
    return item.code
  }
  return null

  // return _.find(foreignCurrencyList, elm => elm.desc === currencyName).code
}

const ow = (inCluster) => {
  //TODO: a better way to pass ow api host
  let apihost =  "https://192.168.64.238:32396"

  // even run inside the cluster is still not resolvable!
  
  // if(inCluster){
  //   apihost = "https://nginx.openwhisk"
  // }
  return openwhisk({
    apihost: apihost,
    api_key: "23bc46b1-71f6-4ed5-8c54-816aa4f8c502:123zO3xZCLrMN6v2BKK1dXYFpXlPkccOFqm12CdAsMgRU4VrNZ9lyGVCGuMDGIwP",
    ignore_certs: true
  })
}


var Helper = module.exports = {
  currencyName: "",
  setCurrencyName: function(currencyName){
    Helper.currencyName = currencyName
  },
  getCurrencyCode: getCurrencyCode,
  ow: ow,
}


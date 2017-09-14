import { observable } from "mobx";
import { owStore } from "./ow_store"
var quiche = require("quiche");

var _ = require("lodash")
var superagent = require("superagent");

const foreignCurrencyList = [
  {
    code: "eur_sgd",
    desc: "Euro",
    image: "Europe-01.png"
  },
  {
    code: "gbp_sgd",
    desc: "Pound Sterling",
    image: "England-01.png"
  },
  {
    code: "usd_sgd",
    desc: "US Dollar",
    image: "United-States.png"
  },
  {
    code: "aud_sgd",
    desc: "Australian Dollar",
    image: "Australia-01.png"
  },
  {
    code: "cad_sgd",
    desc: "Canadian Dollar",
    image: "Canada-01.png"
  },
  {
    code: "cny_sgd_100",
    desc: "Chinese Renminbi",
    image: "China-01.png"
  },
  {
    code: "hkd_sgd_100",
    desc: "Hong Kong Dollar",
    image: "Hong Kong-01.png"
  },
  {
    code: "inr_sgd_100",
    desc: "Indian Rupee",
    image: "India-01.png"
  },
  {
    code: "idr_sgd_100",
    desc: "Indonesian Rupiah",
    image: "Indonesia-01.png"
  },
  {
    code: "jpy_sgd_100",
    desc: "Japanese Yen",
    image: "Japan-01.png"
  },
  {
    code: "krw_sgd_100",
    desc: "Korean Won",
    image: "Korea.png"
  },
  {
    code: "myr_sgd_100",
    desc: "Malaysian Ringgit",
    image: "Malaysia-01.png"
  },
  {
    code: "twd_sgd_100",
    desc: "New Taiwan Dollar",
    image: ""
  },
  {
    code: "nzd_sgd",
    desc: "New Zealand Dollar",
    image: "New Zealand-01.png"
  },
  {
    code: "php_sgd_100",
    desc: "Philippine Peso",
    image: "Philippines-01.png"
  },
  {
    code: "qar_sgd_100",
    desc: "Qatar Riyal",
    image: "Qatar-01.png"
  },
  {
    code: "sar_sgd_100",
    desc: "Saudi Arabia Riyal",
    image: "Saudi Arabia-01.png"
  },
  {
    code: "chf_sgd",
    desc: "Swiss Franc",
    image: ""
  },
  {
    code: "thb_sgd_100",
    desc: "Thai Baht",
    image: "Thailand-Flag-icon.png"
  },
  {
    code: "aed_sgd_100",
    desc: "UAE Dirham",
    image: ""
  },
  {
    code: "vnd_sgd_100",
    desc: "Vietnamese Dong",
    image: "Vietnam-icon.png"
  }
];

class MonitorListStore {
  @observable listOfMonitors = [];

  //delete a cronJob, resides only in the List pane
  getImageUrl(currency){
    let item = _.find(foreignCurrencyList, elm => elm.desc === currency)
    if(item){
      let image_name = item.image
      return `/images/${encodeURIComponent(image_name)}`
    }
    return null
  }

  deleteMonitor(name) {
    superagent
      .post("/api/deleteMonitor")
      .send({
        jobName: name
      })
      .end((err, res) => {
        if (err) {
          console.log("error getting monitor job list");
        } else {
          console.log("deleted");

          this.getLists();
        }
      });
  }
  getLists() {
    superagent.post("/api/k8MonitorList").end((err, res) => {
      if (err) {
        console.log("error getting monitor job list");
      } else {
        console.log("replacing the monitors...")
        this.listOfMonitors.replace(res.body);
      }
    });
  }
}
export const monitorListStore = (window.monitorListStore = new MonitorListStore());
//put the listStore initiated first so we can use it in the monitorStore

class MonitorStore {
  @observable currency = "US Dollar";
  @observable formula = null;
  @observable action = "Notify";
  @observable amount = 50;

  @observable cronMin = "5";
  @observable cronHour = "*";
  @observable cronDay = "*";
  @observable cronMonth = "*";
  @observable cronDayOfWeek = "*";

  @observable showChart = false;
  @observable days4Chart = 15;
  @observable exchangeRateImageUrl = "";
  @observable isChartLoading = false;

  @observable showFormulaHelp = false;

  currencyExchangeRateData = [];

  constructor(params) {
    owStore.getOwActionList();
  }
  
  toggleFormulaHelp(){
    this.showFormulaHelp =! this.showFormulaHelp
  }
  closeFormulaHelp(){
    this.showFormulaHelp = false
  }

  toggleShowChart(days) {
    if (this.showChart && days != this.days4Chart) {
      //if chart is displayed and days are different. don't switch off
    } else {
      this.showChart = !this.showChart;
    }

    if (this.showChart) {
      this.days4Chart = days;
      this.isChartLoading = true;
      this.populateData().then(res => {
        this.showImage(res);
        this.isChartLoading = false;
      });
    }
  }

  showImage(data) {
    this.currencyExchangeRateData = data;

    let currencyCode = _.find(
      foreignCurrencyList,
      elm => elm.desc === this.currency
    ).code;
    var chart = quiche("line");
    chart.setTitle(`Last ${this.days4Chart} Days ${currencyCode}`);
    // console.log("data...", this.currencyExchangeRateData, currencyCode);
    let array = _.map(this.currencyExchangeRateData, elm =>
      _.toNumber(elm[currencyCode])
    );

    console.log(array);

    let x_lables = [];
    x_lables.push(_.first(this.currencyExchangeRateData).end_of_day);
    x_lables.push(
      _.nth(
        this.currencyExchangeRateData,
        _.size(this.currencyExchangeRateData) / 2
      ).end_of_day
    );
    x_lables.push(_.last(this.currencyExchangeRateData).end_of_day);

    chart.addData(array, _.upperCase(currencyCode), "008000");
    chart.addAxisLabels("x", x_lables);
    chart.setAutoScaling();

    let minRate = _.min(array);
    let maxRate = _.max(array);
    let gap = 0.1 * (maxRate - minRate);

    let step = (maxRate - minRate + 2 * gap) / 10;
    chart.setAxisRange("y", minRate - gap, maxRate + gap, step);
    chart.setTransparentBackground();

    this.exchangeRateImageUrl = chart.getUrl(true);
  }

  populateData() {
    return new Promise((resolve, reject) => {
      let currencyCode = _.find(
        foreignCurrencyList,
        elm => elm.desc === this.currency
      ).code;

      superagent
        .post("/api/ow/getData")
        .send({
          lastNdays: this.days4Chart,
          currency: this.currency
        })
        .end((err, res) => {
          if (err) {
            console.log(err);
          } else {
            console.log(res);
            resolve(res.body.value.value);
          }
        });
    });
  }

  getForeignCurrencyList() {
    return foreignCurrencyList;
  }

  onControlChange(name, event) {
    // console.log(name,event.target);
    this[name] = event.target.value;
  }

  onCurrencyChange(name, event){
    this[name] = event.target.value;
    //reset the chart
    this.showChart = false;
    this.exchangeRateImageUrl = "";
    this.days4Chart = 15;
    this.isChartLoading = false;
  }

  onSubmit() {
    let fields = [
      "currency",
      "formula",
      "action",
      "amount",
      "cronMin",
      "cronHour",
      "cronDay",
      "cronMonth",
      "cronDayOfWeek"
    ];
    let hash = {};
    _.each(fields, e => {
      hash[e] = this[e];
    });
    console.log("submit a new monitor as a k8s cronjob");
    superagent
      .post("/api/newMonitor")
      .send(hash)
      .end((err, res) => {
        if (err) {
          console.log(err);
        } else {
          console.log(res);

          //refresh
          monitorListStore.getLists();
        }
      });
  }

  ignoreActionParameter(){
    return /Notify/i.test(this.action) 
  }
}

export const monitorStore = window.monitorStore = new MonitorStore();


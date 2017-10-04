const express = require('express');
const path = require('path');
const superagent = require('superagent');
const bodyParser = require("body-parser");
const openwhisk = require("openwhisk");
const _ =require('lodash');
const uuid = require('node-uuid');
const k8s = require("k8s")


require('dotenv').config();

const app = express();
app.use(bodyParser.json());

app.use(express.static(path.resolve(__dirname, "..", "build")));
// Always return the main index.html, so react-router render the route in the client
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "..", "build", "index.html"));
});

var ow = openwhisk({ 
  apihost: process.env.WHISKER_API_HOST, 
  api_key: process.env.WHISKER_KEY,
  ignore_certs: true,
  // namespace: process.env.WHISKER_NAMESPACE,
});

app.post("/api/ow/actions", function(req, res) {
  const act_package_name = process.env.FCEX_ACTION_PACKAGE

  ow.actions.list().then( result =>{
    console.log(result)
    let actRegex = new RegExp(`/${act_package_name}$`)
    list = _.chain(result)
      .filter(e => actRegex.test(e.namespace) )
      .map(e => e.name)
    res.json(list)
  }).catch(err => {
    console.log("err:", err)
    res.status(500)
    res.send("error getting ow action list")
  })
});

app.post("/api/ow/getData", (req,res) =>{
  let data = req.body
  ow.actions.invoke({
    name: "FCEX-Mon/lastNValue",
    result: true,
    blocking: true,
    params: {
      currency: data.currency,
      lastNdays: data.lastNdays,
      apihost: process.env.WHISKER_API_HOST, 
      api_key: process.env.WHISKER_KEY,
    }
  })
  .then(result => {
    console.log("value:", result);
    res.json({ value: result });
  })
  .catch(err => {
    console.error("failed to invoke actions", err);
    res.status(500);
    res.send("error getting currency data");
  });
 
})

const kubeapi = k8s.api({
  endpoint: process.env.K8S_API_SERVER_URL,
  version: "/apis/batch/v2alpha1",
  strictSSL: false,
  auth: {
    token: process.env.K8S_TOKEN
  }
});

app.post("/api/k8MonitorList", (req, res) =>{
  console.log(req.body)
  data = req.body

  kubeapi.get('namespaces/default/cronjobs').then(data => {
    console.log(JSON.stringify(data))
    let cronJobs = _.chain(data.items).map(elm => ({
      name: elm.metadata.name,
      annotations: elm.metadata.annotations,
      env: elm.spec.jobTemplate.spec.template.spec.containers[0].env,
      command: elm.spec.jobTemplate.spec.template.spec.containers[0].command
    }))
    
    res.send(cronJobs)
  }).catch( err =>{
    console.log(err)

    res.status(500);
    res.send("error getting cron jobs from K8s");
  })
})

app.post("/api/newMonitor", (req, res) =>{
  let data = req.body
  console.log("job submit:", data)

  let fields = ["currency", "formula", "action", "amount"]
  let annotations = {}
  _.each(fields, f => {
    annotations[f] = `${data[f]}` //convert number to string, eg amount
  })
   
  let cronFields = ["cronMin", "cronHour", "cronDay", "cronMonth", "cronDayOfWeek"]
  let cronString = _.chain(cronFields).map(f => data[f]).join(" ")
  annotations["schedule"] = cronString

  let k8_object_name = `wsk-fexm-${uuid.v4()}`

  let parameters = _.chain([
    {
      name: "currency",
      value: data.currency,
    },
    {
      name: "formula",
      value: data.formula,
    },
    {
      name: "action",
      value: process.env.FCEX_ACTION_PACKAGE + "/" + data.action,
    },
    {
      name: "amount",
      value: `${data.amount}`, //convert to string, if its pure number
    },
    {
      name: "frontendUrl",
      value: process.env.FRONTEND_SOCKET_URL
    },
    {
      name: "topic",
      value: process.env.FRONTEND_SOCKET_TOPIC
    },
    {
      name: "cronJobId",
      value: k8_object_name
    },
    {
      name: "apihost",
      value: process.env.WHISKER_API_HOST,
    },
    {
      name: "api_key",
      value: process.env.WHISKER_KEY,
    }
  ]).map(elm => `-p ${elm.name} "${elm.value}"`).join(" ")
  
  let container = {
    name: k8_object_name,
    image: process.env.K8S_JOB_IMAGE,
    // env: envs, //move env to command line
    command: ["/bin/sh", "-c", `wsk property set --auth "${process.env.WHISKER_KEY}" --apihost "${process.env.WHISKER_API_HOST}"; wsk -i action invoke "${process.env.FCEX_MONITOR_ACTION}" ${parameters} -b --result; exit 0`
   ]
  }
    
  let cronJob = {
    kind: "CronJob",
    apiVersion: "batch/v2alpha1",
    metadata:{
      name: k8_object_name,
      annotations: annotations
    },
    spec: {
      schedule: cronString,
      jobTemplate: {
        spec: {
          template: {
            spec:{
              containers: [container],
              restartPolicy: "Never"
            }            
          }
        }
      }
    }
  }

  console.log("cronjob to be posted:", JSON.stringify(cronJob))

  kubeapi
    .post("namespaces/default/cronjobs", cronJob)
    .then(result => {
      console.log("success:", result);
      res.send("success");
    })
    .catch(err => {
      console.log("fail:", err);
      res.status(500);
      res.send("error posting k8 cron job");
    });
})

app.post("/api/deleteMonitor", (req, res)=>{
  let data = req.body;
  console.log("job submit for delete:", data);
  let jobName = data.jobName
  kubeapi.delete(`namespaces/default/cronjobs/${jobName}`).then(data => {
    res.send("deleted")
  }).catch(err=>{
    console.log(err)
    res.status(500)
    res.send("error when delete the monitor")
  })


})

module.exports = app;
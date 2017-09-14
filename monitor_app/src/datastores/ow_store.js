import {observable} from "mobx"
var superagent = require('superagent')

class OWStore {
  @observable listOfActions=[]

  getOwActionList(){
    superagent.post("/api/ow/actions").end((err,res)=>{
      if(err){
        console.log("err getting list", err)
        return
      }
      console.log(res)
      this.listOfActions = res.body
    })    
  }

}

export const owStore = window.owStore =  new OWStore()
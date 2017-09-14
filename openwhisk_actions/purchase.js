function main(params) {
  console.log(`Purchased ${params.currency} ${params.amount}.`)
  
  return({msg: `Purchased ${params.currency} ${params.amount}.`})
}
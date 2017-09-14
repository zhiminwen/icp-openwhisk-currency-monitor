function main(params) {
  console.log(`Sold ${params.currency} ${params.amount}`)
  return({ msg: `Sold ${params.currency} ${params.amount}` })
}
